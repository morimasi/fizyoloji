
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";

export const ensureApiKey = async (): Promise<string> => {
  if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
  const key = process.env.API_KEY;
  if (key && key !== "undefined" && key !== "") return key;
  
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
    }
    return process.env.API_KEY || "";
  }
  return process.env.API_KEY || "";
};

/**
 * GENESIS AVM (Anatomic Vector Motion) ENGINE v2.0
 * Generates layered, clinical-grade SVGs for animation.
 */
export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
    GENERATE A PROFESSIONAL CLINICAL SVG WORKSTATION DATA FOR: "${exercise.titleTr || exercise.title}".
    
    SVG REQUIREMENTS:
    1. Dimensions: 1000x1000.
    2. Groups (Mandatory IDs): 
       - <g id="skeleton"> (Bone structure lines)
       - <g id="muscles"> (Agonist muscle highlights, color: #06B6D4)
       - <g id="skin-outline"> (Overall body silhouette)
       - <g id="joint-pivot"> (Small circles at rotation points)
    3. Style: Ultra-clean medical illustration. Pure black background or transparent.
    4. Format: Return valid XML/SVG. No Markdown.
    
    The SVG must be logically segmented so I can manipulate it via GSAP code.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "";
  } catch (err) {
    console.error("AVM Engine Error", err);
    return "";
  }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const totalFrames = 16;
    const fullPrompt = `4x4 SPRITE SHEET: "${exercise.titleTr || exercise.title}". Style: ${style}. Pure Black Background. 16 frames in 4x4 grid. No text.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } } 
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return { url: `data:image/png;base64,${part.inlineData.data}`, frameCount: totalFrames, layout: 'grid-4x4' };
        }
      }
    }
    throw new Error("Generation Failed");
  } catch (e) {
    return { url: '', frameCount: 0, layout: 'grid-4x4' };
  }
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Clinical medical 3D animation: ${exercise.titleTr || exercise.title}. High-end render.`;
  let op = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, config: { resolution: '720p', aspectRatio: '16:9' } });
  while (!op.done) { await new Promise(r => setTimeout(r, 5000)); op = await ai.operations.getVideosOperation({ operation: op }); }
  return op.response?.generatedVideos?.[0]?.video?.uri ? `${op.response.generatedVideos[0].video.uri}&key=${apiKey}` : "";
};

// ... Standard clinical functions
export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Fizyoterapi egzersiz verisi: "${title}". JSON dön.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

// Added missing optimizeExerciseData function to fix the error in DosageEngineModule.tsx
export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Egzersiz: ${JSON.stringify(exercise)}. Hedef: ${goal}. Dozaj optimizasyonu yap (sets, reps, tempo, restPeriod, targetRpe). JSON dön.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const runClinicalConsultation = async (t:string, i?:string, h?:TreatmentHistory[], p?:DetailedPainLog[]) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiz: ${t}. JSON PatientProfile dön.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "null");
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Profil: ${JSON.stringify(p)}. Güncelle JSON dön.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "{}");
};

export const generateExerciseTutorial = async (t: string) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const sr = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Egzersiz: ${t}. Script JSON dön.`, config: { responseMimeType: "application/json" } });
    const sd = JSON.parse(sr.text || "{}");
    const ar = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: sd.script?.map((s:any)=>s.text).join(' ') || "" }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
    });
    return { script: sd.script, audioBase64: ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null, bpm: sd.bpm || 60 };
};
