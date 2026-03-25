import React, { useEffect, useState, useRef } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from 'remotion';
import { Exercise } from '../types.ts';

interface Props {
  exercise: Partial<Exercise>;
}

/**
 * ExerciseAnimationComposition
 *
 * This composition displays the REAL HUMAN BODY animation from the exercise's
 * visualUrl (sprite sheet) or videoUrl. It renders the actual exercise performance
 * animation, not just informational cards.
 */
export const ExerciseAnimationComposition: React.FC<Props> = ({ exercise }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hasVisual = exercise.visualUrl || exercise.videoUrl;
  const layout = (exercise.visualLayout as 'grid-4x4' | 'grid-5x5' | 'grid-6x4') || 'grid-6x4';

  // Calculate sprite grid dimensions
  const getGridDimensions = (layout: string): { cols: number; rows: number } => {
    if (layout === 'grid-6x4') return { cols: 6, rows: 4 };
    if (layout === 'grid-5x5') return { cols: 5, rows: 5 };
    if (layout === 'grid-4x4') return { cols: 4, rows: 4 };
    return { cols: 6, rows: 4 }; // default
  };

  const { cols, rows } = getGridDimensions(layout);
  const totalFrames = cols * rows;
  const frameCount = exercise.visualFrameCount || totalFrames;

  // Calculate which sprite frame to show (loop at 24 FPS)
  const spriteFrameRate = 24; // Sprite animations are designed for 24 FPS
  const currentSpriteFrame = Math.floor((frame * spriteFrameRate) / fps) % frameCount;

  // Calculate sprite position
  const col = currentSpriteFrame % cols;
  const row = Math.floor(currentSpriteFrame / cols);
  const spriteX = -(col * 100);
  const spriteY = -(row * 100);

  if (!hasVisual) {
    // Fallback: Show message that visual needs to be generated
    return (
      <AbsoluteFill style={{
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24
      }}>
        <div style={{
          fontSize: 48,
          fontWeight: 900,
          color: '#06b6d4',
          textAlign: 'center',
          letterSpacing: -1
        }}>
          GÖRSEL OLUŞTURULMADI
        </div>
        <div style={{
          fontSize: 20,
          color: '#64748b',
          textAlign: 'center',
          maxWidth: 600,
          lineHeight: 1.5
        }}>
          Bu egzersiz için gerçek insan vücudu animasyonu henüz üretilmedi.
          <br />
          Visual Studio'da "STANDART (LOCK-POS)" veya "CINEMATIC STABLE MOTION" ile üretin.
        </div>
        <div style={{
          marginTop: 20,
          padding: '12px 24px',
          background: 'rgba(6,182,212,0.1)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: 12,
          fontSize: 14,
          color: '#06b6d4',
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase'
        }}>
          {exercise.titleTr || exercise.title || 'Egzersiz'}
        </div>
      </AbsoluteFill>
    );
  }

  if (exercise.videoUrl) {
    // Display video animation
    return (
      <AbsoluteFill style={{ background: '#000' }}>
        <video
          src={exercise.videoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          muted
          loop
          autoPlay
          playsInline
        />
        {/* Overlay title */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 60,
          padding: '12px 24px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: 16,
          fontSize: 24,
          color: '#fff',
          fontWeight: 900,
          letterSpacing: -0.5,
          textTransform: 'uppercase'
        }}>
          {exercise.titleTr || exercise.title || 'Egzersiz'}
        </div>
      </AbsoluteFill>
    );
  }

  // Display sprite sheet animation
  return (
    <AbsoluteFill style={{
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Sprite sheet animation */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '90%',
          height: '90%',
          overflow: 'hidden',
          borderRadius: 24,
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
        }}>
          <img
            src={exercise.visualUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${cols * 100}%`,
              height: `${rows * 100}%`,
              objectFit: 'contain',
              transform: `translate(${spriteX}%, ${spriteY}%)`
            }}
            alt="Exercise Animation"
          />
        </div>
      </div>

      {/* Overlay title */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 60,
        padding: '12px 24px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: 16,
        fontSize: 24,
        color: '#fff',
        fontWeight: 900,
        letterSpacing: -0.5,
        textTransform: 'uppercase'
      }}>
        {exercise.titleTr || exercise.title || 'Egzersiz'}
      </div>

      {/* Frame counter (bottom right) */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        right: 60,
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(6,182,212,0.2)',
        borderRadius: 12,
        fontSize: 14,
        color: '#06b6d4',
        fontWeight: 700,
        fontFamily: 'monospace'
      }}>
        Frame {currentSpriteFrame + 1}/{frameCount}
      </div>
    </AbsoluteFill>
  );
};
