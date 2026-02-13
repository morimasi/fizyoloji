
import React from 'react';
import { Palette, CloudSync, Lock, Smartphone, ShieldCheck, Zap, Monitor, Activity, User } from 'lucide-react';

export const PatientManagement = () => {
  return (
    <>
      <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-6 duration-700">
         {/* Visual Experience Tuner */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Palette size={20} className="text-blue-400" /> Görsel <span className="text-blue-400">Deneyim Özelleştirme</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <ThemeOption label="X-Ray Blue" active icon={Monitor} />
               <ThemeOption label="Anatomical" icon={Activity} />
               <ThemeOption label="Cyber-Grid" icon={Zap} />
               <ThemeOption label="Clinical White" icon={ShieldCheck} />
            </div>
         </div>

         {/* Biometric Sync Settings */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
               <CloudSync size={20} className="text-emerald-400" /> Senkronizasyon <span className="text-emerald-400">Ayarları</span>
            </h3>
            <div className="space-y-6">
               <ToggleOption label="Cihaz Sensörlerini Kullan" desc="Hareket analizi için ivmeölçer verilerini işle." active />
               <ToggleOption label="Akıllı Saat Entegrasyonu" desc="Nabız ve yakılan kalori verilerini senkronize et." active={false} />
               <ToggleOption label="Düşük Gecikmeli Stream" desc="AI asistanı için gerçek zamanlı sesli yanıt." active />
            </div>
         </div>
      </div>

      <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-right-6 duration-700">
         <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center gap-4 text-amber-500">
               <Lock size={24} />
               <h4 className="text-sm font-black uppercase tracking-widest">Gizlilik & Erişim</h4>
            </div>
            <p className="text-xs text-slate-500 italic leading-relaxed">
               "Klinik verileriniz HIPAA standartlarında korunmakta ve sadece atanan uzman (Dr. Erdem) tarafından görüntülenebilmektedir."
            </p>
            <div className="space-y-4 pt-4 border-t border-slate-800">
               <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-800 transition-all flex items-center justify-center gap-2">
                  <Smartphone size={14} /> ŞİFREYİ SIFIRLA
               </button>
               <button className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 transition-all">
                  HESABI DONDUR
               </button>
            </div>
         </div>

         <div className="p-8 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-[2.5rem] flex items-center gap-6 group cursor-pointer hover:scale-[1.02] transition-all">
             <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                <User size={24} />
             </div>
             <div>
                <h5 className="text-xs font-black text-white uppercase italic">Kişisel Arşiv</h5>
                <p className="text-[9px] text-blue-300 font-bold uppercase mt-1">E-Nabız Senkronizasyonu</p>
             </div>
         </div>
      </div>
    </>
  );
};

const ThemeOption = ({ label, active, icon: Icon }: any) => (
  <button className={`p-6 rounded-3xl border text-center transition-all flex flex-col items-center gap-3 ${active ? 'bg-blue-600 border-blue-400 text-white shadow-xl scale-105' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-300'}`}>
     <Icon size={24} className={active ? 'text-white' : 'text-slate-700'} />
     <span className="text-[8px] font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const ToggleOption = ({ label, desc, active }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-emerald-500/30 transition-all shadow-inner">
     <div className="space-y-1">
        <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{label}</h5>
        <p className="text-[9px] text-slate-500 font-medium italic">{desc}</p>
     </div>
     <button className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'} shadow-lg`} />
     </button>
  </div>
);
