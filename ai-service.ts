
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, AnimationChoreography, TreatmentHistory, DetailedPainLog } from "./types.ts";

/**
 * PHYSIOCORE AI - CORE AI SERVICE (v5.3)
 */

export const ensureApiKey = async (): Promise<string> => {
  // 1. Önce ortam değişkenini kontrol et
  let key = process.env.API_KEY;
  
  // 2. Eğer yoksa veya geçersizse AI Studio köprüsünü dene
  if (!key || key === "undefined" || key === "") {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
      }
      // openSelectKey sonrası process.env.API_KEY dolmuş olmalı
      key = process.env.API_KEY;
    }
  }

  if (!key || key === "" || key === "undefined") {
    console.error("CRITICAL: Gemini API Key is missing. Please select a key via AI Studio bridge.");
    throw new Error("API_KEY_MISSING");
  }

  return key;
};

/**
 * AI Üretim Fonksiyonları için Wrapper
 */
const callGemini = async (fn: (ai: GoogleGenAI) => Promise<any>) => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    return await fn(ai);
  } catch (err: any) {
    // "Requested entity was not found" hatası anahtarın geçersiz olduğunu gösterir
    if (err.message?.includes("Requested entity was not found") || err.message?.includes("API_KEY_MISSING")) {
      const aistudio = (window as any).aistudio;
      if (aistudio) await aistudio.openSelectKey();
    }
    throw err;
  }
};

export const generateExerciseChoreography = async (exercise: Partial<Exercise>): Promise<AnimationChoreography | null> => {
  return await callGemini(async (ai) => {
    const prompt = `Senior Biomechanical Director olarak "${exercise.titleTr || exercise.title}" egzersizi için 0-100 loop bazlı koreografi JSON üret.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "null");
  });
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Clinical Medical Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  });
};

export const runClinicalConsultation = async (text: string, imageBase64?: string): Promise<PatientProfile | null> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: `Analyze and return PatientProfile JSON for: "${text}"` },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "null");
  });
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Update profile JSON based on feedback: ${JSON.stringify(feedback)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

// @fix: Added missing generateExerciseData function for ExerciseForm.tsx
export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a structured clinical exercise protocol for "${title}". 
      Return JSON with: titleTr, category, difficulty (1-10), sets, reps, description, biomechanics, safetyFlags (array), muscleGroups (array).`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleTr: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.NUMBER },
            sets: { type: Type.NUMBER },
            reps: { type: Type.NUMBER },
            description: { type: Type.STRING },
            biomechanics: { type: Type.STRING },
            safetyFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            muscleGroups: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

// @fix: Added missing optimizeExerciseData function for ExerciseForm.tsx
export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Optimize this physical therapy exercise for the goal: "${goal}". 
      Current exercise: ${JSON.stringify(exercise)}. 
      Adjust sets, reps, tempo, and biomechanics accordingly. Return optimized JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

// @fix: Added missing generateCoachingAudio function for ExercisePlayer.tsx using TTS model
export const generateCoachingAudio = async (text: string): Promise<string> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Clinical instruction: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    // Note: Returns raw PCM data in base64. For standard <audio> playback, additional processing might be needed
    return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : '';
  });
};
