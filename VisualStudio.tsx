
import React, { useState } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, Zap, Wand2, Sparkles, Rocket, 
  AlertCircle, RefreshCw, Video, Film, Timer, Box
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseVectorData } from './ai-service.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean, frameCount?: number, layout?: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderMode, setRenderMode] = useState<'vector' | 'motion-plate'>('motion-plate');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || '');
  const [svgContent, setSvgContent] = useState<string>(exercise.vectorData || '');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    
    try {
      if (renderMode === 'vector') {
        const svg = await generateExerciseVectorData(exercise);
        setSvgContent(svg);
        setPreviewUrl('vector_mode');
        onVisualGenerated(svg, 'Vektör-Klinik', false, 0, 'vector'); 
      } else {
        // Flash model ile saniyeler içinde 16 karelik hareket plakası üretimi
        const result = await generateExerciseVisual(exercise);
        setPreviewUrl(result.url);
        onVisualGenerated(result.url, 'Flash-Motion', true, result.frameCount, result.layout);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Üretim Hatası: Model yoğunluğu nedeniyle şu an işlem yapılamıyor.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pb-20 animate-in fade-in duration-500 font-roboto">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-900/60 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800">
               <MonitorPlay size={28} />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Flash <span className="text-cyan-400">Render</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ekonomik Medya Üretim Birimi</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Görselleştirme Modu</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                   <button onClick={() => setRenderMode('motion-plate')} className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${renderMode === 'motion-plate' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-600'}`}>Hareket Plakası</button>
                   <button onClick={() => setRenderMode('vector')} className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${renderMode === 'vector' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-600'}`}>Vektör</button>
                </div>
                <p className="text-[8px] text-slate-600 italic">"Flash modelleri, standart üretime göre %90 daha az kaynak tüketir."</p>
             </div>
          </div>

          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"><AlertCircle className="text-rose-500 shrink-0" size={16} /><p className="text-[10px] text-rose-200 font-bold uppercase italic">{error}</p></div>}

          <button 
             onClick={handleGenerate} 
             disabled={isGenerating || !exercise.title} 
             className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
          >
             {isGenerating ? <><Loader2 className="animate-spin" size={18} /> ÜRETİLİYOR...</> : <><Rocket size={18} /> HIZLI ÜRETİMİ BAŞLAT</>}
          </button>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-square bg-black rounded-[4rem] border-4 border-slate-900 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
             {previewUrl ? (
                renderMode === 'vector' ? (
                   <div dangerouslySetInnerHTML={{ __html: svgContent }} className="w-full h-full p-24" />
                ) : (
                   <div className="relative w-full h-full">
                      <img src={previewUrl} className="w-full h-full object-contain opacity-50" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-500/30">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                               <Sparkles size={14} /> MOTION PLATE READY
                            </span>
                         </div>
                         <p className="text-[9px] text-slate-500 mt-4 uppercase font-bold tracking-widest">Oynatıcıda canlandırılmaya hazır.</p>
                      </div>
                   </div>
                )
             ) : (
               <div className="flex flex-col items-center text-slate-800">
                  <Box size={80} strokeWidth={1} className="opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6 opacity-20">Production Standby</p>
               </div>
             )}

             {isGenerating && (
                 <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <Loader2 className="animate-spin text-cyan-500 mb-6" size={48} />
                    <p className="text-sm font-black italic tracking-[0.3em] text-white uppercase animate-pulse">KLİNİK KARELER OLUŞTURULUYOR</p>
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
