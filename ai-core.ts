
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
 */
export const getAI = () => {
  const apiKey = process.env.API_KEY;
  // Talimat gereği: Eğer anahtar yoksa veya sorgu hatası alınırsa 
  // "Requested entity was not found." içeren bir hata fırlatılmalıdır.
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Requested entity was not found. (API_KEY_MISSING)");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Gelen hatanın API anahtarı ile ilgili (expired, invalid, missing) olup olmadığını kontrol eder.
 */
export const isApiKeyError = (error: any): boolean => {
  const errorMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
  const expiredKeywords = ["expired", "INVALID_ARGUMENT", "API_KEY_INVALID", "not found", "renew", "MISSING"];
  return expiredKeywords.some(keyword => errorMessage.includes(keyword));
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
      // Yarış durumunu engellemek için seçim tetiklendiği anda 
      // başarılı varsayıp devam ediyoruz (Yönerge kuralı).
      return true;
    }
    return true;
  } catch (e) {
    console.error("Anahtar kontrol hatası", e);
    return false;
  }
};
