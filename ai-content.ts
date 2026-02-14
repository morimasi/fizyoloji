
import { Modality } from "@google/genai";
import { getAI, ensureApiKey, handleAiError } from "./ai-core.ts";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE CONTENT & DOSAGE ENGINE
 */

export const generateExerciseTutorial = async (t: string) => {
  try {
    await ensureApiKey();
    const ai = getAI();

    const sr = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: `Tutorial script for: ${t}. Provide 4-5 clinical steps with duration in ms. JSON return.`, 
      config: { responseMimeType: "application/json" } 
    });
    const sd = JSON.parse(sr.text || "{}");
    
    const ar = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: sd.script?.map((s: any) => s.text).join(' ') || "" }] }],
      config: { 
        responseModalities: [Modality.AUDIO], 
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } 
      }
    });
    
    return { 
      script: sd.script, 
      audioBase64: ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null, 
      bpm: sd.bpm || 60 
    };
  } catch (err) {
    return await handleAiError(err);
  }
};

export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  try {
    await ensureApiKey();
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Physiotherapy exercise clinical data for: "${title}". Return JSON format with description, biomechanics, primaryMuscles, safetyFlags.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return await handleAiError(err);
  }
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    await ensureApiKey();
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Exercise: ${JSON.stringify(exercise)}. Goal: ${goal}. Optimize sets, reps, tempo, restPeriod. JSON return.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return await handleAiError(err);
  }
};
