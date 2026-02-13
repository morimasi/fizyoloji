
import React, { useState } from 'react';
import { 
  Download, Share2, Archive, Star, 
  Instagram, Linkedin, MessageCircle, Copy, Check, FileText, Smartphone,
  ExternalLink, Mail, Film, FileImage, Presentation, FileVideo, ChevronDown, Loader2
} from 'lucide-react';
import { Exercise } from './types.ts';
import { PhysioDB } from './db-repository.ts';
import { MediaConverter, ExportFormat } from './MediaConverter.ts';

interface ExerciseActionsProps {
  exercise: Exercise;
  onUpdate?: () => void;
  variant?: 'card' | 'player';
}

export const ExerciseActions: React.FC<ExerciseActionsProps> = ({ exercise, onUpdate, variant = 'card' }) => {
  const [showShare, setShowShare] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(exercise.isFavorite || false);

  const handleExport = async (format: ExportFormat) => {
    const url = exercise.visualUrl || exercise.videoUrl;
    if (!url) {
      alert("Lütfen önce bir AI görseli üretin.");
      return;
    }

    setIsConverting(true);
    try {
        await MediaConverter.export(url, format, `PhysioCore_${exercise.code}`);
        console.log("Export success");
    } catch (err) {
        console.error("Export failed:", err);
        alert("Dönüştürme başarısız oldu. Tarayıcı desteğini kontrol edin.");
    } finally {
        setIsConverting(false);
        setShowExportMenu(false);
    }
  };

  const handleArchive = () => {
    const updated = { ...exercise, isArchived: !exercise.isArchived };
    PhysioDB.updateExercise(updated);
    onUpdate?.();
  };

  const toggleFavorite = () => {
    const updated = { ...exercise, isFavorite: !isFavorite };
    PhysioDB.updateExercise(updated);
    setIsFavorite(!isFavorite);
    onUpdate?.();
  };

  const copyToClipboard = () => {
    const content = `PhysioCore AI | Sinematik Klinik Reçete: ${exercise.title} (${exercise.code})\n\nBiyomekanik: ${exercise.biomechanics}\nEgzersiz Linki: ${window.location.origin}/share/${exercise.id}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: string) => {
    const text = encodeURIComponent(`PhysioCore AI: ${exercise.titleTr || exercise.title} klinik egzersiz animasyonunu inceleyin.`);
    const url = encodeURIComponent(window.location.origin);
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      instagram: `https://www.instagram.com/` 
    };
    if (links[platform]) window.open(links[platform], '_blank');
  };

  const socialLinks = [
    { id: 'linkedin', icon: Linkedin, color: 'hover:text-blue-500', label: 'LinkedIn', bg: 'bg-[#0077b5]/10' },
    { id: 'instagram', icon: Instagram, color: 'hover:text-pink-500', label: 'Instagram', bg: 'bg-[#e4405f]/10' },
    { id: 'whatsapp', icon: MessageCircle, color: 'hover:text-green-500', label: 'WhatsApp', bg: 'bg-[#25d366]/10' },
    { id: 'mobile', icon: Smartphone, color: 'hover:text-cyan-500', label: 'App Sync', bg: 'bg-cyan-500/10' }
  ];

  const exportOptions = [
      { id: 'mp4', label: 'MP4 Video', icon: FileVideo, desc: 'Mobil & Sosyal Medya İçin' },
      { id: 'webm', label: 'WebM (Hafif)', icon: Film, desc: 'Web Siteleri İçin' },
      { id: 'gif', label: 'Hareketli GIF', icon: FileImage, desc: 'E-Posta & Mesajlaşma' },
      { id: 'png-sequence', label: 'Sunum Slaytları', icon: Presentation, desc: 'PowerPoint İçin Kareler' },
      { id: 'svg', label: 'Vektörel SVG', icon: FileText, desc: 'Yüksek Çözünürlüklü Baskı' },
  ];

  if (variant === 'player') {
    return (
      <div className="flex items-center gap-4 relative">
        <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              disabled={isConverting}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 transition-all shadow-xl hover:scale-105 active:scale-95 group flex items-center gap-2" 
              title="Medya Dönüştürücü"
            >
              {isConverting ? <Loader2 size={24} className="animate-spin text-cyan-500" /> : <Download size={24} className="group-hover:translate-y-0.5 transition-transform" />}
              <span className="text-[10px] font-black uppercase hidden md:inline">İNDİR</span>
              <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute bottom-full left-0 mb-4 bg-slate-950 border border-slate-800 p-2 rounded-2xl shadow-2xl min-w-[240px] z-50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-3 border-b border-slate-800 mb-2">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">EXPORT FORMATI SEÇİN</p>
                    </div>
                    {exportOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleExport(opt.id as ExportFormat)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 text-left group transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                <opt.icon size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase">{opt.label}</p>
                                <p className="text-[8px] text-slate-600 group-hover:text-cyan-400/80">{opt.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
                </>
            )}
        </div>
        
        {/* Share Button Logic (Mevcut kod aynen korunuyor) */}
        <div className="relative">
          <button 
            onClick={() => setShowShare(!showShare)} 
            className={`p-5 rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 ${showShare ? 'bg-white text-slate-950' : 'bg-cyan-500 text-white shadow-cyan-500/30'}`} 
            title="Klinik Paylaşım"
          >
            <Share2 size={24} />
          </button>
          
          {showShare && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShare(false)} />
              <div className="absolute bottom-full right-0 mb-6 bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-6 duration-500 min-w-[320px] z-50">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                 <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-6 text-center font-black">ULTRA_SHARE_INTERFACE v5.2</p>
                 
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    {socialLinks.map(soc => (
                      <button 
                        key={soc.id} 
                        onClick={() => shareToSocial(soc.id)}
                        className={`flex flex-col items-center gap-3 p-5 ${soc.bg} rounded-[2rem] transition-all ${soc.color} group border border-transparent hover:border-white/10`}
                      >
                        <soc.icon size={28} className="group-hover:scale-125 transition-transform duration-500" />
                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-white">{soc.label}</span>
                      </button>
                    ))}
                 </div>
                 
                 <div className="space-y-3 relative z-10">
                    <button 
                      onClick={copyToClipboard} 
                      className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-inner group"
                    >
                      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="group-hover:rotate-12 transition-transform" />} 
                      {copied ? 'KOPYALANDI' : 'SİSTEM LİNKİNİ KOPYALA'}
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300 transition-all">
                        <FileText size={14} /> PDF
                      </button>
                      <button className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300 transition-all">
                        <Mail size={14} /> EMAIL
                      </button>
                    </div>
                 </div>
              </div>
            </>
          )}
        </div>

        <button 
          onClick={handleArchive} 
          className={`p-5 rounded-2xl border transition-all hover:scale-110 active:scale-95 ${exercise.isArchived ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-500'}`}
          title={exercise.isArchived ? "Arşivden Çıkar" : "Sisteme Arşivle"}
        >
          <Archive size={24} fill={exercise.isArchived ? "currentColor" : "none"} />
        </button>
      </div>
    );
  }

  // Card Variant
  return (
    <div className="flex gap-2 relative">
      <div className="relative group">
        <ActionBtn icon={Download} onClick={() => setShowExportMenu(!showExportMenu)} tooltip="Formatlı İndir" />
         {showExportMenu && (
             <div className="absolute top-full left-0 mt-2 bg-slate-950 border border-slate-800 p-2 rounded-xl shadow-2xl w-48 z-50">
                  {exportOptions.slice(0,3).map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleExport(opt.id as ExportFormat)}
                            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-900 text-left"
                        >
                            <opt.icon size={12} className="text-cyan-500" />
                            <span className="text-[9px] font-bold text-slate-300 uppercase">{opt.label}</span>
                        </button>
                    ))}
             </div>
         )}
      </div>
      <ActionBtn icon={Share2} onClick={() => setShowShare(!showShare)} tooltip="Hızlı Paylaş" />
      <ActionBtn icon={Archive} onClick={handleArchive} active={exercise.isArchived} tooltip={exercise.isArchived ? "Arşivden Çıkar" : "Arşive Kaldır"} color="hover:text-amber-500" />
      <ActionBtn icon={Star} active={isFavorite} onClick={toggleFavorite} tooltip="Favorilere Ekle" color="hover:text-yellow-500" />
      
      {/* Share Modal for Card Variant (Simplified) */}
      {showShare && (
        <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowShare(false)}>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
             <h4 className="text-lg font-black italic uppercase text-white text-center">PAYLAŞ</h4>
             <button 
                onClick={copyToClipboard} 
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-300"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />} 
                {copied ? 'KOPYALANDI' : 'LİNKİ KOPYALA'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

function ActionBtn({ icon: Icon, onClick, tooltip, color = 'hover:text-cyan-400', active = false }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl bg-slate-950 border border-slate-800 transition-all group relative hover:scale-110 active:scale-90 ${active ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5' : 'text-slate-600'} ${color}`}
    >
      <Icon size={14} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
