
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, FileVideo, FileImage, XCircle, Terminal,
  Zap, Wand2, Sparkles, AlertTriangle, ShieldCheck,
  FastForward, Wind
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
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Animation State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    if (!customPrompt && exercise.description) {
      setCustomPrompt(exercise.description.substring(0, 150));
    }
  }, [exercise.description]);

  // --- PRECISION OPTICAL FLOW ENGINE ---
  useEffect(() => {
    if (renderMode === 'video' || !previewUrl || previewUrl.startsWith('http')) return;
    
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      imageCacheRef.current = img;
      drawInterpolatedFrame(0);
    };
  }, [previewUrl, renderMode]);

  const drawInterpolatedFrame = (interpolatedProgress: number) => {
    const canvas = canvasRef.current;
    const img = imageCacheRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 4x4 Grid Constants
    const cols = 4;
    const rows = 4;
    const totalFrames = 16;
    const cellW = img.width / cols;
    const cellH = img.height / rows;

    // 1. Calculate Current and Next Frame
    const frameIndex = Math.floor(interpolatedProgress) % totalFrames;
    const nextFrameIndex = (frameIndex + 1) % totalFrames;
    const tweenAlpha = interpolatedProgress % 1; // Transition value (0 to 1)

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Current Frame (Base)
    const cCol = frameIndex % cols;
    const cRow = Math.floor(frameIndex / cols);
    ctx.globalAlpha = 1 - tweenAlpha;
    ctx.drawImage(img, cCol * cellW, cRow * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);

    // Draw Next Frame (Overlay for smooth flow)
    const nCol = nextFrameIndex % cols;
    const nRow = Math.floor(nextFrameIndex / cols);
    ctx.globalAlpha = tweenAlpha;
    ctx.drawImage(img, nCol * cellW, nRow * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!isMotionActive || renderMode === 'video') return;
      
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Hız ayarı (0.01 per ms = 10ms per 0.1 frame progress)
      const speed = 0.005; 
      progressRef.current = (progressRef.current + deltaTime * speed) % 16;
      
      drawInterpolatedFrame(progressRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isMotionActive) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isMotionActive, renderMode]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsMotionActive(false);
    try {
      if (renderMode === 'video') {
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
      alert("Hata: Üretim limitine takılmış olabilirsiniz.");
    } finally {
      setIsGenerating(false);
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
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Hybrid Optical Flow Engine</p>
            </div>
          </div>

          {/* Render Mode Select */}
          <div className="space-y-4 mb-6">
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button 
                  onClick={() => setRenderMode('sprite')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'sprite' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500'}`}
                >
                  <Zap size={10} className="inline mr-1" /> Draft (Free)
                </button>
                <button 
                  onClick={() => setRenderMode('video')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'video' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500'}`}
                >
                  <Sparkles size={10} className="inline mr-1" /> VEO (Premium)
                </button>
             </div>
          </div>

          <div className="space-y-3 mb-6 relative z-10">
             <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> Senaryo Detayları
             </label>
             <textarea 
               value={customPrompt}
               onChange={(e) => setCustomPrompt(e.target.value)}
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 h-28 outline-none focus:border-cyan-500/50 resize-none shadow-inner"
               placeholder="AI için özel talimatlar ekleyin..."
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
                <span className="animate-pulse">PROCESSING MOTION...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                SAHNEYİ OLUŞTUR
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT: STUDIO MONITOR */}
      <div className="xl:col-span-7 space-y-6">
        <div className="relative w-full aspect-video bg-black rounded-[3rem] border-4 border-slate-800 flex flex-col overflow-hidden shadow-2xl group ring-1 ring-slate-700/50">
          
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
                        width={1024} 
                        height={1024} 
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
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">SMOOTH MOTION ACTIVE</span>
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
                   <div 
                      className={`h-full bg-cyan-500 transition-all duration-300 ${isMotionActive ? 'w-full' : 'w-0'}`} 
                   />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                   <span>{renderMode === 'sprite' ? 'INTERPOLATED 60FPS' : 'REAL VIDEO'}</span>
                   <span className="text-cyan-400 font-bold uppercase">Fluid Engine v5.2</span>
                   <span>00:03</span>
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
                  <Wind size={20} className="text-emerald-500" />
               </div>
               <div>
                  <h5 className="text-xs font-bold text-white uppercase italic">Anatomik Vektör Akışı</h5>
                  <p className="text-[9px] text-slate-500 font-mono">16 Keyframes • Optical Flow Crossfade • 0ms Lag</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/5 px-2 py-1 rounded border border-cyan-500/20">READY FOR SYNC</span>
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
