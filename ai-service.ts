
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * API Anahtarı Seçim Protokolü (Veo ve Gemini 3 Pro için zorunlu)
 */
const ensureApiKey = async (): Promise<void> => {
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Yarış durumunu (race condition) önlemek için seçim sonrası doğrudan devam ediyoruz.
    }
  }
};

/**
 * Genişletilmiş Video Üretim Motoru (v4.1 - Production)
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
    await ensureApiKey();
    
    // Her çağrı için yeni instance (SDK kuralları gereği)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
      const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (res.status === 404) {
        // Eğer anahtar geçersizse tekrar seçim kutusunu aç
        const aistudio = (window as any).aistudio;
        if (aistudio) await aistudio.openSelectKey();
        throw new Error("Requested entity was not found - API Key reset required.");
      }
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Sen kıdemli bir klinik rehabilitasyon uzmanısın.
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
        systemInstruction: "Kesinlikle tıbbi terminoloji kullan ve JSON formatında yanıt ver."
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Feedback: ${JSON.stringify(feedback)}. Mevcut Profil: ${JSON.stringify(currentProfile)}. Adaptif güncelleme yap ve JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return currentProfile; }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-fidelity 4K Medical Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}. Biomechanics focused.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (e) {
    console.error("Image Gen Error:", e);
    return '';
  }
};

export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  const inputHash = PhysioDB.generateHash(`exdata_${exerciseName}`);
  const cached = PhysioDB.getCachedResponse(inputHash);
  if (cached) return cached.data;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Biyomekanik veriler oluştur (JSON): "${exerciseName}". Dahil et: reps, sets, tempo, muscleGroups.`,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || "{}");
    PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch { return {}; }
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Şu egzersizi "${goal}" hedefi için optimize et (JSON): ${JSON.stringify(exercise)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return exercise; }
};
