
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  Activity, Volume2, VolumeX, Mic, Loader2,
  Wind, ShieldCheck, Layers, Maximize2, Microscope,
  ZapOff, Flame, TrendingUp, Scan, Monitor,
  Settings, Download, Layout, Target, MousePointer2
} from 'lucide-react';
import { Exercise, ExerciseTutorial } from './types.ts';
import { generateExerciseTutorial } from './ai-service.ts';
import { MediaConverter, ExportFormat } from './MediaConverter.ts';

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
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const stepTimerRef = useRef<any>(null);
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const isVector = exercise.visualStyle === 'AVM-Genesis' || !!exercise.vectorData;
  const isVideo = exercise.videoUrl?.includes('.mp4') || (exercise.videoUrl && exercise.isMotion && !exercise.videoUrl.includes('vector'));
  const isSprite = !isVideo && !isVector && (exercise.visualUrl || exercise.videoUrl);

  useEffect(() => {
    if (!tutorial) loadTutorial();
    if (isSprite && exercise.visualUrl) {
      const img = new Image();
      img.src = exercise.visualUrl;
      img.onload = () => {
        imageCacheRef.current = img;
        drawSpriteFrame(0);
      };
    }
    return () => {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [exercise]);

  const loadTutorial = async () => {
    if (!process.env.API_KEY) return;
    setIsLoadingTutorial(true);
    try {
        const data = await generateExerciseTutorial(exercise.title);
        if (data) setTutorial(data);
    } catch (err) {
        console.error("Tutorial Gen Failed", err);
    } finally {
        setIsLoadingTutorial(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const source = isVector ? { svg: exercise.vectorData || '' } : (exercise.visualUrl || exercise.videoUrl || '');
      await MediaConverter.export(source, format, `PC_EX_${exercise.code}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const drawSpriteFrame = (progress: number) => {
    const canvas = canvasRef.current;
    const img = imageCacheRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = 4;
    const rows = 4;
    const totalFrames = 16;
    const frameIndex = Math.floor(progress) % totalFrames;
    
    const cellW = img.width / cols;
    const cellH = img.height / rows;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, (frameIndex % cols) * cellW, Math.floor(frameIndex / cols) * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);
    
    if (showTension) {
       const tension = Math.sin((progress / totalFrames) * Math.PI);
       drawMTSHUD(ctx, canvas.width, canvas.height, tension);
    }
  };

  const drawMTSHUD = (ctx: CanvasRenderingContext2D, w: number, h: number, tension: number) => {
    ctx.save();
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 + tension * 0.4})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    
    ctx.fillStyle = `rgba(6, 182, 212, ${tension * 0.2})`;
    ctx.beginPath();
    ctx.arc(w/2, h/2, (h/4) * tension, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!isPlaying || !isSprite) return;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      progressRef.current = (progressRef.current + dt * 0.005) % 16;
      drawSpriteFrame(progressRef.current);
      requestAnimationFrame(animate);
    };
    if (isPlaying && isSprite) {
      lastTimeRef.current = performance.now();
      requestAnimationFrame(animate);
    }
  }, [isPlaying, isSprite, showTension]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#020617] flex flex-col animate-in fade-in duration-500 font-roboto ${isTheaterMode ? 'overflow-hidden' : ''}`}>
      
      {/* Dynamic Header */}
      <div className="p-4 md:p-6 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl border-b border-white/5 z-30">
        <button onClick={() => onClose(false)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-cyan-500/50">
            <ChevronLeft size={20} />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.2em] hidden sm:block">GERİ DÖN</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg md:text-xl font-black italic uppercase text-white tracking-tighter">
            {exercise.titleTr || exercise.title}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-1">
             <div className="flex items-center gap-1.5 text-[8px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                <Target size={10} /> {exercise.rehabPhase} FAZ
             </div>
             <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck size={10} /> ŞİFRELİ LIVE
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsTheaterMode(!isTheaterMode)}
             className={`p-2.5 rounded-xl border transition-all ${isTheaterMode ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
           >
              <Maximize2 size={18} />
           </button>
           <button onClick={() => onClose(true)} className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl font-black italic text-[10px] shadow-2xl active:scale-95 uppercase">BİTİR</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Main Render Core */}
        <div className="flex-1 relative flex items-center justify-center p-4 lg:p-12 bg-black">
           <div className={`relative w-full h-full max-w-5xl rounded-[3rem] overflow-hidden border-2 border-slate-800 shadow-[0_0_100px_rgba(0,0,0,1)] transition-all duration-700 ${isTheaterMode ? 'max-w-none rounded-none border-none' : ''}`}>
              
              {/* Multimodal Render Station */}
              <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                 {isVector && exercise.vectorData ? (
                    <div 
                      className="w-full h-full p-12 flex items-center justify-center animate-in zoom-in-95 duration-500"
                      dangerouslySetInnerHTML={{ __html: exercise.vectorData }} 
                      style={{ filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.3))' }}
                    />
                 ) : isVideo ? (
                    <video 
                      src={exercise.videoUrl} 
                      className="w-full h-full object-contain" 
                      autoPlay={isPlaying} loop muted={!audioEnabled}
                    />
                 ) : isSprite ? (
                    <canvas ref={canvasRef} width={800} height={800} className="w-full h-full object-contain" />
                 ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-800">
                       <Layout size={64} strokeWidth={1} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Görsel Bekleniyor</span>
                    </div>
                 )}

                 {!isPlaying && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                       <button 
                         onClick={() => setIsPlaying(true)}
                         className="w-24 h-24 bg-cyan-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-90 transition-all"
                       >
                          <Play size={40} fill="currentColor" className="ml-2" />
                       </button>
                    </div>
                 )}
              </div>

              {/* Data Overlay HUD */}
              <div className="absolute top-8 left-8 p-6 bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl min-w-[200px] hidden md:block">
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SET TAMAMLAMA</span>
                       <span className="text-xl font-black text-white italic">{currentRep}/{exercise.reps}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(currentRep/exercise.reps)*100}%` }} />
                    </div>
                    <div className="flex gap-2">
                       <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-bold rounded">SET {currentSet}/{exercise.sets}</span>
                       <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded">RPE {exercise.targetRpe}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Mobile Floating Controls */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl z-30">
              <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="p-3 text-slate-500 hover:text-white transition-colors"><RotateCcw size={20}/></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl transition-all ${isPlaying ? 'bg-slate-800' : 'bg-cyan-600'}`}
              >
                 {isPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={() => setShowTension(!showTension)} className={`p-3 transition-colors ${showTension ? 'text-cyan-400' : 'text-slate-600'}`}><Zap size={20}/></button>
           </div>
        </div>

        {/* Clinical Sidebar / Settings */}
        {!isTheaterMode && (
          <div className="w-full lg:w-[420px] bg-slate-950 border-l border-white/5 flex flex-col">
             <div className="p-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* 1. Format Export Station */}
                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Download size={14} /> MEDYA TRANSFER MERKEZİ
                   </h3>
                   <div className="grid grid-cols-2 gap-2">
                      <ExportBtn label="MP4 VIDEO" onClick={() => handleExport('mp4')} disabled={isExporting} />
                      <ExportBtn label="GIF ANİMASYON" onClick={() => handleExport('gif')} disabled={isExporting} />
                      <ExportBtn label="SVG VEKTÖR" onClick={() => handleExport('svg')} disabled={isExporting} />
                      <ExportBtn label="MPEG KAYIT" onClick={() => handleExport('mpeg')} disabled={isExporting} />
                   </div>
                   {isExporting && (
                      <div className="flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl animate-pulse">
                         <Loader2 size={16} className="animate-spin text-cyan-400" />
                         <span className="text-[9px] font-bold text-cyan-400 uppercase">Dönüştürme İşlemi Başladı...</span>
                      </div>
                   )}
                </div>

                {/* 2. Real-Time Insights */}
                <div className="space-y-4 pt-10 border-t border-white/5">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Microscope size={14} /> CANLI BİYOMEKANİK ANALİZ
                   </h3>
                   <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 space-y-4">
                      <InsightRow label="Kas Aktivasyonu" value="%84" />
                      <InsightRow label="Hareket Hassasiyeti" value="Yüksek" />
                      <InsightRow label="Nöral Feedback" value="Stabil" />
                   </div>
                </div>

                {/* 3. Clinical Sequence */}
                {tutorial && (
                   <div className="space-y-4 pt-10 border-t border-white/5">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Activity size={14} /> AKIŞ PROTOKOLÜ
                      </h3>
                      <div className="space-y-3">
                         {tutorial.script.map((s, i) => (
                            <div key={i} className={`p-4 rounded-2xl border transition-all ${i === currentStepIndex ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-slate-900/20 border-white/5 text-slate-600'}`}>
                               <p className="text-[11px] font-bold italic">"{s.text}"</p>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ExportBtn = ({ label, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className="w-full py-3 bg-slate-900 border border-white/5 hover:border-cyan-500/30 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
  >
    {label}
  </button>
);

const InsightRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center">
     <span className="text-[9px] font-bold text-slate-600 uppercase">{label}</span>
     <span className="text-[10px] font-black text-white italic">{value}</span>
  </div>
);
