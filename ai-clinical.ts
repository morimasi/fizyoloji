
import { getAI } from "./ai-core.ts";
import { Type } from "@google/genai";
import { PatientProfile, ProgressReport } from "./types.ts";

/**
 * PHYSIOCORE CLINICAL REASONING ENGINE v6.0
 * Model: gemini-3-flash-preview
 * Uzmanlık: Ortopedik ve Nörolojik Rehabilitasyon
 */

const patientProfileSchema = {
  type: Type.OBJECT,
  properties: {
    user_id: { type: Type.STRING },
    diagnosisSummary: { type: Type.STRING },
    riskLevel: { type: Type.STRING, description: 'Düşük, Orta veya Yüksek' },
    status: { type: Type.STRING },
    rehabPhase: { type: Type.STRING, description: 'Akut, Sub-Akut, Kronik, Performans' },
    suggestedPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          code: { type: Type.STRING },
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          difficulty: { type: Type.NUMBER },
          sets: { type: Type.NUMBER },
          reps: { type: Type.NUMBER },
          description: { type: Type.STRING },
          biomechanics: { type: Type.STRING },
          rehabPhase: { type: Type.STRING },
          targetRpe: { type: Type.NUMBER }
        }
      }
    },
    physicalAssessment: {
      type: Type.OBJECT,
      properties: {
        posture: { type: Type.STRING },
        recoveryTrajectory: { type: Type.NUMBER }
      }
    },
    latestInsight: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        nextStep: { type: Type.STRING }
      }
    }
  }
};

export const runClinicalConsultation = async (text: string, imageData?: string) => {
  const ai = getAI();
  const parts: any[] = [{ 
    text: `Sen dünya standartlarında bir fizyoterapistsin. Aşağıdaki verileri analiz et ve profesyonel bir PatientProfile JSON objesi döndür. 
    Kural: Ağrı VAS skoru yüksekse (7+) sadece izometrik egzersizler öner. 
    Girdi: ${text}` 
  }];
  
  if (imageData) {
    const base64Data = imageData.split(',')[1] || imageData;
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: base64Data }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: patientProfileSchema
    }
  });
  
  return JSON.parse(response.text);
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ 
      text: `Mevcut Profil: ${JSON.stringify(p)}. Geri Bildirim: ${JSON.stringify(f)}. 
      Kural: Tekrar sayısını max(5, 15 - ağrı_skoru) formülüne göre uyarla. 
      Egzersiz programını klinik verilere göre güncelle ve yeni JSON döndür.` 
    }] }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: patientProfileSchema
    }
  });
  return JSON.parse(response.text);
};

export const generateDashboardInsights = async (profile: PatientProfile): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Hasta gelişimini analiz et: ${JSON.stringify(profile)}. İyileşme hızını ve bir sonraki klinik adımı belirle.` }] }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          nextStep: { type: Type.STRING },
          recoveryTrajectory: { type: Type.NUMBER }
        }
      }
    }
  });
  return JSON.parse(response.text);
};
