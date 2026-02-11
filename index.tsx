
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, 
  User, 
  Zap, 
  BrainCircuit, 
  Upload, 
  FileText, 
  Stethoscope, 
  Dumbbell, 
  LayoutDashboard, 
  Database,
  Play,
  TrendingUp,
  Printer,
  QrCode,
  Wifi,
  CloudCheck,
  CheckCircle2
} from 'lucide-react';
import { AppTab, PatientProfile, Exercise, ProgressReport } from './types.ts';
import { runClinicalConsultation, runAdaptiveAdjustment } from './ai-service.ts';
import { ExerciseStudio } from './ExerciseStudio.tsx';
import { ExercisePlayer } from './ExercisePlayer.tsx';
import { ProgressTracker } from './ProgressTracker.tsx';
import { QRCodeModal } from './QRCodeModal.tsx';
import { simulatePDFExport } from './export-service.ts';
import { PhysioDB } from './db-repository.ts';
import { Dashboard } from './Dashboard.tsx';

console.log("PhysioCore AI: App Initializing...");

export default function PhysioCoreApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('consultation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [painScore, setPainScore] = useState(5);
  const [userComment, setUserComment] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Uygulama yüklendiğinde DB'den veriyi çek
  useEffect(() => {
    try {
      const savedData = PhysioDB.getProfile();
      if (savedData) {
        console.log("PhysioCore AI: Local Profile Detected.");
        setPatientData(savedData);
      }
    } catch (e) {
      console.error("DB Load Error:", e);
    }
  }, []);

  const handleStartAnalysis = async () => {
    if (!userInput && !selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const result = await runClinicalConsultation(userInput, selectedImage || undefined);
      if (result) {
        setPatientData(result);
        PhysioDB.saveProfile(result);
        setActiveTab('dashboard');
      } else {
        alert("Klinik analiz yapılamadı. Lütfen girdilerinizi kontrol edin.");
      }
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("Sistem şu an yoğun, lütfen birazdan tekrar deneyin.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExerciseClose = (finished?: boolean) => {
    setSelectedExercise(null);
    if (finished) {
      setShowFeedbackModal(true);
    }
  };

  const submitFeedback = async () => {
    if (!patientData) return;
    setIsAnalyzing(true);
    
    const report: ProgressReport = {
      date: new Date().toISOString(),
      painScore,
      completionRate: 100,
      feedback: userComment
    };

    try {
      const updatedProfile = await runAdaptiveAdjustment(patientData, report);
      setPatientData(updatedProfile);
      PhysioDB.saveProfile(updatedProfile);
      
      setShowFeedbackModal(false);
      setUserComment('');
      setActiveTab('progress');
    } catch (err) {
      console.error("Feedback Adjustment Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-roboto selection:bg-cyan-500/30">
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('consultation')}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-inter font-black text-xl tracking-tighter italic">PHYSIOCORE <span className="text-cyan-400 text-glow">AI</span></h1>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
              Genesis v3.2 Modular <span className="text-emerald-500">•</span> <Wifi size={8} /> ONLINE
            </p>
          </div>
        </div>
        
        <nav className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <NavBtn active={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} icon={Stethoscope} label="KLİNİK" />
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="PANEL" />
          <NavBtn active={activeTab === 'progress'} onClick={() => setActiveTab('progress'} icon={TrendingUp} label="TAKİP" />
          <NavBtn active={activeTab === 'cms'} onClick={() => setActiveTab('cms')} icon={Database} label="STUDIO" />
        </nav>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-[10px] font-inter font-bold text-slate-400">PhysioBrain v3.2</span>
              <span className="text-[8px] font-mono text-cyan-500 uppercase tracking-widest">Master Studio</span>
           </div>
           <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 cursor-pointer overflow-hidden group hover:border-cyan-500 transition-colors">
             <User size={18} className="text-slate-400 group-hover:text-white transition-colors" />
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 pb-20">
        {activeTab === 'consultation' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="glass-panel rounded-[3rem] p-12 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />
                <div className="flex gap-6 relative z-10">
                   <div className="w-16 h-16 bg-cyan-500/10 rounded-[1.5rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner"><BrainCircuit size={32} /></div>
                   <div className="space-y-1">
                      <h2 className="font-inter text-3xl font-black italic tracking-tighter uppercase">Klinik <span className="text-cyan-400">Görüşme</span></h2>
                      <p className="text-slate-400 text-sm font-medium">Şikayetinizi yazın veya MR/Röntgen raporunuzu yükleyin.</p>
                   </div>
                </div>
                <div className="relative group">
                   <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Örn: Bel fıtığı teşhisim var, sol bacağıma vuran bir ağrı hissediyorum..." className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-8 text-sm focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all min-h-[200px] shadow-inner placeholder:text-slate-700 group-hover:border-slate-700 font-roboto" />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800/50">
                  <div className="flex gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-inter font-black tracking-widest transition-all border border-slate-700 shadow-lg active:scale-95">
                      <Upload size={16} className="text-cyan-400" /> RAPOR YÜKLE
                    </button>
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onFileChange} />
                  </div>
                  <button onClick={handleStartAnalysis} disabled={isAnalyzing || (!userInput && !selectedImage)} className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 px-12 py-5 rounded-2xl font-inter font-black italic tracking-tighter text-white shadow-xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 text-lg hover:-translate-y-1 active:translate-y-0 neon-glow">
                    {isAnalyzing ? 'KLİNİK MUHAKEME YAPILIYOR...' : 'ANALİZİ BAŞLAT'} <Zap size={20} fill="currentColor" />
                  </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'dashboard' && patientData && (
           <Dashboard 
            profile={patientData} 
            onExerciseSelect={(ex) => setSelectedExercise(ex)} 
           />
        )}

        {activeTab === 'progress' && patientData && <ProgressTracker profile={patientData} />}
        {activeTab === 'cms' && <ExerciseStudio />}
      </main>

      {showQRModal && <QRCodeModal onClose={() => setShowQRModal(false)} />}
      {selectedExercise && <ExercisePlayer exercise={selectedExercise} onClose={handleExerciseClose} />}
      
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] p-12 space-y-10 shadow-2xl relative">
              <div className="text-center space-y-3">
                 <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                 <h2 className="font-inter text-2xl font-black italic tracking-tighter uppercase">SEANS <span className="text-cyan-400">BİTTİ</span></h2>
              </div>
              <div className="space-y-6">
                 <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Ağrı (VAS: {painScore})</label>
                 <input type="range" min="0" max="10" value={painScore} onChange={(e) => setPainScore(parseInt(e.target.value))} className="w-full h-3 bg-slate-800 rounded-full appearance-none accent-cyan-500" />
                 <textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder="Geri bildiriminiz..." className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-xs h-32 outline-none font-roboto" />
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-5 bg-slate-800 rounded-2xl text-[10px] font-black">İPTAL</button>
                 <button onClick={submitFeedback} className="flex-1 py-5 bg-cyan-500 rounded-2xl text-[10px] font-black text-white shadow-xl shadow-cyan-500/30">VERİYİ GÖNDER</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-inter font-black tracking-widest transition-all ${active ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/30 -translate-y-0.5' : 'text-slate-400 hover:text-slate-200'}`}>
      <Icon size={14} /> {label}
    </button>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<PhysioCoreApp />);
}
