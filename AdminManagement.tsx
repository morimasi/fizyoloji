
import React from 'react';
import { Trophy, Zap, Sparkles, Crown, Settings2, Brain, Terminal, Cpu, Save, ShieldAlert, Database, History } from 'lucide-react';

export const AdminManagement = () => {
  return (
    <>
      <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-6 duration-700">
         {/* Reward & Gamification Engine */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-10 group hover:border-cyan-500/30 transition-all shadow-2xl">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Trophy size={20} className="text-amber-400" /> Ödül ve <span className="text-amber-400">Oyunlaştırma Motoru</span>
               </h3>
               <span className="text-[9px] font-black text-slate-600 uppercase">Engine Status: Global</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <RewardCard title="İlk Adım" desc="İlk seansını tamamlayan hastalara özel rozet." icon={Zap} active />
               <RewardCard title="Biyomekanik Master" desc="7 gün %100 uyum sağlayanlara özel 4K render." icon={Sparkles} />
               <RewardCard title="Kıdemli Kurtarıcı" desc="10 vakayı taburcu eden terapist ödülü." icon={Crown} />
               <div className="border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center p-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group/add">
                  <Settings2 size={24} className="mb-2 group-hover/add:rotate-90 transition-transform" />
                  <span className="text-[10px] font-black uppercase">Yeni Ödül Kuralı Ekle</span>
               </div>
            </div>
         </div>

         {/* Global AI Tuning */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Brain size={20} className="text-cyan-400" /> Global <span className="text-cyan-400">AI Konfigürasyonu</span>
            </h3>
            <div className="space-y-8">
               <AdminSlider label="Muhakeme Derinliği (Reasoning Steps)" value={92} icon={Cpu} />
               <AdminSlider label="Klinik Muhafazakarlık Eşiği" value={65} icon={ShieldAlert} />
               <AdminSlider label="Görsel Üretim Kalitesi (Veo Optimization)" value={100} icon={Sparkles} />
            </div>
            <div className="pt-6 border-t border-slate-800 flex justify-end">
               <button className="flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all">
                  <Save size={16} /> TÜM SİSTEMİ GÜNCELLE
               </button>
            </div>
         </div>
      </div>

      <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-right-6 duration-700">
         <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
               <Terminal size={18} /> Sistem Logları
            </h4>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               <LogEntry time="09:12" msg="AI: Lomber fıtık kural seti güncellendi." type="info" />
               <LogEntry time="10:45" msg="SECURITY: Brute-force denemesi engellendi." type="warn" />
               <LogEntry time="11:30" msg="SYNC: 42 hasta mobil cihazla eşleşti." type="success" />
               <LogEntry time="12:00" msg="SYSTEM: API Key rotasyonu tamamlandı." type="info" />
               <LogEntry time="13:15" msg="DB: Haftalık indeksleme başarılı." type="success" />
            </div>
         </div>

         <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <Database size={40} className="mb-6 opacity-20 group-hover:scale-110 transition-transform" />
            <h4 className="text-xl font-black italic uppercase leading-none mb-2">Haftalık AI <br/> Performans</h4>
            <p className="text-xs text-white/70 italic mb-6">"Genesis motoru bu hafta %99.2 doğrulukla 428 seans optimize etti."</p>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">Detaylı GPU Analizi</button>
         </div>
      </div>
    </>
  );
};

const RewardCard = ({ title, desc, icon: Icon, active }: any) => (
  <div className={`p-6 rounded-[2rem] border transition-all ${active ? 'bg-slate-950 border-cyan-500/40 shadow-xl' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
     <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
           <Icon size={20} />
        </div>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]' : 'bg-slate-800'}`} />
     </div>
     <h5 className="text-[11px] font-black text-white uppercase tracking-wider mb-2">{title}</h5>
     <p className="text-[9px] text-slate-500 leading-relaxed italic">{desc}</p>
  </div>
);

const AdminSlider = ({ label, value, icon: Icon }: any) => (
  <div className="space-y-4">
     <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <Icon size={14} className="text-cyan-500" /> {label}
        </span>
        <span className="text-[10px] font-mono font-bold text-cyan-400">%{value}</span>
     </div>
     <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[2px] border border-slate-800 shadow-inner">
        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" style={{ width: `${value}%` }} />
     </div>
  </div>
);

const LogEntry = ({ time, msg, type }: any) => {
  const colors: any = { info: 'bg-cyan-500', warn: 'bg-rose-500', success: 'bg-emerald-500' };
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
       <span className="text-[8px] font-mono text-slate-600 font-bold">{time}</span>
       <div className={`w-1.5 h-1.5 rounded-full ${colors[type]} shadow-sm`} />
       <p className="text-[9px] text-slate-400 font-medium truncate italic">{msg}</p>
    </div>
  );
};
