
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, AnimationChoreography, TreatmentHistory, DetailedPainLog } from "./types.ts";

/**
 * PHYSIOCORE AI - MASTER CLINICAL ADAPTER (v5.6)
 * Based on Section 5 of fizyo.md Master Blueprint.
 */

const callGemini = async (fn: (ai: GoogleGenAI) => Promise<any>) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    if (!process.env.API_KEY) throw new Error("API_KEY_NOT_FOUND");
    return await fn(ai);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    if (err.message?.includes("API_KEY_NOT_FOUND") || err.message?.includes("Requested entity was not found")) {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
      }
    }
    throw err;
  }
};

export const runClinicalConsultation = async (text: string, imageBase64?: string): Promise<PatientProfile | null> => {
  return await callGemini(async (ai) => {
    const systemInstruction = `
      Sen kıdemli bir klinik fizyoterapist AI'sın. fizyo.md blueprint'ine sadık kalarak bir PatientProfile JSON oluştur.
      KLİNİK KURALLAR (Section 5):
      1. Tanı 'Herniation' ise Flexion içeren egzersizler YASAKTIR.
      2. Başlangıç ağrısını (VAS) belirle.
      3. Dozaj Formülü: reps = max(5, 15 - pain_score).
      4. Egzersiz seçiminde biomechanics alanına 'Extension Bias' veya 'Flexion Bias' notu ekle.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: `${systemInstruction}\n\nHasta Şikayeti: "${text}"` },
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
    const systemInstruction = `
      Hastanın gelişim raporuna göre reçeteyi ADAPTE et.
      KURAL SETİ:
      - Eğer painScore > 7 ise: Sadece "Isometric" veya "Relaxation" egzersizleri bırak, diğerlerini kaldır.
      - Eğer painScore düştüyse: Zorluğu (difficulty) 1 kademe artır ve reps formülünü (max(5, 15-pain)) tekrar hesapla.
      - latestInsight alanına klinik bir 'adaptationNote' ekle.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${systemInstruction}\n\nMevcut Profil: ${JSON.stringify(currentProfile)}\n\nYeni Geri Bildirim: ${JSON.stringify(feedback)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateExerciseChoreography = async (exercise: Partial<Exercise>): Promise<AnimationChoreography | null> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Egzersiz için 5 karelik SVG transform/rotation verisi üret (JSON): "${exercise.titleTr || exercise.title}"`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "null");
  });
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Clinical Anatomy Illustration (Master Blueprint Section 8): ${exercise.titleTr || exercise.title}. Style: ${style}. Ultra-high detail, professional rehabilitation art.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : '';
  });
};

export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `fizyo.md standartlarında egzersiz verisi oluştur: "${title}"`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Optimize physical therapy exercise for "${goal}". Current: ${JSON.stringify(exercise)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateCoachingAudio = async (text: string): Promise<string> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with clinical authority: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return data ? data : '';
  });
};
