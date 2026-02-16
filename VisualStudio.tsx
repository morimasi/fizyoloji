
import React, { useState, useEffect } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, Zap, Wand2, Sparkles, Rocket, 
  AlertCircle, RefreshCw, Video, Film, Timer, Box,
  Bone, Flame, Heart, Scan, User, Layers, ChevronLeft, ChevronRight,
  Presentation, FileVideo, Cpu
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseVideo, generateVectorAnimation, AnatomicalLayer } from './ai-visual.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  // Fix: Updated onVisualGenerated signature to match ExerciseForm requirements and include optional metadata
  onVisualGenerated: (url: string, style: string, isMotion: boolean, frameCount: number, layout: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'vector' | 'slideshow'>('image');
  const [activeLayer, setActiveLayer] = useState<AnatomicalLayer>('full-body');
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
  ];

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    
    try {
      if (activeTab === 'image' || activeTab === 'slideshow') {
        const result = await generateExerciseVisual(exercise, activeLayer);
        setPreviewUrl(result.url);
        // Fix: Pass all required arguments to onVisualGenerated to prevent "too few arguments" errors in callers
        onVisualGenerated(result.url, `Flash-${activeLayer}`, false, result.frameCount, result.layout);
      } else if (activeTab === 'video') {
        const url = await generateExerciseVideo(exercise);
        setVideoUrl(url);
        // Fix: Pass all required arguments to onVisualGenerated with default values for video
        onVisualGenerated(url, `Veo-Motion`, true, 24, 'single');
      } else if (activeTab === 'vector') {
        const svg = await generateVectorAnimation(exercise);
        setSvgContent(svg);
        // Fix: Pass all required arguments to onVisualGenerated with default values for vector
        onVisualGenerated(svg, 'Flash-Vector', false, 1, 'single');
      }
    } catch (err: any) {
      setError(`Üretim Hatası: Lütfen bağlantınızı kontrol edin.`);
    } finally {
      setIsGenerating(false);
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
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Multimodal Production v11.0</p>
            </div>
          </div>

          <div className="space-y-6 mb-10">
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button onClick={() => setActiveTab('image')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'image' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>GÖRSEL</button>
                <button onClick={() => setActiveTab('video')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'video' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>VİDEO/GIF</button>
                <button onClick={() => setActiveTab('vector')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'vector' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>SVG</button>
                <button onClick={() => setActiveTab('slideshow')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === 'slideshow' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}>SLAYT</button>
             </div>

             {activeTab !== 'vector' && activeTab !== 'video' && (
                <div className="grid grid-cols-1 gap-2">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Anatomik Katman Seçimi</p>
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
             {isGenerating ? <><Loader2 className="animate-spin" size={20} /> İŞLENİYOR...</> : <><Rocket size={20} /> FLASH ÜRETİMİ BAŞLAT</>}
          </button>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-square bg-slate-950 rounded-[4rem] border-4 border-slate-900 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          {activeTab === 'image' && previewUrl && (
             <div className="w-full h-full relative">
                <img src={previewUrl} className="w-full h-full object-contain" />
                <div className="absolute top-8 right-8 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[9px] font-black text-cyan-400 uppercase tracking-widest">FLASH RENDER</div>
             </div>
          )}

          {activeTab === 'video' && videoUrl && (
             <video src={videoUrl} autoPlay loop muted className="w-full h-full object-contain" />
          )}

          {activeTab === 'vector' && svgContent && (
             <div className="w-full h-full p-20 bg-slate-900 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgContent }} />
          )}

          {activeTab === 'slideshow' && previewUrl && (
             <div className="w-full h-full p-20 flex flex-col items-center justify-center relative bg-black">
                <img src={previewUrl} className="w-full h-full object-contain opacity-80" />
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/90 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
                   <button onClick={() => setSlideIndex(prev => Math.max(0, prev-1))} className="p-3 text-slate-500 hover:text-white"><ChevronLeft/></button>
                   <span className="text-xs font-black text-cyan-400 font-mono tracking-tighter uppercase">Faz: {slideIndex + 1} / 16</span>
                   <button onClick={() => setSlideIndex(prev => Math.min(15, prev+1))} className="p-3 text-slate-500 hover:text-white"><ChevronRight/></button>
                </div>
             </div>
          )}

          {!previewUrl && !videoUrl && !svgContent && (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
               <Box size={120} strokeWidth={0.5} className="opacity-10 mb-8" />
               <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-20 italic">Awaiting Flash Directive</p>
            </div>
          )}

          {isGenerating && (
             <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50">
                <Loader2 className="animate-spin text-cyan-500 mb-8" size={64} />
                <h4 className="text-2xl font-black italic tracking-[0.4em] text-white uppercase animate-pulse">Multimodal Üretim</h4>
                <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest italic">Flash & Veo motorları çalışıyor...</p>
             </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
           <PreviewCard icon={FileVideo} label="Veo Animation" desc="Dinamik GIF" />
           <PreviewCard icon={Presentation} label="Slide Deck" desc="Klinik Analiz" />
           <PreviewCard icon={Wand2} label="Anatomical SVG" desc="Vektörel Çizim" />
        </div>
      </div>
    </div>
  );
};

const PreviewCard = ({ icon: Icon, label, desc }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center text-center gap-3 hover:border-slate-700 transition-all cursor-pointer">
     <Icon size={24} className="text-slate-500" />
     <div>
        <p className="text-[9px] font-black text-white uppercase tracking-widest">{label}</p>
        <p className="text-[8px] text-slate-600 uppercase font-bold mt-1">{desc}</p>
     </div>
  </div>
);
