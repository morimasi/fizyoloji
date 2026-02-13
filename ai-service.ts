
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, AnimationChoreography, TreatmentHistory, DetailedPainLog } from "./types.ts";

/**
 * PHYSIOCORE AI - SMART KEY ADAPTER (v5.4)
 * Handles API key sourcing exclusively from process.env.API_KEY and secure AI Studio selection.
 */

export const ensureApiKey = async (): Promise<string> => {
  // Always prioritize and exclusively use process.env.API_KEY as per core guidelines.
  let key = process.env.API_KEY;

  // Fallback check for AI Studio Bridge selection if process.env.API_KEY is missing.
  // This helps in development environments where a key selection dialog is used.
  const aistudio = (window as any).aistudio;
  if (!key || key === "undefined" || key === "") {
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // Trigger the key selection dialog if no key is currently active.
        try {
          await aistudio.openSelectKey();
        } catch (e) {
          console.warn("AI Studio key selection failed or cancelled.");
        }
      }
      // Re-acquire the key from the environment after selection.
      key = process.env.API_KEY;
    }
  }

  if (!key || key === "" || key === "undefined") {
    throw new Error("API_KEY_NOT_FOUND");
  }

  return key;
};

// Helper function to initialize GoogleGenAI and execute a call just-in-time.
const callGemini = async (fn: (ai: GoogleGenAI) => Promise<any>) => {
  try {
    const apiKey = await ensureApiKey();
    // Always create a new instance right before making the API call.
    const ai = new GoogleGenAI({ apiKey });
    return await fn(ai);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    // Handle entity not found errors by resetting the key selection if applicable.
    if (err.message?.includes("API_KEY_NOT_FOUND") || err.message?.includes("Requested entity was not found")) {
      const aistudio = (window as any).aistudio;
      if (aistudio) await aistudio.openSelectKey();
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
    // Use .text property directly, do not call as a method.
    return JSON.parse(response.text || "null");
  });
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  return await callGemini(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Clinical Anatomy Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    // Iterate through candidates to find the image data.
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
    // Extract raw PCM audio data from the response.
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    // Base64 encoded raw PCM data for decoding in UI.
    return data ? data : '';
  });
};
