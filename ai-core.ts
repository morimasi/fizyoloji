
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
 * Talimatlara uygun olarak her çağrıda yeni bir instance oluşturulur.
 */
export const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Kullanıcıdan API anahtarı seçmesini isteyen veya mevcut durumu kontrol eden guard.
 * "Requested entity was not found" hatası alındığında bu fonksiyon tekrar çağrılmalıdır.
 */
export const ensureApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio;
  if (!aistudio) return true; // Standalone ortam kontrolü

  const hasKey = await aistudio.hasSelectedApiKey();
  if (!hasKey) {
    try {
      await aistudio.openSelectKey();
      // Yarış durumunu (race condition) engellemek için seçimin tetiklendiğini varsayıyoruz.
      return true; 
    } catch (e) {
      console.error("Anahtar seçim diyaloğu açılamadı", e);
      return false;
    }
  }
  return true;
};
