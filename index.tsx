
import React, { useState, useRef, useEffect, ReactNode, Component, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, User as UserIcon, Zap, BrainCircuit, Upload, 
  Stethoscope, LayoutDashboard, Database, TrendingUp, Users, 
  CheckCircle2, AlertTriangle, Key, ShieldCheck, RefreshCw, X
} from 'lucide-react';
import { AppTab, PatientProfile, Exercise, ProgressReport } from './types.ts';
import { runClinicalConsultation, runAdaptiveAdjustment } from './ai-service.ts';
import { ExerciseStudio } from './ExerciseStudio.tsx';
import { ExercisePlayer } from './ExercisePlayer.tsx';
import { ProgressTracker } from './ProgressTracker.tsx';
import { PhysioDB } from './db-repository.ts';
import { Dashboard } from './Dashboard.tsx';
import { UserManager } from './UserManager.tsx';

interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

// Use React.Component with explicit generic types to ensure props and state are correctly identified by the TypeScript compiler
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Explicitly accessing state through the inherited property
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <AlertTriangle size={64} className="text-rose-500 mx-auto" />
            <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Sistem <span className="text-rose-500">Hatası</span></h2>
            <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-cyan-400">SİSTEMİ YENİLE</button>
          </div>
        </div>
      );
    }
    // Explicitly accessing children through inherited props
    return this.props.children || null;
  }
}

