
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, FileVideo, FileImage, XCircle, Terminal,
  Zap, Wand2, Sparkles, AlertTriangle, ShieldCheck,
  FastForward, Wind, MousePointer2, Box, Layers,
  ChevronRight, Activity, Gauge, Eye, EyeOff, Save,
  Maximize2, Share2, Rocket, AlertCircle, RefreshCw, Key
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseRealVideo, generateExerciseVectorData } from './ai-service.ts';
import { PhysioDB } from './db-repository.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean, frameCount?: number, layout?: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderMode, setRenderMode] = useState<'vector' | 'sprite' | 'video'>('vector');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [svgContent, setSvgContent] = useState<string>(exercise.vectorData || '');
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState({ skeleton: true, muscles: true, skin: true, HUD: true });

  const handleGenerate = async () => {
    setError(null);
    const aistudio = (window as any).aistudio;

    // 1. Proaktif API Key Kontrolü
    try {
        const hasKey = aistudio ? await aistudio.hasSelectedApiKey() : !!process.env.API_KEY;
        if (!hasKey || !process.env.API_KEY) {
            if (aistudio) {
                await aistudio.openSelectKey();
                // Kullanıcı seçim yaptıktan sonra process.env.API_KEY güncellenecektir.
                // Yarış durumunu önlemek için devam ediyoruz.
            } else {
                throw new Error("API_KEY_MISSING");
            }
        }

        setIsGenerating(true);

        if (renderMode === 'video') {
            const url = await generateExerciseRealVideo(exercise, exercise.description);
            if (!url) throw new Error("Video üretilemedi.");
            setPreviewUrl(url);
            onVisualGenerated(url, 'VEO-Premium', true, 1, 'video');
        } 
        else if (renderMode === 'vector') {
            const svg = await generateExerciseVectorData(exercise);
            setSvgContent(svg);
            setPreviewUrl('vector_mode');
            onVisualGenerated(svg, 'AVM-Genesis', false, 0, 'vector');
        } 
        else {
            const result = await generateExerciseVisual(exercise, 'Cinematic-Grid', exercise.description);
            setPreviewUrl(result.url);
            onVisualGenerated(result.url, 'AVM-Sprite', true, result.frameCount, result.layout);
        }
        
        if (exercise.id) {
            const currentEx = await PhysioDB.getExercises();
            const target = currentEx.find(e => e.id === exercise.id);
            if (target) {
                await PhysioDB.updateExercise({
                    ...target,
                    visualUrl: renderMode !== 'vector' ? previewUrl : undefined,
                    vectorData: renderMode === 'vector' ? svgContent : undefined,
                    isMotion: renderMode !== 'vector'
                } as Exercise);
            }
        }
    } catch (err: any) {
        console.error("Generation failed:", err);
        // 2. Hata Yakalama ve Kullanıcı Yönlendirme
        if (err.message?.includes("API_KEY_MISSING") || err.message?.includes("must be set") || err.message?.includes("Requested entity was not found")) {
            setError("Lütfen üretimi başlatmak için geçerli bir API Anahtarı seçin.");
            if (aistudio) await aistudio.openSelectKey();
        } else {
            setError(`Üretim hatası: ${err.message || 'Bilinmeyen bir sorun oluştu'}`);
        }
    } finally {
        setIsGenerating(false);
    }
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

          {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-rose-500 shrink-0" size={16} />
                  <div>
                    <p className="text-[10px] text-rose-200 font-bold uppercase italic leading-relaxed">{error}</p>
                    <button onClick={() => (window as any).aistudio?.openSelectKey()} className="mt-2 text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1 hover:underline">
                        <Key size={10} /> ANAHTAR SEÇİN
                    </button>
                  </div>
              </div>
          )}

          <div className="space-y-4 mb-8">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Box size={12} /> Render Engine</label>
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button onClick={() => setRenderMode('vector')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'vector' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>AVM (Vektör)</button>
                <button onClick={() => setRenderMode('video')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'video' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500'}`}>VEO (Video)</button>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !exercise.title}
            className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group ${renderMode === 'video' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-cyan-500'} text-white`}
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin" size={18} /><span className="animate-pulse">ÜRETİLİYOR...</span></>
            ) : (
              <><Zap size={18} /> PRODUCTION START</>
            )}
          </button>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-video bg-black rounded-[3rem] border-4 border-slate-800 flex flex-col overflow-hidden shadow-2xl group ring-1 ring-slate-700/50">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950">
             {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                   {renderMode === 'vector' ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: svgContent }} 
                        className="w-full h-full p-24 flex items-center justify-center"
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
                    <p className="text-sm font-black italic tracking-widest text-white uppercase animate-pulse">MUHAKEME YAPILIYOR...</p>
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
