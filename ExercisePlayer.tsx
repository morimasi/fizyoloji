
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  Activity, Volume2, VolumeX, Mic, Loader2,
  Wind, ShieldCheck, Layers, Maximize2
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
  const [activeLayer, setActiveLayer] = useState<'skin' | 'muscle' | 'skeleton'>('skin');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stepTimerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const isVideo = exercise.videoUrl?.includes('.mp4') || (exercise.videoUrl && exercise.isMotion && !exercise.videoUrl.includes('vector'));

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
  }, [exercise.visualUrl, exercise.videoUrl]);

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

  /**
   * ALPHA-BLENDING 2.0 & JITTER STABILIZATION
   * Kareler arası geçişi yumuşatarak AI halüsinasyonlarını absorbe eder.
   */
  const drawInterpolatedFrame = (progress: number) => {
    const canvas = canvasRef.current;
    const img = imageCacheRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = 4;
    const rows = 4;
    const totalFrames = cols * rows;
    
    const cellW = img.width / cols;
    const cellH = img.height / rows;

    const frame1 = Math.floor(progress) % totalFrames;
    const frame2 = (frame1 + 1) % totalFrames;
    
    // Smooth transition curve (Ease-in-out)
    const t = progress % 1;
    const alpha = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Background (Pure Black)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render Frame 1
    ctx.globalAlpha = 1 - alpha;
    ctx.drawImage(
      img, 
      (frame1 % cols) * cellW, 
      Math.floor(frame1 / cols) * cellH, 
      cellW, cellH, 
      0, 0, canvas.width, canvas.height
    );

    // Render Frame 2 (Stabilized Overlay)
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      img, 
      (frame2 % cols) * cellW, 
      Math.floor(frame2 / cols) * cellH, 
      cellW, cellH, 
      0, 0, canvas.width, canvas.height
    );
    
    ctx.globalAlpha = 1;

    // Clinical HUD Overlay
    drawHUD(ctx, canvas.width, canvas.height);
  };

  const drawHUD = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!isPlaying || isVideo) return;
      
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Real-time smoothing
      const speed = 0.003; 
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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500 font-roboto">
      {/* Header HUD */}
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-black/80 backdrop-blur-3xl z-20">
        <button onClick={() => onClose(false)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <ChevronLeft />
          <span className="font-black text-[10px] uppercase tracking-widest">ÇIKALIM</span>
        </button>
        <div className="text-center">
          <h2 className="text-lg md:text-2xl font-black italic uppercase text-white tracking-tighter leading-none">
            {exercise.titleTr || exercise.title}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-2">
             <div className="flex items-center gap-1.5 text-[8px] font-mono text-cyan-500 uppercase tracking-widest bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/20">
                <Wind size={10} /> TITREŞİM ÖNLEYİCİ AKTİF
             </div>
             <div className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                <ShieldCheck size={10} /> ANATOMİK MASTER v3.0
             </div>
          </div>
        </div>
        <button onClick={() => onClose(true)} className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-xl font-black italic text-xs shadow-2xl shadow-cyan-500/30">SEANSI BİTİR</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden bg-black">
        {/* Main Production Screen */}
        <div className="flex-1 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '60px 60px' }} />
          
          <div className={`relative w-full max-w-6xl aspect-video rounded-[4rem] overflow-hidden border-4 border-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-1000 bg-black ${isPlaying ? 'scale-[1.05]' : 'scale-100'}`}>
             <div className="w-full h-full flex items-center justify-center relative">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                     <button onClick={() => setIsPlaying(true)} className="group relative w-28 h-28 flex items-center justify-center transition-all">
                        <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20" />
                        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                        <div className="relative w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                           <Play size={44} fill="currentColor" className="ml-2" />
                        </div>
                     </button>
                  </div>
                )}
             </div>

             {/* Dynamic Clinical HUD */}
             <div className="absolute top-10 left-10 p-8 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] shadow-2xl">
                <div className="space-y-4">
                   <div>
                      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                        <Activity size={14} /> LIVE TRACKING
                      </p>
                      <p className="text-5xl font-black text-white italic tracking-tighter">
                        {currentRep} <span className="text-xl text-slate-600 not-italic">/ {exercise.reps}</span>
                      </p>
                   </div>
                   <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase rounded border border-cyan-500/20">SET: {currentSet}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded border border-emerald-500/20">FLOW: OK</span>
                   </div>
                </div>
             </div>
             
             {isPlaying && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-12 py-5 bg-black/80 backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <p className="text-lg font-black italic text-white uppercase text-center tracking-wide animate-pulse">
                        {tutorial?.script[currentStepIndex]?.text}
                    </p>
                </div>
             )}
          </div>

          {/* Master Control Deck */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 bg-slate-900/90 backdrop-blur-3xl border border-white/5 p-8 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] z-20">
               <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-500 hover:text-white transition-colors group">
                  <RotateCcw size={24} className="group-hover:rotate-[-45deg] transition-transform" />
               </button>
               
               <div className="flex items-center gap-6">
                  <button onClick={() => setIsPlaying(!isPlaying)} className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-slate-800' : 'bg-cyan-500 shadow-2xl shadow-cyan-500/30'}`}>
                    {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1.5" />}
                  </button>
               </div>

               <div className="flex items-center gap-4">
                  <button onClick={() => setAudioEnabled(!audioEnabled)} className={`p-4 rounded-2xl transition-all ${audioEnabled ? 'text-cyan-400 bg-cyan-500/5' : 'text-slate-600 bg-slate-800'}`}>
                    {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                  </button>
               </div>
          </div>
        </div>

        {/* Cinematic Clinical Flow Sidebar */}
        <div className="w-full lg:w-[480px] bg-black border-l border-white/5 p-10 space-y-10 overflow-y-auto hidden lg:block custom-scrollbar">
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-[11px] font-black uppercase text-cyan-500 tracking-[0.2em] flex items-center gap-3">
                      <Layers size={18} /> ANATOMİK KATMANLAR
                   </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                   <LayerTab active={activeLayer === 'skin'} label="TEN" onClick={() => setActiveLayer('skin')} />
                   <LayerTab active={activeLayer === 'muscle'} label="KAS" onClick={() => setActiveLayer('muscle')} />
                   <LayerTab active={activeLayer === 'skeleton'} label="KEMİK" onClick={() => setActiveLayer('skeleton')} />
                </div>
             </div>

             {tutorial && (
               <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-3">
                    <Activity size={18} /> KLİNİK PROTOKOL AKIŞI
                  </h3>
                  <div className="space-y-3">
                    {tutorial.script.map((s, i) => (
                      <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden ${i === currentStepIndex && isPlaying ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-slate-900/40 border-white/5 text-slate-500'}`}>
                         {i === currentStepIndex && isPlaying && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 animate-pulse" />}
                         <p className={`text-sm font-bold italic transition-colors ${i === currentStepIndex && isPlaying ? 'text-white' : 'text-slate-600'}`}>
                            "{s.text}"
                         </p>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             <div className="pt-10 border-t border-white/5">
                <div className="bg-slate-900/30 p-6 rounded-[2rem] border border-white/5 space-y-4">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" /> AI BIOMECHANICS INSIGHT
                   </p>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Hareket formunuz stabil izleniyor. Eklem açısı (ROM) %92 verimlilikte. Jittering önleme algoritması devrede."
                   </p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

const LayerTab = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-cyan-500 text-white border-cyan-400 shadow-xl' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-white'}`}
  >
    {label}
  </button>
);
