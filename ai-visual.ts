
import { GoogleGenAI, Type } from "@google/genai";
import { getAI } from "./ai-core.ts";
import { Exercise, AnatomicalLayer } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v16.0 (Absolute Registration)
 * Hard-Lock Centering Protocol.
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
          prompt = `
          Type: Medical Sprite Sheet (5x5 Grid).
          Subject: Human performing ${exercise.titleTr || exercise.title}.
          
          --- OPTICAL REGISTRATION RULES (CRITICAL) ---
          1. STATIC CAMERA: The camera MUST NOT move. Fixed tripod perspective.
          2. DEAD CENTER: The character's TORSO (Core) must be in the EXACT center of every single grid cell.
          3. NO PANNING: Do not show the character moving across the frame. Keep them anchored in place.
          4. ISOLATION: Dark Slate background (#020617) for easy background removal.
          
          Sequence:
          - Rows 1-2: Preparation & Concentric phase.
          - Row 3: Peak contraction (Hold).
          - Rows 4-5: Eccentric phase & Return.
          
          Style: 4K Clinical Photorealism.
          `;
      } else {
          // STANDARD MODE: 16 FRAMES (4x4 GRID)
          prompt = `
          Medical Illustration Sprite Sheet (4x4 Grid). 
          Subject: ${exercise.titleTr || exercise.title}. 
          Style: ${layer} view.
          
          --- ALIGNMENT RULES ---
          - Draw the subject in the EXACT center of each cell.
          - No camera movement.
          - Background: Solid #020617.
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
    Motion: Slow, fluid, anchored.
    Camera: Tripod mode (Fixed).
    Background: Dark Slate (#020617).
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
