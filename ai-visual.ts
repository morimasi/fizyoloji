
import { GoogleGenAI, Type } from "@google/genai";
import { getAI } from "./ai-core.ts";
import { Exercise, AnatomicalLayer } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v14.2 (Resilient Edition)
 * Enhanced Safety Handling & Detailed Error Reporting
 */

export const generateExerciseVisual = async (
  exercise: Partial<Exercise>, 
  layer: AnatomicalLayer | 'Cinematic-Motion' = 'full-body'
): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' | 'grid-5x5' }> => {
  const ai = getAI();
  const isCinematic = layer === 'Cinematic-Motion';
  
  let prompt = exercise.generatedPrompt;
  
  if (!prompt) {
      const baseStyle = "Professional medical 3D illustration style, clean lines, high contrast, studio lighting on dark slate background #020617.";
      
      if (isCinematic) {
          prompt = `
          Type: High-End Medical Sprite Sheet (5x5 Grid, 25 Frames).
          Subject: Professional clinical demonstration of ${exercise.titleTr || exercise.title}.
          Perspective: Full body wide shot, perfectly centered.
          
          --- STABILIZATION RULES ---
          - Absolute coordinate locking: Subject must remain at exact cell center (X,Y).
          - No camera movement. No perspective drift.
          - Solid background: Deep Navy #020617.
          
          Style: ${baseStyle}
          Technical: 5 columns, 5 rows. Smooth cinematic transitions.
          `;
      } else {
          prompt = `
          Medical 3D Sprite Sheet (4x4 Grid). 
          Subject: Anatomical demonstration of ${exercise.titleTr || exercise.title}. 
          Focus: ${layer} visualization.
          Style: ${baseStyle}
          Rules: Centered, static camera, dark background.
          `;
      }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        imageConfig: { aspectRatio: "1:1" } 
      } 
    });

    let modelFeedback = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // GÖRSEL VARSA DÖNDÜR
        if (part.inlineData) {
          return { 
            url: `data:image/png;base64,${part.inlineData.data}`, 
            frameCount: isCinematic ? 25 : 16, 
            layout: isCinematic ? 'grid-5x5' : 'grid-4x4' 
          };
        }
        // GÖRSEL YOKSA METİN GERİ BİLDİRİMİNİ BİRİKTİR
        if (part.text) {
          modelFeedback += part.text;
        }
      }
    }

    // Eğer buraya ulaştıysa görsel üretilmemiştir, modelin metin açıklamasını hata olarak fırlat
    if (modelFeedback) {
        throw new Error(`AI Reddi: ${modelFeedback}`);
    }
    
    throw new Error("Görsel verisi alınamadı (Boş Yanıt).");
  } catch (error: any) {
    console.error("Visual Engine Crash:", error);
    throw error; // Üst katmana hatayı ilet
  }
};

/**
 * Veo 3.1 Fast ile Hızlı Video Üretimi
 */
export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  
  const prompt = exercise.generatedPrompt || `
    Subject: Medical demonstration of ${exercise.titleTr || exercise.title}. 
    Style: Professional 3D clinical animation, 4K render quality. 
    Motion: Perfectly smooth, stable, zero-jitter. 
    Scene: Solid dark background #020617, cinematic lighting.
    Temporal: Perfect frame-to-frame consistency.
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
