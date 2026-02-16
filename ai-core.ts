
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
