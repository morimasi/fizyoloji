
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v5.5.2 ENTERPRISE MASTER SCHEMA (POSTGRESQL)
-- Version: 5.5.2 "Idempotent Fix"
-- Security: HIPAA, GDPR & KVKK Multi-Regional Compliance
-- =============================================================================

-- 1. SISTEM EKLENTILERI
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. KLINIK ENUM TIPLERI
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Therapist', 'Patient');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_status') THEN
        CREATE TYPE patient_status AS ENUM ('Kritik', 'Stabil', 'İyileşiyor', 'Taburcu');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_status') THEN
        CREATE TYPE staff_status AS ENUM ('Aktif', 'İzinde', 'Pasif');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pain_quality') THEN
        CREATE TYPE pain_quality AS ENUM ('Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme', 'Sızlama');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rehab_phase') THEN
        CREATE TYPE rehab_phase AS ENUM ('Akut', 'Sub-Akut', 'Kronik', 'Performans');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visual_style') THEN
        CREATE TYPE visual_style AS ENUM ('AVM-Genesis', 'VEO-Premium', 'X-Ray', 'Cinematic-Motion', '4K-Render', 'Schematic');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. KULLANICI MERKEZI
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. TERAPIST PROFILLERI (status sütunu eklendi)
CREATE TABLE IF NOT EXISTS therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_no VARCHAR(100) UNIQUE,
    specialization TEXT[] DEFAULT '{}',
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    status staff_status DEFAULT 'Aktif',
    ai_assistant_config JSONB DEFAULT '{"autoSuggest": true, "riskAlerts": true}',
    is_certified BOOLEAN DEFAULT FALSE
);

-- 5. HASTA PROFILLERI
CREATE TABLE IF NOT EXISTS patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    rehab_phase rehab_phase DEFAULT 'Akut',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    diagnosis_summary TEXT,
    assessment_data JSONB DEFAULT '{}',
    latest_ai_insight JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MIGRATION PATCH: Eğer tablo önceden oluştuysa ve 'status' sütunu yoksa ekle
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='status') THEN
        ALTER TABLE patients ADD COLUMN status patient_status DEFAULT 'Stabil';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='therapist_profiles' AND column_name='status') THEN
        ALTER TABLE therapist_profiles ADD COLUMN status staff_status DEFAULT 'Aktif';
    END IF;
END $$;

-- 6. EGZERSIZ KUTUPHANESI
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    difficulty_level INTEGER DEFAULT 5,
    visual_url TEXT,
    video_url TEXT,
    vector_data TEXT,
    visual_style visual_style DEFAULT 'AVM-Genesis',
    description TEXT,
    biomechanics_notes TEXT,
    primary_muscles TEXT[] DEFAULT '{}',
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_rest_sec INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. RECETELER
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL DEFAULT 3,
    reps INTEGER NOT NULL DEFAULT 10,
    rest_period_sec INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. INDEKSLER (Idempotent)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_therapist ON patients(assigned_therapist_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercises_code ON exercises(code);

-- 13. TRIGGERLAR
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_patients_updated_at ON patients;
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
