
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, Zap, Wand2, Sparkles, Rocket, 
  AlertCircle, RefreshCw, Video, Film, Timer, Box,
  Bone, Flame, Heart, Scan, User, Layers, ChevronLeft, ChevronRight,
  Presentation, FileVideo, Cpu, Gift, Info, FileJson, Share2,
  Edit3, Check, X, Grid, Eye, Aperture, Gauge
} from 'lucide-react';
import { Exercise, AnatomicalLayer } from './types.ts';
import { generateExerciseVisual, generateExerciseVideo, generateVectorAnimation, generateClinicalSlides } from './ai-visual.ts';
import { ensureApiKey, isApiKeyError, getAI } from './ai-core.ts';
import { MediaConverter } from './MediaConverter.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion: boolean, frameCount: number, layout: string) => void;
}

// --- GENESIS PING-PONG CINEMATIC ENGINE ---
const LiveSpritePlayer = ({ src, isPlaying = true, layout = 'grid-4x4' }: { src: string, isPlaying?: boolean, layout?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    imageRef.current.crossOrigin = "anonymous"; 
    imageRef.current.src = src;
    imageRef.current.onload = () => setIsLoaded(true);
  }, [src]);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    // --- SİNEMATİK YAPILANDIRMA ---
    const isCinematic = layout === 'grid-5x5';
    const COLS = isCinematic ? 5 : 4;
    const ROWS = isCinematic ? 5 : 4;
    const TOTAL_FRAMES = isCinematic ? 25 : 16;
    
    // Sinematik Akış Hızı: 24 FPS
    const TARGET_FPS = 24; 
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    // Ping-Pong Sequence Oluşturucu: [0, 1, 2, 3, 2, 1]
    const sequence: number[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) sequence.push(i);
    for (let i = TOTAL_FRAMES - 2; i > 0; i--) sequence.push(i);

    let lastTime = performance.now();
    let accumulatedTime = 0;
    let sequenceIndex = 0;

    const canvas = canvasRef.current!;
    if (canvas.width !== 1080) {
        canvas.width = 1080;
        canvas.height = 1080;
    }

    const drawFrame = (frameIndex: number) => {
        const img = imageRef.current;
        
        // 1. Sprite Sheet Koordinat Hesaplama
        const frameW = img.width / COLS;
        const frameH = img.height / ROWS;
        const sx = (frameIndex % COLS) * frameW;
        const sy = Math.floor(frameIndex / COLS) * frameH;

        // 2. Sahne Temizliği (Sinematik Siyah)
        ctx.fillStyle = '#020617'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Ultra-Stabilizasyon ve "Full Body" Koruma
        // Görüntüyü bozmadan, bacakların kesilmesini önleyecek şekilde merkeze sığdır.
        // %92 ölçekleme AI'ın kenar hatalarını telafi eder.
        const scale = Math.min(canvas.width / frameW, canvas.height / frameH) * 0.92;
        const drawW = frameW * scale;
        const drawH = frameH * scale;
        const dx = (canvas.width - drawW) / 2;
        const dy = (canvas.height - drawH) / 2;

        // 4. Render (Kareler Tam Üst Üste)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, frameW, frameH, dx, dy, drawW, drawH);
    };

    const animate = (time: number) => {
      if (!isPlaying) return;

      const deltaTime = time - lastTime;
      lastTime = time;
      accumulatedTime += deltaTime;

      if (accumulatedTime >= FRAME_INTERVAL) {
          sequenceIndex = (sequenceIndex + 1) % sequence.length;
          drawFrame(sequence[sequenceIndex]);
          accumulatedTime -= FRAME_INTERVAL;
      }

      // Sinematik Göstergeler
      ctx.fillStyle = 'rgba(6, 182, 212, 0.1)'; 
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#22d3ee';
      ctx.textAlign = 'center';
      const frameNum = sequence[sequenceIndex] + 1;
      const direction = sequenceIndex < TOTAL_FRAMES ? 'CONCENTRIC' : 'ECCENTRIC';
      ctx.fillText(`CINEMATIC 24FPS | PHASE: ${direction} | FRAME: ${frameNum}/${TOTAL_FRAMES}`, canvas.width / 2, canvas.height - 18);

      requestRef.current = requestAnimationFrame(animate);
    };

    drawFrame(0);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, isPlaying, layout]);

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={48} /></div>;

  return (
    <div className="relative w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full object-contain rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-8 left-8 flex items-center gap-3">
            <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] italic">LIVE CINEMATIC FEED</span>
        </div>
    </div>
  );
};

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'vector' | 'slides'>('image');
  const [activeLayer, setActiveLayer] = useState<AnatomicalLayer | 'Cinematic-Motion'>('full-body');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || '');
  const [videoUrl, setVideoUrl] = useState(exercise.videoUrl || '');
  const [svgContent, setSvgContent] = useState<string>(exercise.vectorData || '');
  const [slideData, setSlideData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentLayout, setCurrentLayout] = useState(exercise.visualLayout || 'grid-4x4');
  const [viewMode, setViewMode] = useState<'live' | 'grid'>('live'); 
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isPromptEditing, setIsPromptEditing] = useState(false);

  useEffect(() => {
    constructPrompt();
  }, [exercise, activeLayer]);

  const constructPrompt = () => {
    const anatomicalFocus = activeLayer === 'muscular' ? 'emphasizing deep red muscle fibers and striations' : 
                            activeLayer === 'skeletal' ? 'highlighting bone structure in white' :
                            activeLayer === 'xray' ? 'in a radiographic blue/white x-ray style' : 
                            'showing a photorealistic athletic human figure';
    
    setGeneratedPrompt(`
      Type: High-End Medical Sprite Sheet (5x5 Grid, 25 Frames).
      Subject: Human performing ${exercise.titleTr || exercise.title}.
      Rules: Full body MUST be visible. Wide angle long shot. Character centered in every cell. 
      Legs and feet must NOT be cropped. Clear anatomical definitions. 
      Style: ${anatomicalFocus}, cinematic lighting, dark slate background (#020617). 
      Resolution: 4K detail level.
    `);
  };

  const handleGenerate = async (specialMode?: 'Cinematic-Motion') => {
    setError(null);
    const ok = await ensureApiKey();
    if (!ok) return;

    setIsGenerating(true);
    const effectiveLayer = specialMode || activeLayer;

    try {
      if (activeTab === 'image') {
        // Force 5x5 Grid for Cinematic-Motion
        const result = await generateExerciseVisual(exercise, 'Cinematic-Motion' as any);
        setPreviewUrl(result.url);
        setCurrentLayout(result.layout); 
        setViewMode('live');
        onVisualGenerated(result.url, `Cinematic-24FPS`, false, result.frameCount, result.layout);
      } else if (activeTab === 'video') {
        const url = await generateExerciseVideo(exercise);
        setVideoUrl(url);
        onVisualGenerated(url, `Veo-Fast-720p`, true, 24, 'single');
      }
    } catch (err: any) {
      if (isApiKeyError(err)) {
        setError("Lütfen geçerli bir API Anahtarı seçin.");
        (window as any).aistudio?.openSelectKey?.();
      } else {
        setError(`Üretim Hatası: Bağlantınızı kontrol edin.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start pb-20 animate-in fade-in duration-500 font-roboto">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-900/80 rounded-[3rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-600" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-inner">
               <Aperture size={28} className="animate-spin-slow" />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Genesis <span className="text-cyan-400">Cinema</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">24 FPS Ping-Pong Engine</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
             <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <ModeBtn active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon={FileVideo} label="CINEMATIC" />
                <ModeBtn active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={Video} label="VEO PRO" />
             </div>

             <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                   <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sahne Promptu</h5>
                   <button onClick={() => setIsPromptEditing(!isPromptEditing)} className="text-[10px] text-cyan-500 font-black hover:underline uppercase">Düzenle</button>
                </div>
                {isPromptEditing ? (
                  <textarea 
                    value={generatedPrompt} 
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-[10px] text-white font-mono h-32 outline-none"
                  />
                ) : (
                  <p className="text-[9px] text-slate-400 font-mono leading-relaxed italic line-clamp-4">{generatedPrompt}</p>
                )}
             </div>
          </div>

          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"><AlertCircle className="text-rose-500 shrink-0" size={16} /><p className="text-[10px] text-rose-200 font-bold uppercase italic">{error}</p></div>}

          <button 
              onClick={() => handleGenerate()} 
              disabled={isGenerating || !exercise.title} 
              className="w-full py-6 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group"
          >
              {isGenerating ? <><Loader2 className="animate-spin" size={20} /> RENDER EDİLİYOR...</> : <><Rocket size={20} /> SİNEMATİK ÜRETİM BAŞLAT</>}
          </button>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-square bg-slate-950 rounded-[4.5rem] border-8 border-slate-900 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)] flex items-center justify-center group">
          
          {activeTab === 'image' && previewUrl && !isGenerating && (
             <LiveSpritePlayer src={previewUrl} layout={currentLayout} />
          )}

          {activeTab === 'video' && videoUrl && !isGenerating && (
             <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-contain" />
          )}

          {!previewUrl && !videoUrl && !isGenerating && (
            <div className="text-center opacity-10">
               <Clapperboard size={150} strokeWidth={0.5} className="mx-auto mb-8" />
               <p className="text-[14px] font-black uppercase tracking-[1em] italic">READY FOR ACTION</p>
            </div>
          )}

          {isGenerating && (
             <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50">
                <div className="relative mb-12">
                   <Loader2 className="animate-spin text-cyan-500" size={100} strokeWidth={1} />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Film size={32} className="text-cyan-400 animate-pulse" />
                   </div>
                </div>
                <h4 className="text-3xl font-black italic tracking-[0.5em] text-white uppercase">SİNEMATİK <span className="text-cyan-400">AKIŞ</span></h4>
                <p className="text-[11px] text-slate-500 mt-6 uppercase font-black tracking-widest italic animate-pulse">Neural Frame Interpolation in Progress...</p>
             </div>
          )}

          {/* Download & Export Controls */}
          {!isGenerating && (videoUrl || previewUrl) && (
             <div className="absolute bottom-12 right-12 flex gap-4 animate-in zoom-in duration-500">
                <button onClick={() => MediaConverter.export(videoUrl || previewUrl, 'mp4', `PhysioCinema_${exercise.code}`)} className="flex items-center gap-3 px-8 py-4 bg-slate-900/90 backdrop-blur-2xl border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-2xl group">
                   <Download size={18} className="group-hover:translate-y-0.5 transition-transform" /> MP4 DIŞA AKTAR
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ModeBtn = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-lg border border-white/5' : 'text-slate-600 hover:text-slate-400'}`}
  >
    <Icon size={20} />
    <span className="text-[9px] font-black tracking-widest uppercase">{label}</span>
  </button>
);
