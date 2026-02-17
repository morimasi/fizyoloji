
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v10.0 MASTER SCHEMA (PRODUCTION READY)
-- Architect: Fizyolojik AI
-- Stack: PostgreSQL (Vercel/Neon), UUID, JSONB, RLS Ready
-- =============================================================================

-- 1. TEMİZLİK & BAŞLANGIÇ (CLEAN SLATE)
-- Dikkat: Bu komutlar mevcut veriyi siler. Canlı sistemde dikkatli kullanın.
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS clinical_tasks CASCADE;
DROP TABLE IF EXISTS progress_reports CASCADE;
DROP TABLE IF EXISTS pain_logs CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS therapist_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS pain_quality CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS rehab_phase CASCADE;
DROP TYPE IF EXISTS patient_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 2. EKLENTİLER (EXTENSIONS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- UUID üretimi için
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- Şifreleme fonksiyonları için

-- 3. ÖZEL VERİ TİPLERİ (ENUMS)
CREATE TYPE user_role AS ENUM ('Admin', 'Therapist', 'Patient', 'Supervisor');
CREATE TYPE patient_status AS ENUM ('Kritik', 'Akut', 'Stabil', 'İyileşiyor', 'Taburcu', 'Pasif');
CREATE TYPE rehab_phase AS ENUM ('Pre-Op', 'Akut', 'Sub-Akut', 'Kronik', 'Performans');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE pain_quality AS ENUM ('Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme', 'Sızlama');

-- =============================================================================
-- 4. TABLOLAR (TABLES)
-- =============================================================================

-- 4.1. KULLANICI KİMLİK (CORE IDENTITY)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    password_hash TEXT DEFAULT 'auth_provider_managed', -- NextAuth/Clerk kullanıldığı varsayımıyla
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.2. TERAPİST PROFİLLERİ (THERAPIST EXTENSION)
CREATE TABLE therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_no VARCHAR(100),
    specialization TEXT[] DEFAULT '{}', -- Örn: ['Sporcu Sağlığı', 'Nöroloji']
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    total_patients_active INTEGER DEFAULT 0,
    average_recovery_time VARCHAR(50),
    -- AI Asistan Ayarları (JSONB)
    ai_assistant_config JSONB DEFAULT '{
        "autoSuggestProtocols": true,
        "notifyHighRisk": true,
        "weeklyReports": true,
        "aiEmpathyLevel": 85
    }',
    status VARCHAR(20) DEFAULT 'Aktif'
);

-- 4.3. HASTA PROFİLLERİ (PATIENT EXTENSION)
CREATE TABLE patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    current_rehab_phase rehab_phase DEFAULT 'Akut',
    risk_level VARCHAR(20) DEFAULT 'Düşük',
    diagnosis_summary TEXT,
    icd10_code VARCHAR(20),
    
    -- Klinik Veriler (JSONB)
    physical_assessment JSONB DEFAULT '{
        "rom": {}, 
        "strength": {}, 
        "posture": "", 
        "recoveryTrajectory": 70
    }',
    
    -- AI İçgörüleri (Son Analiz)
    latest_ai_insight JSONB DEFAULT '{}',
    
    -- Senkronizasyon Durumu
    sync_status VARCHAR(20) DEFAULT 'Synced',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.4. KLİNİK İÇERİK KÜTÜPHANESİ (EXERCISES - CMS)
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Örn: SP-01
    title VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    difficulty INTEGER DEFAULT 5, -- 1-10
    description TEXT,
    biomechanics_notes TEXT,
    
    -- Flash Engine Varlıkları (JSONB)
    -- { "visual_url": "...", "video_url": "...", "is_motion": true, "layout": "grid-4x4" }
    media_assets JSONB DEFAULT '{}',
    
    is_motion BOOLEAN DEFAULT false,
    visual_style VARCHAR(50) DEFAULT 'Flash-Ultra',
    
    -- Tagging
    equipment TEXT[] DEFAULT '{}',
    primary_muscles TEXT[] DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    safety_flags TEXT[] DEFAULT '{}', -- Kontrendikasyonlar
    
    -- Teknik Veriler
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_tempo VARCHAR(20) DEFAULT '3-1-3',
    default_rest INTEGER DEFAULT 60,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.5. REÇETELER (PRESCRIPTIONS - PROGRAMLAR)
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Terapist ID
    
    -- Kişiselleştirilmiş Dozaj
    sets INTEGER,
    reps INTEGER,
    tempo VARCHAR(20),
    rest_period INTEGER,
    target_rpe INTEGER DEFAULT 5, -- 1-10 Algılanan Zorluk
    frequency VARCHAR(50), -- "Günde 2 kez"
    
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.6. İLERLEME RAPORLARI & LOGLAR
CREATE TABLE progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pain_score INTEGER NOT NULL, -- VAS Skoru
    completion_rate INTEGER DEFAULT 0, -- %0-100
    feedback TEXT,
    clinical_flags TEXT[] DEFAULT '{}' -- ["Red Flag", "High Pain"]
);

CREATE TABLE pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    quality pain_quality DEFAULT 'Künt',
    location_tag VARCHAR(100),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.7. KLİNİK GÖREVLER (WORKFLOW)
CREATE TABLE clinical_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    priority task_priority DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, In-Progress, Completed
    ai_recommendation TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.8. GÜVENLİ MESAJLAŞMA (MESSAGING)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    attachment_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. PERFORMANS İNDEKSLERİ (INDEXES)
-- =============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_therapist ON patients(assigned_therapist_id);
CREATE INDEX idx_exercises_code ON exercises(code);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_progress_patient_date ON progress_reports(patient_id, date);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);
CREATE INDEX idx_tasks_therapist_status ON clinical_tasks(therapist_id, status);

-- =============================================================================
-- 6. OTOMASYON (TRIGGERS)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Tüm ana tablolar için otomatik updated_at tetikleyicisi
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

-- =============================================================================
-- 7. SEED DATA (BAŞLANGIÇ VERİSİ - OPSİYONEL)
-- =============================================================================

-- Demo Admin
INSERT INTO users (full_name, email, role, password_hash)
VALUES ('System Admin', 'admin@physiocore.ai', 'Admin', 'hashed_secret_123')
ON CONFLICT (email) DO NOTHING;

-- Demo Terapist
WITH new_therapist AS (
    INSERT INTO users (full_name, email, role, password_hash)
    VALUES ('Uzm. Fzt. Erdem Arslan', 'erdem@physiocore.ai', 'Therapist', 'hashed_secret_456')
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name 
    RETURNING id
)
INSERT INTO therapist_profiles (user_id, specialization, years_of_experience, bio)
SELECT id, ARRAY['Ortopedik Rehabilitasyon', 'Sporcu Sağlığı'], 12, 'Manuel Terapi ve Klinik Egzersiz Uzmanı.'
FROM new_therapist
ON CONFLICT (user_id) DO NOTHING;

