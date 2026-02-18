
import { GoogleGenAI, Type } from "@google/genai";
import { getAI } from "./ai-core.ts";
import { Exercise, AnatomicalLayer } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v14.0 (Cinematic Focus)
 */

export const generateExerciseVisual = async (
  exercise: Partial<Exercise>, 
  layer: AnatomicalLayer | 'Cinematic-Motion' = 'full-body'
): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' | 'grid-5x5' }> => {
  const ai = getAI();
  
  // SİNEMATİK MOD: Daima 5x5 grid (25 kare) kullanırız ki akış 24 FPS'te gerçekçi olsun.
  const isCinematic = true; 
  
  const prompt = `
    TASK: Medical Sprite Sheet Generation (5x5 Grid - 25 Sequential Frames).
    SUBJECT: Human body performing: ${exercise.titleTr || exercise.title}.
    
    --- CINEMATOGRAPHY SPECS ---
    1. VIEW: Wide Shot (Long Shot). Entire body must be visible from head to toes in EVERY frame.
    2. PADDING: Maintain 15% clear margin around the body to prevent limb cutting.
    3. STABILITY: The pelvis/center-of-gravity must stay in the center of each cell.
    4. SEQUENCE: Chronological movement from start position to max range. 
    5. STYLE: Clinical 4K Render, dark background (#020617), photorealistic human anatomy.
    
    --- MEDICAL PRECISION ---
    Ensure joints (knees, elbows, spine) move anatomically correct for: ${exercise.biomechanics}.
  `;

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
          frameCount: 25, 
          layout: 'grid-5x5' 
        };
      }
    }
  }
  throw new Error("Görsel üretim hatası (Flash Cinema Engine).");
};

export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const prompt = `Ultra-smooth 4K medical 3D animation: ${exercise.titleTr || exercise.title}. 
             Entire body visible, cinematic lighting, slate dark background. 
             Slow controlled movement demonstrating ${exercise.biomechanics}. Full body long shot.`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await (ai as any).operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const apiKey = process.env.API_KEY;
  return `${downloadLink}&key=${apiKey}`;
};

export const generateClinicalSlides = async (exercise: Partial<Exercise>) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: `Create 4-slide presentation for ${exercise.title} in JSON.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{"slides": []}');
};

export const generateVectorAnimation = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `SVG animation for ${exercise.title}.` }] }]
  });
  return response.text || "";
};
