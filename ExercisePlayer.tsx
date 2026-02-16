
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  Activity, Volume2, Loader2,
  CheckCircle2, Flame, Scan, Box,
  BrainCircuit, Sparkles, BookOpen, AlertCircle
} from 'lucide-react';
import { Exercise } from './types.ts';
import { AnatomicalAvatar } from './AnatomicalAvatar.tsx';

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
  const [showProfessorGuide, setShowProfessorGuide] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Adım adım rehberlik (Özel Eğitim Yaklaşımı: Chunking)
  const steps = [
    { title: "Hazırlık", desc: "Harekete başlamadan önce vücudunu nötral pozisyona getir." },
    { title: "Harekete Başla", desc: exercise.description.split('.')[0] + '.' },
    { title: "Zirve Noktası", desc: "En yüksek gerilimde 1 saniye bekle ve nefes ver." },
    { title: "Kontrollü Dönüş", desc: "Yavaşça başlangıç pozisyonuna dön." }
  ];

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
      img.src = exercise.visualUrl;
      img.onload = () => { imageCacheRef.current = img; drawFrame(0); };
    }
  }, [exercise, activeLayer]);

  const drawFrame = (progress: number) => {
    const canvas = canvasRef.current;
    const img = imageCacheRef.current;
    if (!canvas || !img || activeLayer === '3d') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = 4; const rows = 4; const totalFrames = 16;
    const frameIndex = Math.floor(progress) % totalFrames;
    const cellW = img.width / cols; const cellH = img.height / rows;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (activeLayer === 'xray') ctx.filter = 'invert(1) hue-rotate(180deg) brightness(1.2)';
    else if (activeLayer === 'muscles') ctx.filter = 'sepia(1) saturate(5) hue-rotate(-50deg)';
    else ctx.filter = 'none';

    ctx.drawImage(img, (frameIndex % cols) * cellW, Math.floor(frameIndex / cols) * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    if (isPlaying) {
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 10]);
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, 350 + Math.sin(progress) * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!isPlaying || activeLayer === '3d') return;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      progressRef.current = (progressRef.current + dt * 0.005) % 16;
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
      <div className="p-6 flex justify-between items-center bg-slate-950/80 backdrop-blur-3xl border-b border-white/5 z-50">
        <button onClick={() => onClose(false)} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-cyan-500/50">
            <ChevronLeft size={24} />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">GERİ DÖN</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">{exercise.titleTr || exercise.title}</h2>
          <p className="text-[9px] text-cyan-500 font-bold uppercase mt-2 tracking-widest flex items-center justify-center gap-2">
             <Sparkles size={10} /> KLİNİK MOD: {activeLayer.toUpperCase()}
          </p>
        </div>

        <button 
          onClick={() => setShowProfessorGuide(!showProfessorGuide)} 
          className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${showProfessorGuide ? 'bg-cyan-500 text-white' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
        >
          {showProfessorGuide ? 'REHBERİ KAPAT' : 'PROFESÖR MODU'}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        <div className="flex-1 relative flex items-center justify-center bg-black">
           
           {isResting && (
              <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in zoom-in duration-500">
                  <div className="relative w-48 h-48 mb-10">
                     <svg className="w-full h-full -rotate-90"><circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-900" /><circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={502} strokeDashoffset={502 - (restTime/60)*502} className="text-cyan-500 transition-all duration-1000" /></svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-5xl font-black text-white italic">{restTime}</span><span className="text-[10px] font-black text-cyan-500 uppercase">Saniye</span></div>
                  </div>
                  <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">DİNLENME <span className="text-cyan-400">FAZI</span></h3>
                  <button onClick={() => setRestTime(0)} className="px-10 py-5 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] font-black uppercase text-slate-300">ATLA</button>
              </div>
           )}

           <div className="relative w-full h-full max-w-5xl rounded-[4rem] overflow-hidden border-4 border-slate-900 bg-slate-950 shadow-2xl">
              {activeLayer === '3d' ? (
                <Suspense fallback={<div className="flex items-center justify-center w-full h-full"><Loader2 className="animate-spin text-cyan-500" size={48} /></div>}>
                  <AnatomicalAvatar targetArea={exercise.category || exercise.title} />
                </Suspense>
              ) : (
                <canvas ref={canvasRef} width={1080} height={1080} className="w-full h-full object-contain" />
              )}
              
              <div className="absolute top-10 right-10 flex flex-col gap-3">
                 <LayerBtn active={activeLayer === 'standard'} onClick={() => setActiveLayer('standard')} icon={Box} label="Vizyon" />
                 <LayerBtn active={activeLayer === 'xray'} onClick={() => setActiveLayer('xray')} icon={Scan} label="X-Ray" />
                 <LayerBtn active={activeLayer === 'muscles'} onClick={() => setActiveLayer('muscles')} icon={Flame} label="Kas" />
                 <LayerBtn active={activeLayer === '3d'} onClick={() => setActiveLayer('3d')} icon={BrainCircuit} label="3D Pro" />
              </div>

              <div className="absolute top-10 left-10 p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] min-w-[280px]">
                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Set</p><span className="text-4xl font-black text-white italic">{currentSet}</span></div>
                       <div className="text-right"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tekrar</p><span className="text-4xl font-black text-cyan-400 italic">{currentRep}</span></div>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)] transition-all duration-700" style={{ width: `${(currentRep/exercise.reps)*100}%` }} /></div>
                 </div>
              </div>

              {!isPlaying && !isResting && (
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <button onClick={() => setIsPlaying(true)} className="w-32 h-32 bg-cyan-600 rounded-[3rem] flex items-center justify-center text-white shadow-[0_0_80px_rgba(6,182,212,0.4)] hover:scale-110 active:scale-90 transition-all"><Play size={56} fill="currentColor" /></button>
                    <p className="mt-8 text-sm font-black italic text-white uppercase tracking-[0.3em] animate-pulse">BAŞLATMAK İÇİN DOKUNUN</p>
                 </div>
              )}
           </div>

           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-950/90 backdrop-blur-3xl p-5 rounded-[3rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-30 scale-110">
              <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="p-4 text-slate-500 hover:text-white transition-all"><RotateCcw size={24}/></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all ${isPlaying ? 'bg-slate-800' : 'bg-cyan-600'}`}>{isPlaying ? <Pause size={36} /> : <Play size={36} fill="currentColor" />}</button>
              <button onClick={handleRepComplete} className="p-4 text-cyan-500 hover:scale-110 transition-all"><CheckCircle2 size={32} /></button>
           </div>
        </div>

        {/* Professor's Step-by-Step Guide Panel */}
        {showProfessorGuide && (
          <div className="w-full lg:w-[450px] bg-slate-950 border-l border-white/5 flex flex-col p-10 space-y-10 overflow-y-auto no-scrollbar">
             <div>
                <div className="flex items-center gap-3 text-cyan-400 mb-4">
                  <BookOpen size={20} />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Adım Adım Rehberlik</h3>
                </div>
                <div className="space-y-4">
                   {steps.map((s, i) => (
                      <div key={i} className={`p-5 rounded-2xl border transition-all ${currentRep === 0 && i === 0 ? 'bg-cyan-500/10 border-cyan-500/40 scale-[1.02]' : 'bg-slate-900/40 border-slate-800 opacity-60'}`}>
                         <div className="flex items-center gap-3 mb-1">
                            <span className="w-5 h-5 bg-slate-950 rounded-md flex items-center justify-center text-[9px] font-black text-cyan-500 border border-slate-800">{i+1}</span>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-200">{s.title}</h4>
                         </div>
                         <p className="text-xs text-slate-400 italic leading-relaxed">{s.desc}</p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-400"><Activity size={20} /><h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Biyomekanik Notu</h3></div>
                <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem]"><p className="text-xs text-slate-300 leading-loose italic">{exercise.biomechanics}</p></div>
             </div>

             {exercise.safetyFlags.length > 0 && (
                <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                   <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                      <AlertCircle size={14} /> Güvenlik Uyarısı
                   </p>
                   <ul className="space-y-1">
                      {exercise.safetyFlags.map(f => (
                         <li key={f} className="text-[10px] text-slate-500 italic">• {f}</li>
                      ))}
                   </ul>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const LayerBtn = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${active ? 'bg-cyan-500 text-white border-cyan-400 shadow-xl' : 'bg-slate-900/60 text-slate-500 border-slate-800 backdrop-blur-xl'}`}><Icon size={20} /><span className="text-[7px] font-black uppercase">{label}</span></button>
);
