
import { Exercise } from './types.ts';

/**
 * PhysioCore AI - Clinical Seed Library v3.7 (Master Edition)
 * Bu veriler, klinik karar destek sisteminin (CDS) omurgasını oluşturur.
 * Toplam: 70 Klinik Protokol (7 Kategori x 10 Egzersiz)
 */
export const SEED_EXERCISES: Exercise[] = [
  // --- CATEGORY 1: SPINE (LUMBAR & CERVICAL) ---
  {
    id: 'sp-001', code: 'SP-LUM-01', title: 'McKenzie Prone Press-up', titleTr: 'McKenzie Yüzüstü Doğrulma',
    category: 'Spine', difficulty: 3, sets: 3, reps: 10, restPeriod: 60, visualStyle: 'Cinematic-Motion',
    description: 'Yüzüstü yatın. Ellerinizi omuz hizasında yerleştirin. Kalçanızı yerden ayırmadan kollarınızla gövdenizi yukarı doğru itin.',
    biomechanics: 'L4-L5 segmentinde distraksiyon sağlar. Disk materyalinin santralizasyonunu destekler.',
    safetyFlags: ['Spondylolisthesis', 'Akut Fraktür'], equipment: ['Mat'], primaryMuscles: ['Erector Spinae'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '2-2-2', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-002', code: 'SP-LUM-02', title: 'Bird-Dog Stability', titleTr: 'Çapraz Kol-Bacak Uzatma',
    category: 'Spine', difficulty: 5, sets: 3, reps: 12, restPeriod: 45, visualStyle: 'X-Ray',
    description: 'Dört ayak üzerinde durun. Aynı anda sağ kolunuzu ileri, sol bacağınızı geriye doğru uzatın.',
    biomechanics: 'Lumbar multifidus aktivasyonu ve core stabilitesi sağlar.',
    safetyFlags: ['Denge Kaybı'], equipment: ['Mat'], primaryMuscles: ['Core', 'Multifidus'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Transverse', tempo: '3-1-3', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-003', code: 'SP-LUM-03', title: 'Pelvic Tilts', titleTr: 'Pelvik Tilt (Pelvis Eğme)',
    category: 'Spine', difficulty: 2, sets: 3, reps: 15, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Sırtüstü yatın, dizleri bükün. Bel çukurunu yere bastırarak karın kaslarını sıkın ve bırakın.',
    biomechanics: 'Lumbar mobilizasyon ve derin karın kası farkındalığı.',
    safetyFlags: ['Şiddetli Akut Ağrı'], equipment: ['Mat'], primaryMuscles: ['Abs', 'Pelvic Floor'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '2-0-2', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-004', code: 'SP-CER-01', title: 'Cervical Chin Tuck', titleTr: 'Boyun Geri Çekme (Çift Çene)',
    category: 'Spine', difficulty: 2, sets: 3, reps: 10, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Dik oturun. Başınızı öne eğmeden geriye doğru çekerek çift çene yapın.',
    biomechanics: 'Derin boyun fleksörlerini (Longus Colli) aktive eder, başın öne eğilmesini düzeltir.',
    safetyFlags: ['Baş Dönmesi'], equipment: ['Yok'], primaryMuscles: ['Cervical Flexors'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '5-2-5', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-005', code: 'SP-THO-01', title: 'Thoracic Extension (Foam Roller)', titleTr: 'Sırt Ekstansiyonu (Silindir)',
    category: 'Spine', difficulty: 4, sets: 2, reps: 10, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Foam rollerı sırtınızın altına koyun. Ellerinizi başınızın arkasına alıp geriye doğru esneyin.',
    biomechanics: 'Torakal omurga mobilitesini artırır, kifozu (kamburluğu) azaltır.',
    safetyFlags: ['Osteoporoz', 'Kaburga Kırığı'], equipment: ['Foam Roller'], primaryMuscles: ['Thoracic Spine'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: '5-5-5', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-006', code: 'SP-LUM-04', title: 'Dead Bug Core Support', titleTr: 'Dead Bug Karın Kontrolü',
    category: 'Spine', difficulty: 4, sets: 3, reps: 10, restPeriod: 45, visualStyle: 'X-Ray',
    description: 'Sırtüstü yatın, bacaklar masa pozisyonunda. Belinizi yerden ayırmadan çapraz kol-bacağı açın.',
    biomechanics: 'Lumbopelvik stabiliteyi (Dead Bug) geliştirir, alt karın aktivasyonu sağlar.',
    safetyFlags: ['Bel Boşluğu Kontrol Kaybı'], equipment: ['Mat'], primaryMuscles: ['Transversus Abdominis'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Frontal', tempo: '3-0-3', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-007', code: 'SP-LUM-05', title: 'Child’s Pose Stretch', titleTr: 'Çocuk Pozisyonu Esneme',
    category: 'Spine', difficulty: 1, sets: 3, reps: 30, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Diz çökün, topuklarınıza oturun and kollarınızı ileri uzatarak alnınızı yere koyun.',
    biomechanics: 'Lumbar paravertebral kaslarda pasif germe ve dekompresyon.',
    safetyFlags: ['Diz Yaralanması'], equipment: ['Mat'], primaryMuscles: ['Paraspinals'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Static', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-008', code: 'SP-CER-02', title: 'Levator Scapulae Stretch', titleTr: 'Omuz-Boyun Esnetme',
    category: 'Spine', difficulty: 2, sets: 3, reps: 3, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Dik oturun. Başınızı 45 derece yana çevirip koltuk altınıza bakacakmış gibi öne eğin.',
    biomechanics: 'Levator Scapulae kasındaki gerginliği azaltarak boyun ağrısını hafifletir.',
    safetyFlags: ['Sinir Sıkışması Bulguları'], equipment: ['Sandalye'], primaryMuscles: ['Levator Scapulae'],
    rehabPhase: 'Akut', movementPlane: 'Oblique', tempo: '30s Hold', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-009', code: 'SP-LUM-06', title: 'Cat-Camel Mobilization', titleTr: 'Kedi-Deve Egzersizi',
    category: 'Spine', difficulty: 2, sets: 3, reps: 10, restPeriod: 30, visualStyle: '4K-Render',
    description: 'Dört ayak üzerinde durun. Sırtınızı yukarı kamburlaştırın, sonra aşağı doğru çukurlaştırın.',
    biomechanics: 'Tüm omurga segmentlerinde segmental mobilizasyon sağlar.',
    safetyFlags: ['Akut Disk Hernisi (Sınırlı Hareket)'], equipment: ['Mat'], primaryMuscles: ['Spinal Column'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '4-0-4', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'sp-010', code: 'SP-LUM-07', title: 'Cobra Stretch', titleTr: 'Kobra Esnemesi',
    category: 'Spine', difficulty: 3, sets: 3, reps: 10, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Yüzüstü yatın. Ellerinizi omuzlarınızın altına koyun ve göğsünüzü yukarı kaldırın.',
    biomechanics: 'Karın kaslarını gerer ve lumbar ekstansiyonu teşvik eder.',
    safetyFlags: ['Stenoz'], equipment: ['Mat'], primaryMuscles: ['Rectus Abdominis'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: '3-2-3', secondaryMuscles: [], isMotion: true
  },

  // --- CATEGORY 2: LOWER LIMB (HIP & KNEE) ---
  {
    id: 'll-001', code: 'LL-KNE-01', title: 'Terminal Knee Extension (TKE)', titleTr: 'Terminal Diz Ekstansiyonu',
    category: 'Lower Limb', difficulty: 3, sets: 3, reps: 15, restPeriod: 30, visualStyle: '4K-Render',
    description: 'Direnç bandını diz arkasına takın. Bandın direncine karşı dizinizi tam düz hale getirin.',
    biomechanics: 'Vastus Medialis Obliquus (VMO) aktivasyonu sağlar.',
    safetyFlags: ['Diz Kapağı Çıkığı'], equipment: ['Direnç Bandı'], primaryMuscles: ['VMO', 'Quads'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: '1-2-1', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-002', code: 'LL-HIP-01', title: 'Clamshells', titleTr: 'İstiridye Egzersizi',
    category: 'Lower Limb', difficulty: 4, sets: 3, reps: 12, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Yan yatın, dizler bükülü. Üstteki dizinizi ayakları ayırmadan yukarı doğru açın.',
    biomechanics: 'Gluteus Medius aktivasyonu ile kalça stabilitesi sağlar.',
    safetyFlags: ['Bursit'], equipment: ['Yok'], primaryMuscles: ['Gluteus Medius'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Frontal', tempo: '2-1-2', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-003', code: 'LL-KNE-02', title: 'Wall Squat (Static)', titleTr: 'Duvarda Squat (Statik)',
    category: 'Lower Limb', difficulty: 5, sets: 3, reps: 45, restPeriod: 60, visualStyle: 'X-Ray',
    description: 'Sırtınızı duvara yaslayın. Dizleriniz 90 derece bükülene kadar aşağı kayın ve bekleyin.',
    biomechanics: 'İzometrik quadriceps kuvveti ve eklem stabilitesi.',
    safetyFlags: ['Patellofemoral Ağrı'], equipment: ['Duvar'], primaryMuscles: ['Quadriceps', 'Glutes'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: 'Static', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-004', code: 'LL-ANK-01', title: 'Standing Calf Raise', titleTr: 'Parmak Ucunda Yükselme',
    category: 'Lower Limb', difficulty: 3, sets: 3, reps: 15, restPeriod: 45, visualStyle: 'Schematic',
    description: 'Bir basamakta veya düz zeminde ayak parmak uçlarınızda yükselin ve yavaşça inin.',
    biomechanics: 'Gastrocnemius ve Soleus kuvveti, ayak bileği stabilitesi.',
    safetyFlags: ['Aşil Tendiniti (Akut)'], equipment: ['Yok'], primaryMuscles: ['Calves'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: '1-1-2', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-005', code: 'LL-HIP-02', title: 'Bridges', titleTr: 'Köprü Kurma',
    category: 'Lower Limb', difficulty: 4, sets: 3, reps: 12, restPeriod: 45, visualStyle: '4K-Render',
    description: 'Sırtüstü yatın, dizler bükülü. Kalçanızı yerden kaldırarak düz bir çizgi oluşturun.',
    biomechanics: 'Gluteal zinciri ve hamstring kaslarını aktive eder.',
    safetyFlags: ['Lumbar Hiper-Ekstansiyon'], equipment: ['Mat'], primaryMuscles: ['Glutes', 'Hamstrings'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '2-2-2', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-006', code: 'LL-KNE-03', title: 'Straight Leg Raise (SLR)', titleTr: 'Düz Bacak Kaldırma',
    category: 'Lower Limb', difficulty: 3, sets: 3, reps: 10, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Sırtüstü yatın. Bir bacağınızı düz tutarak 45 derece yukarı kaldırın ve bekleyin.',
    biomechanics: 'Eklem yükü bindirmeden Quadriceps kuvvetlendirme.',
    safetyFlags: ['Bel Ağrısı (Eğer bacak ağır gelirse)'], equipment: ['Yok'], primaryMuscles: ['Quadriceps'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '2-2-2', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-007', code: 'LL-HIP-03', title: 'Lateral Band Walk', titleTr: 'Bantla Yana Yürüyüş',
    category: 'Lower Limb', difficulty: 6, sets: 3, reps: 10, restPeriod: 60, visualStyle: 'X-Ray',
    description: 'Dizlerinizin üzerine direnç bandı takın. Hafif çömelerek yana doğru adımlar atın.',
    biomechanics: 'Dinamik kalça stabilitesi ve abduktor kuvveti.',
    safetyFlags: ['Diz Valgus Riski'], equipment: ['Direnç Bandı'], primaryMuscles: ['Gluteus Medius'],
    rehabPhase: 'Kronik', movementPlane: 'Frontal', tempo: 'Step', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-008', code: 'LL-KNE-04', title: 'Heel Slides', titleTr: 'Topuk Kaydırma',
    category: 'Lower Limb', difficulty: 2, sets: 3, reps: 15, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Sırtüstü yatın. Topuğunuzu yerden ayırmadan dizinizi bükerek kendinize çekin.',
    biomechanics: 'Diz ekleminde ROM (Hareket Açıklığı) kazanımı sağlar.',
    safetyFlags: ['Post-Op Sınırlamalar'], equipment: ['Havlu'], primaryMuscles: ['Hamstrings'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '2-0-2', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-009', code: 'LL-ANK-02', title: 'Ankle Alphabet', titleTr: 'Bilekle Alfabe Yazma',
    category: 'Lower Limb', difficulty: 1, sets: 2, reps: 1, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Ayağınız boşluktayken, ayak baş parmağınızla havaya alfabenin harflerini yazın.',
    biomechanics: 'Ayak bileğinin tüm düzlemlerde mobilizasyonu.',
    safetyFlags: ['Şiddetli Ödem'], equipment: ['Yok'], primaryMuscles: ['Ankle Stabilizers'],
    rehabPhase: 'Akut', movementPlane: 'Multi-Planar', tempo: 'Fluid', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'll-010', code: 'LL-HIP-04', title: 'Glute Squeeze (Isometric)', titleTr: 'Kalça Sıkma (İzometrik)',
    category: 'Lower Limb', difficulty: 1, sets: 3, reps: 10, restPeriod: 30, visualStyle: '4K-Render',
    description: 'Herhangi bir pozisyonda kalça kaslarınızı olabildiğince sıkın ve 5 saniye bekleyin.',
    biomechanics: 'Gluteal kaslarda nöral aktivasyonu artırır.',
    safetyFlags: ['Yok'], equipment: ['Yok'], primaryMuscles: ['Gluteus Maximus'],
    rehabPhase: 'Akut', movementPlane: 'Static', tempo: '5-0-5', secondaryMuscles: [], isMotion: true
  },

  // --- CATEGORY 3: UPPER LIMB (SHOULDER & ELBOW) ---
  {
    id: 'ul-001', code: 'UL-SHO-01', title: 'Pendulum Exercises', titleTr: 'Sarkaç Egzersizleri',
    category: 'Upper Limb', difficulty: 1, sets: 3, reps: 2, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Bir masaya dayanın. Boştaki kolunuzu serbest bırakıp daireler çizdirin.',
    biomechanics: 'Omuz ekleminde distraksiyon ve pasif mobilizasyon sağlar.',
    safetyFlags: ['Şiddetli Instabilite'], equipment: ['Masa'], primaryMuscles: ['Shoulder Capsule'],
    rehabPhase: 'Akut', movementPlane: 'Circumduction', tempo: 'Fluid', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-002', code: 'UL-SHO-02', title: 'Scapular Wall Slides', titleTr: 'Duvarda Kürek Kemiği Kaydırma',
    category: 'Upper Limb', difficulty: 5, sets: 3, reps: 10, restPeriod: 45, visualStyle: '4K-Render',
    description: 'Kollarınızı duvara "W" şeklinde yaslayın ve "Y" şekline doğru yukarı kaydırın.',
    biomechanics: 'Serratus anterior aktivasyonu ve skapular kontrol.',
    safetyFlags: ['Sıkışma Sendromu'], equipment: ['Duvar'], primaryMuscles: ['Serratus Anterior'],
    rehabPhase: 'Kronik', movementPlane: 'Frontal', tempo: '3-1-3', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-003', code: 'UL-SHO-03', title: 'Shoulder External Rotation', titleTr: 'Omuz Dış Rotasyonu (Bantla)',
    category: 'Upper Limb', difficulty: 4, sets: 3, reps: 12, restPeriod: 45, visualStyle: 'X-Ray',
    description: 'Dirseğiniz vücudunuza yapışık, elinizde bant varken kolunuzu dışa doğru açın.',
    biomechanics: 'Rotator manşet kaslarını (Infraspinatus) kuvvetlendirir.',
    safetyFlags: ['Akut Yırtık Şüphesi'], equipment: ['Direnç Bandı'], primaryMuscles: ['Rotator Cuff'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Transverse', tempo: '2-1-2', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-004', code: 'UL-ELB-01', title: 'Wrist Flexor Stretch', titleTr: 'El Bileği Fleksör Germe',
    category: 'Upper Limb', difficulty: 1, sets: 3, reps: 30, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Kolunuzu ileri uzatın, avuç içi karşıya baksın. Diğer elinizle parmaklarınızı geriye çekin.',
    biomechanics: 'Medial epikondilit riskini azaltır, ön kol kaslarını gerer.',
    safetyFlags: ['Karpal Tünel Sendromu'], equipment: ['Yok'], primaryMuscles: ['Forearm Flexors'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Static', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-005', code: 'UL-SHO-04', title: 'Serratus Punch', titleTr: 'Serratus Yumruğu',
    category: 'Upper Limb', difficulty: 3, sets: 3, reps: 15, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Sırtüstü yatın, kolunuzu havaya dikin. Sadece kürek kemiğinizi kullanarak elinizi tavana itin.',
    biomechanics: 'Skapular protraksiyon ve Serratus Anterior kuvvetlendirme.',
    safetyFlags: ['Akut Omuz Ağrısı'], equipment: ['Yok'], primaryMuscles: ['Serratus Anterior'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: '1-0-1', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-006', code: 'UL-ELB-02', title: 'Wrist Extensor Stretch', titleTr: 'El Bileği Ekstansör Germe',
    category: 'Upper Limb', difficulty: 1, sets: 3, reps: 30, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Kolunuzu ileri uzatın, el sırtı karşıya baksın. Diğer elinizle elinizi aşağı doğru çekin.',
    biomechanics: 'Lateral epikondilit (Tenisçi Dirseği) rehabilitasyonu.',
    safetyFlags: ['Yok'], equipment: ['Yok'], primaryMuscles: ['Forearm Extensors'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Static', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-007', code: 'UL-SHO-05', title: 'Sleeper Stretch', titleTr: 'Omuz İç Rotasyon Germe',
    category: 'Upper Limb', difficulty: 4, sets: 3, reps: 30, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Ağrılı tarafın üzerine yan yatın. Dirseğiniz 90 dereceyken elinizi yere doğru bastırın.',
    biomechanics: 'Posterior kapsül gerginliğini azaltır (GIRD tedavisi).',
    safetyFlags: ['Bursit', 'Kalkifik Tendinit'], equipment: ['Mat'], primaryMuscles: ['Posterior Capsule'],
    rehabPhase: 'Kronik', movementPlane: 'Transverse', tempo: 'Static', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-008', code: 'UL-SHO-06', title: 'Doorway Pectoral Stretch', titleTr: 'Kapı Eşiğinde Göğüs Esnetme',
    category: 'Upper Limb', difficulty: 2, sets: 3, reps: 30, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Bir kapı eşiğinde durun. Kollarınızı yanlara dayayıp hafifçe öne doğru adım atın.',
    biomechanics: 'Pectoralis major/minor gerginliğini azaltarak postürü düzeltir.',
    safetyFlags: ['Anterior Instabilite'], equipment: ['Kapı Eşiği'], primaryMuscles: ['Pectorals'],
    rehabPhase: 'Kronik', movementPlane: 'Frontal', tempo: 'Static', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-009', code: 'UL-SHO-07', title: 'Isometric Shoulder Flexion', titleTr: 'İzometrik Omuz Fleksiyonu',
    category: 'Upper Limb', difficulty: 2, sets: 3, reps: 10, restPeriod: 30, visualStyle: 'X-Ray',
    description: 'Yumruğunuzu bir duvara dayayın. Kolunuzu öne kaldırmak istiyormuş gibi duvara bastırın.',
    biomechanics: 'Eklem hareketi olmadan kas aktivasyonu (Deltoid/Supraspinatus).',
    safetyFlags: ['Akut Kırık'], equipment: ['Duvar'], primaryMuscles: ['Deltoids'],
    rehabPhase: 'Akut', movementPlane: 'Static', tempo: '5-0-5', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ul-010', code: 'UL-SHO-08', title: 'Shoulder Shrugs', titleTr: 'Omuz Silkme (Trapez)',
    category: 'Upper Limb', difficulty: 2, sets: 3, reps: 15, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Ayakta durun. Omuzlarınızı kulaklarınıza doğru çekin and yavaşça indirin.',
    biomechanics: 'Üst trapez kaslarını aktive eder.',
    safetyFlags: ['Boyun Ağrısı (Eğer gerginlik varsa)'], equipment: ['Yok'], primaryMuscles: ['Upper Trapezius'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Frontal', tempo: '2-1-2', secondaryMuscles: [], isMotion: true
  },

  // --- CATEGORY 4: STABILITY & BALANCE ---
  {
    id: 'st-001', code: 'STB-BAL-01', title: 'Single Leg Stance', titleTr: 'Tek Ayak Üzerinde Durma',
    category: 'Stability', difficulty: 4, sets: 3, reps: 30, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Tek ayağınızın üzerinde durun. Dengede kalmaya çalışın. Gerekirse bir sandalyeden destek alın.',
    biomechanics: 'Propriyosepsiyon ve ayak bileği/kalça stabilitesini artırır.',
    safetyFlags: ['Yüksek Düşme Riski'], equipment: ['Sandalye (Destek için)'], primaryMuscles: ['Core', 'Ankle'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Multi-Planar', tempo: 'Static', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-002', code: 'STB-BAL-02', title: 'Tandem Stance', titleTr: 'Ardışık Duruş (Tandem)',
    category: 'Stability', difficulty: 3, sets: 3, reps: 30, restPeriod: 30, visualStyle: '4K-Render',
    description: 'Bir ayağınızın topuğunu diğer ayağınızın parmak ucuna tam değecek şekilde yerleştirin.',
    biomechanics: 'Destek yüzeyini daraltarak denge kontrolünü geliştirir.',
    safetyFlags: ['Vestibüler Sorunlar'], equipment: ['Yok'], primaryMuscles: ['Core'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Static', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-003', code: 'STB-BAL-03', title: 'Heel-to-Toe Walk', titleTr: 'Topuk-Parmak Ucu Yürüyüşü',
    category: 'Stability', difficulty: 5, sets: 2, reps: 20, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Bir ipin üzerinde yürüyormuş gibi bir ayağınızı diğerinin önüne koyarak düz yürüyün.',
    biomechanics: 'Dinamik denge ve koordinasyonu artırır.',
    safetyFlags: ['Diz Yaralanması'], equipment: ['Yok'], primaryMuscles: ['Global Stabiliers'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: 'Slow', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-004', code: 'STB-BAL-04', title: 'Side Plank', titleTr: 'Yan Plank (Dinamik)',
    category: 'Stability', difficulty: 7, sets: 3, reps: 10, restPeriod: 60, visualStyle: 'X-Ray',
    description: 'Yan yatın, dirsek üzerindeyken kalçanızı yukarı kaldırın. Sabit bekleyin veya kalçayı indirin.',
    biomechanics: 'Quadratus Lumborum ve Oblik kaslarını kuvvetlendirir.',
    safetyFlags: ['Omuz Ağrısı'], equipment: ['Mat'], primaryMuscles: ['QL', 'Obliques'],
    rehabPhase: 'Kronik', movementPlane: 'Frontal', tempo: '3-2-3', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-005', code: 'STB-BAL-05', title: 'Plank with Shoulder Taps', titleTr: 'Plank Pozisyonunda Omuz Teması',
    category: 'Stability', difficulty: 8, sets: 3, reps: 12, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Şınav pozisyonu alın. Gövdenizi döndürmeden bir elinizle karşı omzunuza dokunun.',
    biomechanics: 'Anti-rotasyonel core stabilitesi.',
    safetyFlags: ['Bel Çökmesi'], equipment: ['Mat'], primaryMuscles: ['Core', 'Shoulder Stability'],
    rehabPhase: 'Kronik', movementPlane: 'Transverse', tempo: '1-0-1', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-006', code: 'STB-BAL-06', title: 'Star Excursion Balance', titleTr: 'Yıldız Denge Testi (Egzersiz)',
    category: 'Stability', difficulty: 9, sets: 2, reps: 8, restPeriod: 60, visualStyle: 'Schematic',
    description: 'Tek ayak üzerinde dururken boştaki ayağınızı 8 farklı yöne doğru uzatıp zemine dokunun.',
    biomechanics: 'İleri düzey alt ekstremite propriyosepsiyonu.',
    safetyFlags: ['Akut ACL Yaralanması'], equipment: ['Yok'], primaryMuscles: ['Lower Extremity'],
    rehabPhase: 'Performans', movementPlane: 'Multi-Planar', tempo: 'Controlled', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-007', code: 'STB-BAL-07', title: 'Dead Bug with Ball', titleTr: 'Topla Dead Bug (Zorlayıcı)',
    category: 'Stability', difficulty: 6, sets: 3, reps: 10, restPeriod: 45, visualStyle: 'X-Ray',
    description: 'Sırtüstü yatın. El and karşı diz arasına bir top koyup bastırın. Diğer kol/bacağı açın.',
    biomechanics: 'Maksimum lumbopelvik stabilite ve koordinasyon.',
    safetyFlags: ['Bel Boşluğu'], equipment: ['Pilates Topu'], primaryMuscles: ['Deep Core'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: '4-0-4', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-008', code: 'STB-BAL-08', title: 'Single Leg RDL (Bodyweight)', titleTr: 'Tek Bacak Üstünde Öne Eğilme',
    category: 'Stability', difficulty: 7, sets: 3, reps: 10, restPeriod: 60, visualStyle: 'Cinematic-Motion',
    description: 'Tek ayak üzerinde durun. Sırtınızı düz tutarak öne eğilin, diğer bacağı arkaya uzatın.',
    biomechanics: 'Posterior zincir kuvveti ve dinamik kalça dengesi.',
    safetyFlags: ['Hamstring Gerginliği'], equipment: ['Yok'], primaryMuscles: ['Glutes', 'Hamstrings'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: '3-1-3', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-009', code: 'STB-BAL-09', title: 'Balance Board Weight Shift', titleTr: 'Denge Tahtasında Ağırlık Aktarımı',
    category: 'Stability', difficulty: 6, sets: 3, reps: 2, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Denge tahtası üzerinde durun. Ağırlığınızı yavaşça sağa and sola vererek kenarları dokundurun.',
    biomechanics: 'Ayak bileği eversiyon/inversiyon kuvveti and vestibüler denge.',
    safetyFlags: ['Düşme Riski'], equipment: ['Denge Tahtası'], primaryMuscles: ['Ankle Peroneals'],
    rehabPhase: 'Kronik', movementPlane: 'Frontal', tempo: 'Slow', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'st-010', code: 'STB-BAL-10', title: 'Toe Taps (Supine)', titleTr: 'Yatarak Parmak Ucu Dokunuşu',
    category: 'Stability', difficulty: 3, sets: 3, reps: 15, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Sırtüstü yatın, dizler 90 derece havada. Sırasıyla ayak uçlarını yere değdirip çekin.',
    biomechanics: 'Alt karın (lower abs) kontrolü and pelvik stabilite.',
    safetyFlags: ['Bel Boşluğu Artışı'], equipment: ['Mat'], primaryMuscles: ['Abs'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '2-0-2', secondaryMuscles: [], isMotion: true
  },

  // --- CATEGORY 5: NEUROLOGICAL ---
  {
    id: 'ne-001', code: 'NEU-MOB-01', title: 'Sciatic Nerve Glide', titleTr: 'Siyatik Sinir Kaydırma (Mobilizasyon)',
    category: 'Neurological', difficulty: 3, sets: 3, reps: 10, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Sırtüstü yatın. Bacağınızı kaldırın. Ayağınızı kendinize çekip itin, dizinizi hafif büküp açın.',
    biomechanics: 'Siyatik sinirin kılıfı içinde kaymasını sağlayarak inflamasyonu azaltır.',
    safetyFlags: ['Artan Karıncalanma/Uyuşma'], equipment: ['Yok'], primaryMuscles: ['Sciatic Nerve'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Slow', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-002', code: 'NEU-MOB-02', title: 'Median Nerve Flossing', titleTr: 'Median Sinir Kaydırma',
    category: 'Neurological', difficulty: 3, sets: 3, reps: 10, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Kolunuzu yana açın. Elinizi arkaya eğerken başınızı diğer yana yatırın.',
    biomechanics: 'Brakial pleksus and median sinir mobilitesi.',
    safetyFlags: ['Elektriklenme Hissi'], equipment: ['Yok'], primaryMuscles: ['Median Nerve'],
    rehabPhase: 'Akut', movementPlane: 'Frontal', tempo: 'Fluid', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-003', code: 'NEU-MOB-03', title: 'Femoral Nerve Glide', titleTr: 'Femoral Sinir Kaydırma',
    category: 'Neurological', difficulty: 4, sets: 3, reps: 10, restPeriod: 45, visualStyle: 'X-Ray',
    description: 'Yan yatın. Üstteki dizinizi bükün and bacağınızı arkaya doğru alırken başınızı öne eğin.',
    biomechanics: 'Femoral sinirdeki gerginliği azaltır.',
    safetyFlags: ['Kasık Ağrısı'], equipment: ['Yok'], primaryMuscles: ['Femoral Nerve'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: 'Controlled', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-004', code: 'NEU-MOB-04', title: 'Sit-to-Stand Transitions', titleTr: 'Otur-Kalk Egzersizi',
    category: 'Neurological', difficulty: 4, sets: 3, reps: 10, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Sandalye kenarına oturun. Gövdenizi öne vererek destek almadan ayağa kalkın.',
    biomechanics: 'Motor kontrol and fonksiyonel alt ekstremite kuvveti.',
    safetyFlags: ['Ortostatik Hipotansiyon'], equipment: ['Sandalye'], primaryMuscles: ['Quads', 'Glutes'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: '3-1-3', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-005', code: 'NEU-MOB-05', title: 'Marching in Place (Neuro)', titleTr: 'Olduğu Yerde Sayma (Nöral)',
    category: 'Neurological', difficulty: 3, sets: 3, reps: 20, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Ayakta durun. Dizlerinizi karnınıza doğru çekerek olduğu yerde adım atın.',
    biomechanics: 'Resiprokal koordinasyon and denge kontrolü.',
    safetyFlags: ['Denge Kaybı'], equipment: ['Duvar (Destek için)'], primaryMuscles: ['Hip Flexors'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: 'Steady', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-006', code: 'NEU-MOB-06', title: 'Weight Shifting (Paretic Side)', titleTr: 'Etkilenen Tarafa Ağırlık Aktarımı',
    category: 'Neurological', difficulty: 2, sets: 3, reps: 10, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Ayakta durun. Vücut ağırlığınızı yavaşça zayıf bacağınıza aktarın and bekleyin.',
    biomechanics: 'Sensomotorik girdi and paretik bacak yüklenme eğitimi.',
    safetyFlags: ['Diz Kilitlenmesi'], equipment: ['Yok'], primaryMuscles: ['Lower Limb Stability'],
    rehabPhase: 'Akut', movementPlane: 'Frontal', tempo: 'Slow', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-007', code: 'NEU-MOB-07', title: 'Mirror Therapy Sim', titleTr: 'Ayna Terapisi (Görsel Simülasyon)',
    category: 'Neurological', difficulty: 2, sets: 3, reps: 5, restPeriod: 60, visualStyle: 'Cinematic-Motion',
    description: 'Sağlam elinizle hareketleri yaparken aynadaki yansımasına (zayıf taraf gibi) bakın.',
    biomechanics: 'Kortikal reorganizasyon and nöroplastisite.',
    safetyFlags: ['Görsel Karışıklık'], equipment: ['Ayna'], primaryMuscles: ['Brain / Motor Cortex'],
    rehabPhase: 'Kronik', movementPlane: 'Visual', tempo: 'Patient-led', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-008', code: 'NEU-MOB-08', title: 'Box and Block Sim', titleTr: 'Kutu ve Blok Koordinasyonu',
    category: 'Neurological', difficulty: 5, sets: 2, reps: 20, restPeriod: 45, visualStyle: '4K-Render',
    description: 'Küçük nesneleri bir kaptan diğerine hızlıca and kontrollü şekilde taşıyın.',
    biomechanics: 'İnce motor beceri and el-göz koordinasyonu.',
    safetyFlags: ['Yorgunluk'], equipment: ['Nesneler / Kaplar'], primaryMuscles: ['Hand Intrinsics'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Multi-Planar', tempo: 'Fast', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-009', code: 'NEU-MOB-09', title: 'Coordination Tapping', titleTr: 'Koordinasyonel Parmak Vurma',
    category: 'Neurological', difficulty: 1, sets: 3, reps: 30, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Baş parmağınızı sırasıyla diğer tüm parmak uçlarınıza dokundurun.',
    biomechanics: 'Parmak opozisyonu and motor planlama.',
    safetyFlags: ['Yok'], equipment: ['Yok'], primaryMuscles: ['Fine Motor'],
    rehabPhase: 'Akut', movementPlane: 'Static', tempo: 'Fluid', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ne-010', code: 'NEU-MOB-10', title: 'Trunk Rotation (Neuro)', titleTr: 'Gövde Rotasyonu (Nöral)',
    category: 'Neurological', difficulty: 3, sets: 3, reps: 12, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Sandalye üzerindeyken gövdenizi yavaşça sağa and sola döndürerek arkaya bakın.',
    biomechanics: 'Spinal mobilizasyon and gövde motor kontrolü.',
    safetyFlags: ['Bel Ağrısı'], equipment: ['Sandalye'], primaryMuscles: ['Trunk Rotators'],
    rehabPhase: 'Kronik', movementPlane: 'Transverse', tempo: '2-2-2', secondaryMuscles: [], isMotion: true
  },

  // --- CATEGORY 6: CARDIOVASCULAR ---
  {
    id: 'ca-001', code: 'CARD-END-01', title: 'Diaphragmatic Breathing', titleTr: 'Diyafram Nefesi',
    category: 'Cardiovascular', difficulty: 1, sets: 3, reps: 10, restPeriod: 30, visualStyle: '4K-Render',
    description: 'Bir elinizi karnınıza, diğerini göğsünüze koyun. Nefes alırken sadece karnınız yükselsin.',
    biomechanics: 'Solunum kapasitesini artırır, parasempatik aktivasyonu teşvik eder.',
    safetyFlags: ['Hiperventilasyon'], equipment: ['Yok'], primaryMuscles: ['Diaphragm'],
    rehabPhase: 'Akut', movementPlane: 'Deep', tempo: '4-2-6', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-002', code: 'CARD-END-02', title: 'Pursed Lip Breathing', titleTr: 'Büzük Dudak Solunumu',
    category: 'Cardiovascular', difficulty: 1, sets: 3, reps: 5, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Burnunuzdan nefes alın, dudaklarınızı büzerek (ıslık çalar gibi) yavaşça verin.',
    biomechanics: 'Hava yolu basıncını artırır, KOAH and dispne yönetiminde etkilidir.',
    safetyFlags: ['Baş Dönmesi'], equipment: ['Yok'], primaryMuscles: ['Lungs'],
    rehabPhase: 'Akut', movementPlane: 'Internal', tempo: '2-0-4', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-003', code: 'CARD-END-03', title: 'Seated Arm Circles', titleTr: 'Oturarak Kol Daireleri',
    category: 'Cardiovascular', difficulty: 2, sets: 3, reps: 20, restPeriod: 60, visualStyle: 'Schematic',
    description: 'Otururken kollarınızı yanlara açın and küçük/orta daireler çizin.',
    biomechanics: 'Düşük yoğunluklu aerobik egzersiz and omuz mobilizasyonu.',
    safetyFlags: ['Kalp Hızı Sınırları'], equipment: ['Sandalye'], primaryMuscles: ['Shoulder Girdle'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Circumduction', tempo: 'Steady', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-004', code: 'CARD-END-04', title: 'Ankle Pumps (DVT Prophylaxis)', titleTr: 'Ayak Bileği Pompası (DVT Önleme)',
    category: 'Cardiovascular', difficulty: 1, sets: 5, reps: 20, restPeriod: 30, visualStyle: '4K-Render',
    description: 'Ayak bileklerinizi hızlıca yukarı and aşağı doğru çekip itin.',
    biomechanics: 'Venöz dönüşü artırır, pıhtı oluşumunu engeller.',
    safetyFlags: ['Mevcut DVT Şüphesi'], equipment: ['Yok'], primaryMuscles: ['Calf Pump'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Fast', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-005', code: 'CARD-END-05', title: 'Low Intensity Walking', titleTr: 'Düşük Yoğunluklu Yürüyüş',
    category: 'Cardiovascular', difficulty: 3, sets: 1, reps: 10, restPeriod: 0, visualStyle: 'Cinematic-Motion',
    description: 'Düz bir zeminde, nefes nefese kalmadan 10 dakika boyunca yürüyün.',
    biomechanics: 'Genel aerobik dayanıklılık and dolaşım sağlığı.',
    safetyFlags: ['Göğüs Ağrısı'], equipment: ['Yok'], primaryMuscles: ['Global'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: 'Normal', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-006', code: 'CARD-END-06', title: 'Step-in-place (Cardio)', titleTr: 'Olduğu Yerde Adım Atma (Kardiyo)',
    category: 'Cardiovascular', difficulty: 4, sets: 3, reps: 2, restPeriod: 60, visualStyle: 'X-Ray',
    description: 'Olduğunuz yerde 2 dakika boyunca dizlerinizi hafif kaldırarak yürüyün.',
    biomechanics: 'Kalp hızını kontrollü şekilde artırır.',
    safetyFlags: ['Aşırı Yorgunluk'], equipment: ['Yok'], primaryMuscles: ['Lower Extremity'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: 'Rhythmic', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-007', code: 'CARD-END-07', title: 'Arm Ergometer Sim', titleTr: 'Kol Ergometresi Simülasyonu',
    category: 'Cardiovascular', difficulty: 4, sets: 3, reps: 5, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Kollarınızla havada pedal çeviriyormuş gibi dairesel hareketler yapın.',
    biomechanics: 'Üst vücut aerobik kapasite eğitimi.',
    safetyFlags: ['Borg Skoru > 13'], equipment: ['Yok'], primaryMuscles: ['Arms', 'Back'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: 'Continuous', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-008', code: 'CARD-END-08', title: 'Box Breathing', titleTr: 'Kutu Solunumu (Otonom Düzenleme)',
    category: 'Cardiovascular', difficulty: 1, sets: 3, reps: 5, restPeriod: 30, visualStyle: 'Schematic',
    description: '4 sn nefes al, 4 sn tut, 4 sn ver, 4 sn tut. Kare şeklinde devam et.',
    biomechanics: 'Otonom sinir sistemini dengeler, stresi azaltır.',
    safetyFlags: ['Yok'], equipment: ['Yok'], primaryMuscles: ['Respiratory'],
    rehabPhase: 'Akut', movementPlane: 'Internal', tempo: '4-4-4-4', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-009', code: 'CARD-END-09', title: 'Controlled Stair Climbing', titleTr: 'Kontrollü Merdiven Çıkma',
    category: 'Cardiovascular', difficulty: 6, sets: 2, reps: 1, restPeriod: 120, visualStyle: 'Cinematic-Motion',
    description: '1 kat merdiveni yavaşça, dinlenerek and nefes kontrolüyle çıkın.',
    biomechanics: 'Fonksiyonel güç and kardiyorespiratuar kapasite.',
    safetyFlags: ['Denge Sorunları'], equipment: ['Merdiven'], primaryMuscles: ['Lower Body'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: 'Slow', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'ca-010', code: 'CARD-END-10', title: 'Seated Thoracic Expansion', titleTr: 'Oturarak Göğüs Kafesi Genişletme',
    category: 'Cardiovascular', difficulty: 2, sets: 3, reps: 10, restPeriod: 45, visualStyle: '4K-Render',
    description: 'Otururken nefes alırken kollarınızı yanlara açıp göğsünüzü şişirin.',
    biomechanics: 'Akciğer ekspanziyonunu maksimize eder.',
    safetyFlags: ['Yok'], equipment: ['Yok'], primaryMuscles: ['Intercostals'],
    rehabPhase: 'Akut', movementPlane: 'Frontal', tempo: '4-1-4', secondaryMuscles: [], isMotion: true
  },

  // --- CATEGORY 7: POST-OP RECOVERY ---
  {
    id: 'po-001', code: 'POP-REC-01', title: 'Post-Op Ankle Pumps', titleTr: 'Post-Op Ayak Bileği Pompası',
    category: 'Post-Op', difficulty: 1, sets: 5, reps: 20, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Ameliyat sonrası yatarken ayak bileklerinizi sürekli hareket ettirin.',
    biomechanics: 'Dolaşımı korur and emboli riskini minimize eder.',
    safetyFlags: ['Şiddetli Akut Kanama'], equipment: ['Yok'], primaryMuscles: ['Calves'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Rhythmic', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-002', code: 'POP-REC-02', title: 'Passive Range of Motion (Shoulder)', titleTr: 'Pasif Omuz Hareket Açıklığı',
    category: 'Post-Op', difficulty: 2, sets: 3, reps: 10, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Diğer elinizin desteğiyle ameliyatlı kolunuzu yavaşça ağrı sınırına kadar kaldırın.',
    biomechanics: 'Eklemi korurken hareket kaybını önler.',
    safetyFlags: ['Cerrahi Protokol Kısıtlamaları'], equipment: ['Yok'], primaryMuscles: ['Shoulder Joint'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Slow', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-003', code: 'POP-REC-03', title: 'Knee Pendulums', titleTr: 'Diz Sarkaç Egzersizi',
    category: 'Post-Op', difficulty: 1, sets: 3, reps: 2, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Bir masaya oturun, bacaklarınızı sallayın. Yerçekimi ile dizinizin bükülmesine izin verin.',
    biomechanics: 'Eklem içi adezyonları (yapışıklıkları) önler.',
    safetyFlags: ['Kısmi Yük Kısıtlamaları'], equipment: ['Yüksek Sandalye'], primaryMuscles: ['Knee joint'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Fluid', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-004', code: 'POP-REC-04', title: 'Gluteal Squeezes (Post-Op)', titleTr: 'Post-Op Kalça Sıkma',
    category: 'Post-Op', difficulty: 1, sets: 3, reps: 10, restPeriod: 30, visualStyle: 'X-Ray',
    description: 'Ameliyatlı bacağı oynatmadan kalça kaslarınızı sıkın and bırakın.',
    biomechanics: 'İzometrik kas aktivasyonu.',
    safetyFlags: ['Yok'], equipment: ['Yok'], primaryMuscles: ['Glutes'],
    rehabPhase: 'Akut', movementPlane: 'Static', tempo: '5-0-5', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-005', code: 'POP-REC-05', title: 'Deep Breathing (Incentive Spirometry)', titleTr: 'Derin Nefes (Spirometre Yardımlı)',
    category: 'Post-Op', difficulty: 2, sets: 5, reps: 10, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Cihazla veya cihazsız, akciğerlerinizin en altına kadar nefes alın.',
    biomechanics: 'Atelektazi (akciğer sönmesi) riskini azaltır.',
    safetyFlags: ['Torakal Ağrı'], equipment: ['Spirometre (Opsiyonel)'], primaryMuscles: ['Lungs'],
    rehabPhase: 'Akut', movementPlane: 'Internal', tempo: '5-2-5', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-006', code: 'POP-REC-06', title: 'Log Roll Technique', titleTr: 'Kütük Yuvarlanma Tekniği (Eğitim)',
    category: 'Post-Op', difficulty: 3, sets: 1, reps: 5, restPeriod: 60, visualStyle: 'Cinematic-Motion',
    description: 'Yataktan kalkarken omurganızı bükmeden, gövdenizi bir bütün olarak döndürün.',
    biomechanics: 'Spinal cerrahi sonrası disk yükünü korur.',
    safetyFlags: ['Dikiş Ayrılması'], equipment: ['Yatak'], primaryMuscles: ['Core'],
    rehabPhase: 'Akut', movementPlane: 'Transverse', tempo: 'Safe', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-007', code: 'POP-REC-07', title: 'Gentle Isometric Quads', titleTr: 'Hafif İzometrik Quads',
    category: 'Post-Op', difficulty: 2, sets: 3, reps: 10, restPeriod: 30, visualStyle: 'X-Ray',
    description: 'Dizinizin altına havlu koyun. Dizinizi havluya bastırarak üst bacak kasınızı sıkın.',
    biomechanics: 'Diz operasyonu sonrası kas inhibisyonunu önler.',
    safetyFlags: ['Ağrı Sınırı'], equipment: ['Rulo Havlu'], primaryMuscles: ['Quadriceps'],
    rehabPhase: 'Akut', movementPlane: 'Static', tempo: '5-0-5', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-008', code: 'POP-REC-08', title: 'Scar Tissue Mobilization (Self)', titleTr: 'Yara Dokusu Mobilizasyonu',
    category: 'Post-Op', difficulty: 2, sets: 1, reps: 5, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Dikişler kapandıktan sonra yara etrafına dairesel and yatay masaj uygulayın.',
    biomechanics: 'Fibröz dokuyu yumuşatır, esnekliği artırır.',
    safetyFlags: ['Enfeksiyon Bulguları', 'Açık Yara'], equipment: ['Nemlendirici Krem'], primaryMuscles: ['Skin / Fascia'],
    rehabPhase: 'Kronik', movementPlane: 'Fascial', tempo: 'Gentle', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-009', code: 'POP-REC-09', title: 'Assistive Device Ambulation', titleTr: 'Yardımcı Cihazla Yürüyüş',
    category: 'Post-Op', difficulty: 4, sets: 1, reps: 5, restPeriod: 0, visualStyle: 'Cinematic-Motion',
    description: 'Walker veya koltuk değneğiyle, doktorunuzun izin verdiği yükle yürüyün.',
    biomechanics: 'Fonksiyonel mobilite and kemik yüklenme eğitimi.',
    safetyFlags: ['Denge Kaybı'], equipment: ['Walker / Koltuk Değneği'], primaryMuscles: ['Whole Body'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Safe', secondaryMuscles: [], isMotion: true
  },
  {
    id: 'po-010', code: 'POP-REC-10', title: 'Heel Propping (Extension Gain)', titleTr: 'Topuk Destekli Uzatma',
    category: 'Post-Op', difficulty: 3, sets: 3, reps: 5, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Topuğunuzun altına bir rulo koyun. Yerçekiminin dizinizi düzleştirmesine izin verin.',
    biomechanics: 'Diz ekstansiyon kısıtlılığını (Fleksiyon kontraktürü) giderir.',
    safetyFlags: ['Diz Arkası Ağrısı'], equipment: ['Rulo'], primaryMuscles: ['Knee Joint'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: 'Static', secondaryMuscles: [], isMotion: true
  }
];
