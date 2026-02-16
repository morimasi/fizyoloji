
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
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
 * Talimatlara göre seçim tetiklendikten sonra işlemin başarılı olduğu varsayılır.
 */
export const ensureApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio;
  if (!aistudio) return true; // Standalone veya farklı ortam kontrolü

  const hasKey = await aistudio.hasSelectedApiKey();
  if (!hasKey) {
    try {
      await aistudio.openSelectKey();
      return true; // Yarış durumunu (race condition) engellemek için başarılı kabul ediyoruz
    } catch (e) {
      console.error("Anahtar seçim diyaloğu açılamadı", e);
      return false;
    }
  }
  return true;
};
