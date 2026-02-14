
import { GoogleGenAI } from "@google/genai";

/**
 * PHYSIOCORE AI CORE MODULE
 * API Key ve SDK Yönetimi
 * Following guidelines: Initialize with direct process.env.API_KEY reference.
 */
export const getAI = () => {
  // Fix: Removed fallback to empty string to comply with strict process.env.API_KEY usage rules.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};
