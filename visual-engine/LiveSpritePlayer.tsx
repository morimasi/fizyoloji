
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Activity, Zap, Maximize, ScanLine, Layers, 
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Settings2, Clock, MousePointer2
} from 'lucide-react';

/**
 * GENESIS MOTION ENGINE v10.1 (STABILITY PATCH)
 * Architect: Chief Architect
 * Updates: 
 *  - Fixed crash where 'cropSize' was accessed on undefined frame.
 *  - Added bounds clamping and existence checks in render loop.
 */

interface LiveSpritePlayerProps {
  src: string;
  isPlaying?: boolean;
  layout?: 'grid-4x4' | 'grid-5x5' | 'grid-6x4' | string; 
  speed?: number; 
  smoothing?: boolean; 
}

export const LiveSpritePlayer: React.FC<LiveSpritePlayerProps> = ({ 
  src, 
  isPlaying: initialPlaying = true, 
  layout = 'grid-6x4', 
  speed: initialSpeed = 1.0, 
  smoothing: initialSmoothing = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>(new Image());
  
  // SYSTEM STATE
  const [engineState, setEngineState] = useState<'IDLE' | 'ANALYZING' | 'READY'>('IDLE');
  const [metrics, setMetrics] = useState({ totalFrames: 0, stability: 0, cropFactor: 0 });
  
  // CINEMA CONTROL STATE
  const [internalPlaying, setInternalPlaying] = useState(initialPlaying);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
  const [useSmoothing, setUseSmoothing] = useState(initialSmoothing);
  const [currentProgress, setCurrentProgress] = useState(0); 
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  // FRAME DATA CACHE (Includes Crop Info)
  const registeredFrames = useRef<{
      sx: number, sy: number, cropSize: number, 
      dx: number, dy: number, // Displacement to center
      contentScale: number // Zoom factor for Dynamic Crop
  }[]>([]);

  // 1. INITIALIZATION & ANALYSIS
  useEffect(() => {
    setEngineState('ANALYZING');
    registeredFrames.current = [];
    imageRef.current.crossOrigin = "anonymous"; 
    imageRef.current.src = src;
    
    imageRef.current.onload = () => {
      setTimeout(() => {
          performZeroJitterAnalysis(imageRef.current, layout);
          setEngineState('READY');
      }, 50);
    };
  }, [src, layout]);

  /**
   * ZERO-JITTER & DYNAMIC CROP ALGORITHM
   */
  const performZeroJitterAnalysis = (img: HTMLImageElement, currentLayout: string) => {
    let cols = 6;
    let rows = 4;
    
    if (currentLayout === 'grid-5x5') {
      cols = 5; rows = 5;
    } else if (currentLayout === 'grid-4x4') {
      cols = 4; rows = 4;
    } else if (currentLayout === 'grid-6x4') {
      cols = 6; rows = 4;
    } else {
      // Auto detect based on aspect ratio if possible, otherwise default to 6x4
      const ratio = img.width / img.height;
      if (Math.abs(ratio - 1) < 0.1) {
         cols = 5; rows = 5; // Square image
      } else if (Math.abs(ratio - 1.5) < 0.1) {
         cols = 6; rows = 4; // 3:2 image
      }
    }
    
    const totalFrames = cols * rows;
    
    const rawCellW = img.width / cols;
    const rawCellH = img.height / rows;
    const cropSize = Math.floor(Math.min(rawCellW, rawCellH));
    const cropOffsetX = (rawCellW - cropSize) / 2;
    const cropOffsetY = (rawCellH - cropSize) / 2;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = cropSize;
    offCanvas.height = cropSize;
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let rawFrames: {sx: number, sy: number, cx: number, cy: number, minX: number, maxX: number, minY: number, maxY: number}[] = [];
    const BG_THRESHOLD = 40; 

    // GLOBAL BOUNDS TRACKING (For Dynamic Crop)
    let globalMaxWidth = 0;
    let globalMaxHeight = 0;

    // PASS 1: SCAN MASS & BOUNDING BOX
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
        let minX = cropSize, maxX = 0, minY = cropSize, maxY = 0;

        for (let y = 0; y < cropSize; y += 2) {
            for (let x = 0; x < cropSize; x += 2) {
                const idx = (y * cropSize + x) * 4;
                // Check if pixel is not background (Luma check)
                if (data[idx] > BG_THRESHOLD || data[idx+1] > BG_THRESHOLD || data[idx+2] > BG_THRESHOLD) {
                    totalMassX += x;
                    totalMassY += y;
                    pixelCount++;

                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        let cx = cropSize / 2;
        let cy = cropSize / 2;

        if (pixelCount > 20) {
            cx = totalMassX / pixelCount;
            cy = totalMassY / pixelCount;
            
            // Update Global Max Dimensions (to determine zoom level)
            const contentW = maxX - minX;
            const contentH = maxY - minY;
            if (contentW > globalMaxWidth) globalMaxWidth = contentW;
            if (contentH > globalMaxHeight) globalMaxHeight = contentH;
        }

        rawFrames.push({ sx: srcX, sy: srcY, cx, cy, minX, maxX, minY, maxY });
    }

    // Add padding to global bounds to avoid cutting off
    globalMaxWidth = Math.min(cropSize, globalMaxWidth * 1.2); 
    globalMaxHeight = Math.min(cropSize, globalMaxHeight * 1.2);
    
    // Calculate how much we can zoom in (Dynamic Crop Factor)
    // Avoid division by zero if empty image
    const contentScale = (globalMaxWidth > 0 && globalMaxHeight > 0) 
        ? Math.min(cropSize / globalMaxWidth, cropSize / globalMaxHeight)
        : 1;

    // PASS 2: CALCULATE OFFSETS TO LOCK CENTER
    const frames: any[] = [];
    let totalShift = 0;

    for (let i = 0; i < totalFrames; i++) {
        const current = rawFrames[i];
        
        // Smoothing: Average with neighbors to prevent micro-jitter
        let smoothedCx = current.cx;
        let smoothedCy = current.cy;

        if (i > 0 && i < totalFrames - 1) {
            const prev = rawFrames[i - 1];
            const next = rawFrames[i + 1];
            smoothedCx = (prev.cx + current.cx + next.cx) / 3;
            smoothedCy = (prev.cy + current.cy + next.cy) / 3;
        }

        // Calculate offset to bring CoM to Center of Canvas
        const dx = (cropSize / 2) - smoothedCx;
        const dy = (cropSize / 2) - smoothedCy;

        totalShift += Math.abs(dx) + Math.abs(dy);
        
        frames.push({ 
            sx: current.sx, 
            sy: current.sy, 
            cropSize, 
            dx, 
            dy,
            contentScale // Store the global zoom factor
        });
    }
    
    registeredFrames.current = frames;
    setMetrics({ 
        totalFrames, 
        stability: Math.min(100, Math.floor(100 - (totalShift / totalFrames / 5))),
        cropFactor: Math.floor(contentScale * 100)
    });
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

    // 24 FPS Loop Logic:
    const FPS = 24;
    // Calculate loop duration based on frame count (approx 1 second for 24 frames)
    const framesCount = registeredFrames.current.length || 24;
    const LOOP_DURATION = (framesCount / FPS) * 1000; 
    
    let startTimestamp = performance.now();
    let lastRenderTime = 0;

    const renderFrame = (progress: number) => {
        const totalFrames = registeredFrames.current.length;
        if (totalFrames === 0) return;

        // Ensure normalized progress is within [0, 1]
        let normalized = progress % 1;
        if (normalized < 0) normalized += 1;

        // Calculate frame index
        const rawFrameIndex = normalized * (totalFrames - 1);
        const currentFrameIndex = Math.min(Math.floor(rawFrameIndex), totalFrames - 1);
        const nextFrameIndex = (currentFrameIndex + 1) % totalFrames;
        const blend = rawFrameIndex - currentFrameIndex;

        setActiveFrameIndex(currentFrameIndex);

        const currentFrame = registeredFrames.current[currentFrameIndex];
        const nextFrame = registeredFrames.current[nextFrameIndex];

        // Safety Guard: If frames are undefined, skip render
        if (!currentFrame || !nextFrame) return;

        // Draw Background
        ctx.fillStyle = '#020617'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply Dynamic Crop Scale (Zoom into content)
        // Guard against division by zero if cropSize is 0
        const cSize = currentFrame.cropSize || 100;
        const effectiveScale = (canvas.width / cSize) * (currentFrame.contentScale || 1) * 0.9; 
        const drawSize = Math.floor(cSize * effectiveScale);
        
        // Base Position (Center of Canvas)
        const bx = (canvas.width - drawSize) / 2;
        const by = (canvas.height - drawSize) / 2;

        // Apply Stabilized Offsets (Center Lock)
        const destX = bx + (currentFrame.dx * effectiveScale);
        const destY = by + (currentFrame.dy * effectiveScale);
        
        const nextDestX = bx + (nextFrame.dx * effectiveScale);
        const nextDestY = by + (nextFrame.dy * effectiveScale);

        ctx.globalAlpha = 1.0;
        
        if (imageRef.current && imageRef.current.complete) {
            ctx.drawImage(
                imageRef.current, 
                currentFrame.sx, currentFrame.sy, cSize, cSize, 
                destX, destY, drawSize, drawSize
            );

            if (useSmoothing && blend > 0.01) { 
                ctx.globalAlpha = blend;
                ctx.drawImage(
                    imageRef.current, 
                    nextFrame.sx, nextFrame.sy, cSize, cSize, 
                    nextDestX, nextDestY, drawSize, drawSize
                );
            }
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
        
        // Safe division check
        const normalizedTime = duration > 0 ? (elapsed % duration) / duration : 0;
        
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
    const stepSize = 1 / Math.max(1, metrics.totalFrames);
    setCurrentProgress(prev => {
        let next = prev + (dir * stepSize);
        if (next < 0) next += 1;
        if (next >= 1) next %= 1;
        return next;
    });
  };

  const formatTimecode = (frame: number) => {
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
                <ScanLine size={12} /> Zero-Jitter Analysis...
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
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5">
                    <Maximize size={10} className="text-emerald-400" />
                    <span className="text-[9px] font-mono font-bold text-white uppercase">CROP: {metrics.cropFactor}%</span>
                </div>
            </div>
        </div>

        {/* CINEMA CONTROL DECK */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-12 pb-6 px-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="flex flex-col gap-4">
                <div className="w-full relative h-6 flex items-center group/scrub">
                    <div className="absolute w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500/50" style={{ width: `${currentProgress * 100}%` }} />
                    </div>
                    <input 
                        type="range" min="0" max="1" step="0.001" 
                        value={currentProgress}
                        onChange={handleScrub}
                        className="w-full absolute inset-0 opacity-0 cursor-ew-resize z-20" 
                    />
                    <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] absolute z-10 pointer-events-none transition-all group-hover/scrub:scale-125" style={{ left: `${currentProgress * 100}%` }} />
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
