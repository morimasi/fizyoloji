
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Info, Zap, 
  Layers, Wind, Maximize2, FastForward, Heart, 
  CheckCircle2, WifiOff, ChevronRight, Video, Eye, EyeOff,
  Loader2, Trophy, Flame, Activity, Volume2, VolumeX, Mic
} from 'lucide-react';
import { Exercise, ExerciseTutorial } from './types.ts';
import { generateExerciseTutorial } from './ai-service.ts';
import { ExerciseActions } from './ExerciseActions.tsx';

interface PlayerProps {
  exercise: Exercise;
  onClose: (finished?: boolean) => void;
}

/**
 * PHYSIOCORE 24FPS GRID PLAYER (THEATER MODE v2)
 * Uses strict viewport masking to simulate video playback from sprite sheets.
 */
export const ExercisePlayer = ({ exercise, onClose }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [tutorial, setTutorial] = useState<ExerciseTutorial | null>(exercise.tutorialData || null);
  const [isLoadingTutorial, setIsLoadingTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Animation State
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameCount = exercise.visualFrameCount || 24;
  const layout = exercise.visualLayout || 'grid-4x6'; 
  const cols = layout === 'grid-4x6' ? 6 : frameCount;
  const rows = layout === 'grid-4x6' ? 4 : 1;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stepTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!tutorial && (exercise.visualUrl || exercise.videoUrl)) {
      loadTutorial();
    }
  }, []);

  const loadTutorial = async () => {
    setIsLoadingTutorial(true);
    const data = await generateExerciseTutorial(exercise.title);
    if (data) {
      setTutorial(data);
      exercise.tutorialData = data; 
      if (data.audioBase64) {
        const audioSrc = `data:audio/mp3;base64,${data.audioBase64}`;
        audioRef.current = new Audio(audioSrc);
        audioRef.current.volume = 0.8;
      }
    }
    setIsLoadingTutorial(false);
  };

  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current && audioEnabled && currentRep === 0) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
      runStepSequence();
    } else {
      if (audioRef.current) audioRef.current.pause();
      clearTimeout(stepTimerRef.current);
    }
    return () => clearTimeout(stepTimerRef.current);
  }, [isPlaying]);

  // ANIMATION LOOP (PING-PONG FLUIDITY)
  useEffect(() => {
    let interval: any;
    const baseFps = 15; // Smooth cinematic look
    let direction = 1;

    if (isPlaying && exercise.visualUrl) {
        interval = setInterval(() => {
            setCurrentFrame(prev => {
                let next = prev + direction;
                if (next >= frameCount - 1) {
                    direction = -1;
                    next = frameCount - 1;
                } else if (next <= 0) {
                    direction = 1;
                    next = 0;
                }
                return next;
            });
        }, 1000 / baseFps);
    } else {
        setCurrentFrame(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying, frameCount]);

  const runStepSequence = () => {
    if (!tutorial) return;
    const step = tutorial.script[currentStepIndex];
    stepTimerRef.current = setTimeout(() => {
      if (currentStepIndex < tutorial.script.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        runStepSequence();
      } else {
        setCurrentStepIndex(0);
        handleRepComplete();
      }
    }, step.duration);
  };

  const handleRepComplete = () => {
    setCurrentRep(prev => {
      const nextRep = prev + 1;
      if (nextRep >= exercise.reps) {
        setIsPlaying(false);
        return exercise.reps;
      }
      runStepSequence(); 
      return nextRep;
    });
  };

  const handleNextSet = () => {
    if (currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
      setCurrentRep(0);
      setIsPlaying(false);
      setCurrentStepIndex(0);
    } else {
      onClose(true);
    }
  };

  // --- THEATER MODE STYLES (MATCHES VISUALSTUDIO) ---
  const getBackgroundStyles = () => {
      // Zoom Factor: Enlarge to isolate 1 frame
      const bgSizeX = cols * 100; 
      const bgSizeY = rows * 100;

      // Position Shift
      const colIndex = currentFrame % cols;
      const rowIndex = Math.floor(currentFrame / cols);
      
      const xPos = cols > 1 ? (colIndex / (cols - 1)) * 100 : 0;
      const yPos = rows > 1 ? (rowIndex / (rows - 1)) * 100 : 0;

      return {
          backgroundImage: `url(${exercise.visualUrl || exercise.videoUrl})`,
          backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
          backgroundPosition: `${xPos}% ${yPos}%`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto' as const
      };
  };

  const currentAnimationState = tutorial?.script[currentStepIndex]?.animation || 'hold';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-500 font-roboto">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl relative z-20">
        <button onClick={() => onClose(false)} className="flex items-center gap-2 text-slate-400 hover:text-white">
          <ChevronLeft />
          <span className="font-black text-[10px] uppercase tracking-widest hidden sm:inline">KAPAT</span>
        </button>
        <div className="text-center">
          <h2 className="text-lg md:text-xl font-black italic uppercase text-white tracking-tighter">{exercise.titleTr || exercise.title}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest">
                Cinematic Motion Engine
            </span>
            {isLoadingTutorial && <Loader2 size={10} className="animate-spin text-cyan-500" />}
          </div>
        </div>
        <button onClick={() => onClose(true)} className="px-6 py-2 bg-cyan-500 text-white rounded-xl font-black italic text-xs shadow-lg shadow-cyan-500/20">
          BİTİR
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
          
          <div className="relative w-full h-full max-w-4xl max-h-[70vh] flex items-center justify-center p-4 md:p-12">
            <div className={`relative w-full h-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-1000 ${isPlaying ? 'scale-[1.02]' : 'scale-100'}`}>
              
              {exercise.visualUrl || exercise.videoUrl ? (
                // THEATER CONTAINER with Black Background
                <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
                  
                   <div 
                        className="w-full h-full"
                        style={getBackgroundStyles()}
                      />
                  
                  {isPlaying && (
                    <>
                       <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${currentAnimationState === 'breathe' ? 'bg-cyan-500/10' : 'bg-transparent'}`} />
                       <div className="absolute bottom-10 left-0 right-0 text-center px-6">
                          <p className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight drop-shadow-xl animate-in slide-in-from-bottom-2 fade-in">
                            {tutorial?.script[currentStepIndex]?.text}
                          </p>
                       </div>
                    </>
                  )}

                  {!isPlaying && !isLoadingTutorial && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                       <PlayCirclePulse onClick={() => setIsPlaying(true)} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-700">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Görsel Hazırlanıyor...</p>
                </div>
              )}
            </div>

            {/* Live Stats HUD */}
            <div className="absolute top-6 left-6 md:top-10 md:left-10 p-4 md:p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl min-w-[140px]">
                <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                   <Activity size={12} /> CANLI TAKİP
                </p>
                <p className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
                  {currentRep} <span className="text-lg md:text-xl text-slate-600 font-bold not-italic">/ {exercise.reps}</span>
                </p>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${(currentRep / exercise.reps) * 100}%` }} />
                </div>
            </div>

            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="absolute top-6 right-6 md:top-10 md:right-10 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors"
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-8 bg-slate-900/90 backdrop-blur-3xl border border-white/10 px-6 py-4 md:p-6 rounded-[2.5rem] shadow-2xl z-20">
               <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-500 hover:text-white transition-all"><RotateCcw size={20} /></button>
               <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] flex items-center justify-center text-white transition-all ${isPlaying ? 'bg-slate-800' : 'bg-cyan-500 shadow-xl shadow-cyan-500/20'}`}
               >
                 {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
               </button>
               <button onClick={handleNextSet} className="text-slate-500 hover:text-white transition-all"><FastForward size={20} /></button>
          </div>
        </div>

        <div className="w-full lg:w-[400px] bg-slate-950 border-t lg:border-t-0 lg:border-l border-white/5 p-8 space-y-8 overflow-y-auto max-h-[30vh] lg:max-h-full">
             {tutorial ? (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-cyan-500 tracking-widest flex items-center gap-2">
                    <Mic size={14} /> AI YÖNETMEN KOMUTLARI
                  </h3>
                  <div className="space-y-2">
                    {tutorial.script.map((s, i) => (
                      <div key={i} className={`p-4 rounded-2xl border transition-all ${i === currentStepIndex && isPlaying ? 'bg-cyan-500/10 border-cyan-500 text-white scale-105' : 'bg-slate-900/50 border-white/5 text-slate-500'}`}>
                         <div className="flex justify-between mb-1">
                            <span className="text-[9px] font-black uppercase">ADIM {s.step}</span>
                            <span className="text-[9px] font-mono opacity-50">{s.duration}ms</span>
                         </div>
                         <p className="text-xs font-medium italic">"{s.text}"</p>
                      </div>
                    ))}
                  </div>
               </div>
             ) : (
               <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 text-center space-y-2 opacity-50">
                  <Loader2 className="animate-spin mx-auto" />
                  <p className="text-[10px] uppercase">Senaryo Yükleniyor...</p>
               </div>
             )}
        </div>
      </div>
    </div>
  );
};

const PlayCirclePulse = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="group relative w-24 h-24 flex items-center justify-center">
    <div className="absolute inset-0 bg-cyan-500/30 rounded-full animate-ping" />
    <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-[ping_2s_infinite_200ms]" />
    <div className="relative w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-cyan-500/50 transition-transform group-hover:scale-110">
      <Play size={40} fill="currentColor" className="ml-2" />
    </div>
  </button>
);
