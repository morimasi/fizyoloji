
import { Exercise, AnatomicalLayer } from '../types.ts';

/**
 * PHYSIOCORE PROMPT ENGINEERING ENGINE v11.0 (REALISTIC HUMAN ANATOMY)
 * Architect: Chief Architect
 * Updates:
 *  - Full Cycle Loop Enforcement (Start -> Peak -> Start)
 *  - Absolute Coordinate Locking instructions
 *  - REALISTIC HUMAN BODY with real muscles, skeleton, vessels, x-ray visualization
 *  - High FPS, fluid, smooth motion quality
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

    // GERÇEK İNSAN VÜCUDİ KURALLARI
    const REALISTIC_HUMAN_BODY_RULES = `
    --- 🎯 REALISTIC HUMAN BODY REQUIREMENTS (MANDATORY) 🎯 ---
    1. USE REAL HUMAN BODY: Must be a photorealistic adult male human body, NOT 3D model, NOT cartoon, NOT illustration.
    2. ANATOMICAL ACCURACY: Real human proportions, realistic muscle definition, actual bone structure.
    3. HIGH DETAIL: Visible muscle fibers, actual vascular system, real skeletal anatomy when specified.
    4. PROFESSIONAL MEDICAL QUALITY: Clinical photography standard, medical textbook quality.
    5. ATHLETIC BUILD: Fit, well-defined muscles, low body fat to show anatomical details clearly.
    6. SKIN TRANSPARENCY: For anatomical layers, use semi-transparent skin to reveal underlying structures.
    `;

    // YÜK SEK KALİTE HAREKET KURALLARI
    const HIGH_QUALITY_MOTION_RULES = `
    --- 🎬 HIGH-QUALITY FLUID MOTION (60+ FPS EQUIVALENT) 🎬 ---
    1. SMOOTH TRANSITIONS: Buttery smooth movement between each frame, no sudden jumps.
    2. NATURAL BIOMECHANICS: Follow real human movement patterns, anatomically correct motion.
    3. FLUID ANIMATION: High frame rate equivalent smoothness (60+ FPS feel in 24 frames).
    4. CONSTANT VELOCITY: Even spacing between frames for consistent, professional motion.
    5. MUSCLE ACTIVATION: Show realistic muscle contraction and relaxation during movement.
    `;

    // A. Sinematik Hareket Modu (6x4 Grid - 24 Kare = Tam Döngü)
    if (layer === 'Cinematic-Motion') {
      return `
      TASK: Generate a "High-Fidelity REALISTIC HUMAN Medical Motion Sprite Sheet".
      SUBJECT: REAL HUMAN athletic male body performing: "${exercise.titleTr || exercise.title}".

      --- FORMAT: 6x4 GRID (24 FRAMES TOTAL) ---
      CRITICAL: You must generate a PERFECT LOOP (Concentric + Eccentric phase) using REAL HUMAN BODY.

      TIMING DISTRIBUTION (ULTRA-SMOOTH PACING):
      - Frame 1 (Start): Neutral / Starting Position (0% Range) - REAL HUMAN BODY
      - Frame 2-11: Ultra-smooth Concentric Phase (Moving towards peak) - Show realistic muscle activation
      - Frame 12 (Peak): Maximum Contraction / End Range (100% Range) - Muscles fully engaged
      - Frame 13-23: Ultra-smooth Eccentric Phase (Returning controlledly) - Show muscle relaxation
      - Frame 24 (End): Back to Neutral Position (Same as Frame 1) - Ready for seamless loop

      The movement must be distributed with PERFECT SMOOTHNESS across these frames creating a 60+ FPS feel.

      ${REALISTIC_HUMAN_BODY_RULES}
      ${HIGH_QUALITY_MOTION_RULES}
      ${CORE_STABILITY_RULES}

      VISUAL STYLE:
      - Photorealistic REAL human male body (NOT 3D model)
      - Medical/clinical photography quality
      - Professional gym lighting (soft, even, clinical)
      - Clean dark slate background (#020617)
      - Sharp focus on anatomical details
      - 4K equivalent resolution quality
      `;
    }

    // B. Anatomik Katman Modları (GERÇEK İNSAN VÜCUDİ)
    let anatomicalFocus = '';

    if (layer === 'muscular') {
      anatomicalFocus = `
      ANATOMICAL LAYER: MUSCULAR SYSTEM (REAL HUMAN)
      - Base: REAL photorealistic human male body
      - Skin: Semi-transparent to reveal muscle layers underneath
      - Muscles: Show ACTUAL human muscle anatomy with fiber detail
      - Active Muscles: Highlight exercising muscles with enhanced blood flow (reddish glow)
      - Inactive Muscles: Normal muscle color, slightly visible through skin
      - Medical accuracy: Follow real human muscular anatomy exactly
      - NO 3D models, NO illustrations - ONLY real human body photography style
      `;
    } else if (layer === 'skeletal') {
      anatomicalFocus = `
      ANATOMICAL LAYER: SKELETAL SYSTEM (REAL HUMAN X-RAY STYLE)
      - Base: REAL human body in X-ray visualization style
      - Bones: Show ACTUAL human skeletal structure (white/bright on dark)
      - Joints: Highlight articulation points (cyan/blue glow)
      - Skin/Muscles: Ghosted/semi-transparent to reveal bones
      - Medical X-ray aesthetic: Clinical radiograph quality
      - Anatomical accuracy: Real human bone structure and proportions
      - Background: Deep medical blue-black (#020617)
      `;
    } else if (layer === 'xray') {
      anatomicalFocus = `
      ANATOMICAL LAYER: FULL X-RAY RADIOGRAPH (REAL HUMAN)
      - Style: Clinical X-ray radiograph of REAL human body
      - Bones: High contrast white skeletal system
      - Soft Tissue: Ghosted gray silhouette showing body outline
      - Joints: Visible articulation spaces
      - Active Area: Subtle cyan/blue highlight on moving body part
      - Medical Standard: Hospital-quality X-ray imaging
      - Inverted contrast: White bones on dark blue-black background
      - NO 3D rendering - Pure medical imaging aesthetic
      `;
    } else if (layer === 'vascular') {
      anatomicalFocus = `
      ANATOMICAL LAYER: VASCULAR SYSTEM (REAL HUMAN ANGIOGRAPHY)
      - Base: REAL human body with visible circulatory system
      - Arteries: Bright red vessels carrying oxygenated blood
      - Veins: Deep blue vessels returning blood
      - Capillaries: Fine network in active muscles
      - Active Region: Enhanced blood flow (brighter, more prominent vessels)
      - Skin: Semi-transparent to reveal vascular network
      - Medical Angiography style: Clinical vascular imaging quality
      - Anatomical accuracy: Real human circulatory system layout
      `;
    } else {
      anatomicalFocus = `
      ANATOMICAL LAYER: FULL BODY PHOTOREALISTIC (REAL HUMAN)
      - Subject: Athletic adult male with well-defined musculature
      - Body Type: Fit, low body fat, visible muscle definition
      - Skin: Natural realistic skin tone, showing muscle contours
      - Lighting: Professional clinical/medical photography lighting
      - Detail: Show natural muscle definition during exercise
      - Quality: Professional medical photography standard
      - Clothing: Minimal (athletic shorts only) to show body mechanics
      - Background: Clean dark slate (#020617) clinical studio
      `;
    }

    return `
      TASK: Generate a "REALISTIC HUMAN Medical Sprite Sheet" for high-quality animation.
      SUBJECT: REAL HUMAN BODY performing "${exercise.titleTr || exercise.title}".
      FORMAT: 6x4 Grid (24 Frames).

      CYCLE INSTRUCTION:
      Create a full Start-to-Finish-to-Start loop with ULTRA-SMOOTH motion.
      Frame 1: Start Position (REAL HUMAN BODY).
      Frame 12: Peak/Mid-point (maximum muscle engagement).
      Frame 24: Return to Start (seamless loop ready).
      Distribute movement with PERFECT SMOOTHNESS to create 60+ FPS quality feel.

      ${anatomicalFocus}

      ${REALISTIC_HUMAN_BODY_RULES}
      ${HIGH_QUALITY_MOTION_RULES}
      ${CORE_STABILITY_RULES}

      CRITICAL REQUIREMENTS:
      - Must be REAL HUMAN BODY (photorealistic)
      - NOT 3D model, NOT illustration, NOT cartoon
      - Medical photography quality
      - Smooth, fluid, professional motion
      - High detail anatomical accuracy
    `;
  },

  // 2. Video Promptu (GERÇEK İNSAN VİDEO)
  video: (exercise: Partial<Exercise>): string => {
    return `
      Professional medical animation of "${exercise.titleTr || exercise.title}" performed by a REAL HUMAN.

      SUBJECT REQUIREMENTS:
      - REAL photorealistic adult male human body (NOT 3D model, NOT CGI)
      - Athletic build with well-defined muscles
      - Medical/clinical photography quality
      - Natural human movement biomechanics

      FORMAT & MOTION:
      - Seamless Loop (concentric + eccentric phases)
      - Ultra-smooth, fluid motion (60 FPS quality)
      - Complete repetition: Start → Peak → Return to Start
      - Perfect anatomical movement patterns

      TECHNICAL SPECS:
      - Resolution: 720p minimum, 4K preferred
      - Aspect Ratio: 16:9
      - Frame Rate: 60 FPS for maximum smoothness
      - Camera: Locked tripod position (no shake, no movement)

      VISUAL STYLE:
      - Professional medical/clinical video quality
      - Even, soft professional lighting
      - Clean dark clinical studio background (#020617)
      - Sharp focus on body mechanics and muscle activation
      - Show visible muscle engagement during exercise

      NEGATIVE PROMPTS (AVOID):
      - 3D models, CGI, cartoon, illustration
      - Shaky camera, morphing, distortion
      - Extra limbs, unnatural proportions
      - Text, watermarks, logos
      - Motion blur, uneven speed
      - Poor lighting, shadows
    `;
  },

  // 3. Slayt Analiz Promptu
  slides: (exercise: Partial<Exercise>): string => {
    return `
      Act as a Senior Clinical Instructor. Analyze the exercise "${exercise.titleTr || exercise.title}".
      Break it down into exactly 10 micro-phases focusing on REAL HUMAN biomechanics.

      For each phase, describe:
      - Exact body position
      - Which muscles are activated
      - Joint angles and movement
      - Breathing pattern
      - Common mistakes to avoid

      Output JSON format: { "slides": [ { "step": 1, "title": "Phase Name", "instruction": "...", "focus": "muscle groups and biomechanics", "technique": "proper form cues" }, ... ] }
    `;
  },

  // 4. Vektör Promptu
  vector: (exercise: Partial<Exercise>): string => {
    return `
      Generate clean, minimalistic SVG animation code (SMIL) for: "${exercise.titleTr || exercise.title}".

      REQUIREMENTS:
      - Style: Medical blueprint/wireframe based on REAL HUMAN proportions
      - Anatomically accurate stick figure with proper joint positions
      - Show movement path and range of motion
      - Colors: Stroke cyan (#06b6d4), Active parts highlighted
      - Background: Transparent or dark slate (#020617)
      - Animation: Infinite smooth loop with ease-in-out timing
      - Motion: Follow natural human biomechanics

      The vector animation should represent the same movement as performed by a real human body.
    `;
  }
};
