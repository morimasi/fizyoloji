
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE - v8.6 ROBUST
 * Çökme korumalı API Key ve SDK yönetimi.
 */

export const getAI = () => {
  // Yönerge: process.env.API_KEY doğrudan kullanılmalıdır.
  // getAI asla null dönmez, böylece .models erişimi çökmez.
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

/**
 * Anahtarın varlığını kontrol eder.
 */
export const checkApiKeyIntegrity = (): boolean => {
  const key = process.env.API_KEY;
  return !!key && key.length > 20 && key.startsWith("AIza");
};

/**
 * Zorunlu anahtar kontrolü ve seçim tetikleyicisi.
 */
export const ensureApiKey = async (): Promise<void> => {
  const aistudio = (window as any).aistudio;
  
  if (aistudio) {
    const hasSelected = await aistudio.hasSelectedApiKey();
    if (!hasSelected || !checkApiKeyIntegrity()) {
      console.warn("[PhysioCore] API Key seçilmemiş veya geçersiz. Seçim penceresi açılıyor...");
      await aistudio.openSelectKey();
      // Yönerge: Seçim tetiklendikten sonra başarılı sayıp devam ediyoruz.
    }
  }
};

/**
 * Global SDK Hata Yönetimi.
 */
export const handleAiError = async (err: any) => {
  const aistudio = (window as any).aistudio;
  const msg = err?.message || String(err);
  
  console.group("PhysioCore AI Diagnostic");
  console.error("SDK Trace:", msg);
  console.groupEnd();

  if (
    msg.includes("API key not valid") || 
    msg.includes("Requested entity was not found") ||
    msg.includes("API_KEY_MISSING") ||
    msg.includes("must be set")
  ) {
    if (aistudio) {
      alert("Kritik: API Anahtarı doğrulanamadı. Lütfen geçerli (Paid/Billing Aktif) bir anahtar seçin.");
      await aistudio.openSelectKey();
    }
  } 
  else if (msg.includes("billing") || msg.includes("Quota") || msg.includes("429")) {
    alert("Klinik Uyarı: Kota doldu veya faturalandırma aktif değil. (ai.google.dev/gemini-api/docs/billing)");
  }

  throw err;
};
