
# GENESIS MOTION ENGINE v8.0: MASTER DEVELOPMENT BLUEPRINT
## "From Clinical Sprite to Cinematic Reality"

**Architect:** PhysioCore Chief Architect
**Target:** Ultra-Fluid, Flicker-Free, Multi-Format 3D Animation Engine
**Status:** Phase 3 Initialization

---

## 🧭 VİZYON ÖZETİ
Mevcut animasyon motorunu, "Fizyoterapi Çizgi Filmi" seviyesinden Hollywood standartlarında **"Klinik Sinematik Deneyim"** seviyesine yükseltmek. Titreme (Jitter), kayma (Drift) ve robotik geçişler yok edilecek; yerine **akışkan (Fluid)**, **stabil (Locked)** ve **çok formatlı (Universal Export)** bir yapı kurulacak.

---

## 🛠️ FAZ 1: "STEADY-CAM" GÖRSEL STABİLİZASYON PROTOKOLÜ (AI & PROMPT)
**DURUM: ✅ TAMAMLANDI**
*   **Teknoloji:** `Grid-Lock Prompting` & `Orthographic Projection`.
*   **Aksiyonlar:**
    1.  **AI Prompt Mimarisi:** `visual-engine/prompts.ts` dosyasının yeniden yazımı.
    2.  **Tripod Mode:** Kameranın milim oynamamasını sağlayan "Absolute Coordinate" komutları.
    3.  **Negative Prompting:** "Morphing, blurring, jitter, camera move" terimlerinin agresif kullanımı.
    4.  **5x5 Grid (Opsiyonel):** 25 karelik ultra akıcı kaynak desteği.

## 🌊 FAZ 2: "FLUID-FLOW" RENDER MOTORU (FRONTEND)
**DURUM: ✅ TAMAMLANDI**
*   **Teknoloji:** `Canvas Blending` & `Smart-Crop Algorithm`.
*   **Aksiyonlar:**
    1.  **Smart-Crop (Otomatik Hizalama):** Frontend, gelen görseli piksel bazında tarayıp karakterin ağırlık merkezini bulacak ve her kareyi milimetrik olarak yeniden ortalayacak. (Titremeyi %100 bitirir).
    2.  **Motion Blur & Blending:** Kare geçişlerinde `globalAlpha` manipülasyonu ile "Hayalet Kare" (Ghost Frame) tekniği.
    3.  **Ping-Pong Loop:** Videonun başa sararken robotik durmasını engelleyen, ileri-geri yumuşak döngü algoritması.

## 💾 FAZ 3: "UNIVERSAL MEDIA FORGE" (İNDİRME & DÖNÜŞTÜRME)
**DURUM: ⏳ BEKLEMEDE (SIRADAKİ)**
**Hedef:** Tarayıcı içinde çalışan, sunucusuz bir video işleme stüdyosu.
*   **Teknoloji:** `MediaRecorder API` & `Blob Container Manipulation`.
*   **Format Desteği:**
    *   **MP4 (H.264):** Standart video (WhatsApp/Instagram uyumlu).
    *   **GIF (High-Res):** Sonsuz döngü.
    *   **MOV (QuickTime):** Apple ekosistemi.
    *   **AVI:** Legacy sistemler.
    *   **SWF (Simülasyon):** SWF kapsüllü HTML5 veya Self-Playing WebM.
    *   **PPT (PowerPoint):** Gömülü veri paketi.

## 🎮 FAZ 4: "CINEMA MODE" UI/UX (ARAYÜZ)
**Hedef:** Kullanıcının kendini bir video düzenleme masasında hissetmesi.
*   **Görsel:** "Deep Space Black" arka plan, timeline çubuğu, kare kare ilerleme.
*   **Hız Kontrolü:** 0.25x (Süper Ağır Çekim) ile 2.0x arası kayıpsız hız ayarı.

---

## 🚦 UYGULAMA TAKVİMİ

1.  **FAZ 1 ONAYI:** Prompt mühendisliği güncellemesi. ✅
2.  **FAZ 2 KODLAMASI:** `LiveSpritePlayer.tsx` motorunun baştan yazılması. ✅
3.  **FAZ 3 ENTEGRASYONU:** `MediaConverter.ts` modülünün yazılması.
4.  **FAZ 4 CİLALAMA:** UI güncellemeleri.

**[AWAITING COMMAND FOR PHASE 3 EXECUTION]**
