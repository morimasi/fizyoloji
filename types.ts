
export type UserRole = 'Admin' | 'Therapist' | 'Patient';
export type PatientStatus = 'Kritik' | 'Stabil' | 'İyileşiyor' | 'Taburcu';
export type StaffStatus = 'Aktif' | 'İzinde' | 'Pasif';
export type PainQuality = 'Keskin' | 'Künt' | 'Yanıcı' | 'Batıcı' | 'Elektriklenme';
export type AppTab = 'consultation' | 'dashboard' | 'progress' | 'users' | 'cms';
export type TherapistTab = 'dashboard' | 'patients' | 'intelligence' | 'settings';

export interface SyncMetadata {
  isSynced: boolean;
  lastSyncDate?: string;
  deviceId?: string;
  downloadProgress?: number;
}

export interface ExerciseTutorial {
  script: { text: string; duration: number }[];
  audioBase64: string | null;
  bpm: number;
}

export interface Exercise {
  id: string;
  code: string;
  title: string;
  titleTr?: string;
  icdCode?: string;
  category: string;
  rehabPhase?: 'Akut' | 'Sub-Akut' | 'Kronik' | 'Performans';
  difficulty: number;
  description: string;
  biomechanics: string;
  safetyFlags: string[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  muscleGroups?: string[];
  equipment?: string[];
  sets: number;
  reps: number;
  tempo?: string;
  restPeriod?: number;
  targetRpe?: number;
  frequency?: string;
  visualUrl?: string;
  videoUrl?: string;
  isMotion?: boolean;
  vectorData?: string;
  syncInfo?: SyncMetadata; // Sync Tracking
  lastViewedAt?: string;   // Monitoring
  isPersonalized?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  visualStyle?: 'Cinematic-Grid' | 'VEO-Premium' | 'AVM-Genesis' | 'AVM-Sprite' | 'X-Ray' | 'Schematic' | '4K-Render' | 'Cinematic-Motion';
  visualFrameCount?: number;
  visualLayout?: string;
  movementPlane?: string;
  tutorialData?: ExerciseTutorial;
}

export interface ProgressReport {
  date: string;
  painScore: number;
  completionRate: number;
  feedback: string;
}

export interface DetailedPainLog {
  date: string;
  score: number;
  quality: PainQuality;
  location: string;
}

export interface TreatmentHistory {
  date: string;
  procedure: string;
  notes: string;
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
    nextStep?: string;
    recommendation?: string;
    painTrendAnalysis?: string;
  };
  syncStatus?: 'Outdated' | 'Synced' | 'Syncing'; // Global Sync Status
}

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

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  assignedTherapistId?: string;
  patientStatus?: PatientStatus;
  clinicalProfile?: {
    diagnosis: string;
    riskLevel: 'Düşük' | 'Orta' | 'Yüksek';
    notes: string[];
    treatmentHistory: TreatmentHistory[];
    painLogs: DetailedPainLog[];
  };
  therapistProfile?: TherapistProfile;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export type PatientUser = User;
