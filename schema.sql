
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v6.0 ULTIMATE MASTER SCHEMA
-- Geliştirici: Chief Architect of Special Education Ecosystems
-- Kapsam: Klinik Muhakeme, Dozaj Motoru, RPM Takibi, İK Yönetimi & AI Insights
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DOMAINS & ENUMS (Klinik Standartlar)
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
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
        CREATE TYPE risk_level AS ENUM ('Düşük', 'Orta', 'Yüksek');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rehab_phase') THEN
        CREATE TYPE rehab_phase AS ENUM ('Akut', 'Sub-Akut', 'Kronik', 'Performans');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pain_quality') THEN
        CREATE TYPE pain_quality AS ENUM ('Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme', 'Sızlama');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visual_style') THEN
        CREATE TYPE visual_style AS ENUM ('AVM-Genesis', 'VEO-Premium', 'AVM-Sprite', 'Cinematic-Grid', 'X-Ray', 'Schematic', '4K-Render', 'Cinematic-Motion');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. USERS (Merkezi Kimlik)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 4. THERAPIST PROFILES (İK & Performans)
CREATE TABLE IF NOT EXISTS therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_no VARCHAR(100) UNIQUE,
    specialization TEXT[] DEFAULT '{}',
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    status staff_status DEFAULT 'Aktif',
    ai_assistant_config JSONB DEFAULT '{"autoSuggest": true, "riskAlerts": true, "weeklyReports": true}',
    average_recovery_weeks DECIMAL(4,1) DEFAULT 0.0
);

-- 5. PATIENT PROFILES (Klinik Takip & Risk)
CREATE TABLE IF NOT EXISTS patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    current_rehab_phase rehab_phase DEFAULT 'Akut',
    risk_level risk_level DEFAULT 'Düşük',
    diagnosis_summary TEXT,
    icd_10_primary VARCHAR(20),
    sync_status VARCHAR(20) DEFAULT 'Synced',
    latest_ai_insight JSONB DEFAULT '{}', -- {summary, nextStep, painTrend}
    physical_assessment JSONB DEFAULT '{"rom": {}, "strength": {}, "posture": {}}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. EXERCISE LIBRARY (Genesis Studio Data)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255),
    category VARCHAR(100) NOT NULL, -- Spine / Lumbar vb.
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    description TEXT, -- Hasta talimatları
    biomechanics_notes TEXT, -- Klinik rasyonel
    
    -- Medya & Render
    visual_url TEXT,
    video_url TEXT,
    vector_data TEXT,
    visual_style visual_style DEFAULT 'AVM-Genesis',
    is_motion BOOLEAN DEFAULT FALSE,
    
    -- Biyomekanik Parametreler
    primary_muscles TEXT[] DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    movement_plane VARCHAR(50), -- Sagittal, Frontal vb.
    equipment TEXT[] DEFAULT '{}',
    
    -- Standart Dozaj (Default Tuning)
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_tempo VARCHAR(20) DEFAULT '3-1-3',
    default_rest_sec INTEGER DEFAULT 60,
    target_rpe INTEGER DEFAULT 5,
    
    -- Metadata
    is_ai_optimized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRESCRIPTIONS (Kişiselleştirilmiş Reçeteler)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Özel Dozaj (Override)
    prescribed_sets INTEGER NOT NULL,
    prescribed_reps INTEGER NOT NULL,
    prescribed_tempo VARCHAR(20),
    rest_period_sec INTEGER DEFAULT 60,
    frequency_daily INTEGER DEFAULT 2,
    
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PROGRESS REPORTS (Seans Geri Bildirimleri)
CREATE TABLE IF NOT EXISTS progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    session_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pain_score_vas INTEGER CHECK (pain_score_vas BETWEEN 0 AND 10),
    completion_rate_percent INTEGER DEFAULT 100,
    patient_feedback TEXT,
    clinical_flags TEXT[] DEFAULT '{}' -- AI tarafından saptanan riskler
);

-- 9. DETAILED PAIN LOGS (Isı Haritası & Analitik)
CREATE TABLE IF NOT EXISTS pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    score INTEGER NOT NULL,
    quality pain_quality NOT NULL,
    location_tag VARCHAR(100) NOT NULL, -- L5-S1, Sağ Diz vb.
    trigger_factors TEXT
);

-- 10. TREATMENT HISTORY (Klinik Kronoloji)
CREATE TABLE IF NOT EXISTS treatment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    procedure_name TEXT NOT NULL,
    clinical_notes TEXT,
    attachments TEXT[] -- Rapor/MR linkleri
);

-- 11. MESSAGING SYSTEM (Klinik İletişim)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. INDEKSLER (Performans Optimizasyonu)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_therapist ON patients(assigned_therapist_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_exercises_code ON exercises(code);
CREATE INDEX idx_reports_patient ON progress_reports(patient_id);
CREATE INDEX idx_messages_flow ON messages(sender_id, receiver_id);

-- 13. AUTO-UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_users_upd BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_patients_upd BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_exercises_upd BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- =============================================================================
-- MASTER SCHEMA v6.0 READY
-- =============================================================================
