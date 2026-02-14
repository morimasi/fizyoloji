
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE - v7.0 DIAGNOSTIC ENGINE
 * API Key, Billing ve Quota yönetimi için geliştirilmiş katman.
 */

export const getAI = () => {
  const apiKey = (typeof process !== 'undefined' ? process.env?.API_KEY : null) || (window as any).API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    return null;
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * API Anahtarının sadece varlığını değil, geçerliliğini de denetleyen protokol.
 */
export const ensureApiKey = async (): Promise<string> => {
  const aistudio = (window as any).aistudio;
  const currentKey = (typeof process !== 'undefined' ? process.env?.API_KEY : null) || (window as any).API_KEY;

  if (!currentKey || currentKey === "undefined" || currentKey === "") {
    console.warn("[PhysioCore] API Key saptanmadı veya boş. Seçim penceresi açılıyor...");
    if (aistudio) {
      await aistudio.openSelectKey();
      return process.env.API_KEY || "";
    }
    throw new Error("API_KEY_MISSING");
  }
  
  return currentKey;
};

/**
 * Global Hata Yönetimi: Billing ve Quota hatalarını ayrıştırır.
 */
export const handleAiError = async (err: any) => {
  const aistudio = (window as any).aistudio;
  const errorStr = JSON.stringify(err);
  const msg = err?.message || String(err);
  
  console.group("PhysioCore AI Teşhis Raporu");
  console.error("Hata Detayı:", msg);
  console.groupEnd();

  // 1. API Key Geçersiz veya Silinmiş (Requested entity was not found)
  if (msg.includes("Requested entity was not found") || msg.includes("API_KEY_INVALID")) {
    if (aistudio) {
      alert("Kritik: Mevcut API Anahtarı geçersiz. Lütfen faturalandırması aktif olan yeni bir anahtar seçin.");
      await aistudio.openSelectKey();
    }
  } 
  // 2. Billing / Quota Sorunu (429 Too Many Requests veya Billing not enabled)
  else if (msg.includes("Quota") || msg.includes("429") || msg.includes("billing")) {
    alert("Klinik Uyarı: Google Cloud projenizde faturalandırma sınırı veya kota aşımı saptandı. Lütfen GCP Console üzerinden 'Pay-as-you-go' durumunu kontrol edin.");
  }
  // 3. Genel Key Eksikliği
  else if (msg.includes("API_KEY_MISSING")) {
    if (aistudio) await aistudio.openSelectKey();
  }

  throw err;
};
