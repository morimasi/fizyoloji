
import React, { useState, useRef, useEffect, ErrorInfo, ReactNode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Activity, Zap, BrainCircuit, Stethoscope, 
  LayoutDashboard, Database, TrendingUp, Users,
  CheckCircle2, AlertTriangle, RefreshCw, Key, Settings, Microscope
} from 'lucide-react';
import { AppTab, PatientProfile, Exercise, ProgressReport } from './types.ts';
import { runAdaptiveAdjustment, ensureApiKey, isApiKeyError } from './ai-service.ts';
import { ExerciseStudio } from './ExerciseStudio.tsx';
import { ExercisePlayer } from './ExercisePlayer.tsx';
import { ProgressTracker } from './ProgressTracker.tsx';
import { PhysioDB } from './db-repository.ts';
import { Dashboard } from './Dashboard.tsx';
import { UserManager } from './UserManager.tsx';
import { ClinicalConsultation } from './ClinicalConsultation.tsx';
import { ManagementHub } from './ManagementHub.tsx';
import { ClinicalEBMHub } from './ClinicalEBMHub.tsx';

interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
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

type TabType = AppTab | 'ebm';

export default function PhysioCoreApp() {
  const [activeTab, setActiveTab] = useState<TabType>('consultation');
  const [patientData, setPatientData] = useState<PatientProfile | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [painScore, setPainScore] = useState(5);
  const [userComment, setUserComment] = useState('');

  const checkKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.hasSelectedApiKey) {
      const keySelected = await aistudio.hasSelectedApiKey();
      setHasKey(keySelected);
      return keySelected;
    }
    setHasKey(true); 
    return true;
  };

  useEffect(() => {
    const init = async () => {
      try {
        await PhysioDB.initializeDB();
        const profile = await PhysioDB.getProfile();
        if (profile) setPatientData(profile);
      } catch (e) { console.error("DB Init Failed", e); }
      finally { setIsDbLoading(false); }
      
      const keyOk = await checkKey();
      if (!keyOk) {
        // Eğer anahtar yoksa başlangıçta bir kez sor
        const aistudio = (window as any).aistudio;
        if (aistudio?.openSelectKey) await aistudio.openSelectKey();
      }
    };
    init();

    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleKeySelect = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.openSelectKey) {
      await aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const submitFeedback = async () => {
    if (!patientData) return;
    
    // İşlem öncesi anahtar zorunluluğu
    const ok = await ensureApiKey();
    if (!ok) return;

    const report: ProgressReport = { date: new Date().toISOString(), painScore, completionRate: 100, feedback: userComment };
    try {
      const updated = await runAdaptiveAdjustment(patientData, report);
      setPatientData(updated);
      await PhysioDB.saveProfile(updated);
      setShowFeedbackModal(false);
      setActiveTab('progress');
    } catch (err: any) {
      console.error("Optimization Failed", err);
      if (isApiKeyError(err)) {
        await handleKeySelect();
      } else {
        alert("İşlem sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
      }
    }
  };

  if (isDbLoading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><RefreshCw size={48} className="text-cyan-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-roboto">
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('consultation')}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center"><Activity className="text-white" size={24} /></div>
          <div><h1 className="font-inter font-black text-xl tracking-tighter italic uppercase">PHYSIOCORE <span className="text-cyan-400">AI</span></h1><p className="text-[8px] font-mono text-slate-500 uppercase font-black">Genesis Pro Edition</p></div>
        </div>
        
        <nav className="hidden xl:flex bg-slate-900/50 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
          <NavBtn active={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} icon={Stethoscope} label="GÖRÜŞME" />
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="PANEL" />
          <NavBtn active={activeTab === 'ebm'} onClick={() => setActiveTab('ebm')} icon={Microscope} label="EBM & SEVK" />
          <NavBtn active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={TrendingUp} label="TAKİP" />
          <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="KADRO" />
          <NavBtn active={activeTab === 'cms'} icon={Database} label="STUDIO" onClick={() => setActiveTab('cms')} />
          <NavBtn active={activeTab === 'management'} icon={Settings} label="YÖNETİM" onClick={() => setActiveTab('management')} />
        </nav>

        <div className="flex items-center gap-4">
           {!hasKey && (
             <button 
               onClick={handleKeySelect} 
               className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse hover:bg-amber-500/20 transition-all"
             >
                <Key size={14} /> Anahtar Seçiniz
             </button>
           )}
           <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${hasKey ? 'bg-emerald-500' : 'bg-slate-700'}`} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 pb-20">
        {activeTab === 'consultation' && (
          <ClinicalConsultation onAnalysisComplete={(res) => { 
            setPatientData(res); 
            PhysioDB.saveProfile(res); 
            setActiveTab('dashboard'); 
          }} />
        )}
        {activeTab === 'dashboard' && <Dashboard profile={patientData} onExerciseSelect={setSelectedExercise} />}
        {activeTab === 'ebm' && <ClinicalEBMHub />}
        {activeTab === 'progress' && <ProgressTracker profile={patientData} />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'cms' && <ExerciseStudio />}
        {activeTab === 'management' && <ManagementHub />}
      </main>

      {selectedExercise && <ExercisePlayer exercise={selectedExercise} onClose={(f) => { setSelectedExercise(null); if (f) setShowFeedbackModal(true); }} />}
      
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
              <h2 className="text-2xl font-black italic uppercase text-white">Seans <span className="text-cyan-400">Tamamlandı</span></h2>
              <div className="space-y-6 text-left">
                 <label className="text-[10px] font-mono text-slate-400 uppercase font-black">Ağrı Skoru (VAS: {painScore})</label>
                 <input type="range" min="0" max="10" value={painScore} onChange={(e) => setPainScore(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-full appearance-none accent-cyan-500" />
                 <textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder="Terapist Notu..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs h-24" />
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-4 bg-slate-800 rounded-xl text-[10px] font-black">İPTAL</button>
                 <button onClick={submitFeedback} className="flex-1 py-4 bg-cyan-500 rounded-xl text-[10px] font-black text-white">KAYDET</button>
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
