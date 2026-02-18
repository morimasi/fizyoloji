
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, Zap, Wand2, Sparkles, Rocket, 
  AlertCircle, RefreshCw, Video, Film, Timer, Box,
  Bone, Flame, Heart, Scan, User, Layers, ChevronLeft, ChevronRight,
  Presentation, FileVideo, Cpu, Gift, Info, FileJson, Share2,
  Edit3, Check, X, Grid, Eye, Aperture, Gauge, Target, Lock,
  FastForward, Rewind, Activity, MousePointer2
} from 'lucide-react';
import { Exercise, AnatomicalLayer } from './types.ts';
import { generateExerciseVisual, generateExerciseVideo, generateVectorAnimation, generateClinicalSlides } from './ai-visual.ts';
import { ensureApiKey, isApiKeyError, getAI } from './ai-core.ts';
import { MediaConverter } from './MediaConverter.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion: boolean, frameCount: number, layout: string) => void;
}

// --- SLIDE FRAME EXTRACTOR ---
// Extracts a specific frame from the sprite sheet to use as a slide image.
const SlideFrameRenderer = ({ src, stepIndex, totalSteps, layout }: { src: string, stepIndex: number, totalSteps: number, layout: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (!src || !canvasRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const ctx = canvasRef.current!.getContext('2d');
      if (!ctx) return;

      const isCinematic = layout === 'grid-5x5';
      const cols = isCinematic ? 5 : 4;
      const rows = isCinematic ? 5 : 4;
      const totalFrames = cols * rows;

      // Map 10 steps to N frames (e.g., Step 1->Frame 0, Step 10->Frame 15)
      const mappedFrameIndex = Math.floor((stepIndex / (totalSteps - 1)) * (totalFrames - 1));
      
      const frameW = img.width / cols;
      const frameH = img.height / rows;
      
      const sx = (mappedFrameIndex % cols) * frameW;
      const sy = Math.floor(mappedFrameIndex / cols) * frameH;

      canvasRef.current!.width = 400; // High res thumbnail
      canvasRef.current!.height = 400;

      // Draw cropped frame
      ctx.drawImage(img, sx, sy, frameW, frameH, 0, 0, 400, 400);
      
      // Draw Step Badge
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.arc(40, 40, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((stepIndex + 1).toString(), 40, 40);

      setIsRendered(true);
    };
  }, [src, stepIndex, totalSteps, layout]);

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-lg group-hover:border-cyan-500/50 transition-all">
      {!isRendered && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-slate-600" /></div>}
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
    </div>
  );
};

