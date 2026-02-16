
import React, { useState, useEffect } from 'react';
import { 
  Zap, Clock, Repeat, Activity, Gauge, 
  BarChart3, Scale, Timer, History,
  TrendingUp, PlayCircle, Settings2, ArrowRight, Layers
} from 'lucide-react';
import { Exercise } from './types.ts';
import { optimizeExerciseData, ensureApiKey } from './ai-service.ts';

interface DosageEngineModuleProps {
  data: Partial<Exercise>;
  onUpdate: (updated: Partial<Exercise>) => void;
}

export const DosageEngineModule: React.FC<DosageEngineModuleProps> = ({ data, onUpdate }) => {
  const [optimizationGoal, setOptimizationGoal] = useState('Maksimum Mobilite');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const sets = data.sets || 0;
  const reps = data.reps || 0;
  const tempo = data.tempo || '3-1-3';
  
  const calculateTutPerRep = (tempoStr: string) => {
    const parts = tempoStr.split('-').map(Number);
    if (parts.length >= 3 && !parts.some(isNaN)) {
        return parts.reduce((a, b) => a + b, 0);
    }
    return 4;
  };

  const tutPerRep = calculateTutPerRep(tempo);
  const totalTut = sets * reps * tutPerRep;
  const volumeLoad = sets * reps;

  const handleOptimize = async () => {
    // API Anahtarı Guard
    const ok = await ensureApiKey();
    if (!ok) return;

    setIsOptimizing(true);
    try {
      const optimized = await optimizeExerciseData(data, optimizationGoal);
      onUpdate({ ...data, ...optimized, isPersonalized: true });
    } catch (err: any) {
      console.error("Optimization Failed", err);
      if (err.message?.includes("Requested entity was not found") || err.message?.includes("API_KEY_MISSING")) {
         await (window as any).aistudio?.openSelectKey();
      } else {
         alert("Optimizasyon başarısız. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  const updateField = (field: keyof Exercise, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-900/60 p-6 rounded-[2.5rem] border border-cyan-500/20">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20">
             <Zap size={32} fill="currentColor" />
          </div>
          <div className="flex-1 text-center md:text-left">
             <h4 className="text-xl font-black text-white italic uppercase tracking-tight">Klinik <span className="text-cyan-400">Optimizasyon</span></h4>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI tabanlı dozaj ve periyodizasyon motoru.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
             <select 
              value={optimizationGoal}
              onChange={(e) => setOptimizationGoal(e.target.value)}
              className="bg-transparent text-white text-[10px] font-bold uppercase outline-none px-2"
             >
               <option>Maksimum Mobilite</option>
               <option>Hipertrofi (Kas Büyümesi)</option>
               <option>Maksimum Kuvvet</option>
               <option>Güç (Patlayıcılık)</option>
               <option>Musküler Dayanıklılık</option>
               <option>Post-Op Erken Faz</option>
             </select>
             <button 
               onClick={handleOptimize} 
               disabled={isOptimizing}
               className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
             >
               {isOptimizing ? 'HESAPLANIYOR...' : 'UYGULA'}
             </button>
          </div>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Settings2 size={16} /> Temel Değişkenler
                </h3>
                <div className="grid grid-cols-2 gap-6">
                   <ControlKnob label="Set Sayısı" value={sets} onChange={v => updateField('sets', v)} min={1} max={10} icon={Layers} />
                   <ControlKnob label="Tekrar" value={reps} onChange={v => updateField('reps', v)} min={1} max={50} icon={Repeat} />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const ControlKnob = ({ label, value, onChange, min, max, icon: Icon }: any) => (
  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest z-10">{label}</span>
     <div className="flex items-center gap-4 z-10">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white font-bold">-</button>
        <span className="text-3xl font-black text-white italic tracking-tighter w-12 text-center">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white font-bold">+</button>
     </div>
  </div>
);
