
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise } from "./types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AI'dan gelen veriyi PatientProfile tipine zorlayan yardımcı fonksiyon
 */
const mapToPatientProfile = (data: any): PatientProfile => {
  // AI bazen dizi döndürebilir, ilk elemanı al
  const raw = Array.isArray(data) ? data[0] : data;

  // Egzersizleri normalize et
  const rawExercises = raw.suggestedPlan || raw.exercisePlan || [];
  const suggestedPlan: Exercise[] = rawExercises.map((ex: any, idx: number) => ({
    id: ex.id || `ai-ex-${idx}`,
    code: ex.code || ex.name || 'EX-GEN',
    title: ex.title || ex.name || 'İsimsiz Egzersiz',
    category: ex.category || 'Genel Rehabilitasyon',
    difficulty: ex.difficulty || 5,
    sets: ex.sets || 3,
    reps: ex.reps || 10,
    description: ex.description || ex.instructions || '',
    biomechanics: ex.biomechanics || '',
    safetyFlags: ex.safetyFlags || ex.contraindications || []
  }));

  return {
    diagnosisSummary: raw.diagnosisSummary || raw.clinicalDiagnosis || 'Tanı analizi tamamlandı.',
    thinkingProcess: raw.thinkingProcess || 'Klinik muhakeme işlendi.',
    riskLevel: raw.riskLevel || 'Orta',
    contraindications: raw.contraindications || [],
    suggestedPlan: suggestedPlan,
    progressHistory: raw.progressHistory || [],
    latestInsight: raw.latestInsight || null
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
  console.log("PhysioCore AI: Clinical Consultation Started...");
  
  const prompt = `
    Sen PhysioCore AI Klinik Direktörüsün.
    
    GÖREV: Hastanın şikayetini analiz et ve Bölüm 5 algoritmalarına göre bir PatientProfile JSON oluştur.
    
    KURALLAR:
    1. Yanıt SADECE JSON olmalı.
    2. "diagnosisSummary" (string), "thinkingProcess" (string), "riskLevel" ("Düşük"|"Orta"|"Yüksek"), "contraindications" (string[]), "suggestedPlan" (Exercise[]) alanlarını içermeli.
    3. Exercise nesnesi şunları içermeli: "id", "code", "title", "category", "difficulty", "sets", "reps", "description", "biomechanics", "safetyFlags".
    4. "Herni" varsa fleksiyon yasaktır. VAS > 7 ise sadece izometrik.

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
        responseMimeType: "application/json"
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
    Mevcut programı hastanın yeni geri bildirimine göre güncelle.
    Yanıt sadece güncellenmiş PatientProfile JSON formatında olmalı.
    MEVCUT: ${JSON.stringify(currentProfile)}
    GERİ BİLDİRİM: ${JSON.stringify(feedback)}
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
