
import React, { useState } from 'react';
import { 
  User, Shield, Bell, Brain, 
  Settings2, Save, Trash2, Globe,
  Lock, Smartphone, Database, Zap
} from 'lucide-react';
import { User as UserType } from './types.ts';

export const TherapistSettings = ({ therapist }: { therapist: UserType }) => {
  const [profile, setProfile] = useState(therapist);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Sidebar Settings Menu */}
      <div className="lg:col-span-3 space-y-2">
         <SettingsBtn active icon={User} label="Profil Bilgileri" />
         <SettingsBtn icon={Shield} label="Klinik Yetkiler" />
         <SettingsBtn icon={Brain} label="AI Asistan Ayarları" />
         <SettingsBtn icon={Bell} label="Bildirimler" />
         <SettingsBtn icon={Globe} label="Dil ve Bölge" />
         <div className="pt-4 mt-4 border-t border-slate-800">
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-xs uppercase tracking-widest">
               <Lock size={16} /> Şifreyi Güncelle
            </button>
         </div>
      </div>

      {/* Settings Content Area */}
      <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-10 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
         
         <div className="flex justify-between items-center relative z-10">
            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Profil <span className="text-cyan-400">Yönetimi</span></h3>
            <button className="flex items-center gap-2 bg-cyan-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-500/20 active:scale-95 transition-all">
               <Save size={16} /> DEĞİŞİKLİKLERİ KAYDET
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
               <InputGroup label="Tam Ad Soyad" value={profile.fullName} icon={User} />
               <InputGroup label="E-Posta Adresi" value={profile.email} icon={Globe} />
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Smartphone size={12} /> Uzmanlık Alanları</label>
                 <div className="flex flex-wrap gap-2">
                    {profile.therapistProfile?.specialization.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-bold text-cyan-400 uppercase tracking-tighter flex items-center gap-2">
                        {s} <Trash2 size={10} className="text-slate-600 cursor-pointer hover:text-rose-500" />
                      </span>
                    ))}
                    <button className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-[9px] font-bold uppercase tracking-tighter">+ EKLE</button>
                 </div>
               </div>
            </div>

            <div className="space-y-8 bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800 shadow-inner">
               <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-cyan-400" fill="currentColor" /> AI Tercihleri
               </h4>
               <div className="space-y-6">
                  <ToggleItem label="Protokol Otomatik Öner" active={profile.therapistProfile?.aiAssistantSettings.autoSuggestProtocols || false} />
                  <ToggleItem label="Kritik Vaka Bildirimleri" active={profile.therapistProfile?.aiAssistantSettings.notifyHighRisk || false} />
                  <ToggleItem label="Haftalık Verimlilik Raporu" active={profile.therapistProfile?.aiAssistantSettings.weeklyReports || false} />
               </div>
               <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <Database size={18} className="text-slate-500" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Veri Güvenliği</p>
                    <p className="text-[8px] text-slate-600 uppercase font-bold">Uçtan Uca Şifreli / HIPAA Uyumlu</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const SettingsBtn = ({ icon: Icon, label, active }: any) => (
  <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
     <Icon size={18} /> {label}
  </button>
);

const InputGroup = ({ label, value, icon: Icon }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Icon size={12} /> {label}</label>
    <input type="text" value={value} readOnly className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-semibold outline-none text-white shadow-inner cursor-not-allowed opacity-70" />
  </div>
);

const ToggleItem = ({ label, active }: any) => (
  <div className="flex items-center justify-between">
     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
     <div className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-cyan-500' : 'bg-slate-800'}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
     </div>
  </div>
);
