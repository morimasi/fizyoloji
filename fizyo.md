# PHYSIOCORE AI: GENESIS MASTER BLUEPRINT (v3.0)
## "The Ultra-Professional Physiotherapy & Rehabilitation Ecosystem"

**Project Architect:** Fizyolojik (AI)
**Role:** Senior Full-Stack Architect & Clinical Director
**Date:** February 11, 2026
**Status:** Enterprise Level / Production Ready
**Context:** This document serves as the absolute "Single Source of Truth" for building the PhysioCore AI platform. All code generation must adhere to these standards.

---

## 1. YÖNETİCİ ÖZETİ VE VİZYON (EXECUTIVE SUMMARY)

**PhysioCore AI**, standart bir egzersiz uygulaması değildir. Fizyoterapistlerin klinik karar verme süreçlerini taklit eden (Clinical Reasoning), hastalara ise **4K/3D Animasyon** kalitesinde görsel rehberlik sunan uçtan uca bir SaaS çözümüdür.

**Temel Felsefe:**
1.  **Kanıta Dayalı Tıp (EBM):** Her egzersiz PubMed/Cochrane verilerine dayanır.
2.  **Hiper-Kişiselleştirme:** "Herkes için tek program" değil, patolojiye ve ağrı eşiğine göre dinamik reçete.
3.  **Microservices Architecture:** Modüler, bağımsız ölçeklenebilir ve çökme korumalı yapı.

---

## 2. TEKNOLOJİ YIĞINI (TECH STACK & RULES)

* **Monorepo Yönetimi:** Turborepo
* **Frontend (Web/Mobile):** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion, Three.js (React-Three-Fiber).
* **Backend Core:** Node.js (NestJS) - TypeORM.
* **AI Engine:** Python (FastAPI) - PyTorch / LangChain / NumPy.
* **Database:**
    * *Relational:* PostgreSQL (Kullanıcı, Reçete, Klinik Veri).
    * *NoSQL:* MongoDB (Loglar, Analitik).
    * *Cache:* Redis (Session, Hot Data).
* **DevOps:** Docker Compose, Kubernetes, GitHub Actions (CI/CD).
* **Auth:** NextAuth.js (JWT & OAuth2).

---

## 3. DOSYA VE KLASÖR YAPISI (DIRECTORY TREE)

Bu yapı fiziksel dosya sistemidir. Geliştirme sürecinde bu hiyerarşiye sadık kalınacaktır.

