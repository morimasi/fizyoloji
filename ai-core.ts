
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
 * Tarayıcı ortamında API_KEY kontrolü ve SDK başlatma.
 * API Key'in 'undefined' veya boş string olması durumunda kontrollü hata fırlatır.
 */
export const getAI = () => {
  // Bazı tarayıcı ortamlarında process.env doğrudan erişilebilir olmayabilir, 
  // pencere nesnesi üzerinden veya doğrudan kontrol sağlıyoruz.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Kullanıcının API anahtarı seçip seçmediğini kontrol eden ve 
 * gerekirse seçim penceresini açan merkezi yardımcı fonksiyon.
 */
export const ensureApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio;
  
  if (!aistudio) {
    // AI Studio ortamında değilsek process.env kontrolü yeterli
    return !!process.env.API_KEY;
  }

  const hasKey = await aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await aistudio.openSelectKey();
    // Yarış durumunu (race condition) önlemek için seçim tetiklendikten sonra 
    // başarılı kabul edip devam edilmesi önerilir.
    return true;
  }
  
  return true;
};
