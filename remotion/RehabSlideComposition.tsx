import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Series,
} from 'remotion';
import { Exercise } from '../types.ts';

interface Slide {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  phase: 'Başlangıç' | 'Hareket' | 'Zirve' | 'Geri Dönüş' | 'Dinlenme';
}

interface Props {
  exercise: Partial<Exercise>;
  slides?: Slide[];
}

const PHASE_COLORS: Record<Slide['phase'], string> = {
  'Başlangıç': '#06b6d4',
  'Hareket': '#22d3ee',
  'Zirve': '#f472b6',
  'Geri Dönüş': '#a78bfa',
  'Dinlenme': '#34d399',
};

const ProgressBar: React.FC<{ current: number; total: number; color: string }> = ({ current, total, color }) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ height: 5, flex: 1, borderRadius: 3, background: i < current ? color : 'rgba(51,65,85,0.6)', boxShadow: i < current ? `0 0 6px ${color}` : 'none' }} />
    ))}
  </div>
);

const SlideFrame: React.FC<{ slide: Slide; totalSlides: number; framesPerSlide: number }> = ({ slide, totalSlides, framesPerSlide }) => {
  const frame = useCurrentFrame();
  const entryProgress = spring({ frame, fps: 30, config: { damping: 20, stiffness: 120 } });
  const opacity = interpolate(entryProgress, [0, 1], [0, 1]);
  const y = interpolate(entryProgress, [0, 1], [30, 0]);
  const textOpacity = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tipOpacity = interpolate(frame, [22, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outroOpacity = interpolate(frame, [framesPerSlide - 12, framesPerSlide - 3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const color = PHASE_COLORS[slide.phase];

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', fontFamily: "'Inter', 'Segoe UI', sans-serif", opacity: outroOpacity }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${color}, #818cf8)` }} />
      <div style={{ position: 'absolute', top: 32, left: 60, right: 60 }}>
        <ProgressBar current={slide.stepNumber} total={totalSlides} color={color} />
      </div>
      <div style={{ position: 'absolute', top: 60, left: 60, background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 20, padding: '4px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 2, color, textTransform: 'uppercase', opacity }}>
        {slide.phase}
      </div>
      <div style={{ position: 'absolute', top: 52, right: 60, fontSize: 64, fontWeight: 900, color: 'rgba(51,65,85,0.6)', lineHeight: 1, fontStyle: 'italic', opacity }}>
        {String(slide.stepNumber).padStart(2, '0')}
      </div>
      <div style={{ position: 'absolute', top: 130, left: 60, right: 60, opacity, transform: `translateY(${y}px)` }}>
        <div style={{ fontSize: 46, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1, marginBottom: 24, letterSpacing: -0.5 }}>{slide.title}</div>
        <div style={{ fontSize: 20, color: '#94a3b8', lineHeight: 1.7, marginBottom: 32, maxWidth: 760, opacity: textOpacity }}>{slide.instruction}</div>
        {slide.tip && (
          <div style={{ opacity: tipOpacity, background: `${color}12`, border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: '12px 20px', maxWidth: 680 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color, textTransform: 'uppercase', marginBottom: 4 }}>💡 Klinik İpucu</div>
            <div style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.5 }}>{slide.tip}</div>
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 28, right: 60, fontSize: 12, fontWeight: 900, fontStyle: 'italic', color: '#334155' }}>
        PHYSIOCORE <span style={{ color }}>AI</span>
      </div>
    </AbsoluteFill>
  );
};

const DEFAULT_SLIDES: Slide[] = [
  { stepNumber: 1, phase: 'Başlangıç', title: 'Başlangıç Pozisyonu', instruction: 'Dik durun veya belirtilen başlangıç pozisyonunu alın. Omuzlarınızı geri çekin, nefes alın.', tip: 'Lumbar lordoz korunmalı. Core kasları hafifçe aktif tutun.' },
  { stepNumber: 2, phase: 'Hareket', title: 'Konsantrik Faz', instruction: 'Kontrollü biçimde hareketi başlatın. Hedef eklem açısına doğru ilerleyin.', tip: '3 saniyede hareketin zirvesine ulaşın. Nefes verin.' },
  { stepNumber: 3, phase: 'Zirve', title: 'Zirve Kasılma', instruction: 'Maksimum kasılma noktasında 1-2 saniye tutun. Kas gerilimini hissettirin.', tip: 'Bu noktada nefes tutmayın. Eklem hiperekstansiyonundan kaçının.' },
  { stepNumber: 4, phase: 'Geri Dönüş', title: 'Eksantrik Faz', instruction: 'Başlangıç pozisyonuna kontrollü ve yavaş dönün. Yerçekimine karşı direnç sağlayın.', tip: 'Eksantrik faz en az 3 saniye sürmeli. Kasın uzamasını hissedin.' },
  { stepNumber: 5, phase: 'Dinlenme', title: 'Dinlenme & Tekrar', instruction: 'Nefes alın ve sonraki tekrar için hazırlanın. Ağrı hissederseniz egzersizi durdurun.', tip: 'Tekrarlar arası 1-2 saniye dinlenme uygulayın.' },
];

const IntroSlide: React.FC<{ exercise: Partial<Exercise>; totalSteps: number }> = ({ exercise, totalSteps }) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [5, 25], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', fontFamily: "'Inter', 'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #06b6d4, #818cf8)' }} />
      <div style={{ textAlign: 'center', opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: '#475569', textTransform: 'uppercase', marginBottom: 16 }}>Egzersiz Protokolü · {totalSteps} Adım</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>{exercise.titleTr || exercise.title || 'Rehabilitasyon Egzersizi'}</div>
        <div style={{ fontSize: 20, color: '#64748b' }}>{exercise.category} · {exercise.rehabPhase}</div>
      </div>
    </AbsoluteFill>
  );
};

const OutroSlide: React.FC<{ exercise: Partial<Exercise> }> = ({ exercise }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', fontFamily: "'Inter', 'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #06b6d4, #818cf8)' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>✓ Protokol Tamamlandı</div>
        <div style={{ fontSize: 16, color: '#64748b' }}>{exercise.sets} set × {exercise.reps} tekrar · {exercise.tempo} tempo</div>
        <div style={{ fontSize: 13, fontWeight: 900, fontStyle: 'italic', color: '#334155', marginTop: 28, letterSpacing: 1 }}>PHYSIOCORE <span style={{ color: '#06b6d4' }}>AI</span></div>
      </div>
    </AbsoluteFill>
  );
};

export const RehabSlideComposition: React.FC<Props> = ({ exercise, slides }) => {
  const effectiveSlides = slides ?? DEFAULT_SLIDES;
  const framesPerSlide = 75;

  return (
    <Series>
      <Series.Sequence durationInFrames={60}>
        <IntroSlide exercise={exercise} totalSteps={effectiveSlides.length} />
      </Series.Sequence>
      {effectiveSlides.map((slide) => (
        <Series.Sequence key={slide.stepNumber} durationInFrames={framesPerSlide}>
          <SlideFrame slide={slide} totalSlides={effectiveSlides.length} framesPerSlide={framesPerSlide} />
        </Series.Sequence>
      ))}
      <Series.Sequence durationInFrames={60}>
        <OutroSlide exercise={exercise} />
      </Series.Sequence>
    </Series>
  );
};
