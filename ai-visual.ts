
import { getAI } from "./ai-core.ts";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v9.0 (Flash Motion Edition)
 * Replaces expensive video generation with rapid high-fidelity image sequences.
 */

export const generateExerciseVisual = async (exercise: Partial<Exercise>): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = getAI();
  const totalFrames = 16;
  
  // Motion Plate Prompt: Ekonomik ve yüksek kaliteli statik görüntü üretimi
  const fullPrompt = `MEDICAL 3D SPRITE SHEET (4x4 GRID). SUBJECT: Human body performing "${exercise.titleTr || exercise.title}". 
    FOCUS: ${exercise.biomechanics}. STYLE: Professional medical animation, dark slate background, high contrast muscles in cyan. 
    Ensure 16 distinct movement phases are visible in a 4x4 grid layout.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', // En ekonomik görsel üretim modeli
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: { imageConfig: { aspectRatio: "1:1" } } 
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return { 
          url: `data:image/png;base64,${part.inlineData.data}`, 
          frameCount: totalFrames, 
          layout: 'grid-4x4' 
        };
      }
    }
  }
  throw new Error("Görsel üretim limitine takılındı veya hata oluştu.");
};

/**
 * Alternatif: Minimum maliyetli vektörel illüstrasyon üretimi
 */
export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a minimalist professional medical SVG code for: ${exercise.titleTr || exercise.title}. 
    Focus on joint angles. Style: Clean lines, #06B6D4 stroke. NO BACKGROUND. Return ONLY pure SVG code.`,
  });
  return response.text || "";
};

// Veo modelleri sistemden çıkarıldı veya legacy olarak işaretlendi.
export const generateExerciseRealVideo = async (exercise: Partial<Exercise>): Promise<string> => {
    // Veo yerine sprite sheet'i video formatına dönüştüren client-side motoru tetiklenebilir.
    const res = await generateExerciseVisual(exercise);
    return res.url; 
};