```text
PhysioCore-Monorepo/
├── 📂 apps/                                # ÖN YÜZ UYGULAMALARI
│   ├── 📂 web-patient/                     # HASTA PORTALI (Next.js)
│   │   ├── 📂 app/
│   │   │   ├── 📂 dashboard/               # Ana Ekran
│   │   │   ├── 📂 player/[exerciseId]/     # Ultra Egzersiz Oynatıcısı
│   │   │   └── 📂 profile/                 # İlerleme ve Ayarlar
│   │   ├── 📂 components/
│   │   │   ├── 📂 3d/                      # Three.js Modelleri (Human Avatar)
│   │   │   ├── 📂 player-ui/               # Video Kontrolleri, Açı Seçici
│   │   │   └── 📂 charts/                  # İyileşme Grafikleri
│   │   └── 📂 lib/                         # API Client & Utils
│   │
│   └── 📂 web-admin/                       # TERAPİST & YÖNETİCİ PANELİ (Next.js)
│       ├── 📂 app/
│       │   ├── 📂 cms/                     # Egzersiz Ekleme/Düzenleme
│       │   ├── 📂 patients/                # Hasta Takibi ve Atama
│       │   └── 📂 analytics/               # Klinik Veri Analizi
│       └── 📂 components/
│           └── 📂 exercise-builder/        # Sürükle-Bırak Reçete Oluşturucu
│
├── 📂 services/                            # BACKEND MİKROSERVİSLERİ
│   ├── 📂 core-api/                        # (Node.js/NestJS) - Kullanıcı & İçerik
│   │   ├── 📂 src/
│   │   │   ├── 📂 modules/
│   │   │   │   ├── 📂 auth/                # Kimlik Doğrulama
│   │   │   │   ├── 📂 exercises/           # CRUD İşlemleri
│   │   │   │   └── 📂 prescriptions/       # Reçete Yönetimi
│   │   │   └── 📂 entities/                # TypeORM Modelleri (SQL)
│   │
│   ├── 📂 ai-brain/                        # (Python/FastAPI) - Karar Destek Sistemi
│   │   ├── 📂 app/
│   │   │   ├── 📂 algorithms/              # Karar Ağaçları (Decision Trees)
│   │   │   ├── 📂 inference/               # Model Tahminleri
│   │   │   └── 📂 vision/                  # OpenCV/MediaPipe (Hareket Analizi)
│   │   └── 📂 models/                      # Eğitilmiş .pt dosyaları
│   │
│   └── 📂 media-server/                    # (Go/Node) - Video Streaming & Processing
│
├── 📂 packages/                            # ORTAK KÜTÜPHANELER (Shared)
│   ├── 📂 ui/                              # Ortak UI Kit (Button, Card, Input)
│   ├── 📂 database/                        # Prisma/TypeORM Ortak Şemaları
│   └── 📂 types/                           # TypeScript Interface'leri (DTOs)
│
└── 📂 infrastructure/                      # DEVOPS
    ├── docker-compose.yml                  # Tüm sistemi tek komutla kaldırma
    ├── 📂 k8s/                             # Kubernetes Deployment dosyaları
    └── 📂 scripts/                         # Seed Data

4. VERİTABANI MÜHENDİSLİĞİ (SQL SCHEMA)

-- 1. HASTALAR (PATIENTS)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    password_hash VARCHAR(255),
    
    -- Klinik Profil (AI Okuyacak)
    clinical_profile JSONB DEFAULT '{
        "diagnosis_codes": [],   -- ["M51.1"]
        "contraindications": [], -- ["Acute Fracture"]
        "pain_score_vas": 5,     -- 1-10
        "rom_limitations": []    -- ["Lumbar Flexion"]
    }',
    
    settings JSONB DEFAULT '{"theme": "dark", "language": "tr"}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. EGZERSİZLER (EXERCISES)
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Kategorizasyon
    category_main VARCHAR(100),    -- "Spine"
    category_sub VARCHAR(100),     -- "Lumbar"
    difficulty INTEGER,            -- 1-10
    
    -- Medya Varlıkları
    media_assets JSONB DEFAULT '{
        "video_4k": null,
        "animation_3d": null,
        "thumbnail": null
    }',

    -- Biyomekanik Veri (AI Karar Motoru İçin)
    biomechanics JSONB DEFAULT '{
        "primary_muscles": [],    -- ["Multifidus"]
        "movement_plane": null,   -- "Sagittal"
        "type": "Extension_Bias"  -- "Flexion_Bias" vs.
    }',

    -- Güvenlik Bayrakları
    safety_flags JSONB DEFAULT '{
        "forbidden_conditions": ["Spondylolisthesis"],
        "caution_notes": "Stop if radiating pain occurs."
    }'
);

-- 3. REÇETELER (PRESCRIPTIONS)
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    therapist_id UUID, -- NULL ise AI oluşturmuştur
    start_date DATE,
    end_date DATE,
    
    -- Günlük Program
    routine JSONB, -- { "morning": [{"ex_id": "...", "sets": 3}], "evening": [...] }
    
    status VARCHAR(50) DEFAULT 'Active'
);



5. YAPAY ZEKA MANTIĞI (THE AI BRAIN)
ai-brain servisinde çalışacak olan Python sınıf yapısı ve algoritmik mantık.

class PhysioBrain_AI:
    def __init__(self, database):
        self.db = database

    # ANA FONKSİYON: GÜNLÜK PLAN OLUŞTURUCU
    def generate_daily_plan(self, patient_profile):
        
        # 1. GÜVENLİK FİLTRESİ (Safety Filter)
        safe_exercises = []
        for ex in self.db.all_exercises:
            # Örn: Hasta "Fıtık" ise, "Öne Eğilme" (Flexion) içerenleri ele.
            if not self.check_contraindications(patient_profile, ex):
                safe_exercises.append(ex)

        # 2. AĞRI VE FAZ ANALİZİ (Pain & Phase Adaptation)
        targeted_exercises = []
        for ex in safe_exercises:
            if patient_profile['pain_score'] > 7:
                # Yüksek ağrıda sadece İzometrik/Statik egzersizler
                if ex.type in ["Isometric", "Relaxation"]:
                    targeted_exercises.append(ex)
            else:
                # Düşük ağrıda Güçlendirme/Mobilizasyon
                targeted_exercises.append(ex)

        # 3. DOZAJ HESAPLAMA (Dosage Calculation)
        prescription = []
        for ex in targeted_exercises:
            reps = max(5, 15 - patient_profile['pain_score']) # Ağrı arttıkça tekrar azalır
            sets = 3
            prescription.append({
                "exercise_id": ex.id,
                "sets": sets,
                "reps": int(reps)
            })
        
        return prescription

    def check_contraindications(self, patient, exercise):
        # KURAL: Disk Hernisi varsa Fleksiyon Yasak.
        if "Herniation" in patient['diagnosis'] and "Flexion" in exercise.biomechanics:
            return False
        return True




6. UI/UX TASARIM SİSTEMİ (VISUAL IDENTITY)

Konsept: "Clinical Precision". Güven veren, temiz ve teknolojik.

Renk Paleti
Deep Neuro Blue (#0F172A): Ana Arka Plan (Dark Mode).

Kinetic Teal (#06B6D4): Ana Aksiyonlar (Butonlar, Linkler).

Muscle Fiber Red (#EF4444): Hata, Uyarı, Ağrı Bölgesi.

Vitality White (#F8FAFC): Metinler ve Kartlar.

Typography
Headings: Inter (Bold, Modern).

Body: Roboto (Okunabilirlik odaklı).

Data/Numbers: JetBrains Mono.

7. STRATEJİK GELİŞTİRME YOL HARİTASI (ROADMAP)
Sistem aşağıdaki sıra ile inşa edilecektir. Her faz bir öncekine bağımlıdır.

FAZ 0: MİMARİ İSKELET (INFRASTRUCTURE)
Hedef: Docker, K8s ve Veritabanı bağlantılarını kurmak.

Aksiyon: docker-compose.yml dosyasını oluştur. PostgreSQL ve Redis servislerini ayağa kaldır. NestJS ve Next.js projelerini init et.

FAZ 1: İÇERİK YÖNETİMİ (CMS - GOD MODE)
Hedef: Yönetici panelinden tam kapsamlı egzersiz yönetimi.

Aksiyon:

Egzersiz Ekle/Sil/Düzenle (CRUD) API'lerini yaz.

Video ve 3D model yükleme (File Upload) sistemini kur.

Kategorilendirme (Omurga -> Bel -> Fıtık) ağacını oluştur.

FAZ 2: HASTA ARAYÜZÜ (MVP & PLAYER)
Hedef: Son kullanıcının etkileşime girdiği ekranlar.

Aksiyon:

Ultra Player: Video oynatıcıyı kodla. (Hız kontrolü, Açı değiştirme butonu).

İndirme Modülü: Videoları şifreli olarak önbelleğe alma (Offline Mode).

Yazdırma Modülü: Seçilen programı PDF formatında, QR kodlu olarak çıktı alma.

Kaydetme: "Favorilerim" listesi oluşturma.

FAZ 3: AI ENTEGRASYONU (THE BRAIN)
Hedef: Otomatik reçete oluşturma.

Aksiyon: Python servisini (ai-brain) yaz. Kural motorunu (Rule Engine) devreye al. Hastanın girdiği verilere göre dinamik program çıktısı üret.

8. İÇERİK KÜTÜPHANESİ: "ULTRA" SENARYOLAR
Animasyon ve Egzersiz ekibine verilecek örnek senaryolar.

Kategori: Omurga (Spine)
McKenzie Prone Press-up: Yüzüstü, L4-L5 diski yarı saydam zoom ile gösterilir. Disk sıvısının merkeze dönüşü (centralization) mavi akışla simüle edilir.

Dead Bug: Sırtüstü, karın kasları (Transversus) korse gibi beli sarar ve Neon Yeşil yanar.

Bird-Dog: Dört ayak, denge bozulursa vücut merkezinden geçen lazer terazi kırmızıya döner.

Chin Tuck: Boyun arkası kasların (Suboccipitals) uzaması yaylanma efektiyle gösterilir.

Cat-Camel: Omurga segmentleri piyano tuşu gibi tek tek renk değiştirerek hareket eder.

Kategori: Alt Ekstremite (Lower Limb)
Terminal Knee Extension (TKE): Diz kilitlendiği an Vastus Medialis kası elektrik efektiyle parlar.

Heel Slide: Diz eklemi içindeki sıvının kıkırdakları beslemesi su dalgası efektiyle gösterilir.

Clam Shell: Kalça açısı (derece cinsinden) canlı olarak ekrana yansır.

Single Leg Balance: Ayak bileği bağlarının denge için yaptığı mikro hareketler radar sinyalleri gibi gösterilir.

Squat Analysis: Diz kapağı parmak ucunu geçerse zemin grafiği "Riskli Bölge" olarak kırmızı yanar.

Kategori: Üst Ekstremite (Upper Limb)
Pendulum: Omuz eklem aralığının yerçekimi ile açılması (distraksiyon) zoom ile gösterilir.

External Rotation: Rotator manşet kaslarının gerilim kuvveti oklarla (vektörel) gösterilir.

Serratus Punch: Kürek kemiğinin göğüs kafesine yapışması mıknatıs efektiyle anlatılır.

Wrist Extensor Stretch: Tendon liflerinin uzaması mikroskobik lif animasyonu ile gösterilir.

Y-T-W-L Series: Hangi harfte hangi sırt kasının çalıştığı renk kodlarıyla (Mavi/Sarı/Yeşil) ayrıştırılır.

END OF MASTER BLUEPRINT
