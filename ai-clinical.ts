
import { getAI, ensureApiKey, handleAiError } from "./ai-core.ts";
import { PatientProfile, ProgressReport, TreatmentHistory, DetailedPainLog } from "./types.ts";

/**
 * PHYSIOCORE CLINICAL REASONING ENGINE
 */

export const generateDashboardInsights = async (profile: PatientProfile): Promise<any> => {
  try {
    await ensureApiKey();
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze patient progress: ${JSON.stringify(profile)}. Predict recovery trajectory and suggest next best clinical action. Return JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return await handleAiError(err);
  }
};

export const runClinicalConsultation = async (t: string, i?: string, h?: TreatmentHistory[], p?: DetailedPainLog[]) => {
  try {
    await ensureApiKey();
    const ai = getAI();
    const r = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Clinical Analysis: ${t}. Return JSON PatientProfile. Use the following context if available: History: ${JSON.stringify(h)}, PainLogs: ${JSON.stringify(p)}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "null");
  } catch (err) {
    return await handleAiError(err);
  }
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
  try {
    await ensureApiKey();
    const ai = getAI();
    const r = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Profile: ${JSON.stringify(p)}. Feedback: ${JSON.stringify(f)}. Update program dosage and rehab phase based on clinical flags. Return updated JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "{}");
  } catch (err) {
    return await handleAiError(err);
  }
};
