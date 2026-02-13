
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * PhysioCore AI - Sync Engine v3.9 (Relational Protocol)
 * Bu servis, Users ve Patients/Therapists tabloları arasındaki ilişkiyi yönetir.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { syncType, payload } = req.body;

    if (!syncType || !payload) {
      return res.status(400).json({ error: 'Eksik veri.' });
    }

    if (syncType === 'PROFILE') {
      // İlişkisel Kayıt: Önce USER, sonra PATIENT profili
      // Not: Şifre yönetimi gerçek auth servisinde yapılmalıdır.
      
      const { email, fullName, role, clinicalProfile, progressHistory } = payload;

      // 1. User kaydı (Upsert)
      const userResult = await sql`
        INSERT INTO users (full_name, email, role, password_hash)
        VALUES (${fullName}, ${email}, ${role || 'Patient'}, 'managed_externally')
        ON CONFLICT (email) 
        DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id;
      `;
      
      const userId = userResult.rows[0].id;

      // 2. Patient Profile kaydı (Upsert)
      await sql`
        INSERT INTO patients (user_id, diagnosis_summary, assessment_data, updated_at)
        VALUES (
          ${userId}, 
          ${clinicalProfile?.diagnosis || ''}, 
          ${JSON.stringify(clinicalProfile || {})}, 
          NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          diagnosis_summary = EXCLUDED.diagnosis_summary,
          assessment_data = EXCLUDED.assessment_data,
          updated_at = NOW();
      `;

      return res.status(200).json({ success: true, userId });
    }

    if (syncType === 'STUDIO_UPDATE') {
      const { id, code, title, titleTr, category, difficulty, sets, reps, description, biomechanics, safetyFlags, deletedId } = payload;

      if (deletedId) {
        await sql`DELETE FROM exercises WHERE id = ${deletedId}`;
      } else {
        await sql`
          INSERT INTO exercises (code, title, title_tr, category, difficulty_level, default_sets, default_reps, description, biomechanics_notes, primary_muscles)
          VALUES (
            ${code}, ${title}, ${titleTr}, ${category}, ${difficulty}, ${sets}, ${reps}, ${description}, ${biomechanics}, ${JSON.stringify(safetyFlags || [])}
          )
          ON CONFLICT (code) 
          DO UPDATE SET 
            title = EXCLUDED.title,
            title_tr = EXCLUDED.title_tr,
            description = EXCLUDED.description,
            updated_at = NOW();
        `;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Geçersiz syncType' });

  } catch (error: any) {
    console.error("[POSTGRES_SYNC_ERROR]:", error);
    return res.status(500).json({ error: error.message });
  }
}
