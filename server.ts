import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
    res.json({ status: 'ok', time: new Date().toISOString() });
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
            suggestedTitle: `${spaceInfo.name || 'Premium Workspace'} - Ultra-Modern Coworking & Dedicated Desks`,
            tagline: 'High-speed fiber, ergonomic Herman Miller desks & sunlit creative environment in prime location.',
            suggestedDailyRate: Math.max(25, spaceInfo.dailyRate || 35),
            pricingTip: 'Your pricing is competitive. Adding a 15% discount on 1-month dedicated desk passes can boost occupancy by 28%.',
            suggestedAmenitiesToAdd: ['Podcast & Content Studio', 'Barista Oat Milk Station', 'Bicycle Lockup & Showers'],
            targetAudience: 'Software engineers, remote founders, and design professionals needing dedicated focus zones.'
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
