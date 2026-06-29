/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Lazily initialize the Google GenAI SDK to prevent startup crashes if GEMINI_API_KEY is not defined.
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your Settings > Secrets panel.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Robust RSS parsing utility using standard Regular Expressions
async function fetchRssFeed(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const text = await response.text();
    const items: any[] = [];
    
    // Match each <item> block
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g);
    if (!itemMatches) return [];

    for (const itemXml of itemMatches) {
      // Extract title (handle CDATA)
      let title = '';
      const titleCdataMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/);
      if (titleCdataMatch) {
        title = titleCdataMatch[1];
      } else {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
        if (titleMatch) title = titleMatch[1];
      }

      // Extract description (handle CDATA)
      let description = '';
      const descCdataMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
      if (descCdataMatch) {
        description = descCdataMatch[1];
      } else {
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
        if (descMatch) description = descMatch[1];
      }

      // Extract link
      let link = '';
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      if (linkMatch) link = linkMatch[1];

      // Extract pubDate
      let pubDate = '';
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      if (pubDateMatch) pubDate = pubDateMatch[1];

      // Clean up HTML tags and character entities
      title = title.replace(/&lt;.*?&gt;/g, '').replace(/<.*?>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&apos;/g, "'").trim();
      description = description.replace(/&lt;.*?&gt;/g, '').replace(/<.*?>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&apos;/g, "'").trim();

      // Clean up Google News title suffix if present (e.g. " - Times of India")
      title = title.replace(/\s*-\s*Times\s+of\s+India\s*$/i, '');

      if (title) {
        items.push({
          title,
          description: description || 'Select "Read Full Article" for full dispatch data.',
          link,
          pubDate: pubDate ? new Date(pubDate).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : 'RECENT'
        });
      }
      
      if (items.length >= 10) break; // Limit to top 10 articles
    }
    
    return items;
  } catch (error) {
    console.error(`RSS Fetch failed for URL ${url}:`, error);
    return [];
  }
}

