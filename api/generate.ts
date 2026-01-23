
// Fixed the import to use GoogleGenAI and updated the logic to follow coding guidelines.
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Initialization: Always use a named parameter and obtain the API key exclusively from process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const { prompt } = req.body;

    // Call generateImages to generate images with Imagen models; updated to a supported Imagen model name.
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    res.status(200).json(response);
  } catch (err: any) {
    // Implement robust handling for API errors.
    res.status(500).json({ error: err.message });
  }
}
