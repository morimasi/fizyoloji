
import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, Sparkles, Wand2, Box, Camera, Loader2, 
  Check, Film, Layers, PlayCircle, Zap, Video,
  Search, Activity, Aperture, Sun, Maximize,
  Repeat, GalleryHorizontalEnd, Scan, Play, Pause,
  FastForward, Rewind, Eye
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual } from './ai-service.ts';
import { PhysioDB } from './db-repository.ts';
import { ExerciseActions } from './ExerciseActions.tsx';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('Medical-Vector');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [isMotionActive, setIsMotionActive] = useState(false); // Playback state
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0); // 0 = Start (Left), 1 = End (Right)

  // Animasyon döngüsü (Sprite Engine)
  useEffect(() => {
    let interval: any;
    if (isMotionActive && previewUrl) {
      interval = setInterval(() => {
        setCurrentFrame(prev => (prev === 0 ? 1 : 0));
      }, 1000 / playbackSpeed); // Hız kontrolü
    } else {
      setCurrentFrame(0); // Durdurunca başa dön
    }
    return () => clearInterval(interval);
  }, [isMotionActive, previewUrl, playbackSpeed]);

  const styles = [
    { id: 'Medical-Vector', icon: PlayCircle, label: 'Vector Flow', desc: 'Anatomik Hareket', isSprite: true },
    { id: 'X-Ray-Lottie', icon: Scan, label: 'X-Ray Sim', desc: 'İskelet Analizi', isSprite: true },
    { id: 'Cinematic-GIF', icon: Repeat, label: 'Canlı GIF', desc: 'Gerçekçi Döngü', isSprite: true },
    { id: 'Clinical-Slide', icon: GalleryHorizontalEnd, label: 'Klinik Slayt', desc: 'Statik Anlatım', isSprite: false }
  ];

  const handleGenerate = async () => {
    if (!exercise.title) return;
    setIsGenerating(true);
    setIsMotionActive(false);
    try {
      const url = await generateExerciseVisual(exercise, selectedStyle);
      if (url) {
        setPreviewUrl(url);
        const styleObj = styles.find(s => s.id === selectedStyle);
        // Sprite modundaysa Motion olarak işaretle
        onVisualGenerated(url, selectedStyle, styleObj?.isSprite); 
        if (styleObj?.isSprite) setIsMotionActive(true); // Otomatik başlat
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearchLibrary = async () => {
    const library = await PhysioDB.getExercises();
    const found = library.find(ex => ex.title?.toLowerCase().includes(exercise.title?.toLowerCase() || ''));
    if (found?.visualUrl) {
       setPreviewUrl(found.visualUrl);
       onVisualGenerated(found.visualUrl, found.visualStyle || 'Library', found.isMotion);
    } else {
       alert("Kütüphanede görsel bulunamadı.");
    }
  };

  const isSpriteMode = styles.find(s => s.id === selectedStyle)?.isSprite;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative pb-20 animate-in fade-in duration-500">
      {/* CONTROL PANEL */}
      <div className="xl:col-span-5 space-y-8">
        <div className="bg-slate-900/40 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-8 relative z-10">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-inner">
              <Aperture size={24} />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Genesis <span className="text-cyan-400">Studio</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sprite Animation Engine v2.0</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Film size={12} /> Render Modu
            </p>
            <div className="grid grid-cols-2 gap-3">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex flex-col gap-3 p-5 rounded-3xl border transition-all relative overflow-hidden group text-left ${selectedStyle === style.id ? 'bg-slate-950 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10' : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                >
                  <div className="flex justify-between w-full">
                     <style.icon size={20} className={`${selectedStyle === style.id ? 'animate-pulse' : ''}`} />
                     {style.isSprite && <span className="text-[8px] font-black bg-slate-800 px-2 py-0.5 rounded text-emerald-400">HAREKETLİ</span>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{style.label}</p>
                    <p className="text-[8px] font-medium opacity-50 uppercase mt-0.5">{style.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-10 relative z-10">
             <button 
              onClick={handleGenerate}
              disabled={isGenerating || !exercise.title}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
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
            <button 
              onClick={handleSearchLibrary}
              className="w-full bg-slate-950 border border-slate-800 text-slate-500 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <Search size={14} /> ARŞİV KONTROLÜ
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW PLAYER (ULTRA VIEW) */}
      <div className="xl:col-span-7">
        <div className="relative w-full aspect-video bg-slate-950 rounded-[3rem] border border-slate-800 flex flex-col overflow-hidden shadow-2xl group">
          
          {/* Main Viewport */}
          <div className="flex-1 relative overflow-hidden bg-[url('https://assets.codepen.io/1462889/grid.png')] bg-[length:40px_40px] bg-slate-900">
             {previewUrl ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   {/* 
                      SPRITE LOGIC:
                      Resim aslında çok geniş (Örn: 2000x1000). Sol taraf Başlangıç, Sağ taraf Bitiş.
                      Biz container'da sadece yarısını gösteriyoruz.
                      'currentFrame' 0 ise sola, 1 ise sağa kaydırıyoruz.
                   */}
                   {isSpriteMode ? (
                      <div className="relative w-full h-full overflow-hidden">
                         <img 
                           src={previewUrl} 
                           className="absolute h-full max-w-none object-cover transition-transform duration-300 ease-in-out"
                           style={{ 
                             width: '200%', // Genişlik 2 katı çünkü 2 kare var
                             left: currentFrame === 0 ? '0%' : '-100%' // Kaydırma işlemi
                           }}
                         />
                         
                         {/* Motion Blur Ghosting Effect for Smoothness */}
                         <img 
                           src={previewUrl} 
                           className="absolute h-full max-w-none object-cover opacity-20 blur-md pointer-events-none mix-blend-screen"
                           style={{ 
                             width: '200%',
                             left: currentFrame === 0 ? '-100%' : '0%' // Tam tersi kareyi silik göster
                           }}
                         />

                         {/* Frame Indicator */}
                         <div className="absolute top-6 left-6 flex gap-1">
                            <div className={`w-2 h-2 rounded-full ${currentFrame === 0 ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-slate-700'}`} />
                            <div className={`w-2 h-2 rounded-full ${currentFrame === 1 ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-slate-700'}`} />
                         </div>
                      </div>
                   ) : (
                      <img src={previewUrl} className="w-full h-full object-contain p-4" />
                   )}
                </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 opacity-50">
                  <Film size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sahne Boş</p>
               </div>
             )}

             {/* Recording Overlay */}
             {isMotionActive && (
               <div className="absolute top-6 right-6 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_red]" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">REC</span>
               </div>
             )}
          </div>

          {/* Timeline / Controls Bar */}
          <div className="h-24 bg-slate-950 border-t border-slate-800 p-4 flex items-center gap-6 z-20">
             <button 
              onClick={() => setIsMotionActive(!isMotionActive)}
              disabled={!previewUrl}
              className="w-14 h-14 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 transition-all active:scale-95"
             >
                {isMotionActive ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor" className="ml-1"/>}
             </button>

             <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   <span>Hız Kontrolü</span>
                   <span>{playbackSpeed}x</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                   {[0.5, 1, 1.5, 2].map(speed => (
                     <button 
                       key={speed} 
                       onClick={() => setPlaybackSpeed(speed)}
                       className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${playbackSpeed === speed ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:text-slate-400'}`}
                     >
                       {speed}x
                     </button>
                   ))}
                </div>
             </div>
             
             <div className="w-[1px] h-10 bg-slate-800" />
             
             <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentFrame(0)} 
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white" title="Başlangıç Pozisyonu"
                >
                  <Rewind size={18} />
                </button>
                <button 
                  onClick={() => setCurrentFrame(1)}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white" title="Bitiş Pozisyonu"
                >
                  <FastForward size={18} />
                </button>
             </div>

             <div className="w-[1px] h-10 bg-slate-800" />

             {/* DOWNLOAD MODULE: Canlı olarak oluşturulan içeriği buraya aktarıyoruz */}
             {previewUrl && (
                 <ExerciseActions 
                    exercise={{ 
                        ...exercise, 
                        visualUrl: previewUrl, 
                        id: 'draft', 
                        code: 'DRAFT',
                        title: exercise.title || 'Untitled',
                        category: exercise.category || 'General',
                        difficulty: 5,
                        sets: 3,
                        reps: 10,
                        description: '',
                        biomechanics: '',
                        safetyFlags: []
                    } as Exercise} 
                    variant="player" 
                 />
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
