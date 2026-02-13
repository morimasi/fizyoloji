
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * PhysioCore AI - Sync Engine v4.0 (Ultimate Relational Protocol)
 * Master Schema v6.0 ile tam uyumlu veri senkronizasyonu.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { syncType, payload } = req.body;

    if (!syncType || !payload) {
      return res.status(400).json({ error: 'Eksik veri yükü.' });
    }

    if (syncType === 'PROFILE_UPSERT') {
      const { id, fullName, email, role, phone, patientProfile, therapistProfile } = payload;

      // 1. Core User Upsert
      const userRes = await sql`
        INSERT INTO users (id, full_name, email, role, phone, password_hash)
        VALUES (${id || 'gen_random_uuid()'}, ${fullName}, ${email}, ${role}, ${phone}, 'external_auth')
        ON CONFLICT (email) 
        DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone
        RETURNING id;
      `;
      const userId = userRes.rows[0].id;

      // 2. Conditional Profile Upsert
      if (role === 'Patient' && patientProfile) {
        await sql`
          INSERT INTO patients (user_id, status, current_rehab_phase, risk_level, diagnosis_summary, assessment_data)
          VALUES (
            ${userId}, 
            ${patientProfile.status || 'Stabil'}, 
            ${patientProfile.rehabPhase || 'Akut'}, 
            ${patientProfile.riskLevel || 'Düşük'},
            ${patientProfile.diagnosisSummary},
            ${JSON.stringify(patientProfile.physicalAssessment || {})}
          )
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            status = EXCLUDED.status,
            risk_level = EXCLUDED.risk_level,
            diagnosis_summary = EXCLUDED.diagnosis_summary,
            assessment_data = EXCLUDED.assessment_data,
            updated_at = NOW();
        `;
      } else if (role === 'Therapist' && therapistProfile) {
        await sql`
          INSERT INTO therapist_profiles (user_id, specialization, years_of_experience, success_rate_percent, status)
          VALUES (
            ${userId}, 
            ${therapistProfile.specialization}, 
            ${therapistProfile.yearsOfExperience}, 
            ${therapistProfile.successRate},
            ${therapistProfile.status}
          )
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            specialization = EXCLUDED.specialization,
            success_rate_percent = EXCLUDED.success_rate_percent,
            status = EXCLUDED.status;
        `;
      }

      return res.status(200).json({ success: true, userId });
    }

    if (syncType === 'STUDIO_EXERCISE') {
      const { code, title, titleTr, category, difficulty, sets, reps, tempo, restPeriod, description, biomechanics, primaryMuscles, visualStyle, isMotion } = payload;

      await sql`
        INSERT INTO exercises (
          code, title, title_tr, category, difficulty_level, 
          default_sets, default_reps, default_tempo, default_rest_sec, 
          description, biomechanics_notes, primary_muscles, visual_style, is_motion
        )
        VALUES (
          ${code}, ${title}, ${titleTr}, ${category}, ${difficulty}, 
          ${sets}, ${reps}, ${tempo}, ${restPeriod}, 
          ${description}, ${biomechanics}, ${JSON.stringify(primaryMuscles || [])},
          ${visualStyle}, ${isMotion}
        )
        ON CONFLICT (code) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          title_tr = EXCLUDED.title_tr,
          description = EXCLUDED.description,
          default_sets = EXCLUDED.default_sets,
          default_reps = EXCLUDED.default_reps,
          updated_at = NOW();
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Geçersiz syncType' });

  } catch (error: any) {
    console.error("[SCHEMA_V6_SYNC_ERROR]:", error);
    return res.status(500).json({ error: error.message });
  }
}
