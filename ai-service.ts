
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PatientProfile, ProgressReport, Exercise, DetailedPainLog, TreatmentHistory, ExerciseTutorial } from "./types.ts";
import { PhysioDB } from "./db-repository.ts";

/**
 * PHYSIOCORE AI - GEMINI 3 FLASH ENGINE (v9.2 Cinematic Fluidity)
 * High-Density Slow Motion Vector Puppetry
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

// Vektörel Kukla Motoru
export const generateExerciseVideo = async (exercise: Partial<Exercise>): Promise<string> => {
  const result = await generateExerciseVisual(exercise, 'Medical-Vector-Art');
  return result.url;
};

// Klinik Muhakeme
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

// GÖRSEL MOTOR: Gemini 2.5 Flash Image (24 FPS GRID MATRIX - SLOW MOTION CAPTURE)
export const generateExerciseVisual = async (exercise: Partial<Exercise>, style: string): Promise<{ url: string, frameCount: number, layout: 'grid-4x6' | 'strip' }> => {
  try {
    const apiKey = await ensureApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const primaryMuscles = exercise.primaryMuscles?.join(', ') || 'Global Body';
    const equipment = exercise.equipment?.length ? `USING: ${exercise.equipment.join(', ')}` : 'BODYWEIGHT ONLY';
    
    // 24 kare (4 Satır, 6 Sütun)
    const gridRows = 4;
    const gridCols = 6;
    const totalFrames = gridRows * gridCols;

    let stylePrompt = `Create a HIGH-PRECISION SPRITE SHEET containing exactly ${totalFrames} frames arranged in a ${gridRows}x${gridCols} GRID matrix. `;
    
    switch (style) {
        case 'Medical-Vector':
            stylePrompt += `
            Style: Premium Medical Vector Art. Dark Slate Background.
            Anatomy: The ${primaryMuscles} must glow NEON CYAN to show activation.
            Look: Clean lines, high contrast, flat shading (Kurzgesagt style but medical).
            `;
            break;
        case 'X-Ray-Lottie':
            stylePrompt += `
            Style: Bioluminescent X-Ray. 
            Skeleton: Blue glowing bones.
            Muscles: ${primaryMuscles} highlighted in Red/Orange heat map style.
            `;
            break;
        case 'Cinematic-GIF':
            stylePrompt += `
            Style: Photorealistic 8K Studio Lighting.
            Model: Professional athlete wearing minimal clinical attire.
            Background: Dark infinite studio void.
            `;
            break;
        default:
            stylePrompt += "Style: Clean professional medical illustration.";
    }

    const fullPrompt = `
    ${stylePrompt}

    SUBJECT: The exercise is "${exercise.titleTr || exercise.title}".
    
    ANIMATION INSTRUCTIONS (CRITICAL FOR FLUIDITY):
    - This must look like a HIGH-SPEED CAMERA SLOW MOTION capture.
    - The difference between Frame 1 and Frame 2 must be TINY (Micro-movements).
    - Do NOT make large jumps between frames. I need smooth interpolation.
    - Equipment: ${equipment} (MUST be consistent in all frames).
    
    LAYOUT INSTRUCTIONS (STRICT):
    - The image must be a grid of ${gridRows} rows and ${gridCols} columns.
    - Sequence starts Top-Left (Frame 1) and reads Left-to-Right, then down to next row.
    - Ends at Bottom-Right (Frame ${totalFrames}).
    - The sequence must show ONE complete, VERY SMOOTH repetition.
    - NO text, NO arrows, NO UI elements. Just the character.
    - Background must be solid and uniform color (Dark Slate or Black).
    - Ensure strict alignment so the character does not "jitter" when frames are played.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: fullPrompt }] },
      config: { imageConfig: { aspectRatio: "4:3" } } // 4:3 ensures enough vertical space for 4 rows
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return {
                url: `data:image/png;base64,${part.inlineData.data}`,
                frameCount: totalFrames,
                layout: 'grid-4x6'
            };
        }
      }
    }
    return { url: '', frameCount: 0, layout: 'strip' };
  } catch (e) {
    console.error("Image Gen Error", e);
    return { url: '', frameCount: 0, layout: 'strip' };
  }
};

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
