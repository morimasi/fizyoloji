
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v7.1 ULTIMATE MASTER SCHEMA (REPAIR & SYNC EDITION)
-- Architect: Fizyolojik (AI) & Clinical Systems Director
-- =============================================================================

-- 1. TEMEL EKLENTİLER
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. KLİNİK VE SİSTEM STANDARTLARI (ENUMS)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Therapist', 'Patient', 'Supervisor');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_status') THEN
        CREATE TYPE patient_status AS ENUM ('Kritik', 'Stabil', 'İyileşiyor', 'Taburcu', 'Pasif');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rehab_phase') THEN
        CREATE TYPE rehab_phase AS ENUM ('Pre-Op', 'Akut', 'Sub-Akut', 'Kronik', 'Performans', 'Bakım');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pain_quality') THEN
        CREATE TYPE pain_quality AS ENUM ('Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme', 'Sızlama', 'Zonklayıcı');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visual_style') THEN
        CREATE TYPE visual_style AS ENUM ('AVM-Genesis', 'VEO-Premium', 'AVM-Sprite', 'Cinematic-Grid', 'X-Ray', 'Schematic', '4K-Render', 'Cinematic-Motion');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. USERS: MERKEZİ KİMLİK SİSTEMİ
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. THERAPIST_PROFILES
CREATE TABLE IF NOT EXISTS therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_no VARCHAR(100) UNIQUE,
    specialization TEXT[] DEFAULT '{}',
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    average_recovery_weeks DECIMAL(4,1) DEFAULT 0.0,
    total_patients_handled INTEGER DEFAULT 0,
    ai_assistant_config JSONB DEFAULT '{"autoSuggest": true, "riskAlerts": true, "weeklyReports": true, "empathyLevel": 75}'
);

-- 5. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    current_rehab_phase rehab_phase DEFAULT 'Akut',
    risk_level VARCHAR(20) DEFAULT 'Düşük',
    diagnosis_summary TEXT,
    icd_10_primary VARCHAR(20),
    clinical_flags TEXT[] DEFAULT '{}',
    physical_assessment JSONB DEFAULT '{"rom": {}, "strength": {}, "posture": "Normal", "recoveryTrajectory": 0}',
    latest_ai_insight JSONB DEFAULT '{"summary": null, "nextStep": null, "painTrend": "Stable"}',
    sync_status VARCHAR(20) DEFAULT 'Synced',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. EXERCISES
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    description TEXT,
    biomechanics_notes TEXT,
    visual_url TEXT,
    video_url TEXT,
    vector_data TEXT,
    visual_style visual_style DEFAULT 'AVM-Genesis',
    is_motion BOOLEAN DEFAULT FALSE,
    visual_frame_count INTEGER DEFAULT 16,
    primary_muscles TEXT[] DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    movement_plane VARCHAR(50), 
    equipment TEXT[] DEFAULT '{}',
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_tempo VARCHAR(20) DEFAULT '3-1-3',
    default_rest_sec INTEGER DEFAULT 60,
    target_rpe INTEGER DEFAULT 5,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRESCRIPTIONS (Fix: Column Repair logic included)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prescribed_sets INTEGER NOT NULL,
    prescribed_reps INTEGER NOT NULL,
    prescribed_tempo VARCHAR(20),
    rest_period_sec INTEGER DEFAULT 60,
    frequency_daily INTEGER DEFAULT 2,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- REPAIR: is_active sütunu eksikse ekle
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prescriptions' AND column_name='is_active') THEN
        ALTER TABLE prescriptions ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 8. PROGRESS_REPORTS
CREATE TABLE IF NOT EXISTS progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pain_score_vas INTEGER CHECK (pain_score_vas BETWEEN 0 AND 10),
    completion_rate INTEGER DEFAULT 100,
    patient_feedback TEXT,
    ai_clinical_flags TEXT[] DEFAULT '{}',
    biometric_data JSONB DEFAULT '{}'
);

-- 9. PAIN_LOGS
CREATE TABLE IF NOT EXISTS pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    score INTEGER NOT NULL,
    quality pain_quality NOT NULL,
    location_tag VARCHAR(100) NOT NULL,
    trigger_factors TEXT,
    is_night_pain BOOLEAN DEFAULT FALSE
);

-- 10. CLINICAL_TASKS
CREATE TABLE IF NOT EXISTS clinical_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    priority task_priority DEFAULT 'Medium',
    status VARCHAR(20) DEFAULT 'Pending',
    ai_recommendation TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. GAMIFICATION_REWARDS
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon_tag VARCHAR(50),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SYSTEM_CONFIG
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50),
    entity_id UUID,
    payload JSONB,
    severity VARCHAR(20) DEFAULT 'INFO',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. MESSAGING_SYSTEM
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    attachments TEXT[] DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. İNDEKSLER (Gelişmiş)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_patients_therapist ON patients(assigned_therapist_id);
-- Fix: is_active sütunu artık kesinlikle mevcut
CREATE INDEX IF NOT EXISTS idx_prescriptions_active ON prescriptions(patient_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_reports_patient_date ON progress_reports(patient_id, session_date);
CREATE INDEX IF NOT EXISTS idx_tasks_therapist_status ON clinical_tasks(therapist_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_messages_flow ON messages(sender_id, receiver_id, sent_at);

-- 16. OTOMATİK ZAMAN GÜNCELLEME (TRIGGERS)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trg_users_upd ON users;
CREATE TRIGGER trg_users_upd BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TRIGGER IF EXISTS trg_patients_upd ON patients;
CREATE TRIGGER trg_patients_upd BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TRIGGER IF EXISTS trg_exercises_upd ON exercises;
CREATE TRIGGER trg_exercises_upd BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- 17. VARSAYILAN SİSTEM AYARLARI (SEED CONFIG)
INSERT INTO system_config (key, value, description) VALUES 
('GLOBAL_AI_TUNING', '{"reasoningDepth": 92, "conservativeThreshold": 65, "veoOptimization": 100}', 'Global AI Muhakeme ve Görsel Kalite Ayarları'),
('CLINICAL_RULES', '{"maxPainIncrease": 3, "minComplianceRate": 40, "autoPhaseShift": true}', 'Otomatik Klinik Karar Kuralları')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- MASTER SCHEMA v7.1 COMPLETED & REPAIRED
-- =============================================================================
