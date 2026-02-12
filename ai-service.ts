
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, AnimationChoreography, TreatmentHistory, DetailedPainLog } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - VECTOR-CORE ENGINE (v5.2)
 * Optimized for Gemini Flash (Free Tier) with optional Pro features.
 */

/**
 * Ensures API Key is available. 
 * Per instructions: Assume success after openSelectKey and use process.env.API_KEY.
 */
export const ensureApiKey = async (): Promise<string> => {
  const key = process.env.API_KEY;
  const aistudio = (window as any).aistudio;
  
  if (!key || key === "undefined" || key === "") {
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
    }
  }
  
  // Return the key regardless - it's either there or we just prompted the user.
  // The system will inject it after selection.
  return process.env.API_KEY || "";
};

/**
 * AI DIRECTOR: Generates mathematical movement choreography.
 * Uses gemini-3-flash-preview for high-speed reasoning.
 */
export const generateExerciseChoreography = async (exercise: Partial<Exercise>): Promise<AnimationChoreography | null> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are a Senior Biomechanical Animation Director.
      Exercise: "${exercise.titleTr || exercise.title}"
      Biomechanics: "${exercise.biomechanics}"
      
      Task: Produce a mathematical movement loop (0-100 scale).
      The JSON must contain:
      - totalDuration: Ideal seconds for one rep.
      - focusPart: The primary joint/segment.
      - frames: Array of {timestamp: 0-100, part: 'main', rotation: number, glow: 'low'|'high', yOffset: number}.
      - muscleActivationPatterns: Map of muscle names to an array of 5 activation percentages across the movement.
      - audioCues: Array of {timestamp: 0-100, text: string} for coaching.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } // Flash doesn't need high budget for this
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (err) {
    console.error("Choreography Engine Error:", err);
    return null;
  }
};

/**
 * VOICE GUIDANCE: Generates high-quality coaching audio.
 * Uses gemini-2.5-flash-preview-tts.
 */
export const generateCoachingAudio = async (text: string): Promise<string | null> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say encouragingly: ${text}` }] }],
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
    return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : null;
  } catch (err) {
    console.error("TTS Engine Error:", err);
    return null;
  }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { 
        parts: [{ text: `High-fidelity Clinical Medical Illustration: ${exercise.titleTr || exercise.title}. Perspective: Frontal/Profile as appropriate. Clinical white background with cyan neon accents. Anatomically precise. Style: ${style}` }] 
      },
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
    console.error("Image Engine Error:", e);
    return '';
  }
};

export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide detailed clinical exercise data for "${title}" in JSON format. 
      Include: sets, reps, description, biomechanics (muscular analysis), safetyFlags (contraindications), muscleGroups, equipment, rehabPhase, movementPlane, tempo.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("CMS AI Generation Error:", err);
    return {};
  }
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Clinical Specialist. Optimize this exercise protocol for the goal: "${goal}". 
      Current Data: ${JSON.stringify(exercise)}. 
      Return only the updated fields in JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("Optimization Engine Error:", err);
    return exercise;
  }
};

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
      model: 'gemini-3-pro-preview', // Upgrade to Pro for complex clinical reasoning
      contents: {
        parts: [
          { text: `Perform a deep clinical analysis and generate a personalized PatientProfile JSON. 
          User Complaint: "${text}". 
          History: ${JSON.stringify(history || [])}. 
          Pain Logs: ${JSON.stringify(logs || [])}` },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 } 
      }
    });
    return JSON.parse(response.text || "null");
  } catch (err) {
    console.error("Consultation Engine Error:", err);
    return null;
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an adaptive clinical system, update this profile based on new session feedback.
      Feedback: ${JSON.stringify(feedback)}. 
      Profile: ${JSON.stringify(currentProfile)}. 
      Return updated JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return currentProfile;
  }
}
