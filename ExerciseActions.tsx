
import React, { useState } from 'react';
import { 
  Download, Share2, Archive, Star, 
  Instagram, Linkedin, MessageCircle, Copy, Check, FileText, Smartphone,
  ExternalLink, Mail
} from 'lucide-react';
import { Exercise } from './types.ts';
import { PhysioDB } from './db-repository.ts';

interface ExerciseActionsProps {
  exercise: Exercise;
  onUpdate?: () => void;
  variant?: 'card' | 'player';
}

export const ExerciseActions: React.FC<ExerciseActionsProps> = ({ exercise, onUpdate, variant = 'card' }) => {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(exercise.isFavorite || false);

  const handleDownload = async () => {
    const url = exercise.videoUrl || exercise.visualUrl;
    if (!url) {
      alert("Lütfen önce bir AI görseli/videosu üretin.");
      return;
    }
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const isVideo = blob.type.includes('video') || !!exercise.videoUrl;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `PhysioCore_${exercise.code}_${exercise.title.replace(/\s+/g, '_')}${isVideo ? '.mp4' : '.png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      // Feedback toast simülasyonu
      const msg = `${exercise.title} ${isVideo ? 'MP4 Videosu' : 'Klinik Görseli'} başarıyla indirildi.`;
      console.log(msg);
    } catch (err) {
      console.error("Download Error:", err);
      // Fallback for direct links
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank";
      link.download = `PhysioCore_${exercise.code}.mp4`;
      link.click();
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
      instagram: `https://www.instagram.com/` // Instagram API direct share is limited to mobile deep links
    };

    if (links[platform]) {
      window.open(links[platform], '_blank');
    } else if (platform === 'instagram') {
      alert("Instagram paylaşımı için lütfen videoyu indirip mobil uygulama üzerinden yükleyin.");
    }
  };

  const socialLinks = [
    { id: 'linkedin', icon: Linkedin, color: 'hover:text-blue-500', label: 'LinkedIn', bg: 'bg-[#0077b5]/10' },
    { id: 'instagram', icon: Instagram, color: 'hover:text-pink-500', label: 'Instagram', bg: 'bg-[#e4405f]/10' },
    { id: 'whatsapp', icon: MessageCircle, color: 'hover:text-green-500', label: 'WhatsApp', bg: 'bg-[#25d366]/10' },
    { id: 'mobile', icon: Smartphone, color: 'hover:text-cyan-500', label: 'App Sync', bg: 'bg-cyan-500/10' }
  ];

  if (variant === 'player') {
    return (
      <div className="flex items-center gap-4 relative">
        <button 
          onClick={handleDownload} 
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 transition-all shadow-xl hover:scale-110 active:scale-95 group" 
          title="Sinematik MP4 İndir"
        >
          <Download size={24} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
        
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

  return (
    <div className="flex gap-2 relative">
      <ActionBtn icon={Download} onClick={handleDownload} tooltip="MP4 İndir" />
      <ActionBtn icon={Share2} onClick={() => setShowShare(!showShare)} tooltip="Hızlı Paylaş" />
      <ActionBtn icon={Archive} onClick={handleArchive} active={exercise.isArchived} tooltip={exercise.isArchived ? "Arşivden Çıkar" : "Arşive Kaldır"} color="hover:text-amber-500" />
      <ActionBtn icon={Star} active={isFavorite} onClick={toggleFavorite} tooltip="Favorilere Ekle" color="hover:text-yellow-500" />
      
      {showShare && (
        <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowShare(false)}>
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] max-w-md w-full space-y-10 relative overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl -mr-24 -mt-24" />
             
             <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl mx-auto flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <Share2 size={32} />
                </div>
                <h4 className="text-2xl font-black italic tracking-tighter uppercase text-white">PROFESYONEL <span className="text-cyan-400">PAYLAŞIM</span></h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">"{exercise.titleTr || exercise.title}"</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                {socialLinks.map(soc => (
                  <button 
                    key={soc.id} 
                    onClick={() => shareToSocial(soc.id)}
                    className={`flex flex-col items-center gap-4 p-6 ${soc.bg} rounded-[2.5rem] transition-all ${soc.color} group border border-white/5 hover:border-white/10`}
                  >
                    <soc.icon size={32} className="group-hover:scale-125 transition-transform duration-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{soc.label}</span>
                  </button>
                ))}
             </div>

             <button 
                onClick={copyToClipboard} 
                className="w-full bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-inner"
              >
                {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />} 
                {copied ? 'KOPYALANDI' : 'KLİNİK LİNKİ KOPYALA'}
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
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-950 border border-slate-800 text-[8px] font-black uppercase tracking-[0.2em] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl z-[160]">
        {tooltip}
      </span>
    </button>
  );
}
