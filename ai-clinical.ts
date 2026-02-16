
import { getAI } from "./ai-core.ts";
import { Type } from "@google/genai";
import { PatientProfile, ProgressReport, TreatmentHistory, DetailedPainLog } from "./types.ts";

/**
 * PHYSIOCORE CLINICAL REASONING ENGINE
 * Teşhis, Takip ve Stratejik Karar Destek Sistemi
 */

const patientProfileSchema = {
  type: Type.OBJECT,
  properties: {
    user_id: { type: Type.STRING },
    diagnosisSummary: { type: Type.STRING },
    icd10: { type: Type.STRING },
    riskLevel: { type: Type.STRING, description: 'Düşük, Orta veya Yüksek' },
    status: { type: Type.STRING, description: 'Kritik, Stabil, İyileşiyor, Taburcu' },
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
          rehabPhase: { type: Type.STRING }
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

export const generateDashboardInsights = async (profile: PatientProfile): Promise<any> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `Analyze patient progress: ${JSON.stringify(profile)}. Predict recovery trajectory and suggest next best clinical action.` }] }],
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

export const runClinicalConsultation = async (text: string, imageData?: string, history?: TreatmentHistory[], painLogs?: DetailedPainLog[]) => {
  const ai = getAI();
  const parts: any[] = [{ text: `Clinical Analysis Task: ${text}. Return a full PatientProfile JSON object based on the clinical input.` }];
  
  if (imageData) {
    const base64Data = imageData.split(',')[1] || imageData;
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: `Profile: ${JSON.stringify(p)}. Feedback: ${JSON.stringify(f)}. Update program dosage and rehab phase based on clinical flags.` }] }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: patientProfileSchema
    }
  });
  return JSON.parse(response.text);
};
