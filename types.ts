
export type UserRole = 'Admin' | 'Therapist' | 'Patient';
export type PatientStatus = 'Kritik' | 'Stabil' | 'İyileşiyor' | 'Taburcu';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentUrl?: string;
}

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  assignedTherapistId?: string; // Terapist ise bu boştur
}

export interface ClinicalNote {
  id: string;
  authorId: string; // Terapist ID
  text: string;
  date: string;
  type: 'Observation' | 'Adjustment' | 'Warning';
}

export interface PatientUser extends User {
  status: PatientStatus;
  lastVisit: string;
  recoveryProgress: number; // 0-100
  clinicalProfile: {
    diagnosis: string;
    riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
    notes: ClinicalNote[];
  };
}

// Mevcut exportlar devam ediyor...
export interface Exercise {
  id: string;
  code: string;
  title: string;
  titleTr?: string;
  category: string;
  difficulty: number;
  sets: number;
  reps: number;
  description: string;
  biomechanics: string;
  safetyFlags: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  visualUrl?: string;
  videoUrl?: string;
  isMotion?: boolean;
  visualStyle?: string;
  isPersonalized?: boolean;
  tempo?: string;
  restPeriod?: number;
  // Eksik klinik özellikler eklendi
  muscleGroups?: string[];
  equipment?: string[];
  rehabPhase?: 'Akut' | 'Sub-Akut' | 'Kronik' | 'Performans';
  movementPlane?: string;
}

export interface ProgressReport {
  date: string;
  painScore: number;
  completionRate: number;
  feedback: string;
}

export interface PatientProfile {
  diagnosisSummary: string;
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  suggestedPlan: Exercise[];
  progressHistory: ProgressReport[];
  // AI analiz verileri için eksik özellik eklendi
  latestInsight?: {
    summary?: string;
    adaptationNote?: string;
    nextStep?: string;
    phaseName?: string;
    recommendation?: string;
  };
}

export type AppTab = 'consultation' | 'dashboard' | 'cms' | 'progress' | 'users';
