
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * API Anahtarı Seçim Protokolü (Veo ve Gemini 3 Pro için zorunlu)
 * Kullanıcının ücretli bir API anahtarı seçtiğinden emin olur.
 */
const ensureApiKey = async (): Promise<void> => {
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Yarış durumunu (race condition) önlemek için seçim tetiklendikten sonra devam edilir.
      // process.env.API_KEY otomatik olarak güncellenecektir.
    }
  }
};

/**
 * Genişletilmiş Video Üretim Motoru (v4.2 - Production Stable)
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
    // Veo modelleri için anahtar seçimini zorunlu kıl
    await ensureApiKey();
    
    // SDK KURALI: Her API çağrısından hemen önce yeni instance oluşturulmalıdır.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
       throw new Error("API_KEY missing. Please select a valid key from the dialog.");
    }
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
      // API Key indirme linkine eklenmelidir
      const res = await fetch(`${downloadLink}&key=${apiKey}`);
      
      if (res.status === 404 || (res.status === 403)) {
        // "Requested entity was not found" veya yetki hatası durumunda anahtar seçimini sıfırla
        const aistudio = (window as any).aistudio;
        if (aistudio) await aistudio.openSelectKey();
        throw new Error("API Key validation failed. Please select a valid paid project key.");
      }
      
      if (!res.ok) throw new Error(`Video fetch failed with status: ${res.status}`);
      
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return '';
  } catch (e: any) {
    console.error("Advanced Video Gen Error:", e);
    // Hata mesajı anahtar eksikliğini belirtiyorsa diyaloğu aç
    if (e.message?.includes("API Key") || e.message?.includes("not found")) {
      const aistudio = (window as any).aistudio;
      if (aistudio) await aistudio.openSelectKey();
    }
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
