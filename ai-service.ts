
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - ZERO-COST ANIMATION ENGINE (v6.1 Enhanced)
 * Uses Vector Puppetry & Browser Rendering instead of MP4 Generation.
 */

export const ensureApiKey = async (): Promise<string> => {
  if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
  const key = process.env.API_KEY;
  if (key && key !== "undefined" && key !== "") return key;
  const aistudio = (window as any).aistudio;
  if (aistudio) {
    await aistudio.openSelectKey();
    throw new Error("MISSING_API_KEY");
  }
  throw new Error("MISSING_API_KEY");
};

export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  return await generateExerciseVisual(exercise, 'Medical-Vector-Art');
};

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
    const prompt = `Sen kıdemli bir klinik uzmanısın. Ücretsiz model (Flash) optimizasyonuyla çalışıyorsun.
    Girdi: "${text}"
    Analiz et ve PatientProfile JSON döndür.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: {
        parts: [
          { text: prompt },
          ...(imageBase64 ? [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }] : [])
        ]
      },
      config: { 
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "null");
    if (result) PhysioDB.setCachedResponse(inputHash, result);
    return result;
  } catch (err) {
    console.error("Consultation Error:", err);
    return null;
  }
};

export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `Feedback: ${JSON.stringify(feedback)}. Profil: ${JSON.stringify(currentProfile)}. JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return currentProfile;
  }
};

// ENHANCED OPTIMIZATION ENGINE
export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    // Periyodizasyon mantığı için prompt güçlendirildi
    const prompt = `
      Sen Kıdemli bir Spor Fizyoterapistisin.
      GÖREV: Aşağıdaki egzersizi "${goal}" klinik hedefine göre optimize et.
      
      MEVCUT VERİ: ${JSON.stringify(exercise)}
      
      ÇIKTI FORMATI (JSON):
      {
        "sets": number,
        "reps": number,
        "tempo": string (Format: "E-P-C", örn "3-1-3" veya "4-0-1"),
        "restPeriod": number (saniye),
        "targetRpe": number (1-10 arası Borg skalası),
        "frequency": string (örn: "Günde 2 kez" veya "Haftada 3 gün"),
        "biomechanics": string (Bu hedef için neden bu parametrelerin seçildiğini anlatan kısa klinik not)
      }
      
      KURALLAR:
      - Hipertrofi için: 3-4 set, 8-12 tekrar, 3-0-1 tempo, RPE 8.
      - Güç için: 3-5 set, 3-5 tekrar, Patlayıcı tempo (X-0-X), RPE 9.
      - Mobilite için: Yavaş tempo, tam ROM.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("Optimization Service Error:", err);
    return exercise;
  }
};

export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<string> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    let stylePrompt = "";
    let aspectRatio = "1:1";

    switch (style) {
        case 'Medical-Vector':
            stylePrompt = "TWO PANEL SPRITE SHEET (Side by Side). LEFT PANEL: Start Position. RIGHT PANEL: End Position. Style: Medical Vector Art, clean neon blue lines on dark background. Show muscle contraction clearly.";
            aspectRatio = "16:9";
            break;
        case 'X-Ray-Lottie':
            stylePrompt = "TWO PANEL SPRITE SHEET (Side by Side). LEFT PANEL: Start Position. RIGHT PANEL: End Position. Style: X-Ray Skeleton, glowing bones, transparent body. Highlight active joints.";
            aspectRatio = "16:9";
            break;
        case 'Cinematic-GIF':
            stylePrompt = "TWO PANEL SPRITE SHEET (Side by Side). LEFT PANEL: Start Pose. RIGHT PANEL: Peak Action Pose. Style: Photorealistic 8k, dramatic lighting, professional physiotherapy studio environment.";
            aspectRatio = "16:9";
            break;
        case 'Clinical-Slide':
            stylePrompt = "Instructional Diagram. Split screen showing Start vs End position clearly labeled with arrows.";
            aspectRatio = "16:9";
            break;
        default:
            stylePrompt = "Medical Illustration: High fidelity, professional clinic style, centered composition.";
    }

    const fullPrompt = `Create a professional physiotherapy visual for: "${exercise.titleTr || exercise.title}". 
    PROMPT: ${stylePrompt}
    Context: Clinical rehabilitation guide. 
    Important: If asking for TWO PANELS, ensure strict separation between left and right side for animation processing.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: aspectRatio } }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (e) {
    console.error("Image Gen Error", e);
    return '';
  }
};

// ENHANCED DATA GENERATOR
export const generateExerciseData = async (exerciseName: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Sen bir Tıbbi Veri Uzmanısın.
      EGZERSİZ: "${exerciseName}"
      
      GÖREV: Aşağıdaki alanları doldurarak detaylı bir klinik JSON oluştur.
      
      ÇIKTI (JSON):
      {
        "title": "${exerciseName}",
        "titleTr": "Türkçe Tıbbi Karşılığı",
        "description": "Hastanın anlayacağı dilde adım adım, net talimatlar.",
        "biomechanics": "Kinesiyolojik analiz (Eklem hareketleri, kas aktivasyon paternleri).",
        "primaryMuscles": ["Major Agonist 1", "Major Agonist 2"],
        "secondaryMuscles": ["Stabilizörler", "Sinerjistler"],
        "icdCode": "En uygun ICD-10 Kodu (örn M54.5)",
        "safetyFlags": ["Kontrendikasyon 1", "Risk Faktörü 2"],
        "rehabPhase": "Sub-Akut",
        "movementPlane": "Sagittal/Frontal/Transverse",
        "equipment": ["Gerekli ekipmanlar"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return {};
  }
};

export const generateExerciseTutorial = async (exerciseTitle: string): Promise<ExerciseTutorial | null> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const scriptPrompt = `
      Create a rhythmic breathing and movement script for: "${exerciseTitle}".
      Format: JSON { "bpm": 60, "script": [{ "step": 1, "text": "...", "duration": 3000, "animation": "hold" }] }
    `;

    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: scriptPrompt,
      config: { responseMimeType: "application/json" }
    });

    const scriptData = JSON.parse(scriptResponse.text || "{}");

    const ttsText = `Guide for ${exerciseTitle}. ${scriptData.script.map((s: any) => s.text).join(' ')}`;
    const audioResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: ttsText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });

    let audioBase64 = null;
    if (audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        audioBase64 = audioResponse.candidates[0].content.parts[0].inlineData.data;
    }

    return {
      script: scriptData.script,
      audioBase64: audioBase64,
      bpm: scriptData.bpm || 60
    };

  } catch (err) {
    console.error("Tutorial Gen Error:", err);
    return null;
  }
};
