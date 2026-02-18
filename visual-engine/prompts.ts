
import { Exercise, AnatomicalLayer } from '../types.ts';

/**
 * PHYSIOCORE PROMPT ENGINEERING ENGINE
 * Merkezi Prompt Yönetimi. Görsel kurallar ve grid yapıları burada tanımlanır.
 */

export const VisualPrompts = {
  
  // 1. Prompt Oluşturucu (Text Builder)
  construct: (exercise: Partial<Exercise>, layer: AnatomicalLayer | 'Cinematic-Motion'): string => {
    // A. Sinematik Hareket Modu (5x5 Grid)
    if (layer === 'Cinematic-Motion') {
      return `
      Type: Medical Sprite Sheet (5x5 Grid).
      Subject: Human performing ${exercise.titleTr || exercise.title}.
      
      --- GEOMETRY RULES (MANDATORY) ---
      1. GRID STRUCTURE: Strictly 5 columns x 5 rows (Total 25 Frames).
      2. CELL RATIO: Every individual cell MUST be a PERFECT SQUARE (1:1 aspect ratio).
      3. ALIGNMENT: The character must be centered in each square cell. DO NOT PAN CAMERA.
      4. BACKGROUND: Solid Dark Slate (#020617). No gradients.
      
      Sequence Logic:
      - Rows 1-2: Preparation & Concentric phase (Slow start).
      - Row 3: Peak contraction (Hold/Squeeze).
      - Rows 4-5: Eccentric phase & Return (Controlled).
      
      Style: 4K Clinical Photorealism, distinct muscle definition.
      `;
    }

    // B. Standart Anatomik Modlar (4x4 Grid)
    const anatomicalFocus = 
        layer === 'muscular' ? 'emphasizing deep red muscle fibers and striations, glowing active muscles' : 
        layer === 'skeletal' ? 'highlighting bone structure and joint articulation in white, transparent skin' :
        layer === 'xray' ? 'in a radiographic blue/white x-ray style, showing internal alignment' : 
        layer === 'vascular' ? 'showing veins and arteries in high contrast red/blue' :
        'showing a photorealistic athletic human figure, clinical lighting';

    return `
      Medical Illustration Sprite Sheet (4x4 Grid). 
      Subject: ${exercise.titleTr || exercise.title}. 
      Style: ${anatomicalFocus}.
      
      --- GEOMETRY RULES ---
      - Output Format: 1:1 Aspect Ratio Image containing 4x4 uniform square cells (16 frames).
      - Each frame must have identical dimensions.
      - Subject anchored to center. Feet fixed on ground plane.
      - Background: Solid #020617.
    `;
  },

  // 2. Video Promptu
  video: (exercise: Partial<Exercise>): string => {
    return `
      Subject: ${exercise.titleTr || exercise.title}. 
      Style: Clinical 4K medical animation. 
      Motion: Slow, fluid, anchored.
      Camera: Tripod mode (Fixed), side profile view.
      Background: Dark Slate (#020617).
      Lighting: Studio softbox, rim lighting on muscles.
    `;
  },

  // 3. Slayt Analiz Promptu
  slides: (exercise: Partial<Exercise>): string => {
    return `
      Analyze the exercise "${exercise.titleTr || exercise.title}".
      Break it down into exactly 10 chronological phases (Start -> Movement -> Peak -> Return).
      For each phase, provide a short professional instruction (max 15 words) and a specific clinical focus point (max 5 words).
      Output JSON format: { "slides": [ { "step": 1, "title": "Phase Name", "instruction": "...", "focus": "..." }, ... ] }
    `;
  },

  // 4. Vektör Promptu
  vector: (exercise: Partial<Exercise>): string => {
    return `Generate minimalistic SVG animation code for: "${exercise.titleTr || exercise.title}". Style: Cyan lines on dark bg, looping.`;
  }
};