export default function PhysioCoreApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('consultation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [hasKey, setHasKey] = useState(true);
  const [showKeyWarning, setShowKeyWarning] = useState(false);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [painScore, setPainScore] = useState(5);
  const [userComment, setUserComment] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const profile = PhysioDB.getProfile();
    if (profile) setPatientData(profile);
    
    const checkKeyStatus = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKeyStatus();
  }, []);

  const handleOpenKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasKey(true);
      setShowKeyWarning(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!userInput && !selectedImage) return;
    setIsAnalyzing(true);
    try {
      const result = await runClinicalConsultation(userInput, selectedImage || undefined);
      if (result) {
        setPatientData(result);
        await PhysioDB.saveProfile(result);
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      console.error("Consultation Crash:", err);
      if (err.message === "API_KEY_NOT_FOUND" || err.message?.includes("Requested entity was not found")) {
        setShowKeyWarning(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitFeedback = async () => {
    if (!patientData) return;
    setIsAnalyzing(true);
    const report: ProgressReport = { date: new Date().toISOString(), painScore, completionRate: 100, feedback: userComment };
    try {
      const updated = await runAdaptiveAdjustment(patientData, report);
      setPatientData(updated);
      await PhysioDB.saveProfile(updated);
      setShowFeedbackModal(false);
      setActiveTab('progress');
    } catch (err: any) {
      if (err.message === "API_KEY_NOT_FOUND" || err.message?.includes("Requested entity was not found")) {
        setShowKeyWarning(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-roboto selection:bg-cyan-500/30">
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-8 py-4 flex justify-between items-center backdrop-blur-3xl">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('consultation')}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="text-white" size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-inter font-black text-xl tracking-tighter italic uppercase leading-none">PHYSIOCORE <span className="text-cyan-400">AI</span></h1>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">Genesis v5.4 • Cloud Integration</p>
          </div>
        </div>
        
        <nav className="hidden lg:flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
          <NavBtn active={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} icon={Stethoscope} label="KLİNİK" />
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="PANEL" />
          <NavBtn active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={TrendingUp} label="TAKİP" />
          <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="KADRO" />
          <NavBtn active={activeTab === 'cms'} onClick={() => setActiveTab('cms')} icon={Database} label="STUDIO" />
        </nav>

        <div className="flex items-center gap-4">
           {!hasKey && (
             <button onClick={handleOpenKey} className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 animate-pulse">
               <Key size={14}/> ANAHTAR SEÇİMİ BEKLENİYOR
             </button>
           )}
           <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${hasKey ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50 opacity-50'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
              <span className="text-[9px] font-black uppercase text-white tracking-widest">{hasKey ? 'SİSTEM AKTİF' : 'KEY GEREKLİ'}</span>
           </div>
           <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
             <UserIcon size={18} className="text-slate-400" />
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
        {activeTab === 'consultation' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <div className="glass-panel rounded-[3rem] p-8 md:p-12 space-y-10 relative overflow-hidden border border-slate-800/50 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                
                <div className="flex flex-col md:flex-row gap-6 relative z-10 items-start md:items-center">
                   <div className="w-16 h-16 bg-cyan-500/10 rounded-[1.5rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
                     <BrainCircuit size={32} />
                   </div>
                   <div className="space-y-1">
                      <h2 className="font-inter text-3xl font-black italic tracking-tighter uppercase leading-none">Klinik <span className="text-cyan-400">Görüşme</span></h2>
                      <p className="text-slate-500 text-xs font-medium italic">Genesis Intelligence v5.4 • Hybrid Reasoning</p>
                   </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <textarea 
                    value={userInput} 
                    onChange={(e) => setUserInput(e.target.value)} 
                    placeholder="Şikayetinizi, ağrı bölgenizi ve süresini buraya detaylandırın..." 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-[2.5rem] p-8 text-sm outline-none transition-all min-h-[220px] text-slate-300 placeholder:text-slate-700 focus:border-cyan-500/30 shadow-inner leading-relaxed" 
                  />
                  {selectedImage && (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-cyan-500/50 animate-in zoom-in">
                      <img src={selectedImage} className="w-full h-full object-cover" />
                      <button onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-rose-500 p-1 rounded-full text-white"><X size={12}/></button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 rounded-2xl text-[11px] font-black tracking-widest border border-slate-800 hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
                  >
                    <Upload size={18} className="text-cyan-400" /> RAPOR ANALİZİ
                  </button>
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSelectedImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                  
                  <button 
                    onClick={handleStartAnalysis} 
                    disabled={isAnalyzing} 
                    className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black italic tracking-tighter shadow-2xl flex items-center justify-center gap-4 text-lg hover:scale-[1.02] active:scale-95 transition-all ${hasKey ? 'bg-cyan-500 text-white shadow-cyan-500/40' : 'bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                  >
                    {isAnalyzing ? (
                      <><RefreshCw size={24} className="animate-spin" /> ANALİZ EDİLİYOR...</>
                    ) : (
                      <><Zap size={24} fill="currentColor" /> MUHAKEMEYİ BAŞLAT</>
                    )}
                  </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                <FeatureSmall icon={ShieldCheck} title="HIPAA UYUMLU" desc="Verileriniz uçtan uca şifrelidir." />
                <FeatureSmall icon={Activity} title="ANLIK BİYOMEKANİK" desc="Flash-Core ile milisaniyelik analiz." />
                <FeatureSmall icon={Zap} title="GÜNCEL TIP" desc="PubMed ve EBM veritabanı senkronize." />
             </div>
          </div>
        )}

        {activeTab === 'dashboard' && patientData && <Dashboard profile={patientData} onExerciseSelect={(ex) => setSelectedExercise(ex)} />}
        {activeTab === 'progress' && patientData && <ProgressTracker profile={patientData} />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'cms' && <ExerciseStudio />}
      </main>

      {/* API Key Modal Warning */}
      {showKeyWarning && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-slate-900 border border-slate-800 w-full max-lg rounded-[3.5rem] p-12 space-y-8 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] mx-auto flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
                <Key size={40} />
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">BAĞLANTI <span className="text-rose-500">KESİLDİ</span></h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Hizmet anahtarı bulunamadı veya geçersiz. Lütfen AI Studio köprüsü üzerinden bir anahtar seçin.
                </p>
              </div>
              <div className="flex gap-4 relative z-10">
                 <button onClick={() => setShowKeyWarning(false)} className="flex-1 py-5 bg-slate-800 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest border border-slate-800">KAPAT</button>
                 <button onClick={handleOpenKey} className="flex-1 py-5 bg-cyan-500 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-xl shadow-cyan-500/30">ANAHTAR SEÇ</button>
              </div>
           </div>
        </div>
      )}

      {selectedExercise && <ExercisePlayer exercise={selectedExercise} onClose={(finished) => {
        setSelectedExercise(null);
        if (finished) setShowFeedbackModal(true);
      }} />}
      
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] p-12 space-y-10 shadow-2xl relative">
              <div className="text-center space-y-3">
                 <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
                 <h2 className="font-inter text-3xl font-black italic tracking-tighter uppercase leading-none text-white">Seans <span className="text-emerald-400">Başarılı</span></h2>
              </div>
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-end px-2">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ağrı Skoru (VAS)</label>
                       <span className="text-2xl font-black italic text-cyan-400">{painScore}/10</span>
                    </div>
                    <input type="range" min="0" max="10" value={painScore} onChange={(e) => setPainScore(parseInt(e.target.value))} className="w-full h-3 bg-slate-800 rounded-full appearance-none accent-cyan-500 cursor-pointer" />
                 </div>
                 <textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder="Terapistiniz için notunuz..." className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-sm h-36 outline-none shadow-inner text-slate-300" />
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-5 bg-slate-800 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest border border-slate-800">İPTAL</button>
                 <button onClick={submitFeedback} className="flex-1 py-5 bg-cyan-500 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest shadow-xl shadow-cyan-500/30">KAYDET</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${active ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
      <Icon size={18} /> {label}
    </button>
  );
}

function FeatureSmall({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
       <div className="text-cyan-500"><Icon size={20} /></div>
       <div>
          <h5 className="text-[10px] font-black uppercase tracking-widest text-white">{title}</h5>
          <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">{desc}</p>
       </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) { 
  createRoot(rootElement).render(
    <ErrorBoundary>
      <PhysioCoreApp />
    </ErrorBoundary>
  ); 
}
