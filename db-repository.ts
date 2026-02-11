
import { Exercise, PatientProfile, ProgressReport } from './types.ts';

export class PhysioDB {
  private static STORAGE_KEY = 'physiocore_exercises';
  private static PROFILE_KEY = 'physiocore_patient';

  private static defaultExercises: Exercise[] = [
    // --- SPINE (10) ---
    { id: 's1', code: 'SP-01', title: 'McKenzie Prone Press-up', titleTr: 'McKenzie Yüzüstü Bas-Yukarı', category: 'Spine / Lumbar', difficulty: 4, sets: 3, reps: 10, description: 'Yüzüstü yatarken kollarınızla gövdenizi yukarı itin. Pelvis yerde kalmalı.', biomechanics: 'Lumbar Extension / Centralization.', safetyFlags: ['Akut Kırık'], muscleGroups: ['Erector Spinae'], rehabPhase: 'Sub-Akut', equipment: ['Mat'] },
    { id: 's2', code: 'SP-02', title: 'Cat-Camel Mobility', titleTr: 'Kedi-Deve Mobilizasyonu', category: 'Spine / Thoracic', difficulty: 2, sets: 2, reps: 15, description: 'Dört ayak üzerinde omurganızı yukarı yuvarlayın ve aşağı çukurlaştırın.', biomechanics: 'Segmental Spinal Mobility.', safetyFlags: [], muscleGroups: ['Multifidus'], rehabPhase: 'Akut', equipment: [] },
    { id: 's3', code: 'SP-03', title: 'Bird-Dog Stability', titleTr: 'Bird-Dog Stabilizasyonu', category: 'Spine / Core', difficulty: 5, sets: 3, reps: 12, description: 'Zıt kol ve bacağınızı aynı anda uzatın, beli sabit tutun.', biomechanics: 'Cross-chain neuromuscular control.', safetyFlags: [], muscleGroups: ['Core', 'Gluteus'], rehabPhase: 'Kronik', equipment: [] },
    { id: 's4', code: 'SP-04', title: 'Dead Bug Level 1', titleTr: 'Dead Bug Seviye 1', category: 'Spine / Core', difficulty: 3, sets: 3, reps: 10, description: 'Sırtüstü yatarken zıt uzuvları yere yaklaştırın, beli bastırın.', biomechanics: 'Anti-extension core stability.', safetyFlags: [], muscleGroups: ['Abs'], rehabPhase: 'Akut', equipment: [] },
    { id: 's5', code: 'SP-05', title: 'Chin Tuck Isometric', titleTr: 'İzometrik Çene İçeri', category: 'Spine / Cervical', difficulty: 2, sets: 3, reps: 10, description: 'Çenenizi geriye doğru çekerek boyun arkasını uzatın.', biomechanics: 'Deep Neck Flexor activation.', safetyFlags: [], muscleGroups: ['Longus Colli'], rehabPhase: 'Akut', equipment: [] },
    { id: 's6', code: 'SP-06', title: 'Thoracic Windmill', titleTr: 'Torakal Yel Değirmeni', category: 'Spine / Thoracic', difficulty: 4, sets: 2, reps: 10, description: 'Yan yatarken üstteki kolunuzla geriye doğru daire çizin.', biomechanics: 'Thoracic rotation mobility.', safetyFlags: [], muscleGroups: ['Pectorals'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 's7', code: 'SP-07', title: 'Segmental Bridging', titleTr: 'Segmental Köprü Kurma', category: 'Spine / Lumbar', difficulty: 3, sets: 3, reps: 12, description: 'Omurganızı tane tane yerden kaldırarak köprü kurun.', biomechanics: 'Articular control of spine.', safetyFlags: [], muscleGroups: ['Glutes', 'Hamstrings'], rehabPhase: 'Sub-Akut', equipment: ['Mat'] },
    { id: 's8', code: 'SP-08', title: 'Side Plank Knee Down', titleTr: 'Diz Üstü Yan Plank', category: 'Spine / Core', difficulty: 4, sets: 3, reps: 30, description: 'Dizler üzerinde yan köprü pozisyonunda bekleyin.', biomechanics: 'Lateral trunk stability.', safetyFlags: [], muscleGroups: ['Obliques'], rehabPhase: 'Sub-Akut', equipment: [] },
    { id: 's9', code: 'SP-09', title: 'Cobra Stretch', titleTr: 'Kobra Esnemesi', category: 'Spine / Lumbar', difficulty: 3, sets: 2, reps: 30, description: 'Üst gövdenizi kollarınızla yukarı kaldırıp bekleyin.', biomechanics: 'Static lumbar extension.', safetyFlags: ['Spondylolisthesis'], muscleGroups: ['Abs Stretch'], rehabPhase: 'Kronik', equipment: [] },
    { id: 's10', code: 'SP-10', title: 'Pelvic Tilt', titleTr: 'Pelvik Eğim', category: 'Spine / Lumbar', difficulty: 1, sets: 3, reps: 20, description: 'Beli yere bastırıp bırakarak pelvisi hareket ettirin.', biomechanics: 'Pelvic dissociation.', safetyFlags: [], muscleGroups: ['Deep Core'], rehabPhase: 'Akut', equipment: [] },

    // --- LOWER LIMB (10) ---
    { id: 'l1', code: 'LL-01', title: 'Wall Squat Isometric', titleTr: 'İzometrik Duvar Squatı', category: 'Lower Limb / Knee', difficulty: 4, sets: 3, reps: 45, description: 'Sırtınızı duvara yaslayıp 90 derece bükülü bekleyin.', biomechanics: 'Quadriceps static loading.', safetyFlags: [], muscleGroups: ['Quads'], rehabPhase: 'Sub-Akut', equipment: ['Wall'] },
    { id: 'l2', code: 'LL-02', title: 'Clamshells Phase 1', titleTr: 'Clamshell Faz 1', category: 'Lower Limb / Hip', difficulty: 3, sets: 3, reps: 15, description: 'Yan yatarken üstteki dizinizi yukarı açın.', biomechanics: 'Gluteus Medius isolation.', safetyFlags: [], muscleGroups: ['Glute Med'], rehabPhase: 'Akut', equipment: ['Band'] },
    { id: 'l3', code: 'LL-03', title: 'Terminal Knee Extension', titleTr: 'Terminal Diz Ekstansiyonu', category: 'Lower Limb / Knee', difficulty: 2, sets: 3, reps: 20, description: 'Dizinizi arkadan bir bantla geriye doğru kilitler gibi itin.', biomechanics: 'VMO activation.', safetyFlags: [], muscleGroups: ['Vastus Medialis'], rehabPhase: 'Akut', equipment: ['Band'] },
    { id: 'l4', code: 'LL-04', title: 'Bulgarian Split Squat', titleTr: 'Bulgar Split Squatı', category: 'Lower Limb / Hip', difficulty: 7, sets: 3, reps: 10, description: 'Tek ayağınız arkada bir yükseltideyken squat yapın.', biomechanics: 'Unilateral strength & stability.', safetyFlags: [], muscleGroups: ['Quads', 'Glutes'], rehabPhase: 'Performans', equipment: ['Bench'] },
    { id: 'l5', code: 'LL-05', title: 'Monster Walk', titleTr: 'Canavar Yürüyüşü', category: 'Lower Limb / Hip', difficulty: 5, sets: 3, reps: 20, description: 'Dizlere bant takılıyken yan yan yürüyün.', biomechanics: 'Hip abductor dynamic control.', safetyFlags: [], muscleGroups: ['Glute Med'], rehabPhase: 'Kronik', equipment: ['Band'] },
    { id: 'l6', code: 'LL-06', title: 'Calf Raise Eccentric', titleTr: 'Eksantrik Kalf Kaldırma', category: 'Lower Limb / Ankle', difficulty: 4, sets: 3, reps: 12, description: 'Parmak ucuna çıkın, topuğunuzu yavaşça (3 sn) indirin.', biomechanics: 'Achilles tendon loading.', safetyFlags: [], muscleGroups: ['Gastrocnemius'], rehabPhase: 'Sub-Akut', equipment: ['Step'] },
    { id: 'l7', code: 'LL-07', title: 'Single Leg RDL', titleTr: 'Tek Bacak RDL', category: 'Lower Limb / Hip', difficulty: 6, sets: 3, reps: 12, description: 'Tek ayak üzerinde öne eğilirken diğer bacağı arkaya uzatın.', biomechanics: 'Hamstring eccentric control.', safetyFlags: [], muscleGroups: ['Hamstrings'], rehabPhase: 'Performans', equipment: [] },
    { id: 'l8', code: 'LL-08', title: 'Adductor Squeeze', titleTr: 'Adduktör Sıkıştırma', category: 'Lower Limb / Hip', difficulty: 2, sets: 3, reps: 15, description: 'Dizlerin arasına bir yastık koyup sıkın.', biomechanics: 'Hip adductor isometric.', safetyFlags: [], muscleGroups: ['Adductors'], rehabPhase: 'Akut', equipment: ['Pillow'] },
    { id: 'l9', code: 'LL-09', title: 'Heel Slide Passive', titleTr: 'Pasif Topuk Kaydırma', category: 'Lower Limb / Knee', difficulty: 1, sets: 3, reps: 15, description: 'Topuğunuzu yerde sürükleyerek dizinizi bükün.', biomechanics: 'Knee flexion ROM.', safetyFlags: ['Post-Op Kısıtlar'], muscleGroups: ['Quads Stretch'], rehabPhase: 'Akut', equipment: [] },
    { id: 'l10', code: 'LL-10', title: 'Box Step-Up', titleTr: 'Kutuya Bas-Çık', category: 'Lower Limb / Functional', difficulty: 5, sets: 3, reps: 12, description: 'Bir kutuya adım atıp kontrollü bir şekilde inin.', biomechanics: 'Functional triple extension.', safetyFlags: [], muscleGroups: ['Glutes', 'Quads'], rehabPhase: 'Kronik', equipment: ['Box'] },

    // --- UPPER LIMB (10) ---
    { id: 'u1', code: 'UL-01', title: 'Scapular Wall Slide', titleTr: 'Skapular Duvar Kaydırma', category: 'Upper Limb / Shoulder', difficulty: 4, sets: 3, reps: 12, description: 'Kollarınız duvara yaslıyken yukarı-aşağı kaydırın.', biomechanics: 'Scapular upward rotation control.', safetyFlags: [], muscleGroups: ['Serratus Ant'], rehabPhase: 'Sub-Akut', equipment: ['Wall'] },
    { id: 'u2', code: 'UL-02', title: 'External Rotation Banded', titleTr: 'Bantla Dış Rotasyon', category: 'Upper Limb / Shoulder', difficulty: 3, sets: 3, reps: 15, description: 'Dirseğiniz yanda, bandı dışa doğru çekin.', biomechanics: 'Rotator cuff strengthening.', safetyFlags: [], muscleGroups: ['Infraspinatus'], rehabPhase: 'Sub-Akut', equipment: ['Band'] },
    { id: 'u3', code: 'UL-03', title: 'Pendulum Exercises', titleTr: 'Pendulum (Sarkaç) Egzersizi', category: 'Upper Limb / Shoulder', difficulty: 1, sets: 1, reps: 120, description: 'Gövdeden eğilip kolunuzu yerçekimiyle serbestçe sallayın.', biomechanics: 'Glenohumeral distraction.', safetyFlags: [], muscleGroups: ['Shoulder Capsule'], rehabPhase: 'Akut', equipment: [] },
    { id: 'u4', code: 'UL-04', title: 'Serratus Punch', titleTr: 'Serratus Punch (Yumruk)', category: 'Upper Limb / Scapula', difficulty: 2, sets: 3, reps: 15, description: 'Sırtüstü yatarken yumruğunuzu tavana doğru itin.', biomechanics: 'Scapular protraction.', safetyFlags: [], muscleGroups: ['Serratus Ant'], rehabPhase: 'Akut', equipment: [] },
    { id: 'u5', code: 'UL-05', title: 'Y-T-W-L Series', titleTr: 'Y-T-W-L Serisi', category: 'Upper Limb / Back', difficulty: 5, sets: 2, reps: 10, description: 'Kollarınızla bu harfleri çizerek sırtınızı sıkıştırın.', biomechanics: 'Mid-lower trapezius activation.', safetyFlags: [], muscleGroups: ['Trapezius'], rehabPhase: 'Kronik', equipment: ['Mat'] },
    { id: 'u6', code: 'UL-06', title: 'Wall Push-Up Plus', titleTr: 'Duvar Şınavı Plus', category: 'Upper Limb / Chest', difficulty: 3, sets: 3, reps: 15, description: 'Duvarda şınav çekin, en tepede kürek kemiklerini açın.', biomechanics: 'Closed chain scapular stability.', safetyFlags: [], muscleGroups: ['Pectorals'], rehabPhase: 'Sub-Akut', equipment: ['Wall'] },
    { id: 'u7', code: 'UL-07', title: 'Wrist Extensor Stretch', titleTr: 'El Bileği Esnetme', category: 'Upper Limb / Wrist', difficulty: 1, sets: 3, reps: 30, description: 'Elinizi aşağı büküp parmak uçlarından hafifçe çekin.', biomechanics: 'Common extensor tendon tension.', safetyFlags: [], muscleGroups: ['Extensors'], rehabPhase: 'Akut', equipment: [] },
    { id: 'u8', code: 'UL-08', title: 'Bicep Eccentric Loading', titleTr: 'Biceps Eksantrik Yükleme', category: 'Upper Limb / Arm', difficulty: 4, sets: 3, reps: 10, description: 'Ağırlığı hızlı kaldırın, çok yavaş (5 sn) indirin.', biomechanics: 'Tendon remodelling.', safetyFlags: [], muscleGroups: ['Biceps'], rehabPhase: 'Kronik', equipment: ['Dumbbell'] },
    { id: 'u9', code: 'UL-09', title: 'Doorway Pec Stretch', titleTr: 'Kapı Eşiği Göğüs Esnetme', category: 'Upper Limb / Chest', difficulty: 2, sets: 2, reps: 30, description: 'Kapı eşiğinde kollarınızı yaslayıp öne adım atın.', biomechanics: 'Static pectoral stretch.', safetyFlags: ['Instability'], muscleGroups: ['Pectoralis Major'], rehabPhase: 'Kronik', equipment: ['Door'] },
    { id: 'u10', code: 'UL-10', title: 'Thoracic Prone Row', titleTr: 'Yüzüstü Torakal Kürek', category: 'Upper Limb / Back', difficulty: 5, sets: 3, reps: 12, description: 'Yüzüstü yatarken dirseklerinizi arkaya çekip bekleyin.', biomechanics: 'Scapular retraction.', safetyFlags: [], muscleGroups: ['Rhomboids'], rehabPhase: 'Kronik', equipment: [] }
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
