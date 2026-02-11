
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise } from "./types.ts";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI Motion Engine: Veo 3.1 High-Fidelity. 
 * Gerçek insan biyomekaniğini ve momentumunu taklit eden, akışkan sinematik videolar üretir.
 */
export const generateExerciseVideo = async (exercise: Partial<Exercise>, style: string = 'Cinematic-Motion'): Promise<string> => {
  const ai = getAI();
  
  const styleKeywords = {
    'X-Ray': 'Cinematic X-ray cinematography. Bioluminescent skeletal system with glowing joints. Fluid bone-on-bone movement.',
    'Anatomic': 'Deep tissue muscular rendering. Hyper-realistic muscle fibers contracting and elongating in a seamless flow.',
    '4K-Render': 'High-end 3D production quality. Soft studio lighting, realistic skin shaders, and cinematic motion blur.',
    'Cinematic-Motion': 'Professional medical documentary aesthetic. Ultra-steady camera work, fluid movement cycles, 1080p resolution.'
  };

  const currentStylePrompt = styleKeywords[style as keyof typeof styleKeywords] || styleKeywords['Cinematic-Motion'];

  const prompt = `
    CINEMATIC MASTERPIECE DIRECTIVE: Generate a hyper-realistic, ultra-fluid medical animation film of a human performing "${exercise.title}".
    BIOMECHANICAL ACCURACY: ${exercise.biomechanics}. 
    FLUIDITY: Absolute seamless motion. No frame skipping. Temporal consistency throughout the movement. 
    KINETICS: Realistic human momentum, balance shifts, and natural skeletal flow. Perception of 60fps fluidity.
    VISUAL STYLE: ${currentStylePrompt}. Dark studio environment, neon cyan accents, depth of field.
    TECHNICAL: 1080p, High Bitrate, Cinematic Motion Blur. 
    NO FACES: Focus exclusively on the kinetic execution of the limbs and torso.
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
    console.error("High-Fidelity Motion Error:", e);
    return await fallbackFastVideo(exercise);
  }
};

const fallbackFastVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Extremely smooth cinematic exercise video: ${exercise.title}. Fluid transitions only.`,
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
  const prompt = `Hyper-realistic 4K clinical static visual of ${exercise.title}. Style: ${style}. Clean, professional medical aesthetic on deep slate background.`;
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
  const prompt = `Generate expert clinical exercise data for "${exerciseName}" in JSON format including biomechanics and safety flags.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return {}; }
};

export const runClinicalConsultation = async (text: string, imageBase64?: string): Promise<PatientProfile | null> => {
  const ai = getAI();
  const prompt = `You are an elite Clinical Director. Analyze patient data: "${text}" and return a comprehensive PatientProfile JSON including a structured exercise plan.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 15000 } }
    });
    return JSON.parse(response.text || "{}");
  } catch { return null; }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  const ai = getAI();
  const prompt = `Analyze feedback and pain score: ${JSON.stringify(feedback)}. Update the patient's plan and insights accordingly in PatientProfile JSON format.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return currentProfile; }
};
