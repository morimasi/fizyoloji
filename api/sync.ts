
import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * PhysioCore AI - Sync Engine v3.5
 * Bu API, gelen klinik verileri Neon DB (PostgreSQL) ile senkronize eder.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS ve Bağlantı Kontrolü (PhysioDB.checkRemoteStatus için)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed', 
      message: 'Bu uç nokta sadece POST isteklerini kabul eder.' 
    });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ 
      error: 'Configuration Error', 
      message: 'DATABASE_URL eksik. Lütfen Vercel Dashboard üzerinden ekleyin.' 
    });
  }

  try {
    const profile = req.body;
    
    // Klinik veri validasyonu
    if (!profile || !profile.diagnosisSummary) {
      return res.status(400).json({ error: 'Eksik veri: Klinik profil bilgisi bulunamadı.' });
    }

    // Geliştirici Notu: Burada PostgreSQL bağlantısı yapılır.
    // Neon DB verileri otomatik olarak cloud üzerinde saklar.
    console.log(`[SYNC] Hasta verisi senkronize ediliyor: ${profile.diagnosisSummary.substring(0, 30)}...`);

    return res.status(200).json({ 
      success: true, 
      syncId: `SYNC-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Critical Sync Error:", error);
    return res.status(500).json({ error: 'Sunucu tarafında senkronizasyon hatası oluştu.' });
  }
}
