
import { getAI } from "./ai-core.ts";
import { Type } from "@google/genai";
import { PatientProfile, ProgressReport } from "./types.ts";
import { ClinicalRules } from "./ClinicalRules.ts";

/**
 * PHYSIOCORE CLINICAL REASONING ENGINE v8.0 (Flash Optimized)
 * High efficiency, low latency clinical reasoning using Gemini 3 Flash.
 */

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
    model: 'gemini-3-flash-preview', // Pro modelinden Flash'a geçildi (Hız/Maliyet Optimizasyonu)
    contents: [{ parts }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: patientProfileSchema,
      temperature: 0.1 // Maksimum klinik tutarlılık
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
