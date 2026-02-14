
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE - v6.5 RESILIENCE ENGINE
 * API Key ve SDK Yönetimi
 */

export const getAI = () => {
  // process.env.API_KEY'in Vercel/Vite ortamında bazen undefined olabildiği 
  // durumlar için güvenli okuma.
  const apiKey = (typeof process !== 'undefined' ? process.env?.API_KEY : null) || (window as any).API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    // Hata fırlatmak yerine null döndürerek üst katmanın ensureApiKey'i tetiklemesini sağlıyoruz
    return null;
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Merkezi API Anahtarı Doğrulama ve Kurtarma Protokolü.
 * Eğer anahtar yoksa seçim penceresini açar.
 */
export const ensureApiKey = async (): Promise<string> => {
  const aistudio = (window as any).aistudio;
  const currentKey = (typeof process !== 'undefined' ? process.env?.API_KEY : null) || (window as any).API_KEY;

  if (!currentKey || currentKey === "undefined") {
    if (aistudio) {
      console.warn("[PhysioCore] API Key saptanmadı, seçim penceresi açılıyor...");
      await aistudio.openSelectKey();
      // Yarış durumunu önlemek için yönerge gereği başarılı varsayıyoruz.
      return process.env.API_KEY || "";
    } else {
      throw new Error("API_KEY_MISSING");
    }
  }
  
  return currentKey;
};

/**
 * Global Hata Yakalayıcı: "Requested entity was not found" hatası durumunda 
 * anahtar seçimini tekrar tetikler.
 */
export const handleAiError = async (err: any) => {
  const aistudio = (window as any).aistudio;
  const errorMessage = err?.message || String(err);
  
  if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API_KEY_MISSING")) {
    console.error("[PhysioCore] Kritik API Hatası: Anahtar geçersiz veya eksik.");
    if (aistudio) {
      await aistudio.openSelectKey();
    }
  }
  throw err; // Hatayı UI katmanına ilet
};
