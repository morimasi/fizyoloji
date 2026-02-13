
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, FileVideo, FileImage, XCircle, Terminal,
  Zap, Wand2, Sparkles, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseRealVideo } from './ai-service.ts';
import { ExerciseActions } from './ExerciseActions.tsx';
import { MediaConverter, ExportFormat } from './MediaConverter.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean, frameCount?: number, layout?: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderMode, setRenderMode] = useState<'sprite' | 'video'>('sprite');
  const [selectedStyle, setSelectedStyle] = useState<string>('Medical-Vector');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [isMotionActive, setIsMotionActive] = useState(false); 
  const [currentFrame, setCurrentFrame] = useState(0); 
  const [customPrompt, setCustomPrompt] = useState('');
  const [isVeoActive, setIsVeoActive] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!customPrompt && exercise.description) {
      setCustomPrompt(exercise.description.substring(0, 150));
    }
  }, [exercise.description]);

  // --- PRECISION CANVAS ENGINE ---
  useEffect(() => {
    if (renderMode === 'video' || !previewUrl || previewUrl.startsWith('http')) return;
    
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      imageCacheRef.current = img;
      renderCanvasFrame(0);
    };
  }, [previewUrl, renderMode]);

  const renderCanvasFrame = (frame: number) => {
    const canvas = canvasRef.current;
    const img = imageCacheRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 2x4 Grid logic
    const cols = 4;
    const rows = 2;
    const cellW = img.width / cols;
    const cellH = img.height / rows;

    const colIndex = frame % cols;
    const rowIndex = Math.floor(frame / cols);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      colIndex * cellW, rowIndex * cellH, cellW, cellH,
      0, 0, canvas.width, canvas.height
    );
  };

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const fps = 12; // Cinematic but stable for sprites

    const animate = (time: number) => {
      if (!isMotionActive) return;
      
      if (time - lastTime >= 1000 / fps) {
        setCurrentFrame(prev => {
          const next = (prev + 1) % 8;
          renderCanvasFrame(next);
          return next;
        });
        lastTime = time;
      }
      animationId = requestAnimationFrame(animate);
    };

    if (isMotionActive) {
      animationId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationId);
  }, [isMotionActive]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsMotionActive(false);
    try {
      if (renderMode === 'video') {
        setIsVeoActive(true);
        const url = await generateExerciseRealVideo(exercise, customPrompt);
        setPreviewUrl(url);
        onVisualGenerated(url, 'VEO-Cinematic', true, 1, 'video');
      } else {
        const result = await generateExerciseVisual(exercise, selectedStyle, customPrompt);
        setPreviewUrl(result.url);
        onVisualGenerated(result.url, selectedStyle, true, result.frameCount, result.layout);
        setIsMotionActive(true);
      }
    } catch (err) {
      alert("Üretim hatası. Lütfen API anahtarınızı kontrol edin.");
    } finally {
      setIsGenerating(false);
      setIsVeoActive(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative pb-20 animate-in fade-in duration-500">
      {/* LEFT: DIRECTOR'S CONSOLE */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-slate-900/40 rounded-[3rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-6">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800">
              <Clapperboard size={24} />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Genesis <span className="text-cyan-400">Director</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AI Video Configuration</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button 
                  onClick={() => setRenderMode('sprite')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'sprite' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500'}`}
                >
                  Draft (Flash AI)
                </button>
                <button 
                  onClick={() => setRenderMode('video')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'video' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500'}`}
                >
                  Cinematic (VEO AI)
                </button>
             </div>
             {renderMode === 'video' && (
               <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                  <p className="text-[10px] text-amber-200/70 font-medium leading-relaxed italic">VEO motoru gerçek mp4 üretir, ancak her üretim yaklaşık 60-90 saniye sürer ve ücretli kredi gerektirir.</p>
               </div>
             )}
          </div>

          <div className="space-y-3 mb-6 relative z-10">
             <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> Yönetmen Komutları
             </label>
             <textarea 
               value={customPrompt}
               onChange={(e) => setCustomPrompt(e.target.value)}
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 h-28 outline-none focus:border-cyan-500/50 resize-none shadow-inner"
               placeholder="Örn: X-Ray modunda diz eklemini daha belirgin yap..."
             />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !exercise.title}
            className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group ${renderMode === 'video' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-cyan-500'} text-white`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span className="animate-pulse">{isVeoActive ? 'PRO VEO RENDER...' : 'DRAFT GENERATING...'}</span>
              </>
            ) : (
              <>
                {renderMode === 'video' ? <Sparkles size={18} /> : <Wand2 size={18} />}
                SAHNEYİ {renderMode === 'video' ? 'VEO İLE OLUŞTUR' : 'DRAFT OLARAK ÜRET'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT: STUDIO MONITOR */}
      <div className="xl:col-span-7 space-y-6">
        <div className="relative w-full aspect-video bg-black rounded-[3rem] border-4 border-slate-800 flex flex-col overflow-hidden shadow-2xl group ring-1 ring-slate-700/50">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-20" />

          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
             {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                   {renderMode === 'video' || previewUrl.includes('googlevideo') || previewUrl.includes('.mp4') ? (
                      <video 
                        key={previewUrl}
                        src={previewUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                      />
                   ) : (
                      <canvas 
                        ref={canvasRef} 
                        width={1280} 
                        height={720} 
                        className="w-full h-full object-contain"
                      />
                   )}
                </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                  <MonitorPlay size={64} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-50">Sinyal Yok</p>
               </div>
             )}

             {isMotionActive && (
               <div className="absolute top-8 right-8 flex items-center gap-2 z-30 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE</span>
               </div>
             )}
          </div>

          <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center px-6 gap-6 z-30">
             <button 
              onClick={() => setIsMotionActive(!isMotionActive)}
              disabled={!previewUrl}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-all border border-slate-700"
             >
                {isMotionActive ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
             </button>

             <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full bg-cyan-500 transition-all duration-300 ${isMotionActive ? 'w-full' : 'w-0'}`} />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                   <span>00:00</span>
                   <span className="text-cyan-400 font-bold">READY TO EXPORT</span>
                   <span>REAL-TIME</span>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <ExportBtn icon={FileVideo} label="EXPORT" onClick={() => {}} />
             </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 border border-slate-800">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <h5 className="text-xs font-bold text-white uppercase">Render Durumu</h5>
                  <p className="text-[9px] text-slate-500 font-mono">Precision: High • FPS: 24 (Hybrid)</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/20">STABLE FLOW</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const ExportBtn = ({ icon: Icon, label, onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-400 transition-all active:scale-95"
    >
       <Icon size={12} />
       <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
);
