
export type UserRole = 'Admin' | 'Therapist' | 'Patient';
export type PatientStatus = 'Kritik' | 'Stabil' | 'İyileşiyor' | 'Taburcu';
export type PainQuality = 'Keskin' | 'Künt' | 'Yanıcı' | 'Batıcı' | 'Elektriklenme';

export interface MovementFrame {
  timestamp: number;
  part: string; // 'spine', 'arm', 'leg', 'neck'
  rotation: number;
  scale?: number;
  opacity?: number;
  glow?: string;
}

export interface AnimationChoreography {
  totalDuration: number;
  frames: MovementFrame[];
  focusPart: string;
  muscleActivationPatterns: Record<string, number[]>; // key: muscleName, value: [activation% per step]
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
  visualUrl?: string;
  videoUrl?: string;
  isMotion?: boolean;
  visualStyle?: string;
  isPersonalized?: boolean;
  tempo?: string;
  restPeriod?: number;
  muscleGroups?: string[];
  choreography?: AnimationChoreography;
  equipment?: string[];
  rehabPhase?: 'Akut' | 'Sub-Akut' | 'Kronik' | 'Performans' | string;
  movementPlane?: 'Sagittal' | 'Frontal' | 'Transverse' | 'Oblique' | 'Multi-Planar' | 'Circumduction' | 'Visual' | 'Deep' | 'Internal' | 'Fascial' | 'Static' | 'Steady' | 'Rhythmic' | 'Safe' | 'Controlled' | 'Fluid' | 'Patient-led' | 'Continuous' | 'Normal' | 'Step' | '30s Hold' | 'Slow' | string;
  isFavorite?: boolean;
  isArchived?: boolean;
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
  quality: string;
  triggers: string[];
  duration: string;
}

export interface Note {
  id: string;
  authorId: string;
  text: string;
  date: string;
  type: string;
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

export interface ProgressReport {
  date: string;
  painScore: number;
  completionRate: number;
  feedback: string;
}

export type AppTab = 'consultation' | 'dashboard' | 'cms' | 'progress' | 'users';
export type TherapistTab = 'dashboard' | 'patients' | 'intelligence' | 'settings';

// Enhanced for Staff Module
export interface StaffPerformanceMetrics {
  monthlyRetention: number; // %
  avgSessionDuration: number; // minutes
  protocolAdherence: number; // %
  patientSatisfaction: number; // 0-5
}

export interface TherapistProfile {
  specialization: string[];
  bio: string;
  yearsOfExperience: number;
  successRate: number;
  totalPatientsActive: number;
  averageRecoveryTime: string;
  // Enhanced Settings for Staff Module
  availabilityStatus?: 'Online' | 'In-Session' | 'Offline' | 'Break';
  performanceMetrics?: StaffPerformanceMetrics;
  shiftSchedule?: string; // e.g., "09:00 - 17:00"
  aiAssistantSettings: {
    autoSuggestProtocols: boolean;
    notifyHighRisk: boolean;
    weeklyReports: boolean;
    sensitivityLevel?: 'Conservative' | 'Balanced' | 'Aggressive'; // For AI Logic
  };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  therapistProfile?: TherapistProfile;
}

export interface PatientUser extends User {
  status: PatientStatus;
  lastVisit: string;
  recoveryProgress: number;
  riskScore: number;
  assignedTherapistId: string;
  clinicalProfile: {
    diagnosis: string;
    riskLevel: string;
    notes: Note[];
    treatmentHistory: TreatmentHistory[];
    painLogs: DetailedPainLog[];
  }
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}
