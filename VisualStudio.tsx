
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
  onVisualGenerated: (url: string, style: string, isMotion?: boolean, frameCount?: number, layout?: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('Medical-Vector');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [isMotionActive, setIsMotionActive] = useState(false); 
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0); 
  
  // Varsayılan Frame Yapısı
  const frameCount = exercise.visualFrameCount || 24; 
  const layout = exercise.visualLayout || 'grid-4x6'; 

  // GRID MATRIX ENGINE (4x6 Standart)
  const cols = layout === 'grid-4x6' ? 6 : frameCount; 
  const rows = layout === 'grid-4x6' ? 4 : 1;

  // FLUID LOOP ENGINE (Ping-Pong)
  useEffect(() => {
    let interval: any;
    const baseFps = 12; // Daha sinematik ve ağır çekim hissi için 12-15 FPS idealdir
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
      const result = await generateExerciseVisual(exercise, selectedStyle);
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

  const isSpriteMode = styles.find(s => s.id === selectedStyle)?.isSprite;

  // --- CINEMATIC VIEWPORT CALCULATION ---
  const getBackgroundStyles = () => {
      if (!isSpriteMode || layout !== 'grid-4x6') {
          return {
              backgroundImage: `url(${previewUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
          };
      }

      // Grid Logic: 
      // Image is 600% width of the container (because 6 cols)
      // Image is 400% height of the container (because 4 rows)
      const bgSizeX = cols * 100; 
      const bgSizeY = rows * 100;

      // Position Calculation:
      // X% = (currentCol / (TotalCols - 1)) * 100
      const colIndex = currentFrame % cols;
      const rowIndex = Math.floor(currentFrame / cols);
      
      const xPos = cols > 1 ? (colIndex / (cols - 1)) * 100 : 0;
      const yPos = rows > 1 ? (rowIndex / (rows - 1)) * 100 : 0;

      return {
          backgroundImage: `url(${previewUrl})`,
          backgroundSize: `${bgSizeX}% ${bgSizeY}%`, // Zoom in to show only 1 cell
          backgroundPosition: `${xPos}% ${yPos}%`,   // Shift to correct cell
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto' as const
      };
  };

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
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cinematic Motion Engine</p>
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
                     {style.isSprite && <span className="text-[8px] font-black bg-slate-800 px-2 py-0.5 rounded text-emerald-400">VIDEO</span>}
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
                  <span className="animate-pulse">SİNEMATİK RENDER...</span>
                </>
              ) : (
                <>
                  <Zap size={20} fill="currentColor" />
                  CANLI FİLM ÜRET
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PREVIEW PLAYER (THEATER MODE) */}
      <div className="xl:col-span-7">
        <div className="relative w-full aspect-video bg-slate-950 rounded-[3rem] border border-slate-800 flex flex-col overflow-hidden shadow-2xl group">
          
          <div className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center">
             {previewUrl ? (
                // THEATER CONTAINER
                // aspect-ratio of single frame (roughly 1:1 or 4:3) must be preserved or handled.
                // We use a fixed height container and 'contain' logic for the frame.
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
                   {isSpriteMode ? (
                      <div 
                        className="w-full h-full"
                        style={getBackgroundStyles()}
                      />
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

             {isMotionActive && (
               <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_red]" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">CANLI AKIŞ</span>
               </div>
             )}
          </div>

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
                   <span>Sinematik Hız</span>
                   <span>{playbackSpeed}x</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                   {[0.5, 0.75, 1, 1.5].map(speed => (
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
             
             <ExerciseActions 
                exercise={{ 
                    ...exercise, 
                    visualUrl: previewUrl, 
                    visualFrameCount: frameCount, 
                    visualLayout: layout,
                    id: 'draft' 
                } as Exercise} 
                variant="player" 
             />
          </div>
        </div>
      </div>
    </div>
  );
};
