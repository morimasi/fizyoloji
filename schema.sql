
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v10.0 MASTER SCHEMA (FLASH ULTRA EDITION)
-- =============================================================================

-- 1. EXTENSIONS & SECURITY
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM TYPE DEFINITIONS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Therapist', 'Patient', 'Supervisor');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_status') THEN
        CREATE TYPE patient_status AS ENUM ('Kritik', 'Akut', 'Stabil', 'İyileşiyor', 'Taburcu', 'Pasif');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rehab_phase') THEN
        CREATE TYPE rehab_phase AS ENUM ('Pre-Op', 'Akut', 'Sub-Akut', 'Kronik', 'Performans');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pain_quality') THEN
        CREATE TYPE pain_quality AS ENUM ('Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme', 'Sızlama');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE USER IDENTITY
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    password_hash TEXT NOT NULL DEFAULT 'external_auth',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROFESSIONAL PROFILES (THERAPISTS)
CREATE TABLE IF NOT EXISTS therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_no VARCHAR(100) UNIQUE,
    specialization TEXT[] DEFAULT '{}',
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    total_patients_active INTEGER DEFAULT 0,
    average_recovery_time VARCHAR(50),
    ai_assistant_config JSONB DEFAULT '{"autoSuggest": true, "riskAlerts": true, "weeklyReports": true}',
    status VARCHAR(20) DEFAULT 'Aktif'
);

-- 5. CLINICAL PROFILES (PATIENTS)
CREATE TABLE IF NOT EXISTS patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    current_rehab_phase rehab_phase DEFAULT 'Akut',
    risk_level VARCHAR(20) DEFAULT 'Düşük',
    diagnosis_summary TEXT,
    icd10_code VARCHAR(20),
    privacy_config JSONB DEFAULT '{"shareBiometrics": true, "sharePainLogs": true}',
    physical_assessment JSONB DEFAULT '{"rom": {}, "strength": {}, "posture": ""}',
    latest_ai_insight JSONB DEFAULT '{}',
    sync_status VARCHAR(20) DEFAULT 'Synced',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CLINICAL CONTENT LIBRARY (EXERCISES)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    difficulty INTEGER DEFAULT 5,
    description TEXT,
    biomechanics_notes TEXT,
    
    -- Multimodal Assets (Flash Engine v10.0)
    media_assets JSONB DEFAULT '{
        "visual_url": null,      -- Static Image / Sprite Sheet
        "video_url": null,       -- Veo Fast Video
        "ppt_data": null,        -- Slide JSON Structure
        "gif_url": null,         -- Optimized GIF
        "model_3d_coords": null  -- Vector/3D Coordinates
    }',
    
    is_motion BOOLEAN DEFAULT false,
    visual_style VARCHAR(50) DEFAULT 'Flash-Ultra',
    equipment TEXT[] DEFAULT '{}',
    primary_muscles TEXT[] DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. REHABILITATION PRESCRIPTIONS (PROGRAMS)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER DEFAULT 3,
    reps INTEGER DEFAULT 10,
    tempo VARCHAR(20) DEFAULT '3-1-3',
    rest_period INTEGER DEFAULT 60,
    target_rpe INTEGER DEFAULT 5,
    display_order INTEGER DEFAULT 0,
    is_personalized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. BIOMETRIC TRACKING (PAIN & PROGRESS)
CREATE TABLE IF NOT EXISTS pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    quality pain_quality DEFAULT 'Künt',
    location_tag VARCHAR(100),
    trigger_factors TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pain_score INTEGER NOT NULL,
    completion_rate INTEGER DEFAULT 0,
    feedback TEXT,
    clinical_flags TEXT[] DEFAULT '{}',
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. CLINICAL WORKFLOW (TASKS)
CREATE TABLE IF NOT EXISTS clinical_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    priority task_priority DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    ai_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. COMMUNICATIONS (SECURE MESSAGING)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_therapist ON patients(assigned_therapist_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_pain_logs_patient_date ON pain_logs(patient_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_tasks_therapist_status ON clinical_tasks(therapist_id, status);

-- 12. AUTOMATIC UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'patients', 'exercises', 'clinical_tasks', 'therapist_profiles')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_upd_%I ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_upd_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE update_timestamp()', t, t);
    END LOOP;
END $$;
