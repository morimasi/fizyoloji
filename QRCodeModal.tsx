
import React from 'react';
import { QrCode, X, Smartphone, ShieldCheck, WifiOff } from 'lucide-react';

export const QRCodeModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center space-y-6 relative z-10">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl mx-auto flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Smartphone size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">MOBİL <span className="text-cyan-400">SENKRON</span></h2>
            <p className="text-xs text-slate-500 uppercase font-mono tracking-widest">Programı cebine taşı</p>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl inline-block group cursor-none">
             <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <QrCode size={120} className="text-slate-900" />
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-slate-950 text-white text-[8px] font-bold px-3 py-1 rounded-full">SCANNING...</div>
                </div>
             </div>
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex items-center gap-3 justify-center text-emerald-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Uçtan Uca Şifreli</span>
             </div>
             <div className="flex items-center gap-3 justify-center text-slate-500">
                <WifiOff size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Offline Kullanım Hazır</span>
             </div>
          </div>

          <p className="text-[10px] text-slate-600 leading-relaxed max-w-[250px] mx-auto italic">
            "Kameranızı okutarak programı PhysioCore Mobile uygulamasına anında aktarın."
          </p>
        </div>
      </div>
    </div>
  );
};
