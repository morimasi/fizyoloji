
import { GoogleGenAI, Type } from "@google/genai";
import { getAI } from "./ai-core.ts";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE VISUAL PRODUCTION ENGINE v13.0 (Flash Ultra Edition)
 * Optimized for Speed, Cost Efficiency & Multimodal Output.
 */

export type AnatomicalLayer = 'muscular' | 'skeletal' | 'vascular' | 'xray' | 'full-body';

export const generateExerciseVisual = async (
  exercise: Partial<Exercise>, 
  layer: AnatomicalLayer = 'full-body'
): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = getAI();
  
  const layerPrompts: Record<AnatomicalLayer, string> = {
    'muscular': 'Detailed red fibrous muscle fibers, tendons, clinical medical illustration style.',
    'skeletal': 'Anatomically correct white bones and joints, high contrast x-ray style.',
    'vascular': 'Network of arteries and veins, transparency effect.',
    'xray': 'Radiographic negative film style, bright white skeletal structure.',
    'full-body': 'Professional medical 3D render, photorealistic skin and muscle definition.'
  };

  // Flash Image Model (Nano Banana) Optimization
  const prompt = `Medical 3D Sprite Sheet (4x4 Grid). Subject: Human performing ${exercise.titleTr || exercise.title}. 
    Style: ${layerPrompts[layer]}. Biomechanics Focus: ${exercise.biomechanics}. 
    Background: Dark clinical slate. 16 distinct phases of movement. High clarity.`;

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
  throw new Error("Görsel üretim hatası (Flash Engine).");
};

/**
 * Veo 3.1 Fast ile Hızlı Video Üretimi (Pro yerine Fast tercih edildi)
 */
export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  
  // Veo Fast modeli kullanılıyor (Daha hızlı, daha az maliyetli)
  // FIX: Aspect Ratio '1:1' is not supported by Veo models. Changed to '16:9' for cinematic clinical view.
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Medical 3D animation of ${exercise.titleTr || exercise.title}. 
             Focus: ${exercise.biomechanics}. 
             Style: Clinical, clean, 4K texture feel, dark background, perfect loop. 
             Smooth motion, educational medical standard.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p', // Fast model supports 720p efficiently
      aspectRatio: '16:9' // Changed from 1:1 to 16:9 to fix API error
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

/**
 * Gemini Flash ile PPT (Sunum) İçeriği Üretimi
 */
export const generateClinicalSlides = async (exercise: Partial<Exercise>) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text: `
      Create a 4-slide clinical presentation structure for the exercise: "${exercise.titleTr || exercise.title}".
      Target Audience: Patients.
      
      Output JSON format:
      {
        "slides": [
          {"title": "Title", "bullets": ["point 1", "point 2"], "footer": "PhysioCore AI"},
          ...
        ]
      }
      
      Slide 1: Introduction & Goal.
      Slide 2: Step-by-Step Technique.
      Slide 3: Common Mistakes & Corrections.
      Slide 4: Dosage & Safety Warning.
    ` }] }],
    config: {
      responseMimeType: "application/json"
    }
  });
  
  return JSON.parse(response.text || '{"slides": []}');
};

export const generateVectorAnimation = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate SVG animation code for: "${exercise.titleTr || exercise.title}". 
      Style: Cyan lines #06B6D4 on dark bg. Minimalist medical vector. Return only SVG.` }] }]
  });
  return response.text || "";
};
