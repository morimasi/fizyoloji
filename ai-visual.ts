
import { getAI } from "./ai-core.ts";
import { Exercise, AnatomicalLayer } from "./types.ts";
import { VisualPrompts } from "./visual-engine/prompts.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v17.2 (24FPS Optimized)
 */

// 1. GÖRSEL ÜRETİM (IMAGE)
export const generateExerciseVisual = async (
  exercise: Partial<Exercise>, 
  layer: AnatomicalLayer | 'Cinematic-Motion' = 'full-body'
): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' | 'grid-5x5' }> => {
  const ai = getAI();
  const isCinematic = layer === 'Cinematic-Motion';
  
  // Prompt Mantığı Modülden Çekilir
  const prompt = exercise.generatedPrompt || VisualPrompts.construct(exercise, layer);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', 
    contents: [{ parts: [{ text: prompt }] }],
    config: { 
      imageConfig: { aspectRatio: "1:1" } // Zorunlu Kare Çıktı
    } 
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return { 
          url: `data:image/png;base64,${part.inlineData.data}`, 
          // 24FPS için 25 Karelik (5x5) Grid kullanıyoruz
          frameCount: isCinematic ? 25 : 16, 
          layout: isCinematic ? 'grid-5x5' : 'grid-4x4' 
        };
      }
    }
  }
  throw new Error("Görsel üretim hatası (Flash Engine).");
};

// 2. VIDEO ÜRETİM (VEO)
export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  
  const prompt = exercise.generatedPrompt || VisualPrompts.video(exercise);

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

// 3. KLİNİK SLAYT ÜRETİM (TEXT/JSON)
export const generateClinicalSlides = async (exercise: Partial<Exercise>) => {
  const ai = getAI();
  const prompt = VisualPrompts.slides(exercise);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{"slides": []}');
};

// 4. VEKTÖR ANIMASYON (SVG)
export const generateVectorAnimation = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const prompt = VisualPrompts.vector(exercise);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }]
  });
  return response.text || "";
};
