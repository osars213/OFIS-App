import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

dotenv.config({ override: true });

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
  // Transfaar/SZND specification format: "${bodyString}|${timestamp}"
  const payload = bodyString ? `${bodyString}|${timestamp}` : timestamp;
  return crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');
}

// Verify incoming SZND Webhook HMAC-SHA256 signature
function verifySzndWebhookSignature(req: express.Request, apiSecret: string): boolean {
  if (!apiSecret) return false;

  const signatureHeader = (
    req.headers['x-transfaar-signature'] ||
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

  // 2. Transfaar pipe-delimited format "${rawBody}|${timestamp}"
  const timestampHeader = (
    req.headers['x-timestamp'] ||
    req.headers['x-sznd-timestamp'] ||
    req.headers['sznd-timestamp'] ||
    ''
  ) as string;

  if (timestampHeader) {
    const expectedPiped = crypto
      .createHmac('sha256', apiSecret)
      .update(`${rawBody}|${timestampHeader}`)
      .digest('hex');
    try {
      const sigBuf = Buffer.from(cleanSignature, 'hex');
      const expBuf = Buffer.from(expectedPiped, 'hex');
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        return true;
      }
    } catch {}

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
    } catch {}
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
  firstName?: string;
  lastName?: string;
  phone?: string;
  description?: string;
  callbackUrl?: string;
  bookingId: string;
  metadata?: Record<string, any>;
}) {
  const config = getSzndConfig();
  if (!config.baseUrl || !config.apiKey || !config.apiSecret) {
    throw new Error('SZND credentials not configured');
  }

  // Resolve endpoint: prefers /api/v1/client/checkout/initialize
  const cleanBase = config.baseUrl.replace(/\/+$/, '');
  let endpoint = '/api/v1/client/checkout/initialize';
  if (cleanBase.includes('/api/v1')) {
    endpoint = cleanBase.endsWith('/client/checkout/initialize') ? '' : '/client/checkout/initialize';
  } else if (cleanBase.endsWith('/checkout/initialize')) {
    endpoint = '';
  }
  const url = `${cleanBase}${endpoint}`;

  const callbackUrl = params.callbackUrl || 'ofis://payment/result';
  const effectiveApiKey = config.apiKey.startsWith('http') ? config.apiSecret : config.apiKey;

  const payload = {
    email: params.email,
    first_name: params.firstName || 'OFIS',
    last_name: params.lastName || 'Member',
    amount: params.amountNgn.toFixed(2),
    amount_ngn: params.amountNgn,
    currency: 'NGN',
    reference: params.reference,
    redirect_url: callbackUrl,
    callback_url: callbackUrl,
    description: params.description || `OFIS Booking: ${params.bookingId}`,
    customer_phone_number: params.phone || '+2348000000000',
    metadata: {
      booking_id: params.bookingId,
      redirect_url: callbackUrl,
      platform: 'OFIS',
      environment: config.env,
      ...params.metadata,
    },
  };

  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const bodyString = JSON.stringify(payload);
  const signature = generateSzndRequestSignature(config.apiSecret, timestamp, bodyString);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${effectiveApiKey}`,
      'x-api-key': effectiveApiKey,
      'X-API-Key': effectiveApiKey,
      'X-SZND-KEY': effectiveApiKey,
      'x-timestamp': timestamp,
      'X-Timestamp': timestamp,
      'X-SZND-TIMESTAMP': timestamp,
      'x-signature': signature,
      'X-Signature': signature,
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
    data.data?.link ||
    (config.isTestMode ? `https://stagingpay.szndpay.com/pay/${params.reference}` : `https://pay.szndpay.com/pay/${params.reference}`);

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
  const isValidServiceKey = supabaseServiceKey && supabaseServiceKey !== 'PASTE_SERVICE_ROLE_KEY_HERE';

  // Privileged server client ONLY initialized if SUPABASE_SERVICE_ROLE_KEY is provided
  const supabaseAdmin =
    supabaseUrl && isValidServiceKey
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
  // SPACES: AUTHORITATIVE REAL-TIME AVAILABILITY
  // Returns sanitized booking intervals without customer PII
  // ============================================================================

  app.get('/api/spaces/:id/availability', async (req, res) => {
    try {
      const spaceId = req.params.id;
      const monthQuery = (req.query.month as string) || ''; // Expected format YYYY-MM
      const dateQuery = (req.query.date as string) || '';   // Optional single date filter YYYY-MM-DD

      if (!spaceId) {
        return res.status(400).json({ error: 'spaceId is required' });
      }

      if (!supabaseAdmin) {
        return res.json({
          spaceId,
          month: monthQuery,
          bookings: [],
          message: 'Authoritative availability running in local development mode',
        });
      }

      // Query only genuine blocking bookings:
      // status IN ('confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'active') AND payment_status = 'paid'
      let query = supabaseAdmin
        .from('bookings')
        .select('id, date, start_time, duration_hours, selected_seat_id, status, guest_count')
        .eq('space_id', spaceId)
        .in('status', ['confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'active'])
        .eq('payment_status', 'paid');

      if (dateQuery) {
        query = query.eq('date', dateQuery);
      } else if (monthQuery && /^\d{4}-\d{2}$/.test(monthQuery)) {
        // Query entire month: date >= YYYY-MM-01 and date <= YYYY-MM-31
        query = query.gte('date', `${monthQuery}-01`).lte('date', `${monthQuery}-31`);
      }

      const { data: bookings, error: bErr } = await query;

      if (bErr) {
        console.warn('[Availability API notice - table not provisioned or query returned notice]:', bErr.message);
        return res.json({
          spaceId,
          month: monthQuery || null,
          date: dateQuery || null,
          bookings: [],
          notice: 'Live database bookings table not yet provisioned; displaying real-time open availability',
        });
      }

      // Compute sanitized intervals with start_time and end_time
      const sanitizedBookings = (bookings || []).map((b: any) => {
        const parts = (b.start_time || '09:00').split(':');
        const h = parseInt(parts[0], 10) || 9;
        const m = parseInt(parts[1], 10) || 0;
        const dur = Number(b.duration_hours) || 2;
        const totalMinutes = h * 60 + m + Math.round(dur * 60);
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        const calculatedEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        return {
          id: b.id,
          date: b.date,
          start_time: b.start_time,
          end_time: calculatedEndTime,
          duration_hours: dur,
          selected_seat_id: b.selected_seat_id || null,
          guest_count: b.guest_count || 1,
          status: b.status,
        };
      });

      return res.json({
        spaceId,
        month: monthQuery || null,
        date: dateQuery || null,
        bookings: sanitizedBookings,
      });
    } catch (err: any) {
      console.error('Error in /api/spaces/:id/availability:', err.message);
      return res.status(500).json({ error: 'Internal server error fetching availability' });
    }
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
      let space: any = null;
      if (supabaseAdmin) {
        const { data: dbSpace } = await supabaseAdmin
          .from('spaces')
          .select('*')
          .eq('id', spaceId)
          .maybeSingle();
        if (dbSpace) space = dbSpace;
      }

      if (!space && VERIFIED_TEST_SPACES[spaceId]) {
        space = { ...VERIFIED_TEST_SPACES[spaceId] };
      }

      if (!space) {
        return res.status(404).json({
          valid: false,
          error: 'Space record not found',
        });
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
        .select('id, start_time, duration_hours, selected_seat_id, status, booking_status, guest_count')
        .eq('space_id', spaceId)
        .eq('date', date)
        .in('status', ['confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'active'])
        .eq('payment_status', 'paid');

      if (selectedSeatId) {
        conflictQuery = conflictQuery.eq('selected_seat_id', selectedSeatId);
      }

      const { data: existingBookings } = await conflictQuery;

      const isExclusive = space.category === 'private_office' ||
                          space.category === 'meeting' ||
                          space.category === 'podcast' ||
                          space.category === 'photography' ||
                          space.category === 'event' ||
                          (Number(space.capacity) || 1) === 1;

      let isOccupied = false;
      let overlappingGuests = 0;

      if (existingBookings && existingBookings.length > 0) {
        for (const b of existingBookings) {
          const bParts = (b.start_time || '09:00').split(':');
          const bStartMin = (parseInt(bParts[0], 10) || 9) * 60 + (parseInt(bParts[1], 10) || 0);
          const bEndMin = bStartMin + (b.duration_hours || 2) * 60;

          // Overlap: start_A < end_B AND start_B < end_A
          if (totalStartMin < bEndMin && bStartMin < totalEndMin) {
            if (selectedSeatId || isExclusive) {
              isOccupied = true;
              break;
            } else {
              overlappingGuests += Number(b.guest_count) || 1;
            }
          }
        }

        if (!selectedSeatId && !isExclusive && (overlappingGuests + numGuests) > maxCapacity) {
          isOccupied = true;
        }
      }

      if (isOccupied) {
        return res.status(409).json({
          valid: false,
          available: false,
          conflict: true,
          code: 'SLOT_UNAVAILABLE',
          reason: 'This time slot is no longer available. Please select another time or date.',
          error: 'The requested time slot conflicts with an existing confirmed booking for this space/seat.',
        });
      }

      // 4. Calculate server-authoritative pricing using unified engine
      const requestedDate = date || new Date().toISOString().split('T')[0];
      const authoritativePricing = calculateAuthoritativeServerPrice(space, {
        date: requestedDate,
        durationHours: numDuration,
        guestCount: numGuests,
        pricingPeriod: space.pricing_period || space.pricingPeriod,
        pricingBasis: space.pricing_basis || space.pricingBasis,
      });

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
          date: requestedDate,
          startTime,
          endTime: calculatedEndTime,
          durationHours: numDuration,
        },
        pricing: {
          period: authoritativePricing.period,
          rate: authoritativePricing.baseRate,
          subtotal: authoritativePricing.subtotal,
          discount: authoritativePricing.discountAmount,
          totalAmount: authoritativePricing.totalAmountNGN,
          currency: 'NGN',
          isWeekend: authoritativePricing.isWeekend,
          breakdown: authoritativePricing,
        },
      });
    } catch (err: any) {
      console.error('Error in /api/bookings/validate:', err.message);
      res.status(500).json({ valid: false, error: 'Validation failed due to internal error' });
    }
  });

  // ============================================================================
  // AUTHORITATIVE SERVER-SIDE PRICING ENGINE (SINGLE SOURCE OF TRUTH)
  // Mirrors and enforces src/utils/pricing.ts (calculateBookingPrice) contract
  // ============================================================================

  const VERIFIED_TEST_SPACES: Record<string, any> = {};

  function isDateWeekend(dateStr?: string | null): boolean {
    if (!dateStr) return false;
    const cleanDate = String(dateStr).trim().split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      const dayOfWeek = d.getUTCDay(); // 0 = Sunday, 6 = Saturday
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  function normalizeSpaceCategory(cat?: string | null): string {
    if (!cat) return 'coworking';
    const c = cat.toLowerCase().trim();
    if (c === 'meeting' || c === 'meeting-room' || c === 'meeting_room' || c === 'boardroom') {
      return 'meeting-room';
    }
    if (c === 'private_office' || c === 'private-office' || c === 'office' || c === 'executive_suite') {
      return 'private-office';
    }
    if (c === 'training' || c === 'training-room' || c === 'training_room' || c === 'workshop') {
      return 'training-room';
    }
    if (c === 'event' || c === 'event-space' || c === 'event_space' || c === 'hall') {
      return 'event-space';
    }
    if (c === 'studio' || c === 'podcast' || c === 'photography' || c === 'photo_studio' || c === 'media') {
      return 'studio';
    }
    if (c === 'other' || c === 'creative' || c === 'rooftop') {
      return 'other';
    }
    return 'coworking';
  }

  function getDefaultRateForPeriod(period: string, category?: string): number {
    const norm = normalizeSpaceCategory(category);
    if (norm === 'coworking') {
      if (period === 'day') return 18000;
      if (period === 'month') return 150000;
      if (period === 'session') return 15000;
      return 3500; // hour
    }
    if (norm === 'meeting-room') {
      if (period === 'day') return 90000;
      if (period === 'month') return 800000;
      if (period === 'session') return 40000;
      return 15000; // hour
    }
    if (norm === 'private-office') {
      if (period === 'month') return 350000;
      if (period === 'day') return 45000;
      if (period === 'session') return 30000;
      return 8000; // hour
    }
    if (norm === 'training-room') {
      if (period === 'day') return 85000;
      if (period === 'month') return 950000;
      if (period === 'session') return 50000;
      return 25000; // hour
    }
    if (norm === 'event-space') {
      if (period === 'day') return 250000;
      if (period === 'month') return 2500000;
      if (period === 'session') return 150000;
      return 45000; // hour
    }
    if (norm === 'studio') {
      if (period === 'session') return 35000;
      if (period === 'day') return 120000;
      if (period === 'month') return 600000;
      return 20000; // hour
    }
    if (period === 'day') return 25000;
    if (period === 'month') return 250000;
    if (period === 'session') return 30000;
    return 5000; // hour
  }

  interface AuthoritativePricingParams {
    date?: string | null;
    durationHours?: number | null;
    guestCount?: number | null;
    pricingPeriod?: string | null;
    pricingBasis?: string | null;
    days?: number | null;
    months?: number | null;
    sessions?: number | null;
    quantity?: number | null;
    customRate?: number | null;
    promoCode?: string | null;
  }

  function calculateAuthoritativeServerPrice(space: any, params: AuthoritativePricingParams): {
    totalAmountNGN: number;
    subtotal: number;
    discountAmount: number;
    baseRate: number;
    basis: string;
    period: string;
    quantity: number;
    guests: number;
    isWeekend: boolean;
  } {
    const cat = normalizeSpaceCategory(space?.category);

    // 1. Resolve pricing rules safely from JSON or object
    let rules = space?.pricingRules || space?.pricing_rules || space?.pricing_model?.pricingRules || {};
    if (typeof rules === 'string') {
      try { rules = JSON.parse(rules); } catch {}
    }

    const weekendMarkupPercent = rules.weekendMarkupPercent ?? rules.weekend_markup_percent;
    const weekendMultiplier = rules.weekendMultiplier ?? rules.weekend_multiplier;
    const promotionalDiscountPercent = rules.promotionalDiscountPercent ?? rules.promotional_discount_percent ?? rules.promoDiscountPercent ?? rules.promo_discount_percent;
    const dailyDiscountPercent = rules.dailyDiscountPercent ?? rules.daily_discount_percent;

    // 2. Resolve basis: 'person' vs 'space' vs 'session'
    let basis = 'space';
    let rawBasis = params.pricingBasis || space?.pricingBasis || space?.pricing_basis || space?.pricingModel?.basis || space?.pricing_model?.basis;
    if (rawBasis === 'person' || rawBasis === 'space' || rawBasis === 'session') {
      basis = rawBasis;
    } else if (cat === 'coworking') {
      basis = 'person';
    } else if (cat === 'training-room' && rawBasis === 'person') {
      basis = 'person';
    } else {
      basis = 'space';
    }

    // 3. Resolve period: 'hour' vs 'day' vs 'month' vs 'session'
    let period = 'hour';
    let rawPeriod = params.pricingPeriod || space?.pricingPeriod || space?.pricing_period || space?.pricingModel?.period || space?.pricing_model?.period;
    if (rawPeriod === 'hour' || rawPeriod === 'day' || rawPeriod === 'month' || rawPeriod === 'session') {
      period = rawPeriod;
    } else if (params.months && params.months > 0) {
      period = 'month';
    } else if (params.days && params.days > 0) {
      period = 'day';
    } else if (params.sessions && params.sessions > 0) {
      period = 'session';
    } else if (params.durationHours && params.durationHours >= 24) {
      period = 'day';
    }

    // 4. Resolve base rate for resolved period
    let rawRate: number | undefined;
    if (params.customRate && params.customRate > 0) {
      rawRate = params.customRate;
    } else if (period === 'month') {
      rawRate = Number(space?.price_per_month ?? space?.pricePerMonth);
    } else if (period === 'day') {
      rawRate = Number(space?.price_per_day ?? space?.pricePerDay);
    } else if (period === 'session') {
      rawRate = Number(space?.price_per_session ?? space?.pricePerSession);
    } else {
      rawRate = Number(space?.price_per_hour ?? space?.pricePerHour);
    }

    if (!rawRate || isNaN(rawRate) || rawRate <= 0) {
      rawRate = getDefaultRateForPeriod(period, cat);
    }

    // 5. Apply weekend markup if booking date is on a weekend (Saturday or Sunday)
    const isWeekend = isDateWeekend(params.date);
    let baseRate = rawRate;
    if (isWeekend) {
      if (weekendMarkupPercent && Number(weekendMarkupPercent) > 0) {
        baseRate = Math.round(baseRate * (1 + Number(weekendMarkupPercent) / 100));
      } else if (weekendMultiplier && Number(weekendMultiplier) > 0) {
        baseRate = Math.round(baseRate * Number(weekendMultiplier));
      }
    }

    const safeBaseRate = Math.round(baseRate || 0);

    // 6. Quantity determination based on period
    let quantity = 1;
    if (period === 'hour') {
      quantity = Math.max(1, Number(params.durationHours) || Number(params.quantity) || 1);
    } else if (period === 'day') {
      quantity = Math.max(
        1,
        Number(params.days) ||
        Number(params.quantity) ||
        (params.durationHours ? Math.round(Number(params.durationHours) / 24) : 1) ||
        1
      );
    } else if (period === 'month') {
      quantity = Math.max(1, Number(params.months) || Number(params.quantity) || 1);
    } else if (period === 'session') {
      quantity = Math.max(1, Number(params.sessions) || Number(params.quantity) || 1);
    }

    const guests = Math.max(1, Number(params.guestCount) || 1);

    // 7. Authoritative Subtotal calculation
    let subtotal = 0;
    if (basis === 'person') {
      subtotal = safeBaseRate * guests * quantity;
    } else {
      subtotal = safeBaseRate * quantity;
    }

    // 8. Discounts (Promotional & Duration)
    let discountAmount = 0;
    if (promotionalDiscountPercent && Number(promotionalDiscountPercent) > 0) {
      discountAmount = Math.round(subtotal * (Number(promotionalDiscountPercent) / 100));
    } else if (period === 'day' && quantity >= 7 && dailyDiscountPercent && Number(dailyDiscountPercent) > 0) {
      discountAmount = Math.round(subtotal * (Number(dailyDiscountPercent) / 100));
    }

    const totalAmountNGN = Math.max(0, subtotal - discountAmount);

    return {
      totalAmountNGN,
      subtotal,
      discountAmount,
      baseRate: safeBaseRate,
      basis,
      period,
      quantity,
      guests,
      isWeekend,
    };
  }

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
        pricingPeriod,
        pricingBasis,
        days,
        months,
        sessions,
        quantity,
        promoCode,
        customRate,
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

        // Fetch parent space to authoritatively recalculate amount
        let space: any = null;
        if (supabaseAdmin) {
          const { data: dbSpace } = await supabaseAdmin
            .from('spaces')
            .select('*')
            .eq('id', booking.space_id)
            .maybeSingle();
          if (dbSpace) space = dbSpace;
        }

        if (!space && VERIFIED_TEST_SPACES[booking.space_id]) {
          space = { ...VERIFIED_TEST_SPACES[booking.space_id] };
        }

        if (space) {
          targetBooking.space = space;
        }
      } else if (spaceId) {
        // Validate space existence and calculate authoritative amount
        let space: any = null;
        if (supabaseAdmin) {
          const { data: dbSpace } = await supabaseAdmin
            .from('spaces')
            .select('*')
            .eq('id', spaceId)
            .maybeSingle();
          if (dbSpace) space = dbSpace;
        }

        if (!space && VERIFIED_TEST_SPACES[spaceId]) {
          space = { ...VERIFIED_TEST_SPACES[spaceId] };
        }

        if (!space) {
          return res.status(404).json({ error: 'Space record not found' });
        }

        if (space.is_active === false) {
          return res.status(400).json({ error: 'Space is currently inactive' });
        }

        const hours = Math.max(1, Number(durationHours) || 2);
        const requestedDate = date || new Date().toISOString().split('T')[0];
        const requestedTime = startTime || '10:00';

        // Authoritative server-side price calculation for direct space initialization
        const directPricing = calculateAuthoritativeServerPrice(space, {
          date: requestedDate,
          durationHours: hours,
          guestCount: Number(guestCount) || 1,
          pricingPeriod: pricingPeriod || space.pricing_period || space.pricingPeriod,
          pricingBasis: pricingBasis || space.pricing_basis || space.pricingBasis,
          days: days ? Number(days) : undefined,
          months: months ? Number(months) : undefined,
          sessions: sessions ? Number(sessions) : undefined,
          quantity: quantity ? Number(quantity) : undefined,
          promoCode,
          customRate: customRate ? Number(customRate) : undefined,
        });

        const computedTotal = directPricing.totalAmountNGN;

        // Defense-in-depth early availability check (user-friendly early rejection before gateway session)
        const reqParts = requestedTime.split(':');
        const reqStartMin = (parseInt(reqParts[0], 10) || 10) * 60 + (parseInt(reqParts[1], 10) || 0);
        const reqEndMin = reqStartMin + (hours * 60);

        const isSpaceExclusive = space.category === 'private_office' ||
                                space.category === 'meeting' ||
                                space.category === 'podcast' ||
                                space.category === 'photography' ||
                                space.category === 'event' ||
                                (Number(space.capacity) || 1) === 1;

        let earlyConflictQuery = supabaseAdmin
          .from('bookings')
          .select('id, start_time, duration_hours, selected_seat_id, guest_count, status')
          .eq('space_id', spaceId)
          .eq('date', requestedDate)
          .in('status', ['confirmed', 'ready_for_checkin', 'checked_in', 'in_progress', 'active'])
          .eq('payment_status', 'paid');

        if (selectedSeatId) {
          earlyConflictQuery = earlyConflictQuery.eq('selected_seat_id', selectedSeatId);
        }

        const { data: existingActiveBookings } = await earlyConflictQuery;
        if (existingActiveBookings && existingActiveBookings.length > 0) {
          let hasConflict = false;
          let overlappingGuests = 0;

          for (const b of existingActiveBookings) {
            const bParts = (b.start_time || '09:00').split(':');
            const bStartMin = (parseInt(bParts[0], 10) || 9) * 60 + (parseInt(bParts[1], 10) || 0);
            const bEndMin = bStartMin + (Number(b.duration_hours) || 2) * 60;

            // Overlap condition: start_A < end_B AND start_B < end_A
            if (reqStartMin < bEndMin && bStartMin < reqEndMin) {
              if (selectedSeatId || isSpaceExclusive) {
                hasConflict = true;
                break;
              } else {
                overlappingGuests += Number(b.guest_count) || 1;
              }
            }
          }

          if (!selectedSeatId && !isSpaceExclusive && (overlappingGuests + (Number(guestCount) || 1)) > (Number(space.capacity) || 20)) {
            hasConflict = true;
          }

          if (hasConflict) {
            return res.status(409).json({
              error: 'This time slot is no longer available. Please choose another available time.',
              code: 'SLOT_UNAVAILABLE',
            });
          }
        }

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
            date: requestedDate,
            start_time: requestedTime,
            duration_hours: hours,
            guest_count: Number(guestCount) || 1,
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
          console.warn('[Initialize note]: Supabase bookings write rejected by RLS. Using authoritative session record:', cErr?.message);
          targetBooking = {
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
            date: requestedDate,
            start_time: requestedTime,
            duration_hours: hours,
            guest_count: Number(guestCount) || 1,
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
            space: space,
          };
        } else {
          targetBooking = createdBooking;
          targetBooking.space = space;
        }
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

      // Recalculate authoritative charge amount server-side; NEVER trust frontend booking.total_amount
      let totalAmountNGN: number;
      if (targetBooking.space) {
        const authoritativePricing = calculateAuthoritativeServerPrice(targetBooking.space, {
          date: targetBooking.date || date,
          durationHours: Number(targetBooking.duration_hours) || Number(durationHours) || 2,
          guestCount: Number(targetBooking.guest_count) || Number(guestCount) || 1,
          pricingPeriod: targetBooking.pricing_period || targetBooking.pricingPeriod || pricingPeriod,
          pricingBasis: targetBooking.pricing_basis || targetBooking.pricingBasis || pricingBasis,
          days: Number(targetBooking.extended_days_count) || (days ? Number(days) : undefined),
          months: months ? Number(months) : undefined,
          sessions: sessions ? Number(sessions) : undefined,
          quantity: quantity ? Number(quantity) : undefined,
          promoCode,
          customRate: customRate ? Number(customRate) : undefined,
        });
        totalAmountNGN = authoritativePricing.totalAmountNGN;
      } else {
        totalAmountNGN = Number(targetBooking.total_amount);
      }
      // Generate Unique Merchant Reference per SZND specification: OFIS-SZND-...
      const cleanSuffix = String(targetBooking.id).replace(/[^a-zA-Z0-9_-]/g, '').slice(-8);
      const ofisReference = `OFIS-SZND-${cleanSuffix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

      // Insert or update pending payment record
      try {
        const { error: pErr } = await supabaseAdmin
          .from('payments')
          .insert({
            booking_id: targetBooking.id,
            user_id: targetBooking.user_id,
            amount: totalAmountNGN,
            currency: 'NGN',
            provider: 'sznd',
            reference: ofisReference,
            status: 'pending',
            metadata: {
              initialized_at: new Date().toISOString(),
            },
          });
        if (pErr) {
          console.warn('[Payments insert note]:', pErr.message);
        }
      } catch (err: any) {
        console.warn('[Payments insert exception]:', err.message);
      }

      // Pre-bind in Database: Update booking with pending reference and authoritative amount
      try {
        const { error: bUpErr } = await supabaseAdmin
          .from('bookings')
          .update({
            payment_reference: ofisReference,
            payment_status: 'pending',
            payment_method: 'sznd',
            total_amount: totalAmountNGN,
          })
          .eq('id', targetBooking.id);
        if (bUpErr) {
          console.warn('[Bookings update note]:', bUpErr.message);
        }
      } catch (err: any) {
        console.warn('[Bookings update exception]:', err.message);
      }

      // Initialize with SZND if credentials are configured
      if (isSzndConfigured()) {
        try {
          const spaceTitle = targetBooking.space_title || targetBooking.space?.title || 'Workspace';
          const defaultCallback = req.headers['x-client-platform'] === 'mobile'
            ? 'ofis://payment/result'
            : `${req.protocol}://${req.get('host')}/?app=1&payment=success&bookingId=${targetBooking.id}&reference=${ofisReference}`;

          const effectiveCallbackUrl = callbackUrl || defaultCallback;

          const szndRes = await initializeSzndCheckout({
            amountNgn: totalAmountNGN,
            reference: ofisReference,
            email: email || targetBooking.user_email || 'coworker@ofis.ng',
            firstName: targetBooking.user_name ? targetBooking.user_name.split(' ')[0] : 'OFIS',
            lastName: targetBooking.user_name ? targetBooking.user_name.split(' ').slice(1).join(' ') || 'Member' : 'Member',
            phone: userPhone || targetBooking.user_phone,
            description: `OFIS Booking: ${spaceTitle}`,
            callbackUrl: effectiveCallbackUrl,
            bookingId: targetBooking.id,
          });

          return res.json({
            success: true,
            provider: 'sznd',
            checkout_link: szndRes.checkoutUrl,
            checkoutUrl: szndRes.checkoutUrl,
            reference: ofisReference,
            access_code: szndRes.data?.access_code || null,
            amount: totalAmountNGN,
            currency: 'NGN',
            bookingId: targetBooking.id,
            sandbox: false,
          });
        } catch (szndErr: any) {
          const config = getSzndConfig();
          console.warn('[SZND gateway note]: Direct initialization notice:', szndErr.message);

          // Bridge to active upstream payment gateway to ensure a valid checkout session
          try {
            const bridgePayload = {
              bookingId: targetBooking.id,
              spaceId: targetBooking.space_id || targetBooking.space?.id || spaceId,
              email: email || targetBooking.user_email || 'guest@ofis.ng',
              amount: totalAmountNGN || targetBooking.total_amount || 1000,
            };
            const bridgeRes = await fetch('https://ofis.ng/api/payments/initialize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bridgePayload),
            });
            const bridgeData = await bridgeRes.json().catch(() => ({}));
            console.log('[SZND bridge response]:', bridgeRes.status, bridgeData);
            if (bridgeData?.success && (bridgeData?.checkout_link || bridgeData?.checkoutUrl)) {
              const directLink = bridgeData.checkout_link || bridgeData.checkoutUrl;
              return res.json({
                success: true,
                provider: 'sznd',
                checkout_link: directLink,
                checkoutUrl: directLink,
                reference: bridgeData.reference || ofisReference,
                access_code: bridgeData.access_code || ofisReference,
                amount: totalAmountNGN,
                currency: 'NGN',
                bookingId: targetBooking.id,
                sandbox: true,
              });
            }
          } catch (bridgeErr: any) {
            console.warn('[SZND bridge notice]:', bridgeErr?.message || bridgeErr);
          }

          return res.status(502).json({
            error: `SZND payment gateway error: ${szndErr.message || 'Initialization failed'}. Please verify SZND_API_KEY in environment variables.`,
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
        reference: ofisReference,
        checkout_link: null,
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

      // Dual-reference mapping support:
      // Caller can pass either pre-bound OFIS-SZND-... merchant reference OR internal SZND transaction reference (e.g., 908A200A594675B2)
      const preBoundRef = booking.payment_reference;
      const isInternalSzndRef = reference !== preBoundRef;

      // Idempotency: If already confirmed with either reference, return idempotent success
      if (
        (booking.booking_status === 'confirmed' || booking.status === 'confirmed') &&
        (booking.payment_reference === reference || booking.payment_status === 'paid')
      ) {
        return res.json({
          success: true,
          booking,
          alreadyConfirmed: true,
          message: 'Booking is already confirmed for this payment reference',
        });
      }

      let verifiedNgn = Number(booking.total_amount);
      let szndTransactionRef: string | null = isInternalSzndRef ? reference : null;

      // If SZND is configured, perform server-authoritative transaction verification against SZND
      if (isSzndConfigured()) {
        try {
          // Verify with provided reference (could be merchant reference or SZND gateway reference)
          let verifyData = await verifySzndTransaction(reference);
          let txStatus = (
            verifyData.status ||
            verifyData.data?.status ||
            verifyData.state ||
            ''
          ).toLowerCase();

          // If verify with reference failed and we have preBoundRef, try verifying with preBoundRef
          if (txStatus !== 'success' && txStatus !== 'completed' && txStatus !== 'paid' && preBoundRef && preBoundRef !== reference) {
            try {
              const fallbackData = await verifySzndTransaction(preBoundRef);
              const fallbackStatus = (fallbackData.status || fallbackData.data?.status || fallbackData.state || '').toLowerCase();
              if (fallbackStatus === 'success' || fallbackStatus === 'completed' || fallbackStatus === 'paid') {
                verifyData = fallbackData;
                txStatus = fallbackStatus;
              }
            } catch {}
          }

          if (txStatus !== 'success' && txStatus !== 'completed' && txStatus !== 'paid') {
            return res.status(400).json({
              error: verifyData.message || verifyData.data?.gateway_response || 'Payment verification failed at SZND gateway',
            });
          }

          // In SZND's documentation, 'amount' is always in kobo (subunits: ₦1 = 100 kobo).
          verifiedNgn = verifyData.amount_ngn != null
            ? Math.round(Number(verifyData.amount_ngn))
            : Math.round(Number(verifyData.amount || verifyData.data?.amount || 0) / 100);

          if (verifiedNgn !== Number(booking.total_amount)) {
            return res.status(400).json({
              error: `Payment amount mismatch: received ${verifiedNgn} NGN, expected ${booking.total_amount} NGN`,
            });
          }

          // Capture the gateway internal reference if present
          szndTransactionRef = verifyData.reference || verifyData.data?.reference || verifyData.transaction_reference || szndTransactionRef;
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

      // Cross-booking reference collision check (Fraud Prevention):
      // Ensure neither the incoming reference nor the pre-bound reference is already assigned to a DIFFERENT booking.
      const candidateRefs = Array.from(new Set([reference, preBoundRef, szndTransactionRef].filter(Boolean) as string[]));
      
      const { data: conflictingBookings } = await supabaseAdmin
        .from('bookings')
        .select('id, payment_reference, payment_status')
        .in('payment_reference', candidateRefs)
        .neq('id', bookingId)
        .limit(1);

      if (conflictingBookings && conflictingBookings.length > 0) {
        return res.status(409).json({
          success: false,
          code: 'REFERENCE_COLLISION',
          error: `Fraud prevention: Reference "${reference}" is already bound to another booking ("${conflictingBookings[0].id}").`,
        });
      }

      const { data: conflictingPayments } = await supabaseAdmin
        .from('payments')
        .select('booking_id, reference')
        .in('reference', candidateRefs)
        .neq('booking_id', bookingId)
        .limit(1);

      if (conflictingPayments && conflictingPayments.length > 0) {
        return res.status(409).json({
          success: false,
          code: 'PAYMENT_REFERENCE_REUSE',
          error: `Fraud prevention: Payment reference was already recorded for booking "${conflictingPayments[0].booking_id}".`,
        });
      }

      // Confirm booking payment in database via authoritative atomic RPC (pre-bound reference)
      const authoritativeRef = preBoundRef || reference;
      const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc('confirm_booking_payment', {
        p_booking_id: bookingId,
        p_transaction_reference: authoritativeRef,
        p_provider: 'sznd',
        p_amount: verifiedNgn,
        p_metadata: {
          booking_id: bookingId,
          gateway: 'sznd',
          sznd_transaction_reference: szndTransactionRef,
          verified_at: new Date().toISOString(),
          verification_path: 'server_api_verify',
        },
      });

      // Handle concurrency conflict or failure returned by RPC
      if (rpcResult && rpcResult.success === false) {
        if (rpcResult.code === 'SLOT_UNAVAILABLE') {
          return res.status(409).json({
            success: false,
            code: 'SLOT_UNAVAILABLE',
            error: 'This time slot is no longer available. Please choose another available time.',
          });
        }
        return res.status(400).json({
          success: false,
          code: rpcResult.code || 'CONFIRMATION_FAILED',
          error: rpcResult.error || 'Failed to confirm booking',
        });
      }

      if (rpcErr) {
        console.error('[confirm_booking_payment error]:', rpcErr.message);
        return res.status(500).json({
          success: false,
          error: 'Database error executing booking confirmation transaction',
        });
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

      // Confirm booking payment in database via authoritative atomic RPC
      const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc('confirm_booking_payment', {
        p_booking_id: targetBooking.id,
        p_transaction_reference: reference,
        p_provider: 'sznd',
        p_amount: Number(targetBooking.total_amount),
        p_metadata: {
          verified_at: new Date().toISOString(),
          verification_path: 'server_api_verify_get',
        },
      });

      // Handle concurrency conflict or failure returned by RPC
      if (rpcResult && rpcResult.success === false) {
        if (rpcResult.code === 'SLOT_UNAVAILABLE') {
          return res.status(409).json({
            success: false,
            code: 'SLOT_UNAVAILABLE',
            error: 'This time slot is no longer available. Please choose another available time.',
          });
        }
        return res.status(400).json({
          success: false,
          code: rpcResult.code || 'CONFIRMATION_FAILED',
          error: rpcResult.error || 'Failed to confirm booking',
        });
      }

      if (rpcErr) {
        console.error('[confirm_booking_payment GET error]:', rpcErr.message);
        return res.status(500).json({
          success: false,
          error: 'Database error executing booking confirmation transaction',
        });
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
  app.post(['/api/payments/webhook', '/api/payments/sznd/webhook', '/api/webhooks/sznd', '/api/webhook/sznd'], async (req, res) => {
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
      const metadata = eventData.metadata || event.metadata || {};
      const bookingId = metadata.booking_id;
      const eventId = event.id || eventData.id || `${reference}_${Date.now()}`;

      if (!bookingId) {
        return res.status(400).json({ error: 'SZND gateway transaction metadata does not contain a booking_id.' });
      }

      if (!reference) {
        return res.status(400).json({ error: 'Missing payment reference in webhook payload.' });
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

        // Idempotency: If booking is already paid/confirmed, immediately respond 200 OK
        if (booking.payment_status === 'paid' && (booking.booking_status === 'confirmed' || booking.status === 'confirmed')) {
          return res.status(200).json({ status: 'ok', already_confirmed: true, message: 'Booking already confirmed' });
        }

        // In SZND's documentation, 'amount' is always in kobo (subunits: ₦1 = 100 kobo).
        const paidAmount = eventData.amount_ngn != null
          ? Math.round(Number(eventData.amount_ngn))
          : Math.round(Number(eventData.amount || 0) / 100);

        if (paidAmount < Number(booking.total_amount)) {
          console.warn(`[Webhook] Amount mismatch: received ${paidAmount}, expected ${booking.total_amount}`);
          return res.status(400).json({ error: 'Payment amount mismatch' });
        }

        // Authoritative transaction reference: match pre-bound merchant ref or incoming reference
        const authoritativeRef = booking.payment_reference || reference;
        const szndTxRef = reference !== authoritativeRef ? reference : null;

        // Invoke confirm_booking_payment RPC atomically
        const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc('confirm_booking_payment', {
          p_booking_id: targetBookingId,
          p_transaction_reference: authoritativeRef,
          p_provider: 'sznd',
          p_amount: paidAmount,
          p_metadata: {
            webhook_event_id: eventId,
            verified_via: 'sznd_webhook',
            sznd_transaction_reference: szndTxRef,
            received_at: new Date().toISOString(),
          },
        });

        // Concurrency conflict check: A concurrency conflict MUST NOT be overwritten by a fallback confirmation.
        if (rpcResult && rpcResult.success === false) {
          console.warn(`[Webhook] Booking confirmation rejected by RPC for ${targetBookingId}:`, rpcResult);
          return res.status(409).json({
            error: 'Booking slot unavailable or already taken',
            code: rpcResult.code || 'SLOT_UNAVAILABLE',
            details: rpcResult.error,
          });
        }

        if (rpcErr) {
          console.error('[Webhook confirm_booking_payment RPC error]:', rpcErr.message);
          return res.status(500).json({ error: 'Database error executing booking confirmation transaction' });
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
  // CLOUD FUNCTION TRIGGER SIMULATION: ON SIGNUP PROFILE CREATION
  // ============================================================================
  app.post('/api/functions/create-profile', async (req, res) => {
    try {
      const { uid: bodyUid, id: bodyId, name, email, phone, role, company, avatar, isEmailVerified } = req.body;
      const uid = bodyUid || bodyId;

      if (!uid) {
        return res.status(400).json({ success: false, error: 'User UID is required' });
      }

      console.log(`[Cloud Function: onUserSignup] Creating matching profile document for UID: ${uid}`);

      const profilePayload = {
        id: uid,
        name: (name || email?.split('@')[0] || 'OFIS Member').trim(),
        email: (email || '').trim().toLowerCase(),
        phone: (phone || '+234 800 000 0000').trim(),
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        role: role === 'host' ? 'host' : 'user',
        company: (company || (role === 'host' ? 'OFIS Workspace Host' : 'Independent Professional')).trim(),
        bio: role === 'host' ? 'Verified Workspace Host on OFIS network.' : 'OFIS verified remote professional.',
        walletBalanceNgn: role === 'user' ? 25000 : 150000,
        savedSpaceIds: [],
        isEmailVerified: Boolean(isEmailVerified),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Also ensure profile exists in Supabase users table if connected
      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from('profiles').upsert({
            id: uid,
            name: profilePayload.name,
            email: profilePayload.email,
            phone: profilePayload.phone,
            role: profilePayload.role,
            company: profilePayload.company,
            avatar_url: profilePayload.avatar,
            created_at: profilePayload.createdAt,
            updated_at: profilePayload.updatedAt,
          }, { onConflict: 'id' });
        } catch (sErr: any) {
          console.warn('[Cloud Function] Supabase profile sync notice:', sErr?.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Profile initialized successfully for UID: ${uid}`,
        profile: profilePayload,
      });
    } catch (err: any) {
      console.error('[Cloud Function: onUserSignup Error]:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to initialize profile document' });
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
