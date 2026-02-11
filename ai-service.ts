
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise } from "./types.ts";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Cinema Motion Engine v5.1: Multi-Style Animation Engine
 * Üretilen videolar artık GIF döngüsü ve 2D vektörel animasyon stillerini de destekliyor.
 */
export const generateExerciseVideo = async (
  exercise: Partial<Exercise>, 
  style: string = 'Cinematic-Motion',
  directorialNote: string = ''
): Promise<string> => {
  const ai = getAI();
  
  const styleKeywords = {
    'X-Ray': 'Blue semi-transparent X-ray aesthetic, glowing skeletal structure, anatomical precision.',
    'Anatomic': 'Hyper-realistic muscle fiber rendering, deep tissue visibility, physiological accuracy.',
    '4K-Render': 'High-end 3D studio lighting, cinematic 4K texture, soft shadows, professional grade.',
    'Cinematic-Motion': 'Health documentary style, steady camera, neutral lighting, focused execution.',
    'GIF-Animation': 'High-contrast loop-friendly motion, rhythmic and repetitive cadence, clean white or dark studio background, minimalist aesthetic.',
    '2D-Animation': 'Flat vector medical illustration style, clean outlines, smooth 2D skeletal movement, professional infographic look.'
  };

  const currentStylePrompt = styleKeywords[style as keyof typeof styleKeywords] || styleKeywords['Cinematic-Motion'];

  const prompt = `
    CINEMA MOTION MASTERPIECE: Generate an ultra-fluid, 1080p medical animation film of a person performing "${exercise.title}".
    
    CLINICAL PERFORMANCE:
    - TEMPO: ${exercise.tempo || 'Natural flow'}. 
    - BIOMECHANICS: ${exercise.biomechanics}.
    - DIFFICULTY LEVEL: ${exercise.difficulty}/10.
    - DIRECTORIAL NOTE: ${directorialNote}
    
    TECHNICAL SPECIFICATIONS:
    - STYLE: ${currentStylePrompt}.
    - MOTION: Continuous, seamless human kinetics. 30fps absolute fluidity.
    - LIGHTING: Cinematic accents on a dark professional studio background.
    - SHOT: Medium full shot, following the center of gravity of the movement.
    
    IMPORTANT: The animation must feel like a purpose-driven short film. If it is a GIF style, ensure the start and end positions are identical for a perfect loop.
  `;

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview', 
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return '';
  } catch (e) {
    console.error("Cinema Motion v5.1 Error:", e);
    return await fallbackFastVideo(exercise);
  }
};

const fallbackFastVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Fluid clinical video: ${exercise.title}. Steady motion.`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const link = operation.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(`${link}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch { return ''; }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Hyper-realistic 4K medical visual of ${exercise.title}. Style: ${style}. Clean studio setup.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return '';
  } catch { return ''; }
};

export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  const ai = getAI();
  const prompt = `Generate expert clinical exercise data for "${exerciseName}" in JSON format.
  Include: title, category, difficulty (1-10), sets, reps, description, biomechanics, safetyFlags, muscleGroups, equipment, movementPlane, rehabPhase.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return {}; }
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  const ai = getAI();
  const prompt = `Optimize this exercise for: "${goal}". Current: ${JSON.stringify(exercise)}. Update JSON with new sets, reps, difficulty, tempo, restPeriod, clinicalNotes.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return exercise; }
};

export const runClinicalConsultation = async (text: string, imageBase64?: string): Promise<PatientProfile | null> => {
  const ai = getAI();
  const prompt = `Elite Clinical Analysis. Analyze: "${text}". Return PatientProfile JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return null; }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  const ai = getAI();
  const prompt = `Update plan based on feedback: ${JSON.stringify(feedback)}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return currentProfile; }
};
