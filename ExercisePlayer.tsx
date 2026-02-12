
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Info, Zap, 
  Layers, Wind, Maximize2, FastForward, Heart, 
  CheckCircle2, WifiOff, ChevronRight, Video, Eye, EyeOff,
  Loader2, Trophy, Flame, Activity
} from 'lucide-react';
import { Exercise } from './types.ts';
import { ExerciseActions } from './ExerciseActions.tsx';

interface PlayerProps {
  exercise: Exercise;
  onClose: (finished?: boolean) => void;
}

/**
 * FREE-CORE VECTOR ANIMATOR
 * Bu bileşen video yerine CSS ve SVG ile canlandırılmış görseller kullanır.
 */
export const ExercisePlayer = ({ exercise, onClose }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSetComplete, setShowSetComplete] = useState(false);

  const handleNextSet = () => {
    if (currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
      setCurrentRep(0);
      setIsPlaying(false);
      setShowSetComplete(true);
      setTimeout(() => setShowSetComplete(false), 2000);
    } else {
      onClose(true);
    }
  };

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
      }, 3000 / playbackSpeed); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentRep, exercise.reps, playbackSpeed]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
        <button onClick={() => onClose(false)} className="flex items-center gap-2 text-slate-400 hover:text-white">
          <ChevronLeft />
          <span className="font-black text-[10px] uppercase tracking-widest">KAPAT</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">{exercise.titleTr || exercise.title}</h2>
          <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Vektörel Dinamik Akış</p>
        </div>
        <button onClick={() => onClose(true)} className="px-8 bg-cyan-500 text-white rounded-xl font-black italic text-xs">
          BİTİR
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
          
          {/* ANIMATION ENGINE */}
          <div className="relative w-full h-full max-w-4xl max-h-[70vh] flex items-center justify-center p-12">
            <div className={`relative w-full h-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
              
              {exercise.visualUrl || exercise.videoUrl ? (
                <div className="relative w-full h-full">
                  <img 
                    src={exercise.visualUrl || exercise.videoUrl} 
                    className={`w-full h-full object-contain transition-all duration-700 ${isPlaying ? 'animate-pulse scale-110 hue-rotate-15' : ''}`} 
                  />
                  {/* Overlay Vector Effects */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-full h-1 bg-cyan-400/20 absolute top-1/2 -translate-y-1/2 animate-[ping_2s_infinite]" />
                       <Activity className="text-cyan-400 animate-bounce" size={48} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-700">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Görsel Bekleniyor...</p>
                </div>
              )}
            </div>

            {/* Rep Counter Overlay */}
            <div className="absolute top-10 left-10 p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl">
                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2">CANLI_TAKİP</p>
                <p className="text-5xl font-black text-white italic tracking-tighter">
                  {currentRep} <span className="text-xl text-slate-600">/ {exercise.reps}</span>
                </p>
                <div className="w-32 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(currentRep / exercise.reps) * 100}%` }} />
                </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-slate-900/80 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
               <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-500 hover:text-white transition-all"><RotateCcw size={24} /></button>
               <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-white transition-all ${isPlaying ? 'bg-slate-800' : 'bg-cyan-500 shadow-xl shadow-cyan-500/20'}`}
               >
                 {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
               </button>
               <button onClick={handleNextSet} className="text-slate-500 hover:text-white transition-all"><FastForward size={24} /></button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-[400px] bg-slate-950 border-l border-white/5 p-10 space-y-8 overflow-y-auto">
             <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" /> BİYOMEKANİK REHBER
                </h3>
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 italic text-sm text-slate-400">
                  "{exercise.biomechanics}"
                </div>
             </div>
             
             <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">UYGULAMA</h3>
                <div className="space-y-4">
                   {(exercise.description || "").split('.').filter(s => s.trim()).map((step, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 bg-slate-900 border border-white/5 rounded-lg flex items-center justify-center text-[10px] font-black text-cyan-500">{i+1}</div>
                        <p className="text-xs text-slate-500 leading-relaxed">{step.trim()}.</p>
                     </div>
                   ))}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};
