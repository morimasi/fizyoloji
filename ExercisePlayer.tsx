
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  Activity, Volume2, VolumeX, Mic, Loader2,
  Wind, ShieldCheck, Layers, Maximize2, Microscope,
  ZapOff, Flame, TrendingUp
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
  const [showTension, setShowTension] = useState(true);
  const [activeLayer, setActiveLayer] = useState<'skin' | 'muscle' | 'skeleton'>('muscle');
  
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
   * MTS (MUSCLE TENSION SIMULATION) & ALPHA-BLENDING 2.0
   * Hareketin zirve noktasında (frame 8) maksimum parlama ve gerilim simüle eder.
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
    
    const t = progress % 1;
    const alpha = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // Gerilim Hesaplama (Frame 8 peak tension)
    const frameNorm = (progress % totalFrames) / totalFrames;
    const tensionLevel = Math.sin(frameNorm * Math.PI); // 0 -> 1 -> 0 eğrisi

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ana Render Katmanları
    ctx.globalAlpha = 1 - alpha;
    ctx.drawImage(img, (frame1 % cols) * cellW, Math.floor(frame1 / cols) * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (frame2 % cols) * cellW, Math.floor(frame2 / cols) * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);
    
    ctx.globalAlpha = 1;

    // MTS Overlay (Myoelectric Simulation)
    if (showTension) {
       drawTensionSimulation(ctx, canvas.width, canvas.height, tensionLevel);
    }

    drawTitanHUD(ctx, canvas.width, canvas.height, tensionLevel);
  };

  const drawTensionSimulation = (ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    // Heuristic: Center pulse representing core tension
    const centerX = w * 0.5;
    const centerY = h * 0.5;
    const pulseSize = (h * 0.3) * intensity;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize * 1.5);
    gradient.addColorStop(0, `rgba(6, 182, 212, ${0.4 * intensity})`);
    gradient.addColorStop(0.5, `rgba(6, 182, 212, ${0.1 * intensity})`);
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Scanline Effect during high tension
    if (intensity > 0.7) {
       ctx.strokeStyle = `rgba(6, 182, 212, ${(intensity - 0.7) * 0.5})`;
       ctx.lineWidth = 1;
       const scanY = (Date.now() % 1000) / 1000 * h;
       ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawTitanHUD = (ctx: CanvasRenderingContext2D, w: number, h: number, tension: number) => {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5);
    ctx.moveTo(w * 0.5, 0); ctx.lineTo(w * 0.5, h);
    ctx.stroke();

    // Corner Focus
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 + (tension * 0.4)})`;
    ctx.lineWidth = 2;
    const size = 50 + (tension * 20);
    // TL
    ctx.beginPath(); ctx.moveTo(30, 30 + size); ctx.lineTo(30, 30); ctx.lineTo(30 + size, 30); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(w - 30 - size, h - 30); ctx.lineTo(w - 30, h - 30); ctx.lineTo(w - 30, h - 30 - size); ctx.stroke();
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!isPlaying || isVideo) return;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const speed = 0.0025; 
      progressRef.current = (progressRef.current + dt * speed) % 16;
      drawInterpolatedFrame(progressRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    if (isPlaying && !isVideo) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isPlaying, isVideo, showTension]);

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
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-black/95 backdrop-blur-3xl z-20">
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
                <Flame size={10} /> MTS LOAD SIMULATION ACTIVE
             </div>
             <div className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                <ShieldCheck size={10} /> TITAN STABILITY v3.0
             </div>
          </div>
        </div>
        <button onClick={() => onClose(true)} className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-xl font-black italic text-xs shadow-2xl shadow-cyan-500/30">SEANSI BİTİR</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden bg-black">
        {/* Main Production Screen */}
        <div className="flex-1 relative flex items-center justify-center p-8 lg:p-12 overflow-hidden bg-[#020202]">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '100px 100px' }} />
          
          <div className={`relative w-full max-w-6xl aspect-video rounded-[5rem] overflow-hidden border-4 border-slate-900 shadow-[0_0_200px_rgba(0,0,0,1)] transition-all duration-1000 bg-black ${isPlaying ? 'scale-[1.03]' : 'scale-100'}`}>
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-10">
                     <button onClick={() => setIsPlaying(true)} className="group relative w-32 h-32 flex items-center justify-center transition-all">
                        <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20" />
                        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="relative w-28 h-28 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                           <Play size={54} fill="currentColor" className="ml-2" />
                        </div>
                     </button>
                  </div>
                )}
             </div>

             {/* MTS Biometric HUD */}
             <div className="absolute top-16 left-16 p-10 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[4rem] shadow-2xl min-w-[280px]">
                <div className="space-y-6">
                   <div>
                      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-1 flex items-center gap-2">
                        <Activity size={16} /> MTS LOAD %
                      </p>
                      <p className="text-7xl font-black text-white italic tracking-tighter tabular-nums">
                        {isPlaying ? Math.round(Math.sin((progressRef.current / 16) * Math.PI) * 100) : 0}<span className="text-xl text-slate-600 not-italic ml-2">%</span>
                      </p>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                         <span>MUSCLE TENSION</span>
                         <span className="text-cyan-400">ACTIVE</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]" 
                           style={{ width: `${isPlaying ? Math.sin((progressRef.current / 16) * Math.PI) * 100 : 0}%` }} 
                         />
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase rounded-lg border border-cyan-500/30">SET: {currentSet}</span>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded-lg border border-emerald-500/30">REP: {currentRep}/{exercise.reps}</span>
                   </div>
                </div>
             </div>
             
             {isPlaying && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-16 py-8 bg-black/95 backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] ring-1 ring-cyan-500/20">
                    <p className="text-2xl font-black italic text-white uppercase text-center tracking-widest animate-pulse">
                        {tutorial?.script[currentStepIndex]?.text}
                    </p>
                </div>
             )}
          </div>

          {/* Master Control Deck */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-16 bg-slate-950/90 backdrop-blur-3xl border border-white/10 p-10 rounded-[5rem] shadow-[0_60px_150px_rgba(0,0,0,0.8)] z-20">
               <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-500 hover:text-white transition-colors group">
                  <RotateCcw size={32} className="group-hover:rotate-[-60deg] transition-transform duration-500" />
               </button>
               
               <div className="flex items-center gap-10">
                  <button onClick={() => setIsPlaying(!isPlaying)} className={`w-32 h-32 rounded-[3.5rem] flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-90 ${isPlaying ? 'bg-slate-900 border border-white/10 shadow-inner' : 'bg-cyan-600 shadow-[0_0_50px_rgba(8,145,178,0.5)] border-t border-cyan-400'}`}>
                    {isPlaying ? <Pause size={54} fill="currentColor" /> : <Play size={54} fill="currentColor" className="ml-3" />}
                  </button>
               </div>

               <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setShowTension(!showTension)} 
                    className={`p-6 rounded-2xl transition-all border ${showTension ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-lg' : 'text-slate-600 bg-slate-900 border-white/5'}`}
                    title="MTS Simülasyonu"
                  >
                    {showTension ? <Zap size={32} fill="currentColor" /> : <ZapOff size={32} />}
                  </button>
                  <button onClick={() => setAudioEnabled(!audioEnabled)} className={`p-6 rounded-2xl transition-all border ${audioEnabled ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-lg' : 'text-slate-600 bg-slate-900 border-white/5'}`}>
                    {audioEnabled ? <Volume2 size={32} /> : <VolumeX size={32} />}
                  </button>
               </div>
          </div>
        </div>

        {/* Cinematic Clinical Flow Sidebar */}
        <div className="w-full lg:w-[560px] bg-[#020202] border-l border-white/10 p-14 space-y-14 overflow-y-auto hidden lg:block custom-scrollbar">
             <div className="space-y-10">
                <div className="flex items-center justify-between">
                   <h3 className="text-[13px] font-black uppercase text-cyan-500 tracking-[0.4em] flex items-center gap-4">
                      <Layers size={24} /> ANATOMİK ANALİZ DERİNLİĞİ
                   </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   <LayerTab active={activeLayer === 'skin'} label="TÜM DERİ DOKUSU" onClick={() => setActiveLayer('skin')} sub="Yüzeysel Biyomekanik" />
                   <LayerTab active={activeLayer === 'muscle'} label="DERİN KAS LİFLERİ (MTS)" onClick={() => setActiveLayer('muscle')} sub="Miyoelektrik Gerilim Haritası" />
                   <LayerTab active={activeLayer === 'skeleton'} label="RADYOGRAFİK İSKELET" onClick={() => setActiveLayer('skeleton')} sub="Eklem Aks Takibi" />
                </div>
             </div>

             {tutorial && (
               <div className="space-y-10">
                  <h3 className="text-[13px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-4">
                    <TrendingUp size={24} /> KLİNİK AKIŞ PROTOKOLÜ
                  </h3>
                  <div className="space-y-5">
                    {tutorial.script.map((s, i) => (
                      <div key={i} className={`p-10 rounded-[3rem] border-2 transition-all duration-1000 relative overflow-hidden ${i === currentStepIndex && isPlaying ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.2)]' : 'bg-slate-900/20 border-white/5 text-slate-600'}`}>
                         {i === currentStepIndex && isPlaying && <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.8)]" />}
                         <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-mono font-black text-slate-700">STEP 0{i+1}</span>
                            {i === currentStepIndex && isPlaying && <Activity size={14} className="text-cyan-400 animate-bounce" />}
                         </div>
                         <p className={`text-lg font-bold italic transition-colors leading-relaxed ${i === currentStepIndex && isPlaying ? 'text-white' : 'text-slate-700'}`}>
                            "{s.text}"
                         </p>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             <div className="pt-14 border-t border-white/10">
                <div className="bg-slate-900/10 p-10 rounded-[4rem] border border-white/5 space-y-6">
                   <p className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-4">
                      <Microscope size={20} /> MYO-NEURAL INSIGHT
                   </p>
                   <p className="text-sm text-slate-500 leading-relaxed italic font-medium">
                      "Gerçek zamanlı kas yükü analizi aktif. ${(exercise.primaryMuscles || ['Agonist']).join(', ')} bölgelerinde nöral ateşleme (firing) %96 verimlilikle simüle ediliyor. Jitter eliminasyonu stabil."
                   </p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

const LayerTab = ({ active, label, sub, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] border text-left transition-all group flex flex-col gap-1 ${active ? 'bg-cyan-700 text-white border-cyan-400 shadow-[0_0_40px_rgba(8,145,178,0.5)] scale-[1.02]' : 'bg-slate-950 border-white/5 text-slate-600 hover:bg-slate-900'}`}
  >
    <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-white' : 'group-hover:text-slate-400'}`}>{label}</span>
    <span className={`text-[9px] font-bold italic uppercase opacity-50 ${active ? 'text-cyan-200' : ''}`}>{sub}</span>
  </button>
);
