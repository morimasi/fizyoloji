
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - FREE-TIER OPTIMIZED (v5.0)
 * Replaced Veo (Paid Video) with Flash-Core Vector Dynamics.
 */

export const ensureApiKey = async (): Promise<string> => {
  // Free tier modelleri için varsayılan anahtar kontrolü
  const key = process.env.API_KEY;
  if (key && key !== "undefined" && key !== "") return key;
  
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    await aistudio.openSelectKey();
    throw new Error("MISSING_API_KEY");
  }
  throw new Error("MISSING_API_KEY");
};

/**
 * Ücretli Video Üretimi Yerine Ücretsiz Vektörel/Görsel Üretimi
 */
export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  // VE-O (Ücretli) servis devredışı bırakıldı. 
  // Bunun yerine Flash Image modelinden yüksek kaliteli bir ana görsel alıp CSS ile canlandırıyoruz.
  return await generateExerciseVisual(exercise, 'Medical-Vector-Art');
};

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
    const prompt = `Sen kıdemli bir klinik uzmanısın. Ücretsiz model (Flash) optimizasyonuyla çalışıyorsun.
    Girdi: "${text}"
    Analiz et ve PatientProfile JSON döndür.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Pro'dan Flash'a düşürüldü (Hızlı ve Ücretsiz)
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { 
        responseMimeType: "application/json"
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
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Ücretsiz katman modeli
      contents: `Feedback: ${JSON.stringify(feedback)}. Profil: ${JSON.stringify(currentProfile)}. JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return currentProfile;
  }
};

// Added missing exercise optimization function to satisfy requirements in ExerciseForm.tsx
export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Optimize et (JSON): Hedef: "${goal}". Mevcut Egzersiz Verisi: ${JSON.stringify(exercise)}. 
      Görevin: Biyomekanik parametreleri, set, tekrar ve dinlenme sürelerini belirtilen klinik hedefe göre güncelle. Sadece JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("Optimization Service Error:", err);
    return exercise;
  }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Yüksek hızlı ücretsiz/ucuz görsel modeli
      contents: { parts: [{ text: `High-fidelity Medical Vector Illustration: ${exercise.titleTr || exercise.title}. Style: ${style}. White background, neon accents.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (e) {
    return '';
  }
};

export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Ücretsiz katman
      contents: `Biyomekanik veriler oluştur (JSON): "${exerciseName}".`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return {};
  }
};
