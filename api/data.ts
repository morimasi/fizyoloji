
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

/**
 * PHYSIOCORE UNIVERSAL DATA API v1.0
 * Handles direct CRUD operations for the Cloud-Only architecture.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Config
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // --- GET (READ) ---
    if (req.method === 'GET') {
      const { table, id } = req.query;

      if (table === 'exercises') {
        const result = await sql`SELECT * FROM exercises ORDER BY created_at DESC`;
        // Veritabanı sütunlarını frontend tipine (camelCase) map'leme işlemi gerekebilir
        // Ancak şimdilik snake_case -> camelCase dönüşümünü basit tutuyoruz.
        const mapped = result.rows.map(row => ({
            ...row,
            visualUrl: row.media_assets?.visual_url,
            videoUrl: row.media_assets?.video_url,
            isMotion: row.media_assets?.is_motion,
            safetyFlags: row.safety_flags || [],
            primaryMuscles: row.primary_muscles || [],
            secondaryMuscles: row.secondary_muscles || [],
            equipment: row.equipment || [],
            titleTr: row.title_tr,
            restPeriod: row.default_rest,
            sets: row.default_sets,
            reps: row.default_reps,
            tempo: row.default_tempo,
            biomechanics: row.biomechanics_notes
        }));
        return res.status(200).json(mapped);
      }

      if (table === 'users') {
        const result = await sql`
            SELECT u.*, tp.specialization, tp.bio, tp.years_of_experience, tp.total_patients_active,
                   p.status as patient_status, p.risk_level, p.diagnosis_summary, p.physical_assessment
            FROM users u
            LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
            LEFT JOIN patients p ON u.id = p.user_id
        `;
        
        const mapped = result.rows.map(row => ({
            id: row.id,
            role: row.role,
            fullName: row.full_name,
            email: row.email,
            phone: row.phone,
            createdAt: row.created_at,
            therapistProfile: row.role === 'Therapist' ? {
                specialization: row.specialization || [],
                bio: row.bio,
                yearsOfExperience: row.years_of_experience,
                totalPatientsActive: row.total_patients_active
            } : undefined,
            patientProfile: row.role === 'Patient' ? {
                user_id: row.id,
                status: row.patient_status,
                riskLevel: row.risk_level,
                diagnosisSummary: row.diagnosis_summary,
                physicalAssessment: row.physical_assessment
            } : undefined
        }));
        return res.status(200).json(mapped);
      }

      if (table === 'tasks') {
        const result = await sql`SELECT * FROM clinical_tasks ORDER BY created_at DESC`;
        const mapped = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            priority: row.priority,
            status: row.status,
            aiRecommendation: row.ai_recommendation
        }));
        return res.status(200).json(mapped);
      }

      return res.status(400).json({ error: 'Invalid table' });
    }

    // --- POST (CREATE / UPDATE) ---
    if (req.method === 'POST') {
      const { table, data } = req.body;
      const id = data.id || crypto.randomUUID();

      if (table === 'exercises') {
        const mediaAssets = {
            visual_url: data.visualUrl || null,
            video_url: data.videoUrl || null,
            is_motion: data.isMotion || false
        };

        await sql`
            INSERT INTO exercises (
                id, code, title, title_tr, category, difficulty, description, 
                biomechanics_notes, media_assets, is_motion, visual_style,
                primary_muscles, secondary_muscles, equipment, safety_flags,
                default_sets, default_reps, default_tempo, default_rest
            ) VALUES (
                ${id}, ${data.code}, ${data.title}, ${data.titleTr}, ${data.category}, ${data.difficulty}, ${data.description},
                ${data.biomechanics}, ${JSON.stringify(mediaAssets)}::jsonb, ${data.isMotion || false}, ${data.visualStyle},
                ${data.primaryMuscles}::text[], ${data.secondaryMuscles}::text[], ${data.equipment}::text[], ${data.safetyFlags}::text[],
                ${data.sets}, ${data.reps}, ${data.tempo}, ${data.restPeriod}
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                title_tr = EXCLUDED.title_tr,
                description = EXCLUDED.description,
                media_assets = EXCLUDED.media_assets,
                primary_muscles = EXCLUDED.primary_muscles,
                updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ success: true });
      }

      if (table === 'users') {
         await sql`
            INSERT INTO users (id, full_name, email, role, phone)
            VALUES (${id}, ${data.fullName}, ${data.email}, ${data.role}::user_role, ${data.phone})
            ON CONFLICT (id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone;
         `;
         // Note: Profile updates (patient/therapist tables) omitted for brevity in this single-file demo, 
         // but ideally should be handled here transactionally.
         return res.status(200).json({ success: true });
      }
      
      if (table === 'tasks') {
          await sql`
            INSERT INTO clinical_tasks (id, title, priority, status, ai_recommendation, therapist_id)
            VALUES (${id}, ${data.title}, ${data.priority}::task_priority, ${data.status}, ${data.aiRecommendation}, ${data.assignedTo || null})
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP;
          `;
          return res.status(200).json({ success: true });
      }
    }

    // --- DELETE ---
    if (req.method === 'DELETE') {
        const { table, id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID required' });

        if (table === 'exercises') await sql`DELETE FROM exercises WHERE id=${id as string}`;
        if (table === 'users') await sql`DELETE FROM users WHERE id=${id as string}`;
        if (table === 'tasks') await sql`DELETE FROM clinical_tasks WHERE id=${id as string}`;

        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error("[API Error]", error);
    return res.status(500).json({ error: error.message });
  }
}
