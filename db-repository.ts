
import { Exercise, PatientProfile } from './types.ts';

/**
 * PhysioCore AI - Clinical Seed Data (v3.5)
 * Her kategori için 10'ar adet tıbbi standartlarda egzersiz
 */
const SEED_EXERCISES: Exercise[] = [
  // --- SPINE (Omurga) ---
  { id: 'sp1', code: 'SP-001', title: 'McKenzie Prone Press-up', titleTr: 'McKenzie Yüzüstü Şınav', category: 'Spine / Lumbar', difficulty: 3, sets: 3, reps: 10, description: 'Yüzüstü yatın, ellerinizle gövdenizi yukarı itin, kalçanız yerde kalsın.', biomechanics: 'L4-L5 disk merkeziizasyonu sağlar.', safetyFlags: ['Akut fıtıkta ağrı artarsa durun'], rehabPhase: 'Akut', isMotion: true },
  { id: 'sp2', code: 'SP-002', title: 'Dead Bug', titleTr: 'Ölü Böcek Egzersizi', category: 'Spine / Core', difficulty: 4, sets: 3, reps: 12, description: 'Sırtüstü yatın, zıt kol ve bacağı kontrollü indirin.', biomechanics: 'Transversus abdominis aktivasyonu ve spinal stabilite.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'sp3', code: 'SP-003', title: 'Bird-Dog', titleTr: 'Kuş-Köpek Egzersizi', category: 'Spine / Core', difficulty: 5, sets: 3, reps: 10, description: 'Dört ayak üzerinde zıt kol ve bacağı uzatın.', biomechanics: 'Multifidus kası güçlendirme.', safetyFlags: ['Denge kaybına dikkat'], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'sp4', code: 'SP-004', title: 'Cat-Camel', titleTr: 'Kedi-Deve Mobilizasyonu', category: 'Spine / Thoracic', difficulty: 2, sets: 2, reps: 15, description: 'Sırtınızı kamburlaştırın ve sonra çukurlaştırın.', biomechanics: 'Segmental omurga mobilizasyonu.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'sp5', code: 'SP-005', title: 'Pelvic Tilt', titleTr: 'Pelvik Tilt', category: 'Spine / Lumbar', difficulty: 2, sets: 3, reps: 15, description: 'Belinizi yere bastırıp bırakın.', biomechanics: 'Lomber stabilite başlangıcı.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'sp6', code: 'SP-006', title: 'Chin Tuck', titleTr: 'Çene İçeri (Boyun)', category: 'Spine / Cervical', difficulty: 2, sets: 3, reps: 10, description: 'Başınızı arkaya doğru çekerek çift çene yapın.', biomechanics: 'Derin boyun fleksör aktivasyonu.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'sp7', code: 'SP-007', title: 'Child’s Pose', titleTr: 'Çocuk Pozisyonu', category: 'Spine / Stretch', difficulty: 1, sets: 3, reps: 30, description: 'Topuklarınıza oturun ve kollarınızı ileri uzatın.', biomechanics: 'Paraspinal kas germe.', safetyFlags: ['Diz ağrısı varsa kısıtlı yapın'], rehabPhase: 'Akut', isMotion: true },
  { id: 'sp8', code: 'SP-008', title: 'Lumbar Rotation', titleTr: 'Bel Rotasyonu', category: 'Spine / Lumbar', difficulty: 2, sets: 2, reps: 10, description: 'Dizler bükülü, sağa ve sola devirin.', biomechanics: 'Lomber rotasyonel mobilite.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'sp9', code: 'SP-009', title: 'Thorakal Ekstansiyon', titleTr: 'Torakal Ekstansiyon', category: 'Spine / Thoracic', difficulty: 3, sets: 3, reps: 10, description: 'Rulo üzerinde geriye doğru esneyin.', biomechanics: 'Kifoz düzeltme ve mobilite.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'sp10', code: 'SP-010', title: 'Wall Slide (Spine)', titleTr: 'Duvarda Kayma', category: 'Spine / Postural', difficulty: 4, sets: 3, reps: 12, description: 'Sırtınız duvarda, kollarınızı yukarı kaydırın.', biomechanics: 'Skapular ve spinal postural kontrol.', safetyFlags: [], rehabPhase: 'Performans', isMotion: true },

  // --- LOWER LIMB (Alt Ekstremite) ---
  { id: 'll1', code: 'LL-001', title: 'Terminal Knee Extension', titleTr: 'Son Derece Diz Ekstansiyonu', category: 'Lower Limb / Knee', difficulty: 3, sets: 3, reps: 15, description: 'Diz arkasındaki direnç bandını gererek dizinizi kilitleyin.', biomechanics: 'Vastus Medialis Obliquus (VMO) izolasyonu.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'll2', code: 'LL-002', title: 'Clam Shell', titleTr: 'İstiridye Egzersizi', category: 'Lower Limb / Hip', difficulty: 3, sets: 3, reps: 15, description: 'Yan yatın, dizleri bükün ve üstteki dizi açın.', biomechanics: 'Gluteus Medius aktivasyonu.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'll3', code: 'LL-003', title: 'Heel Slide', titleTr: 'Topuk Kaydırma', category: 'Lower Limb / Knee', difficulty: 2, sets: 3, reps: 12, description: 'Topuğunuzu zeminde kaydırarak kalçanıza çekin.', biomechanics: 'Diz ROM artırımı.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'll4', code: 'LL-004', title: 'Straight Leg Raise', titleTr: 'Düz Bacak Kaldırma', category: 'Lower Limb / Hip', difficulty: 3, sets: 3, reps: 10, description: 'Bacağınızı bükmeden yukarı kaldırın.', biomechanics: 'Kuadriseps güçlendirme (eklem yükü olmadan).', safetyFlags: ['Bel ağrısı olursa durun'], rehabPhase: 'Akut', isMotion: true },
  { id: 'll5', code: 'LL-005', title: 'Bridges', titleTr: 'Kalça Köprüsü', category: 'Lower Limb / Core', difficulty: 3, sets: 3, reps: 12, description: 'Sırtüstü yatın, kalçanızı yukarı kaldırın.', biomechanics: 'Gluteal ve hamstring aktivasyonu.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'll6', code: 'LL-006', title: 'Calf Raises', titleTr: 'Parmak Ucuna Yükselme', category: 'Lower Limb / Ankle', difficulty: 2, sets: 3, reps: 20, description: 'Parmak ucunda yükselin ve yavaşça inin.', biomechanics: 'Gastrocnemius ve Soleus güçlendirme.', safetyFlags: [], rehabPhase: 'Kronik', isMotion: true },
  { id: 'll7', code: 'LL-007', title: 'Wall Squat', titleTr: 'Duvarda Squat', difficulty: 4, sets: 3, reps: 10, category: 'Lower Limb / Knee', description: 'Sırtınız duvarda çömelip bekleyin.', biomechanics: 'Statik kuadriseps yüklenmesi.', safetyFlags: ['Diz kapağı ağrısına dikkat'], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'll8', code: 'LL-008', title: 'Monster Walk', titleTr: 'Canavar Yürüyüşü', difficulty: 5, sets: 3, reps: 20, category: 'Lower Limb / Hip', description: 'Diz üstü bantla yan yan yürüyün.', biomechanics: 'Abduktör ve stabilizatör gelişimi.', safetyFlags: [], rehabPhase: 'Performans', isMotion: true },
  { id: 'll9', code: 'LL-009', title: 'Step Ups', titleTr: 'Basamak Çıkma', difficulty: 4, sets: 3, reps: 12, category: 'Lower Limb / Knee', description: 'Bir basamağa çıkıp inin.', biomechanics: 'Fonksiyonel alt ekstremite kontrolü.', safetyFlags: [], rehabPhase: 'Performans', isMotion: true },
  // Fixed rehabPhase value to match type '"Akut" | "Sub-Akut" | "Kronik" | "Performans"'
  { id: 'll10', code: 'LL-010', title: 'Hamstring Stretch', titleTr: 'Arka Bacak Germe', difficulty: 2, sets: 3, reps: 30, category: 'Lower Limb / Stretch', description: 'Bacağınızı bir yere uzatıp öne esneyin.', biomechanics: 'Hamstring esnekliği.', safetyFlags: [], rehabPhase: 'Kronik', isMotion: true },

  // --- UPPER LIMB (Üst Ekstremite) ---
  { id: 'ul1', code: 'UL-001', title: 'Pendulum Exercises', titleTr: 'Pendulum (Sarkaç)', category: 'Upper Limb / Shoulder', difficulty: 1, sets: 3, reps: 2, description: 'Eğilin, kolunuzu serbestçe sallayın.', biomechanics: 'Eklem içi distraksiyon ve ağrı kontrolü.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'ul2', code: 'UL-002', title: 'Scapular Squeezes', titleTr: 'Skapular Sıkıştırma', category: 'Upper Limb / Shoulder', difficulty: 2, sets: 3, reps: 12, description: 'Kürek kemiklerinizi birbirine yaklaştırın.', biomechanics: 'Romboid aktivasyonu ve postural kontrol.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'ul3', code: 'UL-003', title: 'Wall Push-ups', titleTr: 'Duvarda Şınav', category: 'Upper Limb / Strength', difficulty: 3, sets: 3, reps: 12, description: 'Duvardan destek alarak şınav çekin.', biomechanics: 'Pektoral ve serratus aktivasyonu.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'ul4', code: 'UL-004', title: 'External Rotation (Band)', titleTr: 'Dış Rotasyon (Bantlı)', category: 'Upper Limb / Shoulder', difficulty: 4, sets: 3, reps: 15, description: 'Dirsek gövdede, bandı dışa doğru çekin.', biomechanics: 'Rotator manşet (Infraspinatus) güçlendirme.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'ul5', code: 'UL-005', title: 'Serratus Punch', titleTr: 'Serratus Yumruğu', category: 'Upper Limb / Shoulder', difficulty: 3, sets: 3, reps: 15, description: 'Sırtüstü yatın, kolunuzu tavana doğru itin.', biomechanics: 'Skapular protraksiyon ve stabilite.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'ul6', code: 'UL-006', title: 'Doorway Stretch', titleTr: 'Kapı Eşiği Germe', category: 'Upper Limb / Stretch', difficulty: 2, sets: 3, reps: 30, description: 'Kollar kapı eşiğinde öne esneyin.', biomechanics: 'Pektoralis major germe.', safetyFlags: [], rehabPhase: 'Kronik', isMotion: true },
  { id: 'ul7', code: 'UL-007', title: 'Bicep Curls (Light)', titleTr: 'Bicep Curl (Hafif)', category: 'Upper Limb / Strength', difficulty: 2, sets: 3, reps: 15, description: 'Hafif ağırlıkla dirseği bükün.', biomechanics: 'Dirsek fleksiyon kontrolü.', safetyFlags: [], rehabPhase: 'Kronik', isMotion: true },
  { id: 'ul8', code: 'UL-008', title: 'Wrist Extension Stretch', titleTr: 'El Bileği Ekstansör Germe', category: 'Upper Limb / Hand', difficulty: 1, sets: 3, reps: 30, description: 'Elinizi aşağı doğru bastırıp gerin.', biomechanics: 'Tenisçi dirseği (Epikondilit) rahatlatma.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'ul9', code: 'UL-009', title: 'Internal Rotation', titleTr: 'İç Rotasyon', category: 'Upper Limb / Shoulder', difficulty: 3, sets: 3, reps: 15, description: 'Bandı gövdenize doğru çekin.', biomechanics: 'Subskapularis güçlendirme.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'ul10', code: 'UL-010', title: 'Y-T-W-L Series', titleTr: 'Y-T-W-L Serisi', category: 'Upper Limb / Shoulder', difficulty: 6, sets: 2, reps: 10, description: 'Kollarla harf şekilleri yaparak skapular kasları çalıştırın.', biomechanics: 'Gelişmiş omuz kuşağı stabilitesi.', safetyFlags: [], rehabPhase: 'Performans', isMotion: true },

  // --- STABILITY (Stabilite) ---
  { id: 'st1', code: 'ST-001', title: 'Single Leg Balance', titleTr: 'Tek Ayak Dengesi', category: 'Stability / Proprioception', difficulty: 4, sets: 3, reps: 30, description: 'Tek ayak üzerinde dengede durun.', biomechanics: 'Ayak bileği ve diz propriosepsiyonu.', safetyFlags: ['Düşme riskine karşı duvara yakın durun'], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'st2', code: 'ST-002', title: 'Tandem Walk', titleTr: 'Tandem Yürüyüşü', category: 'Stability / Balance', difficulty: 5, sets: 3, reps: 10, description: 'Topuk-parmak ucu temaslı düz çizgide yürüyün.', biomechanics: 'Dinamik denge kontrolü.', safetyFlags: [], rehabPhase: 'Kronik', isMotion: true },
  { id: 'st3', code: 'ST-003', title: 'Plank', titleTr: 'Plank Pozisyonu', category: 'Stability / Core', difficulty: 6, sets: 3, reps: 30, description: 'Dirsekler üzerinde vücudu düz tutun.', biomechanics: 'Global core stabilitesi.', safetyFlags: ['Bel çukurlaşırsa bırakın'], rehabPhase: 'Performans', isMotion: true },
  { id: 'st4', code: 'ST-004', title: 'Side Plank (Knees)', titleTr: 'Yan Plank (Dizler)', category: 'Stability / Core', difficulty: 5, sets: 3, reps: 20, description: 'Yan yatıp dirsek üzerinde yükselin.', biomechanics: 'Quadratus lumborum aktivasyonu.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'st5', code: 'ST-005', title: 'Ankle Alphabet', titleTr: 'Ayak Bileği Alfabesi', category: 'Stability / Ankle', difficulty: 2, sets: 2, reps: 1, description: 'Ayağınızla havaya alfabe yazın.', biomechanics: 'Ayak bileği kontrolü ve ROM.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'st6', code: 'ST-006', title: 'Bird-Dog Holding', titleTr: 'Statik Kuş-Köpek', category: 'Stability / Core', difficulty: 5, sets: 3, reps: 15, description: 'Pozisyonu koruyarak bekleyin.', biomechanics: 'İzometrik spinal kontrol.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'st7', code: 'ST-007', title: 'Heel-to-Toe Stand', titleTr: 'Topuk-Parmak ucu Duruş', category: 'Stability / Balance', difficulty: 3, sets: 3, reps: 30, description: 'Bir ayağı diğerinin önüne koyun.', biomechanics: 'Statik denge.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'st8', code: 'ST-008', title: 'Pallof Press', titleTr: 'Pallof Press (Dirençli)', category: 'Stability / Core', difficulty: 6, sets: 3, reps: 12, description: 'Bandı ileri itin ve dönmeye direnin.', biomechanics: 'Anti-rotasyonel stabilite.', safetyFlags: [], rehabPhase: 'Performans', isMotion: true },
  { id: 'st9', code: 'ST-009', title: 'Star Excursion', titleTr: 'Yıldız Uzanma Testi', category: 'Stability / Leg', difficulty: 7, sets: 3, reps: 8, description: 'Tek ayak üzerinde durup diğer ayakla yönlere uzanın.', biomechanics: 'İleri düzey alt ekstremite stabilitesi.', safetyFlags: [], rehabPhase: 'Performans', isMotion: true },
  { id: 'st10', code: 'ST-010', title: 'Soft Surface Balance', titleTr: 'Yumuşak Zeminde Denge', category: 'Stability / Proprioception', difficulty: 6, sets: 3, reps: 30, description: 'Yastık veya sünger üzerinde dengede durun.', biomechanics: 'Gelişmiş proprioseptif girdi.', safetyFlags: [], rehabPhase: 'Performans', isMotion: true },

  // --- NEUROLOGICAL (Nörolojik) ---
  { id: 'nu1', code: 'NU-001', title: 'PNF Pattern Upper Limb', titleTr: 'PNF Üst Ekstremite', category: 'Neurological / PNF', difficulty: 5, sets: 3, reps: 10, description: 'Çapraz hatlarda diagonal hareketler.', biomechanics: 'Nöromüsküler fasilitasyon.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'nu2', code: 'NU-002', title: 'Weight Shifting (Standing)', titleTr: 'Ağırlık Aktarma (Ayakta)', category: 'Neurological / Balance', difficulty: 3, sets: 3, reps: 20, description: 'Ağırlığınızı bir bacaktan diğerine verin.', biomechanics: 'Sensomotorik kontrol.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'nu3', code: 'NU-003', title: 'Mirror Therapy Hand', titleTr: 'Ayna Terapisi (El)', category: 'Neurological / Mirror', difficulty: 2, sets: 1, reps: 10, description: 'Sağlam elinizi aynaya bakarak hareket ettirin.', biomechanics: 'Kortikal yeniden haritalama.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'nu4', code: 'NU-004', title: 'Sitting to Standing', titleTr: 'Otur-Kalk Egzersizi', category: 'Neurological / Functional', difficulty: 4, sets: 3, reps: 10, description: 'Destek almadan sandalyeden kalkın.', biomechanics: 'Fonksiyonel güç ve transfer.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'nu5', code: 'NU-005', title: 'Finger to Nose', titleTr: 'Parmak-Burun Koordinasyonu', category: 'Neurological / Coordination', difficulty: 2, sets: 3, reps: 10, description: 'Parmağınızı burnunuza dokundurun.', biomechanics: 'Serebellar koordinasyon.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'nu6', code: 'NU-006', title: 'Heel-Shin Slide', titleTr: 'Topuk-Diz Kaydırma', category: 'Neurological / Coordination', difficulty: 4, sets: 3, reps: 10, description: 'Topuğu karşı kaval kemiği üzerinde kaydırın.', biomechanics: 'Alt ekstremite koordinasyonu.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'nu7', code: 'NU-007', title: 'Facial Exercises', titleTr: 'Yüz Egzersizleri', category: 'Neurological / Facial', difficulty: 1, sets: 3, reps: 10, description: 'Mimik kaslarınızı çalıştırın.', biomechanics: 'Kraniyal sinir stimülasyonu.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'nu8', code: 'NU-008', title: 'Step Over Obstacles', titleTr: 'Engellerin Üzerinden Geçme', category: 'Neurological / Gait', difficulty: 6, sets: 3, reps: 10, description: 'Küçük engellerin üzerinden adım atın.', biomechanics: 'Dinamik yürüyüş kontrolü.', safetyFlags: [], rehabPhase: 'Kronik', isMotion: true },
  { id: 'nu9', code: 'NU-009', title: 'Pelvic Bridging (Neuro)', titleTr: 'Nörolojik Köprü kurma', category: 'Neurological / Core', difficulty: 4, sets: 3, reps: 12, description: 'Kalçayı kontrollü kaldırıp indirin.', biomechanics: 'Gövde stabilitesi ve proksimal kontrol.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'nu10', code: 'NU-010', title: 'Trunk Rotation (Sitting)', titleTr: 'Gövde Rotasyonu (Oturarak)', category: 'Neurological / Mobility', difficulty: 3, sets: 3, reps: 15, description: 'Otururken gövdenizi sağa-sola çevirin.', biomechanics: 'Aksiyel mobilite.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },

  // --- CARDIOVASCULAR (Kardiyovasküler) ---
  { id: 'cv1', code: 'CV-001', title: 'Ankle Pumps', titleTr: 'Ayak Bileği Pompalama', category: 'Cardiovascular / Circulation', difficulty: 1, sets: 3, reps: 30, description: 'Ayak bileklerinizi hızlıca yukarı-aşağı itin.', biomechanics: 'Venöz dönüşü artırma ve DVT önleme.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'cv2', code: 'CV-002', title: 'Diaphragmatic Breathing', titleTr: 'Diyafram Nefesi', category: 'Cardiovascular / Breathing', difficulty: 1, sets: 3, reps: 10, description: 'Karnınızı şişirerek derin nefes alın.', biomechanics: 'Akciğer kapasitesi ve relaksasyon.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'cv3', code: 'CV-003', title: 'Pursed Lip Breathing', titleTr: 'Büzük Dudak Nefesi', category: 'Cardiovascular / Breathing', difficulty: 1, sets: 3, reps: 10, description: 'Dudaklarınızı büzerek yavaşça üfleyin.', biomechanics: 'Ekspiratuar basınç ve hava hapsini önleme.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'cv4', code: 'CV-004', title: 'Marching in Place', titleTr: 'Olduğun Yerde Sayma', category: 'Cardiovascular / Aerobic', difficulty: 3, sets: 3, reps: 1, description: 'Ayakta dizlerinizi çekerek yürüyün.', biomechanics: 'Düşük yoğunluklu aerobik yüklenme.', safetyFlags: ['Çarpıntı olursa durun'], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'cv5', code: 'CV-005', title: 'Incentive Spirometry', titleTr: 'Triflo (Solunum)', category: 'Cardiovascular / Breathing', difficulty: 2, sets: 5, reps: 10, description: 'Solunum cihazıyla derin nefes çekin.', biomechanics: 'Alveoler ventilasyon.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'cv6', code: 'CV-006', title: 'Arm Circles', titleTr: 'Kol Çevirme', category: 'Cardiovascular / Warm-up', difficulty: 2, sets: 2, reps: 20, description: 'Kollarınızla daireler çizin.', biomechanics: 'Üst gövde sirkülasyonu.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'cv7', code: 'CV-007', title: 'Chest Expansion', titleTr: 'Göğüs Ekspansiyonu', category: 'Cardiovascular / Breathing', difficulty: 2, sets: 3, reps: 12, description: 'Nefes alırken kollarınızı yana açın.', biomechanics: 'Torasik mobilite ve ventilasyon.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'cv8', code: 'CV-008', title: 'Side Bends', titleTr: 'Yanlara Esneme', category: 'Cardiovascular / Mobility', difficulty: 3, sets: 3, reps: 15, description: 'Ayakta yanlara doğru esneyin.', biomechanics: 'Kostalar arası mobilite.', safetyFlags: [], rehabPhase: 'Kronik', isMotion: true },
  { id: 'cv9', code: 'CV-009', title: 'Low-Impact Jumping Jacks', titleTr: 'Düşük Yoğunluklu Sıçrama', category: 'Cardiovascular / Aerobic', difficulty: 5, sets: 3, reps: 20, description: 'Zıplamadan yana adım ve kol açışı.', biomechanics: 'Kalp hızı artırımı.', safetyFlags: [], rehabPhase: 'Kronik', isMotion: true },
  { id: 'cv10', code: 'CV-010', title: 'Walking (Brisk)', titleTr: 'Tempolu Yürüyüş', category: 'Cardiovascular / Aerobic', difficulty: 4, sets: 1, reps: 15, description: 'Tempolu şekilde 15 dk yürüyün.', biomechanics: 'Kardiyovasküler dayanıklılık.', safetyFlags: [], rehabPhase: 'Performans', isMotion: true },

  // --- POST-OP (Ameliyat Sonrası) ---
  { id: 'po1', code: 'PO-001', title: 'Quad Sets', titleTr: 'Kuadriseps İzometrik', category: 'Post-Op / Knee', difficulty: 2, sets: 3, reps: 15, description: 'Dizinizin altına havlu koyup aşağı bastırın.', biomechanics: 'Erken post-op kas inhibisyonunu önleme.', safetyFlags: ['Dikişlerde gerilme olursa azaltın'], rehabPhase: 'Akut', isMotion: true },
  { id: 'po2', code: 'PO-002', title: 'Gluteal Sets', titleTr: 'Gluteal İzometrik', category: 'Post-Op / Hip', difficulty: 2, sets: 3, reps: 15, description: 'Kalçalarınızı birbirine sıkıştırıp bekleyin.', biomechanics: 'Kalça stabilitesi başlangıcı.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'po3', code: 'PO-003', title: 'Active Assistive ROM', titleTr: 'Aktif Yardımlı ROM', category: 'Post-Op / Shoulder', difficulty: 3, sets: 3, reps: 10, description: 'Sağlam kolunuzla ameliyatlı kolunuzu kaldırın.', biomechanics: 'Eklem hareket açıklığını koruma.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'po4', code: 'PO-004', title: 'Weight Bearing Shifts', titleTr: 'Ağırlık Aktarma (Cerrahi)', category: 'Post-Op / General', difficulty: 4, sets: 3, reps: 20, description: 'İzin verilen oranda ağırlığınızı aktarın.', biomechanics: 'Proprioseptif yeniden eğitim.', safetyFlags: ['Yük verme kısıtlamasına uyun'], rehabPhase: 'Akut', isMotion: true },
  { id: 'po5', code: 'PO-005', title: 'Patellar Mobilization', titleTr: 'Patella Mobilizasyonu', category: 'Post-Op / Knee', difficulty: 2, sets: 1, reps: 5, description: 'Diz kapağınızı elle nazikçe hareket ettirin.', biomechanics: 'Cerrahi sonrası adezyon (yapışıklık) önleme.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'po6', code: 'PO-006', title: 'Isometric Shoulder Flexion', titleTr: 'İzometrik Omuz Fleksiyonu', category: 'Post-Op / Shoulder', difficulty: 3, sets: 3, reps: 10, description: 'Duvara doğru kolunuzu bükmeden itin.', biomechanics: 'Ağrısız güçlendirme başlangıcı.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true },
  { id: 'po7', code: 'PO-007', title: 'Gentle Scar Massage', titleTr: 'Yara İzi Masajı', category: 'Post-Op / Skin', difficulty: 1, sets: 1, reps: 5, description: 'Yara çevresine dairesel masaj yapın.', biomechanics: 'Doku esnekliği.', safetyFlags: ['Yara tam kapanmadan yapmayın'], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'po8', code: 'PO-008', title: 'Knee Extension (Seated)', titleTr: 'Oturarak Diz Ekstansiyonu', category: 'Post-Op / Knee', difficulty: 4, sets: 3, reps: 12, description: 'Sandalyede otururken dizinizi düzeltin.', biomechanics: 'Konsantrik kuadriseps aktivasyonu.', safetyFlags: [], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'po9', code: 'PO-009', title: 'Hip Abduction (Lying)', titleTr: 'Yatarak Kalça Abduksiyonu', category: 'Post-Op / Hip', difficulty: 4, sets: 3, reps: 10, description: 'Yan yatıp bacağı yukarı kaldırın.', biomechanics: 'Lateral stabilite.', safetyFlags: ['Kalça protezi limitlerine uyun'], rehabPhase: 'Sub-Akut', isMotion: true },
  { id: 'po10', code: 'PO-010', title: 'Standing Balance (Support)', titleTr: 'Destekli Ayakta Denge', category: 'Post-Op / General', difficulty: 3, sets: 3, reps: 30, description: 'Tezgaha tutunarak ayakta durun.', biomechanics: 'Dikey oryantasyon ve denge.', safetyFlags: [], rehabPhase: 'Akut', isMotion: true }
];

export class PhysioDB {
  private static STORAGE_KEY = 'physiocore_exercises';
  private static PROFILE_KEY = 'physiocore_patient';
  private static SYNC_STATUS = 'physiocore_sync_meta';

  static async checkRemoteStatus(): Promise<{ connected: boolean; latency: number }> {
    const start = Date.now();
    try {
      const res = await fetch('/api/sync', { method: 'OPTIONS' }).catch(() => null);
      return { connected: !!res, latency: Date.now() - start };
    } catch {
      return { connected: false, latency: 0 };
    }
  }

  static async syncWithRemote(): Promise<boolean> {
    const profile = this.getProfile();
    if (!profile) return false;

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(profile),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        localStorage.setItem(this.SYNC_STATUS, JSON.stringify({ 
          lastSync: new Date().toISOString(),
          status: 'SUCCESS'
        }));
        return true;
      }
    } catch (e) {
      console.error("Sync failed, retrying in background...", e);
    }
    return false;
  }

  static getExercises(): Exercise[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
      
      // Eğer veritabanı boşsa SEED verilerini yükle ve kaydet
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(SEED_EXERCISES));
      return SEED_EXERCISES;
      
    } catch (e) {
      console.warn("Local DB parse error, falling back to seed data.");
      return SEED_EXERCISES;
    }
  }

  static addExercise(exercise: Exercise) {
    const current = this.getExercises();
    current.push(exercise);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
  }

  static updateExercise(exercise: Exercise) {
    const current = this.getExercises();
    const index = current.findIndex(ex => ex.id === exercise.id);
    if (index !== -1) {
      current[index] = exercise;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    }
  }

  static deleteExercise(id: string) {
    const current = this.getExercises();
    const filtered = current.filter(ex => ex.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static saveProfile(profile: PatientProfile) {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    this.syncWithRemote().catch(console.error);
  }

  static getProfile(): PatientProfile | null {
    const saved = localStorage.getItem(this.PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  static getLastSync(): string | null {
    const meta = localStorage.getItem(this.SYNC_STATUS);
    return meta ? JSON.parse(meta).lastSync : null;
  }
}
