
import React, { useState, useEffect } from 'react';
import { 
  Zap, Clock, Repeat, Activity, Gauge, 
  BarChart3, Scale, Timer, History,
  TrendingUp, PlayCircle, Settings2, ArrowRight, Layers,
  Hourglass, Weight, StopCircle
} from 'lucide-react';
import { Exercise } from './types.ts';
import { optimizeExerciseData, ensureApiKey, isApiKeyError } from './ai-service.ts';

interface DosageEngineModuleProps {
  data: Partial<Exercise>;
  onUpdate: (updated: Partial<Exercise>) => void;
}

export const DosageEngineModule: React.FC<DosageEngineModuleProps> = ({ data, onUpdate }) => {
  const [optimizationGoal, setOptimizationGoal] = useState('Maksimum Mobilite');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Time Under Tension Calculator
  const tempo = data.tempo || '3-1-3';
  const calculateTUT = () => {
    const parts = tempo.split('-').map(p => parseInt(p) || 0);
    const repTime = parts.reduce((a, b) => a + b, 0);
    return repTime * (data.reps || 0);
  };
  const tut = calculateTUT();

  // Volume Load Estimation (Virtual)
  const volumeLoad = (data.sets || 0) * (data.reps || 0) * (data.targetRpe || 0);

  const handleOptimize = async () => {
    const hasKey = await ensureApiKey();
    if (!hasKey) return;

    setIsOptimizing(true);
    try {
      const optimized = await optimizeExerciseData(data, optimizationGoal);
      onUpdate({ ...data, ...optimized, isPersonalized: true });
    } catch (err: any) {
      console.error("Optimization Failed", err);
      if (isApiKeyError(err)) {
        await (window as any).aistudio?.openSelectKey();
      } else {
        alert("Dozaj optimizasyonu yapılamadı.");
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  const updateField = (field: keyof Exercise, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-roboto">
       {/* OPTIMIZER HEADER */}
       <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-900/60 p-6 rounded-[2.5rem] border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] -mr-32 -mt-32" />
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20 z-10">
             <Zap size={32} fill="currentColor" />
          </div>
          <div className="flex-1 text-center md:text-left z-10">
             <h4 className="text-xl font-black text-white italic uppercase tracking-tight">AI Dozaj <span className="text-cyan-400">Motoru</span></h4>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hedef Bazlı Periodizasyon & Yük Yönetimi</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 z-10">
             <select 
              value={optimizationGoal}
              onChange={(e) => setOptimizationGoal(e.target.value)}
              className="bg-transparent text-white text-[10px] font-bold uppercase outline-none px-2 py-2"
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
               className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
             >
               {isOptimizing ? 'HESAPLANIYOR...' : 'UYGULA'}
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* MAIN CONTROLS */}
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-8 relative">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Settings2 size={16} className="text-cyan-500" /> Temel Değişkenler
                   </h3>
                   <div className="flex gap-2">
                      <PresetBtn label="3x10" onClick={() => onUpdate({...data, sets:3, reps:10})} />
                      <PresetBtn label="5x5" onClick={() => onUpdate({...data, sets:5, reps:5})} />
                      <PresetBtn label="4x12" onClick={() => onUpdate({...data, sets:4, reps:12})} />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <ControlKnob label="Set" value={data.sets || 0} onChange={v => updateField('sets', v)} min={1} max={10} icon={Layers} />
                   <ControlKnob label="Tekrar" value={data.reps || 0} onChange={v => updateField('reps', v)} min={1} max={50} icon={Repeat} />
                   <ControlKnob label="Dinlenme (sn)" value={data.restPeriod || 0} onChange={v => updateField('restPeriod', v)} min={10} max={300} icon={Clock} step={10} />
                   <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Tempo</span>
                      <input 
                        type="text" 
                        value={data.tempo || '3-1-3'} 
                        onChange={e => updateField('tempo', e.target.value)}
                        className="w-20 text-center bg-slate-900 text-white font-mono text-sm font-bold p-2 rounded-lg border border-slate-800 outline-none focus:border-cyan-500"
                      />
                      <span className="text-[7px] text-slate-600 mt-1 uppercase font-bold">Ecc-Iso-Con</span>
                   </div>
                </div>
             </div>

             {/* RPE SLIDER */}
             <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Gauge size={16} className={data.targetRpe && data.targetRpe > 7 ? 'text-rose-500' : 'text-emerald-500'} /> Algılanan Zorluk (RPE)
                   </h3>
                   <span className="text-2xl font-black text-white italic">{data.targetRpe}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5" 
                  value={data.targetRpe || 5} 
                  onChange={e => updateField('targetRpe', parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-950 rounded-full appearance-none accent-cyan-500 cursor-pointer border border-slate-800"
                />
                <div className="flex justify-between text-[8px] font-black uppercase text-slate-600 tracking-widest">
                   <span>Çok Kolay</span>
                   <span>Orta</span>
                   <span className="text-rose-500">Maksimum Efor</span>
                </div>
             </div>
          </div>

          {/* ADVANCED METRICS SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                   <BarChart3 size={16} /> Yük Analizi
                </h3>
                
                <div className="space-y-6">
                   <MetricRow label="TUT (Gerilim Süresi)" value={`${tut} sn`} icon={Hourglass} sub="Set Başına" />
                   <MetricRow label="Tahmini Yük" value={volumeLoad} icon={Weight} sub="Volume Index" color="text-amber-400" />
                   <MetricRow label="Yoğunluk" value={`%${((data.targetRpe || 0) * 10).toFixed(0)}`} icon={Activity} sub="Max Kapasite" color={data.targetRpe && data.targetRpe > 8 ? 'text-rose-500' : 'text-emerald-500'} />
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Önerilen Sıklık</p>
                   <div className="flex gap-2">
                      {[1,2,3,4,5,6,7].map(d => (
                         <div key={d} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border ${d <= 3 ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>
                            {d}
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const ControlKnob = ({ label, value, onChange, min, max, step = 1, icon: Icon }: any) => (
  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest z-10 flex items-center gap-1"><Icon size={10} /> {label}</span>
     <div className="flex items-center gap-4 z-10">
        <button onClick={() => onChange(Math.max(min, value - step))} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white font-bold hover:bg-slate-800 transition-colors">-</button>
        <span className="text-3xl font-black text-white italic tracking-tighter w-12 text-center">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + step))} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white font-bold hover:bg-slate-800 transition-colors">+</button>
     </div>
  </div>
);

const PresetBtn = ({ label, onClick }: any) => (
  <button onClick={onClick} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 hover:text-white hover:border-slate-600 transition-all">
     {label}
  </button>
);

const MetricRow = ({ label, value, icon: Icon, sub, color = 'text-white' }: any) => (
  <div className="flex items-center justify-between">
     <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
           <Icon size={14} className="text-slate-500" />
        </div>
        <div>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
           <p className="text-[8px] font-bold text-slate-600 uppercase italic">{sub}</p>
        </div>
     </div>
     <span className={`text-xl font-black italic tracking-tighter ${color}`}>{value}</span>
  </div>
);
