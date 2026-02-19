
import { Exercise, AnatomicalLayer } from '../types.ts';

/**
 * PHYSIOCORE PROMPT ENGINEERING ENGINE v10.0 (ZERO-JITTER CYCLE)
 * Architect: Chief Architect
 * Updates: 
 *  - Full Cycle Loop Enforcement (Start -> Peak -> Start)
 *  - Absolute Coordinate Locking instructions
 */

export const VisualPrompts = {
  
  // 1. Prompt Oluşturucu (Text Builder)
  construct: (exercise: Partial<Exercise>, layer: AnatomicalLayer | 'Cinematic-Motion'): string => {
    
    // SIFIR TİTREŞİM VE MERKEZLEME KURALLARI
    const CORE_STABILITY_RULES = `
    --- 🛑 ZERO-JITTER & GEOMETRY RULES (STRICT) 🛑 ---
    1. ABSOLUTE CENTER LOCK: The character's core/pelvis must be at the EXACT pixel center of every cell.
    2. CAMERA TRIPOD MODE: The camera must NOT move, pan, or zoom. Frozen coordinates.
    3. ISOLATED MOVEMENT: Only the active limb moves. The rest of the body is a statue.
    4. NO GHOSTING: Edges must be sharp. No motion blur.
    5. BACKGROUND: Solid, matte Dark Slate (#020617). No shadows or floor lines.
    `;

    // A. Sinematik Hareket Modu (5x5 Grid - 25 Kare = Tam Döngü)
    if (layer === 'Cinematic-Motion') {
      return `
      TASK: Generate a "High-Fidelity Medical Motion Sprite Sheet".
      SUBJECT: Athletic Human performing: "${exercise.titleTr || exercise.title}".
      
      --- FORMAT: 5x5 GRID (25 FRAMES TOTAL) ---
      CRITICAL: You must generate a PERFECT LOOP (Concentric + Eccentric phase).
      
      TIMING DISTRIBUTION (EQUAL PACING):
      - Frame 1 (Start): Neutral / Starting Position (0% Range).
      - Frame 2-12: Smooth Concentric Phase (Moving towards peak).
      - Frame 13 (Peak): Maximum Contraction / End Range (100% Range).
      - Frame 14-24: Smooth Eccentric Phase (Returning controlledly).
      - Frame 25 (End): Back to Neutral Position (Same as Frame 1).
      
      The movement must be evenly distributed across these frames so the animation flows liquidly at 24fps.
      
      ${CORE_STABILITY_RULES}
      
      STYLE: 4K Unreal Engine 5 Render, clinical precision, glowing blue biomechanical highlights on active muscles.
      `;
    }

    // B. Standart Anatomik Modlar
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
      
      CYCLE INSTRUCTION:
      Create a full Start-to-Finish-to-Start loop.
      Frame 1: Start. Frame 13: Mid-point. Frame 25: Return to Start.
      Distribute movement equally to ensure constant speed.
      
      ${anatomicalFocus}
      
      ${CORE_STABILITY_RULES}
    `;
  },

  // 2. Video Promptu
  video: (exercise: Partial<Exercise>): string => {
    return `
      Professional medical animation of "${exercise.titleTr || exercise.title}".
      Format: Seamless Loop.
      Action: Complete repetition (Start -> Peak -> Start).
      Camera: Locked Tripod (No Shake).
      Style: 4K, Cinematic Lighting, 24fps smoothness.
      Subject: Fit anatomical model.
      Background: Clean, dark clinical studio (#020617).
      Negative Prompt: Shaky camera, morphing, extra limbs, text, watermark, blurry, uneven speed.
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
