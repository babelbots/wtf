import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key" });

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
              text: "Analyze this image containing a CrossFit workout (WOD). Transcribe the text and extract the title, the type (e.g. AMRAP, EMOM, For Time, Heavy Day), the strength part (if any), the metcon part, and the time cap (if any), as well as any extra notes. Return ONLY a JSON object with this exact structure: {\"title\": \"string\", \"type\": \"string\", \"strength\": \"string\", \"metcon\": \"string\", \"timeCap\": \"string\", \"notes\": \"string\"}. Do not include markdown blocks or any other text."
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

    res.status(200).json(parsed);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
