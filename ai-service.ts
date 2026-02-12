
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, AnimationChoreography, TreatmentHistory, DetailedPainLog } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - VECTOR-CORE ENGINE (v5.1)
 * Powered by Gemini Flash (Free Tier Optimized)
 */

export const ensureApiKey = async (): Promise<string> => {
  const key = process.env.API_KEY;
  if (key && key !== "undefined" && key !== "") return key;
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    await aistudio.openSelectKey();
    throw new Error("MISSING_API_KEY");
  }
  throw new Error("MISSING_API_KEY");
};

/**
 * AI DIRECTOR: Hareketin "Koreografisini" Üretir.
 * Video dosyası üretmek yerine hareketin matematiksel modelini oluşturur.
 */
export const generateExerciseChoreography = async (exercise: Partial<Exercise>): Promise<AnimationChoreography | null> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Sen bir Biyomekanik Animasyon Yönetmenisin.
      Egzersiz: "${exercise.titleTr || exercise.title}"
      Biyomekanik: "${exercise.biomechanics}"
      
      Görevin: Bu egzersiz için 0-100 arası bir döngüde (loop) hareket koordinatlarını üretmek.
      Dönüş formatı sadece JSON olmalı:
      {
        "totalDuration": 4, 
        "focusPart": "omurga/diz/omuz",
        "frames": [
          {"timestamp": 0, "part": "main", "rotation": 0, "glow": "low"},
          {"timestamp": 50, "part": "main", "rotation": 45, "glow": "high"},
          {"timestamp": 100, "part": "main", "rotation": 0, "glow": "low"}
        ],
        "muscleActivationPatterns": { "ana_kas": [0, 50, 100, 50, 0] }
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "null");
  } catch (err) {
    console.error("Choreography Error:", err);
    return null;
  }
};

export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  // Geriye dönük uyumluluk için: Bir görsel üret ve yanına koreografi verisini iliştir.
  return await generateExerciseVisual(exercise, 'Vector-Core-Style');
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: `Professional Clinical Vector Art: ${exercise.titleTr || exercise.title}. Front view, anatomical focus, medical white background. Style: ${style}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (e) {
    return '';
  }
};

// Added missing AI content generation function for CMS
export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide clinical exercise data for "${title}" in JSON format including sets, reps, description, biomechanics, safetyFlags, and muscleGroups.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("AI Generation Error:", err);
    return {};
  }
};

// Added missing AI optimization function for Exercise Form
export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Optimize the following exercise for the goal "${goal}": ${JSON.stringify(exercise)}. Return updated JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("AI Optimization Error:", err);
    return exercise;
  }
};

// Updated signature to accept expanded clinical context (history and logs)
export const runClinicalConsultation = async (
  text: string, 
  imageBase64?: string, 
  history?: TreatmentHistory[], 
  logs?: DetailedPainLog[]
): Promise<PatientProfile | null> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: `Analiz et ve PatientProfile JSON döndür: "${text}". Geçmiş Tedaviler: ${JSON.stringify(history || [])}. Ağrı Kayıtları: ${JSON.stringify(logs || [])}` },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "null");
  } catch (err) {
    return null;
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Feedback: ${JSON.stringify(feedback)}. Mevcut Profil: ${JSON.stringify(currentProfile)}. JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return currentProfile;
  }
};
