import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Exercise } from '../types.ts';

interface Props {
  exercise: Partial<Exercise>;
  primaryColor?: string;
}

const Tag: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [delay, delay + 8], [6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span style={{
      opacity, transform: `translateY(${y}px)`, display: 'inline-block',
      background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)',
      borderRadius: 6, padding: '2px 10px', fontSize: 14, color: '#67e8f9',
      marginRight: 8, marginBottom: 8,
    }}>
      {label}
    </span>
  );
};

export const ExerciseCardComposition: React.FC<Props> = ({ exercise, primaryColor = '#06b6d4' }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const barProgress = spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 80 } });
  const difficulty = (exercise.difficulty ?? 5) / 10;

  const titleY = interpolate(frame, [0, 20], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const statsOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const statsY = interpolate(frame, [25, 40], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outroOpacity = interpolate(frame, [durationInFrames - 20, durationInFrames - 5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowIntensity = 0.4 + 0.2 * Math.sin(frame / 10);

  const muscles = [...(exercise.primaryMuscles ?? []).slice(0, 3), ...(exercise.secondaryMuscles ?? []).slice(0, 2)];
  const stats = [
    { label: 'SET', value: exercise.sets ?? '–' },
    { label: 'TEKRAR', value: exercise.reps ?? '–' },
    { label: 'TEMPO', value: exercise.tempo ?? '–' },
    { label: 'DİNLENME', value: exercise.restPeriod ? `${exercise.restPeriod}s` : '–' },
  ];

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #0c1a2e 100%)', fontFamily: "'Inter', 'Segoe UI', sans-serif", opacity: outroOpacity }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: -120, left: -120, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(6,182,212,${glowIntensity * 0.3}) 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${primaryColor}, #818cf8)` }} />

      {/* Category badge */}
      <div style={{ position: 'absolute', top: 40, left: 60, opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 2, color: primaryColor, textTransform: 'uppercase' }}>
        {exercise.category ?? 'Egzersiz'}
      </div>

      {/* Phase badge */}
      <div style={{ position: 'absolute', top: 40, right: 60, opacity: interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#818cf8', textTransform: 'uppercase' }}>
        {exercise.rehabPhase ?? 'Rehabilitasyon'}
      </div>

      {/* Main content */}
      <div style={{ position: 'absolute', top: 100, left: 60, right: 60, bottom: 60 }}>
        {/* Title */}
        <div style={{ fontSize: 52, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1, marginBottom: 12, opacity: titleOpacity, transform: `translateY(${titleY}px)`, letterSpacing: -1 }}>
          {exercise.titleTr || exercise.title || 'Egzersiz'}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.6, marginBottom: 32, maxWidth: 700, opacity: subOpacity }}>
          {exercise.description ? exercise.description.substring(0, 120) + (exercise.description.length > 120 ? '…' : '') : 'Fiziksel rehabilitasyon egzersizi'}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32, opacity: statsOpacity, transform: `translateY(${statsY}px)` }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: 12, padding: '16px 24px', textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Difficulty bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase', opacity: interpolate(frame, [38, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            Zorluk Seviyesi — {exercise.difficulty ?? 5}/10
          </div>
          <div style={{ height: 6, background: '#1e293b', borderRadius: 3, width: 340, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(barProgress, 1) * difficulty * 100}%`, background: `linear-gradient(90deg, ${primaryColor}, #818cf8)`, borderRadius: 3, boxShadow: `0 0 10px ${primaryColor}` }} />
          </div>
        </div>

        {/* Muscle tags */}
        {muscles.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase', opacity: interpolate(frame, [45, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              Hedef Kaslar
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {muscles.map((m, i) => <Tag key={m} label={m} delay={55 + i * 6} />)}
            </div>
          </div>
        )}

        {/* Code */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: 11, color: '#334155', fontFamily: 'monospace', opacity: interpolate(frame, [60, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          {exercise.code ? `# ${exercise.code}` : ''}
        </div>
      </div>

      {/* Bottom logo strip */}
      <div style={{ position: 'absolute', bottom: 20, right: 60, fontSize: 13, fontWeight: 900, fontStyle: 'italic', color: '#334155', letterSpacing: 1, opacity: interpolate(frame, [55, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        PHYSIOCORE <span style={{ color: primaryColor }}>AI</span>
      </div>
    </AbsoluteFill>
  );
};
