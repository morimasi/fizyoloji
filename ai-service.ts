
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

const getAIClient = () => {
  if (!process.env.API_KEY) throw new Error("API_KEY missing.");
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Maliyet Tasarrufu: Video sadece kütüphanede yoksa üretilir.
 */
export const generateExerciseVideo = async (
  exercise: Partial<Exercise>, 
  style: string = 'Cinematic-Motion'
): Promise<string> => {
  // 1. Önce kütüphanede var mı bak (Sıfır Maliyet Kontrolü)
  if (exercise.videoUrl) return exercise.videoUrl;

  const prompt = `Medical animation: ${exercise.titleTr || exercise.title}. Style: ${style}. Biomechanics: ${exercise.biomechanics}`;

  try {
    let operation = await getAIClient().models.generateVideos({
      model: 'veo-3.1-fast-generate-preview', 
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' } // Maliyet için 720p tercih edildi
    });

    let attempts = 0;
    while (!operation.done && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await getAIClient().operations.getVideosOperation({ operation: operation });
      attempts++;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return '';
  } catch (e) {
    console.error("Video Gen Error:", e);
    return '';
  }
};

/**
 * Karar Destek Sistemi - Cache-First & Flash Optimized
 */
export const runClinicalConsultation = async (
  text: string, 
  imageBase64?: string,
  history?: TreatmentHistory[],
  painLogs?: DetailedPainLog[]
): Promise<PatientProfile | null> => {
  const inputHash = PhysioDB.generateHash(text + (imageBase64 ? 'img' : ''));
  
  // 1. Önbellek Kontrolü (Maliyeti Sıfırlar)
  const cached = PhysioDB.getCachedResponse(inputHash);
  if (cached) {
    console.log("[COST_SAVER] Returning cached clinical analysis.");
    return cached.data;
  }

  const prompt = `ANALİZ: "${text}". GEÇMİŞ: ${JSON.stringify(history || [])}. JSON PatientProfile döndür.`;

  try {
    const response = await getAIClient().models.generateContent({
      model: 'gemini-3-flash-preview', // Pro yerine Flash kullanımı maliyeti %90 düşürür
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });

    const result = JSON.parse(response.text || "null");
    if (result) PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch (err) {
    console.error("Consultation Error:", err);
    return null; 
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  try {
    const response = await getAIClient().models.generateContent({
      model: 'gemini-3-flash-preview', // En ucuz model
      contents: `Feedback: ${JSON.stringify(feedback)}. Update Profile JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return currentProfile; }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  // Görsel varsa üretme
  if (exercise.visualUrl) return exercise.visualUrl;

  try {
    const response = await getAIClient().models.generateContent({
      model: 'gemini-2.5-flash-image', // Standart görsel modeli
      contents: { parts: [{ text: `4K Medical: ${exercise.titleTr}. Style: ${style}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return '';
  } catch { return ''; }
};

export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  const inputHash = PhysioDB.generateHash(`exdata_${exerciseName}`);
  const cached = PhysioDB.getCachedResponse(inputHash);
  if (cached) return cached.data;

  try {
    const response = await getAIClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Expert data for "${exerciseName}" in JSON.`,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || "{}");
    PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch { return {}; }
};

/**
 * Fix: Added optimizeExerciseData to fulfill the requirement in ExerciseForm.tsx
 */
export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const response = await getAIClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Optimize this exercise for "${goal}": ${JSON.stringify(exercise)}. Return the optimized version as JSON matching the Exercise type structure.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("Optimization Error:", err);
    return exercise;
  }
};
