
import React, { Component, useState, useRef, useEffect, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, 
  User as UserIcon, 
  Zap, 
  BrainCircuit, 
  Upload, 
  Stethoscope, 
  LayoutDashboard, 
  Database,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldCheck,
  Info
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

// Fixed ErrorBoundary class by using React.Component explicit extension and ensuring state/props are correctly recognized
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly defining state to resolve property 'state' does not exist error
  public state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }
  
  static getDerivedStateFromError(_error: Error): ErrorBoundaryState { return { hasError: true }; }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("CRASH:", error, errorInfo); }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <AlertTriangle size={64} className="text-rose-500 mx-auto" />
            <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Sistem <span className="text-rose-500">Hatası</span></h2>
            <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-cyan-400">YENİLE</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PhysioCoreApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('consultation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [dbStatus, setDbStatus] = useState({connected: false, latency: 0});
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [painScore, setPainScore] = useState(5);
  const [userComment, setUserComment] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const profile = PhysioDB.getProfile();
    if (profile) setPatientData(profile);
    const check = async () => setDbStatus(await PhysioDB.checkRemoteStatus());
    check();
  }, []);

  const handleStartAnalysis = async () => {
    if (!userInput && !selectedImage) return;
    setIsAnalyzing(true);
    try {
      const result = await runClinicalConsultation(userInput, selectedImage || undefined, patientData?.treatmentHistory, patientData?.painLogs);
      if (result) {
        setPatientData(result);
        await PhysioDB.saveProfile(result);
        setActiveTab('dashboard');
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-roboto">
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('consultation')}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-inter font-black text-xl tracking-tighter italic uppercase">PHYSIOCORE <span className="text-cyan-400">AI</span></h1>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Flash Engine v5.0 • Zero-Cost</p>
          </div>
        </div>
        
        <nav className="hidden md:flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <NavBtn active={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} icon={Stethoscope} label="KLİNİK" />
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="PANEL" />
          <NavBtn active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={TrendingUp} label="TAKİP" />
          <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="KADRO" />
          <NavBtn active={activeTab === 'cms'} onClick={() => setActiveTab('cms')} icon={Database} label="STUDIO" />
        </nav>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-white tracking-widest">SİSTEM AKTİF</span>
           </div>
           <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
             <UserIcon size={18} className="text-slate-400" />
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 pb-20">
        {activeTab === 'consultation' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="glass-panel rounded-[3rem] p-12 space-y-10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                   <div className="w-16 h-16 bg-cyan-500/10 rounded-[1.5rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20"><BrainCircuit size={32} /></div>
                   <div className="space-y-1">
                      <h2 className="font-inter text-3xl font-black italic tracking-tighter uppercase leading-tight">Klinik <span className="text-cyan-400">Görüşme</span></h2>
                      <p className="text-slate-400 text-sm italic">Genesis Flash v5.0 • High Speed Intelligence</p>
                   </div>
                </div>
                <textarea 
                  value={userInput} 
                  onChange={(e) => setUserInput(e.target.value)} 
                  placeholder="Şikayetinizi buraya yazın..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-8 text-sm outline-none transition-all min-h-[200px] text-slate-300" 
                />
                
                <div className="flex justify-between items-center gap-6 bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800/50">
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-8 py-4 bg-slate-800 rounded-2xl text-[10px] font-black tracking-widest border border-slate-700">
                    <Upload size={16} className="text-cyan-400" /> RAPOR ANALİZİ
                  </button>
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSelectedImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <button onClick={handleStartAnalysis} disabled={isAnalyzing} className="bg-cyan-500 text-white px-12 py-5 rounded-2xl font-black italic tracking-tighter shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-3 text-lg">
                    {isAnalyzing ? 'MUHAKEME YAPILIYOR...' : 'ANALİZİ BAŞLAT'} <Zap size={20} fill="currentColor" />
                  </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'dashboard' && patientData && <Dashboard profile={patientData} onExerciseSelect={(ex) => setSelectedExercise(ex)} />}
        {activeTab === 'progress' && patientData && <ProgressTracker profile={patientData} />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'cms' && <ExerciseStudio />}
      </main>

      {selectedExercise && <ExercisePlayer exercise={selectedExercise} onClose={(finished) => {
        setSelectedExercise(null);
        if (finished) setShowFeedbackModal(true);
      }} />}
      
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] p-12 space-y-10 shadow-2xl relative">
              <div className="text-center space-y-3">
                 <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                 <h2 className="font-inter text-2xl font-black italic tracking-tighter uppercase leading-tight text-white">Seans <span className="text-cyan-400">Tamamlandı</span></h2>
              </div>
              <div className="space-y-6">
                 <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Ağrı Skoru (VAS: {painScore})</label>
                 <input type="range" min="0" max="10" value={painScore} onChange={(e) => setPainScore(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-cyan-500" />
                 <textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder="Terapistiniz için notunuz..." className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-xs h-32 outline-none" />
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-5 bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400">İPTAL</button>
                 <button onClick={submitFeedback} className="flex-1 py-5 bg-cyan-500 rounded-2xl text-[10px] font-black text-white">VERİLERİ KAYDET</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${active ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}>
      <Icon size={18} /> {label}
    </button>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) { createRoot(rootElement).render(<ErrorBoundary><PhysioCoreApp /></ErrorBoundary>); }
