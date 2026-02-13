
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - GEMINI 3 FLASH ENGINE (v8.0 Motion Strip Edition)
 * High-Fluidity Vector Puppetry & Clinical Logic
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

// Vektörel Kukla Motoru (Video yerine 6-Kareli Sprite Üretir)
export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  // Varsayılan olarak 6 kareli animasyon bandı üretir
  const result = await generateExerciseVisual(exercise, 'Medical-Vector-Art');
  return result.url;
};

// Klinik Muhakeme: Gemini 3 Flash
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
    const prompt = `Sen kıdemli bir klinik uzmanısın.
    Girdi: "${text}"
    Hasta Geçmişi: ${JSON.stringify(history || [])}
    Görevin: Girdiyi analiz et ve eksiksiz bir PatientProfile JSON nesnesi döndür.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
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

// Adaptif Düzenleme: Gemini 3 Flash
export const runAdaptiveAdjustment = async (currentProfile: PatientProfile, feedback: ProgressReport): Promise<PatientProfile> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Hasta Geri Bildirimi: ${JSON.stringify(feedback)}. Mevcut Profil: ${JSON.stringify(currentProfile)}. Tedavi planını güncelle ve JSON döndür.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return currentProfile;
  }
};

// Dozaj Optimizasyonu: Gemini 3 Flash
export const optimizeExerciseData = async (exercise: Partial<Exercise>, goal: string): Promise<Partial<Exercise>> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Sen Kıdemli bir Spor Fizyoterapistisin.
      GÖREV: Aşağıdaki egzersizi "${goal}" klinik hedefine göre optimize et.
      
      MEVCUT VERİ: ${JSON.stringify(exercise)}
      
      ÇIKTI FORMATI (JSON):
      {
        "sets": number,
        "reps": number,
        "tempo": string (Format: "E-P-C", örn "3-1-3"),
        "restPeriod": number (saniye),
        "targetRpe": number (1-10 Borg),
        "frequency": string,
        "biomechanics": string (Kısa klinik rasyonel)
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("Optimization Service Error:", err);
    return exercise;
  }
};

// GÖRSEL MOTOR: Gemini 2.5 Flash Image (Multi-Frame Sprite Edition)
export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<{ url: string, frameCount: number }> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    // 1. DATA EXTRACTION
    const primaryMuscles = exercise.primaryMuscles?.join(', ') || 'Target Muscles';
    const equipment = exercise.equipment?.join(', ') || 'Bodyweight';
    const biomechanics = exercise.biomechanics || 'Movement flow';
    const plane = exercise.movementPlane || 'Sagittal';
    
    // 2. DYNAMIC FRAME COUNT CALCULATION
    // Kompleks veya çok aşamalı egzersizler için daha fazla kare
    const isComplex = exercise.difficulty && exercise.difficulty > 6;
    const frameCount = isComplex ? 8 : 6; 

    // 3. CONTEXT AWARE PROMPT CONSTRUCTION (FILMSTRIP MODE)
    // We request a 16:9 image but divide it internally into N columns.
    let stylePrompt = `Create a wide, panoramic sprite sheet containing exactly ${frameCount} sequential keyframes arranged horizontally in a single strip. `;
    
    switch (style) {
        case 'Medical-Vector':
            stylePrompt += `
            Style: High-end medical vector art. Dark blue background.
            ANATOMY: ${primaryMuscles} should glow NEON CYAN. Bones are faint white lines.
            `;
            break;
        case 'X-Ray-Lottie':
            stylePrompt += `
            Style: Glowing holographic X-Ray. Blue skeleton, transparent muscles.
            FOCUS: Highlight joint articulation in the ${plane} plane.
            `;
            break;
        case 'Cinematic-GIF':
            stylePrompt += `
            Style: Photorealistic studio lighting. Professional athlete model.
            ATMOSPHERE: Clinical and clean.
            `;
            break;
        default:
            stylePrompt += "Style: Clean professional medical illustration sequence.";
    }

    const fullPrompt = `
    ${stylePrompt}

    SUBJECT: A frame-by-frame breakdown of the physiotherapy exercise "${exercise.titleTr || exercise.title}".
    
    LAYOUT INSTRUCTIONS (CRITICAL):
    - The image must contain ${frameCount} distinct figures arranged side-by-side from Left to Right.
    - Frame 1 (Leftmost): Starting position.
    - Frame ${Math.ceil(frameCount / 2)} (Middle): Mid-range / Transition.
    - Frame ${frameCount} (Rightmost): End position / Peak contraction.
    - The transition between frames must be smooth and linear to create a fluid animation when played.
    - Equipment (${equipment}) must be consistent across all frames.
    - Do NOT include text, arrows, or labels. Pure visual sequence.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } } // Wide aspect ratio to accommodate the strip
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return {
                url: `data:image/png;base64,${part.inlineData.data}`,
                frameCount: frameCount
            };
        }
      }
    }
    return { url: '', frameCount: 0 };
  } catch (e) {
    console.error("Image Gen Error", e);
    return { url: '', frameCount: 0 };
  }
};

// KLİNİK VERİ ÜRETİCİ: Gemini 3 Flash
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
        "description": "Hastanın anlayacağı dilde adım adım talimatlar.",
        "biomechanics": "Kinesiyolojik analiz.",
        "primaryMuscles": ["Agonist 1", "Agonist 2"],
        "secondaryMuscles": ["Stabilizörler"],
        "icdCode": "ICD-10 Kodu (örn M54.5)",
        "safetyFlags": ["Kontrendikasyonlar"],
        "rehabPhase": "Sub-Akut",
        "movementPlane": "Sagittal",
        "equipment": ["Gerekli ekipmanlar"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return {};
  }
};

// SESLİ REHBER: Gemini 3 Flash (Script) + Gemini 2.5 Flash TTS (Audio)
export const generateExerciseTutorial = async (exerciseTitle: string): Promise<ExerciseTutorial | null> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });

    // 1. Script Generation
    const scriptPrompt = `
      Create a rhythmic breathing and movement script for: "${exerciseTitle}".
      Format: JSON { "bpm": 60, "script": [{ "step": 1, "text": "...", "duration": 3000, "animation": "hold" }] }
    `;

    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: scriptPrompt,
      config: { responseMimeType: "application/json" }
    });

    const scriptData = JSON.parse(scriptResponse.text || "{}");

    // 2. Audio Generation
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
