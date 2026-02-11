
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
import { ExerciseCMS } from './ExerciseCMS.tsx';
import { ExercisePlayer } from './ExercisePlayer.tsx';
import { ProgressTracker } from './ProgressTracker.tsx';
import { QRCodeModal } from './QRCodeModal.tsx';
import { simulatePDFExport } from './export-service.ts';
import { PhysioDB } from './db-repository.ts';

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

  useEffect(() => {
    try {
      const savedData = PhysioDB.getProfile();
      if (savedData) setPatientData(savedData);
    } catch (e) {
      console.error("DB Initialization Error:", e);
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
      }
    } catch (err) {
      console.error("Clinical Consultation Error:", err);
      alert("Analiz sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
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
      const finalProfile = {
        ...updatedProfile,
        progressHistory: [...(patientData.progressHistory || []), report]
      };
      setPatientData(finalProfile);
      PhysioDB.saveProfile(finalProfile);
      
      setShowFeedbackModal(false);
      setUserComment('');
      setActiveTab('progress');
    } catch (err) {
      console.error("Adaptive Adjustment Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    if (patientData) simulatePDFExport(patientData);
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
              Genesis v3.1 Modular <span className="text-emerald-500">•</span> <Wifi size={8} /> ONLINE
            </p>
          </div>
        </div>
        
        <nav className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <NavBtn active={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')} icon={Stethoscope} label="KLİNİK" />
          <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="PANEL" />
          <NavBtn active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={TrendingUp} label="TAKİP" />
          <NavBtn active={activeTab === 'cms'} onClick={() => setActiveTab('cms')} icon={Database} label="GOD MODE" />
        </nav>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-inter font-bold text-slate-400">Dr. AI Agent</span>
              <span className="text-[8px] font-mono text-cyan-500 uppercase tracking-widest">Active Session</span>
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
                   <div className="absolute bottom-6 right-8 text-[10px] font-mono text-slate-700 uppercase tracking-widest">AI Vision Ready</div>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800/50">
                  <div className="flex gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-inter font-black tracking-widest transition-all border border-slate-700 shadow-lg active:scale-95">
                      <Upload size={16} className="text-cyan-400" /> RAPOR YÜKLE
                    </button>
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onFileChange} />
                    {selectedImage && <div className="px-6 py-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-[10px] font-inter font-black text-cyan-400 flex items-center gap-2 animate-bounce"><FileText size={16}/> RAPOR OKUNDU</div>}
                  </div>
                  <button onClick={handleStartAnalysis} disabled={isAnalyzing || (!userInput && !selectedImage)} className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 px-12 py-5 rounded-2xl font-inter font-black italic tracking-tighter text-white shadow-xl shadow-cyan-500/30 transition-all flex items-center gap-3 text-lg hover:-translate-y-1 active:translate-y-0 neon-glow">
                    {isAnalyzing ? 'MUHAKEME YAPILIYOR...' : 'ANALİZİ BAŞLAT'} <Zap size={20} fill="currentColor" />
                  </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             {!patientData ? (
               <div className="py-40 text-center opacity-20"><Dumbbell size={80} className="mx-auto mb-4" /><p className="font-mono text-xs uppercase tracking-[0.4em]">Awaiting Clinical Data</p></div>
             ) : (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="font-inter text-3xl font-black italic tracking-tighter">HAFTALIK <span className="text-cyan-400">PLAN</span></h2>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2"><CloudCheck size={12} className="text-emerald-500" /> Bulut ile Senkronize Edildi</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-inter font-black uppercase transition-all border border-slate-700 group">
                           <Printer size={16} className="text-slate-500 group-hover:text-white" /> YAZDIR
                        </button>
                        <button onClick={() => setShowQRModal(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-2xl text-[10px] font-inter font-black uppercase transition-all border border-slate-700 group">
                           <QrCode size={16} /> MOBİL AKTAR
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {(patientData.suggestedPlan || []).map((ex, i) => (
                        <div key={i} className="group glass-panel p-8 rounded-[2.5rem] flex items-center gap-8 hover:border-cyan-500/40 hover:bg-slate-900 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/5" onClick={() => setSelectedExercise(ex)}>
                          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-inner border border-slate-800 group-hover:border-transparent"><Play size={24} fill="currentColor" className="ml-1" /></div>
                          <div className="flex-1">
                            <h4 className="font-inter font-black text-xl group-hover:text-cyan-400 transition-colors tracking-tight uppercase italic">{ex.title}</h4>
                            <div className="flex gap-6 mt-1">
                              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">{ex.sets} SET x {ex.reps} TEKRAR</span>
                              <span className="text-[10px] font-mono text-slate-700 uppercase">ZORLUK: {ex.difficulty}/10</span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                             <div className="bg-cyan-500/10 text-cyan-400 text-[10px] font-inter font-black uppercase px-6 py-3 rounded-2xl border border-cyan-500/20 shadow-sm">BAŞLAT</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-4 space-y-8">
                    <div className="glass-panel p-10 rounded-[3rem] sticky top-28 shadow-2xl overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                      <h3 className="text-[10px] font-inter font-black uppercase text-slate-500 mb-8 flex items-center gap-2 tracking-[0.2em]"><Stethoscope size={14} /> Klinik Durum Paneli</h3>
                      
                      <div className="space-y-8 relative z-10">
                         <div className="space-y-3">
                            <p className="text-sm text-slate-300 leading-relaxed font-medium italic border-l-2 border-slate-700 pl-4">"{patientData.diagnosisSummary}"</p>
                         </div>
                         <div className="space-y-4">
                            <div className="space-y-3">
                               <label className="text-[10px] font-mono text-red-500 uppercase flex items-center gap-1 font-black tracking-widest"><Zap size={12} /> Kritik Uyarılar</label>
                               <div className="flex flex-wrap gap-2">
                                 {(patientData.contraindications || []).map((c, i) => <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-inter font-black rounded-xl uppercase tracking-wider">{c}</span>)}
                               </div>
                            </div>
                            <div className="p-6 bg-slate-950 rounded-[2rem] border border-slate-800 border-l-4 border-l-cyan-500 shadow-inner">
                               <p className="text-[9px] font-mono text-cyan-500 uppercase mb-3 font-black tracking-[0.2em]">AI Reçete Notu</p>
                               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{patientData.latestInsight?.recommendation || "Analiz süreci devam ediyor. İlk seansı tamamlayın."}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'progress' && patientData && <ProgressTracker profile={patientData} />}
        {activeTab === 'cms' && <ExerciseCMS />}
      </main>

      {/* MODALS */}
      {showQRModal && <QRCodeModal onClose={() => setShowQRModal(false)} />}
      
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] p-12 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl -ml-20 -mt-20" />
              <div className="text-center space-y-3">
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl mx-auto flex items-center justify-center text-emerald-400 mb-2 border border-emerald-500/20 shadow-lg">
                    <CheckCircle2 size={32} />
                 </div>
                 <h2 className="font-inter text-2xl font-black italic tracking-tighter uppercase">SEANS <span className="text-cyan-400">TAMAMLANDI</span></h2>
                 <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-mono">AI Veri Girişi Bekleniyor</p>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Ağrı Seviyesi (VAS: {painScore})</label>
                    <span className={`text-[10px] font-mono font-black px-2 py-1 rounded-lg ${painScore > 6 ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                       {painScore === 0 ? 'HİÇ YOK' : painScore >= 8 ? 'ŞİDDETLİ' : 'ORTA'}
                    </span>
                 </div>
                 <input type="range" min="0" max="10" value={painScore} onChange={(e) => setPainScore(parseInt(e.target.value))} className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500 border border-slate-700 shadow-inner" />
                 <div className="flex justify-between text-[8px] font-mono font-black text-slate-600 tracking-tighter uppercase">
                    <span>Ağrı Yok</span>
                    <span>Tahammül Edilemez</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black">Klinik Notlar (Gönüllü)</label>
                 <textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder="Hareket sırasında sağ bacağımda hafif karıncalanma oldu..." className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-xs h-32 outline-none focus:ring-4 focus:ring-cyan-500/5 shadow-inner font-roboto" />
              </div>

              <div className="flex gap-4 pt-2">
                 <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-inter font-black uppercase tracking-widest transition-all border border-slate-700 shadow-lg">İPTAL</button>
                 <button onClick={submitFeedback} disabled={isAnalyzing} className="flex-1 py-5 bg-cyan-500 hover:bg-cyan-600 rounded-2xl text-[10px] font-inter font-black uppercase tracking-widest text-white shadow-xl shadow-cyan-500/30 transition-all hover:-translate-y-1 active:translate-y-0 neon-glow">
                    {isAnalyzing ? 'MUHAKEME YAPILIYOR...' : 'VERİYİ GÖNDER'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {selectedExercise && <ExercisePlayer exercise={selectedExercise} onClose={handleExerciseClose} />}
    </div>
  );
}

function NavBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-inter font-black tracking-widest transition-all ${active ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/30 -translate-y-0.5 neon-glow' : 'text-slate-400 hover:text-slate-200'}`}>
      <Icon size={14} /> {label}
    </button>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<PhysioCoreApp />);
}
