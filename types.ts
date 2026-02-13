
export type UserRole = 'Admin' | 'Therapist' | 'Patient';
export type PatientStatus = 'Kritik' | 'Stabil' | 'İyileşiyor' | 'Taburcu';
export type StaffStatus = 'Aktif' | 'İzinde' | 'Pasif';
export type PainQuality = 'Keskin' | 'Künt' | 'Yanıcı' | 'Batıcı' | 'Elektriklenme';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachmentUrl?: string;
}

export interface TherapistProfile {
  specialization: string[];
  bio: string;
  yearsOfExperience: number;
  successRate: number;
  totalPatientsActive: number;
  averageRecoveryTime: string;
  status: StaffStatus;
  department?: string;
  phone?: string;
  aiAssistantSettings: {
    autoSuggestProtocols: boolean;
    notifyHighRisk: boolean;
    weeklyReports: boolean;
  };
}

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  assignedTherapistId?: string;
  therapistProfile?: TherapistProfile;
  patientStatus?: PatientStatus;
  clinicalProfile?: {
    diagnosis: string;
    riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
    notes: ClinicalNote[];
    treatmentHistory: TreatmentHistory[];
    painLogs: DetailedPainLog[];
  };
}

export interface ClinicalNote {
  id: string;
  authorId: string;
  text: string;
  date: string;
  type: 'Observation' | 'Adjustment' | 'Warning';
}

export interface TreatmentHistory {
  id: string;
  date: string;
  facility: string;
  summary: string;
  outcome: string;
  therapistName: string;
}

export interface DetailedPainLog {
  id: string;
  date: string;
  score: number;
  location: string;
  quality: PainQuality;
  triggers: string[];
  duration: string;
  note?: string;
}

export interface PatientUser extends User {
  patientStatus: PatientStatus;
  lastVisit: string;
  recoveryProgress: number;
  riskScore: number; 
  clinicalProfile: {
    diagnosis: string;
    riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
    notes: ClinicalNote[];
    treatmentHistory: TreatmentHistory[];
    painLogs: DetailedPainLog[];
  };
}

export interface ExerciseTutorial {
  script: {
    step: number;
    text: string;
    duration: number;
    animation: 'breathe' | 'hold' | 'contract';
  }[];
  audioBase64: string | null;
  bpm: number;
}

export interface Exercise {
  id: string;
  code: string;
  title: string;
  titleTr?: string;
  // Enhanced Clinical Data
  icdCode?: string; // e.g., M51.1
  category: string;
  rehabPhase?: 'Akut' | 'Sub-Akut' | 'Kronik' | 'Performans';
  difficulty: number;
  description: string;
  biomechanics: string;
  safetyFlags: string[];
  // Enhanced Anatomy
  primaryMuscles?: string[]; // Agonists
  secondaryMuscles?: string[]; // Synergists/Stabilizers
  equipment?: string[];
  movementPlane?: string;
  // Enhanced Dosage
  sets: number;
  reps: number;
  tempo?: string; // 3-1-3
  restPeriod?: number; // seconds
  targetRpe?: number; // 1-10 Borg Scale
  estimatedTut?: number; // Time Under Tension (seconds)
  frequency?: string; // e.g., "2x/Day"
  // Media & Meta
  isFavorite?: boolean;
  isArchived?: boolean;
  visualUrl?: string;
  videoUrl?: string;
  isMotion?: boolean;
  visualStyle?: string;
  visualLayout?: string; // Legacy: 'sprite-2' etc.
  visualFrameCount?: number; // Dinamik kare sayısı (Default: 6)
  isPersonalized?: boolean;
  tutorialData?: ExerciseTutorial; 
  muscleGroups?: string[]; // Legacy support
}

export interface ProgressReport {
  date: string;
  painScore: number;
  completionRate: number;
  feedback: string;
  painLocation?: string;
  painQuality?: PainQuality;
}

export interface PatientProfile {
  diagnosisSummary: string;
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
  suggestedPlan: Exercise[];
  progressHistory: ProgressReport[];
  treatmentHistory?: TreatmentHistory[];
  painLogs?: DetailedPainLog[];
  latestInsight?: {
    summary?: string;
    adaptationNote?: string;
    nextStep?: string;
    phaseName?: string;
    recommendation?: string;
    painTrendAnalysis?: string;
  };
}

export type AppTab = 'consultation' | 'dashboard' | 'cms' | 'progress' | 'users';
export type TherapistTab = 'dashboard' | 'patients' | 'intelligence' | 'settings';
