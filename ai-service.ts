
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory } from "./types.ts";

// Üretim ortamında API anahtarının kontrolü
const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("CRITICAL: API_KEY is missing in environment variables.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Cinema Motion Engine v5.5: AI Video Generation
 */
export const generateExerciseVideo = async (
  exercise: Partial<Exercise>, 
  style: string = 'Cinematic-Motion',
  directorialNote: string = ''
): Promise<string> => {
  const ai = getAIClient();
  const prompt = `
    Generate an ultra-fluid, 1080p medical animation film of a person performing "${exercise.titleTr || exercise.title}".
    STYLE: ${style}. BIOMECHANICS: ${exercise.biomechanics}. 
    NOTE: ${directorialNote}
  `;

  try {
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
    const maxAttempts = 30;

    while (!operation.done && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      attempts++;
    }

    if (!operation.done) throw new Error("Video generation timed out.");

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!res.ok) throw new Error("Failed to fetch video blob.");
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
 * AI Karar Destek Sistemi - Gemini 3 Pro ile en üst düzey muhakeme
 */
export const runClinicalConsultation = async (
  text: string, 
  imageBase64?: string,
  history?: TreatmentHistory[],
  painLogs?: DetailedPainLog[]
): Promise<PatientProfile | null> => {
  const ai = getAIClient();
  const prompt = `
    KLİNİK ANALİZ TALEBİ:
    Güncel Şikayet: "${text}"
    Geçmiş Tedaviler: ${JSON.stringify(history || [])}
    Son Ağrı Kayıtları: ${JSON.stringify(painLogs || [])}
    
    GÖREV: Hastanın geçmişini ve şikayetini tıbbi bir fizyoterapist titizliğiyle analiz et. 
    Dozajları şu formüle göre belirle: max(5, 15 - painScore).
    JSON formatında PatientProfile döndür.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // En karmaşık klinik veriler için Pro modeli
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { 
        responseMimeType: "application/json",
        temperature: 0.1 
      }
    });
    return JSON.parse(response.text || "null");
  } catch (err) {
    console.error("Clinical Consultation Error:", err);
    return null; 
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  const ai = getAIClient();
  const prompt = `Adapt exercise plan based on feedback: ${JSON.stringify(feedback)}. Return complete PatientProfile JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return currentProfile; }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Hyper-realistic 4K medical visual of ${exercise.titleTr || exercise.title}. Style: ${style}.`;
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
  const ai = getAIClient();
  const prompt = `Generate expert clinical exercise data for "${exerciseName}" including biomechanics in JSON format.`;
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
  const ai = getAIClient();
  const prompt = `Optimize for "${goal}": ${JSON.stringify(exercise)}. Update counts and tempo. Return JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch { return exercise; }
};