// --- GENESIS "TEMPORAL-FLOW" ENGINE v5.0 ---
// Protocol: Time-Mapped Frame Interpolation with Easing Functions.
const LiveSpritePlayer = ({ src, isPlaying = true, layout = 'grid-4x4', speed = 1.0, smoothing = true }: { src: string, isPlaying?: boolean, layout?: string, speed?: number, smoothing?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Store crop coordinates and offsets
  const registeredFrames = useRef<{
      sx: number, sy: number, 
      cropSize: number, 
      dx: number, dy: number 
  }[]>([]);

  useEffect(() => {
    setIsLoaded(false);
    setIsAnalyzing(true);
    registeredFrames.current = [];

    imageRef.current.crossOrigin = "anonymous"; 
    imageRef.current.src = src;
    
    imageRef.current.onload = () => {
      normalizeAndRegisterFrames(imageRef.current, layout);
      setIsAnalyzing(false);
      setIsLoaded(true);
    };
  }, [src, layout]);

  const normalizeAndRegisterFrames = (img: HTMLImageElement, currentLayout: string) => {
    const isCinematic = currentLayout === 'grid-5x5';
    const cols = isCinematic ? 5 : 4;
    const rows = isCinematic ? 5 : 4;
    const totalFrames = cols * rows;
    
    const rawCellW = img.width / cols;
    const rawCellH = img.height / rows;

    const cropSize = Math.floor(Math.min(rawCellW, rawCellH));
    const cropOffsetX = (rawCellW - cropSize) / 2;
    const cropOffsetY = (rawCellH - cropSize) / 2;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = cropSize;
    offCanvas.height = cropSize;
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;

    const frames: any[] = [];
    const BG_COLOR = { r: 2, g: 6, b: 23 }; 
    const THRESHOLD = 35; 

    for (let i = 0; i < totalFrames; i++) {
        const cellX = (i % cols) * rawCellW;
        const cellY = Math.floor(i / cols) * rawCellH;
        const srcX = Math.floor(cellX + cropOffsetX);
        const srcY = Math.floor(cellY + cropOffsetY);

        ctx.clearRect(0, 0, cropSize, cropSize);
        ctx.drawImage(img, srcX, srcY, cropSize, cropSize, 0, 0, cropSize, cropSize);

        const frameData = ctx.getImageData(0, 0, cropSize, cropSize);
        const data = frameData.data;
        
        let minX = cropSize, maxX = 0, minY = cropSize, maxY = 0;
        let found = false;

        for (let y = 0; y < cropSize; y += 2) {
            for (let x = 0; x < cropSize; x += 2) {
                const idx = (y * cropSize + x) * 4;
                const dist = Math.sqrt(
                    Math.pow(data[idx] - BG_COLOR.r, 2) + 
                    Math.pow(data[idx+1] - BG_COLOR.g, 2) + 
                    Math.pow(data[idx+2] - BG_COLOR.b, 2)
                );

                if (dist > THRESHOLD) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }

        let dx = 0, dy = 0;
        if (found) {
            const subjectCenterX = (minX + maxX) / 2;
            const subjectCenterY = (minY + maxY) / 2;
            dx = (cropSize / 2) - subjectCenterX;
            dy = (cropSize / 2) - subjectCenterY;
        }

        frames.push({ sx: srcX, sy: srcY, cropSize, dx, dy });
    }
    registeredFrames.current = frames;
  };

  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const isCinematic = layout === 'grid-5x5';
    const totalFrames = isCinematic ? 25 : 16;
    
    // TEMPORAL ENGINE CONFIG
    const BASE_DURATION = 2500; // 2.5 seconds for a full loop at 1x speed
    let startTimestamp = performance.now();

    const canvas = canvasRef.current!;
    canvas.width = 1080;
    canvas.height = 1080;

    const drawFrame = (frameIdx: number, progress: number) => {
        const img = imageRef.current;
        const frameData = registeredFrames.current[frameIdx];
        if (!frameData) return;

        ctx.fillStyle = '#020617'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = (canvas.width * 0.85) / frameData.cropSize;
        const drawSize = Math.floor(frameData.cropSize * scale);
        
        let destX = (canvas.width - drawSize) / 2;
        let destY = (canvas.height - drawSize) / 2;

        destX += frameData.dx * scale;
        destY += frameData.dy * scale;

        ctx.drawImage(
            img, 
            frameData.sx, frameData.sy, frameData.cropSize, frameData.cropSize, 
            Math.floor(destX), Math.floor(destY), drawSize, drawSize
        );

        // Progress Bar Overlay
        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.fillRect(0, canvas.height - 6, canvas.width * progress, 6);
        
        // Tech Stats
        ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
        ctx.fillRect(20, 20, 140, 50);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#22d3ee';
        ctx.fillText(`FRAME: ${frameIdx + 1}/${totalFrames}`, 30, 40);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`SPEED: ${speed.toFixed(1)}x`, 30, 55);
    };

    const animate = (time: number) => {
      if (!isPlaying) {
          requestRef.current = requestAnimationFrame(animate);
          return;
      }

      // 1. Calculate Global Progress (0.0 -> 1.0)
      const duration = BASE_DURATION / speed;
      const elapsed = time - startTimestamp;
      const rawProgress = (elapsed % duration) / duration;

      // 2. Apply Easing (Smoother motion perception)
      // Linear is robotic. Ease-In-Out is organic.
      let adjustedProgress = rawProgress;
      if (smoothing) {
          // SmoothStep function: 3x^2 - 2x^3
          adjustedProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      }

      // 3. Map to Discrete Frame
      // We clamp the index to ensure it never hits 'totalFrames' (which is out of bounds)
      const frameIndex = Math.min(
          Math.floor(adjustedProgress * totalFrames), 
          totalFrames - 1
      );

      drawFrame(frameIndex, rawProgress);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, isPlaying, layout, speed, smoothing]);

  if (!isLoaded || isAnalyzing) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/20 gap-4">
        <Loader2 size={48} className="text-cyan-500 animate-spin" />
        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">TEMPORAL SYNC</p>
    </div>
  );

  return (
    <div className="relative w-full h-full group">
        <canvas ref={canvasRef} className="w-full h-full object-contain rounded-[3rem] shadow-2xl" />
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
            <Activity size={14} className={smoothing ? "text-emerald-500" : "text-amber-500"} />
            <span className="text-[10px] font-black font-mono text-white uppercase tracking-widest">
                {smoothing ? 'ORGANIC FLOW' : 'LINEAR STEP'}
            </span>
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
  const [isAiExpanding, setIsAiExpanding] = useState(false);
  
  // New Playback Controls
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isSmoothingEnabled, setIsSmoothingEnabled] = useState(true);

  useEffect(() => {
    constructPrompt();
  }, [exercise, activeLayer]);

  const constructPrompt = () => {
    if (activeLayer === 'Cinematic-Motion') {
        setGeneratedPrompt(`Medical Sprite Sheet (5x5 Grid). Subject: ${exercise.title}. RULES: Fixed camera. Center torso in every frame. No panning. Hard lock alignment.`);
        return;
    }

    const anatomicalFocus = activeLayer === 'muscular' ? 'emphasizing deep red muscle fibers and striations' : 
                            activeLayer === 'skeletal' ? 'highlighting bone structure and joint articulation in white' :
                            activeLayer === 'xray' ? 'in a radiographic blue/white x-ray style' : 
                            'showing a photorealistic athletic human figure';
    
    const context = `Subject: Human performing ${exercise.title || 'movement'}. 
    Style: ${anatomicalFocus}. 
    Technical: Absolute character stability, frame-locked position, dark slate background.`;

    setGeneratedPrompt(context);
  };

  const handleAiExpand = async () => {
    setIsAiExpanding(true);
    try {
        const ai = getAI();
        const res = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Expand this medical visual prompt. Enforce absolute coordinate stability and no background jitter. Max 50 words: "${generatedPrompt}"`
        });
        if (res.text) setGeneratedPrompt(res.text);
    } catch (e) { console.error(e); }
    finally { setIsAiExpanding(false); }
  };

  const layers = [
    { id: 'full-body', label: 'Komple Beden', icon: User, color: 'text-white' },
    { id: 'muscular', label: 'Kas Yapısı', icon: Flame, color: 'text-rose-500' },
    { id: 'skeletal', label: 'İskelet', icon: Bone, color: 'text-slate-200' },
    { id: 'vascular', label: 'Damar Ağı', icon: Heart, color: 'text-blue-500' },
    { id: 'xray', label: 'X-Ray Görünüş', icon: Scan, color: 'text-cyan-400' }
  ] as const;

  const handleGenerate = async (specialMode?: 'Cinematic-Motion') => {
    setError(null);
    const ok = await ensureApiKey();
    if (!ok) return;

    setIsGenerating(true);
    const effectiveLayer = specialMode || activeLayer;
    const overrideExercise = { ...exercise, generatedPrompt: specialMode ? undefined : generatedPrompt }; 

    try {
      if (activeTab === 'image') {
        const result = await generateExerciseVisual(overrideExercise, effectiveLayer as any);
        setPreviewUrl(result.url);
        setCurrentLayout(result.layout); 
        setViewMode('live');
        onVisualGenerated(result.url, `Flash-${effectiveLayer}`, false, result.frameCount, result.layout);
      } else if (activeTab === 'video') {
        const url = await generateExerciseVideo(overrideExercise);
        setVideoUrl(url);
        onVisualGenerated(url, `Veo-Fast-720p`, true, 24, 'single');
      } else if (activeTab === 'vector') {
        const svg = await generateVectorAnimation(overrideExercise);
        setSvgContent(svg);
        onVisualGenerated(svg, 'Flash-Vector', false, 1, 'single');
      } else if (activeTab === 'slides') {
        const slides = await generateClinicalSlides(overrideExercise);
        setSlideData(slides);
      }
    } catch (err: any) {
      console.error("Production Error:", err);
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

  const handleDownload = async (format: 'gif' | 'mp4' | 'ppt') => {
    try {
      if (format === 'ppt' && slideData) {
        await MediaConverter.export({ slides: slideData.slides }, 'ppt', `PhysioCore_Slides_${exercise.code}`);
      } else if (format === 'mp4' && videoUrl) {
        await MediaConverter.export(videoUrl, 'mp4', `PhysioCore_Video_${exercise.code}`);
      } else if (format === 'gif' && (videoUrl || previewUrl)) {
        await MediaConverter.export(videoUrl || previewUrl, 'gif', `PhysioCore_Motion_${exercise.code}`);
      }
    } catch (e) {
      alert("Dönüştürme sırasında hata oluştu.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start pb-20 animate-in fade-in duration-500 font-roboto">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-900/80 rounded-[3rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-600" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-inner">
               <Cpu size={28} className="animate-pulse" />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Genesis <span className="text-cyan-400">Renderer</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Anti-Jitter v17.0 (Square-Crop)</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
             <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <ModeBtn active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon={FileVideo} label="STABLE SPRITE" />
                <ModeBtn active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={Video} label="VEO FAST" />
                <ModeBtn active={activeTab === 'slides'} onClick={() => setActiveTab('slides')} icon={Presentation} label="SUNUM" />
                <ModeBtn active={activeTab === 'vector'} onClick={() => setActiveTab('vector')} icon={Wand2} label="VECTOR" />
             </div>

             {activeTab === 'image' && (
                <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-left-2">
                   <div className="flex justify-between items-center px-1 mb-2">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Stabilizasyon Katmanı</p>
                      
                      {previewUrl && (
                        <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                           <button onClick={() => setViewMode('live')} className={`p-1.5 rounded transition-all ${viewMode === 'live' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`} title="Canlı Önizleme">
                              <Eye size={12} />
                           </button>
                           <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`} title="Kaynak Grid">
                              <Grid size={12} />
                           </button>
                        </div>
                      )}
                   </div>
                   {layers.map(layer => (
                      <button 
                        key={layer.id} 
                        onClick={() => setActiveLayer(layer.id as any)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${activeLayer === layer.id ? 'bg-cyan-500/10 border-cyan-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                         <div className="flex items-center gap-3">
                            <layer.icon size={16} className={layer.color} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{layer.label}</span>
                         </div>
                         {activeLayer === layer.id && <Zap size={10} className="text-cyan-400 fill-cyan-400" />}
                      </button>
                   ))}
                </div>
             )}
          </div>

          {/* PROMPT ENGINEERING */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3 mb-6 relative group/prompt">
             <div className="flex justify-between items-center">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Sparkles size={12} className="text-amber-400" /> Stabilizasyon Promptu
                </h5>
                <div className="flex gap-2">
                   <button onClick={handleAiExpand} disabled={isAiExpanding} className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all" title="Stabilizasyon Analizi">
                      {isAiExpanding ? <RefreshCw className="animate-spin" size={12} /> : <Wand2 size={12} />}
                   </button>
                   <button onClick={() => setIsPromptEditing(!isPromptEditing)} className="p-1.5 bg-slate-800 hover:text-white text-slate-400 rounded-lg transition-all">
                      {isPromptEditing ? <Check size={12} /> : <Edit3 size={12} />}
                   </button>
                </div>
             </div>
             {isPromptEditing ? (
               <textarea 
                 value={generatedPrompt} 
                 onChange={(e) => setGeneratedPrompt(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-[10px] text-white font-mono h-24 outline-none resize-none"
               />
             ) : (
               <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 max-h-24 overflow-y-auto custom-scrollbar">
                  <p className="text-[9px] text-slate-400 font-mono leading-relaxed italic">{generatedPrompt}</p>
               </div>
             )}
          </div>

          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in shake duration-300"><AlertCircle className="text-rose-500 shrink-0" size={16} /><p className="text-[10px] text-rose-200 font-bold uppercase italic">{error}</p></div>}

          <div className="space-y-3">
            <button 
                onClick={() => handleGenerate()} 
                disabled={isGenerating || !exercise.title} 
                className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
            >
                {isGenerating ? <><Loader2 className="animate-spin" size={20} /> İŞLENİYOR...</> : <><Rocket size={20} /> STANDART (LOCK-POS)</>}
            </button>

            {activeTab === 'image' && (
                <button 
                    onClick={() => handleGenerate('Cinematic-Motion')} 
                    disabled={isGenerating || !exercise.title} 
                    className="w-full py-6 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Aperture size={20} className="animate-pulse" />} 
                    CINEMATIC STABLE MOTION (25 FPS)
                </button>
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW AREA */}
      <div className="xl:col-span-8 space-y-6">
        <div className={`relative w-full ${activeTab === 'slides' ? 'h-auto min-h-[600px]' : 'aspect-square'} bg-slate-950 rounded-[4rem] border-4 border-slate-900 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex items-center justify-center group p-2`}>
          
          {activeTab === 'video' && videoUrl && !isGenerating && (
             <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-contain rounded-[3rem]" />
          )}

          {activeTab === 'image' && previewUrl && !isGenerating && (
             <>
               {viewMode === 'live' ? (
                 <LiveSpritePlayer src={previewUrl} layout={currentLayout} speed={playbackSpeed} smoothing={isSmoothingEnabled} />
               ) : (
                 <img src={previewUrl} className="w-full h-full object-contain rounded-[3rem]" alt="Sprite Sheet Source" />
               )}
               
               {/* View Modes */}
               <div className="absolute top-6 left-6 hidden group-hover:flex gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 animate-in fade-in transition-all">
                  <button onClick={() => setViewMode('live')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                     CANLI MOD
                  </button>
                  <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                     KAYNAK GRID
                  </button>
               </div>

               {/* Playback Controls (Speed & Smooth) */}
               {viewMode === 'live' && (
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-2">
                       <button onClick={() => setPlaybackSpeed(0.5)} className={`p-3 rounded-xl transition-all ${playbackSpeed === 0.5 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-slate-400 hover:text-white'}`} title="Yavaş (Analiz)">
                           <Rewind size={16} />
                       </button>
                       <div className="px-4 text-[10px] font-mono text-cyan-400 font-bold min-w-[50px] text-center">{playbackSpeed}x</div>
                       <button onClick={() => setPlaybackSpeed(1.0)} className={`p-3 rounded-xl transition-all ${playbackSpeed === 1.0 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-slate-400 hover:text-white'}`} title="Normal">
                           <Play size={16} />
                       </button>
                       <button onClick={() => setPlaybackSpeed(1.5)} className={`p-3 rounded-xl transition-all ${playbackSpeed === 1.5 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-slate-400 hover:text-white'}`} title="Hızlı">
                           <FastForward size={16} />
                       </button>
                       <div className="w-[1px] h-6 bg-white/10 mx-1" />
                       <button onClick={() => setIsSmoothingEnabled(!isSmoothingEnabled)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${isSmoothingEnabled ? 'bg-purple-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                           {isSmoothingEnabled ? 'SMOOTH' : 'STEP'}
                       </button>
                   </div>
               )}
             </>
          )}

          {activeTab === 'slides' && slideData && !isGenerating && (
             <div className="w-full h-full p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-10 p-4 rounded-2xl border border-white/5 shadow-xl">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{exercise.title}</h2>
                      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-1">10-Adım Klinik Protokol Analizi</p>
                   </div>
                   {!previewUrl && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[9px] font-bold">
                         <AlertCircle size={14} /> GÖRSEL OLUŞTURULMADI
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {slideData.slides.map((s: any, i: number) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 hover:border-cyan-500/30 transition-all group/card flex flex-col gap-4">
                         {/* Visual Frame Extraction */}
                         {previewUrl ? (
                            <SlideFrameRenderer 
                                src={previewUrl} 
                                stepIndex={i} 
                                totalSteps={10} 
                                layout={currentLayout} 
                            />
                         ) : (
                            <div className="w-full aspect-square bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-slate-800 text-slate-700">
                               <Grid size={48} className="opacity-20" />
                               <p className="text-[8px] font-bold uppercase mt-4 tracking-widest">Görsel Bekleniyor</p>
                            </div>
                         )}
                         
                         {/* Data Content */}
                         <div className="space-y-2 px-2">
                            <div className="flex items-start justify-between">
                               <h4 className="font-black text-sm text-white uppercase tracking-tight">{s.title}</h4>
                               <span className="text-[8px] font-black text-slate-500 bg-slate-950 px-2 py-1 rounded">FAZ {i+1}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">"{s.instruction}"</p>
                            <div className="pt-2 mt-2 border-t border-slate-800/50 flex items-center gap-2 text-cyan-500">
                               <Target size={12} />
                               <span className="text-[8px] font-black uppercase tracking-widest">{s.focus}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'vector' && svgContent && !isGenerating && (
             <div className="w-full h-full p-20 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgContent }} />
          )}

          {!previewUrl && !videoUrl && !svgContent && !slideData && !isGenerating && (
            <div className="text-center opacity-20 group-hover:opacity-40 transition-opacity">
               <Aperture size={120} strokeWidth={0.5} className="mx-auto mb-8 animate-spin-slow" />
               <p className="text-[11px] font-black uppercase tracking-[0.6em] italic">BEKLEMEDE: STABLE ENGINE</p>
            </div>
          )}

          {isGenerating && (
             <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50">
                <div className="relative">
                    <Loader2 className="animate-spin text-cyan-500 mb-8" size={80} />
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] animate-pulse" />
                </div>
                <h4 className="text-3xl font-black italic tracking-[0.4em] text-white uppercase">SYNC <span className="text-cyan-400">LOCK</span></h4>
                <p className="text-[10px] text-slate-500 mt-6 uppercase font-black tracking-[0.2em] italic animate-pulse">Normalizing Aspect Ratio...</p>
             </div>
          )}

          {!isGenerating && (videoUrl || previewUrl || slideData) && (
             <div className="absolute bottom-8 right-8 flex gap-3 animate-in zoom-in slide-in-from-bottom-2 duration-500 z-50">
                {activeTab === 'slides' && (
                   <DownloadBtn onClick={() => handleDownload('ppt')} label="PPT VERİ SETİ" icon={Presentation} />
                )}
                {activeTab === 'video' && (
                   <DownloadBtn onClick={() => handleDownload('mp4')} label="KLİNİK MP4" icon={FileVideo} />
                )}
                {(activeTab === 'image' || activeTab === 'video') && (
                   <DownloadBtn onClick={() => handleDownload('gif')} label="LOOP VIDEO" icon={Film} />
                )}
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
    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-all ${active ? 'bg-slate-900 text-white shadow-xl border border-white/10 scale-105' : 'text-slate-600 hover:text-slate-400'}`}
  >
    <Icon size={18} />
    <span className="text-[8px] font-black tracking-widest uppercase leading-none">{label}</span>
  </button>
);

const DownloadBtn = ({ onClick, label, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 px-8 py-4 bg-slate-900/90 backdrop-blur-2xl border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:border-cyan-400 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
  >
     <Icon size={16} className="group-hover:scale-110 transition-transform" /> {label}
  </button>
);
