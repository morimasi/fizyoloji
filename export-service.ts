
import { PatientProfile, Exercise } from './types';

export const simulatePDFExport = (profile: PatientProfile) => {
  console.log("Generating Clinical PDF for:", profile.diagnosisSummary);
  
  // Profesyonel yazdırma penceresini simüle et
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const exerciseRows = profile.suggestedPlan.map(ex => `
    <div style="border-bottom: 1px solid #e2e8f0; padding: 15px 0;">
      <h3 style="margin: 0; color: #0f172a;">${ex.code} - ${ex.title}</h3>
      <p style="margin: 5px 0; font-size: 14px; color: #475569;">${ex.sets} Set x ${ex.reps} Tekrar | Zorluk: ${ex.difficulty}/10</p>
      <p style="margin: 5px 0; font-size: 12px; color: #64748b;"><strong>Talimat:</strong> ${ex.description}</p>
    </div>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>PhysioCore AI - Klinik Reçete</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 3px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .logo { font-weight: 900; font-style: italic; font-size: 24px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-bottom: 10px; }
          .qr-placeholder { width: 100px; height: 100px; background: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">PHYSIOCORE <span style="color: #06b6d4;">AI</span></div>
            <p style="font-size: 10px; margin: 0;">GENESIS v3.1 CLINICAL EXPORT</p>
          </div>
          <div class="qr-placeholder">MOBİL TAKİP İÇİN<br>QR KODU OKUTUN</div>
        </div>
        <div class="section">
          <div class="section-title">Klinik Tanı Özeti</div>
          <p style="font-size: 16px; font-style: italic;">"${profile.diagnosisSummary}"</p>
        </div>
        <div class="section">
          <div class="section-title">Egzersiz Programı</div>
          ${exerciseRows}
        </div>
        <div style="margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center;">
          Bu belge PhysioCore AI tarafından oluşturulmuştur. Tıbbi tavsiye yerine geçmez, fizyoterapist eşliğinde uygulanmalıdır.
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
