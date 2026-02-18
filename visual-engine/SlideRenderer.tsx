
import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * SLIDE FRAME EXTRACTOR ENGINE
 * Extracts a specific frame from the sprite sheet to use as a slide image.
 * Maps step index (0-9) to frame index (0-15 or 0-24).
 */
export const SlideFrameRenderer = ({ src, stepIndex, totalSteps, layout }: { src: string, stepIndex: number, totalSteps: number, layout: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (!src || !canvasRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const ctx = canvasRef.current!.getContext('2d');
      if (!ctx) return;

      const isCinematic = layout === 'grid-5x5';
      const cols = isCinematic ? 5 : 4;
      const rows = isCinematic ? 5 : 4;
      const totalFrames = cols * rows;

      // Map 10 steps to N frames (e.g., Step 1->Frame 0, Step 10->Frame 15)
      // Math.floor logic ensures even distribution across the movement range.
      const mappedFrameIndex = Math.floor((stepIndex / (totalSteps - 1)) * (totalFrames - 1));
      
      const frameW = img.width / cols;
      const frameH = img.height / rows;
      
      const sx = (mappedFrameIndex % cols) * frameW;
      const sy = Math.floor(mappedFrameIndex / cols) * frameH;

      canvasRef.current!.width = 400; // High res thumbnail
      canvasRef.current!.height = 400;

      // Draw cropped frame
      ctx.drawImage(img, sx, sy, frameW, frameH, 0, 0, 400, 400);
      
      // Draw Step Badge
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.arc(40, 40, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((stepIndex + 1).toString(), 40, 40);

      setIsRendered(true);
    };
  }, [src, stepIndex, totalSteps, layout]);

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-lg group-hover:border-cyan-500/50 transition-all">
      {!isRendered && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-slate-600" /></div>}
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
    </div>
  );
};
