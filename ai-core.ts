
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
 * Tarayıcı ortamında API_KEY kontrolü ve SDK başlatma
 */
export const getAI = () => {
  const apiKey = process.env.API_KEY;
  
  // SDK'nın hata fırlatmasını önlemek için boş string kontrolü UI katmanında yapılacak
  // Ancak SDK constructor'ı geçerli bir değer bekler.
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  return new GoogleGenAI({ apiKey });
};
