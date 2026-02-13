
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";

/**
 * GENESIS AVM v3.5 - TITAN MTS (MYOELECTRIC TENSION SIMULATION) ENGINE
 */
export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const totalFrames = 16;
  
  const fullPrompt = `
    ULTRA-REALISTIC 4K MEDICAL 3D RENDER SPRITE SHEET (4x4 GRID).
    SUBJECT: Real human anatomy performing "${exercise.titleTr || exercise.title}".
    
    MTS 2.0 PROTOCOL:
    1. ANATOMICAL HEATMAP: Highlight active muscle groups in glowing cyan and orange during peak contraction.
    2. TENSION STRIATIONS: Show visible muscle fiber tightening.
    3. CINEMATIC CLINICAL LIGHTING: High-contrast rim light on muscles against a pure black background.
    4. ZERO-LATENCY STABILITY: Subject is locked in space (fixed axis) to prevent frame jitter.
    5. X-RAY BLEND: Semi-transparent skin showing internal muscular and skeletal biomechanics.
    
    PRIMARY TARGETS: ${(exercise.primaryMuscles || ['Global Muscles']).join(', ')}
    DESCRIPTION: ${customDirective || exercise.description || ''}
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
  throw new Error("Titan MTS Generation Failed");
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Cinematic medical 3D film, 4K, slow motion anatomical tension: ${exercise.titleTr || exercise.title}. Real muscle textures, glowing biomechanic nodes, studio lighting, black background.`;
  
  let operation = await ai.models.generateVideos({ 
    model: 'veo-3.1-fast-generate-preview', 
    prompt, 
    config: { 
      resolution: '1080p', 
      aspectRatio: '16:9',
      numberOfVideos: 1
    } 
  });
  
  while (!operation.done) { 
    await new Promise(r => setTimeout(r, 10000)); 
    operation = await ai.operations.getVideosOperation({ operation }); 
  }
  
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  return videoUri ? `${videoUri}&key=${process.env.API_KEY}` : "";
};

/**
 * AVM GENESIS - VECTOR DATA ENGINE (SVG GENERATOR)
 */
export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a clinical medical SVG vector for: "${exercise.titleTr || exercise.title}". 
    Return ONLY valid XML SVG code. NO MARKDOWN code blocks.`,
  });
  
  let cleanSvg = response.text || "";
  cleanSvg = cleanSvg.replace(/```svg|```/gi, '').trim();
  if (!cleanSvg.startsWith('<svg')) {
      throw new Error("Invalid SVG received from AI");
  }
  return cleanSvg;
};

export const generateExerciseTutorial = async (t: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const sr = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: `Tutorial script for: ${t}. JSON return.`, 
      config: { responseMimeType: "application/json" } 
    });
    const sd = JSON.parse(sr.text || "{}");
    const ar = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: sd.script?.map((s:any)=>s.text).join(' ') || "" }] }],
        config: { 
          responseModalities: [Modality.AUDIO], 
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } 
        }
    });
    return { 
      script: sd.script, 
      audioBase64: ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null, 
      bpm: sd.bpm || 60 
    };
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
