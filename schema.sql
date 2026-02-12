
-- PhysioCore AI - Genesis v3.5 Database Schema
-- Location: Neon PostgreSQL (eu-central-1)

-- 1. Uzantıları Etkinleştir (UUID ve JSONB işlemleri için)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Hasta Tablosu (Neon Optimized)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    clinical_profile JSONB DEFAULT '{
        "diagnosis_summary": "",
        "risk_level": "Orta",
        "treatment_history": [],
        "pain_logs": []
    }',
    progress_history JSONB DEFAULT '[]',
    suggested_plan JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Egzersiz Kütüphanesi
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_tr VARCHAR(200),
    category VARCHAR(100),
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 10),
    sets INTEGER,
    reps INTEGER,
    description TEXT,
    biomechanics TEXT,
    safety_flags JSONB DEFAULT '[]',
    visual_url TEXT,
    video_url TEXT,
    is_motion BOOLEAN DEFAULT FALSE,
    rehab_phase VARCHAR(50),
    muscle_groups JSONB DEFAULT '[]',
    equipment JSONB DEFAULT '[]'
);

-- 4. Senkronizasyon Logları (Analitik için)
CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    sync_type VARCHAR(50), -- 'PLAN_UPDATE', 'PAIN_LOG', 'SESSION_COMPLETE'
    status VARCHAR(20), -- 'SUCCESS', 'FAILED'
    latency_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: Updated_at kolonunu otomatik güncelle
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_modtime BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
