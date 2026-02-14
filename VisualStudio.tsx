
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

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customPrompt && exercise.description) {
      setCustomPrompt(exercise.description.substring(0, 150));
    }
  }, [exercise.description]);

  const handleGenerate = async () => {
    setError(null);
    const aistudio = (window as any).aistudio;
    if (aistudio && !(await aistudio.hasSelectedApiKey())) {
        await aistudio.openSelectKey();
    }

    setIsGenerating(true);
    setIsMotionActive(false);

    try {
      if (renderMode === 'video') {
        const url = await generateExerciseRealVideo(exercise, customPrompt);
        if (!url) throw new Error("Video üretilemedi.");
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
      if (err.message?.includes("Requested entity was not found") || err.message?.includes("API_KEY_MISSING")) {
        if (aistudio) await aistudio.openSelectKey();
        setError("Lütfen geçerli bir API Anahtarı seçin.");
      } else {
        setError(`Hata: ${err.message || 'Bilinmeyen bir sorun oluştu'}`);
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
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Box size={12} /> Render Engine</label>
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button onClick={() => setRenderMode('vector')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'vector' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>AVM (Vektör)</button>
                <button onClick={() => setRenderMode('video')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'video' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500'}`}>VEO (Video)</button>
             </div>
          </div>
          <div className="space-y-3 mb-8">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Layers size={12} /> Katmanlar</label>
             <div className="grid grid-cols-2 gap-2">
                <LayerToggle label="Skeleton" active={activeLayers.skeleton} onClick={() => toggleLayer('skeleton')} />
                <LayerToggle label="Muscles" active={activeLayers.muscles} onClick={() => toggleLayer('muscles')} />
             </div>
          </div>
          {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-rose-500 shrink-0" size={16} />
                  <p className="text-[10px] text-rose-200 font-bold uppercase">{error}</p>
              </div>
          )}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !exercise.title}
            className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 ${renderMode === 'video' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-cyan-500'} text-white`}
          >
            {isGenerating ? <><Loader2 className="animate-spin" size={18} /> ÜRETİLİYOR...</> : <><Wand2 size={18} /> ÜRETİMİ BAŞLAT</>}
          </button>
        </div>
      </div>
      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-video bg-black rounded-[3rem] border-4 border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 relative flex items-center justify-center bg-slate-950">
             {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                   {renderMode === 'vector' ? (
                      <div ref={svgContainerRef} dangerouslySetInnerHTML={{ __html: svgContent }} className="w-full h-full p-24" />
                   ) : (
                      <video key={previewUrl} src={previewUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                   )}
                </div>
             ) : (
               <div className="text-slate-800 text-[10px] font-black uppercase tracking-widest">Çıktı İstasyonu Çevrimdışı</div>
             )}
             {isGenerating && (
                 <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <Loader2 className="animate-spin text-cyan-400 mb-6" size={48} />
                    <p className="text-sm font-black italic text-white uppercase animate-pulse">MUHAKEME YAPILIYOR...</p>
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LayerToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-slate-800 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
    {label} {active ? <Eye size={12}/> : <EyeOff size={12}/>}
  </button>
);
