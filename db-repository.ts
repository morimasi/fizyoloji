
import { Exercise, PatientProfile, ProgressReport } from './types.ts';

export class PhysioDB {
  private static STORAGE_KEY = 'physiocore_exercises';
  private static PROFILE_KEY = 'physiocore_patient';

  private static defaultExercises: Exercise[] = [
    // --- SPINE (10) ---
    { id: 's1', code: 'SP-01', title: 'McKenzie Prone Press-up', category: 'Spine / Lumbar', difficulty: 4, sets: 3, reps: 10, description: 'Yüzüstü yatarken kollarınızla gövdenizi yukarı itin. Pelvis yerde kalmalı.', biomechanics: 'Lumbar Extension / Centralization.', safetyFlags: ['Akut Kırık'], muscleGroups: ['Erector Spinae'], rehabPhase: 'Sub-Akut', equipment: ['Mat'] },
    { id: 's2', code: 'SP-02', title: 'Cat-Camel Mobility', category: 'Spine / Thoracic', difficulty: 2, sets: 2, reps: 15, description: 'Dört ayak üzerinde omurganızı yukarı yuvarlayın ve aşağı çukurlaştırın.', biomechanics: 'Segmental Spinal Mobility.', safetyFlags: [], muscleGroups: ['Multifidus'], rehabPhase: 'Akut', equipment: [] },
    { id: 's3', code: 'SP-03', title: 'Bird-Dog Stability', category: 'Spine / Core', difficulty: 5, sets: 3, reps: 12, description: 'Zıt kol ve bacağınızı aynı anda uzatın, beli sabit tutun.', biomechanics: 'Cross-chain neuromuscular control.', safetyFlags: [], muscleGroups: ['Core', 'Gluteus'], rehabPhase: 'Kronik', equipment: [] },
    { id: 's4', code: 'SP-04', title: 'Dead Bug Level 1', category: 'Spine / Core', difficulty: 3, sets: 3, reps: 10, description: 'Sırtüstü yatarken zıt uzuvları yere yaklaştırın, beli bastırın.', biomechanics: 'Anti-extension core stability.', safetyFlags: [], muscleGroups: ['Abs'], rehabPhase: 'Akut', equipment: [] },
    { id: 's5', code: 'SP-05', title: 'Chin Tuck Isometric', category: 'Spine / Cervical', difficulty: 2, sets: 3, reps: 10, description: 'Çenenizi geriye doğru çekerek boyun arkasını uzatın.', biomechanics: 'Deep Neck Flexor activation.', safetyFlags: [], muscleGroups: ['Longus Colli'], rehabPhase: 'Akut', equipment: [] },
    { id: 's6', code: 'SP-06', title: 'Thoracic Windmill', category: 'Spine / Thoracic', difficulty: 4, sets: 2, reps: 10, description: 'Yan yatarken üstteki kolunuzla geriye doğru daire çizin.', biomechanics: 'Thoracic rotation mobility.', safetyFlags: [], muscleGroups: ['Pectorals'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 's7', code: 'SP-07', title: 'Segmental Bridging', category: 'Spine / Lumbar', difficulty: 3, sets: 3, reps: 12, description: 'Omurganızı tane tane yerden kaldırarak köprü kurun.', biomechanics: 'Articular control of spine.', safetyFlags: [], muscleGroups: ['Glutes', 'Hamstrings'], rehabPhase: 'Sub-Akut', equipment: ['Mat'] },
    { id: 's8', code: 'SP-08', title: 'Side Plank Knee Down', category: 'Spine / Core', difficulty: 4, sets: 3, reps: 30, description: 'Dizler üzerinde yan köprü pozisyonunda bekleyin.', biomechanics: 'Lateral trunk stability.', safetyFlags: [], muscleGroups: ['Obliques'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 's9', code: 'SP-09', title: 'Cobra Stretch', category: 'Spine / Lumbar', difficulty: 3, sets: 2, reps: 30, description: 'Üst gövdenizi kollarınızla yukarı kaldırıp bekleyin.', biomechanics: 'Static lumbar extension.', safetyFlags: ['Spondylolisthesis'], muscleGroups: ['Abs Stretch'], rehabPhase: 'Kronik', equipment: [] },
    { id: 's10', code: 'SP-10', title: 'Pelvic Tilt', category: 'Spine / Lumbar', difficulty: 1, sets: 3, reps: 20, description: 'Beli yere bastırıp bırakarak pelvisi hareket ettirin.', biomechanics: 'Pelvic dissociation.', safetyFlags: [], muscleGroups: ['Deep Core'], rehabPhase: 'Akut', equipment: [] },

    // --- LOWER LIMB (10) ---
    { id: 'l1', code: 'LL-01', title: 'Wall Squat Isometric', category: 'Lower Limb / Knee', difficulty: 4, sets: 3, reps: 45, description: 'Sırtınızı duvara yaslayıp 90 derece bükülü bekleyin.', biomechanics: 'Quadriceps static loading.', safetyFlags: [], muscleGroups: ['Quads'], rehabPhase: 'Sub-Akut', equipment: ['Wall'] },
    { id: 'l2', code: 'LL-02', title: 'Clamshells Phase 1', category: 'Lower Limb / Hip', difficulty: 3, sets: 3, reps: 15, description: 'Yan yatarken üstteki dizinizi yukarı açın.', biomechanics: 'Gluteus Medius isolation.', safetyFlags: [], muscleGroups: ['Glute Med'], rehabPhase: 'Akut', equipment: ['Band'] },
    { id: 'l3', code: 'LL-03', title: 'Terminal Knee Extension', category: 'Lower Limb / Knee', difficulty: 2, sets: 3, reps: 20, description: 'Dizinizi arkadan bir bantla geriye doğru kilitler gibi itin.', biomechanics: 'VMO activation.', safetyFlags: [], muscleGroups: ['Vastus Medialis'], rehabPhase: 'Akut', equipment: ['Band'] },
    { id: 'l4', code: 'LL-04', title: 'Bulgarian Split Squat', category: 'Lower Limb / Hip', difficulty: 7, sets: 3, reps: 10, description: 'Tek ayağınız arkada bir yükseltideyken squat yapın.', biomechanics: 'Unilateral strength & stability.', safetyFlags: [], muscleGroups: ['Quads', 'Glutes'], rehabPhase: 'Performans', equipment: ['Bench'] },
    { id: 'l5', code: 'LL-05', title: 'Monster Walk', category: 'Lower Limb / Hip', difficulty: 5, sets: 3, reps: 20, description: 'Dizlere bant takılıyken yan yan yürüyün.', biomechanics: 'Hip abductor dynamic control.', safetyFlags: [], muscleGroups: ['Glute Med'], rehabPhase: 'Kronik', equipment: ['Band'] },
    { id: 'l6', code: 'LL-06', title: 'Calf Raise Eccentric', category: 'Lower Limb / Ankle', difficulty: 4, sets: 3, reps: 12, description: 'Parmak ucuna çıkın, topuğunuzu yavaşça (3 sn) indirin.', biomechanics: 'Achilles tendon loading.', safetyFlags: [], muscleGroups: ['Gastrocnemius'], rehabPhase: 'Sub-Akut', equipment: ['Step'] },
    { id: 'l7', code: 'LL-07', title: 'Single Leg RDL', category: 'Lower Limb / Hip', difficulty: 6, sets: 3, reps: 12, description: 'Tek ayak üzerinde öne eğilirken diğer bacağı arkaya uzatın.', biomechanics: 'Hamstring eccentric control.', safetyFlags: [], muscleGroups: ['Hamstrings'], rehabPhase: 'Performans', equipment: [] },
    { id: 'l8', code: 'LL-08', title: 'Adductor Squeeze', category: 'Lower Limb / Hip', difficulty: 2, sets: 3, reps: 15, description: 'Dizlerin arasına bir yastık koyup sıkın.', biomechanics: 'Hip adductor isometric.', safetyFlags: [], muscleGroups: ['Adductors'], rehabPhase: 'Akut', equipment: ['Pillow'] },
    { id: 'l9', code: 'LL-09', title: 'Heel Slide Passive', category: 'Lower Limb / Knee', difficulty: 1, sets: 3, reps: 15, description: 'Topuğunuzu yerde sürükleyerek dizinizi bükün.', biomechanics: 'Knee flexion ROM.', safetyFlags: ['Post-Op Kısıtlar'], muscleGroups: ['Quads Stretch'], rehabPhase: 'Akut', equipment: [] },
    { id: 'l10', code: 'LL-10', title: 'Box Step-Up', category: 'Lower Limb / Functional', difficulty: 5, sets: 3, reps: 12, description: 'Bir kutuya adım atıp kontrollü bir şekilde inin.', biomechanics: 'Functional triple extension.', safetyFlags: [], muscleGroups: ['Glutes', 'Quads'], rehabPhase: 'Kronik', equipment: ['Box'] },

    // --- UPPER LIMB (10) ---
    { id: 'u1', code: 'UL-01', title: 'Scapular Wall Slide', category: 'Upper Limb / Shoulder', difficulty: 4, sets: 3, reps: 12, description: 'Kollarınız duvara yaslıyken yukarı-aşağı kaydırın.', biomechanics: 'Scapular upward rotation control.', safetyFlags: [], muscleGroups: ['Serratus Ant'], rehabPhase: 'Sub-Akut', equipment: ['Wall'] },
    { id: 'u2', code: 'UL-02', title: 'External Rotation Banded', category: 'Upper Limb / Shoulder', difficulty: 3, sets: 3, reps: 15, description: 'Dirseğiniz yanda, bandı dışa doğru çekin.', biomechanics: 'Rotator cuff strengthening.', safetyFlags: [], muscleGroups: ['Infraspinatus'], rehabPhase: 'Sub-Akut', equipment: ['Band'] },
    { id: 'u3', code: 'UL-03', title: 'Pendulum Exercises', category: 'Upper Limb / Shoulder', difficulty: 1, sets: 1, reps: 120, description: 'Gövdeden eğilip kolunuzu yerçekimiyle serbestçe sallayın.', biomechanics: 'Glenohumeral distraction.', safetyFlags: [], muscleGroups: ['Shoulder Capsule'], rehabPhase: 'Akut', equipment: [] },
    { id: 'u4', code: 'UL-04', title: 'Serratus Punch', category: 'Upper Limb / Scapula', difficulty: 2, sets: 3, reps: 15, description: 'Sırtüstü yatarken yumruğunuzu tavana doğru itin.', biomechanics: 'Scapular protraction.', safetyFlags: [], muscleGroups: ['Serratus Ant'], rehabPhase: 'Akut', equipment: [] },
    { id: 'u5', code: 'UL-05', title: 'Y-T-W-L Series', category: 'Upper Limb / Back', difficulty: 5, sets: 2, reps: 10, description: 'Kollarınızla bu harfleri çizerek sırtınızı sıkıştırın.', biomechanics: 'Mid-lower trapezius activation.', safetyFlags: [], muscleGroups: ['Trapezius'], rehabPhase: 'Kronik', equipment: ['Mat'] },
    { id: 'u6', code: 'UL-06', title: 'Wall Push-Up Plus', category: 'Upper Limb / Chest', difficulty: 3, sets: 3, reps: 15, description: 'Duvarda şınav çekin, en tepede kürek kemiklerini açın.', biomechanics: 'Closed chain scapular stability.', safetyFlags: [], muscleGroups: ['Pectorals'], rehabPhase: 'Sub-Akut', equipment: ['Wall'] },
    { id: 'u7', code: 'UL-07', title: 'Wrist Extensor Stretch', category: 'Upper Limb / Wrist', difficulty: 1, sets: 3, reps: 30, description: 'Elinizi aşağı büküp parmak uçlarından hafifçe çekin.', biomechanics: 'Common extensor tendon tension.', safetyFlags: [], muscleGroups: ['Extensors'], rehabPhase: 'Akut', equipment: [] },
    { id: 'u8', code: 'UL-08', title: 'Bicep Eccentric Loading', category: 'Upper Limb / Arm', difficulty: 4, sets: 3, reps: 10, description: 'Ağırlığı hızlı kaldırın, çok yavaş (5 sn) indirin.', biomechanics: 'Tendon remodelling.', safetyFlags: [], muscleGroups: ['Biceps'], rehabPhase: 'Kronik', equipment: ['Dumbbell'] },
    { id: 'u9', code: 'UL-09', title: 'Doorway Pec Stretch', category: 'Upper Limb / Chest', difficulty: 2, sets: 2, reps: 30, description: 'Kapı eşiğinde kollarınızı yaslayıp öne adım atın.', biomechanics: 'Static pectoral stretch.', safetyFlags: ['Instability'], muscleGroups: ['Pectoralis Major'], rehabPhase: 'Kronik', equipment: ['Door'] },
    { id: 'u10', code: 'UL-10', title: 'Thoracic Prone Row', category: 'Upper Limb / Back', difficulty: 5, sets: 3, reps: 12, description: 'Yüzüstü yatarken dirseklerinizi arkaya çekip bekleyin.', biomechanics: 'Scapular retraction.', safetyFlags: [], muscleGroups: ['Rhomboids'], rehabPhase: 'Kronik', equipment: [] },

    // --- STABILITY & BALANCE (10) ---
    { id: 'st1', code: 'ST-01', title: 'Single Leg Stand', category: 'Stability', difficulty: 3, sets: 3, reps: 30, description: 'Tek ayak üzerinde dengede durun, kollar yanlarda.', biomechanics: 'Proprioceptive feedback.', safetyFlags: [], muscleGroups: ['Ankle Stabilizers'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 'st2', code: 'ST-02', title: 'Tandem Walking', category: 'Stability', difficulty: 4, sets: 3, reps: 20, description: 'Bir ipin üzerindeymiş gibi topuk-parmak ucu yürüyün.', biomechanics: 'Dynamic base of support control.', safetyFlags: [], muscleGroups: ['Full Body'], rehabPhase: 'Kronik', equipment: [] },
    { id: 'st3', code: 'ST-03', title: 'Pallof Press Banded', category: 'Stability / Core', difficulty: 5, sets: 3, reps: 12, description: 'Yandan gelen bant direncine karşı kolunuzu öne itin.', biomechanics: 'Anti-rotation core stability.', safetyFlags: [], muscleGroups: ['Core'], rehabPhase: 'Kronik', equipment: ['Band'] },
    { id: 'st4', code: 'ST-04', title: 'Bosu Ball Squat', category: 'Stability', difficulty: 7, sets: 3, reps: 10, description: 'Bosu topu üzerinde dengeyi bozmadan squat yapın.', biomechanics: 'Unstable surface integration.', safetyFlags: [], muscleGroups: ['Lower Limb'], rehabPhase: 'Performans', equipment: ['Bosu'] },
    { id: 'st5', code: 'ST-05', title: 'Star Reach Balance', category: 'Stability', difficulty: 5, sets: 2, reps: 8, description: 'Tek ayak üzerindeyken diğer ayakla yıldızın uçlarına dokunun.', biomechanics: 'Dynamic postural stability.', safetyFlags: [], muscleGroups: ['Glutes', 'Ankle'], rehabPhase: 'Kronik', equipment: [] },
    { id: 'st6', code: 'ST-06', title: 'Figure 8 Walk', category: 'Stability', difficulty: 4, sets: 2, reps: 5, description: 'Yere koyulan iki koni etrafında 8 çizerek yürüyün.', biomechanics: 'Gait variability training.', safetyFlags: [], muscleGroups: ['Neuromuscular'], rehabPhase: 'Sub-Akut', equipment: ['Cones'] },
    { id: 'st7', code: 'ST-07', title: 'Dynamic Woodchop', category: 'Stability / Core', difficulty: 6, sets: 3, reps: 12, description: 'Bandı yukarıdan aşağıya çapraz bir şekilde çekin.', biomechanics: 'Rotational power & stability.', safetyFlags: [], muscleGroups: ['Obliques'], rehabPhase: 'Performans', equipment: ['Band'] },
    { id: 'st8', code: 'ST-08', title: 'Slackline Balance Level 1', category: 'Stability', difficulty: 8, sets: 3, reps: 30, description: 'Gergin bir hat üzerinde denge çalışın.', biomechanics: 'High-level sensorimotor training.', safetyFlags: [], muscleGroups: ['Deep Core'], rehabPhase: 'Performans', equipment: ['Slackline'] },
    { id: 'st9', code: 'ST-09', title: 'Weight Shifting', category: 'Stability', difficulty: 2, sets: 3, reps: 20, description: 'Ayaktayken ağırlığınızı sağa sola aktarın.', biomechanics: 'Static balance training.', safetyFlags: [], muscleGroups: ['Hips'], rehabPhase: 'Akut', equipment: [] },
    { id: 'st10', code: 'ST-10', title: 'Eyes Closed Stand', category: 'Stability', difficulty: 5, sets: 3, reps: 20, description: 'Gözlerinizi kapatıp tek ayak üzerinde durun.', biomechanics: 'Vestibular focus.', safetyFlags: [], muscleGroups: ['Ankle'], rehabPhase: 'Kronik', equipment: [] },

    // --- NEUROLOGICAL (10) ---
    { id: 'n1', code: 'NE-01', title: 'Sit-to-Stand Phase 1', category: 'Neurological', difficulty: 3, sets: 3, reps: 10, description: 'Sandalyeden ellerinizi kullanmadan kalkmaya çalışın.', biomechanics: 'Functional motor pattern.', safetyFlags: [], muscleGroups: ['Quads'], rehabPhase: 'Akut', equipment: ['Chair'] },
    { id: 'n2', code: 'NE-02', title: 'Frenkel Exercises Lying', category: 'Neurological', difficulty: 2, sets: 2, reps: 10, description: 'Yatarken bacağınızı belirli noktalara kontrollü sürükleyin.', biomechanics: 'Coordination / Precision.', safetyFlags: [], muscleGroups: ['Motor Control'], rehabPhase: 'Akut', equipment: [] },
    { id: 'n3', code: 'NE-03', title: 'Mirror Therapy Hand', category: 'Neurological', difficulty: 1, sets: 1, reps: 15, description: 'Sağlam elinizi aynada izleyerek felçli elinizi hareket ettirin.', biomechanics: 'Visual feedback / Plasticity.', safetyFlags: [], muscleGroups: ['Brain / Motor'], rehabPhase: 'Akut', equipment: ['Mirror'] },
    { id: 'n4', code: 'NE-04', title: 'Trunk Rotation Seated', category: 'Neurological', difficulty: 2, sets: 3, reps: 12, description: 'Otururken gövdenizi sağa sola nazikçe döndürün.', biomechanics: 'Axial mobility.', safetyFlags: [], muscleGroups: ['Trunk'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 'n5', code: 'NE-05', title: 'Toe Tapping Seated', category: 'Neurological', difficulty: 1, sets: 3, reps: 20, description: 'Otururken ayak parmak uçlarınızı ritmik vurun.', biomechanics: 'Distal motor control.', safetyFlags: [], muscleGroups: ['Tibialis Ant'], rehabPhase: 'Akut', equipment: [] },
    { id: 'n6', code: 'NE-06', title: 'Hand-Eye Coordination', category: 'Neurological', difficulty: 3, sets: 3, reps: 15, description: 'Küçük bir topu bir elden diğerine atıp tutun.', biomechanics: 'Sensory integration.', safetyFlags: [], muscleGroups: ['Fine Motor'], rehabPhase: 'Sub-Akut', equipment: ['Ball'] },
    { id: 'n7', code: 'NE-07', title: 'PNF Diagonals Upper', category: 'Neurological', difficulty: 4, sets: 3, reps: 10, description: 'Kolunuzu kılıç çeker gibi çapraz yukarı kaldırın.', biomechanics: 'Multisegmental motor recruitment.', safetyFlags: [], muscleGroups: ['Shoulder'], rehabPhase: 'Kronik', equipment: [] },
    { id: 'n8', code: 'NE-08', title: 'Cross-Body Reach', category: 'Neurological', difficulty: 2, sets: 3, reps: 12, description: 'Uzanarak çaprazdaki bir objeye dokunun.', biomechanics: 'Trunk dissociation.', safetyFlags: [], muscleGroups: ['Obliques'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 'n9', code: 'NE-09', title: 'Heel-to-Shin Slide', category: 'Neurological', difficulty: 3, sets: 2, reps: 10, description: 'Bir topuğunuzu diğer kaval kemiğinizde yukarı kaydırın.', biomechanics: 'Lower limb coordination.', safetyFlags: [], muscleGroups: ['Coordination'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 'n10', code: 'NE-10', title: 'Fine Motor Pinching', category: 'Neurological', difficulty: 2, sets: 3, reps: 20, description: 'Parmak uçlarınızla küçük nesneleri kutuya koyun.', biomechanics: 'Dexterity training.', safetyFlags: [], muscleGroups: ['Intrinsic Hand'], rehabPhase: 'Akut', equipment: ['Pegs'] },

    // --- CARDIOVASCULAR & POST-OP (10) ---
    { id: 'c1', code: 'CA-01', title: 'Deep Breathing (SMI)', category: 'Cardiovascular', difficulty: 1, sets: 3, reps: 10, description: 'Derin nefes alıp 3 sn tutup yavaşça verin.', biomechanics: 'Lung expansion / Oxygenation.', safetyFlags: [], muscleGroups: ['Diaphragm'], rehabPhase: 'Akut', equipment: [] },
    { id: 'c2', code: 'CA-02', title: 'Ankle Pumps', category: 'Post-Op', difficulty: 1, sets: 1, reps: 30, description: 'Ayak bileklerinizi hızlıca ileri-geri hareket ettirin.', biomechanics: 'Venous pump / DVT prevention.', safetyFlags: [], muscleGroups: ['Calf'], rehabPhase: 'Akut', equipment: [] },
    { id: 'c3', code: 'CA-03', title: 'Progressive Walking', category: 'Cardiovascular', difficulty: 3, sets: 1, reps: 10, description: 'Dakikada 80-100 adım tempoyla yürüyün.', biomechanics: 'Aerobic capacity.', safetyFlags: ['Heart Rate Limit'], muscleGroups: ['Full Body'], rehabPhase: 'Kronik', equipment: [] },
    { id: 'c4', code: 'CA-04', title: 'Wall Slide Post-Op', category: 'Post-Op', difficulty: 2, sets: 3, reps: 10, description: 'Sırtüstü yatarken bacağınızı duvarda kaydırarak bükün.', biomechanics: 'Active-assisted ROM.', safetyFlags: ['Kısıtlı Derece'], muscleGroups: ['Knee Flexors'], rehabPhase: 'Akut', equipment: ['Wall'] },
    { id: 'c5', code: 'CA-05', title: 'Upper Body Ergometer', category: 'Cardiovascular', difficulty: 4, sets: 1, reps: 10, description: 'Kol pedallarını sabit hızda çevirin.', biomechanics: 'Upper body endurance.', safetyFlags: [], muscleGroups: ['Arms', 'Shoulder'], rehabPhase: 'Kronik', equipment: ['Ergometer'] },
    { id: 'c6', code: 'CA-06', title: 'Glute Squeezes Seated', category: 'Post-Op', difficulty: 1, sets: 3, reps: 15, description: 'Otururken kalça kaslarınızı sıkıp bekleyin.', biomechanics: 'Post-surgical muscle firing.', safetyFlags: [], muscleGroups: ['Glutes'], rehabPhase: 'Akut', equipment: [] },
    { id: 'c7', code: 'CA-07', title: 'Box Step-Up Small', category: 'Post-Op', difficulty: 3, sets: 3, reps: 10, description: 'Alçak bir basamağa adım atıp inin.', biomechanics: 'Eccentric knee loading.', safetyFlags: [], muscleGroups: ['Quads'], rehabPhase: 'Sub-Akut', equipment: ['Step'] },
    { id: 'c8', code: 'CA-08', title: 'Lateral Leg Raise', category: 'Post-Op', difficulty: 3, sets: 3, reps: 12, description: 'Ayaktayken bacağınızı yana doğru açın.', biomechanics: 'Hip stability.', safetyFlags: [], muscleGroups: ['Glute Med'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 'c9', code: 'CA-09', title: 'Seated Knee Extension', category: 'Post-Op', difficulty: 2, sets: 3, reps: 15, description: 'Otururken dizinizi tam düzleştirip bekleyin.', biomechanics: 'Quadriceps recruitment.', safetyFlags: [], muscleGroups: ['Quads'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 'c10', code: 'CA-10', title: 'Interval Treadmill', category: 'Cardiovascular', difficulty: 6, sets: 1, reps: 20, description: '2 dk hızlı, 1 dk yavaş yürüyüş döngüsü yapın.', biomechanics: 'HIIT / Cardio Recovery.', safetyFlags: ['Chest Pain'], muscleGroups: ['Full Body'], rehabPhase: 'Performans', equipment: ['Treadmill'] }
  ];

  static getExercises(): Exercise[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("DB parse error.");
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultExercises));
    return this.defaultExercises;
  }

  static deleteExercise(id: string) {
    const exercises = this.getExercises().filter(ex => ex.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(exercises));
  }

  static addExercise(ex: Exercise) {
    const exercises = [...this.getExercises(), ex];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(exercises));
  }

  static updateExercise(updatedEx: Exercise) {
    const exercises = this.getExercises().map(ex => ex.id === updatedEx.id ? updatedEx : ex);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(exercises));
  }

  static saveProfile(profile: PatientProfile) {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  static getProfile(): PatientProfile | null {
    const saved = localStorage.getItem(this.PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  }
}
