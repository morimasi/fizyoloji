import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { AnatomicalLayer } from '../types.ts';

interface LayerConfig {
  id: AnatomicalLayer;
  labelTr: string;
  color: string;
  glowColor: string;
  description: string;
}

const LAYER_CONFIGS: LayerConfig[] = [
  { id: 'full-body', labelTr: 'Komple Beden', color: '#94a3b8', glowColor: 'rgba(148,163,184,0.4)', description: 'Bütünsel vücut görünümü – deri, yağ dokusu ve yüzeysel yapılar.' },
  { id: 'muscular', labelTr: 'Kas Sistemi', color: '#f87171', glowColor: 'rgba(248,113,113,0.4)', description: 'Aktif kaslar neon kırmızı ile vurgulanır. İskelet kas lif grupları ve tendonlar görünür.' },
  { id: 'skeletal', labelTr: 'İskelet Sistemi', color: '#e2e8f0', glowColor: 'rgba(226,232,240,0.4)', description: 'Kemik yapısı, eklem yüzeyleri ve kıkırdak dokular klinik osteoloji görünümüyle.' },
  { id: 'vascular', labelTr: 'Damar Sistemi', color: '#60a5fa', glowColor: 'rgba(96,165,250,0.4)', description: 'Arterler (kırmızı) ve venler (mavi) anjiyografi görünümüyle, kan akışı canlandırılır.' },
  { id: 'xray', labelTr: 'X-Ray Görünüm', color: '#22d3ee', glowColor: 'rgba(34,211,238,0.4)', description: 'Yüksek kontrast radyografi modu. Kemik yoğunluğu ve eklem aralıkları belirgin.' },
];

interface Props {
  targetLayer?: AnatomicalLayer;
  muscleNames?: string[];
  bodyRegion?: string;
}

const LayerCard: React.FC<{ config: LayerConfig; isActive: boolean; index: number }> = ({ config, isActive, index }) => {
  const frame = useCurrentFrame();
  const entryDelay = 10 + index * 12;
  const opacity = interpolate(frame, [entryDelay, entryDelay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const x = interpolate(frame, [entryDelay, entryDelay + 15], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pulse = isActive ? 0.5 + 0.5 * Math.sin(frame / 8) : 0;

  return (
    <div style={{ opacity, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderRadius: 12, background: isActive ? 'rgba(15,23,42,0.95)' : 'rgba(15,23,42,0.6)', border: `1px solid ${isActive ? config.color : 'rgba(51,65,85,0.5)'}`, boxShadow: isActive ? `0 0 ${20 + pulse * 12}px ${config.glowColor}` : 'none', marginBottom: 10 }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: config.color, boxShadow: isActive ? `0 0 ${10 + pulse * 8}px ${config.color}` : 'none', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? config.color : '#94a3b8' }}>{config.labelTr}</div>
        {isActive && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{config.description}</div>}
      </div>
    </div>
  );
};

const AnatomicalSVG: React.FC<{ targetLayer: AnatomicalLayer; frame: number }> = ({ targetLayer, frame }) => {
  const svgOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const skeletonColor = targetLayer === 'xray' ? '#22d3ee' : targetLayer === 'skeletal' ? '#e2e8f0' : 'rgba(226,232,240,0.25)';
  const muscleColor = targetLayer === 'muscular' ? '#f87171' : 'rgba(248,113,113,0.15)';
  const vascularColor = targetLayer === 'vascular' ? '#60a5fa' : 'rgba(96,165,250,0.1)';
  const skinOpacity = targetLayer === 'full-body' ? 0.4 : 0.1;
  const glowPulse = 0.7 + 0.3 * Math.sin(frame / 8);
  const activeBrightness = targetLayer !== 'full-body' ? glowPulse : 1;

  return (
    <svg viewBox="0 0 200 420" width="200" height="420" style={{ opacity: svgOpacity, filter: `brightness(${activeBrightness})` }}>
      {/* Body silhouette */}
      <g opacity={skinOpacity}>
        <ellipse cx="100" cy="42" rx="28" ry="32" fill="#64748b" />
        <rect x="90" y="70" width="20" height="18" rx="4" fill="#64748b" />
        <path d="M68 88 L58 200 L142 200 L132 88 Z" fill="#64748b" />
        <ellipse cx="100" cy="200" rx="44" ry="16" fill="#64748b" />
        <path d="M68 92 L46 175 L58 178 L72 100 Z" fill="#64748b" />
        <path d="M132 92 L154 175 L142 178 L128 100 Z" fill="#64748b" />
        <path d="M47 176 L40 250 L54 252 L60 179 Z" fill="#64748b" />
        <path d="M153 176 L160 250 L146 252 L140 179 Z" fill="#64748b" />
        <path d="M60 210 L54 310 L78 312 L82 212 Z" fill="#64748b" />
        <path d="M140 210 L146 310 L122 312 L118 212 Z" fill="#64748b" />
        <path d="M55 312 L52 400 L72 400 L76 314 Z" fill="#64748b" />
        <path d="M145 312 L148 400 L128 400 L124 314 Z" fill="#64748b" />
      </g>
      {/* Skeletal */}
      <g stroke={skeletonColor} strokeWidth="2.5" fill="none" strokeLinecap="round">
        <line x1="100" y1="90" x2="100" y2="200" />
        <line x1="70" y1="94" x2="100" y2="90" /><line x1="130" y1="94" x2="100" y2="90" />
        <line x1="70" y1="94" x2="50" y2="175" /><line x1="50" y1="175" x2="44" y2="248" />
        <line x1="130" y1="94" x2="150" y2="175" /><line x1="150" y1="175" x2="156" y2="248" />
        <ellipse cx="100" cy="200" rx="40" ry="12" />
        <line x1="80" y1="210" x2="66" y2="310" /><line x1="66" y1="310" x2="63" y2="398" />
        <line x1="120" y1="210" x2="134" y2="310" /><line x1="134" y1="310" x2="137" y2="398" />
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <path d={`M100 ${108 + i * 18} Q75 ${114 + i * 18} 72 ${120 + i * 18}`} />
            <path d={`M100 ${108 + i * 18} Q125 ${114 + i * 18} 128 ${120 + i * 18}`} />
          </React.Fragment>
        ))}
        {[[100, 90], [70, 94], [130, 94], [50, 175], [150, 175], [80, 210], [120, 210], [66, 310], [134, 310]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={4} fill={skeletonColor} />
        ))}
      </g>
      {/* Muscular */}
      <g fill={muscleColor} opacity={targetLayer === 'muscular' ? 0.9 : 0.2}>
        <ellipse cx="85" cy="115" rx="14" ry="18" /><ellipse cx="115" cy="115" rx="14" ry="18" />
        <ellipse cx="67" cy="100" rx="9" ry="13" /><ellipse cx="133" cy="100" rx="9" ry="13" />
        <ellipse cx="57" cy="140" rx="7" ry="18" /><ellipse cx="143" cy="140" rx="7" ry="18" />
        <ellipse cx="76" cy="258" rx="11" ry="40" /><ellipse cx="124" cy="258" rx="11" ry="40" />
        <ellipse cx="67" cy="352" rx="8" ry="28" /><ellipse cx="133" cy="352" rx="8" ry="28" />
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <rect x="90" y={138 + i * 18} width="9" height="14" rx="3" />
            <rect x="101" y={138 + i * 18} width="9" height="14" rx="3" />
          </React.Fragment>
        ))}
      </g>
      {/* Vascular */}
      <g stroke={vascularColor} strokeWidth="1.5" fill="none" opacity={targetLayer === 'vascular' ? 1 : 0.15}>
        <path d="M100 100 Q96 150 98 200" />
        <path d="M96 80 L94 70" /><path d="M104 80 L106 70" />
        <path d="M90 100 Q72 110 62 150 Q52 180 47 240" />
        <path d="M110 100 Q128 110 138 150 Q148 180 153 240" />
        <path d="M94 200 Q82 220 74 280 Q68 330 66 395" />
        <path d="M106 200 Q118 220 126 280 Q132 330 134 395" />
      </g>
    </svg>
  );
};

