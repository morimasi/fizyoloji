
import { GoogleGenAI } from "@google/genai";
import { getAI } from "./ai-core.ts";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v12.0 (Pro & Ultra Edition)
 * Optimized for High-Quality Cinematic Motion Plates.
 */

export type AnatomicalLayer = 'muscular' | 'skeletal' | 'vascular' | 'xray' | 'full-body';

export const generateExerciseVisual = async (
  exercise: Partial<Exercise>, 
  layer: AnatomicalLayer = 'full-body'
): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = getAI();
  
  const layerPrompts: Record<AnatomicalLayer, string> = {
    'muscular': 'Detailed red fibrous muscle fibers, tendons, cinematic medical lighting.',
    'skeletal': 'Anatomically correct white bones and joints, high contrast medical style.',
    'vascular': 'Network of glowing red arteries and blue veins, transparency effect.',
    'xray': 'Radiographic negative film, bright white joints on pitch black background.',
    'full-body': 'Professional 3D medical render, photorealistic skin and muscle silhouette.'
  };

  const prompt = `Medical 3D Sprite Sheet (4x4 Grid). Subject: Human body performing ${exercise.titleTr || exercise.title}. 
    Anatomy Layer: ${layerPrompts[layer]}. Biomechanics: ${exercise.biomechanics}. 
    Dark slate background, cinematic render. 16 distinct motion phases.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', 
    contents: [{ parts: [{ text: prompt }] }],
    config: { 
      imageConfig: { aspectRatio: "1:1" } 
    } 
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return { 
          url: `data:image/png;base64,${part.inlineData.data}`, 
          frameCount: 16, 
          layout: 'grid-4x4' 
        };
      }
    }
  }
  throw new Error("Görsel üretim hatası.");
};

/**
 * Veo 3.1 Pro/Fast ile Akıcı Video & GIF Üretimi
 * @param quality 'fast' (720p) veya 'pro' (1080p, High Quality)
 */
export const generateExerciseVideo = async (exercise: Partial<Exercise>, quality: 'fast' | 'pro' = 'fast'): Promise<string> => {
  const ai = getAI();
  const modelName = quality === 'pro' ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
  const resolution = quality === 'pro' ? '1080p' : '720p';
  
  let operation = await ai.models.generateVideos({
    model: modelName,
    prompt: `Ultra-high definition medical 3D animation of a human body performing ${exercise.titleTr || exercise.title}. 
             Detailed biomechanics: ${exercise.biomechanics}. Cinematic volumetric lighting, 4K texture feel, 
             perfectly loopable, clinical dark background, slow motion clinical precision.`,
    config: {
      numberOfVideos: 1,
      resolution: resolution,
      aspectRatio: '1:1'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, quality === 'pro' ? 15000 : 10000));
    operation = await (ai as any).operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const apiKey = process.env.API_KEY;
  return `${downloadLink}&key=${apiKey}`;
};

/**
 * Gemini Flash ile Dinamik Vektörel SVG Animasyonu Üretimi
 */
export const generateVectorAnimation = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate a professional medical SVG animation code for: "${exercise.titleTr || exercise.title}". 
      Include <animateTransform> tags for the joints corresponding to ${exercise.biomechanics}. 
      Style: Cyan lines #06B6D4, dark theme compatible, no background. Return only the SVG code.` }] }]
  });
  return response.text || "";
};
