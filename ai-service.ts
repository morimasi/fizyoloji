
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise } from "./types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI Üretim Stüdyosu: Egzersiz detaylarını otomatik üretir.
 */
export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  const prompt = `
    Sen bir Biyomekanik Uzmanı ve Fizyoterapistsin.
    "${exerciseName}" isimli egzersiz için şu verileri JSON formatında üret:
    - description: Adım adım uygulama talimatı.
    - biomechanics: Hangi kasın nasıl çalıştığına dair klinik analiz.
    - safetyFlags: Hangi durumlarda yasak olduğu (Kritik uyarılar).
    - category: Vücut bölgesi (Spine, Lower Limb, Upper Limb vb.)
    - difficulty: 1-10 arası zorluk.
    - code: Kısa klinik kod (Örn: LUMB-05).
    
    Yanıt SADECE JSON olmalı.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Studio AI Error:", e);
    return {};
  }
};

const mapToPatientProfile = (data: any): PatientProfile => {
  const raw = Array.isArray(data) ? data[0] : data;
  const pain = raw.painScore || 5;
  const calculatedReps = Math.max(5, 15 - pain);

  const rawExercises = raw.suggestedPlan || raw.exercisePlan || [];
  const suggestedPlan: Exercise[] = rawExercises.map((ex: any, idx: number) => ({
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
  }));

  return {
    diagnosisSummary: raw.diagnosisSummary || raw.clinicalDiagnosis || 'Analiz tamamlandı.',
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
      phaseName: pain > 7 ? 'Akut' : 'Sub-Akut'
    }
  };
};

export const runClinicalConsultation = async (text: string, imageBase64?: string): Promise<PatientProfile | null> => {
  const prompt = `
    Sen PhysioCore AI Klinik Direktörüsün (Blueprint v3.0).
    HASTA VERİSİ: "${text}"
    GÖREV: Hastanın durumunu analiz et ve Bölüm 5 algoritmalarına göre bir PatientProfile JSON oluştur.
    Hız ve güvenlik odaklı ol.
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
        thinkingConfig: { thinkingBudget: 10000 }
      }
    });
    const cleanText = (response.text || "{}").replace(/```json/g, "").replace(/```/g, "").trim();
    return mapToPatientProfile(JSON.parse(cleanText));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  const prompt = `
    Mevcut programı hastanın yeni geri bildirimine göre güncelle.
    MEVCUT: ${JSON.stringify(currentProfile)}
    GERİ BİLDİRİM: ${JSON.stringify(feedback)}
    Sadece güncellenmiş PatientProfile JSON döndür.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const cleanText = (response.text || "{}").replace(/```json/g, "").replace(/```/g, "").trim();
    return mapToPatientProfile(JSON.parse(cleanText));
  } catch (error) {
    return currentProfile;
  }
};
