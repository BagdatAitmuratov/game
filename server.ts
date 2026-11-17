import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'balamind-server' });
  });

  app.post('/api/hint', async (req, res) => {
    const { gameId, level, language, summary } = req.body ?? {};
    if (!gameId || typeof level !== 'number' || !language) {
      return res.status(400).json({ error: 'Missing required fields: gameId, level, language' });
    }

    const langLabel =
      language === 'kk' ? 'Kazakh (Қазақ тілі)' : language === 'ru' ? 'Russian (Русский)' : 'English';

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `You are a friendly, encouraging puzzle coach for kids and teens playing "${String(gameId)}" on Level ${level}.
Current puzzle context: ${typeof summary === 'string' ? summary.slice(0, 500) : 'Standard board'}.
Give ONE short, clear, actionable hint (1-2 sentences max, plain text, no markdown, no spoilers that give away the entire answer unless stuck).
Respond strictly in ${langLabel}.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });

      const hint = response.text?.trim();
      if (!hint) {
        return res.status(502).json({ error: 'Empty hint from Gemini.' });
      }
      return res.json({ hint });
    } catch (error) {
      console.error('Gemini /api/hint error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to generate hint',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BalaMind server listening on http://localhost:${PORT}`);
  });
}

startServer();
