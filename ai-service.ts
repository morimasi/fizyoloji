
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
 * GENESIS AVM v3.0 - ANATOMICAL MASTER ENGINE
 * Üretilen sprite sheet'lerin titremesini engellemek için koordinat sabitleme komutları eklendi.
 */
export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const totalFrames = 16;
    
    // AVM v3.0 STABILITY PROTOCOL PROMPT
    const fullPrompt = `
      ULTRA-REALISTIC 4K MEDICAL ANATOMICAL 3D RENDER SPRITE SHEET. 
      Grid: 4x4 (16 sequential frames). 
      Subject: Real human body performing "${exercise.titleTr || exercise.title}". 
      
      STABILITY RULES:
      1. PERFECTLY CENTERED: The subject's center of mass must remain at the EXACT SAME COORDINATE in every frame. 
      2. STATIC CAMERA: Do not rotate or move the camera. 
      3. CONSISTENT SCALE: The human figure must not shrink or grow between frames.
      4. CINEMATIC LIGHTING: Professional studio medical lighting, dark moody atmosphere.
      5. PURE BLACK BACKGROUND (#000000).
      6. HIGH DEFINITION: Visible muscle fibers, realistic skin texture, and clear joint movements.
      
      No text, no watermarks, just the grid.
      Additional context: ${customDirective || exercise.description || ''}
    `;

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
    console.error("AVM Engine 3.0 Error:", e);
    return { url: '', frameCount: 0, layout: 'grid-4x4' };
  }
};

export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
    GENERATE CLINICAL SVG ANATOMICAL OVERLAY FOR: "${exercise.titleTr || exercise.title}".
    Requirement: Return ONLY the SVG XML code. Transparent background. 
    IDs for manipulation: #skeleton, #muscles_highlight, #joint_axes.
    High professional medical quality.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "";
  } catch (err) {
    return "";
  }
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Hyper-realistic medical 3D film, cinematic quality: ${exercise.titleTr || exercise.title}. Real human model, slow motion, professional lighting, black background.`;
  let op = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, config: { resolution: '1080p', aspectRatio: '16:9' } });
  while (!op.done) { await new Promise(r => setTimeout(r, 10000)); op = await ai.operations.getVideosOperation({ operation: op }); }
  return op.response?.generatedVideos?.[0]?.video?.uri ? `${op.response.generatedVideos[0].video.uri}&key=${apiKey}` : "";
};

export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Physiotherapy exercise clinical data for: "${title}". Return JSON format.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Exercise: ${JSON.stringify(exercise)}. Goal: ${goal}. Optimize sets, reps, tempo. JSON return.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const runClinicalConsultation = async (t:string, i?:string, h?:TreatmentHistory[], p?:DetailedPainLog[]) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Clinical Analysis: ${t}. Return JSON PatientProfile.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "null");
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Profile: ${JSON.stringify(p)}. Feedback: ${JSON.stringify(f)}. Update JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "{}");
};

export const generateExerciseTutorial = async (t: string) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const sr = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Tutorial script for: ${t}. JSON return.`, config: { responseMimeType: "application/json" } });
    const sd = JSON.parse(sr.text || "{}");
    const ar = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: sd.script?.map((s:any)=>s.text).join(' ') || "" }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
    });
    return { script: sd.script, audioBase64: ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null, bpm: sd.bpm || 60 };
};
