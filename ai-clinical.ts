
import { getAI, isApiKeyError } from "./ai-core.ts";
import { Type } from "@google/genai";
import { PatientProfile, ProgressReport } from "./types.ts";
import { ClinicalRules } from "./ClinicalRules.ts";

/**
 * PHYSIOCORE CLINICAL REASONING ENGINE v9.5
 * Adheres to Blueprint Section 5 Strategy
 */

const patientProfileSchema = {
  type: Type.OBJECT,
  properties: {
    diagnosisSummary: { type: Type.STRING },
    riskLevel: { type: Type.STRING },
    status: { type: Type.STRING },
    rehabPhase: { type: Type.STRING },
    involvedSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          code: { type: Type.STRING },
          title: { type: Type.STRING },
          titleTr: { type: Type.STRING },
          sets: { type: Type.NUMBER },
          reps: { type: Type.NUMBER },
          biomechanics: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    latestInsight: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        clinicalNote: { type: Type.STRING },
        recoveryTrajectory: { type: Type.NUMBER }
      }
    }
  }
};

export const runClinicalConsultation = async (text: string, imageData?: string) => {
  try {
    const ai = getAI();
    // Blueprint Section 5 personası
    const systemPrompt = `GÖREV: Senior Klinik Direktör ve Fizyoterapist.
      KURAL SETİ (Blueprint v3.0):
      1. Patoloji Seviyesi Belirle: (L4-L5, C5-C6 vb.)
      2. Dozaj Motoru: Tekrar sayısı = 15 - ağrıSkoru.
      3. Güvenlik Filtresi: Disk hernisi saptarsan fleksiyon içeren egzersizlerden kaçın.
      4. Çıktı: Sadece geçerli bir JSON objesi döndür.`;

    const parts: any[] = [{ text: `${systemPrompt}\n\nKlinik Girdi: ${text}` }];
    
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
        temperature: 0.2
      }
    });
    
    return JSON.parse(response.text);
  } catch (err) {
    if (isApiKeyError(err)) {
       await (window as any).aistudio?.openSelectKey();
    }
    throw err;
  }
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
  try {
    const ai = getAI();
    const dynamicReps = ClinicalRules.calculateDynamicReps(f.painScore);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ 
        text: `ADAPTİF REÇETE GÜNCELLEMESİ:
        Mevcut Profil: ${JSON.stringify(p)}
        Yeni Geri Bildirim: ${JSON.stringify(f)}
        Zorunlu Tekrar Sayısı: ${dynamicReps}
        GÖREV: Hastanın iyileşme hızını (recoveryTrajectory) güncelle ve programı adapte et.` 
      }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: patientProfileSchema
      }
    });
    return JSON.parse(response.text);
  } catch (err) {
    if (isApiKeyError(err)) {
       await (window as any).aistudio?.openSelectKey();
    }
    throw err;
  }
};

/**
 * Kanıta Dayalı Tıp (EBM) Araştırması - Google Search Grounding Kullanımı
 */
export const runClinicalEBMSearch = async (query: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      text: response.text || "Aradığınız kriterlere uygun güncel literatür verisi bulunamadı.",
      links: links
    };
  } catch (err) {
    if (isApiKeyError(err)) {
       await (window as any).aistudio?.openSelectKey();
    }
    throw err;
  }
};

/**
 * Yakın Kliniklerin Bulunması - Google Maps Grounding Kullanımı
 */
export const findNearbyClinics = async (latitude: number, longitude: number) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Bana en yakın ve puanı yüksek olan fizik tedavi ve rehabilitasyon kliniklerini listele.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude
            }
          }
        }
      },
    });

    const clinics = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      text: response.text || "Yakınınızda sevk edilebilecek aktif bir klinik bulunamadı.",
      clinics: clinics
    };
  } catch (err) {
    if (isApiKeyError(err)) {
       await (window as any).aistudio?.openSelectKey();
    }
    throw err;
  }
};
