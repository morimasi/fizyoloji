
import { Exercise } from './types.ts';

/**
 * PhysioCore AI - Clinical Seed Library v3.8 (UUID Compliant Edition)
 * Tüm ID'ler Postgres SQL UUID standardına çekilmiştir.
 */
export const SEED_EXERCISES: Exercise[] = [
  // --- CATEGORY 1: SPINE (LUMBAR & CERVICAL) ---
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d471', code: 'SP-LUM-01', title: 'McKenzie Prone Press-up', titleTr: 'McKenzie Yüzüstü Doğrulma',
    category: 'Spine', difficulty: 3, sets: 3, reps: 10, restPeriod: 60, visualStyle: 'Cinematic-Motion',
    description: 'Yüzüstü yatın. Ellerinizi omuz hizasında yerleştirin. Kalçanızı yerden ayırmadan kollarınızla gövdenizi yukarı doğru itin.',
    biomechanics: 'L4-L5 segmentinde distraksiyon sağlar. Disk materyalinin santralizasyonunu destekler.',
    safetyFlags: ['Spondylolisthesis', 'Akut Fraktür'], equipment: ['Mat'], primaryMuscles: ['Erector Spinae'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '2-2-2', secondaryMuscles: [], isMotion: true, targetRpe: 5
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d472', code: 'SP-LUM-02', title: 'Bird-Dog Stability', titleTr: 'Çapraz Kol-Bacak Uzatma',
    category: 'Spine', difficulty: 5, sets: 3, reps: 12, restPeriod: 45, visualStyle: 'X-Ray',
    description: 'Dört ayak üzerinde durun. Aynı anda sağ kolunuzu ileri, sol bacağınızı geriye doğru uzatın.',
    biomechanics: 'Lumbar multifidus aktivasyonu ve core stabilitesi sağlar.',
    safetyFlags: ['Denge Kaybı'], equipment: ['Mat'], primaryMuscles: ['Core', 'Multifidus'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Transverse', tempo: '3-1-3', secondaryMuscles: [], isMotion: true, targetRpe: 5
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d473', code: 'SP-LUM-03', title: 'Pelvic Tilts', titleTr: 'Pelvik Tilt (Pelvis Eğme)',
    category: 'Spine', difficulty: 2, sets: 3, reps: 15, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Sırtüstü yatın, dizleri bükün. Bel çukurunu yere bastırarak karın kaslarını sıkın ve bırakın.',
    biomechanics: 'Lumbar mobilizasyon ve derin karın kası farkındalığı.',
    safetyFlags: ['Şiddetli Akut Ağrı'], equipment: ['Mat'], primaryMuscles: ['Abs', 'Pelvic Floor'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '2-0-2', secondaryMuscles: [], isMotion: true, targetRpe: 3
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d474', code: 'SP-CER-01', title: 'Cervical Chin Tuck', titleTr: 'Boyun Geri Çekme (Çift Çene)',
    category: 'Spine', difficulty: 2, sets: 3, reps: 10, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Dik oturun. Başınızı öne eğmeden geriye doğru çekerek çift çene yapın.',
    biomechanics: 'Derin boyun fleksörlerini (Longus Colli) aktive eder, başın öne eğilmesini düzeltir.',
    safetyFlags: ['Baş Dönmesi'], equipment: ['Yok'], primaryMuscles: ['Cervical Flexors'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '5-2-5', secondaryMuscles: [], isMotion: true, targetRpe: 3
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d475', code: 'SP-THO-01', title: 'Thoracic Extension (Foam Roller)', titleTr: 'Sırt Ekstansiyonu (Silindir)',
    category: 'Spine', difficulty: 4, sets: 2, reps: 10, restPeriod: 60, visualStyle: '4K-Render',
    description: 'Foam rollerı sırtınızın altına koyun. Ellerinizi başınızın arkasına alıp geriye doğru esneyin.',
    biomechanics: 'Torakal omurga mobilitesini artırır, kifozu (kamburluğu) azaltır.',
    safetyFlags: ['Osteoporoz', 'Kaburga Kırığı'], equipment: ['Foam Roller'], primaryMuscles: ['Thoracic Spine'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: '5-5-5', secondaryMuscles: [], isMotion: true, targetRpe: 5
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d476', code: 'SP-LUM-04', title: 'Dead Bug Core Support', titleTr: 'Dead Bug Karın Kontrolü',
    category: 'Spine', difficulty: 4, sets: 3, reps: 10, restPeriod: 45, visualStyle: 'X-Ray',
    description: 'Sırtüstü yatın, bacaklar masa pozisyonunda. Belinizi yerden ayırmadan çapraz kol-bacağı açın.',
    biomechanics: 'Lumbopelvik stabiliteyi (Dead Bug) geliştirir, alt karın aktivasyonu sağlar.',
    safetyFlags: ['Bel Boşluğu Kontrol Kaybı'], equipment: ['Mat'], primaryMuscles: ['Transversus Abdominis'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Frontal', tempo: '3-0-3', secondaryMuscles: [], isMotion: true, targetRpe: 5
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d477', code: 'SP-LUM-05', title: 'Child’s Pose Stretch', titleTr: 'Çocuk Pozisyonu Esneme',
    category: 'Spine', difficulty: 1, sets: 3, reps: 30, restPeriod: 30, visualStyle: 'Schematic',
    description: 'Diz çökün, topuklarınıza oturun and kollarınızı ileri uzatarak alnınızı yere koyun.',
    biomechanics: 'Lumbar paravertebral kaslarda pasif germe ve dekompresyon.',
    safetyFlags: ['Diz Yaralanması'], equipment: ['Mat'], primaryMuscles: ['Paraspinals'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: 'Static', secondaryMuscles: [], isMotion: true, targetRpe: 3
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d478', code: 'SP-CER-02', title: 'Levator Scapulae Stretch', titleTr: 'Omuz-Boyun Esnetme',
    category: 'Spine', difficulty: 2, sets: 3, reps: 3, restPeriod: 30, visualStyle: 'Cinematic-Motion',
    description: 'Dik oturun. Başınızı 45 derece yana çevirip koltuk altınıza bakacakmış gibi öne eğin.',
    biomechanics: 'Levator Scapulae kasındaki gerginliği azaltarak boyun ağrısını hafifletir.',
    safetyFlags: ['Sinir Sıkışması Bulguları'], equipment: ['Sandalye'], primaryMuscles: ['Levator Scapulae'],
    rehabPhase: 'Akut', movementPlane: 'Oblique', tempo: '30s Hold', secondaryMuscles: [], isMotion: true, targetRpe: 3
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', code: 'SP-LUM-06', title: 'Cat-Camel Mobilization', titleTr: 'Kedi-Deve Egzersizi',
    category: 'Spine', difficulty: 2, sets: 3, reps: 10, restPeriod: 30, visualStyle: '4K-Render',
    description: 'Dört ayak üzerinde durun. Sırtınızı yukarı kamburlaştırın, sonra aşağı doğru çukurlaştırın.',
    biomechanics: 'Tüm omurga segmentlerinde segmental mobilizasyon sağlar.',
    safetyFlags: ['Akut Disk Hernisi (Sınırlı Hareket)'], equipment: ['Mat'], primaryMuscles: ['Spinal Column'],
    rehabPhase: 'Akut', movementPlane: 'Sagittal', tempo: '4-0-4', secondaryMuscles: [], isMotion: true, targetRpe: 3
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', code: 'SP-LUM-07', title: 'Cobra Stretch', titleTr: 'Kobra Esnemesi',
    category: 'Spine', difficulty: 3, sets: 3, reps: 10, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Yüzüstü yatın. Ellerinizi omuzlarınızın altına koyun and göğsünüzü yukarı kaldırın.',
    biomechanics: 'Karın kaslarını gerer and lumbar ekstansiyonu teşvik eder.',
    safetyFlags: ['Stenoz'], equipment: ['Mat'], primaryMuscles: ['Rectus Abdominis'],
    rehabPhase: 'Kronik', movementPlane: 'Sagittal', tempo: '3-2-3', secondaryMuscles: [], isMotion: true, targetRpe: 5
  },

  // --- CATEGORY 2: LOWER LIMB (HIP & KNEE) ---
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', code: 'LL-KNE-01', title: 'Terminal Knee Extension (TKE)', titleTr: 'Terminal Diz Ekstansiyonu',
    category: 'Lower Limb', difficulty: 3, sets: 3, reps: 15, restPeriod: 30, visualStyle: '4K-Render',
    description: 'Direnç bandını diz arkasına takın. Bandın direncine karşı dizinizi tam düz hale getirin.',
    biomechanics: 'Vastus Medialis Obliquus (VMO) aktivasyonu sağlar.',
    safetyFlags: ['Diz Kapağı Çıkığı'], equipment: ['Direnç Bandı'], primaryMuscles: ['VMO', 'Quads'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: '1-2-1', secondaryMuscles: [], isMotion: true, targetRpe: 5
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c9', code: 'LL-HIP-01', title: 'Clamshells', titleTr: 'İstiridye Egzersizi',
    category: 'Lower Limb', difficulty: 4, sets: 3, reps: 12, restPeriod: 45, visualStyle: 'Cinematic-Motion',
    description: 'Yan yatın, dizler bükülü. Üstteki dizinizi ayakları ayırmadan yukarı doğru açın.',
    biomechanics: 'Gluteus Medius aktivasyonu ile kalça stabilitesi sağlar.',
    safetyFlags: ['Bursit'], equipment: ['Yok'], primaryMuscles: ['Gluteus Medius'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Frontal', tempo: '2-1-2', secondaryMuscles: [], isMotion: true, targetRpe: 5
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430d0', code: 'LL-KNE-02', title: 'Wall Squat (Static)', titleTr: 'Duvarda Squat (Statik)',
    category: 'Lower Limb', difficulty: 5, sets: 3, reps: 45, restPeriod: 60, visualStyle: 'X-Ray',
    description: 'Sırtınızı duvara yaslayın. Dizleriniz 90 derece bükülene kadar aşağı kayın and bekleyin.',
    biomechanics: 'İzometrik quadriceps kuvveti and eklem stabilitesi.',
    safetyFlags: ['Patellofemoral Ağrı'], equipment: ['Duvar'], primaryMuscles: ['Quadriceps', 'Glutes'],
    rehabPhase: 'Sub-Akut', movementPlane: 'Sagittal', tempo: 'Static', secondaryMuscles: [], isMotion: true, targetRpe: 6
  }
];
