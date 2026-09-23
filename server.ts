import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

// ==============================================================================
// SZND PAYMENT GATEWAY CONFIGURATION & SIGNING UTILITIES
// ==============================================================================

interface SzndConfig {
  env: 'test' | 'production';
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  isTestMode: boolean;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  hasBaseUrl: boolean;
}

function getSzndConfig(): SzndConfig {
  const rawEnv = (process.env.SZND_ENV || 'production').trim().toLowerCase();
  const isTestMode = rawEnv === 'test' || rawEnv === 'sandbox';
  const env: 'test' | 'production' = isTestMode ? 'test' : 'production';

  // Environment-driven credential resolution:
  // In test mode: prefer SZND_TEST_* if explicitly set, else fallback to SZND_*
  // In production mode: prefer SZND_LIVE_* if explicitly set, else fallback to SZND_*
  const apiKey = (
    isTestMode
      ? (process.env.SZND_TEST_API_KEY || process.env.SZND_API_KEY)
      : (process.env.SZND_LIVE_API_KEY || process.env.SZND_API_KEY)
  )?.trim() || '';

  const apiSecret = (
    isTestMode
      ? (process.env.SZND_TEST_API_SECRET || process.env.SZND_API_SECRET)
      : (process.env.SZND_LIVE_API_SECRET || process.env.SZND_API_SECRET)
  )?.trim() || '';

  const rawBaseUrl = (
    isTestMode
      ? (process.env.SZND_TEST_API_BASE_URL || process.env.SZND_API_BASE_URL)
      : (process.env.SZND_LIVE_API_BASE_URL || process.env.SZND_API_BASE_URL)
  )?.trim() || '';

  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  return {
    env,
    apiKey,
    apiSecret,
    baseUrl,
    isTestMode,
    hasApiKey: Boolean(apiKey),
    hasApiSecret: Boolean(apiSecret),
    hasBaseUrl: Boolean(baseUrl),
  };
}

function isSzndConfigured(): boolean {
  const { hasApiKey, hasApiSecret, hasBaseUrl } = getSzndConfig();
  return hasApiKey && hasApiSecret && hasBaseUrl;
}

// Generate HMAC-SHA256 signature for outgoing SZND API requests
function generateSzndRequestSignature(apiSecret: string, timestamp: string, bodyString: string): string {
  const payload = `${timestamp}.${bodyString}`;
  return crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');
}

// Verify incoming SZND Webhook HMAC-SHA256 signature
function verifySzndWebhookSignature(req: express.Request, apiSecret: string): boolean {
  if (!apiSecret) return false;

  const signatureHeader = (
    req.headers['x-sznd-signature'] ||
    req.headers['x-signature'] ||
    req.headers['sznd-signature'] ||
    req.headers['x-sznd-signature-256'] ||
    ''
  ) as string;

  if (!signatureHeader) return false;

  const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
  const cleanSignature = signatureHeader.replace(/^sha256=/, '').trim();

  // 1. Direct raw body signature check
  const expectedDirect = crypto.createHmac('sha256', apiSecret).update(rawBody).digest('hex');
  try {
    const sigBuf = Buffer.from(cleanSignature, 'hex');
    const expBuf = Buffer.from(expectedDirect, 'hex');
    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return true;
    }
  } catch {
    // Length mismatch or format exception, continue to check timestamped format
  }

  // 2. Timestamp-prefixed signature check if timestamp header is passed
  const timestampHeader = (
    req.headers['x-sznd-timestamp'] ||
    req.headers['x-timestamp'] ||
    req.headers['sznd-timestamp'] ||
    ''
  ) as string;

  if (timestampHeader) {
    const expectedTimestamped = crypto
      .createHmac('sha256', apiSecret)
      .update(`${timestampHeader}.${rawBody}`)
      .digest('hex');
    try {
      const sigBuf = Buffer.from(cleanSignature, 'hex');
      const expBuf = Buffer.from(expectedTimestamped, 'hex');
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        return true;
      }
    } catch {
      // Continue
    }
  }

  // 3. Key-value formatted signature (e.g. t=17000000,v1=abc...)
  if (signatureHeader.includes('=')) {
    const parts = signatureHeader.split(',').reduce((acc: Record<string, string>, item) => {
      const [k, v] = item.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});

    const t = parts.t || timestampHeader;
    const v1 = parts.v1 || parts.v0 || parts.s;
    if (t && v1) {
      const expectedParts = crypto.createHmac('sha256', apiSecret).update(`${t}.${rawBody}`).digest('hex');
      try {
        const sigBuf = Buffer.from(v1, 'hex');
        const expBuf = Buffer.from(expectedParts, 'hex');
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          return true;
        }
      } catch {
        // Continue
      }
    }
  }

  return false;
}

// Client for making secure server-to-server calls to SZND API
async function initializeSzndCheckout(params: {
  amountNgn: number;
  reference: string;
  email: string;
  callbackUrl?: string;
  bookingId: string;
  metadata?: Record<string, any>;
}) {
  const config = getSzndConfig();
  if (!config.baseUrl || !config.apiKey || !config.apiSecret) {
    throw new Error('SZND credentials not configured');
  }

  const endpoint = config.baseUrl.endsWith('/checkout/initialize') ? '' : '/checkout/initialize';
  const url = `${config.baseUrl}${endpoint}`;

  const payload = {
    amount: Math.round(params.amountNgn * 100), // In subunits (kobo)
    amount_ngn: params.amountNgn,
    currency: 'NGN',
    reference: params.reference,
    customer_email: params.email,
    callback_url: params.callbackUrl,
    metadata: {
      booking_id: params.bookingId,
      platform: 'OFIS',
      environment: config.env,
      ...params.metadata,
    },
  };

  const timestamp = Date.now().toString();
  const bodyString = JSON.stringify(payload);
  const signature = generateSzndRequestSignature(config.apiSecret, timestamp, bodyString);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'X-SZND-KEY': config.apiKey,
      'X-SZND-TIMESTAMP': timestamp,
      'X-SZND-SIGNATURE': signature,
      'User-Agent': `OFIS-Backend/2.0 (${config.env})`,
    },
    body: bodyString,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `SZND transaction initialization failed with HTTP ${response.status}`);
  }

  const checkoutUrl =
    data.checkout_url ||
    data.authorization_url ||
    data.url ||
    data.data?.checkout_url ||
    data.data?.authorization_url ||
    data.data?.url ||
    data.data?.link;

  return {
    reference: data.reference || data.data?.reference || params.reference,
    checkoutUrl,
    data,
  };
}

