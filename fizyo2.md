# PHYSIOCORE AI: EVOLUTION ROADMAP (v3.2)
## "Klinik Hassasiyet ve Etkileşimli Rehabilitasyon"

**Analiz Tarihi:** 11 Şubat 2026
**Analist:** PhysioCore Architect & Special Ed. Professor

---

## 1. MEVCUT DURUM ANALİZİ (AUDIT)

Uygulamanın v3.1 sürümü, temel bir "AI Reçete" döngüsü sunmaktadır. Ancak `fizyo.md` içerisinde hedeflenen "Ultra" deneyim için aşağıdaki boşluklar saptanmıştır:

| Modül | Mevcut Durum | Blueprint v3.0 Hedefi | Eksik / Gelişim Alanı |
| :--- | :--- | :--- | :--- |
| **AI Brain** | Temel Mapping | Bölüm 5: Dinamik Dozaj Formülleri | Ağrı/Faz analizi matematiksel değil, metinsel. |
| **Player** | Statik Video Simülasyonu | Bölüm 2: Interaktif 3D/4K Rehberlik | Set/Tekrar takibi kullanıcı etkileşimli değil. |
| **CMS** | Liste Görünümü | Bölüm 7: Sürükle-Bırak Reçete | Egzersiz ekleme/düzenleme formu pasif. |
| **Data** | LocalStorage (Basit) | Bölüm 4: SQL/NoSQL Hibrit Yapı | İlişkisel veri derinliği (ROM/Kas) eksik. |

---

## 2. GELİŞİM PLANI: "GENESIS ADVANCED"

### FAZ 1: KLİNİK MUHAKEME DERİNLEŞTİRME (AI REFINEMENT)
*   **Dozaj Motoru:** Tekrar sayıları `max(5, 15 - painScore)` formülüyle hard-coded kural setlerine bağlanacak.
*   **Biyomekanik Mapping:** Her egzersiz, hastanın patolojisindeki (örn: L5-S1) spesifik kısıtlamalarla eşleşecek.

### FAZ 2: ETKİLEŞİMLİ PLAYER (INTERACTIVE REHAB)
*   **Set/Tekrar Sayacı:** Kullanıcı her seti bitirdiğinde AI'ya canlı veri gönderen bir mekanizma.
*   **Görsel Katmanlar:** "X-Ray" ve "Muscle" görünümleri sadece animasyon değil, o egzersize özel biyomekanik notlarla zenginleştirilecek.

### FAZ 3: VERİ ANALİTİĞİ VE TAKİP (CLINICAL ANALYTICS)
*   **ROM Takibi:** Eklem hareket açıklığı (Range of Motion) verilerinin grafiklere dökülmesi.
*   **Kritik Eşik Uyarıları:** Eğer ağrı skoru 3 seans üst üste artarsa sistemi "Kırmızı Bayrak" moduna alma.

---

## 3. TEKNİK BORÇLAR VE GÜNCELLEMELER
1.  **Types:** `PatientProfile` içine `physicalAssessment` (ROM, Muscle Strength) alanı eklenmeli.
2.  **UI:** `Framer Motion` ile geçişler daha akışkan (Fluid UI) hale getirilmeli.
3.  **Security:** Offline mod için `IndexedDB` geçişi planlanmalı.

---
*Bu döküman, PhysioCore gelişim sürecinde fizyo.md dosyasının yanındaki ikincil stratejik rehberdir.*