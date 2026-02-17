
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

// --- GENESIS FLUID-MOTION ENGINE (INTERPOLATED) ---
const LiveSpritePlayer = ({ src, isPlaying = true, layout = 'grid-4x4' }: { src: string, isPlaying?: boolean, layout?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [isLoaded, setIsLoaded] = useState(false);
  const [useInterpolation, setUseInterpolation] = useState(true); // Akıcı mod varsayılan açık

  useEffect(() => {
    imageRef.current.crossOrigin = "anonymous"; 
    imageRef.current.src = src;
    imageRef.current.onload = () => setIsLoaded(true);
  }, [src]);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d', { alpha: false }); // Alpha false performans artırır
    if (!ctx) return;

    // --- DYNAMIC SPRITE CONFIG ---
    const isCinematic = layout === 'grid-5x5';
    const COLS = isCinematic ? 5 : 4;
    const ROWS = isCinematic ? 5 : 4;
    const TOTAL_FRAMES = isCinematic ? 25 : 16;
    
    // Gerçekçi hız için hedef süre
    const FPS = isCinematic ? 24 : 12; 
    const FRAME_DURATION = 1000 / FPS;

    let startTime = performance.now();
    let frameFloat = 0; // Kayan nokta kare sayısı (örn: 1.45)

    const canvas = canvasRef.current!;
    if (canvas.width !== 1080) {
        canvas.width = 1080;
        canvas.height = 1080;
    }

    const drawFrame = (frameIndex: number, opacity: number = 1) => {
        const img = imageRef.current;
        const frameW = img.width / COLS;
        const frameH = img.height / ROWS;

        // Aspect Ratio Containment
        const scale = Math.min(canvas.width / frameW, canvas.height / frameH) * 0.90;
        const drawW = frameW * scale;
        const drawH = frameH * scale;
        const dx = (canvas.width - drawW) / 2;
        const dy = (canvas.height - drawH) / 2;

        const safeIndex = Math.floor(frameIndex) % TOTAL_FRAMES;
        const sx = (safeIndex % COLS) * frameW;
        const sy = Math.floor(safeIndex / COLS) * frameH;

        ctx.globalAlpha = opacity;
        ctx.drawImage(img, sx, sy, frameW, frameH, dx, dy, drawW, drawH);
        ctx.globalAlpha = 1.0;
    };

    const animate = (time: number) => {
      if (!isPlaying) return;

      const elapsed = time - startTime;
      
      // Clear Canvas (Sinematik Siyah)
      // Interpolation modunda her karede temizlemek yerine üstüne çizim yapılır (blend için), 
      // ama base frame temiz olmalı.
      ctx.fillStyle = '#020617'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (useInterpolation) {
          // --- FLUID MOTION ALGORITHM ---
          // Zaman bazlı sürekli akış (Discrete Frame yerine Continuous Flow)
          frameFloat = (elapsed / FRAME_DURATION) % TOTAL_FRAMES;
          
          const currentFrame = Math.floor(frameFloat);
          const nextFrame = (currentFrame + 1) % TOTAL_FRAMES;
          const blendFactor = frameFloat - currentFrame; // 0.0 ile 1.0 arası

          // 1. Mevcut kareyi çiz (Zemin)
          drawFrame(currentFrame, 1);

          // 2. Sonraki kareyi "Blend Factor" kadar opaklıkla üstüne çiz
          // Bu, iki kare arasında yumuşak bir geçiş (morphing) sağlar.
          drawFrame(nextFrame, blendFactor);

      } else {
          // --- CLASSIC STOP-MOTION ALGORITHM ---
          const currentFrame = Math.floor(elapsed / FRAME_DURATION) % TOTAL_FRAMES;
          drawFrame(currentFrame, 1);
      }

      // Watermark / Overlay 
      ctx.fillStyle = isCinematic ? 'rgba(6, 182, 212, 0.15)' : 'rgba(148, 163, 184, 0.1)'; 
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = isCinematic ? '#22d3ee' : '#94a3b8';
      ctx.textAlign = 'right';
      const modeLabel = isCinematic ? 'CINEMATIC 24FPS' : 'STANDARD 12FPS';
      const techLabel = useInterpolation ? 'FLUID-MOTION' : 'RAW-STEP';
      const frameDisp = Math.floor(frameFloat % TOTAL_FRAMES) + 1;
      
      ctx.fillText(`${modeLabel} | ${techLabel} | FRAME ${frameDisp}/${TOTAL_FRAMES}`, canvas.width - 30, canvas.height - 25);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, isPlaying, layout, useInterpolation]);

  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-600" /></div>;

  return (
    <div className="relative w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full object-contain rounded-[3rem]" />
        
        {/* Interpolation Toggle - Kullanıcıya Kontrol Verme */}
        <button 
            onClick={() => setUseInterpolation(!useInterpolation)}
            className="absolute bottom-6 left-6 px-4 py-2 bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-cyan-500/20 transition-all flex items-center gap-2 group"
            title={useInterpolation ? "Ham kare moduna geç" : "Akıcı moda geç"}
        >
            <Gauge size={14} className={useInterpolation ? "text-cyan-400" : "text-slate-500"} />
            {useInterpolation ? "AKIŞ: AKTİF" : "AKIŞ: KAPALI"}
        </button>
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
  
  // Varsayılan olarak eğer egzersiz verisinde layout varsa onu kullan, yoksa standart 4x4
  const [currentLayout, setCurrentLayout] = useState(exercise.visualLayout || 'grid-4x4');
  
  // View Controls
  const [viewMode, setViewMode] = useState<'live' | 'grid'>('live'); 
  
  // Prompt Engineering State
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isPromptEditing, setIsPromptEditing] = useState(false);
  const [isAiExpanding, setIsAiExpanding] = useState(false);

  useEffect(() => {
    constructPrompt();
  }, [exercise, activeLayer]);

  const constructPrompt = () => {
    if (activeLayer === 'Cinematic-Motion') {
        setGeneratedPrompt(`High-End Medical Sprite Sheet (5x5 Grid). Subject: ${exercise.title}. Action: Smooth continuous motion. 24fps style. Dark background.`);
        return;
    }

    const anatomicalFocus = activeLayer === 'muscular' ? 'emphasizing deep red muscle fibers and striations' : 
                            activeLayer === 'skeletal' ? 'highlighting bone structure and joint articulation in white' :
                            activeLayer === 'xray' ? 'in a radiographic blue/white x-ray style' : 
                            'showing a photorealistic athletic human figure';
    
    const context = `Subject: Human performing ${exercise.title || 'movement'}. 
    Action: ${exercise.titleTr || exercise.title}. 
    Biomechanics: ${exercise.biomechanics || 'Neutral spine'}. 
    Target Tissue: ${exercise.tissueTarget || 'General'}.
    Visual Style: ${anatomicalFocus}. 
    Technical: 4K resolution, clinical lighting, dark slate background, high contrast. 
    Kinetic Chain: ${exercise.kineticChain || 'Closed'}. 
    Phase: ${exercise.contractionType || 'Concentric'}.`;

    setGeneratedPrompt(context);
  };

  const handleAiExpand = async () => {
    setIsAiExpanding(true);
    try {
        const ai = getAI();
        const res = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Expand this image generation prompt to make it more cinematic, detailed, and anatomically precise. Keep it under 60 words: "${generatedPrompt}"`
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
      console.error("Üretim Hatası:", err);
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
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Flash <span className="text-cyan-400">Engine</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Genesis v13.2 Fluid-Motion</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
             <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <ModeBtn active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon={FileVideo} label="SPRITE" />
                <ModeBtn active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={Video} label="VEO FAST" />
                <ModeBtn active={activeTab === 'slides'} onClick={() => setActiveTab('slides')} icon={Presentation} label="SUNUM" />
                <ModeBtn active={activeTab === 'vector'} onClick={() => setActiveTab('vector')} icon={Wand2} label="VECTOR" />
             </div>

             {activeTab === 'image' && (
                <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-left-2">
                   <div className="flex justify-between items-center px-1 mb-2">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Anatomik Katman</p>
                      
                      {/* View Mode Toggle */}
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
                   <Sparkles size={12} className="text-amber-400" /> Prompt Mühendisliği
                </h5>
                <div className="flex gap-2">
                   <button onClick={handleAiExpand} disabled={isAiExpanding} className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all" title="AI ile Genişlet">
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
                 className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-[10px] text-white font-mono h-24 outline-none"
               />
             ) : (
               <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
                  <p className="text-[9px] text-slate-400 font-mono leading-relaxed italic">{generatedPrompt}</p>
               </div>
             )}
          </div>

          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"><AlertCircle className="text-rose-500 shrink-0" size={16} /><p className="text-[10px] text-rose-200 font-bold uppercase italic">{error}</p></div>}

          <div className="space-y-3">
            {/* Main Generate Button */}
            <button 
                onClick={() => handleGenerate()} 
                disabled={isGenerating || !exercise.title} 
                className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
            >
                {isGenerating ? <><Loader2 className="animate-spin" size={20} /> İŞLENİYOR...</> : <><Rocket size={20} /> STANDART ÜRETİM (12 FPS)</>}
            </button>

            {/* Special Cinematic Button */}
            {activeTab === 'image' && (
                <button 
                    onClick={() => handleGenerate('Cinematic-Motion')} 
                    disabled={isGenerating || !exercise.title} 
                    className="w-full py-6 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Aperture size={20} className="animate-pulse" />} 
                    24 FPS CINEMATIC MOTION
                </button>
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW AREA */}
      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-square bg-slate-950 rounded-[4rem] border-4 border-slate-900 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex items-center justify-center group">
          
          {/* VIDEO MODE */}
          {activeTab === 'video' && videoUrl && !isGenerating && (
             <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-contain" />
          )}

          {/* IMAGE / SPRITE MODE */}
          {activeTab === 'image' && previewUrl && !isGenerating && (
             <>
               {viewMode === 'live' ? (
                 <LiveSpritePlayer src={previewUrl} layout={currentLayout} />
               ) : (
                 <img src={previewUrl} className="w-full h-full object-contain" alt="Sprite Sheet Source" />
               )}
               
               {/* View Mode Switcher Overlay (Desktop Only) */}
               <div className="absolute top-6 left-6 hidden group-hover:flex gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 animate-in fade-in transition-all">
                  <button onClick={() => setViewMode('live')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                     CANLI İZLE
                  </button>
                  <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                     KAYNAK (GRID)
                  </button>
               </div>
             </>
          )}

          {/* SLIDES MODE */}
          {activeTab === 'slides' && slideData && !isGenerating && (
             <div className="w-full h-full p-12 bg-white text-slate-900 flex flex-col justify-center">
                <div className="border-4 border-slate-900 p-8 h-full rounded-3xl overflow-y-auto">
                   <h2 className="text-3xl font-black uppercase mb-6 text-cyan-600">{exercise.title}</h2>
                   <div className="space-y-4">
                      {slideData.slides.map((s: any, i: number) => (
                         <div key={i} className="mb-4 pb-4 border-b border-slate-200">
                            <h4 className="font-bold text-lg">Slide {i+1}: {s.title}</h4>
                            <ul className="list-disc pl-5 text-sm text-slate-600">
                               {s.bullets.map((b: any, j: number) => <li key={j}>{b}</li>)}
                            </ul>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* VECTOR MODE */}
          {activeTab === 'vector' && svgContent && !isGenerating && (
             <div className="w-full h-full p-20 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgContent }} />
          )}

          {/* EMPTY STATE */}
          {!previewUrl && !videoUrl && !svgContent && !slideData && !isGenerating && (
            <div className="text-center opacity-20">
               <Box size={120} strokeWidth={0.5} className="mx-auto mb-8" />
               <p className="text-[11px] font-black uppercase tracking-[0.6em] italic">MEDYA ALANI BOŞ</p>
            </div>
          )}

          {/* LOADING STATE */}
          {isGenerating && (
             <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50">
                <Loader2 className="animate-spin text-cyan-500 mb-8" size={64} />
                <h4 className="text-2xl font-black italic tracking-[0.4em] text-white uppercase">RENDER <span className="text-cyan-400">YAPILIYOR</span></h4>
                <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest italic animate-pulse">Flash Engine Processing...</p>
             </div>
          )}

          {/* DOWNLOAD OVERLAY ACTIONS */}
          {!isGenerating && (videoUrl || previewUrl || slideData) && (
             <div className="absolute bottom-8 right-8 flex gap-3 animate-in zoom-in">
                {activeTab === 'slides' && (
                   <DownloadBtn onClick={() => handleDownload('ppt')} label="PPT İNDİR" icon={Presentation} />
                )}
                {activeTab === 'video' && (
                   <DownloadBtn onClick={() => handleDownload('mp4')} label="MP4 İNDİR" icon={FileVideo} />
                )}
                {(activeTab === 'image' || activeTab === 'video') && (
                   <DownloadBtn onClick={() => handleDownload('gif')} label="VIDEO (WEBM)" icon={Film} />
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
    className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all ${active ? 'bg-slate-900 text-white shadow-lg border border-white/5' : 'text-slate-600 hover:text-slate-400'}`}
  >
    <Icon size={16} />
    <span className="text-[8px] font-black tracking-widest uppercase">{label}</span>
  </button>
);

const DownloadBtn = ({ onClick, label, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-6 py-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-2xl group"
  >
     <Icon size={14} className="group-hover:scale-110 transition-transform" /> {label}
  </button>
);
