
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * PHYSIOCORE SYNC ENGINE v9.2 (Global Orchestrator)
 * Handles Profiles, Exercises, Pain Logs, and AI Tasks with enhanced error handling.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS and Method Handling
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { syncType, payload } = req.body;

    if (!syncType || !payload) {
      console.error("[V9.2_SYNC_WARNING]: Incomplete payload received.");
      return res.status(400).json({ error: 'Eksik veya hatalı veri yükü.' });
    }

    console.log(`[SyncEngine] Processing: ${syncType}`);

    // --- PROFILE UPSERT (USERS + PATIENTS/THERAPISTS) ---
    if (syncType === 'PROFILE_UPSERT') {
      const { id, fullName, email, role, phone, patientProfile, therapistProfile } = payload;

      const userRes = await sql`
        INSERT INTO users (id, full_name, email, role, phone)
        VALUES (${id || 'gen_random_uuid()'}, ${fullName}, ${email}, ${role}, ${phone})
        ON CONFLICT (email) 
        DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;
      const userId = userRes.rows[0].id;

      if (role === 'Patient' && patientProfile) {
        await sql`
          INSERT INTO patients (user_id, status, current_rehab_phase, risk_level, diagnosis_summary, privacy_config, physical_assessment)
          VALUES (
            ${userId}, 
            ${patientProfile.status || 'Stabil'}, 
            ${patientProfile.rehabPhase || 'Akut'}, 
            ${patientProfile.riskLevel || 'Düşük'},
            ${patientProfile.diagnosisSummary},
            ${JSON.stringify(patientProfile.privacyConfig || {})},
            ${JSON.stringify(patientProfile.physicalAssessment || {})}
          )
          ON CONFLICT (user_id) DO UPDATE SET 
            status = EXCLUDED.status, 
            risk_level = EXCLUDED.risk_level, 
            privacy_config = EXCLUDED.privacy_config,
            updated_at = CURRENT_TIMESTAMP;
        `;
      } else if (role === 'Therapist' && therapistProfile) {
        await sql`
          INSERT INTO therapist_profiles (user_id, specialization, years_of_experience, ai_assistant_config)
          VALUES (${userId}, ${therapistProfile.specialization}, ${therapistProfile.yearsOfExperience}, ${JSON.stringify(therapistProfile.aiAssistantSettings)})
          ON CONFLICT (user_id) DO UPDATE SET 
            ai_assistant_config = EXCLUDED.ai_assistant_config;
        `;
      }
      return res.status(200).json({ success: true, userId, timestamp: new Date().toISOString() });
    }

    // --- CLINICAL DATA SYNC (PAIN LOGS / PROGRESS) ---
    if (syncType === 'PAIN_LOG_SYNC') {
      const { patientId, score, locationTag, triggerFactors } = payload;
      await sql`
        INSERT INTO pain_logs (patient_id, score, location_tag, trigger_factors, logged_at)
        VALUES (${patientId}, ${score}, ${locationTag}, ${triggerFactors}, CURRENT_TIMESTAMP);
      `;
      return res.status(200).json({ success: true });
    }

    // --- TASK SYNC (AI GENERATED TASKS) ---
    if (syncType === 'TASK_SYNC') {
      const { therapistId, patientId, title, priority, aiRecommendation } = payload;
      await sql`
        INSERT INTO clinical_tasks (therapist_id, patient_id, title, priority, ai_recommendation)
        VALUES (${therapistId}, ${patientId}, ${title}, ${priority}, ${aiRecommendation});
      `;
      return res.status(200).json({ success: true });
    }

    // --- CMS EXERCISE SYNC ---
    if (syncType === 'STUDIO_EXERCISE') {
      const { code, title, titleTr, category, difficulty, description, biomechanics, isMotion } = payload;
      await sql`
        INSERT INTO exercises (code, title, title_tr, category, difficulty_level, description, biomechanics_notes, is_motion)
        VALUES (${code}, ${title}, ${titleTr}, ${category}, ${difficulty}, ${description}, ${biomechanics}, ${isMotion})
        ON CONFLICT (code) DO UPDATE SET 
          title = EXCLUDED.title, 
          title_tr = EXCLUDED.title_tr,
          description = EXCLUDED.description,
          biomechanics_notes = EXCLUDED.biomechanics_notes;
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Geçersiz syncType' });

  } catch (error: any) {
    console.error("[V9.2_SYNC_FATAL_ERROR]:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Kritik veritabanı senkronizasyon hatası.', 
      details: error.message,
      code: error.code 
    });
  }
}
