
import React, { useState } from 'react';
import { 
  Image, Sparkles, Wand2, Box, Camera, Loader2, 
  Check, Film, Layers, PlayCircle, Zap, Video,
  Settings, Key, ShieldCheck, DatabaseZap, Search
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseVideo } from './ai-service.ts';
import { ExerciseActions } from './ExerciseActions.tsx';
import { PhysioDB } from './db-repository.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>(exercise.visualStyle || 'Cinematic-Motion');
  const [directorialNote, setDirectorialNote] = useState('');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [isMotion, setIsMotion] = useState(exercise.isMotion ?? true);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [isSearchingLibrary, setIsSearchingLibrary] = useState(false);

  const styles = [
    { id: 'Cinematic-Motion', icon: PlayCircle, label: 'Cinema Flow', desc: 'Ultra Akışkan', isMotion: true },
    { id: '4K-Render', icon: Box, label: '4K Master', desc: 'Gerçekçi 3D', isMotion: true },
    { id: 'X-Ray', icon: Sparkles, label: 'X-Ray Dynamic', desc: 'Eklem Analizi', isMotion: true },
    { id: 'Schematic', icon: Image, label: 'Technical', desc: 'Teknik Görsel', isMotion: false }
  ];

  /**
   * MALİYET SAVUNMASI: Önce kütüphaneyi tara
   */
  const handleSearchLibrary = async () => {
    setIsSearchingLibrary(true);
    const library = await PhysioDB.getExercises();
    // Benzer isimli bir egzersiz bul
    const found = library.find(ex => 
      (ex.videoUrl || ex.visualUrl) && 
      (ex.title.toLowerCase().includes(exercise.title?.toLowerCase() || '') || 
       ex.titleTr?.toLowerCase().includes(exercise.titleTr?.toLowerCase() || ''))
    );

    setTimeout(() => {
      if (found) {
        const url = found.videoUrl || found.visualUrl || '';
        setPreviewUrl(url);
        setIsMotion(!!found.videoUrl);
        onVisualGenerated(url, found.visualStyle || 'Cinematic-Motion', !!found.videoUrl);
      } else {
        alert("Kütüphanede uygun eşleşme bulunamadı. AI Üretimi gerekiyor.");
      }
      setIsSearchingLibrary(false);
    }, 800);
  };

  const handleGenerate = async () => {
    if (!exercise.title) return;
    const currentStyle = styles.find(s => s.id === selectedStyle);
    const shouldBeMotion = currentStyle?.isMotion ?? true;

    if (shouldBeMotion) {
      const aistudio = (window as any).aistudio;
      if (aistudio && !(await aistudio.hasSelectedApiKey())) {
        setShowKeyPrompt(true);
        return;
      }
    }

    setIsGenerating(true);
    try {
      if (shouldBeMotion) {
        const url = await generateExerciseVideo(exercise, selectedStyle);
        if (url) {
          setPreviewUrl(url);
          setIsMotion(true);
          onVisualGenerated(url, selectedStyle, true);
        }
      } else {
        const url = await generateExerciseVisual(exercise, selectedStyle);
        if (url) {
          setPreviewUrl(url);
          setIsMotion(false);
          onVisualGenerated(url, selectedStyle, false);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative">
      {showKeyPrompt && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] max-w-lg w-full text-center space-y-8 shadow-2xl">
              <Key size={40} className="mx-auto text-cyan-400" />
              <div className="space-y-4">
                 <h3 className="text-2xl font-black italic text-white uppercase">Yetkilendirme Gerekli</h3>
                 <p className="text-xs text-slate-500 italic">Video üretimi için ücretli API anahtarı gereklidir.</p>
              </div>
              <button onClick={() => (window as any).aistudio.openSelectKey().then(() => setShowKeyPrompt(false))} className="w-full bg-cyan-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest">ANAHTAR SEÇ</button>
           </div>
        </div>
      )}

      <div className="xl:col-span-5 space-y-8 bg-slate-900/40 rounded-[3rem] p-10 border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Settings size={24} className="text-cyan-400" />
            <h4 className="font-inter font-black text-2xl uppercase italic">Cinema <span className="text-cyan-400">Studio</span></h4>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
             <DatabaseZap size={12} className="text-emerald-400" />
             <span className="text-[8px] font-black text-emerald-400 uppercase">Cost Saver Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {styles.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedStyle === style.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}
            >
              <style.icon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{style.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleSearchLibrary}
            disabled={isSearchingLibrary || isGenerating}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            {isSearchingLibrary ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            KÜTÜPHANEDE ARA (ÜCRETSİZ)
          </button>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !exercise.title}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
            AI İLE ÜRET (MİN. MALİYET)
          </button>
        </div>
      </div>

      <div className="xl:col-span-7">
        <div className="relative aspect-video w-full bg-slate-950 rounded-[3rem] border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl">
          {previewUrl ? (
            isMotion ? (
              <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )
          ) : (
             <div className="text-center p-20 opacity-30">
               {isGenerating ? <Loader2 className="animate-spin mx-auto mb-4" size={48} /> : <Film size={48} className="mx-auto mb-4" />}
               <p className="text-xs font-black uppercase tracking-widest italic">Render Bekleniyor</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
