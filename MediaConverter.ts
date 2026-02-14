
/**
 * PHYSIOCORE GENESIS MEDIA TRANSCODER (v4.0 ENTERPRISE)
 * Client-Side Video & Animation Transcoding Engine
 */

export type ExportFormat = 'mp4' | 'webm' | 'gif' | 'jpg' | 'png-sequence' | 'svg' | 'avi' | 'mpeg';

export class MediaConverter {
  private static readonly WIDTH = 1080;
  private static readonly HEIGHT = 1080;
  private static readonly FPS = 30;
  private static readonly DURATION_MS = 4000; // 4 saniyelik loop

  static async export(source: string | { svg: string }, format: ExportFormat, title: string): Promise<void> {
    if (format === 'svg') {
        const svgContent = typeof source === 'string' ? source : source.svg;
        if (!svgContent.startsWith('<svg')) {
            alert("Vektör verisi bulunamadı.");
            return;
        }
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        this.downloadBlob(blob, `${title}.svg`);
        return;
    }

    const sourceUrl = typeof source === 'string' ? source : '';
    if (!sourceUrl) return;

    const blob = await this.generateBlob(sourceUrl, format);
    if (blob) {
        const ext = this.getExtension(format);
        this.downloadBlob(blob, `${title}_export.${ext}`);
    }
  }

  private static getExtension(format: ExportFormat): string {
    const map: Record<string, string> = {
        mp4: 'mp4', webm: 'webm', gif: 'gif', jpg: 'jpg', 
        'png-sequence': 'zip', avi: 'avi', mpeg: 'mpeg'
    };
    return map[format] || 'dat';
  }

  static async generateBlob(sourceUrl: string, format: ExportFormat): Promise<Blob | null> {
    const image = await this.loadImage(sourceUrl);
    const canvas = document.createElement('canvas');
    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) throw new Error("Canvas context hatası.");

    // Grid Parametreleri (Dinamik Algılama)
    const rows = 4;
    const cols = 4;
    const totalFrames = 16;

    if (format === 'jpg') {
        this.drawGridFrame(ctx, image, 0, rows, cols, this.WIDTH, this.HEIGHT);
        return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    }

    return await this.recordMediaStream(canvas, ctx, image, rows, cols, totalFrames, format);
  }

  private static async recordMediaStream(
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    image: HTMLImageElement,
    rows: number,
    cols: number,
    totalFrames: number,
    format: ExportFormat
  ): Promise<Blob> {
    
    // Tarayıcı desteğine göre MIME type belirleme
    let mimeType = 'video/webm;codecs=vp9';
    if (format === 'mp4') mimeType = 'video/mp4';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    const stream = canvas.captureStream(this.FPS);
    const recorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 8000000 
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
        recorder.onstop = () => {
             const blob = new Blob(chunks, { type: mimeType });
             resolve(blob);
        };
        recorder.onerror = (e) => reject(e);
        recorder.start();

        let frameIndex = 0;
        let elapsedFrames = 0;
        const maxFrames = this.FPS * (this.DURATION_MS / 1000);

        const animate = () => {
            if (elapsedFrames >= maxFrames) {
                recorder.stop();
                return;
            }
            this.drawGridFrame(ctx, image, frameIndex, rows, cols, this.WIDTH, this.HEIGHT);
            frameIndex = (frameIndex + 1) % totalFrames;
            elapsedFrames++;
            setTimeout(() => requestAnimationFrame(animate), 1000 / this.FPS);
        };
        requestAnimationFrame(animate);
    });
  }

  private static drawGridFrame(ctx: CanvasRenderingContext2D, image: HTMLImageElement, frameIndex: number, rows: number, cols: number, w: number, h: number) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      const cellW = image.width / cols;
      const cellH = image.height / rows;
      const colIndex = frameIndex % cols;
      const rowIndex = Math.floor(frameIndex / cols);

      ctx.drawImage(image, colIndex * cellW, rowIndex * cellH, cellW, cellH, 0, 0, w, h);

      // Klinik Watermark & HUD simulation
      ctx.save();
      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.textAlign = 'right';
      ctx.fillText('PHYSIOCORE GENESIS PRO', w - 40, h - 40);
      
      // Decorative HUD lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, w - 40, h - 40);
      ctx.restore();
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; 
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Resim yüklenemedi.`));
    });
  }

  private static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
  }
}
