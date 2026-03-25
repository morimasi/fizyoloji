import React, { useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import {
  Film, Layers, Presentation,
  Bone, Flame, Heart, Scan, User, Download,
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

export const RemotionPlayer: React.FC<RemotionPlayerProps> = ({ exercise, defaultComposition = 'exercise-card' }) => {
  const [activeComposition, setActiveComposition] = useState<CompositionId>(defaultComposition);
  const [activeLayer, setActiveLayer] = useState<AnatomicalLayer>('full-body');
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportGif = async () => {
    if (!exercise.visualUrl) return;
    setIsExporting(true);
    try {
      await MediaConverter.export(exercise.visualUrl, 'gif', exercise.titleTr || exercise.title || 'egzersiz');
    } finally {
      setIsExporting(false);
    }
  };

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
          component={getComponent() as any}
          inputProps={getInputProps() as any}
          durationInFrames={currentComposition.durationInFrames}
          compositionWidth={1280}
          compositionHeight={720}
          fps={FPS}
          style={{ width: '100%', aspectRatio: '16/9' }}
          controls
          loop
          autoPlayOnScroll
        />
      </div>

      {/* Footer strip */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono text-slate-600">
          {currentComposition.durationInFrames} kare · {(currentComposition.durationInFrames / FPS).toFixed(1)}s · {FPS}fps · 1280×720 HD
        </span>
        {exercise.visualUrl && (
          <button
            onClick={handleExportGif}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-50"
          >
            <Download size={12} />
            {isExporting ? 'Dönüştürülüyor…' : 'GIF Dışa Aktar'}
          </button>
        )}
      </div>
    </div>
  );
};
