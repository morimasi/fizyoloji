
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";

/**
 * PHYSIOCORE AI - GENESIS ENGINE v3.5
 * Tüm servisler Gemini API anahtarı gerektirir. 
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  // Initialize with named parameter as required
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  const ai = getAI();
  const totalFrames = 16;
  
  const fullPrompt = `
    ULTRA-REALISTIC 4K MEDICAL 3D RENDER SPRITE SHEET (4x4 GRID).
    SUBJECT: Real human anatomy performing "${exercise.titleTr || exercise.title}".
    MTS 2.0 PROTOCOL: Anatomical heatmap, glowing cyan active muscles.
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
      // Find the image part as per guidelines
      if (part.inlineData) {
          return { url: `data:image/png;base64,${part.inlineData.data}`, frameCount: totalFrames, layout: 'grid-4x4' };
      }
    }
  }
  throw new Error("Titan MTS Generation Failed");
};

export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Cinematic medical 3D film, 4K: ${exercise.titleTr || exercise.title}. Real muscle textures, black background.`;
  
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
  // Append API key when fetching from download link as per guidelines
  return videoUri ? `${videoUri}&key=${process.env.API_KEY}` : "";
};

export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a clinical medical SVG vector for: "${exercise.titleTr || exercise.title}". Return ONLY valid XML SVG code.`,
  });
  
  // Use property access .text instead of method call .text()
  let cleanSvg = response.text || "";
  cleanSvg = cleanSvg.replace(/```svg|```/gi, '').trim();
  if (!cleanSvg.startsWith('<svg')) throw new Error("Invalid SVG received");
  return cleanSvg;
};

export const generateExerciseTutorial = async (t: string) => {
    const ai = getAI();
    const sr = await ai.models.generateContent({ 
      model: 'gemini-3-flash-preview', 
      contents: `Tutorial script for: ${t}. JSON return.`, 
      config: { responseMimeType: "application/json" } 
    });
    // Use property access .text
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
    const ai = getAI();
    // Use gemini-3-pro-preview for complex reasoning task as per guidelines
    const r = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Clinical Analysis: ${t}. Return JSON PatientProfile.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "null");
};

export const runAdaptiveAdjustment = async (p: PatientProfile, f: ProgressReport) => {
    const ai = getAI();
    // Use gemini-3-pro-preview for complex reasoning task as per guidelines
    const r = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Profile: ${JSON.stringify(p)}. Feedback: ${JSON.stringify(f)}. Update JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(r.text || "{}");
};

export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Physiotherapy exercise clinical data for: "${title}". Return JSON format.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Exercise: ${JSON.stringify(exercise)}. Goal: ${goal}. Optimize sets, reps, tempo. JSON return.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};
