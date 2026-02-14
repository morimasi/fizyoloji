
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v8.0 ULTIMATE MASTER SCHEMA
-- Comprehensive Production-Ready Clinical Database Structure
-- Architect: Fizyolojik (AI) & Clinical Systems Lead
-- =============================================================================

-- 1. EXTENSIONS & SECURITY
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM TYPES & ENUMS (Idempotent Creation)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Therapist', 'Patient', 'Supervisor', 'Guest');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_status') THEN
        CREATE TYPE patient_status AS ENUM ('Kritik', 'Akut', 'Stabil', 'İyileşiyor', 'Taburcu', 'Pasif');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rehab_phase') THEN
        CREATE TYPE rehab_phase AS ENUM ('Pre-Op', 'Akut', 'Sub-Akut', 'Kronik', 'Performans', 'Bakım');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pain_quality') THEN
        CREATE TYPE pain_quality AS ENUM ('Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme', 'Sızlama', 'Zonklayıcı', 'Uyuşma');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visual_style') THEN
        CREATE TYPE visual_style AS ENUM ('AVM-Genesis', 'VEO-Premium', 'AVM-Sprite', 'Cinematic-Grid', 'X-Ray', 'Schematic', '4K-Render', 'Cinematic-Motion', 'Vector-Overlay');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'export_format') THEN
        CREATE TYPE export_format AS ENUM ('mp4', 'webm', 'gif', 'svg', 'avi', 'mpeg', 'pdf');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. THERAPIST PROFILES (Clinical performance & settings)
CREATE TABLE IF NOT EXISTS therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_no VARCHAR(100) UNIQUE,
    specialization TEXT[] DEFAULT '{}',
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    average_recovery_weeks DECIMAL(4,1) DEFAULT 0.0,
    total_patients_handled INTEGER DEFAULT 0,
    institution_id VARCHAR(100), -- Kurum aidiyeti
    ai_assistant_config JSONB DEFAULT '{
        "autoSuggest": true, 
        "riskAlerts": true, 
        "weeklyReports": true, 
        "empathyLevel": 75,
        "reasoningDepth": "High"
    }'
);

-- 5. PATIENTS (Clinical focus & Bio-metrics)
CREATE TABLE IF NOT EXISTS patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    current_rehab_phase rehab_phase DEFAULT 'Akut',
    risk_level VARCHAR(20) DEFAULT 'Düşük',
    diagnosis_summary TEXT,
    icd_10_primary VARCHAR(20),
    clinical_flags TEXT[] DEFAULT '{}', -- Red Flags
    
    -- Dynamic Bio-Assessment Data
    physical_assessment JSONB DEFAULT '{
        "rom": {}, 
        "strength": {}, 
        "posture": "Normal", 
        "recoveryTrajectory": 0,
        "balanceScore": 0,
        "functionalIndependenceMeasure": 0
    }',
    
    latest_ai_insight JSONB DEFAULT '{
        "summary": null, 
        "nextStep": null, 
        "painTrend": "Stable",
        "adherenceScore": 0
    }',
    
    sync_status VARCHAR(20) DEFAULT 'Synced',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. EXERCISES (The Content Library)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    
    -- Clinical Logic
    description TEXT,
    description_tr TEXT,
    biomechanics_notes TEXT,
    primary_muscles TEXT[] DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    movement_plane VARCHAR(50), 
    equipment TEXT[] DEFAULT '{}',
    
    -- Media Assets (Multimodal)
    visual_url TEXT,
    video_url TEXT,
    vector_data TEXT, -- SVG or Path data
    visual_style visual_style DEFAULT 'AVM-Genesis',
    is_motion BOOLEAN DEFAULT FALSE,
    visual_frame_count INTEGER DEFAULT 16,
    visual_layout VARCHAR(50) DEFAULT 'grid-4x4',
    
    -- Default Dosage
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_tempo VARCHAR(20) DEFAULT '3-1-3',
    default_rest_sec INTEGER DEFAULT 60,
    target_rpe INTEGER DEFAULT 5,
    
    -- Meta
    is_ai_generated BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRESCRIPTIONS (Active Treatment Protocols)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Overridden Dosage for Patient
    prescribed_sets INTEGER NOT NULL,
    prescribed_reps INTEGER NOT NULL,
    prescribed_tempo VARCHAR(20),
    rest_period_sec INTEGER DEFAULT 60,
    frequency_daily INTEGER DEFAULT 2,
    
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PROGRESS REPORTS (Session Outcomes)
CREATE TABLE IF NOT EXISTS progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    pain_score_vas INTEGER CHECK (pain_score_vas BETWEEN 0 AND 10),
    completion_rate INTEGER DEFAULT 100,
    patient_feedback TEXT,
    ai_clinical_flags TEXT[] DEFAULT '{}',
    
    -- Captured during session
    biometric_data JSONB DEFAULT '{
        "avgHeartRate": 0,
        "maxTension": 0,
        "timeSpent": 0,
        "caloriesBurned": 0
    }'
);

-- 9. PAIN LOGS (Inter-session tracking)
CREATE TABLE IF NOT EXISTS pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    score INTEGER NOT NULL,
    quality pain_quality NOT NULL,
    location_tag VARCHAR(100) NOT NULL,
    trigger_factors TEXT,
    is_night_pain BOOLEAN DEFAULT FALSE,
    medication_taken BOOLEAN DEFAULT FALSE
);

-- 10. CLINICAL TASKS (Workflow management)
CREATE TABLE IF NOT EXISTS clinical_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    priority task_priority DEFAULT 'Medium',
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'In-Progress', 'Completed'
    ai_recommendation TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. MESSAGING SYSTEM (HIPAA Compliant)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attachments JSONB DEFAULT '[]' -- {type: 'image', url: '...'}
);

-- 12. EXPORT HISTORY (Track generated assets)
CREATE TABLE IF NOT EXISTS export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
    format export_format NOT NULL,
    file_url TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. AUDIT LOGS (Compliance & Security tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'LOGIN', 'RECRIPTION_UPDATE', 'DELETE_USER'
    entity_name VARCHAR(50),
    entity_id UUID,
    payload JSONB,
    severity VARCHAR(20) DEFAULT 'INFO',
    client_info JSONB, -- IP, UserAgent
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. GAMIFICATION & REWARDS
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL, -- 'BADGE', 'STREAK', 'PRODUCTION'
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon_tag VARCHAR(50),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. SYSTEM CONFIGURATION
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_therapist ON patients(assigned_therapist_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_active ON prescriptions(patient_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_exercises_code ON exercises(code);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_reports_patient_date ON progress_reports(patient_id, session_date);
CREATE INDEX IF NOT EXISTS idx_tasks_therapist_status ON clinical_tasks(therapist_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_flow ON messages(sender_id, receiver_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_audit_type ON audit_logs(action_type);

-- 17. AUTOMATIC TIMESTAMP TRIGGERS
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER trg_users_upd BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
    CREATE TRIGGER trg_patients_upd BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
    CREATE TRIGGER trg_exercises_upd BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 18. INITIAL SYSTEM SETTINGS
INSERT INTO system_config (key, value, description) VALUES 
('GLOBAL_AI_TUNING', '{"reasoningDepth": 95, "safetyFactor": 80, "clinicalPrecision": "Extreme"}', 'Genesis AI Core Settings'),
('MEDIA_CONVERSION_DEFAULTS', '{"videoBitrate": "8Mbps", "gifQuality": 90, "watermarkEnabled": true}', 'Media Transcoding Presets')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- MASTER SCHEMA v8.0 COMPLETED
-- =============================================================================
