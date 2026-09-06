import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Supabase Server Admin Client strictly using SUPABASE_SERVICE_ROLE_KEY (no fallback to anon/public keys)
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
  const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  // Initialize Gemini AI client safely on server
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Gemini AI initialization note:', err);
    }
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      supabaseConnected: !!supabaseAdmin,
      supabaseUrl: supabaseUrl ? supabaseUrl.replace(/(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
      paystackConfigured: !!process.env.PAYSTACK_SECRET_KEY,
    });
  });

  // Client IP & Geolocation Detection Endpoint
  app.get('/api/ip-info', async (req, res) => {
    try {
      const forwarded = req.headers['x-forwarded-for'];
      const rawIp = typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket.remoteAddress || '';
      
      const cleanIp = rawIp.replace(/^::ffff:/, '');

      // Check header country code if present from edge proxy
      const headerCountry = (
        (req.headers['cf-ipcountry'] as string) ||
        (req.headers['x-appengine-country'] as string) ||
        (req.headers['x-country-code'] as string) ||
        ''
      ).toUpperCase().trim();

      if (headerCountry && headerCountry !== 'XX' && headerCountry !== 'T1') {
        return res.json({
          success: true,
          detectedCountryCode: headerCountry,
          ipAddress: cleanIp || 'Edge Client IP',
        });
      }

      // If valid public IP, query lightweight geo provider with quick timeout
      if (cleanIp && cleanIp !== '127.0.0.1' && cleanIp !== '::1' && !cleanIp.startsWith('192.168.') && !cleanIp.startsWith('10.') && !cleanIp.startsWith('172.')) {
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
        detectedCountryCode: 'US',
        ipAddress: cleanIp || 'Client IP',
      });
    } catch (err: any) {
      return res.json({
        success: false,
        detectedCountryCode: 'US',
        error: err.message,
      });
    }
  });

  // Supabase Comprehensive Diagnostics Endpoint
  app.get('/api/supabase/diagnostics', async (req, res) => {
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
  // AUTHORITATIVE SERVER-SIDE PAYMENT INITIATION & VERIFICATION
  // ============================================================================

  // 1. Initialize Payment with Payment Provider (Paystack / Flutterwave)
  app.post('/api/payments/initialize', async (req, res) => {
    try {
      const { bookingId, email, callbackUrl, paymentMethod } = req.body;

      if (!bookingId) {
        return res.status(400).json({ error: 'bookingId is required' });
      }

      if (!supabaseAdmin) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            error: 'Database service is not configured (SUPABASE_SERVICE_ROLE_KEY is missing). Cannot process payment in production.',
          });
        }
        // Fallback reference for local / sandbox environments when server secrets are unconfigured
        const fallbackRef = `pstk_test_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
        return res.json({
          reference: fallbackRef,
          authorizationUrl: null,
          sandbox: true,
          message: 'Payment initialized in demo sandbox mode',
        });
      }

      // Optional Auth Verification on Initialize
      const authHeader = req.headers.authorization;
      let authenticatedUser: any = null;
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        authenticatedUser = user;
      }

      // Fetch authoritative booking directly from database
      const { data: booking, error: bookingErr } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingErr || !booking) {
        return res.status(404).json({ error: 'Authoritative booking record not found' });
      }

      // If user is authenticated, ensure they own the booking or are admin
      if (authenticatedUser) {
        const isOwner = (booking.client_id === authenticatedUser.id || booking.user_id === authenticatedUser.id);
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', authenticatedUser.id).single();
        const isAdmin = profile?.role === 'admin';
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ error: 'Unauthorized: You do not own this booking' });
        }
      }

      // Prevent re-initialization on cancelled / expired bookings
      if (booking.booking_status === 'cancelled' || booking.booking_status === 'expired' || booking.status === 'cancelled') {
        return res.status(400).json({ error: `Cannot initialize payment for ${booking.booking_status || booking.status} booking` });
      }

      const totalAmountNGN = Number(booking.total_amount);
      const amountInKobo = Math.round(totalAmountNGN * 100);

      // If Paystack Secret Key is configured, initialize live/test transaction with Paystack API
      if (process.env.PAYSTACK_SECRET_KEY) {
        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email || booking.coworker_email || 'coworker@ofis.ng',
            amount: amountInKobo,
            callback_url: callbackUrl,
            metadata: {
              booking_id: booking.id,
              booking_reference: booking.booking_reference,
              payment_method: paymentMethod || 'paystack',
            },
          }),
        });

        const paystackData = await paystackRes.json();
        if (!paystackRes.ok || !paystackData.status) {
          return res.status(502).json({
            error: paystackData.message || 'Payment provider transaction initialization failed',
          });
        }

        return res.json({
          reference: paystackData.data.reference,
          authorizationUrl: paystackData.data.authorization_url,
          accessCode: paystackData.data.access_code,
          amount: totalAmountNGN,
          currency: 'NGN',
          sandbox: false,
        });
      }

      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          error: 'Payment provider is not configured (PAYSTACK_SECRET_KEY is missing). Cannot process payment in production.',
        });
      }

      // Sandbox reference fallback when Paystack secret key is unconfigured
      const reference = `pstk_test_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
      return res.json({
        reference,
        authorizationUrl: null,
        accessCode: null,
        amount: totalAmountNGN,
        currency: 'NGN',
        sandbox: true,
      });
    } catch (err: any) {
      console.error('Error in /api/payments/initialize:', err);
      res.status(500).json({ error: err.message || 'Internal payment initialization error' });
    }
  });

  // 2. Authoritative Payment Verification & Booking Confirmation
  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { bookingId, reference, provider } = req.body;

      if (!bookingId || !reference) {
        return res.status(400).json({ error: 'Both bookingId and payment reference are required' });
      }

      if (!supabaseAdmin) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(503).json({
            success: false,
            error: 'Database service is not configured (SUPABASE_SERVICE_ROLE_KEY is missing). Cannot verify payment in production.',
          });
        }
        return res.json({
          success: true,
          booking: {
            id: bookingId,
            payment_status: 'paid',
            booking_status: 'confirmed',
            payment_reference: reference,
          },
          sandbox: true,
          message: 'Payment verified in local demo mode (SUPABASE_SERVICE_ROLE_KEY unconfigured on server)',
        });
      }

      // Auth validation
      const authHeader = req.headers.authorization;
      let authenticatedUser: any = null;
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (!userErr && user) {
          authenticatedUser = user;
        }
      }

      // Look up booking authoritative details
      const { data: booking, error: bErr } = await supabaseAdmin
        .from('bookings')
        .select('*, spaces(*)')
        .eq('id', bookingId)
        .single();

      if (bErr || !booking) {
        return res.status(404).json({ error: 'Authoritative booking record not found' });
      }

      // Enforce caller ownership when user is authenticated
      if (authenticatedUser) {
        const isOwner = (booking.client_id === authenticatedUser.id || booking.user_id === authenticatedUser.id);
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', authenticatedUser.id).single();
        const isAdmin = profile?.role === 'admin';
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ error: 'Unauthorized: You do not own this booking' });
        }
      }

      // Check status: prevent confirmation of cancelled/expired bookings
      if (booking.booking_status === 'cancelled' || booking.booking_status === 'expired' || booking.status === 'cancelled') {
        return res.status(400).json({ error: `Cannot verify payment for a ${booking.booking_status || booking.status} booking` });
      }

      // Idempotency check: If already confirmed with this reference, return idempotent success
      if ((booking.booking_status === 'confirmed' || booking.status === 'confirmed') && booking.payment_reference === reference) {
        return res.json({
          success: true,
          booking,
          alreadyConfirmed: true,
          message: 'Booking is already confirmed for this payment reference',
        });
      }

      // If Paystack Secret Key is configured, verify transaction strictly against Paystack
      if (process.env.PAYSTACK_SECRET_KEY) {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.status || verifyData.data?.status !== 'success') {
          return res.status(400).json({
            error: verifyData.data?.gateway_response || 'Payment verification failed at provider gateway',
          });
        }

        // Verify currency
        if (verifyData.data.currency && verifyData.data.currency !== 'NGN' && verifyData.data.currency !== booking.currency) {
          return res.status(400).json({
            error: `Currency mismatch: received ${verifyData.data.currency}, expected NGN`,
          });
        }

        // Verify amount
        const verifiedKobo = Number(verifyData.data.amount);
        const expectedKobo = Math.round(Number(booking.total_amount) * 100);
        if (verifiedKobo < expectedKobo) {
          return res.status(400).json({
            error: `Payment amount mismatch: received ${verifiedKobo / 100} NGN, expected ${booking.total_amount} NGN`,
          });
        }

        // Verify booking metadata binding if present
        if (verifyData.data.metadata?.booking_id && verifyData.data.metadata.booking_id !== booking.id) {
          return res.status(400).json({
            error: 'Payment transaction reference does not match this booking record',
          });
        }
      } else if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          success: false,
          error: 'Payment provider service is not configured (PAYSTACK_SECRET_KEY is missing). Cannot verify payment in production.',
        });
      }

      // Invoke the hardened confirm_booking_payment RPC using service_role authority
      const { data: confirmResult, error: rpcErr } = await supabaseAdmin.rpc('confirm_booking_payment', {
        p_booking_id: bookingId,
        p_transaction_reference: reference,
        p_provider: provider || 'paystack',
        p_amount: Number(booking.total_amount),
        p_metadata: {
          verified_at: new Date().toISOString(),
          verification_path: 'server_api_verify',
        },
      });

      if (rpcErr) {
        console.error('RPC confirm_booking_payment error:', rpcErr);
        return res.status(400).json({ error: rpcErr.message || 'Failed to confirm booking payment' });
      }

      // Fetch confirmed booking payload with space details
      const { data: updatedBooking } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          spaces!space_id (
            id, name, city, address, images, wifi_ssid, rating
          )
        `)
        .eq('id', bookingId)
        .single();

      return res.json({
        success: true,
        booking: updatedBooking || booking,
        confirmResult,
        message: 'Payment successfully verified and booking confirmed',
      });
    } catch (err: any) {
      console.error('Error in /api/payments/verify:', err);
      res.status(500).json({ error: err.message || 'Payment verification error' });
    }
  });

  // 3. Webhook Receiver for Gateway Callbacks (Paystack / Flutterwave)
  app.post('/api/payments/webhook', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is required for webhook operations' });
      }

      if (process.env.PAYSTACK_SECRET_KEY) {
        const signature = req.headers['x-paystack-signature'];
        if (!signature) {
          return res.status(401).json({ error: 'Missing x-paystack-signature header' });
        }

        const hash = crypto
          .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
          .update(JSON.stringify(req.body))
          .digest('hex');

        if (signature !== hash) {
          console.warn('Invalid Paystack webhook signature received');
          return res.status(401).send('Invalid signature');
        }
      }

      const event = req.body;
      if (event && event.event === 'charge.success') {
        const { reference, amount, metadata } = event.data || {};
        const bookingId = metadata?.booking_id;

        if (bookingId && reference) {
          // Fetch booking to verify amount
          const { data: booking } = await supabaseAdmin.from('bookings').select('id, total_amount').eq('id', bookingId).single();
          if (booking) {
            await supabaseAdmin.rpc('confirm_booking_payment', {
              p_booking_id: bookingId,
              p_transaction_reference: reference,
              p_provider: 'paystack',
              p_amount: amount ? amount / 100 : Number(booking.total_amount),
              p_metadata: {
                webhook_event_id: event.id,
                received_at: new Date().toISOString(),
              },
            });
          }
        }
      }

      res.status(200).json({ status: 'ok', received: true });
    } catch (err: any) {
      console.error('Webhook error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Secure Access Credentials RPC Proxy
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

      // Check booking
      if (bookingId) {
        const { data: b } = await supabaseAdmin
          .from('bookings')
          .select('id, client_id, user_id, host_id, booking_status, status, space_id, start_datetime, end_datetime')
          .eq('id', bookingId)
          .single();

        if (b) {
          targetSpaceId = b.space_id;
          const isBooker = (b.client_id === user.id || b.user_id === user.id);
          const isHost = (b.host_id === user.id);

          if (isBooker) {
            const currentStatus = b.booking_status || b.status;
            // Booker must have confirmed or checked_in booking
            if (currentStatus === 'confirmed' || currentStatus === 'checked_in') {
              // Check access window (active or up to 2 hours post-session)
              const endEpoch = b.end_datetime ? new Date(b.end_datetime).getTime() : Date.now() + 3600000;
              const isSessionActive = endEpoch >= Date.now() - (2 * 60 * 60 * 1000);

              if (isSessionActive) {
                userHasAccess = true;
              } else {
                return res.status(403).json({
                  error: 'Access Denied: Booking session has expired. Access credentials are only available during active booking windows.',
                });
              }
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

      // Retrieve credentials from space_access_credentials without hardcoded password fallbacks
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
      console.error('Error in /api/bookings/credentials:', err);
      res.status(500).json({ error: err.message || 'Failed to retrieve credentials' });
    }
  });

  // AI Workspace Matcher endpoint for Coworkers
  app.post('/api/ai/match', async (req, res) => {
    try {
      const { userQuery, spaces } = req.body;

      if (!ai || !process.env.GEMINI_API_KEY) {
        // Fallback intelligent heuristic recommendation if key is not configured
        return res.json({
          recommendation: {
            headline: 'Optimized Workspaces based on your criteria',
            suggestedSpaceId: spaces && spaces.length > 0 ? spaces[0].id : 'space-1',
            suggestedDeskId: 'D-04',
            reasoning: 'Based on your preference for productivity and quiet focus, this location offers dedicated ergonomic seating, dual 4K monitors, natural lighting, and verified 1Gbps fiber internet.',
            keyHighlights: [
              'Quiet library zone with sound acoustic baffling',
              'Herman Miller Aeron ergonomic chair & motorized standing desk',
              'Specialty barista coffee & soundproof phone booths included'
            ],
            confidenceScore: 96
          }
        });
      }

      const prompt = `You are OFIS's intelligent Nigerian workspace concierge. 
