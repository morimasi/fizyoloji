
import React, { useState } from 'react';
import { 
  Download, Share2, Archive, Star, 
  Instagram, Linkedin, MessageCircle, Copy, Check, FileText, Smartphone
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
      alert(`"${exercise.title}" ${isVideo ? 'akışkan animasyonu' : 'klinik kartı'} başarıyla indirildi.`);
    } catch (err) {
      console.error("Download Error:", err);
      // Fallback for direct links
      const link = document.createElement('a');
      link.href = url;
      link.download = `PhysioCore_${exercise.code}.mp4`;
      link.click();
    }
  };

  const handleArchive = () => {
    const updated = { ...exercise, isArchived: !exercise.isArchived };
    PhysioDB.updateExercise(updated);
    onUpdate?.();
    alert(exercise.isArchived ? "Egzersiz arşivden çıkarıldı." : "Egzersiz başarıyla arşivlendi.");
  };

  const toggleFavorite = () => {
    const updated = { ...exercise, isFavorite: !isFavorite };
    PhysioDB.updateExercise(updated);
    setIsFavorite(!isFavorite);
    onUpdate?.();
  };

  const copyToClipboard = () => {
    const content = `PhysioCore AI | Sinematik Klinik Reçete: ${exercise.title} (${exercise.code})\nAkışkanlık: 1080p Motion Active\nBiyomekanik: ${exercise.biomechanics}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { icon: Linkedin, color: 'hover:text-blue-500', label: 'LinkedIn', bg: 'bg-[#0077b5]/10' },
    { icon: Instagram, color: 'hover:text-pink-500', label: 'Instagram', bg: 'bg-[#e4405f]/10' },
    { icon: MessageCircle, color: 'hover:text-green-500', label: 'WhatsApp', bg: 'bg-[#25d366]/10' },
    { icon: Smartphone, color: 'hover:text-cyan-500', label: 'Mobile App', bg: 'bg-cyan-500/10' }
  ];

  if (variant === 'player') {
    return (
      <div className="flex items-center gap-4">
        <button onClick={handleDownload} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 transition-all shadow-xl hover:scale-105" title="Animasyonu İndir">
          <Download size={24} />
        </button>
        <div className="relative">
          <button onClick={() => setShowShare(!showShare)} className="p-5 bg-cyan-500 text-white rounded-2xl shadow-2xl shadow-cyan-500/30 hover:scale-105 transition-all" title="Paylaş">
            <Share2 size={24} />
          </button>
          
          {showShare && (
            <div className="absolute bottom-full right-0 mb-6 bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-500 min-w-[280px] z-50">
               <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-6 text-center font-black">SİNEMATİK PAYLAŞIM PANELİ</p>
               <div className="grid grid-cols-2 gap-4 mb-6">
                  {socialLinks.map(soc => (
                    <button key={soc.label} className={`flex flex-col items-center gap-2 p-4 ${soc.bg} rounded-2xl transition-all ${soc.color} group`}>
                      <soc.icon size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-white">{soc.label}</span>
                    </button>
                  ))}
               </div>
               <div className="space-y-3">
                  <button onClick={copyToClipboard} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-inner">
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} 
                    {copied ? 'KOPYALANDI' : 'KLİNİK LİNKİ KOPYALA'}
                  </button>
                  <button className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                    <FileText size={14} /> PDF RAPORU ÜRET
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <ActionBtn icon={Download} onClick={handleDownload} tooltip="Video/Görsel İndir" />
      <ActionBtn icon={Share2} onClick={() => setShowShare(!showShare)} tooltip="Hızlı Paylaş" />
      <ActionBtn icon={Archive} onClick={handleArchive} active={exercise.isArchived} tooltip={exercise.isArchived ? "Arşivden Çıkar" : "Arşive Kaldır"} color="hover:text-amber-500" />
      <ActionBtn icon={Star} active={isFavorite} onClick={toggleFavorite} tooltip="Favorilere Ekle" color="hover:text-yellow-500" />
      
      {showShare && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowShare(false)}>
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl max-w-sm w-full space-y-8" onClick={e => e.stopPropagation()}>
             <div className="text-center space-y-2">
                <Share2 size={32} className="mx-auto text-cyan-500" />
                <h4 className="text-xl font-black italic tracking-tighter uppercase">PROFESYONEL <span className="text-cyan-400">PAYLAŞ</span></h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">"{exercise.title}" Reçetesi</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {socialLinks.map(soc => (
                  <button key={soc.label} className={`flex flex-col items-center gap-3 p-5 ${soc.bg} rounded-3xl transition-all ${soc.color} group`}>
                    <soc.icon size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{soc.label}</span>
                  </button>
                ))}
             </div>
             <button onClick={copyToClipboard} className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />} 
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
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-950 border border-slate-800 text-[8px] font-black uppercase tracking-[0.2em] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl">
        {tooltip}
      </span>
    </button>
  );
}
