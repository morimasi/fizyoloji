
export type UserRole = 'Admin' | 'Therapist' | 'Patient';
export type PatientStatus = 'Kritik' | 'Stabil' | 'İyileşiyor' | 'Taburcu';
export type StaffStatus = 'Aktif' | 'İzinde' | 'Pasif';
export type RiskLevel = 'Düşük' | 'Orta' | 'Yüksek';
export type PainQuality = 'Keskin' | 'Künt' | 'Yanıcı' | 'Batıcı' | 'Elektriklenme' | 'Sızlama';
export type RehabPhase = 'Akut' | 'Sub-Akut' | 'Kronik' | 'Performans';
export type VisualStyle = 'AVM-Genesis' | 'VEO-Premium' | 'AVM-Sprite' | 'Cinematic-Grid' | 'X-Ray' | 'Schematic' | '4K-Render' | 'Cinematic-Motion';
export type AppTab = 'consultation' | 'dashboard' | 'progress' | 'users' | 'cms' | 'management';
export type TherapistTab = 'dashboard' | 'patients' | 'intelligence' | 'settings';

export interface SyncMetadata {
  lastSyncedAt?: string;
  isDirty: boolean;
  version: number;
}

export interface ExerciseTutorial {
  script: { text: string; duration: number; type?: 'instruction' | 'motivation' | 'warning' }[];
  audioBase64: string | null;
  bpm: number;
}

/* Exercise interface updated with favorite, archived and sync status fields */
export interface Exercise {
  id: string;
  code: string;
  title: string;
  titleTr?: string;
  icdCode?: string;
  category: string;
  rehabPhase: RehabPhase;
  difficulty: number;
  description: string;
  biomechanics: string;
  safetyFlags: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  sets: number;
  reps: number;
  tempo: string;
  restPeriod: number;
  targetRpe: number;
  visualUrl?: string;
  videoUrl?: string;
  isMotion: boolean;
  visualStyle: VisualStyle;
  vectorData?: string;
  isPersonalized?: boolean;
  movementPlane?: string;
  tutorialData?: ExerciseTutorial;
  visualFrameCount?: number;
  visualLayout?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  syncInfo?: {
    isSynced: boolean;
    lastSyncDate: string;
    downloadProgress: number;
  };
  _sync?: SyncMetadata;
}

/* PatientProfile interface updated with sync, treatment history and pain logs */
export interface PatientProfile {
  user_id: string;
  diagnosisSummary: string;
  icd10?: string;
  riskLevel: RiskLevel;
  status: PatientStatus;
  rehabPhase: RehabPhase;
  suggestedPlan: Exercise[];
  progressHistory: ProgressReport[];
  treatmentHistory?: TreatmentHistory[];
  painLogs?: DetailedPainLog[];
  physicalAssessment: {
    rom: Record<string, number>;
    strength: Record<string, number>;
    posture: string;
    recoveryTrajectory?: number;
    involvedSegments?: string[]; // Örn: ["L4", "L5"]
  };
  latestInsight?: {
    summary?: string;
    clinicalNote?: string;
    safetyAlert?: string;
    recoveryTrajectory?: number;
  };
  _sync?: SyncMetadata;
  syncStatus?: 'Synced' | 'Pending';
}

export interface ProgressReport {
  id?: string;
  date: string;
  painScore: number;
  completionRate: number;
  feedback: string;
  clinicalFlags?: string[];
}

/* Added missing User interface for staff and patient management */
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  patientStatus?: PatientStatus;
  patientProfile?: PatientProfile;
  therapistProfile?: TherapistProfile;
  assignedTherapistId?: string;
  _sync?: SyncMetadata;
}

/* Added missing TherapistProfile interface */
export interface TherapistProfile {
  specialization: string[];
  bio: string;
  yearsOfExperience: number;
  successRate: number;
  totalPatientsActive: number;
  averageRecoveryTime: string;
  status: StaffStatus;
  aiAssistantSettings: {
    autoSuggestProtocols: boolean;
    notifyHighRisk: boolean;
    weeklyReports: boolean;
  };
}

/* Added missing Message interface for clinical chat */
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

/* Added missing DetailedPainLog interface */
export interface DetailedPainLog {
  date: string;
  score: number;
  location: string;
  quality: PainQuality;
  notes: string;
}

/* Added missing TreatmentHistory interface */
export interface TreatmentHistory {
  date: string;
  treatment: string;
  outcome: string;
}
