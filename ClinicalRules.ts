
import { RehabPhase, PatientProfile, Exercise, ProgressReport } from './types.ts';

/**
 * PHYSIOCORE DETERMINISTIC CLINICAL ENGINE
 * AI'nın muhakemesini kısıtlayan ve güvenliği sağlayan sert kurallar.
 */
export const ClinicalRules = {
  // Faz bazlı yüklenme limitleri
  PHASE_CONSTRAINTS: {
    'Akut': { maxRpe: 4, forbiddenPlanes: ['Combined/Rotational'], intensity: 0.3 },
    'Sub-Akut': { maxRpe: 6, forbiddenPlanes: [], intensity: 0.6 },
    'Kronik': { maxRpe: 8, forbiddenPlanes: [], intensity: 0.8 },
    'Performans': { maxRpe: 10, forbiddenPlanes: [], intensity: 1.0 }
  },

  // Dozaj Formülü: max(5, 15 - painScore)
  calculateDynamicReps: (painScore: number, baseReps: number = 10): number => {
    if (painScore >= 8) return 5; // Kritik ağrıda minimum yüklenme
    return Math.max(5, 15 - painScore);
  },

  // Red Flag Tespit: Son 3 seanstır ağrı sürekli artıyorsa uyarı ver
  detectRedFlags: (history: ProgressReport[]): string[] => {
    const flags: string[] = [];
    if (history.length >= 3) {
      const last3 = history.slice(-3);
      const isIncreasing = last3[0].painScore < last3[1].painScore && last3[1].painScore < last3[2].painScore;
      if (isIncreasing) {
        flags.push("KRİTİK AĞRI TRENDİ: Son 3 seanstır ağrı seviyesi (VAS) sürekli artış gösteriyor. Klinik revizyon gereklidir.");
      }
    }
    return flags;
  },

  // Kontrendikasyon Kontrolü
  checkSafety: (profile: PatientProfile, exercise: Exercise): { safe: boolean; reason?: string } => {
    const diagnosis = profile.diagnosisSummary.toLowerCase();
    
    // Disk Hernisi (Fıtık) Spesifik Kuralı: Akut fazda derin fleksiyon yasak
    if (diagnosis.includes('herni') || diagnosis.includes('fıtık')) {
      if (exercise.biomechanics.toLowerCase().includes('flexion') && profile.rehabPhase === 'Akut') {
        return { safe: false, reason: 'Akut disk hernisi durumunda derin fleksiyon kontrendikedir.' };
      }
    }

    // Yüksek Ağrı Kuralı: 7+ ağrıda dinamik egzersiz yerine izometrik önerilir
    if (profile.progressHistory.length > 0) {
      const lastPain = profile.progressHistory[profile.progressHistory.length - 1].painScore;
      if (lastPain >= 7 && !exercise.biomechanics.toLowerCase().includes('isometric')) {
        return { safe: true, reason: 'Yüksek ağrı seviyesi saptandı. Hareketleri yavaş ve kontrollü yapın.' };
      }
    }

    return { safe: true };
  }
};
