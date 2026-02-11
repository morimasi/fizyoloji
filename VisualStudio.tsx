
import React, { useState } from 'react';
import { 
  Image, Sparkles, Wand2, Box, Camera, Loader2, 
  Check, Film, Layers, PlayCircle, Lock, Zap, Video
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseVideo } from './ai-service.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>(exercise.visualStyle || 'Cinematic-Motion');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [isMotion, setIsMotion] = useState(exercise.isMotion ?? true);

  const styles = [
    { id: 'Cinematic-Motion', icon: PlayCircle, label: 'Motion Video', desc: 'Ultra Akışkan (Varsayılan)', isMotion: true },
    { id: '4K-Render', icon: Box, label: '4K Animasyon', desc: 'Gerçekçi 3D Akış', isMotion: true },
    { id: 'X-Ray', icon: Sparkles, label: 'X-Ray Motion', desc: 'Akışkan Eklem Analizi', isMotion: true },
    { id: 'Anatomic', icon: Wand2, label: 'Anatomik Flow', desc: 'Kas Lifleri Hareketi', isMotion: true },
    { id: 'Schematic', icon: Image, label: 'Statik Çizim', desc: 'Teknik Görsel', isMotion: false }
  ];

  const handleGenerate = async () => {
    if (!exercise.title) return;
    setIsGenerating(true);

    try {
      const currentStyle = styles.find(s => s.id === selectedStyle);
      const shouldBeMotion = currentStyle?.isMotion ?? true;

      if (shouldBeMotion) {
        // Veo API Key Check
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
        
        // High Quality Cinematic Video
        const url = await generateExerciseVideo(exercise, selectedStyle);
        if (url) {
          setPreviewUrl(url);
          setIsMotion(true);
          onVisualGenerated(url, selectedStyle, true);
        }
      } else {
        // Simple Image
        const url = await generateExerciseVisual(exercise, selectedStyle);
        if (url) {
          setPreviewUrl(url);
          setIsMotion(false);
          onVisualGenerated(url, selectedStyle, false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900/40 rounded-[3rem] p-10 border border-slate-800 space-y-10">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Video size={24} />
          </div>
          <div>
            <h4 className="font-inter font-black text-2xl uppercase italic tracking-tighter">Cinema <span className="text-cyan-400 text-glow">Motion</span></h4>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Gerçekçi Animasyon Film Teknolojisi</p>
          </div>
        </div>
        <div className="flex gap-2">
           <span className="text-[10px] font-mono text-cyan-400 border border-cyan-400/20 px-3 py-1 rounded-full bg-cyan-500/5 uppercase tracking-widest font-black flex items-center gap-2"><Zap size={10} /> VEO 3.1 HIGH-RES</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {styles.map(style => (
          <button
            key={style.id}
            onClick={() => setSelectedStyle(style.id)}
            className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group relative ${selectedStyle === style.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/5' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-600'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedStyle === style.id ? 'bg-cyan-500 text-white' : 'bg-slate-900 text-slate-600 group-hover:text-slate-400'}`}>
               <style.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{style.label}</p>
              <p className="text-[8px] font-mono opacity-50 uppercase tracking-tighter">{style.desc}</p>
            </div>
            {style.isMotion && <Zap size={10} className="absolute top-3 right-3 text-cyan-500/40" />}
          </button>
        ))}
      </div>

      <div className="relative aspect-video w-full max-w-[700px] mx-auto bg-slate-950 rounded-[3rem] border border-slate-800 flex items-center justify-center overflow-hidden group shadow-2xl">
        {previewUrl ? (
          <>
            {isMotion ? (
              <video 
                src={previewUrl} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover animate-in fade-in duration-1000" 
              />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
              <button onClick={handleGenerate} className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2">
                <Sparkles size={16} /> YÜKSEK KALİTE YENİLE
              </button>
            </div>
            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-mono text-white/70 uppercase tracking-widest">Cinema Mode Active</span>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6 p-12">
            {isGenerating ? (
              <div className="space-y-6">
                <div className="relative">
                  <Loader2 size={72} className="mx-auto text-cyan-400 animate-spin" />
                  <PlayCircle size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] font-mono text-cyan-400 uppercase font-black tracking-[0.4em] animate-pulse">SİNEMATİK RENDER...</p>
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest max-w-[200px] mx-auto">Gerçekçi hareket algoritmaları ve gölge detayları işleniyor.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] mx-auto flex items-center justify-center border border-slate-800 text-slate-700">
                   <PlayCircle size={40} />
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase text-slate-400 tracking-widest italic">Animasuon Filmi Hazır Değil</h5>
                  <p className="text-[10px] text-slate-600 max-w-[250px] mx-auto">"Akışkan ve gerçekçi bir video animasyonu üretmek için aşağıdaki butona tıklayın."</p>
                </div>
                <button 
                  onClick={handleGenerate}
                  className="bg-cyan-500 text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-2xl shadow-cyan-500/40 flex items-center gap-3 mx-auto"
                >
                  <Zap size={18} fill="currentColor" /> AKIŞKAN ANİMASYON ÜRET
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
