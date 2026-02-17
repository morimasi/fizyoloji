import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

/**
 * PHYSIOCORE SYNC ENGINE v10.2 (Strict Type Casting & Error Visibility)
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

    // Helper: Validate UUID or Generate New One
    const getValidUUID = (id: any) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return (typeof id === 'string' && uuidRegex.test(id)) ? id : crypto.randomUUID();
    };

    // Helper: Safely serialize Array for Postgres (handles empty arrays)
    // Note: We use explicit casting in the SQL query itself (::text[]) so we pass the array directly.
    // If the array is empty, we pass an empty array [], but the cast in SQL is critical.
    
    // --- PROFILE UPSERT ---
    if (syncType === 'PROFILE_UPSERT') {
      const { id, fullName, email, role, phone, patientProfile } = payload;
      const finalId = getValidUUID(id);
      
      // 1. Users Table Upsert
      await sql`
        INSERT INTO users (id, full_name, email, role, phone)
        VALUES (${finalId}::uuid, ${fullName}, ${email}, ${role}::user_role, ${phone || null})
        ON CONFLICT (email) DO UPDATE SET 
          full_name = EXCLUDED.full_name, 
          phone = EXCLUDED.phone, 
          updated_at = CURRENT_TIMESTAMP;
      `;

      // 2. Patients Table Upsert (If applicable)
      if (role === 'Patient' && patientProfile) {
        const userCheck = await sql`SELECT id FROM users WHERE email = ${email}`;
        const userId = userCheck.rows[0]?.id || finalId;

        await sql`
          INSERT INTO patients (
            user_id, status, current_rehab_phase, risk_level, 
            diagnosis_summary, physical_assessment, updated_at
          )
          VALUES (
            ${userId}::uuid, 
            ${patientProfile.status || 'Stabil'}::patient_status, 
            ${patientProfile.rehabPhase || 'Akut'}::rehab_phase, 
            ${patientProfile.riskLevel || 'Düşük'}, 
            ${patientProfile.diagnosisSummary || null}, 
            ${JSON.stringify(patientProfile.physicalAssessment || {})}::jsonb,
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
      
      // Ensure IDs are valid UUIDs or null. Empty strings cause UUID syntax error.
      const validTherapistId = getValidUUID(therapistId); 
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validPatientId = (patientId && uuidRegex.test(patientId)) ? patientId : null;

      // Note: Foreign Key constraints might fail if the user is not synced yet.
      // We use a try-catch specific to this query to report specific FK errors.
      try {
        await sql`
          INSERT INTO clinical_tasks (id, title, priority, status, ai_recommendation, therapist_id, patient_id)
          VALUES (
            ${finalId}::uuid, 
            ${title}, 
            ${priority}::task_priority, 
            ${status || 'Pending'}, 
            ${aiRecommendation || null}, 
            ${validTherapistId}::uuid, 
            ${validPatientId}::uuid
          )
          ON CONFLICT (id) DO UPDATE SET 
            status = EXCLUDED.status, 
            priority = EXCLUDED.priority,
            ai_recommendation = EXCLUDED.ai_recommendation,
            updated_at = CURRENT_TIMESTAMP;
        `;
      } catch (innerErr: any) {
        if (innerErr.code === '23503') { // ForeignKeyViolation
           console.warn("Task skipped due to missing FK:", innerErr.message);
           return res.status(200).json({ success: false, skipped: true, reason: "Related User Not Found" });
        }
        throw innerErr;
      }
      return res.status(200).json({ success: true });
    }

    // --- STUDIO EXERCISE SYNC ---
    if (syncType === 'STUDIO_EXERCISE') {
      const { 
        id, code, title, titleTr, category, difficulty, 
        description, biomechanics, visualUrl, videoUrl, 
        isMotion, primaryMuscles, secondaryMuscles,
        visualStyle, equipment, safetyFlags
      } = payload;
      
      const finalId = getValidUUID(id);
      
      const mediaAssets = {
        visual_url: visualUrl || null,
        video_url: videoUrl || null,
        is_motion: isMotion || false
      };

      // Array sanitization
      const safePrimary = Array.isArray(primaryMuscles) ? primaryMuscles : [];
      const safeSecondary = Array.isArray(secondaryMuscles) ? secondaryMuscles : [];
      const safeEquipment = Array.isArray(equipment) ? equipment : [];
      const safeSafetyFlags = Array.isArray(safetyFlags) ? safetyFlags : [];

      await sql`
        INSERT INTO exercises (
          id, code, title, title_tr, category, difficulty, 
          description, biomechanics_notes, media_assets, 
          is_motion, visual_style, 
          primary_muscles, secondary_muscles, equipment, safety_flags
        )
        VALUES (
          ${finalId}::uuid, 
          ${code || 'TEMP-' + Date.now()}, 
          ${title}, 
          ${titleTr || null}, 
          ${category || 'General'}, 
          ${difficulty || 5}, 
          ${description || ''}, 
          ${biomechanics || null},
          ${JSON.stringify(mediaAssets)}::jsonb,
          ${isMotion || false},
          ${visualStyle || 'Flash-Ultra'},
          ${safePrimary as any}::text[],
          ${safeSecondary as any}::text[],
          ${safeEquipment as any}::text[],
          ${safeSafetyFlags as any}::text[]
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
          primary_muscles = EXCLUDED.primary_muscles,
          secondary_muscles = EXCLUDED.secondary_muscles,
          equipment = EXCLUDED.equipment,
          safety_flags = EXCLUDED.safety_flags,
          updated_at = CURRENT_TIMESTAMP;
      `;
      return res.status(200).json({ success: true, exerciseId: finalId });
    }

    return res.status(400).json({ error: 'Geçersiz syncType' });

  } catch (error: any) {
    console.error("[SyncFatal]:", error);
    // Explicitly returning 500 with the error message so the frontend can log it
    return res.status(500).json({ 
      error: error.message, 
      code: error.code || 'UNKNOWN',
      detail: "Database execution failed. Check Vercel logs." 
    });
  }
}