
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

/**
 * PHYSIOCORE UNIVERSAL DATA API v2.0 (Full Schema Mapping)
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
      const { table } = req.query;

      if (table === 'exercises') {
        const result = await sql`SELECT * FROM exercises ORDER BY created_at ASC`; // Seed sırasını koru
        
        const mapped = result.rows.map(row => ({
            id: row.id,
            code: row.code,
            title: row.title,
            titleTr: row.title_tr,
            category: row.category,
            difficulty: row.difficulty,
            description: row.description,
            // Mapping Logic: Schema vs Frontend Type
            visualUrl: row.media_assets?.visual_url,
            videoUrl: row.media_assets?.video_url,
            isMotion: row.media_assets?.is_motion,
            visualStyle: row.visual_style,
            
            safetyFlags: row.safety_flags || [],
            primaryMuscles: row.primary_muscles || [],
            secondaryMuscles: row.secondary_muscles || [],
            equipment: row.equipment || [],
            
            sets: row.default_sets,
            reps: row.default_reps,
            tempo: row.default_tempo,
            restPeriod: row.default_rest,
            
            // Extra fields stored in Biomechanics Notes or JSONB could be parsed here
            biomechanics: row.biomechanics_notes,
            rehabPhase: row.media_assets?.rehab_phase || 'Sub-Akut', // Fallback
            targetRpe: row.media_assets?.target_rpe || 5
        }));
        return res.status(200).json(mapped);
      }

      if (table === 'users') {
        const result = await sql`SELECT * FROM users`; 
        // Basitleştirilmiş mapping
        const mapped = result.rows.map(row => ({
            id: row.id,
            role: row.role,
            fullName: row.full_name,
            email: row.email
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
        // SQL şemasında olmayan alanları media_assets (JSONB) içine saklıyoruz
        // Böylece veri kaybı olmaz.
        const mediaAssets = {
            visual_url: data.visualUrl || null,
            video_url: data.videoUrl || null,
            is_motion: data.isMotion || false,
            rehab_phase: data.rehabPhase,
            target_rpe: data.targetRpe,
            movement_plane: data.movementPlane
        };

        // Array sanitization
        const safePrimary = Array.isArray(data.primaryMuscles) ? data.primaryMuscles : [];
        const safeSecondary = Array.isArray(data.secondaryMuscles) ? data.secondaryMuscles : [];
        const safeEquipment = Array.isArray(data.equipment) ? data.equipment : [];
        const safeSafetyFlags = Array.isArray(data.safetyFlags) ? data.safetyFlags : [];

        await sql`
            INSERT INTO exercises (
                id, code, title, title_tr, category, difficulty, description, 
                biomechanics_notes, media_assets, is_motion, visual_style,
                primary_muscles, secondary_muscles, equipment, safety_flags,
                default_sets, default_reps, default_tempo, default_rest
            ) VALUES (
                ${id}, ${data.code}, ${data.title}, ${data.titleTr || null}, ${data.category}, ${data.difficulty || 5}, ${data.description},
                ${data.biomechanics || ''}, ${JSON.stringify(mediaAssets)}::jsonb, ${data.isMotion || false}, ${data.visualStyle || 'Flash-Ultra'},
                ${safePrimary}::text[], ${safeSecondary}::text[], ${safeEquipment}::text[], ${safeSafetyFlags}::text[],
                ${data.sets || 3}, ${data.reps || 10}, ${data.tempo || '3-1-3'}, ${data.restPeriod || 60}
            )
            ON CONFLICT (code) DO UPDATE SET
                title = EXCLUDED.title,
                title_tr = EXCLUDED.title_tr,
                description = EXCLUDED.description,
                media_assets = EXCLUDED.media_assets,
                primary_muscles = EXCLUDED.primary_muscles,
                default_sets = EXCLUDED.default_sets,
                default_reps = EXCLUDED.default_reps,
                updated_at = CURRENT_TIMESTAMP;
        `;
        return res.status(200).json({ success: true });
      }

      if (table === 'users') {
         // User implementation...
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
