
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
  isArchived?: boolean;
  
  // v4.0 Visual & Motion Fields
  visualUrl?: string;
  videoUrl?: string;
  isMotion?: boolean;
  visualStyle?: 'X-Ray' | 'Anatomic' | '4K-Render' | 'Schematic' | 'GIF-Animation' | '2D-Animation' | 'Cinematic-Motion';
  shareCount?: number;
  
  // v3.4 Ultra-Customization Fields
  equipment?: string[];
  targetJoints?: string[];
  muscleGroups?: string[];
  rehabPhase?: 'Akut' | 'Sub-Akut' | 'Kronik' | 'Performans';
  movementPlane?: 'Sagittal' | 'Frontal' | 'Transverse';
}

export interface ProgressReport {
  date: string;
  painScore: number;
  completionRate: number;
  feedback: string;
  completedSets?: number;
  durationMinutes?: number;
}

export interface ClinicalInsight {
  summary: string;
  recommendation: string;
  adaptationNote: string;
  nextStep: string;
  phaseName?: 'Akut' | 'Sub-Akut' | 'Kronik' | 'Rehabilitasyon';
}

export interface PatientProfile {
  diagnosisSummary: string;
  thinkingProcess: string;
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  contraindications: string[];
  suggestedPlan: Exercise[];
  progressHistory: ProgressReport[];
  latestInsight?: ClinicalInsight;
  physicalAssessment?: {
    romLimitations: string[];
    muscleWeakness: string[];
    vasHistory: number[];
  };
}

export type AppTab = 'consultation' | 'dashboard' | 'cms' | 'progress';
