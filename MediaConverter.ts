
/**
 * PHYSIOCORE GENESIS MEDIA ENGINE (v1.0)
 * Client-Side Video & Animation Transcoder
 * 
 * Bu modül, sunucu maliyeti olmadan (Serverless), tarayıcının GPU'sunu kullanarak
 * statik Sprite Sheet görsellerini gerçek video dosyalarına dönüştürür.
 */

export type ExportFormat = 'mp4' | 'webm' | 'gif' | 'svg' | 'png-sequence';

export class MediaConverter {
  private static readonly WIDTH = 1920;
  private static readonly HEIGHT = 1080;
  private static readonly FPS = 30;
  private static readonly DURATION_SEC = 3; // 3 saniyelik loop

  /**
   * Ana dönüştürme fonksiyonu
   */
  static async export(sourceUrl: string, format: ExportFormat, title: string): Promise<void> {
    const image = await this.loadImage(sourceUrl);
    
    // Canvas Kurulumu (Off-screen render)
    const canvas = document.createElement('canvas');
    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error("Canvas context oluşturulamadı.");

    // Format mantığı
    switch (format) {
        case 'svg':
            this.downloadBlob(await this.createSVG(sourceUrl), `${title}.svg`);
            break;
        case 'png-sequence':
            // PPT sunumları için kare kare indirir
            this.downloadBlob(await this.createFrame(image, 0), `${title}_Start_Frame.png`);
            setTimeout(async () => {
                this.downloadBlob(await this.createFrame(image, 1), `${title}_End_Frame.png`);
            }, 500);
            break;
        case 'mp4':
        case 'webm':
            const blob = await this.recordCanvas(canvas, ctx, image, format);
            this.downloadBlob(blob, `${title}.${format}`);
            break;
        case 'gif':
            // Not: Tarayıcılar native GIF encoder barındırmaz. 
            // GIF isteği gelirse, en uyumlu format olan WebM (Modern GIF) olarak veriyoruz
            // veya hafif bir video döngüsü oluşturuyoruz.
            const gifBlob = await this.recordCanvas(canvas, ctx, image, 'webm'); 
            this.downloadBlob(gifBlob, `${title}_animated.webm`);
            break;
    }
  }

  /**
   * Sprite Sheet'i parçalar ve video olarak kaydeder.
   */
  private static async recordCanvas(
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    image: HTMLImageElement,
    format: string
  ): Promise<Blob> {
    const stream = canvas.captureStream(this.FPS);
    
    // Tarayıcı desteğine göre MIME type seçimi
    let mimeType = 'video/webm;codecs=vp9';
    if (format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
    } else if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm'; // Fallback
    }

    const recorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 5000000 // 5 Mbps Yüksek Kalite
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    // Animasyon Döngüsü (Rendering Loop)
    let startTime = performance.now();
    let frameIndex = 0;
    const frameDuration = 1000; // 1 saniye her kare
    let lastToggle = 0;

    return new Promise((resolve, reject) => {
        recorder.onstop = () => {
             const blob = new Blob(chunks, { type: mimeType });
             resolve(blob);
        };

        recorder.start();

        const draw = (now: number) => {
            // Süre dolduysa durdur
            if (now - startTime > this.DURATION_SEC * 1000) {
                recorder.stop();
                return;
            }

            // Sprite Logic: Görselin yarısını çiz (Sol veya Sağ)
            // image.width / 2 çünkü resim yan yana iki kareden oluşuyor.
            const sourceX = frameIndex === 0 ? 0 : image.width / 2;
            
            // Arka planı temizle (Siyah)
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Resmi ortalayarak çiz
            ctx.drawImage(
                image, 
                sourceX, 0, image.width / 2, image.height, // Source Crop
                0, 0, canvas.width, canvas.height // Dest
            );

            // Watermark Ekle
            ctx.font = 'bold 30px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText('PhysioCore AI', 50, 1030);

            // Kare Değiştirme Mantığı (Flipbook)
            if (now - lastToggle > frameDuration) {
                frameIndex = frameIndex === 0 ? 1 : 0;
                lastToggle = now;
            }

            requestAnimationFrame(draw);
        };

        requestAnimationFrame(draw);
    });
  }

  private static async createFrame(image: HTMLImageElement, frameIndex: number): Promise<Blob> {
      const canvas = document.createElement('canvas');
      canvas.width = this.WIDTH;
      canvas.height = this.HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Context error");

      const sourceX = frameIndex === 0 ? 0 : image.width / 2;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, sourceX, 0, image.width / 2, image.height, 0, 0, canvas.width, canvas.height);

      return new Promise(resolve => canvas.toBlob(blob => resolve(blob!)));
  }

  private static async createSVG(url: string): Promise<Blob> {
      // Raster görüntüyü SVG içine gömer (Wrapper)
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
            <rect width="100%" height="100%" fill="#0F172A"/>
            <image href="${url}" x="0" y="0" width="1920" height="1080" />
            <text x="50" y="1030" fill="white" font-family="Arial" font-size="30">PhysioCore AI</text>
        </svg>
      `;
      return new Blob([svgContent], { type: 'image/svg+xml' });
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
  }

  private static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
