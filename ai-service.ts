import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * AI Studio Key Selection Logic
 */
const ensureApiKey = async (): Promise<string> => {
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
    }
  }
  
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("API_KEY missing. Please select a valid key from the dialog.");
  }
  return key;
};

const getAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

/**
 * Genişletilmiş Video Üretim Motoru (v4.0)
 * Anatomik katmanları ve reji notlarını işler.
 */
export const generateExerciseVideo = async (
  exercise: Partial<Exercise>, 
  style: string = 'Cinematic-Motion',
  directorialNotes: {
    camera?: string;
    lighting?: string;
    focus?: string;
    speed?: string;
  } = {}
): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = getAIClient(apiKey);
    
    // Klinik Prompt Mühendisliği
    const prompt = `
      MEDICAL GRADE SIMULATION: ${exercise.titleTr || exercise.title}. 
      VISUAL STYLE: ${style}. 
      BIOMECHANICS: ${exercise.biomechanics}.
      DIRECTOR'S CUT PARAMETERS:
      - Camera Angle: ${directorialNotes.camera || 'Dynamic Clinical'}
      - Lighting: ${directorialNotes.lighting || 'High Contrast Medical'}
      - Detail Focus: ${directorialNotes.focus || 'Musculoskeletal Integrity'}
      - Simulation Speed: ${directorialNotes.speed || 'Natural Rhythm'}
      
      INSTRUCTION: Show exact anatomical movement. If muscular style, highlight primary muscles: ${exercise.muscleGroups?.join(', ') || 'Agonist chains'}. 
      Ensure 4K high-fidelity textures. No artifacts.
    `;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview', 
      prompt: prompt,
      config: { 
        numberOfVideos: 1, 
        resolution: '1080p', 
        aspectRatio: '16:9' 
      }
    });

    let attempts = 0;
    while (!operation.done && attempts < 40) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      attempts++;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const res = await fetch(`${downloadLink}&key=${apiKey}`);
      if (!res.ok) throw new Error("Video fetch failed");
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return '';
  } catch (e) {
    console.error("Advanced Video Gen Error:", e);
    return '';
  }
};

/**
 * Karar Destek Sistemi - Flash Optimized
 */
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
    const apiKey = process.env.API_KEY || await ensureApiKey();
    const ai = getAIClient(apiKey);
    const prompt = `Fizyoterapist Karar Destek Sistemi Analizi.
    Girdi: "${text}"
    Geçmiş: ${JSON.stringify(history || [])}
    Ağrı Logları: ${JSON.stringify(painLogs || [])}
    Analiz et ve bir PatientProfile JSON nesnesi döndür.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        systemInstruction: "Sen kıdemli bir klinik rehabilitasyon uzmanısın."
      }
    });

    const result = JSON.parse(response.text || "null");
    if (result) PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch (err) {
    return null; 
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  try {
    const apiKey = process.env.API_KEY || await ensureApiKey();
    const ai = getAIClient(apiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Feedback: ${JSON.stringify(feedback)}. Profile: ${JSON.stringify(currentProfile)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return currentProfile; }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  if (exercise.visualUrl) return exercise.visualUrl;
  try {
    const apiKey = process.env.API_KEY || await ensureApiKey();
    const ai = getAIClient(apiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-fidelity 4K Medical Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return '';
  } catch { return ''; }
};

export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  const inputHash = PhysioDB.generateHash(`exdata_${exerciseName}`);
  const cached = PhysioDB.getCachedResponse(inputHash);
  if (cached) return cached.data;
  try {
    const apiKey = process.env.API_KEY || await ensureApiKey();
    const ai = getAIClient(apiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Biyomekanik veriler oluştur: "${exerciseName}".`,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || "{}");
    PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch { return {}; }
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = process.env.API_KEY || await ensureApiKey();
    const ai = getAIClient(apiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Şu egzersizi "${goal}" hedefi için optimize et: ${JSON.stringify(exercise)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return exercise; }
};
