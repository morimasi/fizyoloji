
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  Info, 
  Zap, 
  Layers, 
  Wind, 
  Maximize2,
  FastForward,
  Heart,
  CheckCircle2,
  WifiOff,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Exercise } from './types.ts';

interface PlayerProps {
  exercise: Exercise;
  onClose: (finished?: boolean) => void;
}

export const ExercisePlayer = ({ exercise, onClose }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeView, setActiveView] = useState<'normal' | 'xray' | 'muscles'>('normal');
  const [isFavorite, setIsFavorite] = useState(exercise.isFavorite || false);

  const handleNextSet = () => {
    if (currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
      setCurrentRep(0);
      setIsPlaying(false);
    } else {
      onClose(true);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && currentRep < exercise.reps) {
      interval = setInterval(() => {
        setCurrentRep(prev => prev + 1);
      }, 2000 / playbackSpeed); // Simüle edilen bir tekrar süresi
    } else if (currentRep === exercise.reps) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentRep, exercise.reps, playbackSpeed]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col animate-in fade-in duration-500">
      <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-950/50 backdrop-blur-md">
        <button onClick={() => onClose(false)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-inter font-black text-[10px] uppercase tracking-[0.2em]">KAPAT</span>
        </button>
        <div className="text-center">
          <h2 className="font-inter text-xl font-black italic tracking-tighter uppercase leading-tight">{exercise.title}</h2>
          <div className="flex items-center justify-center gap-3">
             <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">{exercise.category} • {exercise.code}</p>
             <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 border border-emerald-500/20">
               <WifiOff size={8} /> OFFLINE READY
             </span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 rounded-xl border transition-all ${isFavorite ? 'bg-pink-500/10 border-pink-500/30 text-pink-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onClose(true)} className="flex items-center gap-2 px-8 bg-cyan-500/10 hover:bg-cyan-500 rounded-xl text-cyan-500 hover:text-white font-inter font-black italic text-xs transition-all border border-cyan-500/30 shadow-xl shadow-cyan-500/10 active:scale-95">
            ATLA <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center group overflow-hidden">
          {/* Progress Bar Top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-900">
            <div 
              className="h-full bg-cyan-500 transition-all duration-500" 
              style={{ width: `${(currentRep / exercise.reps) * 100}%` }}
            />
          </div>

          <div className="absolute top-8 left-8 z-50 pointer-events-none">
             <div className="flex items-center gap-4">
               <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Durum</p>
                  <p className={`text-[10px] font-black font-inter ${isPlaying ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {isPlaying ? 'HAREKET ANALİZİ AKTİF' : 'DURAKLATILDI'}
                  </p>
               </div>
               <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Set</p>
                  <p className="text-[10px] font-black font-inter text-white">{currentSet} / {exercise.sets}</p>
               </div>
             </div>
          </div>

          <div className="relative z-20 text-center space-y-10">
             <div className="w-96 h-96 relative flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-4 border-cyan-500/5 ${isPlaying ? 'animate-ping' : ''}`} />
                <div className="w-80 h-80 bg-slate-900 rounded-[3rem] border border-slate-800 flex items-center justify-center shadow-2xl shadow-cyan-500/10 relative overflow-hidden group/box">
                   <div className="relative">
                      <Zap size={100} className={`${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-800'} transition-colors duration-1000`} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-4xl text-white italic tracking-tighter">
                        {currentRep}
                      </div>
                   </div>
                   
                   {activeView === 'xray' && (
                     <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-[4px] flex flex-col items-center justify-center animate-in zoom-in duration-300">
                        <Layers size={64} className="text-cyan-400 animate-pulse mb-4" />
                        <div className="text-[10px] font-mono text-cyan-300 font-black tracking-[0.2em]">PATHOLOGY_SCAN: {exercise.code}</div>
                        <div className="w-32 h-1 bg-cyan-500/20 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-cyan-500 w-1/2 animate-[shimmer_2s_infinite]" />
                        </div>
                     </div>
                   )}
                   {activeView === 'muscles' && (
                     <div className="absolute inset-0 bg-red-950/30 backdrop-blur-[4px] flex flex-col items-center justify-center animate-in zoom-in duration-300">
                        <Wind size={64} className="text-red-400 animate-bounce mb-4" />
                        <div className="text-[10px] font-mono text-red-400 font-black tracking-[0.2em]">MUSCLE_FIBER: TENSION_MAX</div>
                     </div>
                   )}
                </div>
             </div>
             
             <div className="space-y-3">
                <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} /> 
                   BIOMECHANIC_SYNC: {isPlaying ? 'ESTABLISHED' : 'STANDBY'} | ACCURACY: 98.4%
                </p>
             </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-10 bg-slate-900/80 backdrop-blur-3xl border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl">
            <div className="flex gap-2 border-r border-slate-800 pr-8">
              {[0.5, 1, 1.5, 2].map(speed => (
                <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={`w-10 h-10 rounded-xl text-[10px] font-mono font-black transition-all ${playbackSpeed === speed ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
                  {speed}x
                </button>
              ))}
            </div>
            <div className="flex items-center gap-10">
               <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-500 hover:text-white transition-all active:rotate-180 duration-500"><RotateCcw size={24} /></button>
               
               {currentRep === exercise.reps ? (
                  <button onClick={handleNextSet} className="px-10 py-5 bg-emerald-500 rounded-[1.5rem] font-inter font-black text-white italic shadow-2xl shadow-emerald-500/30 animate-bounce">
                    {currentSet === exercise.sets ? 'TAMAMLA' : 'SONRAKİ SET'}
                  </button>
               ) : (
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 bg-cyan-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all neon-glow">
                    {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                  </button>
               )}

               <button className="text-slate-500 hover:text-white transition-all"><FastForward size={24} /></button>
            </div>
            <div className="flex gap-3 border-l border-slate-800 pl-8">
              <PerspectiveBtn active={activeView === 'normal'} onClick={() => setActiveView('normal')} icon={Maximize2} label="NORMAL" />
              <PerspectiveBtn active={activeView === 'xray'} onClick={() => setActiveView('xray'} icon={Layers} label="X-RAY" />
              <PerspectiveBtn active={activeView === 'muscles'} onClick={() => setActiveView('muscles'} icon={Wind} label="MUSCLE" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[450px] bg-slate-900/50 border-l border-slate-800 p-10 flex flex-col glass-panel shadow-2xl">
           <div className="flex-1 space-y-10 overflow-y-auto pr-2">
              <section className="space-y-4">
                 <h3 className="text-[10px] font-inter font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2"><Info size={14} className="text-cyan-500" /> BİYOMEKANİK ODAK</h3>
                 <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 border-l-4 border-l-cyan-500 shadow-inner">
                    <p className="text-sm text-slate-300 leading-relaxed font-roboto font-medium italic">"{exercise.biomechanics || "Bu egzersiz spesifik kas gruplarının koordinasyonunu hedefler."}"</p>
                 </div>
              </section>
              
              <section className="space-y-6">
                 <h3 className="text-[10px] font-inter font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2"><Zap size={14} className="text-cyan-500" /> UYGULAMA ADIMLARI</h3>
                 <div className="space-y-4">
                    {exercise.description.split('.').filter(s => s.trim()).map((step, i) => (
                      <div key={i} className={`flex gap-5 group/step transition-opacity ${currentRep > 0 && i === 0 ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-mono font-black text-cyan-500 shrink-0 group-hover/step:bg-cyan-500 group-hover/step:text-white transition-colors">{i+1}</div>
                        <p className="text-xs text-slate-400 leading-relaxed group-hover/step:text-slate-200 transition-colors font-medium">{step.trim()}.</p>
                      </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

function PerspectiveBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all w-16 ${active ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5' : 'text-slate-600 hover:text-slate-400 border border-transparent hover:bg-slate-800'}`}>
      <Icon size={18} /><span className="text-[8px] font-inter font-black tracking-widest">{label}</span>
    </button>
  );
}
