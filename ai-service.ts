
import { GoogleGenAI } from "@google/genai";
import { PatientProfile, ProgressReport } from "./types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * PHYSIOCORE AI BRAIN - CLINICAL REASONING ENGINE
 * Bu servis, fizyo.md Bölüm 5'teki algoritmaları (PhysioBrain_AI sınıfı) 
 * Gemini modelinin muhakeme (thinking) katmanına enjekte eder.
 */

export const runClinicalConsultation = async (text: string, imageBase64?: string): Promise<PatientProfile> => {
  const prompt = `
    Sen PhysioCore AI Klinik Direktörüsün. Blueprint (fizyo.md) Bölüm 5'teki algoritmaları uygulamakla yükümlüsün.
    
    KLİNİK ALGORİTMA KURALLARI (Bölüm 5):
    1. GÜVENLİK FİLTRESİ: Eğer tanıda "Herni" (Fıtık) varsa, "Fleksiyon" (Öne eğilme) içeren egzersizleri yasakla.
    2. FAZ ANALİZİ: 
       - Ağrı Skoru (VAS) > 7 ise: SADECE "İzometrik" veya "Relaksasyon" egzersizleri ata.
       - Ağrı Skoru (VAS) <= 7 ise: Güçlendirme ve Mobilizasyon egzersizlerine geç.
    3. DOZAJ HESABI: Tekrar sayısı = max(5, 15 - Ağrı Skoru) formülüyle hesaplanmalıdır.
    4. RİSK ANALİZİ: Kontrendikasyon varsa RiskLevel'ı 'Yüksek' olarak işaretle.

    HASTA VERİSİ: "${text}"
    GÖREV: Yukarıdaki kuralları işle, klinik muhakemeni 'thinkingProcess' alanına yaz ve JSON döndür.
    YANIT FORMATI (JSON): PatientProfile arayüzüne tam uygun olmalı.
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
        thinkingConfig: { thinkingBudget: 25000 }
      }
    });

    const textResponse = response.text || '{}';
    return JSON.parse(textResponse.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  const prompt = `
    Sen PhysioCore AI Adaptif Karar Motorusun. 
    Bölüm 5'teki 'Pain & Phase Adaptation' mantığını kullanarak mevcut programı güncelle.

    ADAPTASYON ALGORİTMASI:
    - Yeni Ağrı Skoru > 7 ise: Mevcut programdaki dinamik hareketleri çıkar, yerine statik/izometrik olanları koy.
    - Ağrı Azaldıysa: Tekrar sayılarını (reps) Bölüm 5 formülüne (15 - Pain) göre artır.
    - Kontrendikasyonları (Safety Flags) asla ihlal etme.

    MEVCUT PROFİL: ${JSON.stringify(currentProfile)}
    YENİ GERİ BİLDİRİM: ${JSON.stringify(feedback)}
    
    GÖREV: Güncellenmiş programı ve 'latestInsight' analizini içeren JSON döndür.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 20000 }
      }
    });

    return JSON.parse((response.text || '{}').trim());
  } catch (error) {
    console.error("Gemini Adjustment Error:", error);
    return currentProfile;
  }
};
