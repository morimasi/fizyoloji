
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
 */
export const getAI = () => {
  const apiKey = process.env.API_KEY;
  
  // Talimat gereği: Eğer anahtar yoksa veya geçersizse 
  // "Requested entity was not found." fırlatılmalı.
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("Requested entity was not found. (API_KEY_MISSING)");
  }
  
  return new GoogleGenAI({ apiKey });
};

/**
 * Gelen hatanın API anahtarı ile ilgili olup olmadığını kontrol eder.
 * API'den gelen JSON hata nesnelerini de string olarak tarar.
 */
export const isApiKeyError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : (error.message || JSON.stringify(error));

  const expiredKeywords = [
    "expired", 
    "INVALID_ARGUMENT", 
    "API_KEY_INVALID", 
    "not found", 
    "renew", 
    "MISSING",
    "API key"
  ];
  
  return expiredKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
};

/**
 * Kullanıcıdan API anahtarı seçmesini isteyen veya mevcut durumu kontrol eden guard.
 */
export const ensureApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio;
  if (!aistudio) return true;

  try {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Yönerge kuralı: Seçim tetiklendiği anda başarılı varsayıp devam et.
      return true;
    }
    return true;
  } catch (e) {
    console.error("Anahtar kontrol hatası", e);
    return false;
  }
};
