
import { GoogleGenAI, Type } from "@google/genai";
import { getAI } from "./ai-core.ts";
import { Exercise, AnatomicalLayer } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v14.0 (Stabilized Cinematic Edition)
 * Anti-Jitter Protocol & Absolute Coordinate Locking Enforced.
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
          // CINEMATIC MODE: 24 FPS / 25 FRAMES / 5x5 GRID
          // ENFORCING TEMPORAL STABILITY & COORDINATE LOCKING
          prompt = `
          Type: High-End Medical Sprite Sheet (5x5 Grid, 25 Frames).
          Subject: Human performing ${exercise.titleTr || exercise.title}.
          
          --- CRITICAL STABILIZATION PROTOCOL (ANTI-JITTER) ---
          1. ABSOLUTE COORDINATE LOCKING: The character's head, torso, and hips MUST be anchored to the same absolute X-Y coordinates in every single grid cell.
          2. ZERO-DRIFT CAMERA: The virtual camera must remain perfectly static. No zoom-in, no zoom-out, no perspective shifting between frames.
          3. CHARACTER CENTERING: Subject's center of mass must be locked to the exact center of each cell with 15% safety padding.
          4. FEATURE TRACKING CONSISTENCY: Anatomical landmarks (joints, shoulders, feet) must not drift or shift pixel positions independently.
          5. NO BACKGROUND SHIMMER: Arka plan dokusu (#020617) tüm karelerde pikseller bazında özdeş olmalıdır.
          
          Style: Photorealistic cinematic lighting, dark slate background.
          Motion: Fluid and consistent eccentric/concentric phases.
          Technical: 5 columns, 5 rows. High medical contrast.
          `;
      } else {
          // STANDARD MODE: 12 FPS / 16 FRAMES / 4x4 GRID
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
    Motion: Smooth, zero-jitter, fluid. 
    --- CINEMATIC STABILIZATION ---
    Locked camera perspective. Perfect frame-to-frame temporal consistency. 
    Fixed lighting. Character identity and position locking in absolute 3D space. 
    No flickering background. Dark background (#020617).
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
