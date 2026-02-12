
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  FastForward, CheckCircle2, Loader2, Activity,
  Eye, Bone, Activity as MuscleIcon, Maximize2
} from 'lucide-react';
import { Exercise, AnimationChoreography } from './types.ts';
import { generateExerciseChoreography } from './ai-service.ts';

interface PlayerProps {
  exercise: Exercise;
  onClose: (finished?: boolean) => void;
}

/**
 * KINETIC RENDER ENGINE (v5.0)
 * AI'dan gelen matematiksel veriyi görsel şölene dönüştürür.
 */
export const ExercisePlayer = ({ exercise, onClose }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [choreography, setChoreography] = useState<AnimationChoreography | null>(exercise.choreography || null);
  const [isLoadingChoreography, setIsLoadingChoreography] = useState(false);
  const [renderMode, setRenderMode] = useState<'Standard' | 'X-Ray' | 'Muscle'>('Standard');

  // AI Yönetmenden koreografi talep et
  useEffect(() => {
    if (!choreography) {
      setIsLoadingChoreography(true);
      generateExerciseChoreography(exercise).then(data => {
        if (data) setChoreography(data);
        setIsLoadingChoreography(false);
      });
    }
  }, [exercise]);

  // Animasyon Zamanlaması
  useEffect(() => {
    let interval: any;
    if (isPlaying && currentRep < exercise.reps) {
      interval = setInterval(() => {
        setCurrentRep(prev => {
          if (prev + 1 === exercise.reps) {
            setIsPlaying(false);
            return exercise.reps;
          }
          return prev + 1;
        });
      }, (choreography?.totalDuration || 4) * 1000); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentRep, exercise.reps, choreography]);

  // CSS Değişkenleri ile Animasyon Kontrolü
  const animationStyle = useMemo(() => {
    if (!choreography || !isPlaying) return {};
    return {
      '--rotation-end': `${choreography.frames[1]?.rotation || 45}deg`,
      '--anim-duration': `${choreography.totalDuration}s`
    } as React.CSSProperties;
  }, [choreography, isPlaying]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col animate-in fade-in duration-700">
      {/* Cinematic Header */}
      <div className="p-8 flex justify-between items-center border-b border-white/5 bg-slate-950/40 backdrop-blur-3xl">
        <button onClick={() => onClose(false)} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group">
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-[10px] uppercase tracking-[0.3em]">OTURUMU KAPAT</span>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">
            {exercise.titleTr || exercise.title}
          </h2>
          <p className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
            <span className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" /> KINETIC ENGINE v5.0 ACTIVE
          </p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setRenderMode('Standard')} className={`p-3 rounded-xl border transition-all ${renderMode === 'Standard' ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}><Eye size={18} /></button>
           <button onClick={() => setRenderMode('X-Ray')} className={`p-3 rounded-xl border transition-all ${renderMode === 'X-Ray' ? 'bg-amber-500 border-amber-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}><Bone size={18} /></button>
           <button onClick={() => setRenderMode('Muscle')} className={`p-3 rounded-xl border transition-all ${renderMode === 'Muscle' ? 'bg-rose-500 border-rose-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}><MuscleIcon size={18} /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Visual Stage */}
        <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center p-12">
           {/* Background Grid Layer */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
           
           <div 
             className="relative w-full max-w-2xl aspect-square flex items-center justify-center"
             style={animationStyle}
           >
              {isLoadingChoreography ? (
                <div className="flex flex-col items-center gap-6">
                   <Loader2 className="animate-spin text-cyan-500" size={64} />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Biyomekanik Veri İşleniyor...</p>
                </div>
              ) : (
                <div className="relative w-full h-full">
                   {/* Main Anatomical Image */}
                   <img 
                     src={exercise.visualUrl || 'https://img.icons8.com/fluency/512/000000/human-skeleton.png'} 
                     className={`w-full h-full object-contain transition-all duration-1000 ${renderMode === 'X-Ray' ? 'invert sepia saturate-200 hue-rotate-15' : renderMode === 'Muscle' ? 'saturate-200 hue-rotate-[320deg]' : ''}`}
                     style={{
                        transform: isPlaying ? 'rotate(var(--rotation-end))' : 'rotate(0deg)',
                        transition: isPlaying ? 'transform var(--anim-duration) ease-in-out' : 'transform 1s ease-out'
                     }}
                   />
                   
                   {/* Neon Kinetic Layers */}
                   <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="w-[80%] h-[80%] border-2 border-cyan-500/20 rounded-full animate-[ping_3s_infinite]" />
                      <div className="absolute w-1 h-32 bg-cyan-500/40 blur-md animate-pulse" style={{ left: '50%', transform: 'translateX(-50%)' }} />
                   </div>

                   {/* Muscle Activation Overlay */}
                   {renderMode === 'Muscle' && isPlaying && (
                     <div className="absolute inset-0 bg-rose-500/10 mix-blend-overlay animate-pulse" />
                   )}
                </div>
              )}

              {/* Rep Counter Floating UI */}
              <div className="absolute bottom-10 right-10 p-10 bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl">
                 <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-2">DOZAJ_SAYACI</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white italic tracking-tighter">{currentRep}</span>
                    <span className="text-xl text-slate-600 font-bold">/ {exercise.reps}</span>
                 </div>
              </div>
           </div>

           {/* Central Control Bar */}
           <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-10 bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/5 shadow-2xl">
              <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-500 hover:text-white transition-all"><RotateCcw size={28} /></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all ${isPlaying ? 'bg-slate-800' : 'bg-cyan-500 shadow-2xl shadow-cyan-500/40'}`}
              >
                {isPlaying ? <Pause size={48} className="text-white" fill="currentColor" /> : <Play size={48} className="text-white ml-2" fill="currentColor" />}
              </button>
              <button onClick={() => onClose(true)} className="text-slate-500 hover:text-white transition-all"><CheckCircle2 size={28} /></button>
           </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="w-full lg:w-[450px] bg-slate-950 border-l border-white/5 p-12 space-y-12 overflow-y-auto custom-scrollbar">
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-3">
                 <Activity size={16} className="text-cyan-500" /> KLİNİK BİYOMEKANİK
              </h3>
              <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-white/5 space-y-4">
                 <p className="text-sm text-slate-300 italic leading-relaxed">"{exercise.biomechanics}"</p>
                 <div className="flex flex-wrap gap-2 pt-4">
                    {exercise.muscleGroups?.map(m => (
                      <span key={m} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[9px] font-black text-cyan-400 uppercase">{m}</span>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-3">
                 <Maximize2 size={16} className="text-emerald-500" /> UYGULAMA REHBERİ
              </h3>
              <div className="space-y-6">
                 {exercise.description.split('.').filter(s => s.trim()).map((step, i) => (
                   <div key={i} className="flex gap-6 group">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                        {i + 1}
                      </div>
                      <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed font-medium">{step.trim()}.</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
