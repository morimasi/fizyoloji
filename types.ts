
export interface Exercise {
  id: string;
  code: string;
  title: string;
  category: string;
  difficulty: number;
  sets: number;
  reps: number;
  description: string;
  biomechanics: string;
  safetyFlags: string[];
  isFavorite?: boolean;
}

export interface ProgressReport {
  date: string;
  painScore: number;
  completionRate: number;
  feedback: string;
}

export interface ClinicalInsight {
  summary: string;
  recommendation: string;
  adaptationNote: string;
  nextStep: string;
}

export interface PatientProfile {
  diagnosisSummary: string;
  thinkingProcess: string;
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  contraindications: string[];
  suggestedPlan: Exercise[];
  progressHistory: ProgressReport[];
  latestInsight?: ClinicalInsight;
}

export type AppTab = 'consultation' | 'dashboard' | 'cms' | 'progress';
