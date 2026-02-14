
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
 * Following guidelines: Initialize with direct process.env.API_KEY reference.
 */
export const getAI = () => {
  // Manuel throw kaldırıldı, SDK'nın hata fırlatması veya platformun 
  // anahtarı enjekte etmesi bekleniyor.
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};
