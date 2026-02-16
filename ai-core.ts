
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
 * Exclusively uses process.env.API_KEY as per rules.
 */
export const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};
