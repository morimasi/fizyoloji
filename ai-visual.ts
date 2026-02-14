
import { getAI, ensureApiKey, handleAiError } from "./ai-core.ts";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE
 */

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  try {
    await ensureApiKey();
    const ai = getAI();

    const totalFrames = 16;
    const fullPrompt = `
      ULTRA-REALISTIC 4K MEDICAL 3D RENDER SPRITE SHEET (4x4 GRID).
      SUBJECT: Real human anatomy performing "${exercise.titleTr || exercise.title}".
      MTS 2.0 PROTOCOL: Anatomical heatmap, glowing cyan active muscles.
      PRIMARY TARGETS: ${(exercise.primaryMuscles || ['Global Muscles']).join(', ')}
      DESCRIPTION: ${customDirective || exercise.description || ''}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', 
      contents: { parts: [{ text: fullPrompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1",
          imageSize: "1K" 
        } 
      } 
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
          return { url: `data:image/png;base64,${part.inlineData.data}`, frameCount: totalFrames, layout: 'grid-4x4' };
      }
    }
    throw new Error("Görsel verisi alınamadı.");
  } catch (err) {
    return await handleAiError(err);
  }
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  try {
    await ensureApiKey();
    const ai = getAI();

    const prompt = `Cinematic medical 3D film, 4K: ${exercise.titleTr || exercise.title}. Real muscle textures, black background. High precision movement.`;
    
    let operation = await ai.models.generateVideos({ 
      model: 'veo-3.1-fast-generate-preview', 
      prompt, 
      config: { 
        resolution: '1080p', 
        aspectRatio: '16:9',
        numberOfVideos: 1
      } 
    });
    
    while (!operation.done) { 
      await new Promise(r => setTimeout(r, 10000)); 
      operation = await ai.operations.getVideosOperation({ operation }); 
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const apiKey = process.env.API_KEY;
    return downloadLink ? `${downloadLink}&key=${apiKey}` : "";
  } catch (err) {
    return await handleAiError(err);
  }
};

export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  try {
    await ensureApiKey();
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a clinical medical SVG vector for: "${exercise.titleTr || exercise.title}". Return ONLY valid XML SVG code.`,
    });
    
    let cleanSvg = response.text || "";
    cleanSvg = cleanSvg.replace(/```svg|```/gi, '').trim();
    return cleanSvg;
  } catch (err) {
    return await handleAiError(err);
  }
};
