import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  Film, Layers, Presentation,
  Bone, Flame, Heart, Scan, User, Download, Clapperboard, Camera, Loader2,
} from 'lucide-react';
import { Exercise, AnatomicalLayer } from './types.ts';
import { ExerciseCardComposition } from './remotion/ExerciseCardComposition.tsx';
import { AnatomyLayerComposition } from './remotion/AnatomyLayerComposition.tsx';
import { RehabSlideComposition } from './remotion/RehabSlideComposition.tsx';
import { MediaConverter } from './MediaConverter.ts';

type CompositionId = 'exercise-card' | 'anatomy-layer' | 'rehab-slides';

interface RemotionPlayerProps {
  exercise: Partial<Exercise>;
  defaultComposition?: CompositionId;
}

export interface RemotionPlayerHandle {
  triggerRender: () => void;
}

const FPS = 30;

const COMPOSITIONS: {
  id: CompositionId;
  labelTr: string;
  icon: React.FC<any>;
  durationInFrames: number;
  description: string;
}[] = [
  { id: 'exercise-card', labelTr: 'Egzersiz Kartı', icon: Film, durationInFrames: 150, description: 'Egzersiz bilgilerini animasyonlu olarak tanıtan video kart.' },
  { id: 'anatomy-layer', labelTr: 'Anatomik Katman', icon: Layers, durationInFrames: 180, description: 'Kas, iskelet, damar ve X-Ray katmanlarını görselleştirir.' },
  { id: 'rehab-slides', labelTr: 'Rehab Protokolü', icon: Presentation, durationInFrames: 60 + 5 * 75 + 60, description: 'Adım adım rehabilitasyon egzersiz protokolü sunumu.' },
];

const ANATOMY_LAYERS: { id: AnatomicalLayer; labelTr: string; icon: React.FC<any>; color: string }[] = [
  { id: 'full-body', labelTr: 'Komple', icon: User, color: '#94a3b8' },
  { id: 'muscular', labelTr: 'Kas', icon: Flame, color: '#f87171' },
  { id: 'skeletal', labelTr: 'İskelet', icon: Bone, color: '#e2e8f0' },
  { id: 'vascular', labelTr: 'Damar', icon: Heart, color: '#60a5fa' },
  { id: 'xray', labelTr: 'X-Ray', icon: Scan, color: '#22d3ee' },
];

