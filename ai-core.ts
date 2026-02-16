
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE v5.1
 * SDK kurallarına göre dinamik anahtar yönetimi.
 */
export const getAI = () => {
  const apiKey = process.env.API_KEY;
  
  // Eğer anahtar hiç yoksa veya string olarak "undefined" ise hata fırlatırız.
  // Bu hata UI tarafında yakalanıp SelectKey diyaloğunu açacak.
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("Requested entity was not found.");
  }
  
  // Kural: Her çağrıda yeni bir instance oluşturulmalıdır.
  return new GoogleGenAI({ apiKey });
};

/**
 * Hatanın API anahtarı geçersizliği veya eksikliği ile ilgili olup olmadığını saptar.
 */
export const isApiKeyError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : (error.message || JSON.stringify(error));

  const expiredKeywords = [
    "requested entity was not found", // Kritik hata metni
    "api_key_missing",
    "invalid_argument",
    "unauthorized",
    "401",
    "403"
  ];
  
  return expiredKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
};

/**
 * Kullanıcının anahtar seçim diyaloğunu açmasını sağlayan yardımcı.
 */
export const ensureApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio;
  if (!aistudio) return true; // Standalone modda varsayım

  try {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Kural: openSelectKey çağrıldığı an başarılı sayıp devam etmeliyiz.
      return true;
    }
    return true;
  } catch (e) {
    console.error("API Key Guard Error:", e);
    return false;
  }
};
