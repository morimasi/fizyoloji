
import { Modality, Type } from "@google/genai";
import { getAI } from "./ai-core.ts";
import { Exercise } from "./types.ts";

/**
 * PHYSIOCORE CONTENT & DOSAGE ENGINE
 * Models: gemini-3-flash-preview, gemini-2.5-flash-preview-tts
 */

const exerciseSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    biomechanics: { type: Type.STRING },
    primaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
    secondaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
    safetyFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
    sets: { type: Type.NUMBER },
    reps: { type: Type.NUMBER },
    tempo: { type: Type.STRING },
    restPeriod: { type: Type.NUMBER }
  }
};

export const generateExerciseTutorial = async (t: string) => {
  const ai = getAI();
  const sr = await ai.models.generateContent({ 
    model: 'gemini-3-flash-preview', 
    contents: [{ parts: [{ text: `Provide a clinical tutorial script for: ${t}. Include 4 detailed steps.` }] }], 
    config: { 
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                script: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            duration: { type: Type.NUMBER }
                        }
                    }
                },
                bpm: { type: Type.NUMBER }
            }
        }
    } 
  });
  const sd = JSON.parse(sr.text || "{}");
  
  // Generating Audio using Native TTS
  const ar = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: sd.script?.map((s: any) => s.text).join(' ') || "Egzersize başlayın." }] }],
    config: { 
      responseModalities: [Modality.AUDIO], 
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } 
    }
  });
  
  const base64Audio = ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

  return { 
    script: sd.script, 
    audioBase64: base64Audio, 
    bpm: sd.bpm || 60 
  };
};

export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Generate full clinical data for the exercise: "${title}".` }] }],
    config: { 
        responseMimeType: "application/json",
        responseSchema: exerciseSchema
    }
  });
  return JSON.parse(response.text);
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Optimize this exercise dosage for the goal "${goal}": ${JSON.stringify(exercise)}.` }] }],
    config: { 
        responseMimeType: "application/json",
        responseSchema: exerciseSchema
    }
  });
  return JSON.parse(response.text);
};
