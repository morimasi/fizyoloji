
import { RehabPhase, PatientProfile, Exercise, ProgressReport } from './types.ts';

/**
 * PHYSIOCORE DETERMINISTIC CLINICAL ENGINE v3.2
 * Blueprint Section 5: AI Logic & Safety Filters
 */
export const ClinicalRules = {
  
  // Dozaj Formülü: Reps = max(5, 15 - painScore)
  calculateDynamicReps: (painScore: number): number => {
    // Blueprint kuralı: Ağrı arttıkça tekrar azalır.
    const calculated = 15 - painScore;
    return Math.max(5, calculated);
  },

  // Red Flag Tespit
  detectRedFlags: (history: ProgressReport[]): string[] => {
    const flags: string[] = [];
    if (history.length >= 3) {
      const last3 = history.slice(-3);
      const isIncreasing = last3[0].painScore < last3[1].painScore && last3[1].painScore < last3[2].painScore;
      if (isIncreasing) {
        flags.push("KRİTİK UYARI: Ağrı trendi sürekli artışta. Lütfen fizyoterapistinize danışmadan devam etmeyin.");
      }
    }
    return flags;
  },

  // Blueprint Bölüm 5: Kontrendikasyon Kontrolü
  checkSafety: (profile: PatientProfile, exercise: Exercise): { safe: boolean; reason?: string } => {
    const diagnosis = (profile.diagnosisSummary || "").toLowerCase();
    const biomechanics = (exercise.biomechanics || "").toLowerCase();
    
    // KURAL: Disk Hernisi (Fıtık) varsa ve faz Akut ise Fleksiyon (Öne eğilme) yasak.
    const isHerniated = diagnosis.includes('herni') || diagnosis.includes('fıtık') || (profile.icd10?.includes('M51'));
    const isFlexion = biomechanics.includes('flexion') || biomechanics.includes('fleksiyon') || exercise.titleTr?.toLowerCase().includes('öne eğilme');

    if (isHerniated && isFlexion && profile.rehabPhase === 'Akut') {
      return { 
        safe: false, 
        reason: 'Blueprint Güvenlik Kuralı: Akut disk hernisi teşhisinde fleksiyon (öne eğilme) egzersizleri kontrendikedir.' 
      };
    }

    // KURAL: 7+ ağrıda sadece izometrik/statik.
    const lastPain = profile.progressHistory.length > 0 ? profile.progressHistory[profile.progressHistory.length - 1].painScore : 0;
    if (lastPain >= 7 && !biomechanics.includes('isometric') && !biomechanics.includes('statik')) {
      return { 
        safe: true, 
        reason: 'Yüksek ağrı seviyesi (VAS 7+). Hareketleri minimal açıda veya izometrik olarak gerçekleştirin.' 
      };
    }

    return { safe: true };
  }
};
