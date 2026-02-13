
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, AnimationChoreography, TreatmentHistory, DetailedPainLog } from "./types.ts";

/**
 * PHYSIOCORE AI - SMART KEY ADAPTER (v5.5)
 * Adheres to GenAI SDK guidelines: uses process.env.API_KEY exclusively.
 */

// Helper function to initialize GoogleGenAI and execute a call just-in-time.
// Ensures it always uses the most up-to-date API key from the environment.
const callGemini = async (fn: (ai: GoogleGenAI) => Promise<any>) => {
  try {
    // Directly use process.env.API_KEY as per GenAI SDK guidelines to ensure up-to-date key selection
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    if (!process.env.API_KEY) throw new Error("API_KEY_NOT_FOUND");
    
    return await fn(ai);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    // Graceful handling of common API key related errors
    if (err.message?.includes("API_KEY_NOT_FOUND") || err.message?.includes("Requested entity was not found")) {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
      }
    }
    throw err;
  }
};

export const generateExerciseChoreography = async (exercise: Partial<Exercise>): Promise<AnimationChoreography | null> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate animation choreography for physical therapy: "${exercise.titleTr || exercise.title}"`,
      config: { responseMimeType: "application/json" }
    });
    // response.text is a property, not a method.
    return JSON.parse(response.text || "null");
  });
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  return await callGemini(async (ai) => {
    // Uses gemini-2.5-flash-image for standard clinical illustrations.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Clinical Anatomy Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    // Iterate through candidates to find the image part.
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : '';
  });
};

export const runClinicalConsultation = async (text: string, imageBase64?: string): Promise<PatientProfile | null> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: `Clinical Analysis. Generate PatientProfile JSON for complaint: "${text}"` },
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
      contents: `Update PatientProfile JSON for feedback: ${JSON.stringify(feedback)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Build exercise data JSON for: "${title}"`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Optimize exercise for ${goal}. Current: ${JSON.stringify(exercise)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateCoachingAudio = async (text: string): Promise<string> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return data ? data : '';
  });
};
