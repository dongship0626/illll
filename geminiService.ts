
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const refineTaskDescription = async (title: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short, 1-sentence helpful description or action step for a task titled: "${title}".`,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};