// Fallback high-fidelity RSS data
const FALLBACK_NEWS: Record<string, any[]> = {
  technology: [
    {
      title: "ISRO Deploys Advanced Quantum Network Satellite into Medium Earth Orbit",
      description: "Indian Space Research Organisation successfully deploys a prototype quantum communication network node. It aims to secure tactical operations and state database archives across South Asia.",
      link: "https://timesofindia.indiatimes.com/technology",
      pubDate: "29 Jun 2026, 09:14 AM"
    },
    {
      title: "Cyber Security Task Force Dismantles International Phishing Ring Operating from Noida",
      description: "Specialized law enforcement squads raid high-tech hub. Recovered server arrays, deepfake models, and decrypted database notes targeting bank infrastructures across APAC.",
      link: "https://timesofindia.indiatimes.com/technology",
      pubDate: "29 Jun 2026, 07:30 AM"
    },
    {
      title: "Semiconductor Fab in Gujarat Starts Pilot Run of 4nm Tactical Microcontrollers",
      description: "The multi-billion dollar manufacturing site reaches operational milestone. Commences fabrication of hardware modules optimized for vehicle automation and defensive grid telemetry.",
      link: "https://timesofindia.indiatimes.com/technology",
      pubDate: "28 Jun 2026, 03:45 PM"
    }
  ],
  crimes: [
    {
      title: "Noida Police Seize Deepfake Ransomware Vaults Worth ₹140 Crores",
      description: "Specialized digital units execute tactical warrant. Decrypted multiple cold wallets, uncovering ransomware notes used to hold high-profile telecom nodes hostage.",
      link: "https://timesofindia.indiatimes.com/india/crime",
      pubDate: "29 Jun 2026, 08:45 AM"
    },
    {
      title: "CBI Arrests Key Operator of Cyber Heist targeting Sovereign Wealth Fund",
      description: "The prime suspect was arrested trying to exit the country via land border. Recovered 4 cloned physical keys and tactical notebooks outlining upcoming bank database hacks.",
      link: "https://timesofindia.indiatimes.com/india/crime",
      pubDate: "29 Jun 2026, 06:12 AM"
    },
    {
      title: "Gurugram Police Deploy Automated AI Drone Perimeter following Smart-Warehouse Break-in",
      description: "Operative units track organized gang using thermal infrared scopes. Recovered advanced drone equipment and custom transceiver interference modules.",
      link: "https://timesofindia.indiatimes.com/india/crime",
      pubDate: "28 Jun 2026, 11:30 PM"
    }
  ],
  stocks: [
    {
      title: "Nifty Closes Above 24,100 Amid Surging Technology and Infrastructure Inflows",
      description: "Markets display intense momentum. Institutional purchases of domestic semiconductor, defensive aerospace, and logic engineering holdings drive benchmark indices to record territory.",
      link: "https://timesofindia.indiatimes.com/business",
      pubDate: "29 Jun 2026, 04:10 PM"
    },
    {
      title: "Tata Motors Announces Strategic Investment in Solid-State Battery Mainframe Plants",
      description: "Shares rise by 4.2% following the board announcement. The facility will engineer power packs for autonomous tactical defense rigs and commercial logistics.",
      link: "https://timesofindia.indiatimes.com/business",
      pubDate: "29 Jun 2026, 01:25 PM"
    },
    {
      title: "Sovereign Gold Bond Rates Recalibrated Amid Volatile Global Security Index Readings",
      description: "Investors pour capitals into precious metals and security sovereign bonds as market volatility registers higher risk indexes. Analysts recommend defensive positions.",
      link: "https://timesofindia.indiatimes.com/business",
      pubDate: "28 Jun 2026, 12:45 PM"
    }
  ],
  world: [
    {
      title: "Global Green Hydrogen Grid Alliance Standardizes Fuel Cells in New Delhi Meeting",
      description: "Delegates from 48 nations complete standard treaty defining cell pressure limits, toxic gas benchmarks, and global distribution arrays.",
      link: "https://timesofindia.indiatimes.com",
      pubDate: "29 Jun 2026, 10:02 AM"
    },
    {
      title: "G7 Intelligence Nodes Issue Collective Threat Warning Against Advanced Social Engineering Daemons",
      description: "Joint cybersecurity advisory urges database administrators to harden legacy access control protocols, warning of high-speed fully automated model sweeps.",
      link: "https://timesofindia.indiatimes.com",
      pubDate: "29 Jun 2026, 08:15 AM"
    }
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));

  // API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'active', system: 'Vengeance OS', timestamp: new Date().toISOString() });
  });

  // News aggregation endpoint (Times of India & Google News)
  app.get('/api/news', async (req, res) => {
    try {
      const category = (req.query.category as string || 'world').toLowerCase();
      
      // Map categories to Times of India / Google News RSS feeds
      let feedUrl = '';
      if (category === 'technology') {
        feedUrl = 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms';
      } else if (category === 'stocks') {
        feedUrl = 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms';
      } else if (category === 'crimes') {
        feedUrl = 'https://news.google.com/rss/search?q=site:timesofindia.indiatimes.com+crime&hl=en-IN&gl=IN&ceid=IN:en';
      } else {
        feedUrl = 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms';
      }

      console.log(`[Vengeance News] Fetching ${category} feed from: ${feedUrl}`);
      const newsItems = await fetchRssFeed(feedUrl);
      
      if (newsItems && newsItems.length > 0) {
        res.json({ success: true, category, source: 'live', articles: newsItems });
      } else {
        console.log(`[Vengeance News] No items fetched or error occurred. Returning fallback data for: ${category}`);
        res.json({ success: true, category, source: 'fallback', articles: FALLBACK_NEWS[category] || FALLBACK_NEWS['world'] });
      }
    } catch (error: any) {
      console.error('Error in /api/news:', error);
      res.status(500).json({ error: 'Internal Server Error during news fetching.' });
    }
  });

  // Chat endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Invalid messages body. Must be an array of messages.' });
        return;
      }

      const ai = getAIClient();

      // Format messages into contents array expected by @google/genai SDK
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const systemInstruction = `You are the Vengeance OS Tactical Intelligence Unit—an elite, highly advanced crime analysis and strategic planning operating system.
You serve as the analytical core for an elite detective.
- Maintain a highly sophisticated, concise, objective, and analytical tone.
- Avoid cheerful or cliché greeting patterns unless specifically requested. Speak with calculated precision.
- Organize your replies with clean, tactical layouts: use headings, bold points, bullet points, and code blocks for logs.
- When evaluating evidence or theories, outline clear hypotheses, potential loopholes, and strategic logical routes.
- Address the detective as 'Detective', 'Agent', or 'Operator'.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ content: response.text });
    } catch (error: any) {
      console.error('Error in /api/gemini/chat:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error during analysis.' });
    }
  });

  // General Analysis endpoint (summarization, brainstorming, image analysis, note organizer)
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { text, mode, imageBase64, imageMimeType } = req.body;
      const ai = getAIClient();

      let prompt = '';
      switch (mode) {
        case 'summarize':
          prompt = `Summarize the following notes or evidence, extracting critical entities, locations, timelines, and primary clues. Present your findings in a highly structured, tactical intelligence report:\n\n${text}`;
          break;
        case 'hypothesis':
          prompt = `Analyze the following clues and formulate three distinct, viable tactical hypotheses. Grade each hypothesis by probability and identify missing pieces of critical intelligence needed to confirm them:\n\n${text}`;
          break;
        case 'brainstorm':
          prompt = `Brainstorm investigations, action steps, search targets, and logical angles of approach based on this tactical request:\n\n${text}`;
          break;
        case 'explain':
          prompt = `Provide a meticulous, logical breakdown and educational walkthrough of the concepts, techniques, or forensic methodology requested below:\n\n${text}`;
          break;
        default:
          prompt = text || 'Perform a deep intelligence analysis.';
      }

      let contents: any = prompt;

      // Handle image analysis if base64 data is supplied
      if (imageBase64 && imageMimeType) {
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: imageMimeType,
                data: imageBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        };
      }

      const systemInstruction = `You are the Vengeance OS Tactical Intelligence Unit. Analyze the input meticulously. Return structured reports with tactical headers, bullet points, and actionable details.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });

      res.json({ content: response.text });
    } catch (error: any) {
      console.error('Error in /api/gemini/analyze:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error during tactical analysis.' });
    }
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in DEVELOPMENT mode - Mounting Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in PRODUCTION mode - Serving static build files...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vengeance OS] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
