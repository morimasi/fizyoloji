
import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * PhysioCore AI - Sync Engine v3.8 (Enterprise Production)
 * Bu servis, klinik verileri atomik olarak Vercel Postgres'e işler.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS ve Method Kontrolü
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { syncType, payload, timestamp } = req.body;

    if (!syncType || !payload) {
      return res.status(400).json({ error: 'Eksik senkronizasyon verisi.' });
    }

    let result;

    switch (syncType) {
      case 'PROFILE':
        // Hasta profilini ve ilerleme geçmişini güncelle (Upsert mantığı)
        // Not: Gerçek uygulamada patient_id auth session'dan alınmalıdır.
        result = await sql`
          INSERT INTO patients (email, full_name, clinical_profile, progress_history, updated_at)
          VALUES (
            ${payload.email || 'anonymous@physiocore.ai'}, 
            ${payload.fullName || 'Anonim Hasta'}, 
            ${JSON.stringify(payload.clinicalProfile || {})}, 
            ${JSON.stringify(payload.progressHistory || [])},
            NOW()
          )
          ON CONFLICT (email) 
          DO UPDATE SET 
            clinical_profile = EXCLUDED.clinical_profile,
            progress_history = EXCLUDED.progress_history,
            updated_at = NOW()
          RETURNING id;
        `;
        break;

      case 'STUDIO_UPDATE':
        // Egzersiz kütüphanesini güncelle
        if (payload.deletedId) {
          result = await sql`DELETE FROM exercises WHERE id = ${payload.deletedId}`;
        } else {
          result = await sql`
            INSERT INTO exercises (code, title, title_tr, category, difficulty, sets, reps, description, biomechanics, safety_flags, rehab_phase)
            VALUES (
              ${payload.code}, 
              ${payload.title}, 
              ${payload.titleTr}, 
              ${payload.category}, 
              ${payload.difficulty}, 
              ${payload.sets}, 
              ${payload.reps}, 
              ${payload.description}, 
              ${payload.biomechanics}, 
              ${JSON.stringify(payload.safetyFlags)}, 
              ${payload.rehabPhase}
            )
            ON CONFLICT (code) 
            DO UPDATE SET 
              title = EXCLUDED.title,
              title_tr = EXCLUDED.title_tr,
              category = EXCLUDED.category,
              difficulty = EXCLUDED.difficulty,
              description = EXCLUDED.description,
              biomechanics = EXCLUDED.biomechanics,
              safety_flags = EXCLUDED.safety_flags;
          `;
        }
        break;

      default:
        throw new Error("Geçersiz syncType");
    }

    return res.status(200).json({ 
      success: true, 
      syncId: `DB-${Date.now()}`,
      processedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("[POSTGRES_ERROR]:", error);
    return res.status(500).json({ 
      error: 'Veritabanı senkronizasyon hatası.', 
      details: error.message 
    });
  }
}