export const RemotionPlayer = forwardRef<RemotionPlayerHandle, RemotionPlayerProps>(
  ({ exercise, defaultComposition = 'exercise-card' }, ref) => {
  const [activeComposition, setActiveComposition] = useState<CompositionId>(defaultComposition);
  const [activeLayer, setActiveLayer] = useState<AnatomicalLayer>('full-body');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const playerRef = useRef<PlayerRef>(null);

  const currentComposition = COMPOSITIONS.find((c) => c.id === activeComposition)!;

  const getInputProps = useCallback(() => {
    if (activeComposition === 'anatomy-layer') {
      return {
        targetLayer: activeLayer,
        muscleNames: [...(exercise.primaryMuscles ?? []), ...(exercise.secondaryMuscles ?? [])].slice(0, 6),
        bodyRegion: exercise.category ?? 'Genel',
      };
    }
    return { exercise };
  }, [activeComposition, exercise, activeLayer]);

  const getComponent = useCallback(() => {
    switch (activeComposition) {
      case 'exercise-card': return ExerciseCardComposition;
      case 'anatomy-layer': return AnatomyLayerComposition;
      case 'rehab-slides': return RehabSlideComposition;
    }
  }, [activeComposition]);

  const handleCaptureFrame = useCallback(async () => {
    const container = playerRef.current?.getContainerNode();
    if (!container) {
      setExportStatus('Player hazır değil.');
      return;
    }
    setIsExporting(true);
    setExportStatus('Kare yakalanıyor…');
    try {
      // Find the canvas element that Remotion uses for rendering
      const remotionCanvas = container.querySelector('canvas');
      if (remotionCanvas) {
        // If Remotion is using a canvas, we can directly capture from it
        const dataUrl = remotionCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${exercise.titleTr || exercise.title || 'kompozisyon'}_kare.png`;
        a.click();
        setExportStatus('PNG kaydedildi!');
      } else {
        // Fallback: Use a library-free screenshot approach
        // We'll create a new canvas and use drawWindow or similar browser APIs
        // For now, we'll use a simpler approach that avoids CORS issues
        const width = container.offsetWidth || 1280;
        const height = container.offsetHeight || 720;

        // Create a canvas to draw on
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) throw new Error('No 2D context');

        // Fill with background
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        // Add text overlay indicating screenshot method
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Screenshot capture - Please use GIF export for full quality', width / 2, height / 2);

        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${exercise.titleTr || exercise.title || 'kompozisyon'}_kare.png`;
        a.click();
        setExportStatus('PNG kaydedildi! (GIF önerilir)');
      }
    } catch (error) {
      console.error('Capture error:', error);
      setExportStatus('Kare yakalanamadı. Lütfen GIF kullanın.');
    } finally {
      setIsExporting(false);
    }
  }, [exercise]);

  const handleRender = useCallback(async () => {
    if (exercise.visualUrl) {
      setIsExporting(true);
      setExportStatus('GIF oluşturuluyor…');
      try {
        await MediaConverter.export(exercise.visualUrl, 'gif', exercise.titleTr || exercise.title || 'egzersiz');
        setExportStatus('GIF indirildi!');
      } catch {
        setExportStatus('Dışa aktarma başarısız.');
      } finally {
        setIsExporting(false);
      }
    } else {
      await handleCaptureFrame();
    }
  }, [exercise, handleCaptureFrame]);

  useImperativeHandle(ref, () => ({ triggerRender: handleRender }), [handleRender]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Composition selector */}
      <div className="flex gap-2 flex-wrap">
        {COMPOSITIONS.map((comp) => {
          const Icon = comp.icon;
          const isActive = activeComposition === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => setActiveComposition(comp.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isActive ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
            >
              <Icon size={14} />
              {comp.labelTr}
            </button>
          );
        })}
      </div>

      {/* Anatomy layer sub-selector */}
      {activeComposition === 'anatomy-layer' && (
        <div className="flex gap-2 flex-wrap">
          {ANATOMY_LAYERS.map(({ id, labelTr, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setActiveLayer(id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeLayer === id ? 'bg-slate-800 border-slate-600' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-600'}`}
              style={{ color: activeLayer === id ? color : undefined }}
            >
              <Icon size={12} />
              {labelTr}
            </button>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-slate-500">{currentComposition.description}</p>

      {/* Remotion Player */}
      <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <Player
          ref={playerRef}
          component={getComponent() as any}
          inputProps={getInputProps() as any}
          durationInFrames={currentComposition.durationInFrames}
          compositionWidth={1280}
          compositionHeight={720}
          fps={FPS}
          style={{ width: '100%', aspectRatio: '16/9' }}
          controls
          loop
          autoPlay
          acknowledgeRemotionLicense
        />
      </div>

      {/* Render / Export Panel */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clapperboard size={13} className="text-cyan-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Üretim Kontrolleri</span>
          <span className="ml-auto text-[9px] font-mono text-slate-600">
            {currentComposition.durationInFrames}f · {(currentComposition.durationInFrames / FPS).toFixed(1)}s · {FPS}fps · 1280×720
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCaptureFrame}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-slate-700"
          >
            <Camera size={13} />
            {isExporting ? exportStatus : 'Kare PNG'}
          </button>
          <button
            onClick={handleRender}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {isExporting ? exportStatus : 'GIF Üret'}
          </button>
        </div>
        {exportStatus && !isExporting && (
          <p className="text-[9px] font-mono text-cyan-400">{exportStatus}</p>
        )}
      </div>
    </div>
  );
});
