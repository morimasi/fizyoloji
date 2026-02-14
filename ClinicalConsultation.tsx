
import React, { useState, useRef, useEffect } from 'react';
import { 
  BrainCircuit, Zap, Upload, ShieldCheck, 
  Stethoscope, Activity, FileText, AlertTriangle,
  ChevronRight, ArrowRight, Microscope, Target,
  Flame, Wind, Cpu, Sparkles, MessageSquare,
  Thermometer, Info, Save, X, Search, HeartPulse,
  Mic, MicOff, Settings2, ShieldAlert, Layers,
  Terminal, Database, Radio, Gauge, Crosshair, Key
} from 'lucide-react';
import { runClinicalConsultation } from './ai-service.ts';
import { PatientProfile, RiskLevel } from './types.ts';

interface ConsultationProps {
  onAnalysisComplete: (profile: PatientProfile) => void;
}

export const ClinicalConsultation: React.FC<ConsultationProps> = ({ onAnalysisComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [riskPreference, setRiskPreference] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');
  const [focusArea, setFocusArea] = useState<string[]>([]);
  const [clinicalDirectives, setClinicalDirectives] = useState<string>('');
  const [expertMode, setExpertMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const areas = [
    { id: 'lumbar', label: 'Bel / Lumbar', icon: Wind },
    { id: 'cervical', label: 'Boyun / Cervical', icon: Activity },
    { id: 'thoracic', label: 'Sırt / Thoracic', icon: Layers },
    { id: 'knee', label: 'Diz / Knee', icon: Target },
    { id: 'shoulder', label: 'Omuz / Shoulder', icon: Flame },
    { id: 'post-op', label: 'Post-Operatif', icon: Stethoscope }
  ];

  const handleStartAnalysis = async () => {
    setError(null);
    const aistudio = (window as any).aistudio;
    
    try {
        // API Key Check
        const hasKey = aistudio ? await aistudio.hasSelectedApiKey() : !!process.env.API_KEY;
        if (!hasKey || !process.env.API_KEY) {
            if (aistudio) await aistudio.openSelectKey();
            else throw new Error("API_KEY_MISSING");
        }

        setIsAnalyzing(true);
        setStep(2);

        const promptEnhancement = `
          STRATEGY: ${riskPreference} approach. 
          AREAS: ${focusArea.join(', ')}. 
          EXPERT DIRECTIVES: ${clinicalDirectives}.
          MODE: ${expertMode ? 'Advanced Clinical Reasoning' : 'Standard'}.
          INPUT: ${userInput}
        `;
        
        const result = await runClinicalConsultation(promptEnhancement, selectedImage || undefined);
        if (result) {
          onAnalysisComplete(result);
        }
    } catch (err: any) {
        console.error("Analysis Failed", err);
        setStep(1);
        
        if (err.message?.includes("API_KEY_MISSING") || err.message?.includes("must be set") || err.message?.includes("Requested entity was not found")) {
            setError("Klinik analiz için geçerli bir API Anahtarı seçilmelidir.");
            if (aistudio) await aistudio.openSelectKey();
        } else {
            setError(`Sistem Hatası: ${err.message || 'Analiz başlatılamadı'}`);
        }
    } finally {
        setIsAnalyzing(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        if (userInput.length === 0) setUserInput("Sesli Anamnez: Hasta sabahları belinde şiddetli tutukluk (VAS 8) ve sol kalçaya yayılan uyuşma şikayeti bildiriyor...");
      }, 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-roboto">
      
      <div className="flex items-center justify-between px-12 py-6 bg-slate-950/40 rounded-[3rem] border border-slate-800 backdrop-blur-xl">
         <StepNode active={step >= 1} current={step === 1} label="ANAMNEZ VE VERİ" icon={FileText} />
         <div className={`flex-1 h-[1px] mx-8 ${step >= 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-slate-800'}`} />
         <StepNode active={step >= 2} current={step === 2} label="AI MUHAKEME" icon={BrainCircuit} />
         <div className={`flex-1 h-[1px] mx-8 ${step >= 3 ? 'bg-gradient-to-r from-blue-500 to-emerald-500' : 'bg-slate-800'}`} />
         <StepNode active={step >= 3} current={step === 3} label="KLİNİK REÇETE" icon={Save} />
      </div>

      {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
             <div className="flex items-center gap-4 text-rose-500">
                <AlertTriangle size={24} />
                <span className="text-xs font-black uppercase tracking-widest">{error}</span>
             </div>
             <button onClick={() => (window as any).aistudio?.openSelectKey()} className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Key size={14} /> ANAHTARI GÜNCELLE
             </button>
          </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 rounded-[3.5rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                 <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
                          <MessageSquare size={28} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Vaka <span className="text-cyan-400">Anamnezi</span></h3>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Semptom Analizi ve Klinik Geçmiş</p>
                       </div>
                    </div>
                    <button 
                      onClick={toggleRecording}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${isRecording ? 'bg-rose-500 border-rose-400 animate-pulse text-white shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-cyan-400'}`}
                    >
                       {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                 </div>
                 <div className="relative group/input">
                    <textarea 
                       value={userInput}
                       onChange={(e) => setUserInput(e.target.value)}
                       placeholder="Hastanın şikayetlerini, ağrı karakterini (VAS), cerrahi geçmişini ve mevcut kısıtlamalarını detaylandırın..."
                       className="w-full bg-slate-950/80 border border-slate-800 rounded-[2.5rem] p-10 text-sm text-slate-300 min-h-[320px] outline-none focus:border-cyan-500/40 transition-all italic leading-loose shadow-inner custom-scrollbar"
                    />
                 </div>
                 <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-4 px-8 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest border border-slate-700 transition-all group/btn shadow-xl"
                    >
                       <Upload size={20} className="text-cyan-400" /> RADYOLOJİ / EPİKRİZ ANALİZİ (OCR)
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setSelectedImage(reader.result as string);
                          reader.readAsDataURL(file);
                       }
                    }} />
                    {selectedImage && (
                       <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 rounded-2xl animate-in zoom-in duration-300">
                          <Radio size={16} className="text-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">VERİ YÜKLENDİ</span>
                          <X size={16} className="text-emerald-500 cursor-pointer" onClick={() => setSelectedImage(null)} />
                       </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-950 border border-slate-800 rounded-[3.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-[60px] -mr-20 -mt-20" />
                 <div className="flex items-center justify-between text-cyan-500 relative z-10">
                    <div className="flex items-center gap-4">
                       <Microscope size={28} />
                       <h3 className="text-sm font-black uppercase tracking-[0.2em]">AI Expert Deck</h3>
                    </div>
                 </div>
                 <button 
                   onClick={handleStartAnalysis}
                   disabled={isAnalyzing || (!userInput && !selectedImage)}
                   className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white py-7 rounded-[2rem] font-black italic tracking-tighter shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 group"
                 >
                    ANALİZİ VE MUHAKEMEYİ BAŞLAT <Zap size={24} fill="currentColor" className="group-hover:animate-pulse" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-4xl mx-auto py-20">
           <div className="bg-slate-900/60 backdrop-blur-3xl border border-slate-800 rounded-[5rem] p-24 text-center space-y-16 shadow-[0_50px_150px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)', backgroundSize: '60px 60px' }} />
              <div className="relative">
                 <div className="w-40 h-40 bg-cyan-500/10 rounded-[3rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20 mx-auto shadow-2xl relative group">
                    <BrainCircuit size={80} className="animate-pulse" />
                    <div className="absolute inset-0 bg-cyan-500 rounded-[3rem] blur-[60px] opacity-20 animate-pulse" />
                 </div>
              </div>
              <div className="space-y-8 relative z-10">
                 <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-tight">Genesis <span className="text-cyan-400">Muhakeme Yapıyor</span></h2>
                 <div className="flex flex-col items-center gap-4">
                    <p className="text-slate-400 text-xl italic max-w-xl mx-auto leading-relaxed font-medium">"Biyomekanik veriler işleniyor, rehabilitasyon yörüngesi hesaplanıyor..."</p>
                    <div className="flex gap-3 mt-6">
                       <LoadingPulse delay="0s" />
                       <LoadingPulse delay="0.2s" />
                       <LoadingPulse delay="0.4s" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const StepNode = ({ active, current, label, icon: Icon }: any) => (
  <div className={`flex flex-col md:flex-row items-center gap-4 transition-all duration-700 ${active ? 'opacity-100' : 'opacity-20'}`}>
     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${current ? 'bg-cyan-500 border-cyan-300 text-white shadow-[0_0_40px_rgba(6,182,212,0.4)] scale-110' : active ? 'bg-slate-900 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-700'}`}>
        <Icon size={24} />
     </div>
     <div className="text-center md:text-left">
        <span className={`text-[10px] font-black uppercase tracking-[0.3em] block ${current ? 'text-white' : active ? 'text-emerald-500' : 'text-slate-700'}`}>{label}</span>
     </div>
  </div>
);

const LoadingPulse = ({ delay }: { delay: string }) => (
  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce shadow-[0_0_15px_rgba(6,182,212,0.8)]" style={{ animationDelay: delay }} />
);
