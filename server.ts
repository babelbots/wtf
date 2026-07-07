import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large JSON payloads for base64 images
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.post("/api/transcribe", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing." });
      }

      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No imageBase64 provided." });
      }

      const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
      const base64Data = imageBase64.split(",")[1];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              },
              {
                text: `Analyze this image containing a CrossFit workout (WOD). Transcribe the text and extract the title, the type (e.g. AMRAP, EMOM, For Time, Heavy Day), the strength part (if any), the metcon part, and the time cap (if any), as well as any extra notes. Return ONLY a JSON object with this exact structure: {"title": "string", "type": "string", "strength": "string", "metcon": "string", "timeCap": "string", "notes": "string"}. Do not include markdown blocks or any other text.`
              }
            ]
          }
        ]
      });

      const textResult = response.text;
      if (!textResult) throw new Error("No response from AI");
      
      let parsed = {};
      try {
        const cleaned = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (err) {
         parsed = {
           metcon: textResult
         };
      }

      res.json(parsed);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
