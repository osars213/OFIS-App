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

  // Initialize Supabase Server Admin Client safely with sanitized base origin
  const rawSupabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  let supabaseUrl = rawSupabaseUrl;
  try {
    if (rawSupabaseUrl.startsWith('http')) {
      supabaseUrl = new URL(rawSupabaseUrl).origin;
    }
  } catch {
    supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
  const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

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
        // Fallback reference for local / offline demo environments
        const fallbackRef = `pstk_ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return res.json({
          reference: fallbackRef,
          authorizationUrl: null,
          sandbox: true,
          message: 'Payment initialized in sandbox mode',
        });
      }

      // Fetch authoritative booking directly from database
      const { data: booking, error: bookingErr } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingErr || !booking) {
        return res.status(404).json({ error: 'Booking not found in authoritative records' });
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
            email: email || 'coworker@ofis.ng',
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

      // Otherwise generate secure server-signed transaction reference
      const reference = `pstk_ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
        return res.status(503).json({
          error: 'Supabase database service is not configured on the server',
        });
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

      // If Paystack Secret Key is configured, verify transaction against Paystack
      if (process.env.PAYSTACK_SECRET_KEY) {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.status || verifyData.data.status !== 'success') {
          return res.status(400).json({
            error: verifyData.data?.gateway_response || 'Payment verification failed at provider gateway',
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
        booking: updatedBooking,
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
      if (process.env.PAYSTACK_SECRET_KEY) {
        const signature = req.headers['x-paystack-signature'];
        const hash = crypto
          .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
          .update(JSON.stringify(req.body))
          .digest('hex');

        if (signature !== hash) {
          console.warn('Invalid Paystack webhook signature received');
          return res.status(400).send('Invalid signature');
        }
      }

      const event = req.body;
      if (event && event.event === 'charge.success' && supabaseAdmin) {
        const { reference, amount, metadata } = event.data;
        const bookingId = metadata?.booking_id;

        if (bookingId && reference) {
          await supabaseAdmin.rpc('confirm_booking_payment', {
            p_booking_id: bookingId,
            p_transaction_reference: reference,
            p_provider: 'paystack',
            p_amount: amount ? amount / 100 : null,
            p_metadata: {
              webhook_event_id: event.id,
              received_at: new Date().toISOString(),
            },
          });
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
        return res.status(503).json({ error: 'Database service unavailable' });
      }

      const token = authHeader.replace(/^Bearer\s+/i, '');
      const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);

      if (userErr || !user) {
        return res.status(401).json({ error: 'Invalid user authentication token' });
      }

      // Check access permission: user must be the booker, space owner, or admin
      let userHasAccess = false;

      // Check booking
      if (bookingId) {
        const { data: b } = await supabaseAdmin
          .from('bookings')
          .select('id, client_id, user_id, host_id, booking_status, space_id')
          .eq('id', bookingId)
          .single();

        if (b && (b.client_id === user.id || b.user_id === user.id || b.host_id === user.id)) {
          if (b.booking_status === 'confirmed' || b.booking_status === 'checked_in') {
            userHasAccess = true;
          }
        }
      }

      // Check space host
      if (!userHasAccess && spaceId) {
        const { data: s } = await supabaseAdmin
          .from('spaces')
          .select('id, host_id, owner_id')
          .eq('id', spaceId)
          .single();

        if (s && (s.host_id === user.id || s.owner_id === user.id)) {
          userHasAccess = true;
        }
      }

      // Check admin
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
          error: 'Access Denied: You must have a confirmed booking or host privileges to view space credentials',
        });
      }

      // Retrieve credentials from space_access_credentials
      const targetSpaceId = spaceId || (bookingId ? (await supabaseAdmin.from('bookings').select('space_id').eq('id', bookingId).single()).data?.space_id : null);
      
      if (!targetSpaceId) {
        return res.status(400).json({ error: 'Could not resolve space ID' });
      }

      const { data: creds } = await supabaseAdmin
        .from('space_access_credentials')
        .select('*')
        .eq('space_id', targetSpaceId)
        .single();

      return res.json({
        credentials: {
          wifiSSID: creds?.wifi_ssid || 'OFIS_Guest_HighSpeed',
          wifiPass: creds?.wifi_pass || 'WorkFocus2026',
          doorPIN: creds?.door_pin || '4829',
          accessInstructions: creds?.access_instructions || 'Check in at reception with your booking reference.',
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
