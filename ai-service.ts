
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise } from "./types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI'dan gelen veriyi PatientProfile tipine zorlayan ve Bölüm 5 kurallarını uygulayan yardımcı fonksiyon
 */
const mapToPatientProfile = (data: any): PatientProfile => {
  const raw = Array.isArray(data) ? data[0] : data;

  const rawExercises = raw.suggestedPlan || raw.exercisePlan || [];
  const suggestedPlan: Exercise[] = rawExercises.map((ex: any, idx: number) => {
    // Bölüm 5: Dozaj Hesabı Kontrolü (Tekrar sayısı 15 - Ağrı Skoru)
    const pain = raw.painScore || 5;
    const calculatedReps = Math.max(5, 15 - pain);

    return {
      id: ex.id || `ai-ex-${idx}`,
      code: ex.code || ex.name || 'EX-GEN',
      title: ex.title || ex.name || 'İsimsiz Egzersiz',
      category: ex.category || 'Genel Rehabilitasyon',
      difficulty: ex.difficulty || 5,
      sets: ex.sets || 3,
      reps: ex.reps || calculatedReps,
      description: ex.description || ex.instructions || '',
      biomechanics: ex.biomechanics || '',
      safetyFlags: ex.safetyFlags || ex.contraindications || []
    };
  });

  return {
    diagnosisSummary: raw.diagnosisSummary || raw.clinicalDiagnosis || 'Tanı analizi tamamlandı.',
    thinkingProcess: raw.thinkingProcess || 'Klinik muhakeme işlendi.',
    riskLevel: raw.riskLevel || 'Orta',
    contraindications: raw.contraindications || [],
    suggestedPlan: suggestedPlan,
    progressHistory: raw.progressHistory || [],
    latestInsight: {
      summary: raw.latestInsight?.summary || "Klinik değerlendirme yapıldı.",
      recommendation: raw.latestInsight?.recommendation || "Programa sadık kalın.",
      adaptationNote: raw.latestInsight?.adaptationNote || "Faz 1 mobilizasyon.",
      nextStep: raw.latestInsight?.nextStep || "7 gün sonra kontrol.",
      phaseName: (raw.painScore || 5) > 7 ? 'Akut' : 'Sub-Akut'
    }
  };
};

const parseClinicalJson = (rawText: string) => {
  try {
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanText);
    return mapToPatientProfile(parsed);
  } catch (e) {
    console.error("JSON Parsing Error in PhysioCore AI:", e, "Raw Text:", rawText);
    return null;
  }
};

export const runClinicalConsultation = async (text: string, imageBase64?: string): Promise<PatientProfile | null> => {
  console.log("PhysioCore AI: Deep Clinical Analysis Started...");
  
  const prompt = `
    Sen PhysioCore AI Klinik Direktörüsün (Blueprint v3.0).
    
    ANALİZ KURALLARI (Bölüm 5):
    1. GÜVENLİK: Tanı "Herni" (Fıtık) ise fleksiyon yasaktır (safetyFlags'e ekle).
    2. FAZ: Ağrı > 7 ise sadece İZOMETRİK egzersizler.
    3. DOZAJ: reps = 15 - ağrıSkoru (min 5).
    
    GÖREV: Hastanın şikayetini/raporunu incele ve PatientProfile JSON döndür.
    
    HASTA VERİSİ: "${text}"
  `;

  try {
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
        thinkingConfig: { thinkingBudget: 15000 }
      }
    });

    return parseClinicalJson(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  const prompt = `
    Sen Adaptif Karar Motorusun. 
    Hastanın son geri bildirimi: ${JSON.stringify(feedback)}
    Mevcut Profil: ${JSON.stringify(currentProfile)}
    
    GÖREV: Ağrı arttıysa dozajı düşür, azaldıysa zorluğu artır. Bölüm 5 kurallarını unutma.
    Yanıt sadece güncellenmiş PatientProfile JSON olmalı.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return parseClinicalJson(response.text || "{}") || currentProfile;
  } catch (error) {
    console.error("Gemini Adjustment Error:", error);
    return currentProfile;
  }
};
