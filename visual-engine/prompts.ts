
import { Exercise, AnatomicalLayer } from '../types.ts';

/**
 * PHYSIOCORE PROMPT ENGINEERING ENGINE v8.0 (STEADY-CAM PROTOCOL)
 * Architect: Chief Architect
 * Description: Implements strict Grid-Lock and Orthographic Projection rules to prevent visual jitter.
 */

export const VisualPrompts = {
  
  // 1. Prompt Oluşturucu (Text Builder)
  construct: (exercise: Partial<Exercise>, layer: AnatomicalLayer | 'Cinematic-Motion'): string => {
    
    // ORTAK STABİLİZASYON ÇEKİRDEĞİ (Tüm modlar için geçerli anayasa)
    const CORE_STABILITY_RULES = `
    --- 🛑 CRITICAL GEOMETRY & STABILITY RULES (NON-NEGOTIABLE) 🛑 ---
    1. CAMERA LOCK (TRIPOD MODE): The camera is FROZEN. No zoom, no pan, no tilt, no rotation between frames.
    2. ORTHOGRAPHIC PROJECTION: Use a flat, technical medical illustration view. Eliminate perspective distortion (No fish-eye).
    3. ANCHOR POINT: The character's PELVIS and FEET must remain at the EXACT SAME relative pixel coordinates in every cell unless the movement explicitly requires lifting them.
    4. NO MOTION BLUR: Every single frame must be razor-sharp. We need distinct keyframes, not a blur.
    5. CONSISTENT ANATOMY: Muscle volume and bone length must not change between frames (No morphing).
    6. BACKGROUND: Solid, matte Dark Slate (#020617). No gradients, no noise, no props other than equipment.
    `;

    // A. Sinematik Hareket Modu (5x5 Grid - 25 Kare)
    if (layer === 'Cinematic-Motion') {
      return `
      TASK: Generate a "High-Fidelity Medical Motion Sprite Sheet".
      SUBJECT: Athletic Human performing the clinical exercise: "${exercise.titleTr || exercise.title}".
      FORMAT: 5x5 Grid (Total 25 Frames).
      
      ${CORE_STABILITY_RULES}
      
      --- MOTION SEQUENCE LOGIC (25 FRAMES) ---
      - Frames 1-5 (Row 1): Start Position -> Initiation (Slow & Controlled).
      - Frames 6-15 (Rows 2-3): Concentric Phase -> Peak Contraction (Iso Hold).
      - Frames 16-25 (Rows 4-5): Eccentric Phase -> Return to Start (Controlled).
      
      STYLE: 4K Unreal Engine 5 Render style, clinical precision, slightly glowing blue biological markers on active joints.
      `;
    }

    // B. Standart Anatomik Modlar (4x4 Grid - 16 Kare)
    const anatomicalFocus = 
        layer === 'muscular' ? 'Style: "Muscle-Map". Skin is transparent. Deep red muscles are visible. Active muscles glow Neon Cyan.' : 
        layer === 'skeletal' ? 'Style: "Clinical Osteology". Pure white bone structure. Joints are highlighted in blue. Background is deep X-Ray blue.' :
        layer === 'xray' ? 'Style: "Radiograph". High contrast Blue/White inverted X-Ray. Internal alignment focus.' : 
        layer === 'vascular' ? 'Style: "Angiography". Veins (Blue) and Arteries (Red) clearly visible against a dark silhouette.' :
        'Style: "Standard Clinical". Photorealistic, athletic fit model, neutral clothing (grey shorts), clinical studio lighting.';

    return `
      TASK: Generate a "Standard Medical Sprite Sheet".
      SUBJECT: ${exercise.titleTr || exercise.title}.
      FORMAT: 4x4 Grid (Total 16 Frames). Each cell is a perfect 1:1 square.
      
      ${anatomicalFocus}
      
      ${CORE_STABILITY_RULES}

      INSTRUCTION:
      - The character MUST remain centered in each of the 16 cells.
      - Do not cut off heads or feet.
      - Maintain a "Safe Zone" padding around the character in each cell.
    `;
  },

  // 2. Video Promptu (Veo / Runway Gen-2 Logic)
  video: (exercise: Partial<Exercise>): string => {
    return `
      High-end medical animation of "${exercise.titleTr || exercise.title}".
      Camera: Static, Orthographic Side View (Tripod Mode).
      Action: Slow, fluid, controlled rehabilitation movement. Perfect form.
      Style: 4K, Cinematic Lighting, 60fps smoothness.
      Subject: Fit anatomical model.
      Background: Clean, dark clinical studio (#020617).
      Negative Prompt: Shaky camera, morphing, extra limbs, text, watermark, blurry, distorted face.
    `;
  },

  // 3. Slayt Analiz Promptu (Clinical Reasoning)
  slides: (exercise: Partial<Exercise>): string => {
    return `
      Act as a Senior Clinical Instructor. Analyze the exercise "${exercise.titleTr || exercise.title}".
      Break it down into exactly 10 micro-phases for a frame-by-frame analysis.
      
      Output JSON format: 
      { 
        "slides": [ 
          { 
            "step": 1, 
            "title": "Phase Name (e.g., Initial Loading)", 
            "instruction": "Precise biomechanical instruction (max 15 words).", 
            "focus": "Key muscle/joint to watch (max 3 words)." 
          }, 
          ... 
        ] 
      }
    `;
  },

  // 4. Vektör Promptu (SVG Code Gen)
  vector: (exercise: Partial<Exercise>): string => {
    return `
      Generate clean, minimalistic SVG animation code (SMIL) for: "${exercise.titleTr || exercise.title}".
      Style: "Blueprint Wireframe". 
      Colors: Stroke cyan (#06b6d4), Background transparent.
      Animation: Infinite loop, smooth ease-in-out.
      Elements: Simple stick figure or geometric representation of the movement.
    `;
  }
};
