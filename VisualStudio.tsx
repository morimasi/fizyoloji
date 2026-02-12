import React, { useState } from 'react';
import { 
  Image, Sparkles, Wand2, Box, Camera, Loader2, 
  Check, Film, Layers, PlayCircle, Zap, Video,
  Settings, Key, ShieldCheck, DatabaseZap, Search,
  Activity, Wind, Cpu, Eye, Aperture, Sun, Maximize,
  Droplets, Scissors
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseVideo } from './ai-service.ts';
import { PhysioDB } from './db-repository.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>(exercise.visualStyle || 'Cinematic-Motion');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [isMotion, setIsMotion] = useState(exercise.isMotion ?? true);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [isSearchingLibrary, setIsSearchingLibrary] = useState(false);

  // Reji Kontrolü (Director's Cut)
  const [directorial, setDirectorial] = useState({
    camera: 'Sagittal View',
    lighting: 'Soft Clinical',
    focus: 'Deep Tissue',
    speed: '1x (Real-time)'
  });

  const styles = [
    { id: 'Cinematic-Motion', icon: PlayCircle, label: 'Cinema Flow', desc: 'Sinematik Akış', isMotion: true },
    { id: '4K-Render', icon: Box, label: '4K Master', desc: 'Gerçekçi 3D', isMotion: true },
    { id: 'X-Ray', icon: Sparkles, label: 'X-Ray Dynamic', desc: 'Eklem Analizi', isMotion: true },
    { id: 'Muscular-System', icon: Activity, label: 'Kas Sistemi', desc: 'Myology Focus', isMotion: true },
    { id: 'Vascular-System', icon: Droplets, label: 'Damar Yapısı', desc: 'Angiology Flow', isMotion: true },
    { id: 'Skeletal-System', icon: Scissors, label: 'Kemik Yapısı', desc: 'Osteology Deep', isMotion: true },
    { id: 'Schematic', icon: Image, label: 'Technical', desc: 'Teknik Çizim', isMotion: false }
  ];

  const handleSearchLibrary = async () => {
    setIsSearchingLibrary(true);
    const library = await PhysioDB.getExercises();
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
        const url = await generateExerciseVideo(exercise, selectedStyle, directorial);
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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative pb-20">
      {showKeyPrompt && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] max-w-lg w-full text-center space-y-8 shadow-2xl">
              <Key size={48} className="mx-auto text-cyan-400" />
              <div className="space-y-4">
                 <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Yetkilendirme <span className="text-cyan-400">Gerekli</span></h3>
                 <p className="text-sm text-slate-500 italic">Anatomik video üretimi yüksek işlem gücü (GPU) gerektirdiği için lütfen kendi API anahtarınızı seçin.</p>
              </div>
              <button onClick={() => (window as any).aistudio.openSelectKey().then(() => setShowKeyPrompt(false))} className="w-full bg-cyan-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 active:scale-95 transition-all">ANAHTAR SEÇİMİNE GİT</button>
           </div>
        </div>
      )}

      {/* Kontrol Paneli */}
      <div className="xl:col-span-5 space-y-8">
        <div className="bg-slate-900/40 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                <Video size={20} />
              </div>
              <h4 className="font-inter font-black text-2xl uppercase italic tracking-tighter">Klinik <span className="text-cyan-400">Reji</span></h4>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={14} className="text-cyan-500" /> Görsel Katman Seçimi
            </h5>
            <div className="grid grid-cols-2 gap-4">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all relative overflow-hidden group ${selectedStyle === style.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-xl' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  <style.icon size={20} className={selectedStyle === style.id ? 'animate-pulse' : ''} />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest">{style.label}</p>
                    <p className="text-[8px] font-medium opacity-50 uppercase tracking-tighter">{style.desc}</p>
                  </div>
                  {selectedStyle === style.id && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-500 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Director's Cut Controls */}
            <div className="mt-10 pt-10 border-t border-slate-800 space-y-8">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Aperture size={14} className="text-cyan-500" /> Director's Cut Ayarları
              </h5>
              
              <div className="grid grid-cols-2 gap-6">
                 <DirectorControl 
                  icon={Camera} 
                  label="Kamera Açısı" 
                  value={directorial.camera}
                  options={['Sagittal View', 'Frontal View', 'Transverse', 'Bird-Eye', 'Isometric']}
                  onChange={(v) => setDirectorial({...directorial, camera: v})}
                 />
                 <DirectorControl 
                  icon={Sun} 
                  label="Aydınlatma" 
                  value={directorial.lighting}
                  options={['Soft Clinical', 'High Contrast', 'Neon Highlight', 'Shadow-Free', 'Cinematic Noir']}
                  onChange={(v) => setDirectorial({...directorial, lighting: v})}
                 />
                 <DirectorControl 
                  icon={Maximize} 
                  label="Odak Derinliği" 
                  value={directorial.focus}
                  options={['Deep Tissue', 'Joint Only', 'Surface Muscle', 'Full Skeleton', 'Fascial Chains']}
                  onChange={(v) => setDirectorial({...directorial, focus: v})}
                 />
                 <DirectorControl 
                  icon={Activity} 
                  label="Simülasyon Hızı" 
                  value={directorial.speed}
                  options={['0.25x (Extreme Slow)', '0.5x (Detailed)', '1x (Real-time)', '2x (Fast)']}
                  onChange={(v) => setDirectorial({...directorial, speed: v})}
                 />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-12">
            <button 
              onClick={handleSearchLibrary}
              disabled={isSearchingLibrary || isGenerating}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-inner"
            >
              {isSearchingLibrary ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
              BENZER KLİNİK KAYITLARI ARA
            </button>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !exercise.title}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
              {isGenerating ? 'RENDER ALINIYOR...' : 'SİNEMATİK ÜRETİMİ BAŞLAT'}
            </button>
          </div>
        </div>
      </div>

      {/* Önizleme Alanı */}
      <div className="xl:col-span-7 sticky top-32">
        <div className="relative aspect-video w-full bg-slate-950 rounded-[4rem] border border-slate-800 flex items-center justify-center overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent" />
          
          {previewUrl ? (
            isMotion ? (
              <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-cover animate-in fade-in duration-1000" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover animate-in fade-in duration-1000" />
            )
          ) : (
             <div className="text-center p-20 space-y-6 relative z-10">
               {isGenerating ? (
                 <div className="relative">
                    <Loader2 className="animate-spin mx-auto text-cyan-500" size={64} />
                    <div className="absolute inset-0 blur-xl bg-cyan-500/20 animate-pulse rounded-full" />
                 </div>
               ) : (
                 <div className="w-24 h-24 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-center mx-auto text-slate-700 shadow-inner">
                    <Film size={40} />
                 </div>
               )}
               <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 italic">
                    {isGenerating ? 'Biyomekanik Motor İşleniyor...' : 'Video Kaynağı Bekleniyor'}
                  </p>
                  <p className="text-[10px] text-slate-700 font-mono uppercase tracking-widest">
                    {isGenerating ? 'Neon Cinema Engine v4.0 Active' : 'Director\'s Input Required'}
                  </p>
               </div>
             </div>
          )}

          {/* Video Metadata Overlay */}
          {previewUrl && (
            <div className="absolute top-10 left-10 flex flex-col gap-2">
               <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-widest">PRO-REC 1080P</span>
               </div>
               <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{selectedStyle.replace('-', ' ')}</span>
               </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
           <div className="flex items-center gap-8 px-10 py-5 bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[2rem] shadow-2xl">
              <MetadataItem label="F-STOP" value="f/2.8" />
              <div className="w-[1px] h-6 bg-slate-800" />
              <MetadataItem label="ISO" value="800" />
              <div className="w-[1px] h-6 bg-slate-800" />
              <MetadataItem label="BIT" value="10-bit HDR" />
              <div className="w-[1px] h-6 bg-slate-800" />
              <MetadataItem label="ENGINE" value="VE-O v3.1" />
           </div>
        </div>
      </div>
    </div>
  );
};

const DirectorControl = ({ icon: Icon, label, value, options, onChange }: any) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon size={12} className="text-cyan-500" /> {label}
    </label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-bold text-slate-300 outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer"
    >
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const MetadataItem = ({ label, value }: any) => (
  <div className="flex flex-col items-center">
     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
     <span className="text-[11px] font-mono font-black text-white">{value}</span>
  </div>
);
