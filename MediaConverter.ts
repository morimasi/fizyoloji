
/**
 * PHYSIOCORE GENESIS MEDIA ENGINE (v2.0 STABLE)
 * Client-Side Video & Animation Transcoder
 * 
 * Özellikler:
 * - Ultra-Stabil Canvas-to-Video motoru.
 * - Sprite Sheet ayrıştırma mantığı (Sol/Sağ kare).
 * - "Yalan Söylemeyen" dosya formatları (WebM, JPG, PNG).
 * - Asenkron Promise tabanlı kayıt sistemi.
 */

export type ExportFormat = 'webm' | 'gif' | 'jpg' | 'png-sequence';

export class MediaConverter {
  private static readonly WIDTH = 1920;
  private static readonly HEIGHT = 1080;
  private static readonly FPS = 30;
  private static readonly DURATION_MS = 4000; // 4 saniyelik loop (2 tam tur)

  /**
   * Ana dönüştürme fonksiyonu (Public Entry Point)
   */
  static async export(sourceUrl: string, format: ExportFormat, title: string): Promise<void> {
    const image = await this.loadImage(sourceUrl);
    
    // Canvas Hazırlığı (High-DPI Support)
    const canvas = document.createElement('canvas');
    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    const ctx = canvas.getContext('2d', { alpha: false }); // Alpha false performans artırır
    
    if (!ctx) throw new Error("Canvas context hatası.");

    switch (format) {
        case 'jpg':
            // Poster oluştur (Sol frame - Başlangıç pozisyonu)
            this.drawFrame(ctx, image, 0, this.WIDTH, this.HEIGHT);
            canvas.toBlob((blob) => {
                if(blob) this.downloadBlob(blob, `${title}_Poster.jpg`);
            }, 'image/jpeg', 0.95);
            break;

        case 'png-sequence':
            // Sunum için A/B karelerini ayrı ayrı indir
            this.drawFrame(ctx, image, 0, this.WIDTH, this.HEIGHT);
            canvas.toBlob(blob => blob && this.downloadBlob(blob, `${title}_Start.png`));
            
            setTimeout(() => {
                this.drawFrame(ctx, image, 1, this.WIDTH, this.HEIGHT);
                canvas.toBlob(blob => blob && this.downloadBlob(blob, `${title}_End.png`));
            }, 200);
            break;

        case 'webm':
        case 'gif': 
            // GIF isteği gelse bile, tarayıcıda en stabil olan WebM veriyoruz.
            // GIF oluşturmak için heavy-library (gif.js) gerekir, pure-js WebM daha temizdir.
            // Kullanıcıya dürüstçe WebM olduğunu dosya adında belirtiyoruz ama format parametresini esnek tutuyoruz.
            const blob = await this.recordAnimation(canvas, ctx, image);
            this.downloadBlob(blob, `${title}_animation.webm`);
            break;
    }
  }

  /**
   * Sprite Animasyonunu Kaydeder (Robust Recorder)
   */
  private static async recordAnimation(
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    image: HTMLImageElement
  ): Promise<Blob> {
    
    // Tarayıcı desteğini kontrol et
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm'; // Fallback

    const stream = canvas.captureStream(this.FPS);
    const recorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps Ultra Kalite
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
        recorder.onstop = () => {
             const blob = new Blob(chunks, { type: mimeType });
             if (blob.size === 0) reject(new Error("Kayıt boş, blob oluşturulamadı."));
             else resolve(blob);
        };

        recorder.onerror = (e) => reject(e);

        // Kaydı başlat
        recorder.start();

        // Animasyon Döngüsü
        let startTime = performance.now();
        const frameDuration = 1000; // 1 saniye bekleme süresi

        const animate = (timestamp: number) => {
            const elapsed = timestamp - startTime;
            
            // Süre dolduysa durdur
            if (elapsed >= this.DURATION_MS) {
                recorder.stop();
                return;
            }

            // Frame Logic: 1 saniyede bir kare değiştir
            // Math.floor(elapsed / 1000) bize saniyeyi verir. % 2 ile 0 veya 1 alırız.
            const frameIndex = Math.floor(elapsed / frameDuration) % 2;

            // Çizim
            this.drawFrame(ctx, image, frameIndex, this.WIDTH, this.HEIGHT);

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    });
  }

  /**
   * Tek bir kareyi canvas'a çizer (Sprite Mantığı Burada)
   */
  private static drawFrame(
      ctx: CanvasRenderingContext2D, 
      image: HTMLImageElement, 
      frameIndex: number,
      w: number, 
      h: number
  ) {
      // Arka plan (Dark Mode)
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      // Sprite hesaplama:
      // Resim aslında 2W genişliğinde. 
      // Sol kare (Start): x=0, w=image.width/2
      // Sağ kare (End): x=image.width/2, w=image.width/2
      const sourceW = image.width / 2;
      const sourceH = image.height;
      const sourceX = frameIndex === 0 ? 0 : sourceW;

      // Resmi canvas'a sığdır (Aspect Ratio koruyarak cover yap)
      // Basitlik için stretch yapıyoruz, ama production'da aspect-ratio hesabı eklenebilir.
      ctx.drawImage(
          image, 
          sourceX, 0, sourceW, sourceH, // Source Crop
          0, 0, w, h // Dest Resize
      );

      // Watermark (Profesyonel İmza)
      ctx.save();
      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'right';
      ctx.fillText('PHYSIOCORE AI', w - 40, h - 40);
      
      // Frame Indicator (Klinik Analiz İçin)
      ctx.font = 'bold 18px Monospace';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)'; // Cyan
      ctx.textAlign = 'left';
      ctx.fillText(frameIndex === 0 ? '► START POS' : '► END POS', 40, h - 40);
      ctx.restore();
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // CORS hatasını önlemek için kritik
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Resim yüklenemedi: ${url}`));
    });
  }

  private static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Temizlik
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
  }
}
