
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  Activity, Volume2, VolumeX, Mic, Loader2,
  Wind, ShieldCheck
} from 'lucide-react';
import { Exercise, ExerciseTutorial } from './types.ts';
import { generateExerciseTutorial } from './ai-service.ts';

interface PlayerProps {
  exercise: Exercise;
  onClose: (finished?: boolean) => void;
}

export const ExercisePlayer = ({ exercise, onClose }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [tutorial, setTutorial] = useState<ExerciseTutorial | null>(exercise.tutorialData || null);
  const [isLoadingTutorial, setIsLoadingTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stepTimerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const isVideo = exercise.videoUrl?.includes('.mp4') || exercise.videoUrl?.includes('googlevideo');

  useEffect(() => {
    if (!tutorial && (exercise.visualUrl || exercise.videoUrl)) {
      loadTutorial();
    }

    if (!isVideo && exercise.visualUrl) {
      const img = new Image();
      img.src = exercise.visualUrl;
      img.onload = () => {
        imageCacheRef.current = img;
        drawInterpolatedFrame(0);
      };
    }
  }, []);

  const loadTutorial = async () => {
    setIsLoadingTutorial(true);
    const data = await generateExerciseTutorial(exercise.title);
    if (data) {
      setTutorial(data);
      if (data.audioBase64) {
        audioRef.current = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
      }
    }
    setIsLoadingTutorial(false);
  };

  const drawInterpolatedFrame = (progress: number) => {
    const canvas = canvasRef.current;
    const img = imageCacheRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support both legacy (2x4) and new (4x4)
    const layout = exercise.visualLayout || 'grid-4x4';
    const cols = layout === 'grid-4x4' ? 4 : 4;
    const rows = layout === 'grid-4x4' ? 4 : 2;
    const totalFrames = cols * rows;
    
    const cellW = img.width / cols;
    const cellH = img.height / rows;

    const frame1 = Math.floor(progress) % totalFrames;
    const frame2 = (frame1 + 1) % totalFrames;
    const alpha = progress % 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Frame 1
    ctx.globalAlpha = 1 - alpha;
    ctx.drawImage(img, (frame1 % cols) * cellW, Math.floor(frame1 / cols) * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);

    // Frame 2
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (frame2 % cols) * cellW, Math.floor(frame2 / cols) * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);
    
    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!isPlaying || isVideo) return;
      
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Speed scale
      const speed = 0.004; 
      progressRef.current = (progressRef.current + dt * speed) % 16;
      
      drawInterpolatedFrame(progressRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying && !isVideo) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isVideo]);

  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current && audioEnabled && currentRep === 0) audioRef.current.play();
      runStepSequence();
    } else {
      if (audioRef.current) audioRef.current.pause();
      clearTimeout(stepTimerRef.current);
    }
    return () => clearTimeout(stepTimerRef.current);
  }, [isPlaying]);

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

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-500 font-roboto">
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl z-20">
        <button onClick={() => onClose(false)} className="flex items-center gap-2 text-slate-400 hover:text-white">
          <ChevronLeft />
          <span className="font-black text-[10px] uppercase tracking-widest">KAPAT</span>
        </button>
        <div className="text-center">
          <h2 className="text-lg md:text-xl font-black italic uppercase text-white tracking-tighter">{exercise.titleTr || exercise.title}</h2>
          <div className="flex items-center justify-center gap-2">
             <Wind size={10} className="text-cyan-400" />
             <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest">60FPS Hybrid Motion Engine</span>
          </div>
        </div>
        <button onClick={() => onClose(true)} className="px-6 py-2 bg-cyan-500 text-white rounded-xl font-black italic text-xs shadow-lg shadow-cyan-500/20">BİTİR</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-4">
          <div className={`relative w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-1000 ${isPlaying ? 'scale-[1.02]' : 'scale-100'}`}>
             <div className="w-full h-full bg-black flex items-center justify-center">
                {isVideo ? (
                   <video 
                     key={exercise.videoUrl}
                     src={exercise.videoUrl} 
                     className="w-full h-full object-cover" 
                     autoPlay={isPlaying} 
                     loop 
                     muted={!audioEnabled}
                   />
                ) : (
                   <canvas ref={canvasRef} width={1024} height={1024} className="w-full h-full object-contain" />
                )}
                
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                     <button onClick={() => setIsPlaying(true)} className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
                        <Play size={40} fill="currentColor" className="ml-2" />
                     </button>
                  </div>
                )}
             </div>

             <div className="absolute top-6 left-6 p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl">
                <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Activity size={12} /> CANLI TAKİP</p>
                <p className="text-4xl font-black text-white italic tracking-tighter">{currentRep} <span className="text-lg text-slate-600">/ {exercise.reps}</span></p>
             </div>
             
             {isPlaying && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <p className="text-sm font-black italic text-white uppercase text-center tracking-wide">
                        {tutorial?.script[currentStepIndex]?.text}
                    </p>
                </div>
             )}
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl z-20">
               <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-500 hover:text-white"><RotateCcw size={20} /></button>
               <button onClick={() => setIsPlaying(!isPlaying)} className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-white transition-all ${isPlaying ? 'bg-slate-800' : 'bg-cyan-500 shadow-xl shadow-cyan-500/20'}`}>
                 {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
               </button>
               <button onClick={() => setAudioEnabled(!audioEnabled)} className="text-slate-500 hover:text-white">
                  {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
               </button>
          </div>
        </div>

        <div className="w-full lg:w-[400px] bg-slate-950 border-l border-white/5 p-8 space-y-8 overflow-y-auto hidden lg:block">
             {tutorial ? (
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-cyan-500 tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> KLİNİK AKIŞ</h3>
                  <div className="space-y-2">
                    {tutorial.script.map((s, i) => (
                      <div key={i} className={`p-4 rounded-2xl border transition-all ${i === currentStepIndex && isPlaying ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-900/50 border-white/5 text-slate-500'}`}>
                         <p className="text-xs font-medium italic">"{s.text}"</p>
                      </div>
                    ))}
                  </div>
               </div>
             ) : (
               <div className="p-6 text-center opacity-50"><Loader2 className="animate-spin mx-auto mb-2" /><p className="text-[10px]">Analiz Ediliyor...</p></div>
             )}
        </div>
      </div>
    </div>
  );
};