// Server-authoritative transaction verification against SZND API
async function verifySzndTransaction(reference: string) {
  const config = getSzndConfig();
  if (!config.baseUrl || !config.apiKey || !config.apiSecret) {
    throw new Error('SZND credentials not configured');
  }

  const encodedRef = encodeURIComponent(reference);
  const endpoint = config.baseUrl.endsWith('/transaction/verify')
    ? `/${encodedRef}`
    : `/transaction/verify/${encodedRef}`;
  const url = `${config.baseUrl}${endpoint}`;
  const timestamp = Date.now().toString();
  const signature = generateSzndRequestSignature(config.apiSecret, timestamp, '');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'X-SZND-KEY': config.apiKey,
      'X-SZND-TIMESTAMP': timestamp,
      'X-SZND-SIGNATURE': signature,
      'User-Agent': `OFIS-Backend/2.0 (${config.env})`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `SZND transaction verification failed with HTTP ${response.status}`);
  }

  return data;
}

// Backend-only SZND diagnostic report runner (NEVER exposes secrets)
interface SzndDiagnosticReport {
  environment: 'TEST' | 'PRODUCTION';
  apiBaseUrlConfigured: 'YES' | 'NO';
  apiKeyConfigured: 'YES' | 'NO';
  apiSecretConfigured: 'YES' | 'NO';
  authentication: 'PASS' | 'FAIL' | 'NOT TESTED';
  connectivity: 'PASS' | 'FAIL' | 'NOT TESTED';
  executionStatus: string;
  reason?: string;
}

async function runSzndDiagnostic(): Promise<SzndDiagnosticReport> {
  const config = getSzndConfig();
  const envDisplay = config.env === 'test' ? 'TEST' : 'PRODUCTION';

  const report: SzndDiagnosticReport = {
    environment: envDisplay,
    apiBaseUrlConfigured: config.hasBaseUrl ? 'YES' : 'NO',
    apiKeyConfigured: config.hasApiKey ? 'YES' : 'NO',
    apiSecretConfigured: config.hasApiSecret ? 'YES' : 'NO',
    authentication: 'NOT TESTED',
    connectivity: 'NOT TESTED',
    executionStatus: 'NOT_POSSIBLE',
  };

  if (!config.hasBaseUrl || !config.hasApiKey || !config.hasApiSecret) {
    report.executionStatus = 'NOT_POSSIBLE';
    report.reason =
      config.env === 'test'
        ? 'SZND TEST CREDENTIALS/ACCESS NOT AVAILABLE'
        : 'SZND PRODUCTION CREDENTIALS NOT CONFIGURED IN ENVIRONMENT';
    return report;
  }

  // Credentials and base URL exist: perform controlled connectivity and auth test
  try {
    const timestamp = Date.now().toString();
    const signature = generateSzndRequestSignature(config.apiSecret, timestamp, '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const testUrl = `${config.baseUrl}/health`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-SZND-KEY': config.apiKey,
        'X-SZND-TIMESTAMP': timestamp,
        'X-SZND-SIGNATURE': signature,
        'User-Agent': `OFIS-Diagnostic/2.0 (${config.env})`,
      },
      signal: controller.signal,
    }).catch(async () => {
      // Fallback ping to base URL root
      return await fetch(config.baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'X-SZND-KEY': config.apiKey,
          'X-SZND-TIMESTAMP': timestamp,
          'X-SZND-SIGNATURE': signature,
          'User-Agent': `OFIS-Diagnostic/2.0 (${config.env})`,
        },
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);

    if (response) {
      report.connectivity = 'PASS';
      if (response.status === 401 || response.status === 403) {
        report.authentication = 'FAIL';
        report.reason = `SZND returned HTTP ${response.status} unauthorized`;
        report.executionStatus = 'AUTHENTICATION_FAILED';
      } else {
        report.authentication = 'PASS';
        report.executionStatus = 'SUCCESS';
      }
    } else {
      report.connectivity = 'FAIL';
      report.reason = 'Unable to reach configured SZND API base URL';
      report.executionStatus = 'CONNECTIVITY_FAILED';
    }
  } catch (err: any) {
    report.connectivity = 'FAIL';
    report.reason = err.message || 'Network connectivity error';
    report.executionStatus = 'CONNECTIVITY_ERROR';
  }

  return report;
}

