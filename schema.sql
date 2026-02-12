
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v4.2 ENTERPRISE (IDEMPOTENT STABLE)
-- Author: Chief Architect of Special Education Ecosystems
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES (Sadece yoksa oluşturur)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Therapist', 'Patient');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_status') THEN
        CREATE TYPE patient_status AS ENUM ('Kritik', 'Stabil', 'İyileşiyor', 'Taburcu');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pain_quality') THEN
        CREATE TYPE pain_quality AS ENUM ('Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rehab_phase') THEN
        CREATE TYPE rehab_phase AS ENUM ('Akut', 'Sub-Akut', 'Kronik', 'Performans');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. THERAPIST PROFILES
CREATE TABLE IF NOT EXISTS therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT[] DEFAULT '{}',
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    total_patients_active INTEGER DEFAULT 0,
    average_recovery_time VARCHAR(50),
    ai_assistant_settings JSONB DEFAULT '{
        "autoSuggestProtocols": true,
        "notifyHighRisk": true,
        "weeklyReports": true
    }'
);

-- 5. PATIENTS (Gelişmiş Düzeltme Mantığı)
CREATE TABLE IF NOT EXISTS patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    recovery_progress INTEGER DEFAULT 0 CHECK (recovery_progress BETWEEN 0 AND 100),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    diagnosis_summary TEXT,
    risk_level VARCHAR(20) DEFAULT 'Orta',
    last_visit TIMESTAMP WITH TIME ZONE,
    latest_insight JSONB DEFAULT '{
        "summary": null,
        "adaptationNote": null,
        "nextStep": null,
        "phaseName": "Faz 1 (Akut)"
    }',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hata Giderici: Eğer tablo zaten varsa ve assigned_therapist_id kolonu eksikse ekle
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='patients' AND column_name='assigned_therapist_id') THEN
        ALTER TABLE patients ADD COLUMN assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. EXERCISES (Klinik Kütüphane)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_tr VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    difficulty INTEGER DEFAULT 5 CHECK (difficulty BETWEEN 1 AND 10),
    sets INTEGER DEFAULT 3,
    reps INTEGER DEFAULT 10,
    tempo VARCHAR(20) DEFAULT '3-1-3',
    rest_period INTEGER DEFAULT 60,
    description TEXT,
    biomechanics TEXT,
    safety_flags TEXT[] DEFAULT '{}',
    muscle_groups TEXT[] DEFAULT '{}',
    equipment TEXT[] DEFAULT '{}',
    rehab_phase rehab_phase DEFAULT 'Sub-Akut',
    movement_plane VARCHAR(50),
    visual_url TEXT,
    video_url TEXT,
    is_motion BOOLEAN DEFAULT FALSE,
    visual_style VARCHAR(50) DEFAULT 'Cinematic-Motion',
    is_personalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRESCRIPTIONS & PROGRESS
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    custom_sets INTEGER,
    custom_reps INTEGER,
    custom_notes TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
    pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),
    completion_rate INTEGER DEFAULT 100,
    feedback TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 10),
    location VARCHAR(100),
    quality pain_quality,
    triggers TEXT[] DEFAULT '{}',
    duration VARCHAR(50),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MESSAGING & SYSTEM
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_cache (
    input_hash VARCHAR(64) PRIMARY KEY,
    response_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sync_logs (
    id BIGSERIAL PRIMARY KEY,
    sync_type VARCHAR(50),
    status VARCHAR(20),
    latency_ms INTEGER,
    payload_size_kb INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. INDEXES (Hata korumalı tanımlama)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_therapist ON patients(assigned_therapist_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_reports_patient ON progress_reports(patient_id);

-- 10. AUTOMATION: UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_users_timestamp ON users;
CREATE TRIGGER trigger_update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_patients_timestamp ON patients;
CREATE TRIGGER trigger_update_patients_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- =============================================================================
-- SONUÇ: Şema v4.2 - Tam Idempotent Yapı Sağlandı.
-- =============================================================================
