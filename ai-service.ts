
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - GENESIS HYBRID ENGINE (v11.0)
 * Supports: Flash (Sprites) & VEO (Real MP4 Video)
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
      // Assume success and proceed, as per instructions to avoid race conditions
    }
    return process.env.API_KEY || "";
  }
  throw new Error("MISSING_API_KEY");
};

// --- REAL VIDEO ENGINE (VEO) ---
export const generateExerciseRealVideo = async (exercise: Partial<Exercise>, customPrompt?: string): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `A professional clinical physiotherapy video showing ${exercise.titleTr || exercise.title}. 
    ${customPrompt || exercise.description}. 
    Style: High-quality medical 3D animation, clean studio lighting, neutral background, 24fps, cinematic fluid motion. 
    The movement should be slow and controlled.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Polling for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");
    
    // Append API key for direct access
    return `${downloadLink}&key=${apiKey}`;
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      const aistudio = (window as any).aistudio;
      if (aistudio) await aistudio.openSelectKey();
    }
    console.error("VEO Error:", error);
    throw error;
  }
};

// --- IMPROVED SPRITE ENGINE (FLASH) ---
export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string, customDirective?: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x6' | 'grid-2x4' }> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const primaryMuscles = exercise.primaryMuscles?.join(', ') || 'Global Body';
    const gridRows = 2; // 2x4 is more reliable for free model clarity
    const gridCols = 4;
    const totalFrames = gridRows * gridCols;

    const stylePrompt = style === 'X-Ray-Lottie' 
      ? `Style: Bioluminescent X-Ray MRI Scan. Blue glowing skeleton on black. Highlight ${primaryMuscles} in Orange.`
      : `Style: Clean 3D Vector Medical Art. High contrast, dark slate background.`;

    const fullPrompt = `
    CREATE A HIGH-PRECISION 2x4 SPRITE SHEET (8 FRAMES TOTAL).
    SUBJECT: ${customDirective || `Perform "${exercise.title}" with perfect clinical form.`}
    RULES:
    1. IMAGE LAYOUT: Exactly 2 rows and 4 columns.
    2. ALIGNMENT: The mannequin MUST be perfectly centered in each cell. 
    3. CONTINUITY: Frames must flow like a real video (Frame 1 -> Frame 8 is one full rep).
    4. NO BORDERS: Zero padding or lines between grid cells.
    5. STABILITY: Camera is a fixed tripod. No zooming or moving.
    ${stylePrompt}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } } 
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return {
                url: `data:image/png;base64,${part.inlineData.data}`,
                frameCount: totalFrames,
                layout: 'grid-2x4'
            };
        }
      }
    }
    throw new Error("No image generated");
  } catch (e) {
    console.error("Image Gen Error", e);
    return { url: '', frameCount: 0, layout: 'grid-2x4' };
  }
};

// ... existing clinical functions (runClinicalConsultation, etc.) ...
export const runClinicalConsultation = async (
  text: string, 
  imageBase64?: string,
  history?: TreatmentHistory[],
  painLogs?: DetailedPainLog[]
): Promise<PatientProfile | null> => {
  const inputHash = PhysioDB.generateHash(text + (imageBase64 ? 'img' : ''));
  const cached = PhysioDB.getCachedResponse(inputHash);
  if (cached) return cached.data;

  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Sen kıdemli bir klinik uzmanısın. Girdi: "${text}". Analiz et ve JSON PatientProfile döndür.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || "null");
    if (result) PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch (err) {
    return null;
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Geri Bildirim: ${JSON.stringify(feedback)}. Mevcut: ${JSON.stringify(currentProfile)}. Güncelle ve JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) { return currentProfile; }
};

export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Egzersiz: ${JSON.stringify(exercise)}. Hedef: ${goal}. Optimize et ve JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) { return exercise; }
};

export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Egzersiz: ${exerciseName}. Detaylı klinik JSON oluştur.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) { return {}; }
};

export const generateExerciseTutorial = async (exerciseTitle: string): Promise<ExerciseTutorial | null> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Egzersiz: ${exerciseTitle}. Ritmik talimatlar JSON { "bpm": 60, "script": [...] }`,
      config: { responseMimeType: "application/json" }
    });
    const scriptData = JSON.parse(scriptResponse.text || "{}");
    const audioResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: scriptData.script.map((s: any) => s.text).join(' ') }] }],
      config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
    });
    let audioBase64 = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    return { script: scriptData.script, audioBase64, bpm: scriptData.bpm || 60 };
  } catch (err) { return null; }
};
