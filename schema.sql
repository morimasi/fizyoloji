
-- =============================================================================
-- PHYSIOCORE AI - GENESIS v12.0 MASTER SCHEMA (FULL STACK PRODUCTION)
-- Architect: Fizyolojik AI
-- Context: PostgreSQL (Neon/Vercel) + TypeScript Strict Mapping
-- =============================================================================

-- [1] TEMİZLİK & BAŞLANGIÇ (HARD RESET)
-- Mevcut tüm tabloları ve tipleri temizler.
DROP TRIGGER IF EXISTS update_timestamp ON users;
DROP FUNCTION IF EXISTS update_timestamp;

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

-- [2] EKLENTİLER (EXTENSIONS)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- UUID v4 üretimi için
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- Şifreleme (Gerekirse)

-- [3] ENUM TİPLERİ (TYPES.TS ILE UYUMLU)
CREATE TYPE user_role AS ENUM ('Admin', 'Therapist', 'Patient', 'Supervisor');
CREATE TYPE patient_status AS ENUM ('Kritik', 'Akut', 'Stabil', 'İyileşiyor', 'Taburcu', 'Pasif');
CREATE TYPE rehab_phase AS ENUM ('Pre-Op', 'Akut', 'Sub-Akut', 'Kronik', 'Performans');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE pain_quality AS ENUM ('Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme', 'Sızlama');

-- =============================================================================
-- [4] TABLOLAR (TABLES)
-- =============================================================================

-- 4.1. KULLANICILAR (USERS)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    password_hash TEXT, -- Auth provider yoksa manuel giriş için
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.2. TERAPİST PROFİLLERİ (THERAPIST PROFILES)
CREATE TABLE therapist_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_no VARCHAR(100),
    specialization TEXT[] DEFAULT '{}', -- ['Sporcu Sağlığı', 'Manuel Terapi']
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    success_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    total_patients_active INTEGER DEFAULT 0,
    average_recovery_time VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Aktif',
    
    -- AI Config (JSONB): { autoSuggestProtocols: true, notifyHighRisk: true, ... }
    ai_assistant_config JSONB DEFAULT '{}'::jsonb
);

-- 4.3. HASTA PROFİLLERİ (PATIENT PROFILES)
CREATE TABLE patients (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    assigned_therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status patient_status DEFAULT 'Stabil',
    current_rehab_phase rehab_phase DEFAULT 'Akut',
    risk_level VARCHAR(20) DEFAULT 'Düşük',
    diagnosis_summary TEXT,
    icd10_code VARCHAR(20),
    
    -- Fiziksel Değerlendirme (ROM, Postür vb.)
    physical_assessment JSONB DEFAULT '{
        "rom": {}, 
        "strength": {}, 
        "posture": "", 
        "recoveryTrajectory": 70
    }'::jsonb,
    
    -- AI Son Analiz Çıktısı
    latest_ai_insight JSONB DEFAULT '{}'::jsonb,
    
    sync_status VARCHAR(20) DEFAULT 'Synced',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.4. EGZERSİZ KÜTÜPHANESİ (EXERCISES - CMS)
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Örn: SP-01 (Seed Data Eşleşmesi İçin Kritik)
    title VARCHAR(255) NOT NULL,
    title_tr VARCHAR(255),
    category VARCHAR(100) NOT NULL, -- 'Spine', 'Lower Limb' vb.
    difficulty INTEGER DEFAULT 5, -- 1-10
    
    description TEXT,
    biomechanics_notes TEXT,
    
    -- Görsel Varlıklar ve Metadata (JSONB)
    -- { "visual_url": "...", "video_url": "...", "is_motion": true, "layout": "grid-4x4", "target_rpe": 5 }
    media_assets JSONB DEFAULT '{}'::jsonb,
    
    is_motion BOOLEAN DEFAULT false,
    visual_style VARCHAR(50) DEFAULT 'Flash-Ultra',
    
    -- Etiketleme (Arrays)
    equipment TEXT[] DEFAULT '{}',
    primary_muscles TEXT[] DEFAULT '{}',
    secondary_muscles TEXT[] DEFAULT '{}',
    safety_flags TEXT[] DEFAULT '{}', -- Kontrendikasyonlar
    
    -- Varsayılan Dozaj
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_tempo VARCHAR(20) DEFAULT '3-1-3',
    default_rest INTEGER DEFAULT 60,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.5. REÇETELER (PRESCRIPTIONS)
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Kişiselleştirilmiş Dozaj (Varsayılanı ezer)
    sets INTEGER,
    reps INTEGER,
    tempo VARCHAR(20),
    rest_period INTEGER,
    target_rpe INTEGER DEFAULT 5,
    frequency VARCHAR(100), -- "Günde 2 kez"
    
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.6. İLERLEME VE LOGLAR (PROGRESS)
CREATE TABLE progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pain_score INTEGER NOT NULL, -- VAS 0-10
    completion_rate INTEGER DEFAULT 0, -- %
    feedback TEXT,
    clinical_flags TEXT[] DEFAULT '{}'
);

CREATE TABLE pain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    quality pain_quality DEFAULT 'Künt',
    location_tag VARCHAR(100),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.7. KLİNİK GÖREVLER (TASKS)
CREATE TABLE clinical_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    priority task_priority DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    
    -- İlişkiler
    therapist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    ai_recommendation TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.8. MESAJLAŞMA (MESSAGING)
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
-- [5] İNDEKSLER (PERFORMANCE TUNING)
-- =============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_exercises_code ON exercises(code); -- Seed data upsert hızı için kritik
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_progress_patient_date ON progress_reports(patient_id, date);
CREATE INDEX idx_clinical_tasks_therapist ON clinical_tasks(therapist_id);

-- =============================================================================
-- [6] OTOMASYON (TRIGGERS)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_func()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_users_upd BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_func();
CREATE TRIGGER trg_patients_upd BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_timestamp_func();
CREATE TRIGGER trg_exercises_upd BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE PROCEDURE update_timestamp_func();
CREATE TRIGGER trg_tasks_upd BEFORE UPDATE ON clinical_tasks FOR EACH ROW EXECUTE PROCEDURE update_timestamp_func();

-- =============================================================================
-- [7] SEED DATA (INITIAL ADMIN & THERAPIST)
-- =============================================================================

-- Root Admin
INSERT INTO users (full_name, email, role, password_hash)
VALUES ('System Admin', 'admin@physiocore.ai', 'Admin', 'secure_hash_x99')
ON CONFLICT (email) DO NOTHING;

-- Demo Terapist
WITH new_therapist AS (
    INSERT INTO users (full_name, email, role)
    VALUES ('Uzm. Fzt. Erdem Arslan', 'erdem@physiocore.ai', 'Therapist')
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id
)
INSERT INTO therapist_profiles (user_id, specialization, years_of_experience, bio, total_patients_active)
SELECT id, ARRAY['Ortopedik Rehabilitasyon', 'Sporcu Sağlığı'], 12, 'Manuel Terapi ve Klinik Egzersiz Uzmanı.', 28
FROM new_therapist
ON CONFLICT (user_id) DO NOTHING;

