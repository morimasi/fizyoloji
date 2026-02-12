
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Info, Zap, 
  Layers, Wind, Maximize2, FastForward, Heart, 
  CheckCircle2, WifiOff, ChevronRight, Video, Eye, EyeOff,
  Loader2, Trophy, Flame
} from 'lucide-react';
import { Exercise } from './types.ts';
import { ExerciseActions } from './ExerciseActions.tsx';

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
  const [isCinematic, setIsCinematic] = useState(false);
  const [showSetComplete, setShowSetComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNextSet = () => {
    if (currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
      setCurrentRep(0);
      setIsPlaying(false);
      setShowSetComplete(true);
      setStreak(prev => prev + 1);
      setTimeout(() => setShowSetComplete(false), 3000);
    } else {
      onClose(true);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && currentRep < exercise.reps) {
      const tempoSpeed = 4000; // Default medical tempo
      interval = setInterval(() => {
        setCurrentRep(prev => {
          if (prev + 1 === exercise.reps) {
            setIsPlaying(false);
            return exercise.reps;
          }
          return prev + 1;
        });
      }, tempoSpeed / playbackSpeed); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentRep, exercise.reps, playbackSpeed, exercise.tempo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, playbackSpeed]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-700 select-none">
      {/* Top Navigation Overlay */}
      {!isCinematic && (
        <div className="p-6 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl z-50">
          <button onClick={() => onClose(false)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <ChevronLeft className="group-hover:-translate-x-1" />
            <span className="font-inter font-black text-[10px] uppercase tracking-widest">İPTAL</span>
          </button>
          <div className="text-center">
            <h2 className="font-inter text-xl font-black italic tracking-tighter uppercase leading-tight text-white">{exercise.titleTr || exercise.title}</h2>
            <div className="flex items-center justify-center gap-3">
               <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-1">
                 <Video size={10} /> CINEMATIC MOTION ACTIVE
               </p>
               <span className="w-1 h-1 bg-slate-700 rounded-full" />
               <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{exercise.code}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
               <Flame size={14} className="text-amber-500 animate-pulse" />
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">STREAK: {streak}</span>
            </div>
            <button 
              onClick={() => setIsCinematic(true)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 flex items-center gap-2 transition-all"
            >
              <Eye size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">SİNEMATİK</span>
            </button>
            <button onClick={() => onClose(true)} className="px-8 bg-cyan-500 text-white rounded-xl font-inter font-black italic text-xs shadow-xl shadow-cyan-500/30">
              BİTİR <ChevronRight size={16} className="inline ml-1" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          
          <div className="w-full h-full relative flex items-center justify-center">
            {(exercise.videoUrl || exercise.visualUrl) ? (
              exercise.isMotion ? (
                <video 
                  ref={videoRef}
                  src={exercise.videoUrl || exercise.visualUrl} 
                  loop 
                  muted 
                  playsInline
                  preload="auto"
                  autoPlay={isPlaying}
                  className={`w-full h-full object-contain md:object-cover transition-all duration-[2000ms] ease-in-out ${activeView === 'xray' ? 'hue-rotate-180 brightness-150 contrast-125' : activeView === 'muscles' ? 'sepia contrast-150 saturate-200' : ''}`}
                />
              ) : (
                <img src={exercise.visualUrl} className="w-full h-full object-contain md:object-cover" alt="Exercise Static" />
              )
            ) : (
              <div className="text-center space-y-4">
                <Loader2 size={64} className="mx-auto text-cyan-400 animate-spin" />
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest animate-pulse">Sinematik Akış Hazırlanıyor...</p>
              </div>
            )}

            <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none transition-opacity duration-1000 ${isCinematic ? 'opacity-30' : 'opacity-100'}`} />
            
            {!isCinematic && (
              <div className="absolute top-10 left-10 space-y-4 pointer-events-none animate-in slide-in-from-left-4 duration-1000">
                <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/5 space-y-1 shadow-2xl relative">
                  {showSetComplete && (
                    <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-2 rounded-full animate-bounce shadow-lg">
                      <Trophy size={20} />
                    </div>
                  )}
                  <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.3em] font-black mb-2">PROGRESS_LIVE</p>
                  <p className="text-4xl font-black text-white italic tracking-tighter">
                    {currentRep} <span className="text-[14px] text-slate-500 opacity-50">/ {exercise.reps}</span>
                  </p>
                  <div className="w-32 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-700" style={{ width: `${(currentRep / exercise.reps) * 100}%` }} />
                  </div>
                  <p className="text-[8px] font-mono text-slate-600 uppercase mt-4 tracking-widest">SET {currentSet} OF {exercise.sets}</p>
                </div>
              </div>
            )}

            {isCinematic && (
              <button 
                onClick={() => setIsCinematic(false)}
                className="absolute top-10 right-10 p-5 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white/50 hover:text-white transition-all z-50 group"
              >
                <EyeOff size={24} />
              </button>
            )}
          </div>

          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-slate-950/80 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl z-50 transition-all duration-700 ${isCinematic ? 'opacity-0 translate-y-20 scale-90 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex gap-2 pr-6 border-r border-white/10">
              {[0.5, 1, 1.5].map(speed => (
                <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${playbackSpeed === speed ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                  {speed}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-8">
               <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-600 hover:text-white transition-all hover:rotate-[-45deg]"><RotateCcw size={24} /></button>
               <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-white transition-all duration-500 active:scale-90 ${isPlaying ? 'bg-slate-800 border border-white/5' : 'bg-cyan-500 shadow-2xl shadow-cyan-500/40'}`}
               >
                 {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
               </button>
               <button onClick={handleNextSet} className="text-slate-600 hover:text-white transition-all"><FastForward size={24} /></button>
            </div>

            <div className="flex gap-3 pl-6 border-l border-white/10">
               <button onClick={() => setActiveView('normal')} className={`p-3 rounded-xl transition-all ${activeView === 'normal' ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:text-white'}`}><Maximize2 size={18} /></button>
               <button onClick={() => setActiveView('xray')} className={`p-3 rounded-xl transition-all ${activeView === 'xray' ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:text-white'}`}><Layers size={18} /></button>
               <button onClick={() => setActiveView('muscles')} className={`p-3 rounded-xl transition-all ${activeView === 'muscles' ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:text-white'}`}><Wind size={18} /></button>
            </div>
          </div>
        </div>

        {!isCinematic && (
          <div className="w-full lg:w-[450px] bg-slate-950 border-l border-white/5 p-12 space-y-12 overflow-y-auto animate-in slide-in-from-right-4 duration-1000 no-scrollbar">
             <div className="flex justify-center pb-6 border-b border-white/5">
                <ExerciseActions exercise={exercise} variant="player" />
             </div>
             <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" /> KLİNİK REHBER
                </h3>
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-2xl" />
                  <p className="text-[13px] text-slate-300 leading-relaxed italic font-medium">"{exercise.biomechanics}"</p>
                </div>
             </div>
             
             <div className="space-y-8">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> UYGULAMA ADIMLARI
                </h3>
                <div className="space-y-6">
                   {(exercise.description || "").split('.').filter(s => s.trim()).map((step, i) => (
                     <div key={i} className="flex gap-6 group">
                        <div className="w-8 h-8 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center text-[11px] font-black text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 shadow-inner">{i+1}</div>
                        <p className="text-[13px] text-slate-500 group-hover:text-slate-300 transition-colors leading-relaxed">{step.trim()}.</p>
                     </div>
                   ))}
                </div>
             </div>

             <div className="pt-10 border-t border-white/5">
                <div className="flex items-center gap-3 text-emerald-500/50">
                  <Zap size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Cinema Motion V4.2 High-Fidelity Active</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
