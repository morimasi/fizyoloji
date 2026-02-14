
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE - v7.5 DIRECT INJECTION
 * API Key yönetimi için basitleştirilmiş ve dayanıklı yapı.
 */

export const getAI = () => {
  // Yönerge: process.env.API_KEY doğrudan kullanılmalıdır.
  // Boşluk kontrolü SDK seviyesinde yapılacak, biz engel olmayacağız.
  const apiKey = process.env.API_KEY;
  return new GoogleGenAI({ apiKey });
};

/**
 * Kullanıcı etkileşimi öncesi anahtar kontrolü.
 */
export const ensureApiKey = async (): Promise<void> => {
  const aistudio = (window as any).aistudio;
  
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      console.warn("[PhysioCore] API Key seçilmemiş, seçim penceresi açılıyor...");
      await aistudio.openSelectKey();
    }
  }
};

/**
 * Global Hata Yönetimi: Faturalandırma ve Geçersiz Anahtar durumlarını yakalar.
 */
export const handleAiError = async (err: any) => {
  const aistudio = (window as any).aistudio;
  const msg = err?.message || String(err);
  
  console.group("PhysioCore AI Diagnostic");
  console.error("SDK Error:", msg);
  console.groupEnd();

  // "Requested entity was not found" genelde anahtarın silindiğini veya projenin bulunamadığını gösterir.
  if (msg.includes("Requested entity was not found") || msg.includes("API key not valid")) {
    if (aistudio) {
      alert("Seçili API Anahtarı geçersiz veya süresi dolmuş. Lütfen yeni bir anahtar seçin.");
      await aistudio.openSelectKey();
    }
  } 
  // Billing hataları
  else if (msg.includes("billing") || msg.includes("Quota") || msg.includes("429")) {
    alert("Kritik: Google Cloud projenizde faturalandırma (Billing) aktif olmayabilir veya kota dolmuş olabilir. Lütfen 'ai.google.dev/gemini-api/docs/billing' adresini kontrol edin.");
  }

  throw err;
};
