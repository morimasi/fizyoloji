
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - ZERO-COST ANIMATION ENGINE (v6.0)
 * Uses Vector Puppetry & Browser Rendering instead of MP4 Generation.
 */

export const ensureApiKey = async (): Promise<string> => {
  // 1. Check Vite Environment Variable (Preferred)
  if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;

  // 2. Check Process Env (Fallback)
  const key = process.env.API_KEY;
  if (key && key !== "undefined" && key !== "") return key;
  
  // 3. Check AI Studio Shim
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    await aistudio.openSelectKey();
    throw new Error("MISSING_API_KEY");
  }
  throw new Error("MISSING_API_KEY");
};

export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  return await generateExerciseVisual(exercise, 'Medical-Vector-Art');
};

export const runClinicalConsultation = async (
  text: string, 
  imageBase64?: string,
  history?: TreatmentHistory[],
  painLogs?: DetailedPainLog[]
): Promise<PatientProfile | null> => {
  const inputHash = PhysioDB.generateHash(text + (imageBase64 ? 'img' : ''));
  const cached = PhysioDB.getCachedResponse(inputHash);
  if (cached) return cached.data;

  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Sen kıdemli bir klinik uzmanısın. Ücretsiz model (Flash) optimizasyonuyla çalışıyorsun.
    Girdi: "${text}"
    Analiz et ve PatientProfile JSON döndür.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { 
        responseMimeType: "application/json"
      }
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
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `Feedback: ${JSON.stringify(feedback)}. Profil: ${JSON.stringify(currentProfile)}. JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return currentProfile;
  }
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Optimize et (JSON): Hedef: "${goal}". Mevcut Egzersiz Verisi: ${JSON.stringify(exercise)}. 
      Görevin: Biyomekanik parametreleri, set, tekrar ve dinlenme sürelerini belirtilen klinik hedefe göre güncelle. Sadece JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("Optimization Service Error:", err);
    return exercise;
  }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-fidelity Medical Vector Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}. Minimalist, clean lines, neon blue accents on dark background. Focus on the main muscle group.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (e) {
    return '';
  }
};

export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Biyomekanik veriler oluştur (JSON): "${exerciseName}".`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return {};
  }
};

/**
 * THE PUPPET MASTER: Generates Animation Script & Audio
 * This creates a "Live Animation" without video files.
 */
export const generateExerciseTutorial = async (exerciseTitle: string): Promise<ExerciseTutorial | null> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });

    // 1. Generate Script (JSON)
    const scriptPrompt = `
      Create a rhythmic breathing and movement script for the exercise: "${exerciseTitle}".
      Format: JSON.
      Structure:
      {
        "bpm": 60,
        "script": [
           { "step": 1, "text": "Start position...", "duration": 3000, "animation": "hold" },
           { "step": 2, "text": "Exhale and contract...", "duration": 2000, "animation": "contract" },
           { "step": 3, "text": "Inhale and return...", "duration": 2000, "animation": "breathe" }
        ]
      }
      Keep it short (max 3 steps).
    `;

    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: scriptPrompt,
      config: { responseMimeType: "application/json" }
    });

    const scriptData = JSON.parse(scriptResponse.text || "{}");

    // 2. Generate Audio (TTS)
    const ttsText = `Guide for ${exerciseTitle}. ${scriptData.script.map((s: any) => s.text).join(' ')}`;
    const audioResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: ttsText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    let audioBase64 = null;
    const candidates = audioResponse.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts && candidates[0].content.parts[0].inlineData) {
        audioBase64 = candidates[0].content.parts[0].inlineData.data;
    }

    return {
      script: scriptData.script,
      audioBase64: audioBase64,
      bpm: scriptData.bpm || 60
    };

  } catch (err) {
    console.error("Tutorial Gen Error:", err);
    return null;
  }
};
