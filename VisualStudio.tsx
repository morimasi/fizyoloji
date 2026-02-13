
import React, { useState, useEffect } from 'react';
import { 
  Image, Sparkles, Wand2, Box, Camera, Loader2, 
  Check, Film, Layers, PlayCircle, Zap, Video,
  Search, Activity, Aperture, Sun, Maximize,
  Repeat, GalleryHorizontalEnd, Scan
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
  const [animationMode, setAnimationMode] = useState<'static' | 'pulse' | 'pan' | 'scan'>('static');

  // Stiller güncellendi: Animasyon odaklı seçenekler eklendi
  const styles = [
    { id: 'Medical-Vector', icon: PlayCircle, label: 'Vector Flow', desc: 'Anatomik Akış', anim: 'pulse' },
    { id: 'X-Ray-Lottie', icon: Scan, label: 'X-Ray Sim', desc: 'Eklem Analizi', anim: 'scan' },
    { id: 'Cinematic-GIF', icon: Repeat, label: 'Animasyon GIF', desc: 'Sonsuz Döngü', anim: 'pan' },
    { id: 'Clinical-Slide', icon: GalleryHorizontalEnd, label: 'Sıralı Slayt', desc: 'Adım Adım', anim: 'static' }
  ];

  useEffect(() => {
    // Seçilen stile göre otomatik animasyon modunu ayarla
    const style = styles.find(s => s.id === selectedStyle);
    if (style) setAnimationMode(style.anim as any);
  }, [selectedStyle]);

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
        // Motion bayrağını true yaparak sistemin bunu "Video/Animasyon" gibi algılamasını sağla
        onVisualGenerated(url, selectedStyle, true); 
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
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Canlı <span className="text-cyan-400">Medya</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sıfır Maliyetli Animasyon Motoru</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Film size={12} /> Animasyon Formatı
            </p>
            <div className="grid grid-cols-2 gap-4">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all relative overflow-hidden group ${selectedStyle === style.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  <style.icon size={24} className={`relative z-10 ${selectedStyle === style.id ? 'animate-pulse' : ''}`} />
                  <div className="text-left relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest">{style.label}</p>
                    <p className="text-[8px] font-medium opacity-50 uppercase">{style.desc}</p>
                  </div>
                  {/* Active Glow Effect */}
                  {selectedStyle === style.id && <div className="absolute inset-0 bg-cyan-400/5 blur-xl" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-12">
            <button 
              onClick={handleSearchLibrary}
              className="w-full bg-slate-950 border border-slate-800 text-slate-500 hover:text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <Search size={16} /> ARŞİV TARAMASI
            </button>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !exercise.title}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 relative overflow-hidden"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span className="animate-pulse">RENDER ALINIYOR...</span>
                </>
              ) : (
                <>
                  <Zap size={20} fill="currentColor" />
                  CANLI İÇERİK ÜRET
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="xl:col-span-7">
        <div className="relative aspect-video w-full bg-slate-950 rounded-[4rem] border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl group">
          
          {/* Background Grid for technical feel */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          {previewUrl ? (
             <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* DYNAMIC ANIMATION LAYER */}
                <img 
                  src={previewUrl} 
                  className={`
                    w-full h-full object-contain transition-all duration-1000
                    ${animationMode === 'pulse' ? 'animate-[pulse_3s_ease-in-out_infinite] scale-105' : ''}
                    ${animationMode === 'pan' ? 'animate-[ping_8s_ease-in-out_infinite_reverse] scale-110' : ''}
                    ${animationMode === 'scan' ? 'opacity-80 saturate-150 contrast-125' : ''}
                  `} 
                />
                
                {/* SCANNER OVERLAY FOR X-RAY MODE */}
                {animationMode === 'scan' && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[20%] w-full animate-[bounce_4s_infinite]" />
                )}

                {/* CINEMATIC GRAIN OVERLAY */}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.05%22/%3E%3C/svg%3E")' }} />

                {/* STATUS BADGE */}
                <div className="absolute bottom-6 left-6 px-3 py-1 bg-slate-950/80 backdrop-blur border border-cyan-500/30 rounded-full flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-black text-white uppercase tracking-widest">
                     {selectedStyle === 'Cinematic-GIF' ? 'GIF LOOP ACTIVE' : 'LIVE RENDER'}
                   </span>
                </div>
             </div>
          ) : (
             <div className="text-center space-y-4 relative z-10">
               <div className="w-24 h-24 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 flex items-center justify-center mx-auto text-slate-700 animate-pulse">
                  <Film size={40} />
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Önizleme Sahnesi Boş</p>
                  <p className="text-[10px] text-slate-600 mt-1">Stüdyo motorunu başlatmak için bir stil seçin.</p>
               </div>
             </div>
          )}
          
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-20 space-y-6">
               <div className="relative">
                 <div className="w-20 h-20 border-4 border-slate-800 rounded-full" />
                 <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin" />
                 <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" fill="currentColor" />
               </div>
               <div className="text-center">
                  <p className="text-xs font-black text-white uppercase tracking-widest">Yapay Zeka Çiziyor</p>
                  <p className="text-[9px] text-cyan-500 font-mono mt-1">"{selectedStyle}" Modeli İşleniyor...</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
