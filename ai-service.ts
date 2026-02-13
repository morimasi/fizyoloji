
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - GENESIS HYBRID ENGINE (v13.0)
 * VECTOR MOTION & VEO INTEGRATION
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
  return process.env.API_KEY || "";
};

// --- STRATEGY 3: VECTOR ANIMATION GENERATOR (0 COST) ---
export const generateExerciseVectorData = async (exercise: Partial<Exercise>): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    // We ask for a structured SVG that represents the mannequin parts
    const prompt = `
    GENERATE A CLINICAL ANATOMIC SVG FOR EXERCISE: "${exercise.titleTr || exercise.title}".
    OBJECTIVE: Create a high-quality medical vector mannequin.
    
    SVG STRUCTURE RULES:
    1. Viewport: 0 0 1000 1000. Background: None.
    2. Groups: Use <g id="torso">, <g id="head">, <g id="arm_l">, <g id="arm_r">, <g id="leg_l">, <g id="leg_r">.
    3. Style: Stroke: #06B6D4 (Kinetic Teal), Stroke-width: 4, Fill: none.
    4. Motion Data: Include a JSON object inside a <script> tag (or just return the JSON) that defines the GSAP animation timeline for 1 full rep.
    
    RETURN ONLY THE SVG CODE.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "";
  } catch (err) {
    console.error("Vector Gen Error", err);
    return "";
  }
};

// --- STRATEGY 1: HYBRID SPRITE ENGINE (FLASH - LOW COST) ---
export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x4' }> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const totalFrames = 16;

    const fullPrompt = `
    TASK: GENERATE AN ATOMIC-PRECISION 4x4 SPRITE SHEET FOR TWEENING.
    SUBJECT: "${exercise.titleTr || exercise.title}".
    STYLE: ${style === 'X-Ray-Lottie' ? 'Bioluminescent X-Ray' : 'Flat Medical Vector Mask'}.
    BACKGROUND: Pure Black. LAYOUT: 4x4 Grid. No text. 
    ALIGNMENT: Perfect centering. Continuity: Frame 1 to 16 loop.
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
    return { url: '', frameCount: 0, layout: 'grid-4x4' };
  }
};

// --- VEO PREMIUM VIDEO ---
export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Professional medical 3D animation of ${exercise.titleTr || exercise.title}. High-end clinical render.`;
  let op = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, config: { resolution: '720p', aspectRatio: '16:9' } });
  while (!op.done) { await new Promise(r => setTimeout(r, 5000)); op = await ai.operations.getVideosOperation({ operation: op }); }
  return op.response?.generatedVideos?.[0]?.video?.uri ? `${op.response.generatedVideos[0].video.uri}&key=${apiKey}` : "";
};

/**
 * Generates comprehensive clinical data for an exercise title.
 */
export const generateExerciseData = async (title: string): Promise<Partial<Exercise>> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Bir fizyoterapi egzersizi için detaylı klinik veriler oluştur: "${title}". 
    Lütfen şu alanları içeren bir JSON objesi dön:
    - description: Hasta için basit uygulama talimatları (Türkçe).
    - biomechanics: Eklem artrokinematiği ve biyomekanik analiz (Türkçe).
    - safetyFlags: Kontrendikasyonlar ve dikkat edilmesi gerekenler listesi (Türkçe dizi).
    - primaryMuscles: Ana çalışan kaslar (Türkçe dizi).
    - secondaryMuscles: Yardımcı kaslar (Türkçe dizi).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          biomechanics: { type: Type.STRING },
          safetyFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          primaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
          secondaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["description", "biomechanics", "safetyFlags", "primaryMuscles", "secondaryMuscles"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

/**
 * Optimizes exercise dosage (sets, reps, tempo, etc.) based on a specific clinical goal.
 */
export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Aşağıdaki egzersiz protokolünü "${goal}" hedefi için optimize et: ${JSON.stringify(exercise)}. 
    Sadece şu alanları içeren bir JSON objesi dön:
    - sets: Önerilen set sayısı (integer).
    - reps: Önerilen tekrar sayısı (integer).
    - tempo: Hareket temposu (string, örn: "3-1-3").
    - restPeriod: Dinlenme süresi (saniye, integer).
    - targetRpe: Hedef RPE zorluk seviyesi (1-10, integer).
    - frequency: Haftalık/Günlük uygulama sıklığı (string).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sets: { type: Type.INTEGER },
          reps: { type: Type.INTEGER },
          tempo: { type: Type.STRING },
          restPeriod: { type: Type.INTEGER },
          targetRpe: { type: Type.INTEGER },
          frequency: { type: Type.STRING }
        },
        required: ["sets", "reps", "tempo", "restPeriod", "targetRpe", "frequency"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// ... Standard clinical functions
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
