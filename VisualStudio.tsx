
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, FileVideo, FileImage, XCircle, Terminal,
  Zap, Wand2, Sparkles, AlertTriangle, ShieldCheck,
  FastForward, Wind, MousePointer2, Box, Layers,
  ChevronRight, Activity, Gauge, Eye, EyeOff, Save,
  Maximize2, Share2, Rocket, AlertCircle
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseRealVideo, generateExerciseVectorData } from './ai-service.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean, frameCount?: number, layout?: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderMode, setRenderMode] = useState<'vector' | 'sprite' | 'video'>('vector');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [svgContent, setSvgContent] = useState<string>(exercise.vectorData || '');
  const [isMotionActive, setIsMotionActive] = useState(false); 
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeLayers, setActiveLayers] = useState({ skeleton: true, muscles: true, skin: true, HUD: true });
  const [isRecording, setIsRecording] = useState(false);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customPrompt && exercise.description) {
      setCustomPrompt(exercise.description.substring(0, 150));
    }
  }, [exercise.description]);

  const handleGenerate = async () => {
    setError(null);
    
    // PRE-FLIGHT CHECK: Prevent throwing error if key is missing
    if (!process.env.API_KEY) {
        const aistudio = (window as any).aistudio;
        if (aistudio) await aistudio.openSelectKey();
        return;
    }

    setIsGenerating(true);
    setIsMotionActive(false);

    try {
      if (renderMode === 'video') {
        const url = await generateExerciseRealVideo(exercise, customPrompt);
        if (!url) throw new Error("Video generation returned no URL");
        setPreviewUrl(url);
        onVisualGenerated(url, 'VEO-Premium', true, 1, 'video');
      } 
      else if (renderMode === 'vector') {
        const svg = await generateExerciseVectorData(exercise);
        setSvgContent(svg);
        setPreviewUrl('vector_mode');
        onVisualGenerated('vector_mode', 'AVM-Genesis', true, 60, 'vector');
      } 
      else {
        const result = await generateExerciseVisual(exercise, 'Cinematic-Grid', customPrompt);
        setPreviewUrl(result.url);
        onVisualGenerated(result.url, 'AVM-Sprite', true, result.frameCount, result.layout);
      }
      setIsMotionActive(true);
    } catch (err: any) {
      console.error("Generation failed:", err);
      
      if (
        err.message?.includes("API key must be set") || 
        err.message?.includes("Requested entity was not found")
      ) {
        const aistudio = (window as any).aistudio;
        if (aistudio) await aistudio.openSelectKey();
        setError("API Anahtarı bulunamadı veya geçersiz. Lütfen tekrar bir anahtar seçin.");
      } else {
        setError(`Üretim hatası: ${err.message || 'Bilinmeyen hata'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative pb-20 animate-in fade-in duration-500 font-roboto">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-900/40 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-inner">
              <Clapperboard size={28} />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter leading-none">Genesis <span className="text-cyan-400">Director</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Pro Motion Studio v6.0</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Box size={12} /> Render Engine
             </label>
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button 
                  onClick={() => setRenderMode('vector')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${renderMode === 'vector' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  <Wind size={12} /> AVM (Vektör)
                </button>
                <button 
                  onClick={() => setRenderMode('video')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${renderMode === 'video' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500'}`}
                >
                  <Rocket size={12} /> VEO (Video)
                </button>
             </div>
             <p className="text-[8px] text-slate-500 italic px-2">
                * Vercel'deki anahtarınız aktif olsa bile tarayıcı güvenliği için anahtar seçimi istenebilir.
             </p>
          </div>

          <div className="space-y-6 mb-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Layers size={12} /> Anatomik Katmanlar
                </label>
                <div className="grid grid-cols-2 gap-2">
                   <LayerToggle label="Skeleton" active={activeLayers.skeleton} onClick={() => toggleLayer('skeleton')} />
                   <LayerToggle label="Muscles" active={activeLayers.muscles} onClick={() => toggleLayer('muscles')} />
                   <LayerToggle label="Body Skin" active={activeLayers.skin} onClick={() => toggleLayer('skin')} />
                   <LayerToggle label="Clinical HUD" active={activeLayers.HUD} onClick={() => toggleLayer('HUD')} />
                </div>
             </div>
          </div>

          {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-rose-500 shrink-0" size={16} />
                  <p className="text-[10px] text-rose-200 font-bold uppercase italic leading-relaxed">{error}</p>
              </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !exercise.title}
            className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group ${renderMode === 'video' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-cyan-500'} text-white`}
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin" size={18} /><span className="animate-pulse">MUHAKEME YAPILIYOR...</span></>
            ) : (
              <><Wand2 size={18} /> GENERATE PRODUCTION</>
            )}
          </button>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-video bg-black rounded-[3rem] border-4 border-slate-800 flex flex-col overflow-hidden shadow-2xl group ring-1 ring-slate-700/50">
          
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent z-40 px-8 flex items-center justify-between pointer-events-none">
             <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-rose-500 text-white text-[9px] font-black rounded flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> {isGenerating ? 'GEN' : 'LIVE'}
                </div>
                <span className="text-[10px] font-mono text-white/50 tracking-widest">00:00:0{currentFrame} / 00:00:04</span>
             </div>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '40px 40px' }} />
             
             {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                   {renderMode === 'vector' ? (
                      <div 
                        ref={svgContainerRef}
                        dangerouslySetInnerHTML={{ __html: svgContent }} 
                        className={`w-full h-full p-24 flex items-center justify-center transition-all ${!activeLayers.skeleton ? '[&_#skeleton]:opacity-0' : ''} ${!activeLayers.muscles ? '[&_#muscles]:opacity-0' : ''} ${!activeLayers.skin ? '[&_#skin-outline]:opacity-20' : ''}`}
                        style={{ filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.2))' }}
                      />
                   ) : (
                      <video 
                        key={previewUrl}
                        src={previewUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay loop muted playsInline
                      />
                   )}
                </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                  <MonitorPlay size={80} strokeWidth={1} className="opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6 opacity-30">Production Station Offline</p>
               </div>
             )}

             {isGenerating && (
                 <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <Loader2 className="animate-spin text-cyan-400 mb-6" size={48} />
                    <p className="text-sm font-black italic tracking-widest text-white uppercase animate-pulse">ÜRETİM YAPILIYOR...</p>
                 </div>
             )}
          </div>

          <div className="h-24 bg-slate-900 border-t border-slate-800 flex flex-col z-50">
             <div className="h-8 bg-slate-950/50 flex items-center relative group/scrub">
                <input 
                  type="range" min="0" max="60" 
                  value={currentFrame}
                  onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
                  className="w-full h-full appearance-none bg-transparent cursor-ew-resize relative z-10"
                />
                <div className="absolute top-0 left-0 h-full bg-cyan-500/10 border-r-2 border-cyan-500 pointer-events-none transition-all" style={{ width: `${(currentFrame/60)*100}%` }} />
             </div>

             <div className="flex-1 flex items-center px-8 gap-8">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsMotionActive(!isMotionActive)}
                    disabled={!previewUrl}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${isMotionActive ? 'bg-slate-800 border-slate-700 text-white' : 'bg-cyan-500 border-cyan-400 text-white shadow-lg'}`}
                  >
                      {isMotionActive ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                  </button>
                </div>
                <div className="flex-1 flex items-center gap-4 text-xs font-mono">
                   <span className="text-cyan-400 font-black italic">PRO-OUTPUT</span>
                   <span className="text-slate-700">|</span>
                   <span className="text-slate-500 uppercase tracking-widest font-black">Frame: {currentFrame}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LayerToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${active ? 'bg-slate-800 border-cyan-500 text-cyan-400 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
  >
    {label} {active ? <Eye size={12}/> : <EyeOff size={12}/>}
  </button>
);
