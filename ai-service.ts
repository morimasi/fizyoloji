
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - GENESIS AI CONNECTION PROTOCOL (v4.6)
 * Error Handling Strategy:
 * 1. Strictly prevent SDK initialization if API key is invalid.
 * 2. Catch and suppress SDK-level "API key must be set" errors.
 * 3. Re-trigger key selection on "Requested entity was not found" (Billing/Project issues).
 */
export const ensureApiKey = async (): Promise<string> => {
  const key = process.env.API_KEY;
  const isKeyValid = key && key !== "undefined" && key !== "";

  if (isKeyValid) return key as string;

  const aistudio = (window as any).aistudio;
  if (aistudio) {
    // Race condition: trigger selection but we must stop current execution to prevent SDK crash
    await aistudio.openSelectKey();
    throw new Error("MISSING_API_KEY");
  }

  throw new Error("MISSING_API_KEY");
};

/**
 * Merkezi AI Hata Yönetimi
 * SDK'nın fırlattığı veya bizim fırlattığımız anahtar hatalarını yakalar.
 */
const handleAiError = async (error: any) => {
  const errorMessage = error?.message || "";
  
  // Bilinen anahtar hataları
  const isMissingKey = errorMessage.includes("API key must be set") || errorMessage === "MISSING_API_KEY";
  const isNotFoundError = errorMessage.includes("Requested entity was not found");

  if (isMissingKey || isNotFoundError) {
    console.warn("[PhysioCore] AI Key Error Detected:", errorMessage);
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      // Kullanıcıyı tekrar seçime zorla
      await aistudio.openSelectKey();
    }
    // Hata zaten loglandı, akışı sessizce durdurmak için tekrar fırlatmiyoruz (caller check returning empty)
    return; 
  }

  // Bilinmeyen bir hataysa (Kota, network vb.) yukarı fırlat
  throw error;
};

/**
 * Genişletilmiş Video Üretim Motoru (v4.6 - Veo Optimized)
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
    // Her çağrıda yeni instance (Google SDK kuralı)
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      MEDICAL GRADE SIMULATION: ${exercise.titleTr || exercise.title}. 
      VISUAL STYLE: ${style}. 
      BIOMECHANICS: ${exercise.biomechanics}.
      DIRECTOR'S CUT PARAMETERS:
      - Camera Angle: ${directorialNotes.camera || 'Dynamic Clinical'}
      - Lighting: ${directorialNotes.lighting || 'High Contrast Medical'}
      - Detail Focus: ${directorialNotes.focus || 'Musculoskeletal Integrity'}
      - Simulation Speed: ${directorialNotes.speed || 'Natural Rhythm'}
      
      INSTRUCTION: Show exact anatomical movement. Highlight primary muscles: ${exercise.muscleGroups?.join(', ') || 'Agonist chains'}. 
      Ensure 4K high-fidelity textures. Professional cinematography.
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

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const res = await fetch(`${downloadLink}&key=${apiKey}`);
      if (!res.ok) throw new Error(`Video fetch error: ${res.status}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return '';
  } catch (e: any) {
    await handleAiError(e);
    return '';
  }
};

/**
 * Klinik Danışmanlık Motoru
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
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Sen kıdemli bir klinik rehabilitasyon uzmanısın.
    Girdi: "${text}"
    Geçmiş: ${JSON.stringify(history || [])}
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
        systemInstruction: "Kesinlikle tıbbi terminoloji kullan ve JSON formatında yanıt ver."
      }
    });

    const result = JSON.parse(response.text || "null");
    if (result) PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch (err: any) {
    await handleAiError(err);
    return null;
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Feedback: ${JSON.stringify(feedback)}. Mevcut Profil: ${JSON.stringify(currentProfile)}. Adaptif güncelleme yap ve JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err: any) {
    await handleAiError(err);
    return currentProfile;
  }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-fidelity 4K Medical Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}. Biomechanics focused.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return '';
  } catch (e: any) {
    await handleAiError(e);
    return '';
  }
};

export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  const inputHash = PhysioDB.generateHash(`exdata_${exerciseName}`);
  const cached = PhysioDB.getCachedResponse(inputHash);
  if (cached) return cached.data;
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Biyomekanik veriler oluştur (JSON): "${exerciseName}". Dahil et: reps, sets, tempo, muscleGroups.`,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || "{}");
    PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch (err: any) {
    await handleAiError(err);
    return {};
  }
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Şu egzersizi "${goal}" hedefi için optimize et (JSON): ${JSON.stringify(exercise)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err: any) {
    await handleAiError(err);
    return exercise;
  }
};
