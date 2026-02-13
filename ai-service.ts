
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";

/**
 * GENESIS AVM v3.0 - TITAN ANATOMICAL MASTER ENGINE (MTS ENABLED)
 */
export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  try {
    // Initializing GoogleGenAI right before the call to ensure up-to-date API key from environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const totalFrames = 16;
    
    const fullPrompt = `
      ULTRA-REALISTIC 4K MEDICAL 3D RENDER SPRITE SHEET (4x4 GRID).
      SUBJECT: Real human anatomy performing "${exercise.titleTr || exercise.title}".
      
      MTS RENDER PROTOCOL:
      1. HIGH-CONTRAST MUSCLE STRIATIONS: Visible muscle fibers that appear to tighten and bulge.
      2. NEURAL EMISSIONS: Subtle orange/cyan glowing highlights on active joint axes.
      3. CINEMATIC DARK STUDIO: Pure black background (#000000), single source top-down lighting.
      4. ZERO-JITTER STABILITY: Fixed camera, fixed pivot point, fixed scale for all 16 frames.
      5. ANATOMICAL DEPTH: Cross-section style where skin is semi-transparent over deep red muscle tissue.
      
      SCENE CONTEXT: ${customDirective || exercise.description || ''}
      PRIMARY TARGETS: ${(exercise.primaryMuscles || []).join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } } 
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // Correctly iterating through parts to find inlineData for the generated image
        if (part.inlineData) {
            return { url: `data:image/png;base64,${part.inlineData.data}`, frameCount: totalFrames, layout: 'grid-4x4' };
        }
      }
    }
    throw new Error("Titan MTS Generation Failed");
  } catch (e) {
    console.error("AVM Titan MTS Error:", e);
    return { url: '', frameCount: 0, layout: 'grid-4x4' };
  }
};

export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `GENERATE NEURAL PATHWAY SVG OVERLAY: "${exercise.titleTr || exercise.title}". Glowing pulses on #primary_nerve. XML ONLY.`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    // Correctly using .text property on the response object
    return response.text || "";
  } catch (err) { return ""; }
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Cinematic medical 3D masterwork, 4K: ${exercise.titleTr || exercise.title}. Real anatomical detail, slow tension-based movement, studio lighting, black background.`;
  // Including mandatory numberOfVideos parameter for video generation as per SDK requirements
  let op = await ai.models.generateVideos({ 
    model: 'veo-3.1-fast-generate-preview', 
    prompt, 
    config: { 
      resolution: '1080p', 
      aspectRatio: '16:9',
      numberOfVideos: 1
    } 
  });
  while (!op.done) { 
    await new Promise(r => setTimeout(r, 10000)); 
    op = await ai.operations.getVideosOperation({ operation: op }); 
  }
  return op.response?.generatedVideos?.[0]?.video?.uri ? `${op.response.generatedVideos[0].video.uri}&key=${process.env.API_KEY}` : "";
};

export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Physiotherapy exercise clinical data for: "${title}". Return JSON format.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Exercise: ${JSON.stringify(exercise)}. Goal: ${goal}. Optimize sets, reps, tempo. JSON return.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const runClinicalConsultation = async (t:string, i?:string, h?:TreatmentHistory[], p?:DetailedPainLog[]) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Clinical Analysis: ${t}. Return JSON PatientProfile.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "null");
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const r = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Profile: ${JSON.stringify(p)}. Feedback: ${JSON.stringify(f)}. Update JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "{}");
};

export const generateExerciseTutorial = async (t: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const sr = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Tutorial script for: ${t}. JSON return.`, config: { responseMimeType: "application/json" } });
    const sd = JSON.parse(sr.text || "{}");
    const ar = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: sd.script?.map((s:any)=>s.text).join(' ') || "" }] }],
        config: { 
          responseModalities: [Modality.AUDIO], 
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Kore' } 
            } 
          } 
        }
    });
    return { script: sd.script, audioBase64: ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null, bpm: sd.bpm || 60 };
};
