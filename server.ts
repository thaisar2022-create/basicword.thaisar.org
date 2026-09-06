import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Translation API endpoint using Gemini
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang = 'my' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text to translate is required.' });
      return;
    }

    const client = getAIClient();
    if (!client) {
      res.status(503).json({
        error: 'AI translation service requires GEMINI_API_KEY in the environment.',
        isApiKeyMissing: true,
      });
      return;
    }

    const directionPrompt =
      sourceLang === 'th' && targetLang === 'my'
        ? 'Translate from Thai to Myanmar (Burmese).'
        : sourceLang === 'my' && targetLang === 'th'
        ? 'Translate from Myanmar (Burmese) to Thai.'
        : 'Detect the language (Thai or Myanmar or English) and translate accurately between Thai and Myanmar.';

    const systemInstruction = `You are an expert professional translator specializing in Thai (ภาษาไทย) and Myanmar (မြန်မာဘာသာ).
Your task is to translate the provided text accurately, naturally, and contextually.

${directionPrompt}

Return the response in JSON format matching this schema:
{
  "detectedSource": "Thai" | "Myanmar" | "English" | "Other",
  "targetLanguage": "Myanmar" | "Thai",
  "translatedText": "string (the natural, accurate translation)",
  "phonetic": "string (pronunciation guide for the translated word/phrase in the reader's native script or clear phonetic notation)",
  "romanization": "string (standard Latin/English phonetic reading, e.g. 'sa-wat-dee' or 'min-ga-la-ba')",
  "partOfSpeech": "string (noun, verb, adjective, phrase, etc., optional)",
  "meaningExplanation": "string (brief nuance or cultural usage in Myanmar and/or Thai)",
  "breakdown": [
    {
      "original": "part of original word/phrase",
      "translated": "corresponding translation",
      "meaning": "meaning"
    }
  ],
  "examples": [
    {
      "source": "example sentence in source language",
      "translation": "example translation in target language",
      "phonetic": "phonetic reading"
    }
  ]
}
Return only valid JSON. Do not include markdown code block formatting if possible, or standard json markdown blocks.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Translate this text: "${text.trim()}". Provide accurate translation, pronunciation, word breakdown, and practical example.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback cleanup if markdown wrappers are present
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: error?.message || 'Translation failed. Please try again.',
    });
  }
});

async function startServer() {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
