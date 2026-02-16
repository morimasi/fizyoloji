
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * PHYSIOCORE SYNC ENGINE v9.3 (Cloud Orchestrator)
 * Handles Role-based Profiles, Exercises, and Clinical Tasks.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { syncType, payload } = req.body;
    if (!syncType || !payload) return res.status(400).json({ error: 'Eksik veri yükü.' });

    console.log(`[SyncServer] Executing: ${syncType}`);

    // --- PROFILE UPSERT ---
    if (syncType === 'PROFILE_UPSERT') {
      const { id, fullName, email, role, phone, patientProfile, therapistProfile } = payload;
      const userRes = await sql`
        INSERT INTO users (id, full_name, email, role, phone)
        VALUES (${id || 'gen_random_uuid()'}, ${fullName}, ${email}, ${role}, ${phone})
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;
      const userId = userRes.rows[0].id;

      if (role === 'Patient' && patientProfile) {
        await sql`
          INSERT INTO patients (user_id, status, current_rehab_phase, risk_level, diagnosis_summary, physical_assessment)
          VALUES (${userId}, ${patientProfile.status || 'Stabil'}, ${patientProfile.rehabPhase || 'Akut'}, ${patientProfile.riskLevel || 'Düşük'}, ${patientProfile.diagnosisSummary}, ${JSON.stringify(patientProfile.physicalAssessment || {})})
          ON CONFLICT (user_id) DO UPDATE SET status = EXCLUDED.status, risk_level = EXCLUDED.risk_level, updated_at = CURRENT_TIMESTAMP;
        `;
      }
      return res.status(200).json({ success: true, userId });
    }

    // --- CLINICAL TASK SYNC ---
    if (syncType === 'TASK_SYNC') {
      const { id, title, priority, status, aiRecommendation, therapistId, patientId } = payload;
      await sql`
        INSERT INTO clinical_tasks (id, title, priority, status, ai_recommendation, therapist_id, patient_id)
        VALUES (
          ${id}, 
          ${title}, 
          ${priority}, 
          ${status || 'Pending'}, 
          ${aiRecommendation || null}, 
          ${therapistId || '00000000-0000-0000-0000-000000000000'}, 
          ${patientId || null}
        )
        ON CONFLICT (id) DO UPDATE SET 
          status = EXCLUDED.status, 
          priority = EXCLUDED.priority,
          ai_recommendation = EXCLUDED.ai_recommendation;
      `;
      return res.status(200).json({ success: true });
    }

    // --- STUDIO EXERCISE SYNC ---
    if (syncType === 'STUDIO_EXERCISE') {
      const { code, title, titleTr, category, difficulty, description, biomechanics, isMotion } = payload;
      await sql`
        INSERT INTO exercises (code, title, title_tr, category, difficulty_level, description, biomechanics_notes)
        VALUES (${code}, ${title}, ${titleTr}, ${category}, ${difficulty}, ${description}, ${biomechanics})
        ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Geçersiz syncType' });

  } catch (error: any) {
    console.error("[SyncFatal]:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
