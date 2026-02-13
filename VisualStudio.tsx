
import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, Sparkles, Wand2, Box, Camera, Loader2, 
  Check, Film, Layers, PlayCircle, Zap, Video,
  Search, Activity, Aperture, Sun, Maximize,
  Repeat, GalleryHorizontalEnd, Scan, Play, Pause,
  FastForward, Rewind, Eye, Clapperboard, Download,
  MonitorPlay, FileVideo, FileImage, XCircle, Terminal
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual } from './ai-service.ts';
import { PhysioDB } from './db-repository.ts';
import { ExerciseActions } from './ExerciseActions.tsx';
import { MediaConverter, ExportFormat } from './MediaConverter.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean, frameCount?: number, layout?: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('Medical-Vector');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [isMotionActive, setIsMotionActive] = useState(false); 
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0); 
  
  // NEW: Director's Prompt
  const [customPrompt, setCustomPrompt] = useState('');
  
  // NEW: Export Preview Logic
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewFormat, setPreviewFormat] = useState<ExportFormat | null>(null);
  const [isProcessingExport, setIsProcessingExport] = useState(false);

  // Initialize Prompt with Description if empty
  useEffect(() => {
    if (!customPrompt && exercise.description) {
      setCustomPrompt(`Perform: ${exercise.description.substring(0, 150)}...`);
    }
  }, [exercise.description]);

  // STANDARDIZE GRID: 4x6 (24 Frames)
  const frameCount = exercise.visualFrameCount || 24; 
  const layout = exercise.visualLayout || 'grid-4x6'; 
  const cols = layout === 'grid-4x6' ? 6 : frameCount; 
  const rows = layout === 'grid-4x6' ? 4 : 1;

  // CINEMATIC LOOP ENGINE (Ping-Pong)
  useEffect(() => {
    let interval: any;
    const baseFps = 15; 
    const frameDuration = (1000 / baseFps) / playbackSpeed; 
    let direction = 1;

    if (isMotionActive && previewUrl) {
      interval = setInterval(() => {
        setCurrentFrame(prev => {
          let next = prev + direction;
          if (next >= frameCount - 1) {
            direction = -1;
            next = frameCount - 1;
          } else if (next <= 0) {
            direction = 1;
            next = 0;
          }
          return next;
        });
      }, frameDuration);
    } else {
      setCurrentFrame(0); 
    }
    return () => clearInterval(interval);
  }, [isMotionActive, previewUrl, playbackSpeed, frameCount]);

  const styles = [
    { id: 'Medical-Vector', icon: PlayCircle, label: 'Vector Flow', desc: 'Anatomik Vektör', isSprite: true },
    { id: 'X-Ray-Lottie', icon: Scan, label: 'X-Ray Ghost', desc: 'İskelet Analizi', isSprite: true },
    { id: 'Cinematic-GIF', icon: Repeat, label: 'Canlı Foto', desc: 'Gerçekçi Döngü', isSprite: true },
    { id: 'Clinical-Slide', icon: GalleryHorizontalEnd, label: 'Klinik Slayt', desc: 'Statik Diyagram', isSprite: false }
  ];

  const handleGenerate = async () => {
    if (!exercise.title) return;
    setIsGenerating(true);
    setIsMotionActive(false);
    try {
      // Pass custom prompt to AI
      const result = await generateExerciseVisual(exercise, selectedStyle, customPrompt);
      if (result.url) {
        setPreviewUrl(result.url);
        const styleObj = styles.find(s => s.id === selectedStyle);
        
        onVisualGenerated(
            result.url, 
            selectedStyle, 
            styleObj?.isSprite, 
            result.frameCount,
            result.layout
        ); 
        
        if (styleObj?.isSprite) setIsMotionActive(true); 
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrepareExport = async (format: ExportFormat) => {
    if (!previewUrl) return;
    setIsProcessingExport(true);
    setPreviewFormat(format);
    setPreviewBlob(null); // Clear previous

    try {
        const blob = await MediaConverter.generateBlob(previewUrl, format);
        setPreviewBlob(blob);
    } catch (err) {
        console.error("Export Prep Failed", err);
        setPreviewFormat(null);
    } finally {
        setIsProcessingExport(false);
    }
  };

  const handleDownload = () => {
      if (previewBlob && previewFormat) {
          const ext = previewFormat === 'webm' ? 'webm' : 'jpg';
          const url = URL.createObjectURL(previewBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `PhysioCore_${exercise.code}_${Date.now()}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setPreviewFormat(null); // Close modal
      }
  };

  const isSpriteMode = styles.find(s => s.id === selectedStyle)?.isSprite;

  // --- PROJECTOR ENGINE CALCULATION (Grid View Fix) ---
  const getBackgroundStyles = () => {
      if (!isSpriteMode || layout !== 'grid-4x6') {
          return {
              backgroundImage: `url(${previewUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
          };
      }
      const bgSizeX = cols * 100; 
      const bgSizeY = rows * 100;
      const colIndex = currentFrame % cols;
      const rowIndex = Math.floor(currentFrame / cols);
      const xPos = cols > 1 ? (colIndex / (cols - 1)) * 100 : 0;
      const yPos = rows > 1 ? (rowIndex / (rows - 1)) * 100 : 0;

      return {
          backgroundImage: `url(${previewUrl})`,
          backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
          backgroundPosition: `${xPos}% ${yPos}%`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto' as const
      };
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative pb-20 animate-in fade-in duration-500">
      {/* LEFT: DIRECTOR'S CONSOLE */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-slate-900/40 rounded-[3rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-6">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-inner">
              <Clapperboard size={24} />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Genesis <span className="text-cyan-400">Director</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">AI Scene Configurator</p>
            </div>
          </div>

          {/* Director Prompt Input */}
          <div className="space-y-3 mb-6 relative z-10">
             <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> Ek Yönetmen Komutları (Prompt)
             </label>
             <div className="relative">
                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 h-32 outline-none focus:border-cyan-500/50 resize-none shadow-inner"
                  placeholder="Örn: Kamera açısını biraz yukarıdan al. Kas aktivasyonunu daha parlak göster."
                />
                <div className="absolute bottom-3 right-3 text-[8px] font-bold text-slate-600 uppercase bg-slate-900 px-2 py-1 rounded">
                   AI Directive Active
                </div>
             </div>
          </div>

          {/* Render Mode Select */}
          <div className="space-y-3 relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Film size={12} /> Render Motoru
            </p>
            <div className="grid grid-cols-2 gap-3">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex flex-col gap-2 p-4 rounded-2xl border transition-all text-left ${selectedStyle === style.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                >
                  <div className="flex justify-between w-full items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest">{style.label}</span>
                     {style.isSprite && <Zap size={10} className={selectedStyle === style.id ? 'text-cyan-400' : 'text-slate-600'} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Action */}
          <div className="mt-8 relative z-10">
             <button 
              onClick={handleGenerate}
              disabled={isGenerating || !exercise.title}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="animate-pulse">STÜDYO İŞLENİYOR...</span>
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  SAHNEYİ OLUŞTUR
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: STUDIO MONITOR (THEATER) */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* The Screen */}
        <div className="relative w-full aspect-video bg-black rounded-[3rem] border-4 border-slate-800 flex flex-col overflow-hidden shadow-2xl group ring-1 ring-slate-700/50">
          
          {/* Monitor Gloss */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-20" />

          {/* Viewport */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
             {previewUrl ? (
                // MASKED CONTAINER
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                   {isSpriteMode ? (
                      <div className="w-full h-full" style={getBackgroundStyles()} />
                   ) : (
                      <img src={previewUrl} className="w-full h-full object-contain" />
                   )}
                </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                  <MonitorPlay size={64} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-50">Sinyal Yok</p>
               </div>
             )}

             {/* REC Indicator */}
             {isMotionActive && (
               <div className="absolute top-8 right-8 flex items-center gap-2 z-30 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE</span>
               </div>
             )}
          </div>

          {/* Control Deck */}
          <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center px-6 gap-6 z-30">
             <button 
              onClick={() => setIsMotionActive(!isMotionActive)}
              disabled={!previewUrl}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-all active:scale-90 border border-slate-700"
             >
                {isMotionActive ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
             </button>

             <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-cyan-500 relative w-full animate-pulse" />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                   <span>00:00</span>
                   <span>{(currentFrame / 24).toFixed(2)}s</span>
                   <span>03:00</span>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <ExportBtn icon={FileVideo} label="WEBM" onClick={() => handlePrepareExport('webm')} />
                <ExportBtn icon={FileImage} label="JPG" onClick={() => handlePrepareExport('jpg')} />
             </div>
          </div>
        </div>

        {/* Detailed Download HUD */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 border border-slate-800">
                  <Download size={20} />
               </div>
               <div>
                  <h5 className="text-xs font-bold text-white uppercase">Stüdyo Çıktısı</h5>
                  <p className="text-[9px] text-slate-500 font-mono">1080x1080 • 24FPS • High Bitrate</p>
               </div>
            </div>
            <div className="flex gap-4 text-[9px] text-slate-500 font-mono text-right">
                <div>
                   <span className="block font-bold text-slate-300">BOYUT</span>
                   ~2.4 MB
                </div>
                <div>
                   <span className="block font-bold text-slate-300">CODEC</span>
                   VP9/Opus
                </div>
            </div>
        </div>
      </div>

      {/* EXPORT PREVIEW MODAL */}
      {previewFormat && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in zoom-in-95 duration-300">
           <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Check size={16} className="text-emerald-500" /> Render Hazır
                 </h3>
                 <button onClick={() => setPreviewFormat(null)} className="text-slate-500 hover:text-white"><XCircle size={20} /></button>
              </div>
              
              <div className="p-10 bg-black flex items-center justify-center min-h-[300px]">
                 {isProcessingExport ? (
                    <div className="text-center space-y-4">
                       <Loader2 size={48} className="animate-spin text-cyan-500 mx-auto" />
                       <p className="text-xs font-bold text-white uppercase tracking-widest animate-pulse">Encoding {previewFormat}...</p>
                    </div>
                 ) : previewBlob ? (
                    previewFormat === 'webm' ? (
                        <video 
                           src={URL.createObjectURL(previewBlob)} 
                           controls 
                           autoPlay 
                           loop 
                           className="max-h-[300px] rounded-xl border border-slate-800 shadow-2xl"
                        />
                    ) : (
                        <img 
                           src={URL.createObjectURL(previewBlob)} 
                           className="max-h-[300px] rounded-xl border border-slate-800 shadow-2xl"
                        />
                    )
                 ) : (
                    <div className="text-rose-500 font-bold text-xs uppercase">Hata Oluştu</div>
                 )}
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end gap-4">
                 <button onClick={() => setPreviewFormat(null)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-900">Vazgeç</button>
                 <button 
                   onClick={handleDownload}
                   disabled={!previewBlob}
                   className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                 >
                    Cihaza Kaydet
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ExportBtn = ({ icon: Icon, label, onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-400 transition-all active:scale-95"
    >
       <Icon size={12} />
       <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
);
