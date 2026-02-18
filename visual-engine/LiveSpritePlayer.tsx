
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Activity } from 'lucide-react';

/**
 * GENESIS "TEMPORAL-FLOW" ENGINE v5.0 (Component Module)
 * Protocol: Time-Mapped Frame Interpolation with Easing Functions.
 */
export const LiveSpritePlayer = ({ src, isPlaying = true, layout = 'grid-4x4', speed = 1.0, smoothing = true }: { src: string, isPlaying?: boolean, layout?: string, speed?: number, smoothing?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Store crop coordinates and offsets
  const registeredFrames = useRef<{
      sx: number, sy: number, 
      cropSize: number, 
      dx: number, dy: number 
  }[]>([]);

  useEffect(() => {
    setIsLoaded(false);
    setIsAnalyzing(true);
    registeredFrames.current = [];

    imageRef.current.crossOrigin = "anonymous"; 
    imageRef.current.src = src;
    
    imageRef.current.onload = () => {
      normalizeAndRegisterFrames(imageRef.current, layout);
      setIsAnalyzing(false);
      setIsLoaded(true);
    };
  }, [src, layout]);

  const normalizeAndRegisterFrames = (img: HTMLImageElement, currentLayout: string) => {
    const isCinematic = currentLayout === 'grid-5x5';
    const cols = isCinematic ? 5 : 4;
    const rows = isCinematic ? 5 : 4;
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

    const frames: any[] = [];
    const BG_COLOR = { r: 2, g: 6, b: 23 }; 
    const THRESHOLD = 35; 

    for (let i = 0; i < totalFrames; i++) {
        const cellX = (i % cols) * rawCellW;
        const cellY = Math.floor(i / cols) * rawCellH;
        const srcX = Math.floor(cellX + cropOffsetX);
        const srcY = Math.floor(cellY + cropOffsetY);

        ctx.clearRect(0, 0, cropSize, cropSize);
        ctx.drawImage(img, srcX, srcY, cropSize, cropSize, 0, 0, cropSize, cropSize);

        const frameData = ctx.getImageData(0, 0, cropSize, cropSize);
        const data = frameData.data;
        
        let minX = cropSize, maxX = 0, minY = cropSize, maxY = 0;
        let found = false;

        for (let y = 0; y < cropSize; y += 2) {
            for (let x = 0; x < cropSize; x += 2) {
                const idx = (y * cropSize + x) * 4;
                const dist = Math.sqrt(
                    Math.pow(data[idx] - BG_COLOR.r, 2) + 
                    Math.pow(data[idx+1] - BG_COLOR.g, 2) + 
                    Math.pow(data[idx+2] - BG_COLOR.b, 2)
                );

                if (dist > THRESHOLD) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }

        let dx = 0, dy = 0;
        if (found) {
            const subjectCenterX = (minX + maxX) / 2;
            const subjectCenterY = (minY + maxY) / 2;
            dx = (cropSize / 2) - subjectCenterX;
            dy = (cropSize / 2) - subjectCenterY;
        }

        frames.push({ sx: srcX, sy: srcY, cropSize, dx, dy });
    }
    registeredFrames.current = frames;
  };

  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const isCinematic = layout === 'grid-5x5';
    const totalFrames = isCinematic ? 25 : 16;
    
    // TEMPORAL ENGINE CONFIG
    const BASE_DURATION = 2500; // 2.5 seconds for a full loop at 1x speed
    let startTimestamp = performance.now();

    const canvas = canvasRef.current!;
    canvas.width = 1080;
    canvas.height = 1080;

    const drawFrame = (frameIdx: number, progress: number) => {
        const img = imageRef.current;
        const frameData = registeredFrames.current[frameIdx];
        if (!frameData) return;

        ctx.fillStyle = '#020617'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const scale = (canvas.width * 0.85) / frameData.cropSize;
        const drawSize = Math.floor(frameData.cropSize * scale);
        
        let destX = (canvas.width - drawSize) / 2;
        let destY = (canvas.height - drawSize) / 2;

        destX += frameData.dx * scale;
        destY += frameData.dy * scale;

        ctx.drawImage(
            img, 
            frameData.sx, frameData.sy, frameData.cropSize, frameData.cropSize, 
            Math.floor(destX), Math.floor(destY), drawSize, drawSize
        );

        // Progress Bar Overlay
        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.fillRect(0, canvas.height - 6, canvas.width * progress, 6);
        
        // Tech Stats
        ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
        ctx.fillRect(20, 20, 140, 50);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#22d3ee';
        ctx.fillText(`FRAME: ${frameIdx + 1}/${totalFrames}`, 30, 40);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`SPEED: ${speed.toFixed(1)}x`, 30, 55);
    };

    const animate = (time: number) => {
      if (!isPlaying) {
          requestRef.current = requestAnimationFrame(animate);
          return;
      }

      // 1. Calculate Global Progress (0.0 -> 1.0)
      const duration = BASE_DURATION / speed;
      const elapsed = time - startTimestamp;
      const rawProgress = (elapsed % duration) / duration;

      // 2. Apply Easing (Smoother motion perception)
      // Linear is robotic. Ease-In-Out is organic.
      let adjustedProgress = rawProgress;
      if (smoothing) {
          // SmoothStep function: 3x^2 - 2x^3
          adjustedProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      }

      // 3. Map to Discrete Frame
      // We clamp the index to ensure it never hits 'totalFrames' (which is out of bounds)
      const frameIndex = Math.min(
          Math.floor(adjustedProgress * totalFrames), 
          totalFrames - 1
      );

      drawFrame(frameIndex, rawProgress);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, isPlaying, layout, speed, smoothing]);

  if (!isLoaded || isAnalyzing) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/20 gap-4">
        <Loader2 size={48} className="text-cyan-500 animate-spin" />
        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">TEMPORAL SYNC</p>
    </div>
  );

  return (
    <div className="relative w-full h-full group">
        <canvas ref={canvasRef} className="w-full h-full object-contain rounded-[3rem] shadow-2xl" />
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
            <Activity size={14} className={smoothing ? "text-emerald-500" : "text-amber-500"} />
            <span className="text-[10px] font-black font-mono text-white uppercase tracking-widest">
                {smoothing ? 'ORGANIC FLOW' : 'LINEAR STEP'}
            </span>
        </div>
    </div>
  );
};
