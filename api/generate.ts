import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const { mode, forgePrompt, editPrompt, aspectRatio, imageSize, image } = req.body;

    // ===== FORGE =====
    if (mode === "forge") {
      const identityPrompt = `
INSTRUCTION: You MUST use Google Search to accurately reference any real-world brand logos, crypto project logos (e.g., Solana, Phantom, Ledger), or specific meme templates mentioned in the prompt.

CHARACTER IDENTITY:
A RuggedDev Wojak survivor character.
Extremely crude meme art.
Very thick wobbly black outlines.
Helmet with hand-written "SURVIVOR".

TRAITS:
${forgePrompt}
      `.trim();

      const result = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: { parts: [{ text: identityPrompt }] },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize,
          },
          tools: [{ googleSearch: {} }],
        },
      });

      // IMPORTANT: return raw response
      return res.status(200).json(result);
    }

    // ===== EDIT =====
    if (mode === "edit") {
      const identityLock = `
Modify the input RuggedDev Wojak image.
Identity: Pale face, tired eyes, helmet with 'SURVIVOR'.
EDIT: ${editPrompt}.
Maintain extremely crude meme art style.
      `.trim();

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { inlineData: image },
            { text: identityLock },
          ],
        },
      });

      // IMPORTANT: return raw response
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: "Invalid mode" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
