
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Activity, Zap, Maximize, ScanLine, Layers } from 'lucide-react';

/**
 * GENESIS MOTION ENGINE v8.0 (FLUID-FLOW RENDERER)
 * Architect: Chief Architect
 * Features: 
 *  - Smart-Crop (Pixel-perfect centering to remove jitter)
 *  - Temporal Blending (Cross-dissolve between frames for 60fps feel)
 *  - Ping-Pong Looping (Seamless concentric/eccentric flow)
 */

interface LiveSpritePlayerProps {
  src: string;
  isPlaying?: boolean;
  layout?: 'grid-4x4' | 'grid-5x5'; // 16 or 25 frames
  speed?: number; // Playback speed multiplier (0.5x - 2.0x)
  smoothing?: boolean; // Enable Temporal Blending
  quality?: 'High' | 'Low';
}

export const LiveSpritePlayer: React.FC<LiveSpritePlayerProps> = ({ 
  src, 
  isPlaying = true, 
  layout = 'grid-4x4', 
  speed = 1.0, 
  smoothing = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>(new Image());
  
  // SYSTEM STATE
  const [engineState, setEngineState] = useState<'IDLE' | 'ANALYZING' | 'READY'>('IDLE');
  const [metrics, setMetrics] = useState({ activeFrame: 0, totalFrames: 0, stability: 0 });

  // FRAME DATA CACHE (Stores crop coordinates for stability)
  const registeredFrames = useRef<{
      sx: number, sy: number, // Source coordinates
      cropSize: number,       // Cutout size
      dx: number, dy: number  // Stabilization offset (Anti-Jitter)
  }[]>([]);

  // 1. INITIALIZATION & SMART-CROP ANALYSIS
  useEffect(() => {
    setEngineState('ANALYZING');
    registeredFrames.current = [];

    imageRef.current.crossOrigin = "anonymous"; 
    imageRef.current.src = src;
    
    imageRef.current.onload = () => {
      // Run the heavy analysis in the next tick to allow UI to show "Analyzing"
      requestAnimationFrame(() => {
          performSmartCropAnalysis(imageRef.current, layout);
          setEngineState('READY');
      });
    };
  }, [src, layout]);

  /**
   * ALGORITHM: SMART-CROP
   * Scans every frame, finds the character's bounding box, calculates the center of mass,
   * and computes the offset needed to lock the character in the center of the viewport.
   */
  const performSmartCropAnalysis = (img: HTMLImageElement, currentLayout: string) => {
    const isCinematic = currentLayout === 'grid-5x5';
    const cols = isCinematic ? 5 : 4;
    const rows = isCinematic ? 5 : 4;
    const totalFrames = cols * rows;
    
    const rawCellW = img.width / cols;
    const rawCellH = img.height / rows;

    // Use a square crop based on the smaller dimension to ensure fit
    const cropSize = Math.floor(Math.min(rawCellW, rawCellH));
    const cropOffsetX = (rawCellW - cropSize) / 2;
    const cropOffsetY = (rawCellH - cropSize) / 2;

    // Create an offline canvas for pixel scanning
    const offCanvas = document.createElement('canvas');
    offCanvas.width = cropSize;
    offCanvas.height = cropSize;
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;

    const frames: any[] = [];
    const BG_THRESHOLD = 25; // Pixel intensity threshold to ignore dark background

    let totalShift = 0;

    for (let i = 0; i < totalFrames; i++) {
        const cellX = (i % cols) * rawCellW;
        const cellY = Math.floor(i / cols) * rawCellH;
        
        // Initial naive cut
        const srcX = Math.floor(cellX + cropOffsetX);
        const srcY = Math.floor(cellY + cropOffsetY);

        // Draw to analysis buffer
        ctx.clearRect(0, 0, cropSize, cropSize);
        ctx.drawImage(img, srcX, srcY, cropSize, cropSize, 0, 0, cropSize, cropSize);

        // Scan Pixels
        const frameData = ctx.getImageData(0, 0, cropSize, cropSize);
        const data = frameData.data;
        
        let minX = cropSize, maxX = 0, minY = cropSize, maxY = 0;
        let foundContent = false;

        // Skip steps for performance (scan every 4th pixel)
        for (let y = 0; y < cropSize; y += 4) {
            for (let x = 0; x < cropSize; x += 4) {
                const idx = (y * cropSize + x) * 4;
                const r = data[idx];
                const g = data[idx+1];
                const b = data[idx+2];

                // If pixel is brighter than background threshold
                if (r > BG_THRESHOLD || g > BG_THRESHOLD || b > BG_THRESHOLD) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    foundContent = true;
                }
            }
        }

        let dx = 0, dy = 0;
        if (foundContent) {
            // Calculate Center of Mass of the subject
            const subjectCenterX = (minX + maxX) / 2;
            const subjectCenterY = (minY + maxY) / 2;
            
            // Calculate vector to move Subject Center to Canvas Center
            dx = (cropSize / 2) - subjectCenterX;
            dy = (cropSize / 2) - subjectCenterY;
            
            totalShift += Math.abs(dx) + Math.abs(dy);
        }

        frames.push({ sx: srcX, sy: srcY, cropSize, dx, dy });
    }
    
    registeredFrames.current = frames;
    setMetrics(prev => ({ ...prev, totalFrames, stability: Math.floor(100 - (totalShift / totalFrames)) }));
  };

  // 2. RENDER LOOP (TEMPORAL BLENDING)
  useEffect(() => {
    if (engineState !== 'READY' || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const canvas = canvasRef.current!;
    // Set internal resolution high for retina displays
    canvas.width = 1080;
    canvas.height = 1080;

    const totalFrames = registeredFrames.current.length;
    
    // TIMING CONFIG
    const LOOP_DURATION = 3000; // 3 seconds for one full cycle (start -> end -> start)
    let startTimestamp = performance.now();

    const drawFrame = (frameIdx: number, nextFrameIdx: number, blendFactor: number) => {
        const img = imageRef.current;
        const currentFrame = registeredFrames.current[frameIdx];
        const nextFrame = registeredFrames.current[nextFrameIdx];
        
        if (!currentFrame || !nextFrame) return;

        // 1. Clear Canvas (Cinematic Black)
        ctx.fillStyle = '#020617'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Calculate Drawing Scale (Fit to canvas with padding)
        const scale = (canvas.width * 0.9) / currentFrame.cropSize;
        const drawSize = Math.floor(currentFrame.cropSize * scale);
        
        // 3. Base Position (Centered)
        let basePathX = (canvas.width - drawSize) / 2;
        let basePathY = (canvas.height - drawSize) / 2;

        // 4. Render Current Frame (Base)
        ctx.globalAlpha = 1.0;
        ctx.drawImage(
            img, 
            currentFrame.sx, currentFrame.sy, currentFrame.cropSize, currentFrame.cropSize, 
            Math.floor(basePathX + (currentFrame.dx * scale)), 
            Math.floor(basePathY + (currentFrame.dy * scale)), 
            drawSize, drawSize
        );

        // 5. Render Next Frame (Ghost/Blend) if Smoothing Enabled
        if (smoothing && blendFactor > 0) {
            ctx.globalAlpha = blendFactor; // Cross-dissolve opacity
            ctx.drawImage(
                img, 
                nextFrame.sx, nextFrame.sy, nextFrame.cropSize, nextFrame.cropSize, 
                Math.floor(basePathX + (nextFrame.dx * scale)), 
                Math.floor(basePathY + (nextFrame.dy * scale)), 
                drawSize, drawSize
            );
        }
        
        // Reset Alpha
        ctx.globalAlpha = 1.0;
    };

    const render = (time: number) => {
        if (!isPlaying) {
            // Keep loop running but don't advance time
            startTimestamp = time - (requestRef.current % LOOP_DURATION);
            requestRef.current = requestAnimationFrame(render);
            return;
        }

        // A. Time Calculation
        const elapsed = time - startTimestamp;
        const playbackDuration = LOOP_DURATION / speed;
        
        // B. Ping-Pong Logic (0 -> 1 -> 0)
        // Normalize time to 0...2 range (0..1 is forward, 1..2 is backward)
        let normalizedPhase = (elapsed % (playbackDuration * 2)) / playbackDuration;
        let progress = normalizedPhase;
        
        if (normalizedPhase > 1) {
            progress = 2 - normalizedPhase; // Reverse: 1.1 becomes 0.9
        }

        // C. Frame Mapping
        // Map 0.0-1.0 progress to Frame Index (e.g. 0 to 15.99)
        const rawFrameIndex = progress * (totalFrames - 1);
        
        const currentFrameIndex = Math.floor(rawFrameIndex);
        const nextFrameIndex = Math.min(Math.ceil(rawFrameIndex), totalFrames - 1);
        const blend = rawFrameIndex - currentFrameIndex; // Decimal part (0.0 to 0.99)

        drawFrame(currentFrameIndex, nextFrameIndex, blend);
        
        // Update UI metrics sparingly (every 10 frames roughly to save React renders)
        if (Math.floor(time) % 10 === 0) {
             setMetrics(m => ({ ...m, activeFrame: currentFrameIndex + 1 }));
        }

        requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [engineState, isPlaying, speed, smoothing]);

  // --- RENDERING UI ---

  if (engineState !== 'READY') return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 gap-6 relative overflow-hidden rounded-[3rem]">
        <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
        <Loader2 size={64} className="text-cyan-500 animate-spin relative z-10" />
        <div className="text-center relative z-10">
            <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">Genesis <span className="text-cyan-400">Engine</span></h4>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 flex items-center justify-center gap-2">
                <ScanLine size={12} /> Smart-Crop Analysis
            </p>
        </div>
    </div>
  );

  return (
    <div className="relative w-full h-full group bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-900">
        
        {/* MAIN CANVAS */}
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {/* HUD OVERLAY (Visible on Hover) */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Layers size={12} className="text-cyan-400" />
                <span className="text-[9px] font-mono font-bold text-white uppercase">
                    FRAME: {metrics.activeFrame}/{metrics.totalFrames}
                </span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Activity size={12} className={smoothing ? "text-emerald-400" : "text-amber-400"} />
                <span className="text-[9px] font-mono font-bold text-white uppercase">
                    {smoothing ? 'TEMPORAL: FLUID' : 'TEMPORAL: STEP'}
                </span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Maximize size={12} className="text-purple-400" />
                <span className="text-[9px] font-mono font-bold text-white uppercase">
                    STABILITY: {metrics.stability}%
                </span>
            </div>
        </div>

        {/* WATERMARK */}
        <div className="absolute bottom-6 right-6 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
            <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-cyan-500 fill-cyan-500" />
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">PHYSIOCORE GENESIS</span>
            </div>
        </div>
    </div>
  );
};
