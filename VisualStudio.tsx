
import React, { useState, useEffect } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, Zap, Wand2, Sparkles, Rocket, 
  AlertCircle, RefreshCw, Video, Film, Timer, Box,
  Bone, Flame, Heart, Scan, User, Layers, ChevronLeft, ChevronRight,
  Presentation, FileVideo, Cpu, Gift, Info
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseVideo, generateVectorAnimation, AnatomicalLayer } from './ai-visual.ts';
import { ensureApiKey, isApiKeyError } from './ai-core.ts';
import { MediaConverter } from './MediaConverter.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion: boolean, frameCount: number, layout: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'vector' | 'slideshow'>('image');
  const [activeLayer, setActiveLayer] = useState<AnatomicalLayer>('full-body');
  const [videoQuality, setVideoQuality] = useState<'fast' | 'pro'>('fast');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || '');
  const [videoUrl, setVideoUrl] = useState(exercise.videoUrl || '');
  const [svgContent, setSvgContent] = useState<string>(exercise.vectorData || '');
  const [slideIndex, setSlideIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const layers = [
    { id: 'full-body', label: 'Komple Beden', icon: User, color: 'text-white' },
    { id: 'muscular', label: 'Kas Yapısı', icon: Flame, color: 'text-rose-500' },
    { id: 'skeletal', label: 'İskelet', icon: Bone, color: 'text-slate-200' },
    { id: 'vascular', label: 'Damar Ağı', icon: Heart, color: 'text-blue-500' },
    { id: 'xray', label: 'X-Ray Görünüş', icon: Scan, color: 'text-cyan-400' }
  ] as const;

  const handleGenerate = async () => {
    setError(null);
    
    // API Key Guard
    const ok = await ensureApiKey();
    if (!ok) return;

    setIsGenerating(true);
    
    try {
      if (activeTab === 'image' || activeTab === 'slideshow') {
        const result = await generateExerciseVisual(exercise, activeLayer);
        setPreviewUrl(result.url);
        onVisualGenerated(result.url, `Flash-${activeLayer}`, false, result.frameCount, result.layout);
      } else if (activeTab === 'video') {
        const url = await generateExerciseVideo(exercise, videoQuality);
        setVideoUrl(url);
        onVisualGenerated(url, `Veo-${videoQuality === 'pro' ? 'Ultra' : 'Fast'}`, true, 24, 'single');
      } else if (activeTab === 'vector') {
        const svg = await generateVectorAnimation(exercise);
        setSvgContent(svg);
        onVisualGenerated(svg, 'Flash-Vector', false, 1, 'single');
      }
    } catch (err: any) {
      console.error("Üretim Hatası:", err);
      if (isApiKeyError(err)) {
        setError("Lütfen geçerli bir API Anahtarı seçin.");
      } else {
        setError(`Üretim Hatası: Lütfen bağlantınızı kontrol edin.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGifExport = async () => {
    if (!videoUrl && !previewUrl) return;
    try {
      const source = activeTab === 'video' ? videoUrl : previewUrl;
      await MediaConverter.export(source, 'gif', `PhysioCore_Dynamic_${exercise.code || 'Export'}`);
    } catch (e) {
      alert("GIF dönüşümü sırasında hata oluştu.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start pb-20 animate-in fade-in duration-500 font-roboto">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-900/80 rounded-[3rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-600" />
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-inner">
               <Cpu size={28} className="animate-pulse" />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Flash <span className="text-cyan-400">Engine</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Multimodal Production v12.0</p>
            </div>
          </div>

          <div className="space-y-6 mb-10">
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button onClick={() => setActiveTab('image')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'image' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>SPRITE</button>
                <button onClick={() => setActiveTab('video')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'video' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>VEO 3D</button>
                <button onClick={() => setActiveTab('vector')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'vector' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>SVG</button>
             </div>

             {activeTab === 'video' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Üretim Kalitesi</p>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setVideoQuality('fast')}
                        className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${videoQuality === 'fast' ? 'bg-slate-800 border-white/10 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                      >
                         KLİNİK (720p)
                      </button>
                      <button 
                        onClick={() => setVideoQuality('pro')}
                        className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all flex flex-col items-center justify-center gap-0.5 ${videoQuality === 'pro' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                      >
                         <span>ULTRA (1080p)</span>
                         <span className="text-[6px] opacity-60">PRO KEY GEREKLİ</span>
                      </button>
                   </div>
                </div>
             )}

             {activeTab === 'image' && (
                <div className="grid grid-cols-1 gap-2">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Anatomik Katman</p>
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

          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"><AlertCircle className="text-rose-500 shrink-0" size={16} /><p className="text-[10px] text-rose-200 font-bold uppercase italic">{error}</p></div>}

          <button 
             onClick={handleGenerate} 
             disabled={isGenerating || !exercise.title} 
             className="w-full py-6 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
          >
             {isGenerating ? <><Loader2 className="animate-spin" size={20} /> RENDER EDİLİYOR...</> : <><Rocket size={20} /> {activeTab === 'video' ? 'ULTRA VEO ÜRETİMİ' : 'FLASH ÜRETİMİ BAŞLAT'}</>}
          </button>
          
          <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
             <Info size={14} className="text-amber-500 shrink-0" />
             <p className="text-[8px] text-slate-500 leading-relaxed italic">
                {activeTab === 'video' ? "VEO 3.1 Pro motoru 1080p yüksek çözünürlüklü tıbbi simülasyonlar üretir. İşlem 1-2 dakika sürebilir." : "Flash motoru 16 fazlı klinik sprite sheet üretiminde uzmanlaşmıştır."}
             </p>
          </div>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-square bg-slate-950 rounded-[4rem] border-4 border-slate-900 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex items-center justify-center">
          {activeTab === 'video' && videoUrl && !isGenerating && (
             <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-contain" />
          )}

          {activeTab === 'image' && previewUrl && !isGenerating && (
             <img src={previewUrl} className="w-full h-full object-contain" />
          )}

          {activeTab === 'vector' && svgContent && !isGenerating && (
             <div className="w-full h-full p-20 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgContent }} />
          )}

          {!previewUrl && !videoUrl && !svgContent && !isGenerating && (
            <div className="text-center opacity-20">
               <Box size={120} strokeWidth={0.5} className="mx-auto mb-8" />
               <p className="text-[11px] font-black uppercase tracking-[0.6em] italic">Awaiting Directive</p>
            </div>
          )}

          {isGenerating && (
             <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50">
                <div className="relative">
                   <Loader2 className="animate-spin text-cyan-500 mb-8" size={64} />
                   <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse rounded-full" />
                </div>
                <h4 className="text-2xl font-black italic tracking-[0.4em] text-white uppercase">
                   {videoQuality === 'pro' && activeTab === 'video' ? 'ULTRA 1080P' : 'RENDER'} <span className="text-cyan-400">ÜRETİLİYOR</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest italic animate-pulse">Sinematik Motor Devrede...</p>
             </div>
          )}

          {(videoUrl || previewUrl) && !isGenerating && (
             <div className="absolute bottom-10 right-10 animate-in zoom-in">
                <button 
                  onClick={handleGifExport}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-2xl group"
                >
                   <Gift size={18} className="group-hover:rotate-12 transition-transform" /> DİNAMİK GIF İNDİR
                </button>
             </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
           <PreviewCard icon={FileVideo} label="Dynamic Motion" desc="Veo 3.1 Pro" active={activeTab === 'video' && videoUrl !== ''} />
           <PreviewCard icon={Presentation} label="Sprite Plate" desc="Flash v2.5" active={activeTab === 'image' && previewUrl !== ''} />
           <PreviewCard icon={Wand2} label="Vector Kinematic" desc="Vektörel Çizim" active={activeTab === 'vector' && svgContent !== ''} />
        </div>
      </div>
    </div>
  );
};

const PreviewCard = ({ icon: Icon, label, desc, active }: any) => (
  <div className={`bg-slate-900/40 border p-6 rounded-[2rem] flex flex-col items-center text-center gap-3 transition-all ${active ? 'border-cyan-500/50 bg-slate-900/60 shadow-lg' : 'border-slate-800 opacity-60'}`}>
     <Icon size={24} className={active ? 'text-cyan-400' : 'text-slate-500'} />
     <div>
        <p className="text-[9px] font-black text-white uppercase tracking-widest">{label}</p>
        <p className="text-[8px] text-slate-600 uppercase font-bold mt-1">{desc}</p>
     </div>
  </div>
);
