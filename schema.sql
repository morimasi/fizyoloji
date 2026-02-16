
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v9.2 MASTER SCHEMA (RECOVERY & LEGACY COMPATIBLE)
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM TYPES
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
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE TABLES
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

CREATE TABLE IF NOT EXISTS therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_no VARCHAR(100) UNIQUE,
    specialization TEXT[] DEFAULT '{}',
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    ai_assistant_config JSONB DEFAULT '{"autoSuggest": true, "riskAlerts": true}',
    status VARCHAR(20) DEFAULT 'Aktif'
);

CREATE TABLE IF NOT EXISTS patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    current_rehab_phase rehab_phase DEFAULT 'Akut',
    risk_level VARCHAR(20) DEFAULT 'Düşük',
    diagnosis_summary TEXT,
    privacy_config JSONB DEFAULT '{}',
    physical_assessment JSONB DEFAULT '{}',
    latest_ai_insight JSONB DEFAULT '{}',
    sync_status VARCHAR(20) DEFAULT 'Synced',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    difficulty_level INTEGER,
    description TEXT,
    biomechanics_notes TEXT,
    visual_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    location_tag VARCHAR(100),
    trigger_factors TEXT
);

-- 4. LEGACY FIXES (Sütun Kontrolü ve Ekleme)
-- pain_logs tablosuna logged_at ekle (eğer yoksa)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pain_logs' AND column_name='logged_at') THEN
        ALTER TABLE pain_logs ADD COLUMN logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- patients tablosuna privacy_config ekle (eğer yoksa)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='privacy_config') THEN
        ALTER TABLE patients ADD COLUMN privacy_config JSONB DEFAULT '{}';
    END IF;
END $$;

-- 5. REMAINING TABLES
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinical_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    priority task_priority DEFAULT 'Medium',
    status VARCHAR(20) DEFAULT 'Pending',
    ai_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. INDEXES (SAFE MODE)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_therapist ON patients(assigned_therapist_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_pain_logs_patient_date ON pain_logs(patient_id, logged_at);

-- 7. TRIGGERS
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
