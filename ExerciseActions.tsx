
import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Share2, Archive, Star, 
  Instagram, Linkedin, MessageCircle, Copy, Check, FileText, Smartphone,
  ExternalLink, Mail, Film, FileImage, Presentation, FileVideo, ChevronUp, Loader2,
  Zap
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    const url = exercise.visualUrl || exercise.videoUrl;
    if (!url) {
      alert("Lütfen önce bir AI görseli üretin.");
      return;
    }

    setIsConverting(true);
    setShowExportMenu(false);
    try {
        await MediaConverter.export(url, format, `PhysioCore_${exercise.code}`);
    } catch (err) {
        console.error("Export failed:", err);
        alert("Medya oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
        setIsConverting(false);
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

  // Expanded Export Options
  const exportOptions = [
      { id: 'mp4', label: 'MP4 Video', icon: FileVideo, desc: 'Universal' },
      { id: 'avi', label: 'AVI Video', icon: Film, desc: 'Legacy Windows' },
      { id: 'mov', label: 'QuickTime (MOV)', icon: Film, desc: 'Apple/Mac' },
      { id: 'mpeg', label: 'MPEG Video', icon: Film, desc: 'Broadcast' },
      { id: 'gif', label: 'Loop GIF', icon: FileImage, desc: 'Web/Social' },
      { id: 'ppt', label: 'PowerPoint Data', icon: Presentation, desc: 'Presentation' },
      { id: 'jpg', label: 'Poster (JPG)', icon: FileImage, desc: 'Print' },
  ];

  if (variant === 'player') {
    return (
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              disabled={isConverting}
              className={`
                h-14 px-6 rounded-2xl border transition-all shadow-xl group flex items-center gap-3 relative overflow-hidden
                ${isConverting 
                  ? 'bg-slate-800 border-slate-700 cursor-wait text-slate-400' 
                  : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300 active:scale-95'
                }
              `}
              title="Medya Dönüştürücü"
            >
              {isConverting ? (
                <>
                  <Loader2 size={20} className="animate-spin text-cyan-500" />
                  <div className="flex flex-col items-start leading-none">
                     <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">İŞLENİYOR</span>
                     <span className="text-[8px] font-bold opacity-50">Lütfen bekleyin...</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-400 transition-colors">
                     <Download size={16} />
                  </div>
                  <div className="text-left hidden md:block">
                     <span className="block text-[10px] font-black uppercase tracking-widest">DIŞA AKTAR</span>
                     <span className="block text-[8px] font-medium opacity-50">Format Seçimi</span>
                  </div>
                  <ChevronUp size={14} className={`transition-transform duration-300 text-slate-500 group-hover:text-cyan-400 ${showExportMenu ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {showExportMenu && (
                <div className="absolute bottom-full left-0 mb-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[260px] z-[200] animate-in slide-in-from-bottom-2 fade-in zoom-in-95 origin-bottom-left">
                    <div className="p-3 border-b border-white/5 mb-1 flex items-center justify-between">
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                           <Zap size={10} fill="currentColor" /> Convert Studio
                        </span>
                        <span className="text-[8px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded">ULTRA-PRO</span>
                    </div>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {exportOptions.map((opt) => (
                          <button
                              key={opt.id}
                              onClick={() => handleExport(opt.id as ExportFormat)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left group transition-all relative overflow-hidden"
                          >
                              <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-400 transition-all shadow-lg z-10">
                                  <opt.icon size={16} />
                              </div>
                              <div className="z-10">
                                  <p className="text-[10px] font-bold text-slate-200 group-hover:text-white uppercase tracking-wide">{opt.label}</p>
                                  <p className="text-[9px] text-slate-500 group-hover:text-cyan-200/80 font-medium">{opt.desc}</p>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                      ))}
                    </div>
                </div>
            )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowShare(!showShare)} 
            className={`p-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border ${showShare ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`} 
            title="Klinik Paylaşım"
          >
            <Share2 size={24} />
          </button>
          
          {showShare && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShare(false)} />
              <div className="absolute bottom-full right-0 mb-6 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-6 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 min-w-[300px] z-50">
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    {socialLinks.map(soc => (
                      <button 
                        key={soc.id} 
                        onClick={() => shareToSocial(soc.id)}
                        className={`flex flex-col items-center gap-2 p-4 ${soc.bg} rounded-2xl transition-all ${soc.color} group border border-transparent hover:border-white/10`}
                      >
                        <soc.icon size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{soc.label}</span>
                      </button>
                    ))}
                 </div>
                 
                 <button 
                    onClick={copyToClipboard} 
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} 
                    {copied ? 'KOPYALANDI' : 'LİNKİ KOPYALA'}
                 </button>
              </div>
            </>
          )}
        </div>

        <button 
          onClick={handleArchive} 
          className={`p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${exercise.isArchived ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-500 hover:border-slate-700'}`}
          title={exercise.isArchived ? "Arşivden Çıkar" : "Sisteme Arşivle"}
        >
          <Archive size={24} fill={exercise.isArchived ? "currentColor" : "none"} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 relative z-20">
      <ActionBtn icon={Download} onClick={() => setShowExportMenu(!showExportMenu)} tooltip="Hızlı İndir" />
      {showExportMenu && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
          <div className="absolute bottom-full left-0 mb-2 bg-slate-900 border border-slate-800 p-2 rounded-xl shadow-xl w-40 z-40 animate-in zoom-in-95">
             {exportOptions.slice(0,3).map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => handleExport(opt.id as ExportFormat)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-left"
                >
                    <opt.icon size={12} className="text-cyan-500" />
                    <span className="text-[9px] font-bold text-slate-300 uppercase">{opt.label.split(' ')[0]}</span>
                </button>
              ))}
          </div>
        </>
      )}
      <ActionBtn icon={Share2} onClick={() => setShowShare(!showShare)} tooltip="Hızlı Paylaş" />
      <ActionBtn icon={Archive} onClick={handleArchive} active={exercise.isArchived} tooltip="Arşivle" color="hover:text-amber-500" />
      <ActionBtn icon={Star} active={isFavorite} onClick={toggleFavorite} tooltip="Favori" color="hover:text-yellow-500" />
    </div>
  );
};

function ActionBtn({ icon: Icon, onClick, tooltip, color = 'hover:text-cyan-400', active = false }: any) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${active ? 'text-yellow-500 border-yellow-500/30' : 'text-slate-500'} ${color}`}
      title={tooltip}
    >
      <Icon size={14} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
