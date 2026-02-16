
import { getAI } from "./ai-core.ts";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE
 * 4K Render, VEO Video ve AVM Vektör Üretimi
 */

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = getAI();
  const totalFrames = 16;
  
  const fullPrompt = `
    MEDICAL 3D RENDER SPRITE SHEET (4x4 GRID).
    SUBJECT: Human anatomy performing "${exercise.titleTr || exercise.title}".
    STYLE: Glowing cyan active muscles, black background.
    PRIMARY TARGETS: ${(exercise.primaryMuscles || ['Global Muscles']).join(', ')}
    DESCRIPTION: ${customDirective || exercise.description || ''}
  `;

  // General image generation uses 2.5 flash image for better accessibility
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', 
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: { 
      imageConfig: { 
        aspectRatio: "1:1"
      } 
    } 
  });

  const candidates = (response as any).candidates;
  if (candidates?.[0]?.content?.parts) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
          return { url: `data:image/png;base64,${part.inlineData.data}`, frameCount: totalFrames, layout: 'grid-4x4' };
      }
    }
  }
  throw new Error("Görsel üretim aşamasında hata oluştu.");
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Cinematic medical 3D film showing "${exercise.titleTr || exercise.title}" movement. High precision, anatomical focus, dark background.`;
  
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
    contents: [{ parts: [{ text: `Generate a clean, professional medical SVG illustration for: "${exercise.titleTr || exercise.title}". Return ONLY raw SVG XML code without markdown blocks.` }] }],
  });
  
  let cleanSvg = response.text || "";
  cleanSvg = cleanSvg.replace(/```svg|```xml|```/gi, '').trim();
  if (!cleanSvg.includes('<svg')) throw new Error("SVG verisi alınamadı.");
  return cleanSvg;
};
