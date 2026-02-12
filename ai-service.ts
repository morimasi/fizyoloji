import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * AI Studio Key Selection Logic
 * Veo ve Imagen 3 modelleri için kullanıcı kendi anahtarını seçmelidir.
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
 * Maliyet Tasarrufu: Video sadece kütüphanede yoksa üretilir.
 * Veo modelleri için özel yetkilendirme akışı içerir.
 */
export const generateExerciseVideo = async (
  exercise: Partial<Exercise>, 
  style: string = 'Cinematic-Motion'
): Promise<string> => {
  if (exercise.videoUrl) return exercise.videoUrl;

  try {
    const apiKey = await ensureApiKey();
    const ai = getAIClient(apiKey);
    const prompt = `Medical rehabilitation animation: ${exercise.titleTr || exercise.title}. Style: ${style}. Biomechanics focus: ${exercise.biomechanics}. Ensure clear musculoskeletal visibility.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview', 
      prompt: prompt,
      config: { 
        numberOfVideos: 1, 
        resolution: '720p', 
        aspectRatio: '16:9' 
      }
    });

    let attempts = 0;
    while (!operation.done && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      attempts++;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const res = await fetch(`${downloadLink}&key=${apiKey}`);
      if (!res.ok) {
         if (res.status === 404) {
           // Key selection error fallback
           console.error("Requested entity not found. Resetting key selection.");
           const aistudio = (window as any).aistudio;
           if (aistudio) await aistudio.openSelectKey();
         }
         throw new Error(`Video fetch failed: ${res.statusText}`);
      }
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return '';
  } catch (e) {
    console.error("Video Gen Error:", e);
    return '';
  }
};

/**
 * Karar Destek Sistemi - Cache-First & Flash Optimized
 */
export const runClinicalConsultation = async (
  text: string, 
  imageBase64?: string,
  history?: TreatmentHistory[],
  painLogs?: DetailedPainLog[]
): Promise<PatientProfile | null> => {
  const inputHash = PhysioDB.generateHash(text + (imageBase64 ? 'img' : ''));
  
  const cached = PhysioDB.getCachedResponse(inputHash);
  if (cached) {
    console.log("[COST_SAVER] Returning cached clinical analysis.");
    return cached.data;
  }

  try {
    const apiKey = process.env.API_KEY || await ensureApiKey();
    const ai = getAIClient(apiKey);
    const prompt = `Fizyoterapist Karar Destek Sistemi Analizi.
    Girdi: "${text}"
    Geçmiş: ${JSON.stringify(history || [])}
    Ağrı Logları: ${JSON.stringify(painLogs || [])}
    
    Lütfen bu verileri analiz et ve bir PatientProfile JSON nesnesi döndür. 
    Kategoriler: 'Spine', 'Lower Limb', 'Upper Limb', 'Stability', 'Neurological'.
    Rehabilitasyon Fazları: 'Akut', 'Sub-Akut', 'Kronik', 'Performans'.`;

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
        temperature: 0.1,
        systemInstruction: "Sen kıdemli bir klinik fizyoterapist ve rehabilitasyon uzmanısın. Kanıta dayalı tıp (EBM) protokollerine göre yanıt ver."
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
    const apiKey = process.env.API_KEY || await ensureApiKey();
    const ai = getAIClient(apiKey);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Feedback: ${JSON.stringify(feedback)}. Current Profile: ${JSON.stringify(currentProfile)}. 
      Lütfen ağrı skoru ve geri bildirime göre egzersiz dozajını (set/tekrar) güncelle.
      Ağrı skoru 7 ve üzerindeyse dozajı %50 azalt, 3 ve altındaysa %20 artır.
      Dönüş değeri güncellenmiş PatientProfile JSON olmalıdır.`,
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
      contents: { parts: [{ text: `High-fidelity 4K Medical Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}. Focus on biomechanical correctness and muscle activation visibility.` }] },
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
      contents: `Biyomekanik veriler oluştur: "${exerciseName}". 
      İstenen JSON formatı: { 
        "title": string, 
        "titleTr": string, 
        "category": string, 
        "difficulty": number (1-10), 
        "sets": number, 
        "reps": number, 
        "description": string, 
        "biomechanics": string, 
        "safetyFlags": string[], 
        "muscleGroups": string[], 
        "rehabPhase": string 
      }`,
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
      contents: `Şu egzersizi "${goal}" hedefi için optimize et: ${JSON.stringify(exercise)}. 
      Sadece dozajı değil, biyomekanik notları da hedefe göre uyarla.
      Dönüş değeri Exercise tipinde JSON olmalıdır.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("Optimization Error:", err);
    return exercise;
  }
};