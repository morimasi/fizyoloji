
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  Activity, Volume2, VolumeX, Mic, Loader2,
  Wind, ShieldCheck, Layers, Maximize2, Microscope,
  CheckCircle2, Flame, TrendingUp, Scan, Monitor,
  Settings, Download, Layout, Target, MousePointer2,
  ChevronRight, BrainCircuit, AlertCircle, Sparkles, Box
} from 'lucide-react';
import { Exercise, ExerciseTutorial } from './types.ts';
import { generateExerciseTutorial } from './ai-service.ts';
import { MediaConverter, ExportFormat } from './MediaConverter.ts';
import { LiveCoach } from './LiveCoach.tsx';
import { AnatomicalAvatar } from './AnatomicalAvatar.tsx';
import { ExerciseActions } from './ExerciseActions.tsx';

interface PlayerProps {
  exercise: Exercise;
  onClose: (finished?: boolean) => void;
}

export const ExercisePlayer = ({ exercise, onClose }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(exercise.restPeriod || 60);
  const [activeLayer, setActiveLayer] = useState<'standard' | 'xray' | 'muscles' | '3d'>('standard');
  const [showLiveCoach, setShowLiveCoach] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isResting && restTime > 0) {
      const timer = setInterval(() => setRestTime(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (restTime === 0) {
      setIsResting(false);
      setRestTime(exercise.restPeriod || 60);
      setCurrentSet(prev => prev + 1);
      setCurrentRep(0);
    }
  }, [isResting, restTime]);

  const handleRepComplete = () => {
    if (currentRep + 1 >= exercise.reps) {
      if (currentSet >= exercise.sets) {
        onClose(true);
      } else {
        setIsResting(true);
        setIsPlaying(false);
      }
    } else {
      setCurrentRep(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (exercise.visualUrl && activeLayer !== '3d') {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = exercise.visualUrl;
      img.onload = () => { imageCacheRef.current = img; drawFrame(0); };
    }
  }, [exercise, activeLayer]);

  // --- SMART SCALE RENDER ENGINE ---
  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    const img = imageCacheRef.current;
    if (!canvas || !img || activeLayer === '3d') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = 4; const rows = 4; const totalFrames = 16;
    const frameIndex = Math.floor(progress) % totalFrames;
    
    // 1. Source Dimensions
    const spriteW = img.width / cols;
    const spriteH = img.height / rows;

    // 2. Clear & FX
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (activeLayer === 'xray') ctx.filter = 'invert(1) hue-rotate(180deg) brightness(1.2)';
    else if (activeLayer === 'muscles') ctx.filter = 'sepia(1) saturate(5) hue-rotate(-50deg)';
    else ctx.filter = 'none';

    // 3. Aspect Ratio Calculation (CONTAIN)
    const scale = Math.min(canvas.width / spriteW, canvas.height / spriteH) * 0.90;
    
    const destW = spriteW * scale;
    const destH = spriteH * scale;
    
    // 4. Center Position
    const dx = (canvas.width - destW) / 2;
    const dy = (canvas.height - destH) / 2;

    // 5. Source Coordinates
    const sx = (frameIndex % cols) * spriteW;
    const sy = Math.floor(frameIndex / cols) * spriteH;

    // 6. Draw
    ctx.drawImage(img, sx, sy, spriteW, spriteH, dx, dy, destW, destH);
    ctx.filter = 'none';

    // 7. Visual Rhythm Guide (Overlay)
    if (isPlaying) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const radius = Math.max(destW, destH) / 2 * 1.1; 
      ctx.arc(canvas.width/2, canvas.height/2, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!isPlaying || activeLayer === '3d') return;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      progressRef.current = (progressRef.current + dt * 0.008) % 16;
      drawFrame(progressRef.current);
      requestAnimationFrame(animate);
    };
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      requestAnimationFrame(animate);
    }
  }, [isPlaying, activeLayer]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col font-roboto overflow-hidden animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="p-4 md:p-6 flex justify-between items-center bg-slate-950/80 backdrop-blur-3xl border-b border-white/5 z-50 shrink-0">
        <button onClick={() => onClose(false)} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-cyan-500/50">
            <ChevronLeft size={20} />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">GERİ DÖN</span>
        </button>

        <div className="text-center truncate px-2">
          <h2 className="text-lg md:text-2xl font-black italic uppercase text-white tracking-tighter leading-none truncate">{exercise.titleTr || exercise.title}</h2>
          <p className="text-[8px] md:text-[9px] text-cyan-500 font-bold uppercase mt-1 md:mt-2 tracking-widest flex items-center justify-center gap-2">
             <Sparkles size={10} /> CLINICAL MODE: {activeLayer.toUpperCase()}
          </p>
        </div>

        <div className="flex gap-2 md:gap-4 items-center">
           {/* New Actions Component */}
           <div className="hidden sm:block">
             <ExerciseActions exercise={exercise} variant="player" />
           </div>
           <button onClick={() => setShowLiveCoach(!showLiveCoach)} className={`px-4 py-2 md:px-6 md:py-3 rounded-xl border text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${showLiveCoach ? 'bg-cyan-500 text-white border-cyan-400 shadow-xl' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
             {showLiveCoach ? 'GİZLE' : 'LIVE AI'}
           </button>
        </div>
      </div>

      {/* Responsive Content: Flex-col on mobile, Flex-row on Desktop */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Visual Area */}
        <div className="flex-1 relative flex items-center justify-center bg-black min-h-[45vh] lg:min-h-auto">
           
           {/* Live Coach Overlay */}
           {showLiveCoach && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-xl animate-in slide-in-from-top-4 duration-500">
                 <LiveCoach exerciseTitle={exercise.title} systemInstruction={exercise.biomechanics} />
              </div>
           )}

           {isResting && (
              <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in zoom-in duration-500">
                  <div className="relative w-32 h-32 md:w-48 md:h-48 mb-6 md:mb-10">
                     <svg className="w-full h-full -rotate-90"><circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-900" /><circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={502} strokeDashoffset={502 - (restTime/60)*502} className="text-cyan-500 transition-all duration-1000" /></svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl md:text-5xl font-black text-white italic">{restTime}</span><span className="text-[8px] md:text-[10px] font-black text-cyan-500 uppercase">Saniye</span></div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter mb-4">RECOVERY <span className="text-cyan-400">PHASE</span></h3>
                  <button onClick={() => setRestTime(0)} className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-300">ATLA</button>
              </div>
           )}

           <div className="relative w-full h-full lg:max-w-5xl lg:rounded-[4rem] lg:overflow-hidden lg:border-4 border-slate-900 bg-slate-950 shadow-2xl flex items-center justify-center">
              {activeLayer === '3d' ? (
                <Suspense fallback={<div className="flex items-center justify-center w-full h-full"><Loader2 className="animate-spin text-cyan-500" size={48} /></div>}>
                  <AnatomicalAvatar targetArea={exercise.category || exercise.title} />
                </Suspense>
              ) : (
                <canvas ref={canvasRef} width={1080} height={1080} className="w-full h-full object-contain" />
              )}
              
              <div className="absolute top-4 right-4 md:top-10 md:right-10 flex flex-col gap-2">
                 <LayerBtn active={activeLayer === 'standard'} onClick={() => setActiveLayer('standard')} icon={Monitor} label="Vis" />
                 <LayerBtn active={activeLayer === 'xray'} onClick={() => setActiveLayer('xray')} icon={Scan} label="XRay" />
                 <LayerBtn active={activeLayer === 'muscles'} onClick={() => setActiveLayer('muscles')} icon={Flame} label="Mus" />
                 <LayerBtn active={activeLayer === '3d'} onClick={() => setActiveLayer('3d')} icon={Box} label="3D" />
              </div>

              <div className="absolute top-4 left-4 md:top-10 md:left-10 p-4 md:p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl md:rounded-[2.5rem] min-w-[140px] md:min-w-[280px]">
                 <div className="space-y-2 md:space-y-6">
                    <div className="flex justify-between items-end">
                       <div><p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Set</p><span className="text-2xl md:text-4xl font-black text-white italic">{currentSet}</span></div>
                       <div className="text-right"><p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tekrar</p><span className="text-2xl md:text-4xl font-black text-cyan-400 italic">{currentRep}</span></div>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)] transition-all duration-700" style={{ width: `${(currentRep/exercise.reps)*100}%` }} /></div>
                 </div>
              </div>

              {activeLayer !== '3d' && !isPlaying && !isResting && (
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <button onClick={() => setIsPlaying(true)} className="w-20 h-20 md:w-32 md:h-32 bg-cyan-600 rounded-3xl md:rounded-[3rem] flex items-center justify-center text-white shadow-[0_0_80px_rgba(6,182,212,0.4)] hover:scale-110 active:scale-90 transition-all"><Play className="w-8 h-8 md:w-14 md:h-14" fill="currentColor" /></button>
                    <p className="mt-4 md:mt-8 text-xs md:text-sm font-black italic text-white uppercase tracking-[0.3em] animate-pulse">DOKUN VE BAŞLA</p>
                 </div>
              )}
           </div>

           {/* Mobile Floating Controls */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-6 bg-slate-950/90 backdrop-blur-3xl p-3 md:p-5 rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-30 scale-90 md:scale-110">
              <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="p-3 md:p-4 text-slate-500 hover:text-white transition-all"><RotateCcw className="w-5 h-5 md:w-6 md:h-6"/></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all ${isPlaying ? 'bg-slate-800' : 'bg-cyan-600'}`}>{isPlaying ? <Pause className="w-6 h-6 md:w-9 md:h-9" /> : <Play className="w-6 h-6 md:w-9 md:h-9" fill="currentColor" />}</button>
              <button onClick={handleRepComplete} className="p-3 md:p-4 text-cyan-500 hover:scale-110 transition-all"><CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /></button>
           </div>
        </div>

        {/* Info Area (Scrollable on mobile) */}
        <div className="w-full lg:w-[450px] bg-slate-950 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col p-6 md:p-10 space-y-8 md:space-y-12 overflow-y-auto max-h-[40vh] lg:max-h-full">
           <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 text-cyan-400"><BrainCircuit size={20} /><h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]">Biyomekanik Motoru</h3></div>
              <div className="p-6 md:p-8 bg-slate-900/40 border border-slate-800 rounded-[2rem]"><p className="text-xs text-slate-300 leading-loose italic">{exercise.biomechanics}</p></div>
           </div>

           <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 text-emerald-400"><Microscope size={20} /><h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em]">Hedef Kas Grupları</h3></div>
              <div className="flex flex-wrap gap-2">
                 {exercise.primaryMuscles.map(m => <span key={m} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] md:text-[10px] font-black uppercase rounded-lg">{m}</span>)}
              </div>
           </div>
           
           {activeLayer === '3d' && (
              <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                 <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Target size={14} /> 3D Kinematik Notu
                 </p>
                 <p className="text-xs text-slate-500 italic mt-2">
                    Model üzerindeki mavi bölgeler bu egzersizde aktif olan birincil eklem ve kemik segmentlerini temsil eder.
                 </p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

const LayerBtn = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-all border ${active ? 'bg-cyan-500 text-white border-cyan-400 shadow-xl' : 'bg-slate-900/60 text-slate-500 border-slate-800 backdrop-blur-xl'}`}>
    <Icon className="w-4 h-4 md:w-5 md:h-5" />
    <span className="text-[6px] md:text-[7px] font-black uppercase">{label}</span>
  </button>
);
