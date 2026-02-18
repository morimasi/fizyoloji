
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Activity, Zap, Maximize, ScanLine, Layers, 
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Settings2, Clock, MousePointer2
} from 'lucide-react';

/**
 * GENESIS MOTION ENGINE v9.5 (24FPS EQUAL DISTRIBUTION)
 * Architect: Chief Architect
 * Updates: 
 *  - Default Layout: 5x5 (25 Frames) to match 24fps + 1 loop frame.
 *  - Interpolation: Linear distribution across 25 frames.
 */

interface LiveSpritePlayerProps {
  src: string;
  isPlaying?: boolean;
  layout?: 'grid-4x4' | 'grid-5x5'; 
  speed?: number; 
  smoothing?: boolean; 
}

export const LiveSpritePlayer: React.FC<LiveSpritePlayerProps> = ({ 
  src, 
  isPlaying: initialPlaying = true, 
  layout = 'grid-5x5', // Default updated to 5x5 for smoothness
  speed: initialSpeed = 1.0, 
  smoothing: initialSmoothing = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>(new Image());
  
  // SYSTEM STATE
  const [engineState, setEngineState] = useState<'IDLE' | 'ANALYZING' | 'READY'>('IDLE');
  const [metrics, setMetrics] = useState({ totalFrames: 0, stability: 0 });
  
  // CINEMA CONTROL STATE
  const [internalPlaying, setInternalPlaying] = useState(initialPlaying);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
  const [useSmoothing, setUseSmoothing] = useState(initialSmoothing);
  const [currentProgress, setCurrentProgress] = useState(0); // 0.0 to 1.0 (Ping-Pong Cycle)
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  // FRAME DATA CACHE
  const registeredFrames = useRef<{
      sx: number, sy: number, cropSize: number, dx: number, dy: number
  }[]>([]);

  // 1. INITIALIZATION & GRAVITY-LOCK ANALYSIS
  useEffect(() => {
    setEngineState('ANALYZING');
    registeredFrames.current = [];
    imageRef.current.crossOrigin = "anonymous"; 
    imageRef.current.src = src;
    
    imageRef.current.onload = () => {
      setTimeout(() => {
          performGravityLockAnalysis(imageRef.current, layout);
          setEngineState('READY');
      }, 50);
    };
  }, [src, layout]);

  /**
   * GRAVITY-LOCK ALGORITHM (v9.5)
   * 24fps Equal Distribution Logic
   */
  const performGravityLockAnalysis = (img: HTMLImageElement, currentLayout: string) => {
    // Force 5x5 check if layout is undefined, preferring high fidelity
    const isCinematic = currentLayout === 'grid-5x5' || !currentLayout;
    const cols = isCinematic ? 5 : 4;
    const rows = isCinematic ? 5 : 4;
    const totalFrames = cols * rows;
    
    const rawCellW = img.width / cols;
    const rawCellH = img.height / rows;
    
    // Kare Kesim (Square Crop)
    const cropSize = Math.floor(Math.min(rawCellW, rawCellH));
    const cropOffsetX = (rawCellW - cropSize) / 2;
    const cropOffsetY = (rawCellH - cropSize) / 2;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = cropSize;
    offCanvas.height = cropSize;
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let rawFrames: {sx: number, sy: number, cx: number, cy: number}[] = [];
    const BG_THRESHOLD = 40; 

    // PASS 1: SCAN MASS
    for (let i = 0; i < totalFrames; i++) {
        const cellX = (i % cols) * rawCellW;
        const cellY = Math.floor(i / cols) * rawCellH;
        const srcX = Math.floor(cellX + cropOffsetX);
        const srcY = Math.floor(cellY + cropOffsetY);

        ctx.clearRect(0, 0, cropSize, cropSize);
        ctx.drawImage(img, srcX, srcY, cropSize, cropSize, 0, 0, cropSize, cropSize);
        
        const frameData = ctx.getImageData(0, 0, cropSize, cropSize);
        const data = frameData.data;
        
        let totalMassX = 0, totalMassY = 0, pixelCount = 0;

        for (let y = 0; y < cropSize; y += 4) { // Optimizasyon: 4x4 atlama
            for (let x = 0; x < cropSize; x += 4) {
                const idx = (y * cropSize + x) * 4;
                if (data[idx] > BG_THRESHOLD || data[idx+1] > BG_THRESHOLD || data[idx+2] > BG_THRESHOLD) {
                    totalMassX += x;
                    totalMassY += y;
                    pixelCount++;
                }
            }
        }

        let cx = cropSize / 2;
        let cy = cropSize / 2;

        if (pixelCount > 20) {
            cx = totalMassX / pixelCount;
            cy = totalMassY / pixelCount;
        }

        rawFrames.push({ sx: srcX, sy: srcY, cx, cy });
    }

    // PASS 2: TEMPORAL SMOOTHING
    const frames: any[] = [];
    let totalShift = 0;

    for (let i = 0; i < totalFrames; i++) {
        const current = rawFrames[i];
        
        // 3-Frame Moving Average for Jitter Reduction
        let smoothedCx = current.cx;
        let smoothedCy = current.cy;

        if (i > 0 && i < totalFrames - 1) {
            const prev = rawFrames[i - 1];
            const next = rawFrames[i + 1];
            smoothedCx = (prev.cx + current.cx + next.cx) / 3;
            smoothedCy = (prev.cy + current.cy + next.cy) / 3;
        }

        const dx = (cropSize / 2) - smoothedCx;
        const dy = (cropSize / 2) - smoothedCy;

        totalShift += Math.abs(dx) + Math.abs(dy);
        frames.push({ sx: current.sx, sy: current.sy, cropSize, dx, dy });
    }
    
    registeredFrames.current = frames;
    setMetrics({ totalFrames, stability: Math.min(100, Math.floor(100 - (totalShift / totalFrames / 5))) });
  };

  // 2. RENDER LOOP
  useEffect(() => {
    if (engineState !== 'READY' || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const canvas = canvasRef.current;
    canvas.width = 1080; 
    canvas.height = 1080;

    const LOOP_DURATION = 2000; // 2 saniye = 1 tur (24fps hız hissi için)
    let startTimestamp = performance.now();
    let lastRenderTime = 0;

    const renderFrame = (progress: number) => {
        const totalFrames = registeredFrames.current.length;
        if (totalFrames === 0) return;

        // Ping-Pong Mapping (0 -> 1 -> 0)
        let phase = progress; 
        if (phase > 1) phase = 2 - phase; // Reverse

        // Precise Mapping for 24fps Equidistance
        const rawFrameIndex = phase * (totalFrames - 1);
        const currentFrameIndex = Math.floor(rawFrameIndex);
        const nextFrameIndex = Math.min(Math.ceil(rawFrameIndex), totalFrames - 1);
        const blend = rawFrameIndex - currentFrameIndex;

        setActiveFrameIndex(currentFrameIndex);

        const currentFrame = registeredFrames.current[currentFrameIndex];
        const nextFrame = registeredFrames.current[nextFrameIndex];

        // Draw
        ctx.fillStyle = '#020617'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = (canvas.width * 0.90) / currentFrame.cropSize;
        const drawSize = Math.floor(currentFrame.cropSize * scale);
        
        const bx = (canvas.width - drawSize) / 2;
        const by = (canvas.height - drawSize) / 2;

        const destX = bx + (currentFrame.dx * scale);
        const destY = by + (currentFrame.dy * scale);
        
        const nextDestX = bx + (nextFrame.dx * scale);
        const nextDestY = by + (nextFrame.dy * scale);

        ctx.globalAlpha = 1.0;
        ctx.drawImage(
            imageRef.current, 
            currentFrame.sx, currentFrame.sy, currentFrame.cropSize, currentFrame.cropSize, 
            destX, destY, drawSize, drawSize
        );

        if (useSmoothing && blend > 0.05) { // Threshold optimization
            ctx.globalAlpha = blend;
            ctx.drawImage(
                imageRef.current, 
                nextFrame.sx, nextFrame.sy, nextFrame.cropSize, nextFrame.cropSize, 
                nextDestX, nextDestY, drawSize, drawSize
            );
        }
        ctx.globalAlpha = 1.0;
    };

    const loop = (time: number) => {
        if (!internalPlaying) {
            startTimestamp = time - (currentProgress * (LOOP_DURATION / playbackSpeed));
            renderFrame(currentProgress); 
            requestRef.current = requestAnimationFrame(loop);
            return;
        }

        const elapsed = time - startTimestamp;
        const duration = LOOP_DURATION / playbackSpeed;
        const totalCycle = duration * 2; 

        const normalizedTime = (elapsed % totalCycle) / duration;
        
        if (time - lastRenderTime > 50) {
            setCurrentProgress(normalizedTime);
            lastRenderTime = time;
        }

        renderFrame(normalizedTime);
        requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [engineState, internalPlaying, playbackSpeed, useSmoothing, currentProgress]);

  // --- CONTROLS ---
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentProgress(val);
    setInternalPlaying(false);
  };

  const stepFrame = (dir: 1 | -1) => {
    setInternalPlaying(false);
    const stepSize = 1 / metrics.totalFrames;
    setCurrentProgress(prev => {
        let next = prev + (dir * stepSize);
        if (next < 0) next = 0; if (next > 2) next = 0;
        return next;
    });
  };

  const formatTimecode = (frame: number) => {
    // 24fps Timecode logic
    const fps = 24;
    const seconds = Math.floor(frame / fps);
    const frames = frame % fps;
    return `00:00:${seconds < 10 ? '0'+seconds : seconds}:${frames < 10 ? '0'+frames : frames}`;
  };

  if (engineState !== 'READY') return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 gap-6 relative overflow-hidden rounded-[3rem]">
        <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
        <Loader2 size={64} className="text-cyan-500 animate-spin relative z-10" />
        <div className="text-center relative z-10">
            <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">Genesis <span className="text-cyan-400">Engine</span></h4>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 flex items-center justify-center gap-2">
                <ScanLine size={12} /> 24FPS Optimization...
            </p>
        </div>
    </div>
  );

  return (
    <div className="relative w-full h-full group bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-900 flex flex-col">
        {/* VIEWPORT */}
        <div className="relative flex-1 bg-[#020617] flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
            
            {/* HUD OVERLAY */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5">
                    <Layers size={10} className="text-cyan-400" />
                    <span className="text-[9px] font-mono font-bold text-white uppercase">FPS: 24 | FR: {activeFrameIndex + 1}/{metrics.totalFrames}</span>
                </div>
            </div>
        </div>

        {/* CINEMA CONTROL DECK */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-12 pb-6 px-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="flex flex-col gap-4">
                <div className="w-full relative h-6 flex items-center group/scrub">
                    <div className="absolute w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500/50" style={{ width: `${(currentProgress / 2) * 100}%` }} />
                    </div>
                    <input 
                        type="range" min="0" max="2" step="0.001" 
                        value={currentProgress}
                        onChange={handleScrub}
                        className="w-full absolute inset-0 opacity-0 cursor-ew-resize z-20" 
                    />
                    <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] absolute z-10 pointer-events-none transition-all group-hover/scrub:scale-125" style={{ left: `${(currentProgress / 2) * 100}%` }} />
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setInternalPlaying(!internalPlaying)} className="w-10 h-10 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-cyan-500/20 active:scale-95">
                            {internalPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <div className="flex gap-1">
                            <button onClick={() => stepFrame(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><SkipBack size={16} /></button>
                            <button onClick={() => stepFrame(1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><SkipForward size={16} /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="font-mono text-xs font-bold text-cyan-500 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                            {formatTimecode(activeFrameIndex)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
