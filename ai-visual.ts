
import { getAI } from "./ai-core.ts";
import { GoogleGenAI } from "@google/genai";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE
 * Slayt, Video ve 4K Klinik Render
 */

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = getAI();
  const totalFrames = 16;
  
  const fullPrompt = `
    PROFESSIONAL MEDICAL 3D RENDER SPRITE SHEET (4x4 GRID). 
    FOR CLINICAL SLIDESHOW. 
    SUBJECT: Human anatomy performing "${exercise.titleTr || exercise.title}". 
    STYLE: Photorealistic clinical render, cyan active muscles, black background. 
    DETAIL: High anatomical precision.
  `;

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Medical 3D animation: "${exercise.titleTr || exercise.title}" movement for physical therapy training. Cinematic quality, slow motion.`;
  
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
  return downloadLink ? `${downloadLink}&key=${process.env.API_KEY}` : "";
};

export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate raw SVG code for: "${exercise.titleTr || exercise.title}". Minimalist medical icon style. Return ONLY XML.` }] }],
  });
  
  let cleanSvg = response.text || "";
  return cleanSvg.replace(/```svg|```xml|```/gi, '').trim();
};
