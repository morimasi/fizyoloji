
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

/**
 * PHYSIOCORE SYNC ENGINE v10.1 (Bulletproof UUID & Mapping Fix)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { syncType, payload } = req.body;
    if (!syncType || !payload) return res.status(400).json({ error: 'Eksik veri yükü.' });

    console.log(`[SyncServer] Processing: ${syncType}`);

    // Helper: Validate UUID or Generate New One
    const getValidUUID = (id: any) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return (typeof id === 'string' && uuidRegex.test(id)) ? id : crypto.randomUUID();
    };

    // --- PROFILE UPSERT ---
    if (syncType === 'PROFILE_UPSERT') {
      const { id, fullName, email, role, phone, patientProfile } = payload;
      const finalId = getValidUUID(id);
      
      // 1. Users Table Upsert
      await sql`
        INSERT INTO users (id, full_name, email, role, phone)
        VALUES (${finalId}, ${fullName}, ${email}, ${role}, ${phone || null})
        ON CONFLICT (email) DO UPDATE SET 
          full_name = EXCLUDED.full_name, 
          phone = EXCLUDED.phone, 
          updated_at = CURRENT_TIMESTAMP;
      `;

      // 2. Patients Table Upsert (If applicable)
      if (role === 'Patient' && patientProfile) {
        // Users tablosundan email ile ID'yi çekmemiz gerekebilir ama conflict durumunda ID değişmez.
        // Güvenlik için email üzerinden ID'yi doğruluyoruz.
        const userCheck = await sql`SELECT id FROM users WHERE email = ${email}`;
        const userId = userCheck.rows[0]?.id || finalId;

        await sql`
          INSERT INTO patients (
            user_id, status, current_rehab_phase, risk_level, 
            diagnosis_summary, physical_assessment, updated_at
          )
          VALUES (
            ${userId}, 
            ${patientProfile.status || 'Stabil'}, 
            ${patientProfile.rehabPhase || 'Akut'}, 
            ${patientProfile.riskLevel || 'Düşük'}, 
            ${patientProfile.diagnosisSummary || null}, 
            ${JSON.stringify(patientProfile.physicalAssessment || {})},
            CURRENT_TIMESTAMP
          )
          ON CONFLICT (user_id) DO UPDATE SET 
            status = EXCLUDED.status, 
            risk_level = EXCLUDED.risk_level, 
            diagnosis_summary = EXCLUDED.diagnosis_summary,
            physical_assessment = EXCLUDED.physical_assessment,
            updated_at = CURRENT_TIMESTAMP;
        `;
      }
      return res.status(200).json({ success: true, userId: finalId });
    }

    // --- CLINICAL TASK SYNC ---
    if (syncType === 'TASK_SYNC') {
      const { id, title, priority, status, aiRecommendation, therapistId, patientId } = payload;
      const finalId = getValidUUID(id);
      const validTherapistId = getValidUUID(therapistId); // Fallback to random if missing, usually logic error but prevents 500
      
      // Patient ID opsiyoneldir, eğer varsa ve geçerli değilse NULL yap
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validPatientId = (patientId && uuidRegex.test(patientId)) ? patientId : null;

      await sql`
        INSERT INTO clinical_tasks (id, title, priority, status, ai_recommendation, therapist_id, patient_id)
        VALUES (
          ${finalId}, 
          ${title}, 
          ${priority}, 
          ${status || 'Pending'}, 
          ${aiRecommendation || null}, 
          ${validTherapistId}, 
          ${validPatientId}
        )
        ON CONFLICT (id) DO UPDATE SET 
          status = EXCLUDED.status, 
          priority = EXCLUDED.priority,
          ai_recommendation = EXCLUDED.ai_recommendation,
          updated_at = CURRENT_TIMESTAMP;
      `;
      return res.status(200).json({ success: true });
    }

    // --- STUDIO EXERCISE SYNC ---
    if (syncType === 'STUDIO_EXERCISE') {
      const { 
        id, code, title, titleTr, category, difficulty, 
        description, biomechanics, visualUrl, videoUrl, 
        isMotion, primaryMuscles, secondaryMuscles,
        visualStyle 
      } = payload;
      
      const finalId = getValidUUID(id);
      
      // SQL Şemasındaki media_assets JSONB yapısı
      const mediaAssets = {
        visual_url: visualUrl || null,
        video_url: videoUrl || null,
        is_motion: isMotion || false
      };

      // Array check
      const safePrimary = Array.isArray(primaryMuscles) ? primaryMuscles : [];
      const safeSecondary = Array.isArray(secondaryMuscles) ? secondaryMuscles : [];

      await sql`
        INSERT INTO exercises (
          id, code, title, title_tr, category, difficulty, 
          description, biomechanics_notes, media_assets, 
          is_motion, visual_style, primary_muscles, secondary_muscles
        )
        VALUES (
          ${finalId}, 
          ${code}, 
          ${title}, 
          ${titleTr || null}, 
          ${category}, 
          ${difficulty || 5}, 
          ${description}, 
          ${biomechanics || null}, -- Frontend 'biomechanics' sends to 'biomechanics_notes'
          ${JSON.stringify(mediaAssets)},
          ${isMotion || false},
          ${visualStyle || 'Flash-Ultra'},
          ${safePrimary},
          ${safeSecondary}
        )
        ON CONFLICT (code) DO UPDATE SET 
          title = EXCLUDED.title, 
          title_tr = EXCLUDED.title_tr,
          description = EXCLUDED.description, 
          difficulty = EXCLUDED.difficulty,
          biomechanics_notes = EXCLUDED.biomechanics_notes,
          media_assets = EXCLUDED.media_assets,
          is_motion = EXCLUDED.is_motion,
          visual_style = EXCLUDED.visual_style,
          updated_at = CURRENT_TIMESTAMP;
      `;
      return res.status(200).json({ success: true, exerciseId: finalId });
    }

    return res.status(400).json({ error: 'Geçersiz syncType' });

  } catch (error: any) {
    console.error("[SyncFatal]:", error);
    // Return detailed error for debugging (in production, hide this)
    return res.status(500).json({ 
      error: error.message, 
      code: error.code,
      detail: "Database Schema or Connection Error." 
    });
  }
}
