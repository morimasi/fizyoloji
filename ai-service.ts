
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - GENESIS HYBRID ENGINE (v12.0)
 * OPTICAL FLOW EDITION: Optimizing free models for fluid motion.
 */

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
  throw new Error("MISSING_API_KEY");
};

// --- CINEMATIC VIDEO (VEO - PREMIUM) ---
export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Professional medical physiotherapy animation: ${exercise.titleTr || exercise.title}. 
    Directive: ${customPrompt || exercise.description}. 
    Style: 4K 3D Medical Render, realistic human mannequin, neon muscle highlights, clean slate background, zero jitter, 30fps fluid motion.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return downloadLink ? `${downloadLink}&key=${apiKey}` : "";
  } catch (error) {
    console.error("VEO Error:", error);
    throw error;
  }
};

// --- HYBRID SPRITE ENGINE (FLASH - ZERO COST) ---
export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const primaryMuscles = exercise.primaryMuscles?.join(', ') || 'Target Muscles';
    
    // We use a 4x4 grid (16 frames) for the best balance of detail and memory on free tier
    const gridRows = 4;
    const gridCols = 4;
    const totalFrames = gridRows * gridCols;

    const fullPrompt = `
    TASK: GENERATE AN ATOMIC-PRECISION 4x4 SPRITE SHEET FOR TWEENING.
    SUBJECT: Clinical performance of "${exercise.titleTr || exercise.title}".
    ${customDirective || `Show the full range of motion for this exercise.`}
    
    VISUAL STYLE: ${style === 'X-Ray-Lottie' ? 'Bioluminescent X-Ray' : 'Flat Medical Vector Mask'}.
    BACKGROUND: Pure Solid Black (#000000).
    HIGHLIGHT: ${primaryMuscles} in Neon Cyan.
    
    TECHNICAL RULES (CRITICAL):
    1. LAYOUT: Exactly 4 rows and 4 columns. Total 16 cells.
    2. ALIGNMENT: The character MUST BE PINNED in the center of each cell. Zero movement of the base/camera.
    3. SYMMETRY: Frame 1 and Frame 16 must match for a seamless loop.
    4. OPTICAL FLOW: Movement between frames must be incremental and mathematical. No teleporting limbs.
    5. NO UI: No text, arrows, or watermarks inside the grid.
    
    This sprite sheet will be processed by a Frame-Interpolation algorithm. Clarity is paramount.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } } 
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return {
                url: `data:image/png;base64,${part.inlineData.data}`,
                frameCount: totalFrames,
                layout: 'grid-4x4'
            };
        }
      }
    }
    throw new Error("Generation Failed");
  } catch (e) {
    console.error("Image Gen Error", e);
    return { url: '', frameCount: 0, layout: 'grid-4x4' };
  }
};

// Standard Clinical Logic (Omitted for brevity, keeping same as before)
export const runClinicalConsultation = async (t:string, i?:string, h?:TreatmentHistory[], p?:DetailedPainLog[]) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiz: ${t}. Geçmiş: ${JSON.stringify(h)}. JSON PatientProfile dön.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "null");
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Girdi: ${JSON.stringify(f)}. Profil: ${JSON.stringify(p)}. Güncelle JSON dön.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "{}");
};

export const optimizeExerciseData = async (ex: Partial<Exercise>, g: string) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Egzersiz: ${JSON.stringify(ex)}. Hedef: ${g}. Optimize et JSON dön.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "{}");
};

export const generateExerciseData = async (n: string) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Egzersiz: ${n}. Klinik JSON oluştur.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "{}");
};

export const generateExerciseTutorial = async (t: string) => {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const sr = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Egzersiz: ${t}. Ritmik script JSON dön.`,
        config: { responseMimeType: "application/json" }
    });
    const sd = JSON.parse(sr.text || "{}");
    const ar = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: sd.script?.map((s:any)=>s.text).join(' ') || "" }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
    });
    return { script: sd.script, audioBase64: ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null, bpm: sd.bpm || 60 };
};