export const AnatomyLayerComposition: React.FC<Props> = ({ targetLayer = 'full-body', muscleNames = [], bodyRegion = 'Genel' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const outroOpacity = interpolate(frame, [durationInFrames - 15, durationInFrames - 3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerY = interpolate(frame, [0, 15], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const activeConfig = LAYER_CONFIGS.find((l) => l.id === targetLayer) ?? LAYER_CONFIGS[0];

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(160deg, #020617 0%, #0a1628 100%)', fontFamily: "'Inter', 'Segoe UI', sans-serif", opacity: outroOpacity }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${activeConfig.color}, #818cf8)` }} />

      <div style={{ position: 'absolute', top: 36, left: 60, opacity: headerOpacity, transform: `translateY(${headerY}px)` }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Anatomik Görünüm</div>
        <div style={{ fontSize: 38, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{activeConfig.labelTr}</div>
        <div style={{ fontSize: 15, color: '#64748b', marginTop: 6 }}>Bölge: <span style={{ color: activeConfig.color }}>{bodyRegion}</span></div>
      </div>

      <div style={{ position: 'absolute', top: 60, right: 80 }}>
        <AnatomicalSVG targetLayer={targetLayer} frame={frame} />
      </div>

      <div style={{ position: 'absolute', top: 155, left: 60, width: 380 }}>
        {LAYER_CONFIGS.map((cfg, i) => (
          <LayerCard key={cfg.id} config={cfg} isActive={cfg.id === targetLayer} index={i} />
        ))}
      </div>

      {muscleNames.length > 0 && (
        <div style={{ position: 'absolute', bottom: 80, left: 60, opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#475569', textTransform: 'uppercase', marginBottom: 8 }}>Hedef Kaslar</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {muscleNames.map((m, i) => (
              <span key={i} style={{ background: `${activeConfig.color}20`, border: `1px solid ${activeConfig.color}50`, borderRadius: 6, padding: '3px 12px', fontSize: 13, color: activeConfig.color, fontWeight: 600 }}>{m}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 24, right: 60, fontSize: 12, fontWeight: 900, fontStyle: 'italic', color: '#334155', opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        PHYSIOCORE <span style={{ color: activeConfig.color }}>AI</span>
      </div>
    </AbsoluteFill>
  );
};