// ==============================================================================
// SERVER INITIALIZATION
// ==============================================================================

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Capture raw body for secure HMAC webhook signature validation
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
      },
    })
  );

  // Initialize Supabase Server Admin Client strictly using SUPABASE_SERVICE_ROLE_KEY
  const rawSupabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  let supabaseUrl = rawSupabaseUrl;
  try {
    if (rawSupabaseUrl.startsWith('http')) {
      supabaseUrl = new URL(rawSupabaseUrl).origin;
    }
  } catch {
    supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
  const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  // Privileged server client ONLY initialized if SUPABASE_SERVICE_ROLE_KEY is provided
  const supabaseAdmin =
    supabaseUrl && supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;

  // Initialize Gemini AI client safely on server
  let ai: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI | null {
    if (ai) return ai;
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.warn('Gemini AI initialization error:', err);
      }
    }
    return ai;
  }

  // Check SZND environment readiness
  const szndConfig = getSzndConfig();
  if (szndConfig.env === 'test' && !szndConfig.baseUrl) {
    console.warn('[SZND] SZND TEST ENVIRONMENT NOT AVAILABLE/VERIFIED (SZND_API_BASE_URL missing for test environment)');
  }

  // ============================================================================
  // SYSTEM HEALTH & DIAGNOSTICS
  // ============================================================================

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    const config = getSzndConfig();
    const ready = isSzndConfigured();
    const isTestMode = config.isTestMode;

    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      supabaseConnected: !!supabaseAdmin,
      supabaseUrl: supabaseUrl ? supabaseUrl.replace(/(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
      paymentProvider: 'SZND',
      szndEnvironment: config.env.toUpperCase(),
      apiBaseUrlConfigured: config.hasBaseUrl ? 'YES' : 'NO',
      apiKeyConfigured: config.hasApiKey ? 'YES' : 'NO',
      apiSecretConfigured: config.hasApiSecret ? 'YES' : 'NO',
      szndConfigured: ready,
      szndEnv: config.env,
      szndTestAvailable: isTestMode && ready,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // SZND Payment Diagnostic Endpoint (Backend-only, never reveals credentials)
  app.get(['/api/payments/diagnostic', '/api/payments/diagnostics'], async (_req, res) => {
    try {
      const report = await runSzndDiagnostic();
      return res.json({
        provider: 'SZND',
        szndEnvironment: report.environment,
        apiBaseUrlConfigured: report.apiBaseUrlConfigured,
        apiKeyConfigured: report.apiKeyConfigured,
        apiSecretConfigured: report.apiSecretConfigured,
        szndAuthentication: report.authentication,
        szndConnectivity: report.connectivity,
        executionStatus: report.executionStatus,
        reason: report.reason || null,
        textReport: [
          `SZND environment: ${report.environment}`,
          `API base URL configured: ${report.apiBaseUrlConfigured}`,
          `API key configured: ${report.apiKeyConfigured}`,
          `API secret configured: ${report.apiSecretConfigured}`,
          `SZND authentication: ${report.authentication}`,
          `SZND connectivity: ${report.connectivity}`,
        ].join('\n'),
      });
    } catch (err: any) {
      return res.status(500).json({
        provider: 'SZND',
        szndEnvironment: 'UNKNOWN',
        apiBaseUrlConfigured: 'NO',
        apiKeyConfigured: 'NO',
        apiSecretConfigured: 'NO',
        szndAuthentication: 'FAIL',
        szndConnectivity: 'FAIL',
        error: err.message,
      });
    }
  });

  // Client IP & Geolocation Detection Endpoint
  app.get('/api/ip-info', async (req, res) => {
    try {
      const forwarded = req.headers['x-forwarded-for'];
      const rawIp =
        typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : req.socket.remoteAddress || '';

      const cleanIp = rawIp.replace(/^::ffff:/, '');

      // Check edge country code if present from edge proxy
      const headerCountry = (
        (req.headers['cf-ipcountry'] as string) ||
        (req.headers['x-appengine-country'] as string) ||
        (req.headers['x-country-code'] as string) ||
        ''
      )
        .toUpperCase()
        .trim();

      if (headerCountry && headerCountry !== 'XX' && headerCountry !== 'T1') {
        return res.json({
          success: true,
          detectedCountryCode: headerCountry,
          ipAddress: cleanIp || 'Edge Client IP',
        });
      }

      // If valid public IP, query lightweight geo provider with quick timeout
      if (
        cleanIp &&
        cleanIp !== '127.0.0.1' &&
        cleanIp !== '::1' &&
        !cleanIp.startsWith('192.168.') &&
        !cleanIp.startsWith('10.') &&
        !cleanIp.startsWith('172.')
      ) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1200);
          const geoRes = await fetch(`https://ipwho.is/${cleanIp}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData && geoData.success !== false && geoData.country_code) {
              return res.json({
                success: true,
                detectedCountryCode: geoData.country_code,
                detectedCountry: geoData.country,
                ipAddress: cleanIp,
              });
            }
          }
        } catch {
          // Timeout or lookup failure, proceed to fallback
        }
      }

      return res.json({
        success: true,
        detectedCountryCode: 'NG',
        ipAddress: cleanIp || 'Client IP',
      });
    } catch (err: any) {
      return res.json({
        success: false,
        detectedCountryCode: 'NG',
        error: err.message,
      });
    }
  });

  // Supabase Comprehensive Diagnostics Endpoint
  app.get('/api/supabase/diagnostics', async (_req, res) => {
    const startTime = Date.now();
    const configCheck = {
      isConfigured: !!supabaseUrl && !!supabaseServiceKey,
      rawUrl: rawSupabaseUrl ? rawSupabaseUrl.replace(/(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
      cleanedBaseUrl: supabaseUrl ? supabaseUrl.replace(/(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
      hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    if (!supabaseAdmin) {
      return res.json({
        success: false,
        status: 'unconfigured',
        latencyMs: 0,
        config: configCheck,
        message: 'Supabase credentials are not configured in environment variables.',
        tables: {},
      });
    }

    const tablesToCheck = [
      'spaces',
      'profiles',
      'bookings',
      'desks',
      'reviews',
      'space_access_credentials',
      'payments',
      'notifications',
    ];

    const tableResults: Record<string, { exists: boolean; rowCount?: number; error?: string }> = {};
    let allTablesReady = true;

    await Promise.all(
      tablesToCheck.map(async (table) => {
        try {
          const { count, error } = await supabaseAdmin
            .from(table)
            .select('*', { count: 'exact', head: true });

          if (error) {
            allTablesReady = false;
            tableResults[table] = {
              exists: false,
              error: error.message,
            };
          } else {
            tableResults[table] = {
              exists: true,
              rowCount: count ?? 0,
            };
          }
        } catch (err: any) {
          allTablesReady = false;
          tableResults[table] = {
            exists: false,
            error: err.message,
          };
        }
      })
    );

    const latencyMs = Date.now() - startTime;

    return res.json({
      success: true,
      status: allTablesReady ? 'ready' : 'tables_missing_schema_needed',
      latencyMs,
      config: configCheck,
      tablesReady: allTablesReady,
      tables: tableResults,
      schemaFile: '/supabase/schema.sql',
      message: allTablesReady
        ? 'Supabase database is fully connected and schema is synchronized!'
        : 'Supabase connection established successfully, but schema tables have not been created yet. Run /supabase/schema.sql in your Supabase SQL Editor.',
    });
  });

  // ============================================================================
  // BOOKINGS: SERVER-AUTHORITATIVE VALIDATION
  // ============================================================================

  app.post('/api/bookings/validate', async (req, res) => {
    try {
      const {
        spaceId,
        date,
        startTime,
        durationHours = 2,
        guestCount = 1,
        selectedSeatId,
      } = req.body;

      if (!spaceId || !date || !startTime) {
        return res.status(400).json({
          valid: false,
          error: 'spaceId, date, and startTime are required',
        });
      }

      const numDuration = Number(durationHours);
      if (isNaN(numDuration) || numDuration <= 0 || numDuration > 720) {
        return res.status(400).json({
          valid: false,
          error: 'durationHours must be a positive number up to 720 hours',
        });
      }

      if (!supabaseAdmin) {
        return res.json({
          valid: true,
          sandbox: true,
          message: 'Booking validation completed in demo sandbox mode',
        });
      }

      // 1. Fetch space from database
      const { data: space, error: sErr } = await supabaseAdmin
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .single();

      if (sErr || !space) {
        return res.status(404).json({ valid: false, error: 'Space record not found' });
      }

      if (space.is_active === false) {
        return res.status(400).json({ valid: false, error: 'This space is currently inactive and not accepting reservations' });
      }

      // 2. Validate capacity / guest limits
      const maxCapacity = space.capacity || 20;
      const numGuests = Math.max(1, Number(guestCount) || 1);
      if (numGuests > maxCapacity) {
        return res.status(400).json({
          valid: false,
          error: `Requested ${numGuests} guests, but space maximum capacity is ${maxCapacity}`,
        });
      }

      // 3. Check for conflicting bookings in this slot
      const startParts = startTime.split(':');
      const startH = parseInt(startParts[0], 10) || 9;
      const startM = parseInt(startParts[1], 10) || 0;
      const totalStartMin = startH * 60 + startM;
      const totalEndMin = totalStartMin + Math.round(numDuration * 60);

      const endH = Math.floor(totalEndMin / 60) % 24;
      const endM = totalEndMin % 60;
      const calculatedEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      let conflictQuery = supabaseAdmin
        .from('bookings')
        .select('id, start_time, duration_hours, selected_seat_id, status, booking_status')
        .eq('space_id', spaceId)
        .eq('date', date)
        .not('status', 'in', '("cancelled","expired")')
        .not('booking_status', 'in', '("cancelled","expired")');

      if (selectedSeatId) {
        conflictQuery = conflictQuery.eq('selected_seat_id', selectedSeatId);
      }

      const { data: existingBookings } = await conflictQuery;

      let isOccupied = false;
      if (existingBookings && existingBookings.length > 0) {
        for (const b of existingBookings) {
          const bParts = (b.start_time || '09:00').split(':');
          const bStartMin = (parseInt(bParts[0], 10) || 9) * 60 + (parseInt(bParts[1], 10) || 0);
          const bEndMin = bStartMin + (b.duration_hours || 2) * 60;

          if (totalStartMin < bEndMin && totalEndMin > bStartMin) {
            isOccupied = true;
            break;
          }
        }
      }

      if (isOccupied) {
        return res.status(409).json({
          valid: false,
          available: false,
          error: 'The requested time slot conflicts with an existing confirmed booking for this space/seat.',
        });
      }

      // 4. Calculate server-authoritative pricing
      const hourlyRate = Number(space.price_per_hour) || 3500;
      const dailyRate = Number(space.price_per_day) || hourlyRate * 8;

      let subtotal = 0;
      let pricingPeriod = 'hour';

      if (numDuration >= 8) {
        const days = Math.ceil(numDuration / 24) || 1;
        subtotal = dailyRate * days;
        pricingPeriod = 'day';
      } else {
        subtotal = hourlyRate * numDuration;
      }

      let discount = 0;
      if (numDuration >= 8) {
        discount = Math.round(subtotal * 0.15); // 15% full-day pass discount
      } else if (numDuration >= 4) {
        discount = Math.round(subtotal * 0.10); // 10% half-day pass discount
      }

      const authoritativeTotal = Math.max(0, subtotal - discount);

      return res.json({
        valid: true,
        available: true,
        space: {
          id: space.id,
          title: space.title,
          city: space.city,
          capacity: maxCapacity,
        },
        schedule: {
          date,
          startTime,
          endTime: calculatedEndTime,
          durationHours: numDuration,
        },
        pricing: {
          period: pricingPeriod,
          rate: pricingPeriod === 'day' ? dailyRate : hourlyRate,
          subtotal,
          discount,
          totalAmount: authoritativeTotal,
          currency: 'NGN',
        },
      });
    } catch (err: any) {
      console.error('Error in /api/bookings/validate:', err.message);
      res.status(500).json({ valid: false, error: 'Validation failed due to internal error' });
    }
  });

  // ============================================================================
  // SZND PAYMENT INITIALIZATION, VERIFICATION & WEBHOOKS
  // ============================================================================

  // 1. Initialize Payment with SZND Gateway
  app.post('/api/payments/initialize', async (req, res) => {
    try {
      const {
        bookingId,
        email,
        callbackUrl,
        spaceId,
        date,
        startTime,
        durationHours = 2,
        guestCount = 1,
        selectedSeatId,
        selectedSeatLabel,
        userName,
        userPhone,
      } = req.body;

      if (!bookingId && !spaceId) {
        return res.status(400).json({ error: 'Either bookingId or spaceId is required to initialize payment' });
      }

      if (!supabaseAdmin) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            error: 'Database service is not configured (SUPABASE_SERVICE_ROLE_KEY missing). Cannot process payment in production.',
          });
        }
        const fallbackRef = `sznd_test_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
        return res.json({
          success: true,
          reference: fallbackRef,
          checkoutUrl: null,
          sandbox: true,
          message: 'Payment initialized in demo sandbox mode (Supabase service unconfigured)',
        });
      }

      // Optional user auth validation
      const authHeader = req.headers.authorization;
      let authenticatedUser: any = null;
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        authenticatedUser = user;
      }

      let targetBooking: any = null;

      if (bookingId) {
        const { data: booking, error: bErr } = await supabaseAdmin
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (bErr || !booking) {
          return res.status(404).json({ error: 'Authoritative booking record not found' });
        }
        targetBooking = booking;
      } else if (spaceId) {
        // Validate space existence and calculate authoritative amount
        const { data: space, error: sErr } = await supabaseAdmin
          .from('spaces')
          .select('*')
          .eq('id', spaceId)
          .single();

        if (sErr || !space) {
          return res.status(404).json({ error: 'Space record not found' });
        }

        if (space.is_active === false) {
          return res.status(400).json({ error: 'Space is currently inactive' });
        }

        const hourlyRate = Number(space.price_per_hour) || 3500;
        const hours = Math.max(1, Number(durationHours) || 2);
        const computedTotal = hourlyRate * hours;

        const newId = `OFIS-BK-${Math.floor(1000 + Math.random() * 9000)}`;
        const qrPass = `OFIS-PASS-${newId}`;
        const digiPass = `OFIS-${newId}-PASS`;

        const { data: createdBooking, error: cErr } = await supabaseAdmin
          .from('bookings')
          .insert({
            id: newId,
            space_id: spaceId,
            space_title: space.title,
            space_image: space.featured_image || (space.images && space.images[0]),
            space_address: space.address,
            space_city: space.city,
            user_id: authenticatedUser?.id || null,
            user_name: userName || authenticatedUser?.user_metadata?.name || 'Guest',
            user_email: email || authenticatedUser?.email || 'guest@ofis.ng',
            user_phone: userPhone || null,
            date: date || new Date().toISOString().split('T')[0],
            start_time: startTime || '10:00',
            duration_hours: hours,
            guest_count: guestCount,
            selected_seat_id: selectedSeatId || null,
            selected_seat_label: selectedSeatLabel || null,
            total_amount: computedTotal,
            currency: 'NGN',
            status: 'reserved',
            booking_status: 'reserved',
            payment_status: 'pending',
            payment_method: 'sznd',
            payment_reference: `sznd_pending_${Date.now()}`,
            qr_code_value: qrPass,
            digital_pass_code: digiPass,
          })
          .select()
          .single();

        if (cErr || !createdBooking) {
          return res.status(500).json({ error: 'Failed to create authoritative booking record' });
        }

        targetBooking = createdBooking;
      }

      // Ownership enforcement if user is authenticated
      if (authenticatedUser && targetBooking.user_id) {
        const isOwner = targetBooking.user_id === authenticatedUser.id || targetBooking.client_id === authenticatedUser.id;
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', authenticatedUser.id).single();
        const isAdmin = profile?.role === 'admin';
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ error: 'Unauthorized: You do not own this booking' });
        }
      }

      // Check status: prevent re-initialization on cancelled/expired bookings
      if (targetBooking.booking_status === 'cancelled' || targetBooking.status === 'cancelled') {
        return res.status(400).json({ error: 'Cannot initialize payment for a cancelled booking' });
      }

      // Idempotency: If already confirmed with successful payment, return early
      if (
        targetBooking.payment_status === 'paid' &&
        (targetBooking.booking_status === 'confirmed' || targetBooking.status === 'confirmed')
      ) {
        return res.json({
          success: true,
          alreadyPaid: true,
          booking: targetBooking,
          message: 'This booking has already been confirmed and paid',
        });
      }

      const totalAmountNGN = Number(targetBooking.total_amount);
      const reference = `sznd_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

      // Insert or update pending payment record
      await supabaseAdmin
        .from('payments')
        .insert({
          booking_id: targetBooking.id,
          user_id: targetBooking.user_id,
          amount: totalAmountNGN,
          currency: 'NGN',
          provider: 'sznd',
          reference,
          status: 'pending',
          metadata: {
            initialized_at: new Date().toISOString(),
          },
        });

      // Update booking with pending SZND reference
      await supabaseAdmin
        .from('bookings')
        .update({
          payment_reference: reference,
          payment_method: 'sznd',
        })
        .eq('id', targetBooking.id);

      // Initialize with SZND if credentials are configured
      if (isSzndConfigured()) {
        try {
          const szndRes = await initializeSzndCheckout({
            amountNgn: totalAmountNGN,
            reference,
            email: email || targetBooking.user_email || 'coworker@ofis.ng',
            callbackUrl:
              callbackUrl ||
              `${req.protocol}://${req.get('host')}/?app=1&payment=success&bookingId=${targetBooking.id}&reference=${reference}`,
            bookingId: targetBooking.id,
          });

          return res.json({
            success: true,
            provider: 'sznd',
            reference,
            checkoutUrl: szndRes.checkoutUrl,
            amount: totalAmountNGN,
            currency: 'NGN',
            bookingId: targetBooking.id,
            sandbox: false,
          });
        } catch (szndErr: any) {
          return res.status(502).json({
            error: szndErr.message || 'SZND payment provider checkout initialization failed',
          });
        }
      }

      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          error: 'Payment provider is not configured (SZND credentials missing in environment). Cannot process payment in production.',
        });
      }

      // Non-production sandbox fallback when SZND is unconfigured
      return res.json({
        success: true,
        provider: 'sznd',
        reference,
        checkoutUrl: null,
        amount: totalAmountNGN,
        currency: 'NGN',
        bookingId: targetBooking.id,
        sandbox: true,
        message: 'Payment initialized in demo sandbox mode (SZND unconfigured)',
      });
    } catch (err: any) {
      console.error('Error in /api/payments/initialize:', err.message);
      res.status(500).json({ error: 'Internal payment initialization error' });
    }
  });

  // 2. Authoritative Payment Verification & Booking Confirmation
  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { bookingId, reference } = req.body;

      if (!bookingId || !reference) {
        return res.status(400).json({ error: 'Both bookingId and payment reference are required' });
      }

      if (!supabaseAdmin) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            success: false,
            error: 'Database service is not configured (SUPABASE_SERVICE_ROLE_KEY missing). Cannot verify payment in production.',
          });
        }
        return res.json({
          success: true,
          booking: {
            id: bookingId,
            payment_status: 'paid',
            booking_status: 'confirmed',
            payment_reference: reference,
            payment_method: 'sznd',
          },
          sandbox: true,
          message: 'Payment verified in demo sandbox mode',
        });
      }

      // Optional user auth validation
      const authHeader = req.headers.authorization;
      let authenticatedUser: any = null;
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        authenticatedUser = user;
      }

      // Look up booking details
      const { data: booking, error: bErr } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bErr || !booking) {
        return res.status(404).json({ error: 'Authoritative booking record not found' });
      }

      // Enforce caller ownership when user is authenticated
      if (authenticatedUser) {
        const isOwner = booking.client_id === authenticatedUser.id || booking.user_id === authenticatedUser.id;
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', authenticatedUser.id).single();
        const isAdmin = profile?.role === 'admin';
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ error: 'Unauthorized: You do not own this booking' });
        }
      }

      // Check status: prevent confirmation of cancelled/expired bookings
      if (booking.booking_status === 'cancelled' || booking.status === 'cancelled') {
        return res.status(400).json({ error: 'Cannot verify payment for a cancelled booking' });
      }

      // Idempotency: If already confirmed with this reference, return idempotent success
      if (
        (booking.booking_status === 'confirmed' || booking.status === 'confirmed') &&
        booking.payment_reference === reference
      ) {
        return res.json({
          success: true,
          booking,
          alreadyConfirmed: true,
          message: 'Booking is already confirmed for this payment reference',
        });
      }

      // If SZND is configured, perform server-authoritative transaction verification against SZND
      if (isSzndConfigured()) {
        try {
          const verifyData = await verifySzndTransaction(reference);
          const txStatus = (
            verifyData.status ||
            verifyData.data?.status ||
            verifyData.state ||
            ''
          ).toLowerCase();

          if (txStatus !== 'success' && txStatus !== 'completed' && txStatus !== 'paid') {
            return res.status(400).json({
              error: verifyData.message || verifyData.data?.gateway_response || 'Payment verification failed at SZND gateway',
            });
          }

          // Verify amount if provided in SZND payload
          const verifiedSubunit = Number(verifyData.amount || verifyData.data?.amount);
          if (verifiedSubunit) {
            const verifiedNgn =
              verifiedSubunit > 10000 && verifiedSubunit > Number(booking.total_amount) * 50
                ? verifiedSubunit / 100
                : verifiedSubunit;
            if (verifiedNgn < Number(booking.total_amount)) {
              return res.status(400).json({
                error: `Payment amount mismatch: received ${verifiedNgn} NGN, expected ${booking.total_amount} NGN`,
              });
            }
          }
        } catch (gatewayErr: any) {
          return res.status(502).json({
            error: gatewayErr.message || 'Error communicating with SZND payment gateway for verification',
          });
        }
      } else if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          success: false,
          error: 'Payment provider service is not configured (SZND credentials missing). Cannot verify payment in production.',
        });
      }

      // Confirm booking payment in database
      const { error: rpcErr } = await supabaseAdmin.rpc('confirm_booking_payment', {
        p_booking_id: bookingId,
        p_transaction_reference: reference,
        p_provider: 'sznd',
        p_amount: Number(booking.total_amount),
        p_metadata: {
          verified_at: new Date().toISOString(),
          verification_path: 'server_api_verify',
        },
      });

      if (rpcErr) {
        // Fallback direct update if RPC fails
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            booking_status: 'confirmed',
            payment_status: 'paid',
            payment_reference: reference,
            payment_method: 'sznd',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        await supabaseAdmin
          .from('payments')
          .upsert(
            {
              booking_id: bookingId,
              user_id: booking.user_id,
              amount: Number(booking.total_amount),
              currency: 'NGN',
              provider: 'sznd',
              reference,
              status: 'success',
              metadata: { verified_at: new Date().toISOString() },
            },
            { onConflict: 'reference' }
          );
      }

      // Trigger booking notification
      if (booking.user_id) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: booking.user_id,
            title: 'Booking Confirmed',
            message: `Your reservation at ${booking.space_title} is confirmed. Digital access pass is unlocked.`,
            type: 'booking',
            booking_id: bookingId,
          });
      }

      // Fetch confirmed booking payload with space details
      const { data: updatedBooking } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      return res.json({
        success: true,
        booking: updatedBooking || booking,
        message: 'Payment successfully verified with SZND and booking confirmed',
      });
    } catch (err: any) {
      console.error('Error in /api/payments/verify:', err.message);
      res.status(500).json({ error: 'Payment verification error' });
    }
  });

  // 2b. Authoritative Payment Verification via GET (for redirect callbacks)
  app.get('/api/payments/verify/:reference', async (req, res) => {
    try {
      const { reference } = req.params;

      if (!reference) {
        return res.status(400).json({ error: 'Payment reference is required' });
      }

      if (!supabaseAdmin) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            success: false,
            error: 'Database service is not configured (SUPABASE_SERVICE_ROLE_KEY missing). Cannot verify payment in production.',
          });
        }
        return res.json({
          success: true,
          booking: {
            payment_status: 'paid',
            booking_status: 'confirmed',
            payment_reference: reference,
            payment_method: 'sznd',
          },
          sandbox: true,
          message: 'Payment verified in demo sandbox mode',
        });
      }

      // Look up booking by payment reference
      let targetBooking: any = null;
      const { data: bookingByRef } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('payment_reference', reference)
        .maybeSingle();

      if (bookingByRef) {
        targetBooking = bookingByRef;
      } else {
        // Fallback: search payments table
        const { data: paymentRecord } = await supabaseAdmin
          .from('payments')
          .select('booking_id')
          .eq('reference', reference)
          .maybeSingle();

        if (paymentRecord?.booking_id) {
          const { data: b } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', paymentRecord.booking_id)
            .maybeSingle();
          targetBooking = b;
        }
      }

      if (!targetBooking) {
        return res.status(404).json({ error: 'Booking record not found for transaction reference' });
      }

      // Idempotency: If already confirmed with this reference, return idempotent success
      if (
        (targetBooking.booking_status === 'confirmed' || targetBooking.status === 'confirmed') &&
        targetBooking.payment_reference === reference
      ) {
        return res.json({
          success: true,
          booking: targetBooking,
          alreadyConfirmed: true,
          message: 'Booking is already confirmed for this payment reference',
        });
      }

      // If SZND is configured, perform server-authoritative transaction verification against SZND
      if (isSzndConfigured()) {
        try {
          const verifyData = await verifySzndTransaction(reference);
          const txStatus = (
            verifyData.status ||
            verifyData.data?.status ||
            verifyData.state ||
            ''
          ).toLowerCase();

          if (txStatus !== 'success' && txStatus !== 'completed' && txStatus !== 'paid') {
            return res.status(400).json({
              error: verifyData.message || verifyData.data?.gateway_response || 'Payment verification failed at SZND gateway',
            });
          }
        } catch (gatewayErr: any) {
          return res.status(502).json({
            error: gatewayErr.message || 'Error communicating with SZND payment gateway for verification',
          });
        }
      } else if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          success: false,
          error: 'Payment provider service is not configured (SZND credentials missing). Cannot verify payment in production.',
        });
      }

      // Confirm booking payment in database
      const { error: rpcErr } = await supabaseAdmin.rpc('confirm_booking_payment', {
        p_booking_id: targetBooking.id,
        p_transaction_reference: reference,
        p_provider: 'sznd',
        p_amount: Number(targetBooking.total_amount),
        p_metadata: {
          verified_at: new Date().toISOString(),
          verification_path: 'server_api_verify_get',
        },
      });

      if (rpcErr) {
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            booking_status: 'confirmed',
            payment_status: 'paid',
            payment_reference: reference,
            payment_method: 'sznd',
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetBooking.id);
      }

      const { data: updatedBooking } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', targetBooking.id)
        .single();

      return res.json({
        success: true,
        booking: updatedBooking || targetBooking,
        message: 'Payment successfully verified with SZND and booking confirmed',
      });
    } catch (err: any) {
      console.error('Error in /api/payments/verify/:reference:', err.message);
      res.status(500).json({ error: 'Payment verification error' });
    }
  });

  // 3. Webhook Receiver for Gateway Callbacks (SZND Webhook)
  app.post(['/api/payments/webhook', '/api/webhooks/sznd', '/api/webhook/sznd'], async (req, res) => {
    try {
      const config = getSzndConfig();

      // Webhook signature verification if secret is configured
      if (config.apiSecret) {
        const isValid = verifySzndWebhookSignature(req, config.apiSecret);
        if (!isValid) {
          console.warn('[Webhook] Invalid SZND webhook signature received');
          return res.status(401).json({ error: 'Invalid webhook signature' });
        }
      }

      if (!supabaseAdmin) {
        return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is required for webhook operations' });
      }

      const event = req.body || {};
      const eventType = (event.event || event.type || event.status || '').toLowerCase();
      const eventData = event.data || event;
      const reference = eventData.reference || eventData.transaction_reference || eventData.tx_ref;
      const bookingId = eventData.metadata?.booking_id || eventData.booking_id;
      const eventId = event.id || eventData.id || `${reference}_${Date.now()}`;

      if (!reference && !bookingId) {
        return res.status(400).json({ error: 'Missing reference or bookingId in webhook payload' });
      }

      // Duplicate webhook protection / idempotency check
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .maybeSingle();

      if (existingPayment && existingPayment.status === 'success') {
        return res.status(200).json({ status: 'ok', message: 'Duplicate webhook ignored; transaction already confirmed' });
      }

      // Check payment status from SZND event
      const isSuccess =
        eventType === 'payment.success' ||
        eventType === 'charge.success' ||
        eventType === 'payment.completed' ||
        eventType === 'success' ||
        eventData.status === 'success' ||
        eventData.status === 'paid';

      const isFailed =
        eventType === 'payment.failed' ||
        eventType === 'charge.failed' ||
        eventType === 'failed' ||
        eventData.status === 'failed';

      const isAbandoned =
        eventType === 'payment.abandoned' ||
        eventType === 'charge.abandoned' ||
        eventType === 'abandoned' ||
        eventData.status === 'abandoned';

      if (isFailed || isAbandoned) {
        const targetStatus = isAbandoned ? 'abandoned' : 'failed';
        if (existingPayment) {
          await supabaseAdmin
            .from('payments')
            .update({
              status: targetStatus,
              metadata: {
                ...(existingPayment.metadata || {}),
                webhook_event_id: eventId,
                failed_at: new Date().toISOString(),
                failure_reason: eventData.gateway_response || eventData.message || 'Payment failed',
              },
            })
            .eq('reference', reference);
        }
        return res.status(200).json({ status: 'ok', message: `Payment marked as ${targetStatus}` });
      }

      if (isSuccess) {
        let targetBookingId = bookingId;
        if (!targetBookingId && existingPayment?.booking_id) {
          targetBookingId = existingPayment.booking_id;
        }

        if (!targetBookingId) {
          return res.status(404).json({ error: 'Associated booking ID not found for transaction reference' });
        }

        const { data: booking, error: bErr } = await supabaseAdmin
          .from('bookings')
          .select('*')
          .eq('id', targetBookingId)
          .single();

        if (bErr || !booking) {
          return res.status(404).json({ error: 'Booking record not found' });
        }

        // Amount verification
        const rawAmount = Number(eventData.amount || 0);
        const paidAmount =
          rawAmount > 10000 && rawAmount > Number(booking.total_amount) * 50
            ? rawAmount / 100
            : rawAmount || Number(booking.total_amount);

        if (paidAmount < Number(booking.total_amount)) {
          console.warn(`[Webhook] Amount mismatch: received ${paidAmount}, expected ${booking.total_amount}`);
          return res.status(400).json({ error: 'Payment amount mismatch' });
        }

        // Invoke confirm_booking_payment RPC
        const { error: rpcErr } = await supabaseAdmin.rpc('confirm_booking_payment', {
          p_booking_id: targetBookingId,
          p_transaction_reference: reference,
          p_provider: 'sznd',
          p_amount: paidAmount,
          p_metadata: {
            webhook_event_id: eventId,
            verified_via: 'sznd_webhook',
            received_at: new Date().toISOString(),
          },
        });

        if (rpcErr) {
          // Direct fallback update
          await supabaseAdmin
            .from('bookings')
            .update({
              status: 'confirmed',
              booking_status: 'confirmed',
              payment_status: 'paid',
              payment_reference: reference,
              payment_method: 'sznd',
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetBookingId);

          await supabaseAdmin
            .from('payments')
            .upsert(
              {
                booking_id: targetBookingId,
                user_id: booking.user_id,
                amount: paidAmount,
                currency: 'NGN',
                provider: 'sznd',
                reference,
                status: 'success',
                metadata: { webhook_event_id: eventId, received_at: new Date().toISOString() },
              },
              { onConflict: 'reference' }
            );
        }

        // Trigger notification
        if (booking.user_id) {
          await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: booking.user_id,
              title: 'Payment Confirmed',
              message: `Your pass for ${booking.space_title} is confirmed. Digital access pass is unlocked.`,
              type: 'booking',
              booking_id: targetBookingId,
            });
        }

        return res.status(200).json({ status: 'ok', confirmed: true, reference });
      }

      return res.status(200).json({ status: 'ok', received: true });
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  // ============================================================================
  // SECURE CREDENTIALS & ACCESS PASSES
  // ============================================================================

  app.post('/api/bookings/credentials', async (req, res) => {
    try {
      const { bookingId, spaceId } = req.body;
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
      }

      if (!supabaseAdmin) {
        return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is required to retrieve space credentials' });
      }

      const token = authHeader.replace(/^Bearer\s+/i, '');
      const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);

      if (userErr || !user) {
        return res.status(401).json({ error: 'Invalid or expired user authentication token' });
      }

      // Check access permission: user must be the booker of an active confirmed booking, space host, or admin
      let userHasAccess = false;
      let targetSpaceId = spaceId;

      if (bookingId) {
        const { data: b } = await supabaseAdmin
          .from('bookings')
          .select('id, client_id, user_id, host_id, booking_status, status, space_id, date, start_time, duration_hours')
          .eq('id', bookingId)
          .single();

        if (b) {
          targetSpaceId = b.space_id;
          const isBooker = b.client_id === user.id || b.user_id === user.id;
          const isHost = b.host_id === user.id;

          if (isBooker) {
            const currentStatus = b.booking_status || b.status;
            if (currentStatus === 'confirmed' || currentStatus === 'checked_in') {
              userHasAccess = true;
            } else {
              return res.status(403).json({
                error: `Access Denied: Booking is in ${currentStatus} status. Credentials require a confirmed payment.`,
              });
            }
          } else if (isHost) {
            userHasAccess = true;
          }
        }
      }

      // Check space host if not yet granted
      if (!userHasAccess && targetSpaceId) {
        const { data: s } = await supabaseAdmin
          .from('spaces')
          .select('id, host_id, owner_id')
          .eq('id', targetSpaceId)
          .single();

        if (s && (s.host_id === user.id || s.owner_id === user.id)) {
          userHasAccess = true;
        }
      }

      // Check admin if not yet granted
      if (!userHasAccess) {
        const { data: p } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (p && p.role === 'admin') {
          userHasAccess = true;
        }
      }

      if (!userHasAccess) {
        return res.status(403).json({
          error: 'Access Denied: You must have an active confirmed booking or host privileges to view space credentials',
        });
      }

      if (!targetSpaceId) {
        return res.status(400).json({ error: 'Could not resolve space ID' });
      }

      // Retrieve credentials from space_access_credentials
      const { data: creds } = await supabaseAdmin
        .from('space_access_credentials')
        .select('*')
        .eq('space_id', targetSpaceId)
        .single();

      const { data: spaceInfo } = await supabaseAdmin
        .from('spaces')
        .select('wifi_ssid')
        .eq('id', targetSpaceId)
        .single();

      return res.json({
        credentials: {
          wifiSSID: creds?.wifi_ssid || spaceInfo?.wifi_ssid || 'OFIS_Guest_HighSpeed',
          wifiPass: creds?.wifi_pass || '',
          doorPIN: creds?.door_pin || '',
          accessInstructions: creds?.access_instructions || 'Check in at reception desk with your booking reference.',
        },
      });
    } catch (err: any) {
      console.error('Error in /api/bookings/credentials:', err.message);
      res.status(500).json({ error: 'Failed to retrieve credentials' });
    }
  });

  // ============================================================================
  // AI INTEGRATIONS (GEMINI 3.8 FLASH)
  // ============================================================================

  // AI Workspace Matcher endpoint for Coworkers
  app.post('/api/ai/match', async (req, res) => {
    const { userQuery, spaces } = req.body || {};
    try {
      const aiClient = getAiClient();
      if (!aiClient) {
        // Fallback intelligent heuristic recommendation if key is not configured
        return res.json({
          recommendation: {
            headline: 'Optimized Workspaces based on your criteria',
            suggestedSpaceId: spaces && spaces.length > 0 ? spaces[0].id : 'space-vi-hive',
            suggestedDeskId: 'D-04',
            reasoning:
              'Based on your preference for productivity and quiet focus, this location offers dedicated ergonomic seating, dual 4K monitors, natural lighting, and verified 1Gbps fiber internet.',
            keyHighlights: [
              'Quiet library zone with sound acoustic baffling',
              'Herman Miller Aeron ergonomic chair & motorized standing desk',
              'Specialty barista coffee & soundproof phone booths included',
            ],
            confidenceScore: 96,
          },
        });
      }

      const prompt = `You are OFIS's intelligent Nigerian workspace concierge. 
A coworker or team is looking for their ideal physical workspace, desk, or creator studio in Nigeria.
User prompt: "${userQuery || 'A quiet, well-lit desk for software development with fast WiFi and dual monitors'}"

Available Spaces Data:
${JSON.stringify(
  (spaces || []).map((s: any) => ({
    id: s.id,
    title: s.title || s.name,
    city: s.city,
    neighborhood: s.neighborhood,
    pricePerHour: s.pricePerHour || s.price_per_hour,
    pricePerDay: s.pricePerDay || s.price_per_day,
    amenities: s.amenities,
    rating: s.rating,
    category: s.category,
  })),
  null,
  2
)}

Provide a thoughtful, realistic JSON response matching the following structure exactly:
{
  "headline": "Brief catchy summary of the recommendation",
  "suggestedSpaceId": "matching space id",
  "suggestedDeskId": "matching desk id or desk name",
  "reasoning": "2-3 concise sentences explaining why this space and desk perfectly match the coworker's needs",
  "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "confidenceScore": 95
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({ recommendation: parsed, fallback: false });
    } catch (error: any) {
      console.warn('AI Match fallback triggered:', error?.message);
      const firstSpace = spaces && spaces.length > 0 ? spaces[0] : null;
      return res.json({
        recommendation: {
          headline: firstSpace ? `Matched: ${firstSpace.title || firstSpace.name}` : 'Curated Coworking Match',
          suggestedSpaceId: firstSpace ? firstSpace.id : 'space-vi-hive',
          suggestedDeskId: 'Hot Desk 01',
          reasoning: 'Matched based on high-reliability power backup, high-speed fiber internet, and quiet ergonomic workspace.',
          keyHighlights: [
            '24/7 dual generator power redundancy',
            'High-speed fiber connectivity',
            'Ergonomic seating with quiet acoustic zones',
          ],
          confidenceScore: 92,
        },
        fallback: true,
      });
    }
  });

  // AI Host Space Listing Optimizer endpoint
  app.post('/api/ai/optimize-listing', async (req, res) => {
    const { spaceInfo } = req.body || {};
    try {
      const aiClient = getAiClient();
      if (!aiClient) {
        return res.json({
          optimizedListing: {
            suggestedTitle: `${spaceInfo?.title || spaceInfo?.name || 'Premium Space'} - Prime Coworking & Creator Hub`,
            tagline: '24/7 dual generator redundancy, Starlink internet & acoustic soundproofing in prime location.',
            suggestedHourlyRate: spaceInfo?.pricePerHour || spaceInfo?.hourlyRateNGN || 6500,
            suggestedDailyRate: spaceInfo?.pricePerDay || spaceInfo?.dailyRateNGN || 28000,
            pricingTip:
              'Your pricing is competitive for the local area. Adding a 15% discount on full-week passes can boost occupancy by 28%.',
            suggestedAmenitiesToAdd: ['Podcast & Creator Booth', 'Cold Brew & Espresso Bar', 'Dedicated Parking & Security'],
            targetAudience: 'Founders, software engineers, content creators, and remote teams needing reliable power and fiber connectivity.',
          },
        });
      }

      const prompt = `You are a Nigerian commercial real estate and physical workspace revenue optimization expert.
Help a space owner optimize their workspace listing for maximum occupancy and revenue on OFIS (Nigeria's physical workspace network).

Space Data:
${JSON.stringify(spaceInfo, null, 2)}

Provide a JSON response with the following format:
{
  "suggestedTitle": "High-converting listing title",
  "tagline": "Compelling 1-sentence value proposition",
  "suggestedHourlyRate": 6500,
  "suggestedDailyRate": 28000,
  "pricingTip": "Actionable tip on hourly and daily workspace pricing tiers in Nigerian Naira",
  "suggestedAmenitiesToAdd": ["Amenity 1", "Amenity 2", "Amenity 3"],
  "targetAudience": "Summary of ideal coworker demographic"
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({ optimizedListing: parsed, fallback: false });
    } catch (error: any) {
      console.warn('AI Optimize listing fallback triggered:', error?.message);
      return res.json({
        optimizedListing: {
          suggestedTitle: `${spaceInfo?.title || spaceInfo?.name || 'Premium Space'} - Prime Coworking & Creator Hub`,
          tagline: '24/7 dual generator redundancy, Starlink internet & acoustic soundproofing in prime location.',
          suggestedHourlyRate: spaceInfo?.pricePerHour || spaceInfo?.hourlyRateNGN || 6500,
          suggestedDailyRate: spaceInfo?.pricePerDay || spaceInfo?.dailyRateNGN || 28000,
          pricingTip:
            'Your pricing is competitive for the local area. Adding a 15% discount on full-week passes can boost occupancy by 28%.',
          suggestedAmenitiesToAdd: ['Podcast & Creator Booth', 'Cold Brew & Espresso Bar', 'Dedicated Parking & Security'],
          targetAudience: 'Founders, software engineers, content creators, and remote teams needing reliable power and fiber connectivity.',
        },
        fallback: true,
      });
    }
  });

  // ============================================================================
  // FRONTEND STATIC / DEV SERVER
  // ============================================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OFIS Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
