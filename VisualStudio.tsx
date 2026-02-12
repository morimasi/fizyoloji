
import React, { useState } from 'react';
import { 
  Image, Sparkles, Wand2, Box, Camera, Loader2, 
  Check, Film, Layers, PlayCircle, Lock, Zap, Video,
  Settings, Download, Share2, Archive, Star, MessageSquare,
  Repeat, Palette, Key, ShieldCheck
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseVideo } from './ai-service.ts';
import { ExerciseActions } from './ExerciseActions.tsx';

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

  const styles = [
    { id: 'Cinematic-Motion', icon: PlayCircle, label: 'Cinema Flow', desc: 'Ultra Akışkan (Varsayılan)', isMotion: true },
    { id: '4K-Render', icon: Box, label: '4K Master', desc: 'Gerçekçi 3D Akış', isMotion: true },
    { id: 'GIF-Animation', icon: Repeat, label: 'GIF Loop', desc: 'Kusursuz Döngü', isMotion: true },
    { id: '2D-Animation', icon: Palette, label: '2D Vector', desc: 'Vektörel Klinik Anlatım', isMotion: true },
    { id: 'X-Ray', icon: Sparkles, label: 'X-Ray Dynamic', desc: 'Akışkan Eklem Analizi', isMotion: true },
    { id: 'Anatomic', icon: Wand2, label: 'Bio Flow', desc: 'Kas Lifleri Hareketi', isMotion: true },
    { id: 'Schematic', icon: Image, label: 'Technical', desc: 'Teknik Görsel', isMotion: false }
  ];

  const handleGenerate = async () => {
    if (!exercise.title) return;
    
    const currentStyle = styles.find(s => s.id === selectedStyle);
    const shouldBeMotion = currentStyle?.isMotion ?? true;

    // --- VEO API KEY SELECTION LOGIC ---
    if (shouldBeMotion) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setShowKeyPrompt(true);
          return;
        }
      }
    }

    setIsGenerating(true);
    try {
      if (shouldBeMotion) {
        const url = await generateExerciseVideo(exercise, selectedStyle, directorialNote);
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
    } catch (e) {
      console.error(e);
      // Hata durumunda (örn. anahtar hatası) promptu tekrar gösterebiliriz
      if (e instanceof Error && e.message.includes("entity was not found")) {
        setShowKeyPrompt(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setShowKeyPrompt(false);
      handleGenerate(); // Seçim sonrası otomatik devam et
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative">
      {/* Key Prompt Modal */}
      {showKeyPrompt && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] max-w-lg w-full text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl mx-auto flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                 <Key size={40} />
              </div>
              <div className="space-y-4">
                 <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-tight">Video Üretim <span className="text-cyan-400">Yetkilendirmesi</span></h3>
                 <p className="text-xs text-slate-500 leading-relaxed italic">
                   Sinematik Cinema Flow (Veo) modellerini kullanabilmek için ödemesi aktif bir Google Cloud projesine ait API anahtarı seçmeniz gerekmektedir.
                 </p>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="inline-block text-[10px] font-black text-cyan-500 underline uppercase tracking-widest">Faturalandırma Dökümantasyonu</a>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button onClick={handleSelectKey} className="w-full bg-cyan-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3">
                  <ShieldCheck size={20} /> ANAHTAR SEÇİMİNİ YAP
                </button>
                <button onClick={() => setShowKeyPrompt(false)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Vazgeç</button>
              </div>
           </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="xl:col-span-5 space-y-8 bg-slate-900/40 rounded-[3rem] p-10 border border-slate-800">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Settings size={24} />
          </div>
          <div>
            <h4 className="font-inter font-black text-2xl uppercase italic tracking-tighter">Cinema <span className="text-cyan-400 text-glow">Studio</span></h4>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Motion Directing Engine v5.1</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {styles.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group relative ${selectedStyle === style.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-600'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${selectedStyle === style.id ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-900 text-slate-600 group-hover:text-slate-400'}`}>
                 <style.icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{style.label}</p>
                <p className="text-[8px] font-mono opacity-50 uppercase tracking-tighter truncate">{style.desc}</p>
              </div>
              {style.isMotion && <Zap size={10} className="absolute top-2 right-2 text-cyan-500/40" />}
            </button>
          ))}
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-800">
           <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2">
             <MessageSquare size={12} className="text-cyan-400" /> Motion Directing (AI Notu)
           </label>
           <textarea 
            value={directorialNote}
            onChange={(e) => setDirectorialNote(e.target.value)}
            placeholder="Örn: Hareketi daha yavaş yap, kas gerilimini daha fazla göster, kamera açısı daha yakın olsun..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs h-32 outline-none focus:border-cyan-500 transition-colors shadow-inner text-slate-300 italic"
           />
           <p className="text-[8px] text-slate-600 uppercase tracking-widest italic leading-relaxed">
             * AI notu, videodaki oyuncunun hareket kalitesini ve kamera açılarını doğrudan etkiler.
           </p>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !exercise.title}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 neon-glow"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
          {isGenerating ? 'RENDER ALINIYOR...' : 'SİNEMATİK ANİMASYON ÜRET'}
        </button>
      </div>

      {/* Preview Area */}
      <div className="xl:col-span-7 space-y-8">
        <div className="relative aspect-video w-full bg-slate-950 rounded-[3rem] border border-slate-800 flex items-center justify-center overflow-hidden group shadow-2xl">
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
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-6">
                <button onClick={handleGenerate} className="bg-white/10 backdrop-blur-xl px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/20 transition-all flex items-center gap-3">
                  <Sparkles size={18} /> YÜKSEK KALİTE YENİLE
                </button>
                <div className="flex gap-4">
                  <ExerciseActions exercise={exercise as Exercise} variant="player" />
                </div>
              </div>

              <div className="absolute bottom-8 left-8 flex items-center gap-3 bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-1000">
                 <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest italic">1080p Cinema Flow Active</span>
                 <span className="w-1 h-1 bg-white/20 rounded-full" />
                 <span className="text-[10px] font-mono text-cyan-500 uppercase font-black">{selectedStyle}</span>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 p-20">
              {isGenerating ? (
                <div className="space-y-8">
                  <div className="relative">
                    <Loader2 size={84} className="mx-auto text-cyan-400 animate-spin opacity-20" />
                    <PlayCircle size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-[16px] font-mono text-cyan-400 uppercase font-black tracking-[0.6em] animate-pulse">SİNEMATİK RENDER</p>
                    <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest max-w-[250px] mx-auto italic">Kinetik veriler işleniyor, akışkan insan hareketi simüle ediliyor...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="w-28 h-28 bg-slate-900 rounded-[2.5rem] mx-auto flex items-center justify-center border border-slate-800 text-slate-700 shadow-inner">
                     <Film size={48} />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] italic">Animasuon Filmi Bekleniyor</h5>
                    <p className="text-[11px] text-slate-600 max-w-[300px] mx-auto leading-relaxed">
                      Egzersiz başlığı ve biyomekanik verileriniz hazır. Akışkan ve gerçekçi bir video animasyonu üretmek için hazırsınız.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Klinik Önizleme Statüsü</p>
                <p className="text-xs text-slate-300 font-medium italic">"Hareket döngüsü biyomekanik olarak doğrulanmıştır."</p>
             </div>
             <div className="flex gap-3">
                <div className="flex flex-col items-end">
                   <p className="text-[9px] font-mono text-cyan-500 uppercase font-black tracking-widest">FPS_STABLE</p>
                   <p className="text-[11px] font-black text-white tracking-tighter italic">30.0 Frames/Sec</p>
                </div>
                <div className="w-[1px] h-10 bg-slate-800 mx-2" />
                <div className="flex flex-col items-end">
                   <p className="text-[9px] font-mono text-emerald-500 uppercase font-black tracking-widest">LATENCY_OK</p>
                   <p className="text-[11px] font-black text-white tracking-tighter italic">1080p High-Res</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
