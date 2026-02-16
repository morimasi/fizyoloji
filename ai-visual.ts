
import { getAI } from "./ai-core.ts";
import { GoogleGenAI } from "@google/genai";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE
 * Models: gemini-2.5-flash-image, veo-3.1-fast-generate-preview
 */

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = getAI(); // getAI checks for process.env.API_KEY internally
  const totalFrames = 16;
  
  const fullPrompt = `PROFESSIONAL MEDICAL 3D RENDER SPRITE SHEET (4x4 GRID). SUBJECT: Human anatomy performing "${exercise.titleTr || exercise.title}". STYLE: Clinical neon muscles, dark background.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', 
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: { imageConfig: { aspectRatio: "1:1" } } 
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return { url: `data:image/png;base64,${part.inlineData.data}`, frameCount: totalFrames, layout: 'grid-4x4' };
      }
    }
  }
  throw new Error("Görsel üretilemedi.");
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  // CRITICAL: Fresh instance for Veo models as per guidelines
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Cinematic medical 3D animation: "${exercise.titleTr || exercise.title}" exercise. High resolution, anatomical precision.`;
  
  let operation = await ai.models.generateVideos({ 
    model: 'veo-3.1-fast-generate-preview', 
    prompt, 
    config: { 
      resolution: '720p', 
      aspectRatio: '16:9',
      numberOfVideos: 1
    } 
  });
  
  while (!operation.done) { 
    await new Promise(r => setTimeout(r, 10000)); 
    operation = await ai.operations.getVideosOperation({ operation }); 
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return downloadLink ? `${downloadLink}&key=${apiKey}` : "";
};

export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate minimalist medical SVG XML code for: "${exercise.titleTr || exercise.title}". RETURN RAW SVG ONLY.` }] }],
  });
  
  let cleanSvg = response.text || "";
  return cleanSvg.replace(/```svg|```xml|```/gi, '').trim();
};
