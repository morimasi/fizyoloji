
import { getAI } from "./ai-core.ts";
import { GoogleGenAI } from "@google/genai";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE
 * Models: gemini-2.5-flash-image, veo-3.1-fast-generate-preview
 */

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = getAI();
  const totalFrames = 16;
  
  const fullPrompt = `
    MEDICAL 3D RENDER SPRITE SHEET (4x4 GRID).
    SUBJECT: Human anatomy performing "${exercise.titleTr || exercise.title}" in a physiotherapy context.
    STYLE: Professional clinical render, glowing cyan active muscles, deep slate background.
    DESCRIPTION: ${customDirective || exercise.description || ''}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', 
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: { 
      imageConfig: { 
        aspectRatio: "1:1"
      } 
    } 
  });

  const candidates = response.candidates;
  if (candidates?.[0]?.content?.parts) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
          return { url: `data:image/png;base64,${part.inlineData.data}`, frameCount: totalFrames, layout: 'grid-4x4' };
      }
    }
  }
  throw new Error("Görsel üretiminde hata oluştu. Lütfen istemi veya anahtarı kontrol edin.");
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  // Creating a fresh instance for Veo as per guidelines to avoid key race conditions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Professional 3D medical animation showing the "${exercise.titleTr || exercise.title}" exercise movement. Anatomical precision, high resolution, dark background.`;
  
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
    operation = await ai.operations.getVideosOperation({ operation: operation }); 
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return downloadLink ? `${downloadLink}&key=${process.env.API_KEY}` : "";
};

export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate a professional clean clinical SVG illustration (raw code only) for: "${exercise.titleTr || exercise.title}". Avoid markdown blocks.` }] }],
  });
  
  let cleanSvg = response.text || "";
  cleanSvg = cleanSvg.replace(/```svg|```xml|```/gi, '').trim();
  if (!cleanSvg.includes('<svg')) throw new Error("SVG üretilemedi.");
  return cleanSvg;
};
