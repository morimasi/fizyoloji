
/**
 * PHYSIOCORE GENESIS MEDIA TRANSCODER (v11.0 STABLE)
 * Optimized for PC Compatibility and High-Fidelity Clinical Loops.
 * Prevents "Corrupt File" errors by ensuring proper MediaRecorder flushing and valid containers.
 */

export type ExportFormat = 'mp4' | 'webm' | 'gif' | 'jpg' | 'ppt' | 'svg';

export class MediaConverter {
  private static readonly WIDTH = 1080;
  private static readonly HEIGHT = 1080;
  private static readonly FPS = 30;
  private static readonly DURATION_MS = 4000;

  static async export(
    source: string | { svg: string } | { slides: any[] }, 
    format: ExportFormat, 
    title: string
  ): Promise<void> {
    
    // 1. SVG Export
    if (format === 'svg' && typeof source === 'object' && 'svg' in source) {
        const blob = new Blob([source.svg], { type: 'image/svg+xml' });
        this.downloadBlob(blob, `${title}.svg`);
        return;
    }

    // 2. PPT Export (Data Portability)
    if (format === 'ppt' && typeof source === 'object' && 'slides' in source) {
        const content = JSON.stringify(source, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        this.downloadBlob(blob, `${title}_presentation.json`); 
        return;
    }

    const sourceUrl = typeof source === 'string' ? source : '';
    if (!sourceUrl) return;

    // 3. Direct VEO Download (Google Video URI usually points to an MP4)
    if (sourceUrl.includes('googlevideo.com')) {
       try {
         const response = await fetch(sourceUrl);
         if (!response.ok) throw new Error();
         const blob = await response.blob();
         this.downloadBlob(blob, `${title}.mp4`);
       } catch (e) {
         // Fallback to opening in new tab if CORS prevents fetch
         window.open(sourceUrl, '_blank');
       }
       return;
    }

    // 4. Sprite-to-Video Conversion
    // PC COMPATIBILITY NOTE: Native GIF encoding is not available in browser MediaRecorder.
    // Saving WebM as .gif causes "Corrupt File" errors on Windows.
    // We deliver high-compatibility MP4/WebM loops which act as "Modern GIFs".
    const blob = await this.generateBlob(sourceUrl, format);
    if (blob) {
        let ext = 'webm';
        if (blob.type.includes('mp4')) ext = 'mp4';
        else if (format === 'jpg') ext = 'jpg';
        
        const suffix = format === 'gif' ? '_loop' : '';
        this.downloadBlob(blob, `${title}${suffix}.${ext}`);
    }
  }

  static async generateBlob(sourceUrl: string, format: ExportFormat): Promise<Blob | null> {
    const image = await this.loadImage(sourceUrl);
    const canvas = document.createElement('canvas');
    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error("Canvas Context Fail");

    const rows = 4, cols = 4, totalFrames = 16;

    if (format === 'webm' || format === 'mp4' || format === 'gif') {
        return await this.recordMediaStream(canvas, ctx, image, rows, cols, totalFrames);
    }

    if (format === 'jpg') {
        this.drawGridFrame(ctx, image, 0, rows, cols, this.WIDTH, this.HEIGHT);
        return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    }

    return null;
  }

  private static async recordMediaStream(
    canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement,
    rows: number, cols: number, totalFrames: number
  ): Promise<Blob> {
    
    // PC Compatibility Priority: MP4 > WebM (VP9) > WebM (Default)
    const preferredMimes = [
        'video/mp4;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
    ];

    const mimeType = preferredMimes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
    const stream = canvas.captureStream(this.FPS);
    const recorder = new MediaRecorder(stream, { 
        mimeType, 
        videoBitsPerSecond: 8000000 // 8Mbps for 1080p clarity
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    return new Promise((resolve) => {
        recorder.onstop = () => {
            const finalBlob = new Blob(chunks, { type: mimeType });
            resolve(finalBlob);
        };

        recorder.start();

        let frame = 0;
        const totalDuration = this.DURATION_MS; 
        const maxFrames = Math.floor((this.FPS * totalDuration) / 1000);
        let capturedFrames = 0;
        
        const captureFrame = () => {
            if (capturedFrames >= maxFrames) { 
                // Delay stop slightly to ensure the last frame's buffer is processed
                setTimeout(() => recorder.stop(), 100);
                return; 
            }
            
            this.drawGridFrame(ctx, image, Math.floor(frame), rows, cols, this.WIDTH, this.HEIGHT);
            
            // Advance frame (16 frames looped over the duration)
            frame = (frame + (totalFrames / maxFrames)) % totalFrames;
            capturedFrames++;
            
            // Use requestAnimationFrame for smooth sync with canvas capture
            requestAnimationFrame(captureFrame);
        };

        requestAnimationFrame(captureFrame);
    });
  }

  private static drawGridFrame(ctx: CanvasRenderingContext2D, image: HTMLImageElement, frameIndex: number, rows: number, cols: number, w: number, h: number) {
      ctx.fillStyle = '#020617'; 
      ctx.fillRect(0, 0, w, h);
      
      const cw = image.width / cols;
      const ch = image.height / rows;
      const safeFrame = Math.floor(frameIndex) % (rows * cols);
      
      const sx = (safeFrame % cols) * cw;
      const sy = Math.floor(safeFrame / cols) * ch;

      ctx.drawImage(image, sx, sy, cw, ch, 0, 0, w, h);
      
      // Clinical Overlay (Watermark)
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
      ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(40, h - 110, 420, 70, 20);
      ctx.fill();

      ctx.font = 'bold 24px Inter, system-ui';
      ctx.fillStyle = '#06B6D4';
      ctx.fillText(`PHYSIOCORE AI GENESIS`, 65, h - 75);
      
      ctx.font = '500 16px Roboto, system-ui';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`CLINICAL MOTION LOOP • 1080P • ${safeFrame + 1}/16`, 65, h - 50);
      ctx.restore();
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image(); 
        img.crossOrigin = 'anonymous'; 
        img.src = url;
        img.onload = () => resolve(img); 
        img.onerror = () => {
            console.error("Transcoder Image Load Failed:", url);
            reject();
        };
    });
  }

  private static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = filename;
    document.body.appendChild(a); 
    a.click();
    // Use a slightly longer timeout to ensure browser trigger
    setTimeout(() => { 
        document.body.removeChild(a); 
        URL.revokeObjectURL(url); 
    }, 500);
  }
}
