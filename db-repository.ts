
import { Exercise, PatientProfile, ProgressReport } from './types.ts';

/**
 * PHYSIOCORE DB REPOSITORY (MASTER)
 * Bölüm 8: "Ultra" Senaryolar - 30 Adet Klinik Master Egzersiz
 */
export class PhysioDB {
  private static STORAGE_KEY = 'physiocore_exercises';
  private static PROFILE_KEY = 'physiocore_patient';

  private static defaultExercises: Exercise[] = [
    // --- OMURGA (SPINE) - 10 SENARYO ---
    {
      id: 's1', code: 'M51.1', title: 'McKenzie Prone Press-up', category: 'Spine / Lumbar', difficulty: 4, sets: 3, reps: 10,
      description: 'Yüzüstü yatarken kollarınızla gövdenizi yukarı itin. Pelvisin yerde kalmasına dikkat edin.',
      biomechanics: 'Lumbar Extension / Centralization of Disc Material. Disk içi nükleus sıvısının merkeze akışı simüle edilir.',
      safetyFlags: ['Acute Fracture', 'Spondylolisthesis', 'Radiating pain below knee']
    },
    {
      id: 's2', code: 'CORE-01', title: 'Dead Bug', category: 'Spine / Core', difficulty: 3, sets: 3, reps: 12,
      description: 'Sırtüstü yatarken transversus abdominis kaslarını korse gibi sıkın. Zıt kol ve bacağı kontrollü indirin.',
      biomechanics: 'Transversus Abdominis Activation / Spinal Neutrality. Bel boşluğu sabitlenmeli (Anti-extension).',
      safetyFlags: ['Severe Disc Herniation (Acute)']
    },
    {
      id: 's3', code: 'CORE-02', title: 'Bird-Dog', category: 'Spine / Core', difficulty: 4, sets: 3, reps: 10,
      description: 'Dört ayak üzerinde zıt kol ve bacağı uzatın. Sırtınızda bir su bardağı varmış gibi dengede kalın.',
      biomechanics: 'Cross-Chain Stability / Multifidus Activation. Gövde rotasyonu minimalize edilmeli.',
      safetyFlags: ['Shoulder Instability']
    },
    {
      id: 's4', code: 'NECK-01', title: 'Chin Tuck', category: 'Spine / Cervical', difficulty: 2, sets: 2, reps: 15,
      description: 'Başınızı arkaya doğru çekerek çifte çene yapın. Boyun arkasındaki suboksipital kasları uzatın.',
      biomechanics: 'Cervical Retraction / Deep Flexor Activation. Üst servikal mobilite odaklı.',
      safetyFlags: ['Severe Stenosis']
    },
    {
      id: 's5', code: 'MOB-01', title: 'Cat-Camel', category: 'Spine / Mobility', difficulty: 2, sets: 2, reps: 12,
      description: 'Omurganızı bir piyano tuşu gibi segment segment hareket ettirerek yukarı ve aşağı bükün.',
      biomechanics: 'Segmental Spinal Mobility. Faset eklemlerin kayma kinematiği simüle edilir.',
      safetyFlags: []
    },
    {
      id: 's6', code: 'CORE-03', title: 'Pelvic Tilt', category: 'Spine / Lumbar', difficulty: 2, sets: 3, reps: 15,
      description: 'Belinizi yere bastırarak pelvisinizi geriye devirin. Karın kaslarını kullanarak kontrolü sağlayın.',
      biomechanics: 'Lumbopelvic Rhythm / Posterior Pelvic Tilt. Sakrum üzerindeki sarkaç analojisi.',
      safetyFlags: []
    },
    {
      id: 's7', code: 'CORE-04', title: 'Side Plank', category: 'Spine / Core', difficulty: 6, sets: 3, reps: 30,
      description: 'Dirsek üzerinde yan köprü kurun. Omuz, kalça ve ayak aynı çizgide olmalı.',
      biomechanics: 'Quadratus Lumborum & Oblique Focus. Lateral stabilite ve vektörel yüklenme.',
      safetyFlags: ['Shoulder Impingement']
    },
    {
      id: 's8', code: 'MOB-02', title: 'Thoracic Extension (Roller)', category: 'Spine / Thoracic', difficulty: 3, sets: 2, reps: 10,
      description: 'Foam roller üzerinde torakal omurgayı geriye doğru esnetin. Kaburgaların açılmasını hissedin.',
      biomechanics: 'Thoracic Mobility / Ribcage Expansion. Ekstansiyon kapasitesi artırımı.',
      safetyFlags: ['Osteoporosis (Severe)', 'Rib Fracture history']
    },
    {
      id: 's9', code: 'STRETCH-01', title: 'QL Stretch', category: 'Spine / Lumbar', difficulty: 2, sets: 3, reps: 20,
      description: 'Otururken veya ayakta yan tarafa doğru bükülerek bel yanındaki gerginliği hissedin.',
      biomechanics: 'Quadratus Lumborum Myofascial Release. Fasyal dokunun mikroskobik gerilme simülasyonu.',
      safetyFlags: []
    },
    {
      id: 's10', code: 'POSTURE-01', title: 'Wall Slide', category: 'Spine / Postural', difficulty: 4, sets: 3, reps: 10,
      description: 'Sırtınızı duvara yaslayın ve kollarınızı "W" formunda yukarı aşağı kaydırın.',
      biomechanics: 'Scapular-Spinal Synergy. Kürek kemiklerinin rotasyonel ritmi takip edilir.',
      safetyFlags: ['Shoulder Pain (High VAS)']
    },

    // --- ALT EKSTREMİTE (LOWER LIMB) - 10 SENARYO ---
    {
      id: 'l11', code: 'KNEE-01', title: 'Terminal Knee Extension (TKE)', category: 'Lower Limb / Knee', difficulty: 3, sets: 3, reps: 15,
      description: 'Direnç bandı eşliğinde dizinizi tam kilitlenme noktasına kadar itin.',
      biomechanics: 'Vastus Medialis (VMO) Activation. Diz kilitlendiğinde kasta elektrik arkı simülasyonu.',
      safetyFlags: ['Meniscus Tear (Acute)']
    },
    {
      id: 'l12', code: 'KNEE-02', title: 'Heel Slide', category: 'Lower Limb / Knee', difficulty: 2, sets: 3, reps: 10,
      description: 'Sırtüstü yatarken topuğunuzu kalçanıza doğru kaydırarak dizinizi bükün.',
      biomechanics: 'Knee Flexion ROM. Eklem içi sinoviyal sıvının kıkırdağı yağlaması simüle edilir.',
      safetyFlags: ['Post-Op Weight Bearing limits']
    },
    {
      id: 'l13', code: 'HIP-01', title: 'Clam Shell', category: 'Lower Limb / Hip', difficulty: 3, sets: 3, reps: 15,
      description: 'Yan yatarken dizlerinizi üst üste getirin ve pelvisi bozmadan üstteki dizinizi açın.',
      biomechanics: 'Gluteus Medius Focus. Pelvik stabilite ve canlı açı (°) takibi.',
      safetyFlags: ['Hip Bursitis']
    },
    {
      id: 'l14', code: 'BAL-01', title: 'Single Leg Balance', category: 'Lower Limb / Stability', difficulty: 5, sets: 3, reps: 45,
      description: 'Tek ayak üzerinde durun. Dengenizi korumak için ayak bileği kaslarını kullanın.',
      biomechanics: 'Proprioception / Ankle Stability. Bağların (ATFL/CFL) radar sinyali simülasyonu.',
      safetyFlags: ['Ankle Sprain (Grade 3)']
    },
    {
      id: 'l15', code: 'LEG-01', title: 'Clinical Squat', category: 'Lower Limb / Strength', difficulty: 5, sets: 3, reps: 12,
      description: 'Ağırlığınızı topuklara vererek çömelin. Dizlerin içe kaçmamasına dikkat edin.',
      biomechanics: 'Kinetic Chain Control. Diz kapağı iz düşümü "Güvenli Bölge" lazeriyle gösterilir.',
      safetyFlags: ['PFPS (Patellofemoral Pain Syndrome)']
    },
    {
      id: 'l16', code: 'HIP-02', title: 'Glute Bridge', category: 'Lower Limb / Hip', difficulty: 4, sets: 3, reps: 15,
      description: 'Sırtüstü yatarken ayak tabanlarını basın ve kalçanızı gökyüzüne kaldırın.',
      biomechanics: 'Posterior Chain Activation. Hamstring ve Gluteus Maximus arası enerji akışı.',
      safetyFlags: []
    },
    {
      id: 'l17', code: 'LEG-02', title: 'Lateral Lunge', category: 'Lower Limb / Functional', difficulty: 5, sets: 3, reps: 10,
      description: 'Yan tarafa büyük bir adım atın ve kalçanızı geriye vererek çömelin.',
      biomechanics: 'Frontal Plane Stability. Adduktör kas grubunun eksantrik frenleme kuvveti.',
      safetyFlags: ['Groid Strain']
    },
    {
      id: 'l18', code: 'ANKLE-01', title: 'Calf Raises', category: 'Lower Limb / Ankle', difficulty: 3, sets: 3, reps: 15,
      description: 'Parmak uçlarınızda yükselin ve kontrollü bir şekilde topuklarınızı indirin.',
      biomechanics: 'Gastroc-Soleus Complex. Aşil tendonu üzerindeki gerilim grafiği simüle edilir.',
      safetyFlags: ['Achilles Tendonitis (Acute)']
    },
    {
      id: 'l19', code: 'LEG-03', title: 'Wall Sit', category: 'Lower Limb / Endurance', difficulty: 6, sets: 3, reps: 45,
      description: 'Sırtınızı duvara yaslayarak 90 derece çömelme pozisyonunda bekleyin.',
      biomechanics: 'Isometric Quadriceps Endurance. Kaslarda ısı haritası (Sarıdan Kırmızıya) simülasyonu.',
      safetyFlags: ['Knee Effusion']
    },
    {
      id: 'l20', code: 'LEG-04', title: 'Hamstring Curls (Swiss Ball)', category: 'Lower Limb / Strength', difficulty: 7, sets: 3, reps: 12,
      description: 'Topuklarınız topun üzerindeyken kalçanızı kaldırın ve topu kendinize çekin.',
      biomechanics: 'Neuromuscular Control. Top üzerindeki mikro-vibrasyonların dengelenmesi.',
      safetyFlags: ['Hamstring Tear (History)']
    },

    // --- ÜST EKSTREMİTE (UPPER LIMB) - 10 SENARYO ---
    {
      id: 'u21', code: 'SHO-01', title: 'Pendulum (Codman’s)', category: 'Upper Limb / Shoulder', difficulty: 1, sets: 2, reps: 30,
      description: 'Öne eğilin ve sorunlu kolunuzun yerçekimiyle serbestçe sallanmasına izin verin.',
      biomechanics: 'Shoulder Distraction. Omuz eklem aralığının (Space) yerçekimi ile açılması.',
      safetyFlags: ['Acute Fracture']
    },
    {
      id: 'u22', code: 'SHO-02', title: 'External Rotation (Band)', category: 'Upper Limb / Shoulder', difficulty: 3, sets: 3, reps: 15,
      description: 'Dirseğiniz gövdenize bitişik şekilde direnç bandını dışa doğru çekin.',
      biomechanics: 'Rotator Cuff (Infraspinatus) Focus. Spiral enerji hattı simülasyonu.',
      safetyFlags: ['Full Thickness Tear']
    },
    {
      id: 'u23', code: 'SHO-03', title: 'Serratus Punch', category: 'Upper Limb / Scapula', difficulty: 3, sets: 3, reps: 15,
      description: 'Sırtüstü yatarken kollarınızı tavana uzatın ve kürek kemiklerinizi yerden yükseltin.',
      biomechanics: 'Scapular Protraction. Mıknatıs efektiyle kürek kemiğinin yapışması simüle edilir.',
      safetyFlags: []
    },
    {
      id: 'u24', code: 'WRIST-01', title: 'Wrist Extensor Stretch', category: 'Upper Limb / Wrist', difficulty: 2, sets: 3, reps: 20,
      description: 'Kolunuzu uzatın, el bileğinizi aşağı bükerek diğer elinizle hafifçe bastırın.',
      biomechanics: 'Tendon Realignment. Mikroskobik tendon liflerinin uzama animasyonu.',
      safetyFlags: []
    },
    {
      id: 'u25', code: 'SHO-04', title: 'Y-T-W-L Series', category: 'Upper Limb / Postural', difficulty: 5, sets: 3, reps: 10,
      description: 'Kollarınızla Y, T, W ve L harflerini oluşturarak kürek kemiklerinizi sıkıştırın.',
      biomechanics: 'Scapular Retraction & Lower Trapezius. Renk kodlu kas aktivasyon takibi.',
      safetyFlags: ['Thoracic Outlet Syndrome']
    },
    {
      id: 'u26', code: 'SHO-05', title: 'Scapular Pull-ups', category: 'Upper Limb / Scapula', difficulty: 6, sets: 3, reps: 8,
      description: 'Barfiks barında kollarınızı bükmeden sadece kürek kemiklerinizi aşağı çekerek yükselin.',
      biomechanics: 'Scapular Depression. Kürek kemiklerinin aşağı kayma kinematiği simüle edilir.',
      safetyFlags: ['Shoulder Dislocation history']
    },
    {
      id: 'u27', code: 'ARM-01', title: 'Wall Push-ups', category: 'Upper Limb / Strength', difficulty: 3, sets: 3, reps: 12,
      description: 'Duvardan destek alarak şınav çekin. Dirseklerinizin dışa çok açılmamasına dikkat edin.',
      biomechanics: 'Closed Kinetic Chain. Bilek, dirsek ve omuz arası yük dağılımı ısı haritası.',
      safetyFlags: ['Carpal Tunnel Syndrome']
    },
    {
      id: 'u28', code: 'ARM-02', title: 'Bicep Curl (Eccentric Focus)', category: 'Upper Limb / Strength', difficulty: 4, sets: 3, reps: 10,
      description: 'Ağırlığı kaldırın ve çok yavaş bir şekilde (5 saniye) aşağı indirin.',
      biomechanics: 'Eccentric Force Control. Kasın uzarken ürettiği kuvvetin bar grafik simülasyonu.',
      safetyFlags: []
    },
    {
      id: 'u29', code: 'ARM-03', title: 'Overhead Tricep Extension', category: 'Upper Limb / Strength', difficulty: 4, sets: 3, reps: 12,
      description: 'Ağırlığı başınızın arkasına indirin ve kollarınızı tam yukarı uzatın.',
      biomechanics: 'Triceps Long Head Tension. Skapular stabilite kontrolü.',
      safetyFlags: ['Shoulder Laxity']
    },
    {
      id: 'u30', code: 'NERVE-01', title: 'Median Nerve Gliding', category: 'Upper Limb / Neural', difficulty: 2, sets: 3, reps: 15,
      description: 'Elinizi ve başınızı koordineli hareket ettirerek koldaki siniri "kaydırın".',
      biomechanics: 'Neural Mobilization. Sinirin faysa içindeki "Mavi iplik" kayma simülasyonu.',
      safetyFlags: ['Severe Neural Inflammation']
    }
  ];

  private static currentProfile: PatientProfile | null = null;

  static getExercises(): Exercise[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Local storage parse error, falling back to defaults.");
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

  static saveProfile(profile: PatientProfile) {
    this.currentProfile = profile;
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  static getProfile(): PatientProfile | null {
    if (!this.currentProfile) {
      const saved = localStorage.getItem(this.PROFILE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure progressHistory exists
          if (parsed && !parsed.progressHistory) {
            parsed.progressHistory = [];
          }
          this.currentProfile = parsed;
        } catch (e) {
          return null;
        }
      }
    }
    return this.currentProfile;
  }

  static addProgressReport(report: ProgressReport) {
    const profile = this.getProfile();
    if (profile) {
      profile.progressHistory = [...(profile.progressHistory || []), report];
      this.saveProfile(profile);
    }
  }
}
