
import { GoogleGenAI, Type } from "@google/genai";
import { getAI } from "./ai-core.ts";
import { Exercise, AnatomicalLayer } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v15.0 (Time-Mapped Cinematic)
 * Anti-Jitter Protocol & Temporal Pacing Enforced.
 */

export const generateExerciseVisual = async (
  exercise: Partial<Exercise>, 
  layer: AnatomicalLayer | 'Cinematic-Motion' = 'full-body'
): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' | 'grid-5x5' }> => {
  const ai = getAI();
  const isCinematic = layer === 'Cinematic-Motion';
  
  let prompt = exercise.generatedPrompt;
  
  if (!prompt) {
      if (isCinematic) {
          // CINEMATIC MODE: 25 FRAMES (5x5 GRID)
          // NEW: TIME-MAP DISTRIBUTION & ANCHOR LOCK
          prompt = `
          Type: Clinical Sprite Sheet (5x5 Grid, 25 Frames).
          Subject: Human performing ${exercise.titleTr || exercise.title}.
          
          --- TEMPORAL DISTRIBUTION (TIME-MAP) ---
          Generate a full continuous loop spread evenly across 25 frames:
          [Frames 1-4]: Neutral Start Position (Preparation).
          [Frames 5-13]: Slow Concentric Phase (Moving towards target).
          [Frame 14]: PEAK CONTRACTION (Hold pose).
          [Frames 15-23]: Slow Eccentric Phase (Controlled return).
          [Frames 24-25]: Return to Neutral.

          --- STABILIZATION RULES ---
          1. PELVIC ANCHOR: The character's hips/pelvis must remain at the EXACT SAME screen coordinates in every frame. Do not move the camera.
          2. GROUND LOCK: Feet must not slide unless the exercise requires stepping.
          3. CONSTANT SCALE: Do not zoom in/out. Subject size must remain identical.
          
          Style: Photorealistic clinical lighting, dark slate background (#020617).
          Technical: 5 columns, 5 rows. High contrast. No blur.
          `;
      } else {
          // STANDARD MODE: 16 FRAMES (4x4 GRID)
          prompt = `
          Medical 3D Sprite Sheet (4x4 Grid). 
          Subject: Human performing ${exercise.titleTr || exercise.title}. 
          Style: ${layer} medical illustration. 
          
          --- RIGID POSITIONING RULES ---
          - Anchor character position to center. No position drift between frames.
          - Maintain 100% identity and scale consistency across the sequence.
          - Background: Pure solid clinical dark slate. No texture noise.
          `;
      }
  }

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
          frameCount: isCinematic ? 25 : 16, 
          layout: isCinematic ? 'grid-5x5' : 'grid-4x4' 
        };
      }
    }
  }
  throw new Error("Görsel üretim hatası (Flash Engine).");
};

/**
 * Veo 3.1 Fast ile Hızlı Video Üretimi
 */
export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  
  const prompt = exercise.generatedPrompt || `
    Subject: ${exercise.titleTr || exercise.title}. 
    Style: Clinical 4K medical animation. 
    Motion: Slow-motion, controlled, fluid.
    --- CINEMATIC STABILIZATION ---
    Locked camera perspective (Tripod Mode). 
    Perfect temporal consistency. 
    Character must stay in center.
    Dark background (#020617).
  `;

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
    contents: [{ parts: [{ text: `Create a 4-slide clinical presentation for: "${exercise.titleTr || exercise.title}". Output JSON.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{"slides": []}');
};

export const generateVectorAnimation = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate SVG animation code for: "${exercise.titleTr || exercise.title}". Style: Cyan lines on dark bg.` }] }]
  });
  return response.text || "";
};
