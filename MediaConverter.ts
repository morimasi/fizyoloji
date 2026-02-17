
/**
 * PHYSIOCORE GENESIS MEDIA TRANSCODER (v12.0 PRO)
 * - Fixes "Corrupt File" on Windows via Strict Buffer Flushing
 * - Fixes "Zoomed In" Sprite issue via Aspect Ratio Fitting (Contain Mode)
 * - Supports Auto-Resolution Switching (16:9 Landscape / 1:1 Square)
 */

export type ExportFormat = 'mp4' | 'webm' | 'gif' | 'jpg' | 'ppt' | 'svg';

interface Resolution {
  width: number;
  height: number;
}

export class MediaConverter {
  private static readonly FPS = 30;
  private static readonly DURATION_MS = 4000; // 4 saniyelik loop

  // Profesyonel Çıktı Çözünürlükleri
  private static readonly RES_SQUARE: Resolution = { width: 1080, height: 1080 }; // Instagram/Mobile
  private static readonly RES_LANDSCAPE: Resolution = { width: 1920, height: 1080 }; // PC/Presentation

  static async export(
    source: string | { svg: string } | { slides: any[] }, 
    format: ExportFormat, 
    title: string
  ): Promise<void> {
    
    // 1. SVG Export (Vektör - Ölçekten bağımsız)
    if (format === 'svg' && typeof source === 'object' && 'svg' in source) {
        const blob = new Blob([source.svg], { type: 'image/svg+xml' });
        this.downloadBlob(blob, `${title}.svg`);
        return;
    }

    // 2. PPT Export (JSON Veri Paketi)
    if (format === 'ppt' && typeof source === 'object' && 'slides' in source) {
        const content = JSON.stringify(source, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        this.downloadBlob(blob, `${title}_presentation.json`); 
        return;
    }

    const sourceUrl = typeof source === 'string' ? source : '';
    if (!sourceUrl) return;

    // 3. Veo / Direct Video URL (İndirme Proxy)
    if (sourceUrl.includes('googlevideo.com') || sourceUrl.endsWith('.mp4')) {
       try {
         const response = await fetch(sourceUrl);
         if (!response.ok) throw new Error("Network response was not ok");
         const blob = await response.blob();
         this.downloadBlob(blob, `${title}.mp4`);
       } catch (e) {
         // CORS hatası durumunda yeni sekmede aç (Fallback)
         console.warn("Direct download failed, opening tab.", e);
         window.open(sourceUrl, '_blank');
       }
       return;
    }

    // 4. Sprite-to-Video (Smart Scale Engine)
    // PC için 16:9 (Landscape), Mobil/GIF için 1:1 (Square) otomatik seçim
    const targetRes = (format === 'mp4' || format === 'webm') ? this.RES_LANDSCAPE : this.RES_SQUARE;
    
    const blob = await this.generateBlob(sourceUrl, format, targetRes);
    
    if (blob) {
        // Windows Media Player uyumluluğu için uzantı yönetimi
        let ext = 'webm'; 
        if (format === 'jpg') ext = 'jpg';
        // Not: Tarayıcı MP4 codec'ini desteklemiyorsa WebM üretir. 
        // Dosya bozuk uyarısı almamak için uzantıyı içeriğe uygun veriyoruz.
        if (format === 'mp4' && blob.type.includes('mp4')) ext = 'mp4';
        
        const suffix = format === 'gif' ? '_loop' : '_clinical';
        this.downloadBlob(blob, `${title}${suffix}.${ext}`);
    }
  }

  static async generateBlob(sourceUrl: string, format: ExportFormat, res: Resolution): Promise<Blob | null> {
    const image = await this.loadImage(sourceUrl);
    const canvas = document.createElement('canvas');
    canvas.width = res.width;
    canvas.height = res.height;
    
    // Alpha kanalı kapalı (Siyah arka plan performansı artırır)
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error("Canvas Context Fail");

    const rows = 4, cols = 4, totalFrames = 16;

    if (format === 'webm' || format === 'mp4' || format === 'gif') {
        return await this.recordMediaStream(canvas, ctx, image, rows, cols, totalFrames);
    }

    if (format === 'jpg') {
        // Poster için ilk kareyi çiz
        this.drawScaledFrame(ctx, image, 0, rows, cols, canvas.width, canvas.height);
        return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    }

    return null;
  }

  private static async recordMediaStream(
    canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement,
    rows: number, cols: number, totalFrames: number
  ): Promise<Blob> {
    
    // Tarayıcı desteğine göre en iyi codec'i seç
    const mimeType = [
        'video/webm;codecs=vp9', // Yüksek Kalite
        'video/webm;codecs=vp8', // Geniş Uyumluluk
        'video/webm'             // Fallback
    ].find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';

    const stream = canvas.captureStream(this.FPS);
    const recorder = new MediaRecorder(stream, { 
        mimeType, 
        videoBitsPerSecond: 12000000 // 12 Mbps (High Fidelity)
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { 
        if (e.data && e.data.size > 0) chunks.push(e.data); 
    };

    return new Promise((resolve) => {
        // Stop olayı tetiklendiğinde Blob'u oluştur ve döndür
        recorder.onstop = () => {
            const finalBlob = new Blob(chunks, { type: mimeType });
            resolve(finalBlob);
        };

        recorder.start();

        let frame = 0;
        const totalDuration = this.DURATION_MS; 
        const maxFramesToRecord = Math.floor((this.FPS * totalDuration) / 1000);
        let capturedFrames = 0;
        
        const renderLoop = () => {
            // Buffer flushing garantisi için biraz bekle ve durdur
            if (capturedFrames >= maxFramesToRecord) { 
                setTimeout(() => recorder.stop(), 200); 
                return; 
            }
            
            // SMART SCALE DRAWING
            this.drawScaledFrame(ctx, image, Math.floor(frame), rows, cols, canvas.width, canvas.height);
            
            frame = (frame + (totalFrames / maxFramesToRecord)) % totalFrames;
            capturedFrames++;
            
            requestAnimationFrame(renderLoop);
        };

        requestAnimationFrame(renderLoop);
    });
  }

  /**
   * CORE LOGIC: Aspect Ratio Preserving Scaler
   * Görüntüyü canvas içine sığdırır (Letterboxing), kırpmayı ve zoom etkisini önler.
   */
  private static drawScaledFrame(
      ctx: CanvasRenderingContext2D, 
      image: HTMLImageElement, 
      frameIndex: number, 
      rows: number, 
      cols: number, 
      canvasW: number, 
      canvasH: number
  ) {
      // 1. Arka planı temizle (Sinematik Siyah)
      ctx.fillStyle = '#020617'; 
      ctx.fillRect(0, 0, canvasW, canvasH);
      
      // 2. Kaynak Kare Boyutlarını Hesapla
      const spriteW = image.width / cols;
      const spriteH = image.height / rows;
      
      const safeFrame = Math.floor(frameIndex) % (rows * cols);
      const sx = (safeFrame % cols) * spriteW;
      const sy = Math.floor(safeFrame / cols) * spriteH;

      // 3. "Contain" Mantığı (Sığdırma Oranı)
      const scale = Math.min(canvasW / spriteW, canvasH / spriteH) * 0.9; // %90 doluluk (kenar boşluğu için)
      
      const destW = spriteW * scale;
      const destH = spriteH * scale;
      
      // 4. Merkeze Konumlandırma
      const dx = (canvasW - destW) / 2;
      const dy = (canvasH - destH) / 2;

      // 5. Çizim
      ctx.drawImage(image, sx, sy, spriteW, spriteH, dx, dy, destW, destH);
      
      // 6. Profesyonel Watermark (Opsiyonel - PC'de dosya açılınca kurum adı görünsün)
      this.drawWatermark(ctx, canvasW, canvasH, safeFrame);
  }

  private static drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) {
      ctx.save();
      
      // Alt Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(0, h - 60, w, 60);

      // Logo Text
      ctx.font = `bold ${Math.floor(h * 0.025)}px Inter, sans-serif`;
      ctx.fillStyle = '#06B6D4';
      ctx.fillText(`PHYSIOCORE AI GENESIS`, 40, h - 22);
      
      // Info Text
      ctx.font = `${Math.floor(h * 0.02)}px Roboto, sans-serif`;
      ctx.fillStyle = '#94a3b8';
      const timeCode = `FRAME ${frame+1}/16`;
      ctx.textAlign = 'right';
      ctx.fillText(timeCode, w - 40, h - 22);
      
      ctx.restore();
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image(); 
        img.crossOrigin = 'anonymous'; // CORS hatasını önlemek için kritik
        img.src = url;
        img.onload = () => resolve(img); 
        img.onerror = () => {
            console.error("Image load error:", url);
            reject(new Error("Görsel yüklenemedi."));
        };
    });
  }

  private static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.style.display = 'none';
    a.href = url; 
    a.download = filename;
    document.body.appendChild(a); 
    
    a.click();
    
    // Blob URL'ini temizle (Memory leak önleme)
    setTimeout(() => { 
        document.body.removeChild(a); 
        window.URL.revokeObjectURL(url); 
    }, 2000); // 2 saniye bekle ki tarayıcı indirmeyi başlatsın
  }
}
