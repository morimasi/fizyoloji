
import { Exercise, AnatomicalLayer } from '../types.ts';

/**
 * PHYSIOCORE PROMPT ENGINEERING ENGINE v9.0 (24FPS CINEMATIC STANDARD)
 * Architect: Chief Architect
 * Description: Implements strict Grid-Lock and 24fps Distribution rules.
 */

export const VisualPrompts = {
  
  // 1. Prompt Oluşturucu (Text Builder)
  construct: (exercise: Partial<Exercise>, layer: AnatomicalLayer | 'Cinematic-Motion'): string => {
    
    // ORTAK STABİLİZASYON ÇEKİRDEĞİ
    const CORE_STABILITY_RULES = `
    --- 🛑 CRITICAL GEOMETRY & STABILITY RULES (NON-NEGOTIABLE) 🛑 ---
    1. CAMERA LOCK (TRIPOD MODE): The camera is FROZEN. No zoom, no pan, no tilt.
    2. ORTHOGRAPHIC PROJECTION: Flat, technical medical illustration view. No perspective distortion.
    3. ANCHOR POINT: The character's PELVIS and FEET must remain at the EXACT SAME relative pixel coordinates in every cell.
    4. NO MOTION BLUR: Every single frame must be razor-sharp.
    5. BACKGROUND: Solid, matte Dark Slate (#020617).
    `;

    // A. Sinematik Hareket Modu (5x5 Grid - 25 Kare = 24fps + 1 Loop Frame)
    if (layer === 'Cinematic-Motion') {
      return `
      TASK: Generate a "High-Fidelity Medical Motion Sprite Sheet".
      SUBJECT: Athletic Human performing the clinical exercise: "${exercise.titleTr || exercise.title}".
      
      --- FORMAT: 5x5 GRID (25 FRAMES TOTAL) ---
      IMPORTANT: This sprite sheet represents exactly 1 second of fluid motion at 24fps.
      DISTRIBUTION RULE: Distribute the movement range EQUALLY across the 25 frames.
      
      - Frame 1 (Row 1, Col 1): Start Position (0%).
      - Frame 13 (Row 3, Col 3): Peak Contraction / Mid-Point (50%).
      - Frame 25 (Row 5, Col 5): Return to Start / Loop Connection (100%).
      
      The transition between each cell must be microscopic and fluid (approx 4% movement per frame).
      
      ${CORE_STABILITY_RULES}
      
      STYLE: 4K Unreal Engine 5 Render style, clinical precision, glowing blue biological markers on active joints.
      `;
    }

    // B. Standart Anatomik Modlar (Hala 4x4 destekli ama 5x5 tercih edilir)
    const anatomicalFocus = 
        layer === 'muscular' ? 'Style: "Muscle-Map". Transparent skin. Active muscles glow Neon Cyan.' : 
        layer === 'skeletal' ? 'Style: "Clinical Osteology". White bones, Blue joints. Deep X-Ray blue bg.' :
        layer === 'xray' ? 'Style: "Radiograph". High contrast Blue/White inverted X-Ray.' : 
        layer === 'vascular' ? 'Style: "Angiography". Veins (Blue) and Arteries (Red) visible.' :
        'Style: "Standard Clinical". Photorealistic, athletic fit model, neutral clothing.';

    return `
      TASK: Generate a "Medical Sprite Sheet" for animation.
      SUBJECT: ${exercise.titleTr || exercise.title}.
      FORMAT: 5x5 Grid (25 Frames). 
      DISTRIBUTION: Distribute the movement perfectly evenly across all 25 frames for smooth 24fps playback.
      
      ${anatomicalFocus}
      
      ${CORE_STABILITY_RULES}

      INSTRUCTION:
      - Center the character in every cell.
      - Ensure frame 25 connects smoothly back to frame 1.
    `;
  },

  // 2. Video Promptu
  video: (exercise: Partial<Exercise>): string => {
    return `
      High-end medical animation of "${exercise.titleTr || exercise.title}".
      Camera: Static, Orthographic Side View (Tripod Mode).
      Action: Slow, fluid, controlled rehabilitation movement. Perfect form.
      Style: 4K, Cinematic Lighting, 24fps smoothness.
      Subject: Fit anatomical model.
      Background: Clean, dark clinical studio (#020617).
      Negative Prompt: Shaky camera, morphing, extra limbs, text, watermark, blurry.
    `;
  },

  // 3. Slayt Analiz Promptu
  slides: (exercise: Partial<Exercise>): string => {
    return `
      Act as a Senior Clinical Instructor. Analyze the exercise "${exercise.titleTr || exercise.title}".
      Break it down into exactly 10 micro-phases.
      Output JSON format: { "slides": [ { "step": 1, "title": "Phase Name", "instruction": "...", "focus": "..." }, ... ] }
    `;
  },

  // 4. Vektör Promptu
  vector: (exercise: Partial<Exercise>): string => {
    return `
      Generate clean, minimalistic SVG animation code (SMIL) for: "${exercise.titleTr || exercise.title}".
      Style: "Blueprint Wireframe". Colors: Stroke cyan (#06b6d4), Background transparent.
      Animation: Infinite loop, smooth ease-in-out.
    `;
  }
};
