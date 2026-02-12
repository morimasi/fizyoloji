
import React, { useState } from 'react';
import { 
  Image, Sparkles, Wand2, Box, Camera, Loader2, 
  Check, Film, Layers, PlayCircle, Zap, Video,
  Search, Activity, Aperture, Sun, Maximize
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual } from './ai-service.ts';
import { PhysioDB } from './db-repository.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('Medical-Vector');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');

  const styles = [
    { id: 'Medical-Vector', icon: PlayCircle, label: 'Vector Flow', desc: 'Anatomik Vektör' },
    { id: 'X-Ray-Lottie', icon: Sparkles, label: 'X-Ray Sim', desc: 'Eklem Analizi' },
    { id: 'Muscle-Draft', icon: Activity, label: 'Kas Taslağı', desc: 'Miyoloji Odaklı' },
    { id: 'Technical-Drawing', icon: Image, label: 'Technical', desc: 'Klinik Çizim' }
  ];

  const handleSearchLibrary = async () => {
    const library = await PhysioDB.getExercises();
    const found = library.find(ex => 
      (ex.videoUrl || ex.visualUrl) && 
      ex.title.toLowerCase().includes(exercise.title?.toLowerCase() || '')
    );
    if (found) {
      const url = found.videoUrl || found.visualUrl || '';
      setPreviewUrl(url);
      onVisualGenerated(url, 'Library-Match', !!found.videoUrl);
    } else {
      alert("Kütüphanede uygun taslak yok. AI Üretimi başlatılıyor...");
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!exercise.title) return;
    setIsGenerating(true);
    try {
      const url = await generateExerciseVisual(exercise, selectedStyle);
      if (url) {
        setPreviewUrl(url);
        onVisualGenerated(url, selectedStyle, false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative pb-20">
      <div className="xl:col-span-5 space-y-8">
        <div className="bg-slate-900/40 rounded-[3rem] p-10 border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-8">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
              <Aperture size={20} />
            </div>
            <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Görsel <span className="text-cyan-400">Motoru</span></h4>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Görsel Stil Seçimi</p>
            <div className="grid grid-cols-2 gap-4">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${selectedStyle === style.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  <style.icon size={20} />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest">{style.label}</p>
                    <p className="text-[8px] font-medium opacity-50 uppercase">{style.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-12">
            <button 
              onClick={handleSearchLibrary}
              className="w-full bg-slate-950 border border-slate-800 text-slate-500 hover:text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <Search size={16} /> KÜTÜPHANE TARAMASI
            </button>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !exercise.title}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
              {isGenerating ? 'İŞLENİYOR...' : 'VEKTÖREL GÖRSEL ÜRET'}
            </button>
          </div>
        </div>
      </div>

      <div className="xl:col-span-7">
        <div className="relative aspect-video w-full bg-slate-950 rounded-[4rem] border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
          {previewUrl ? (
             <img src={previewUrl} className="w-full h-full object-contain animate-in fade-in duration-1000" />
          ) : (
             <div className="text-center space-y-4">
               <div className="w-20 h-20 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-center mx-auto text-slate-700">
                  <Image size={40} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Önizleme Bekleniyor</p>
             </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
               <Loader2 className="animate-spin text-cyan-500" size={48} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