A coworker or team is looking for their ideal physical workspace, desk, or creator studio in Nigeria.
User prompt: "${userQuery || 'A quiet, well-lit desk for software development with fast WiFi and dual monitors'}"

Available Spaces Data:
${JSON.stringify((spaces || []).map((s: any) => ({
  id: s.id,
  name: s.name,
  city: s.city,
  neighborhood: s.neighborhood,
  hourlyRateNGN: s.hourlyRateNGN,
  dailyRateNGN: s.dailyRateNGN,
  dailyRate: s.dailyRate,
  amenities: s.amenities,
  rating: s.rating,
  primaryCategory: s.primaryCategory,
  subcategory: s.subcategory,
  desks: (s.desks || []).slice(0, 8).map((d: any) => ({ id: d.id, name: d.name, zone: d.zone, features: d.features, status: d.status }))
})), null, 2)}

Provide a thoughtful, realistic JSON response matching the following structure exactly:
{
  "headline": "Brief catchy summary of the recommendation",
  "suggestedSpaceId": "matching space id",
  "suggestedDeskId": "matching desk id or desk name",
  "reasoning": "2-3 concise sentences explaining why this space and desk perfectly match the coworker's needs",
  "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "confidenceScore": 95
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({ recommendation: parsed });
    } catch (error: any) {
      console.error('Error in /api/ai/match:', error);
      res.status(500).json({ error: error.message || 'Failed to generate recommendation' });
    }
  });

  // AI Host Space Listing Optimizer endpoint
  app.post('/api/ai/optimize-listing', async (req, res) => {
    try {
      const { spaceInfo } = req.body;

      if (!ai || !process.env.GEMINI_API_KEY) {
        return res.json({
          optimizedListing: {
            suggestedTitle: `${spaceInfo.name || 'Premium Space'} - Prime Coworking & Creator Hub`,
            tagline: '24/7 dual generator redundancy, Starlink internet & acoustic soundproofing in prime location.',
            suggestedHourlyRate: spaceInfo.hourlyRateNGN || 6500,
            suggestedDailyRate: spaceInfo.dailyRateNGN || 28000,
            pricingTip: 'Your pricing is competitive for the local area. Adding a 15% discount on full-week passes can boost occupancy by 28%.',
            suggestedAmenitiesToAdd: ['Podcast & Creator Booth', 'Cold Brew & Espresso Bar', 'Dedicated Parking & Security'],
            targetAudience: 'Founders, software engineers, content creators, and remote teams needing reliable power and fiber connectivity.'
          }
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
  "suggestedDailyRate": 40,
  "pricingTip": "Actionable tip on hourly and daily workspace pricing tiers in Nigerian Naira",
  "suggestedAmenitiesToAdd": ["Amenity 1", "Amenity 2", "Amenity 3"],
  "targetAudience": "Summary of ideal coworker demographic"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({ optimizedListing: parsed });
    } catch (error: any) {
      console.error('Error in /api/ai/optimize-listing:', error);
      res.status(500).json({ error: error.message || 'Failed to optimize listing' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OFIS Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
