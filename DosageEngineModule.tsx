
import React, { useState, useEffect } from 'react';
import { 
  Zap, Clock, Repeat, Activity, Gauge, 
  BarChart3, Scale, Timer, History,
  TrendingUp, PlayCircle, Settings2, ArrowRight, Layers
} from 'lucide-react';
import { Exercise } from './types.ts';
import { optimizeExerciseData } from './ai-service.ts';

interface DosageEngineModuleProps {
  data: Partial<Exercise>;
  onUpdate: (updated: Partial<Exercise>) => void;
}

export const DosageEngineModule: React.FC<DosageEngineModuleProps> = ({ data, onUpdate }) => {
  const [optimizationGoal, setOptimizationGoal] = useState('Maksimum Mobilite');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Derived Metrics Calculation
  const sets = data.sets || 0;
  const reps = data.reps || 0;
  const tempo = data.tempo || '3-1-3';
  
  // Parse tempo to calculate Time Under Tension (TUT)
  // Assuming format "Eccentric-Pause-Concentric" e.g. "3-1-3" -> 7 seconds per rep
  const calculateTutPerRep = (tempoStr: string) => {
    const parts = tempoStr.split('-').map(Number);
    if (parts.length >= 3 && !parts.some(isNaN)) {
        return parts.reduce((a, b) => a + b, 0);
    }
    return 4; // Default average
  };

  const tutPerRep = calculateTutPerRep(tempo);
  const totalTut = sets * reps * tutPerRep;
  const volumeLoad = sets * reps; // Without weight, just reps volume

  const handleOptimize = async () => {
    // PRE-FLIGHT CHECK: Prevent throwing error if key is missing
    if (!process.env.API_KEY) {
        const aistudio = (window as any).aistudio;
        if (aistudio) await aistudio.openSelectKey();
        return;
    }

    setIsOptimizing(true);
    try {
      const optimized = await optimizeExerciseData(data, optimizationGoal);
      onUpdate({ ...data, ...optimized, isPersonalized: true });
    } catch (err: any) {
      console.error("Optimization Failed", err);
      if (err.message?.includes("Requested entity was not found")) {
         const aistudio = (window as any).aistudio;
         if (aistudio) await aistudio.openSelectKey();
      } else {
         alert("Optimizasyon başarısız: " + (err.message || "Bilinmeyen hata"));
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  // Helper to update specific fields
  const updateField = (field: keyof Exercise, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       
       {/* AI Periodization Header */}
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
          
          {/* CONTROL DECK */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* Primary Variables */}
             <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Settings2 size={16} /> Temel Değişkenler
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                   <ControlKnob label="Set Sayısı" value={sets} onChange={v => updateField('sets', v)} min={1} max={10} icon={Layers} />
                   <ControlKnob label="Tekrar" value={reps} onChange={v => updateField('reps', v)} min={1} max={50} icon={Repeat} />
                </div>

                <div className="pt-6 border-t border-slate-800 space-y-4">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><History size={12}/> Tempo (E-P-C)</label>
                      <input 
                        type="text" 
                        value={tempo} 
                        onChange={e => updateField('tempo', e.target.value)}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg p-2 text-center text-xs font-bold text-cyan-400 outline-none"
                      />
                   </div>
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Clock size={12}/> Dinlenme (Sn)</label>
                      <div className="flex items-center gap-2">
                         <input 
                           type="range" min="0" max="180" step="15"
                           value={data.restPeriod || 60} 
                           onChange={e => updateField('restPeriod', parseInt(e.target.value))}
                           className="w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                         />
                         <span className="text-xs font-bold text-white w-8 text-right">{data.restPeriod}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Intensity & Load */}
             <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Gauge size={16} /> Şiddet & Yüklenme
                </h3>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                         <span>Hedef RPE (Borg Skalası)</span>
                         <span className={`px-2 py-0.5 rounded text-white ${
                            (data.targetRpe || 5) > 8 ? 'bg-rose-500' : (data.targetRpe || 5) > 5 ? 'bg-amber-500' : 'bg-emerald-500'
                         }`}>
                            {data.targetRpe || 5} / 10
                         </span>
                      </div>
                      <input 
                        type="range" min="1" max="10" 
                        value={data.targetRpe || 5}
                        onChange={e => updateField('targetRpe', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-current text-slate-500"
                        style={{ background: 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)' }}
                      />
                      <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase">
                         <span>Çok Hafif</span>
                         <span>Orta</span>
                         <span>Maksimal</span>
                      </div>
                   </div>

                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-lg text-slate-400"><Scale size={18}/></div>
                      <div>
                         <p className="text-[9px] font-black text-slate-500 uppercase">Frekans</p>
                         <input 
                           type="text" 
                           value={data.frequency || 'Günde 2 Kez'}
                           onChange={e => updateField('frequency', e.target.value)}
                           className="bg-transparent text-white font-bold text-xs outline-none w-full"
                         />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* CALCULATED METRICS (Live Output) */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                   <BarChart3 size={16} /> Motor Çıktısı
                </h3>
                
                <div className="space-y-6">
                   <MetricRow 
                     label="Toplam Hacim (Set x Tekrar)" 
                     value={volumeLoad} 
                     unit="Reps" 
                     icon={Layers} 
                   />
                   <MetricRow 
                     label="TUT (Time Under Tension)" 
                     value={totalTut} 
                     unit="Sn" 
                     icon={Timer} 
                     highlight
                   />
                   <MetricRow 
                     label="Tahmini Seans Süresi" 
                     value={Math.ceil((totalTut + ((sets - 1) * (data.restPeriod || 60))) / 60)} 
                     unit="Dk" 
                     icon={Clock} 
                   />
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Metabolik Etki Tahmini</p>
                   <p className="text-xs font-medium text-slate-300 italic leading-relaxed">
                      {totalTut > 120 ? "Endurans ve metabolik stres odaklı." : totalTut > 60 ? "Hipertrofi ve mekanik gerilim aralığı." : "Nöral aktivasyon ve güç odaklı."}
                   </p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const ControlKnob = ({ label, value, onChange, min, max, icon: Icon }: any) => (
  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
     <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform" />
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest z-10">{label}</span>
     <div className="flex items-center gap-4 z-10">
        <button 
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold"
        >
           -
        </button>
        <span className="text-3xl font-black text-white italic tracking-tighter w-12 text-center">{value}</span>
        <button 
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold"
        >
           +
        </button>
     </div>
  </div>
);

const MetricRow = ({ label, value, unit, icon: Icon, highlight }: any) => (
  <div className="flex items-center justify-between">
     <div className="flex items-center gap-3 text-slate-500">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-900 text-slate-600'}`}>
           <Icon size={16} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
     </div>
     <div className="flex items-baseline gap-1">
        <span className={`text-xl font-black italic ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase">{unit}</span>
     </div>
  </div>
);
