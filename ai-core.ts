
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE - v8.5 GATEKEEPER
 * API Key lifecycle and security validation layer.
 */

export const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "null") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Anahtarın varlığını ve formatını kontrol eder.
 */
export const checkApiKeyIntegrity = (): boolean => {
  const key = process.env.API_KEY;
  // Temel format kontrolü (AI Studio anahtarları genellikle AIza... ile başlar)
  return !!key && key.length > 20 && key.startsWith("AIza");
};

/**
 * Zorunlu anahtar kontrolü ve seçim tetikleyicisi.
 */
export const ensureApiKey = async (): Promise<string> => {
  const aistudio = (window as any).aistudio;
  const currentKey = process.env.API_KEY;

  if (!checkApiKeyIntegrity()) {
    console.warn("[PhysioCore] API Key eksik veya geçersiz formatta.");
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      // Seçim sonrası process.env.API_KEY'in güncellendiğini varsayıyoruz
      return process.env.API_KEY || "";
    }
  }
  return currentKey || "";
};

/**
 * Global SDK Hata Yönetimi: Yanlış anahtar veya faturalandırma sorunlarını yakalar.
 */
export const handleAiError = async (err: any) => {
  const aistudio = (window as any).aistudio;
  const msg = err?.message || String(err);
  
  console.group("PhysioCore AI Gatekeeper Report");
  console.error("SDK Trace:", msg);
  console.groupEnd();

  // 1. Yetki ve Geçersizlik Hataları
  if (
    msg.includes("API key not valid") || 
    msg.includes("Requested entity was not found") ||
    msg.includes("unauthorized") ||
    msg.includes("INVALID_ARGUMENT")
  ) {
    if (aistudio) {
      alert("Kritik: Mevcut API Anahtarı doğrulanamadı. Lütfen geçerli bir anahtar seçin.");
      await aistudio.openSelectKey();
    }
  } 
  // 2. Billing / Kota Hataları
  else if (msg.includes("billing") || msg.includes("Quota") || msg.includes("429")) {
    alert("Klinik Uyarı: Google Cloud projenizde faturalandırma (Billing) aktif değil veya kota dolmuş. Lütfen GCP Console'u kontrol edin.");
  }

  throw err;
};
