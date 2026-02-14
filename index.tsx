
// @google/genai ve React yönergelerine uygun olarak ErrorBoundary sınıfı düzeltildi.
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
  Info,
  Key,
  Settings,
  CreditCard
} from 'lucide-react';
import { AppTab, PatientProfile, Exercise, ProgressReport } from './types.ts';
import { runAdaptiveAdjustment, ensureApiKey } from './ai-service.ts';
import { ExerciseStudio } from './ExerciseStudio.tsx';
import { ExercisePlayer } from './ExercisePlayer.tsx';
import { ProgressTracker } from './ProgressTracker.tsx';
import { PhysioDB } from './db-repository.ts';
import { Dashboard } from './Dashboard.tsx';
import { UserManager } from './UserManager.tsx';
import { ClinicalConsultation } from './ClinicalConsultation.tsx';
import { ManagementHub } from './ManagementHub.tsx';

interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

// Explicitly extending React.Component to fix the 'props' property missing error in TypeScript
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
    // Accessing children from props safely in class component
    return this.props.children;
  }
}

export default function PhysioCoreApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('consultation');
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [keyStatus, setKeyStatus] = useState<'Checking' | 'Valid' | 'Missing'>('Checking');
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [painScore, setPainScore] = useState(5);
  const [userComment, setUserComment] = useState('');

  useEffect(() => {
    const init = async () => {
      await PhysioDB.initializeDB();
      const profile = PhysioDB.getProfile();
      if (profile) setPatientData(profile);
      
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setKeyStatus(hasKey ? 'Valid' : 'Missing');
      } else {
        setKeyStatus(process.env.API_KEY ? 'Valid' : 'Missing');
      }
    };
    init();
  }, []);

  const handleOpenKeySelection = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.openSelectKey) {
      await aistudio.openSelectKey();
      setKeyStatus('Valid');
    }
  };

  const handleConsultationResult = async (result: PatientProfile) => {
    setPatientData(result);
    await PhysioDB.saveProfile(result);
    setActiveTab('dashboard');
  };

  const submitFeedback = async () => {
    if (!patientData) return;
    const aistudio = (window as any).aistudio;
    
    try {
      await ensureApiKey();
      const report: ProgressReport = { date: new Date().toISOString(), painScore, completionRate: 100, feedback: userComment };
      const updated = await runAdaptiveAdjustment(patientData, report);
      setPatientData(updated);
      await PhysioDB.saveProfile(updated);
      setShowFeedbackModal(false);
      setActiveTab('progress');
    } catch (err: any) {
      console.error("Feedback Adjustment Error", err);
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
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Genesis Expert v7.0</p>
          </div>
        </div>
        
        <nav className="hidden md:flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <NavBtn active={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} icon={Stethoscope} label="GÖRÜŞME" />
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="PANEL" />
          <NavBtn active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={TrendingUp} label="TAKİP" />
          <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="KADRO" />
          <NavBtn active={activeTab === 'cms'} icon={Database} label="STUDIO" onClick={() => setActiveTab('cms')} />
          <NavBtn active={activeTab === 'management'} icon={Settings} label="YÖNETİM" onClick={() => setActiveTab('management')} />
        </nav>

        <div className="flex items-center gap-4">
           {keyStatus !== 'Valid' ? (
             <button onClick={handleOpenKeySelection} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all animate-pulse">
                <Key size={14} className="text-rose-500" />
                <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest">KEY EKSİK</span>
             </button>
           ) : (
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 group cursor-help" title="Billing Aktif Proje">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">SİSTEM HAZIR</span>
             </div>
           )}
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
              <CreditCard size={16} />
           </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 pb-20">
        {activeTab === 'consultation' && <ClinicalConsultation onAnalysisComplete={handleConsultationResult} />}
        {activeTab === 'dashboard' && <Dashboard profile={patientData} onExerciseSelect={(ex) => setSelectedExercise(ex)} />}
        {activeTab === 'progress' && <ProgressTracker profile={patientData} />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'cms' && <ExerciseStudio />}
        {activeTab === 'management' && <ManagementHub />}
      </main>

      {selectedExercise && <ExercisePlayer exercise={selectedExercise} onClose={(finished) => {
        setSelectedExercise(null);
        if (finished) setShowFeedbackModal(true);
      }} />}
      
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden">
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
