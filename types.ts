
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
  // Patient fields merged optionally for polymorphic usage
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
  score: number; // 0-10
  location: string;
  quality: PainQuality;
  triggers: string[];
  duration: string;
}

export interface PatientUser extends User {
  patientStatus: PatientStatus; // Made required for PatientUser
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
  visualLayout?: 'single' | 'sprite-2';
  isPersonalized?: boolean;
  tempo?: string;
  restPeriod?: number;
  muscleGroups?: string[];
  equipment?: string[];
  rehabPhase?: 'Akut' | 'Sub-Akut' | 'Kronik' | 'Performans';
  movementPlane?: string;
  tutorialData?: ExerciseTutorial; 
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
