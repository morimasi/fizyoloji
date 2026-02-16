
import { getAI } from "./ai-core.ts";
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, ProgressReport } from "./types.ts";
import { ClinicalRules } from "./ClinicalRules.ts";

/**
 * PHYSIOCORE CLINICAL REASONING ENGINE v9.0 (EBM & Referral Integration)
 */

export const runClinicalEBMSearch = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Aşağıdaki klinik soru için Kanıta Dayalı Tıp (EBM) protokollerini araştır ve profesyonel bir fizyoterapist diliyle yanıtla: ${query}` }] }],
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return { text, links };
};

export const findNearbyClinics = async (lat: number, lng: number, specialty: string = "fizyoterapi") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ parts: [{ text: `Şu koordinatlardaki en iyi ${specialty} kliniklerini bul: Latitude ${lat}, Longitude ${lng}` }] }],
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    },
  });

  const text = response.text;
  const clinics = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return { text, clinics };
};

// ... existing code ...
const patientProfileSchema = {
  type: Type.OBJECT,
  properties: {
    user_id: { type: Type.STRING },
    diagnosisSummary: { type: Type.STRING },
    riskLevel: { type: Type.STRING },
    status: { type: Type.STRING },
    rehabPhase: { type: Type.STRING },
    suggestedPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          code: { type: Type.STRING },
          title: { type: Type.STRING },
          difficulty: { type: Type.NUMBER },
          sets: { type: Type.NUMBER },
          reps: { type: Type.NUMBER },
          description: { type: Type.STRING },
          biomechanics: { type: Type.STRING },
          clinicalNote: { type: Type.STRING }
        }
      }
    },
    latestInsight: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        recoveryTrajectory: { type: Type.NUMBER }
      }
    }
  }
};

export const runClinicalConsultation = async (text: string, imageData?: string) => {
  const ai = getAI();
  const systemPrompt = `Sen Senior Klinik Fizyoterapistsin. 
    HIZLI ANALİZ PROTOKOLÜ:
    1. Ağrı > 7 ise: Sadece izometrik/stabilizasyon odaklı planla.
    2. Dozaj Formülü: Tekrar sayısı = 15 - ağrıSkoru (min 5).
    3. Anatomik Seviye: Patoloji bölgesini (örn: L4-L5) belirle.
    4. Yanıtı mutlaka JSON formatında döndür.`;

  const parts: any[] = [{ text: `${systemPrompt}\n\nGirdi: ${text}` }];
  
  if (imageData) {
    const base64Data = imageData.split(',')[1] || imageData;
    parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: [{ parts }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: patientProfileSchema,
      temperature: 0.1
    }
  });
  
  return JSON.parse(response.text);
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
  const ai = getAI();
  const calculatedReps = ClinicalRules.calculateDynamicReps(f.painScore);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ 
      text: `GÜNCELLEME PROTOKOLÜ:
      Mevcut: ${JSON.stringify(p)}
      Geri Bildirim: ${JSON.stringify(f)}
      Kural: Tekrar sayısını ${calculatedReps} olarak güncelle.
      Zorluk Ayarı: Ağrı arttıysa -1, azaldıysa +1.` 
    }] }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: patientProfileSchema
    }
  });
  return JSON.parse(response.text);
};
