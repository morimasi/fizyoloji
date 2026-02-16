
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
  isDirty: boolean; // Yerelde değişti ama sunucuya gitmedi
  version: number;
}

export interface ExerciseTutorial {
  script: { text: string; duration: number }[];
  audioBase64: string | null;
  bpm: number;
}

export interface SyncInfo {
  isSynced: boolean;
  lastSyncDate: string;
  downloadProgress: number;
}

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
  frequency?: string;
  visualUrl?: string;
  videoUrl?: string;
  isMotion: boolean;
  visualStyle: VisualStyle;
  vectorData?: string;
  isPersonalized?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  movementPlane?: string;
  tutorialData?: ExerciseTutorial;
  syncInfo?: SyncInfo;
  visualFrameCount?: number;
  visualLayout?: string;
  _sync?: SyncMetadata; // Senkronizasyon metadatası
}

export interface ProgressReport {
  id?: string;
  date: string;
  painScore: number;
  completionRate: number;
  feedback: string;
  clinicalFlags?: string[];
}

export interface DetailedPainLog {
  id?: string;
  date: string;
  score: number;
  quality: PainQuality;
  location: string;
  triggerFactors?: string;
}

export interface TreatmentHistory {
  id?: string;
  date: string;
  procedure: string;
  notes: string;
}

export interface PatientProfile {
  user_id: string;
  diagnosisSummary: string;
  icd10?: string;
  riskLevel: RiskLevel;
  status: PatientStatus;
  rehabPhase: RehabPhase;
  suggestedPlan: Exercise[];
  progressHistory: ProgressReport[];
  treatmentHistory: TreatmentHistory[];
  painLogs: DetailedPainLog[];
  physicalAssessment: {
    rom: Record<string, number>;
    strength: Record<string, number>;
    posture: string;
    recoveryTrajectory?: number; // 0-100 percentage of recovery path
  };
  latestInsight?: {
    summary?: string;
    nextStep?: string;
    recommendation?: string;
    painTrendAnalysis?: string;
    targetRecoveryDate?: string;
  };
  syncStatus: 'Synced' | 'Syncing' | 'Error';
  _sync?: SyncMetadata;
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
  patientProfile?: PatientProfile;
  therapistProfile?: TherapistProfile;
  patientStatus?: PatientStatus;
  _sync?: SyncMetadata;
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

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}
