
import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Bell, Brain, 
  Settings2, Save, Trash2, Globe,
  Lock, Smartphone, Database, Zap,
  X, Check, AlertCircle, Loader2
} from 'lucide-react';
import { User as UserType, TherapistProfile } from './types.ts';
import { PhysioDB } from './db-repository.ts';

export const TherapistSettings = ({ therapist }: { therapist: UserType }) => {
  const [profile, setProfile] = useState<UserType>(therapist);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'ai' | 'notifs'>('profile');

  // Load latest from DB on mount
  useEffect(() => {
    const loadData = async () => {
      const allUsers = await PhysioDB.getUsers();
      const current = allUsers.find(u => u.id === therapist.id);
      if (current) setProfile(current);
    };
    loadData();
  }, [therapist.id]);

  const updateProfile = (fields: Partial<UserType>) => setProfile(prev => ({ ...prev, ...fields }));
  const updateTherapistProfile = (fields: Partial<TherapistProfile>) => {
    setProfile(prev => ({
      ...prev,
      therapistProfile: { ...prev.therapistProfile!, ...fields }
    }));
  };

  const updateAiSettings = (settings: any) => {
    setProfile(prev => ({
      ...prev,
      therapistProfile: {
        ...prev.therapistProfile!,
        aiAssistantSettings: { ...prev.therapistProfile!.aiAssistantSettings, ...settings }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await PhysioDB.updateUser(profile);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert("Hata: Kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  };

  const addSpecialty = (val: string) => {
    if (!val || profile.therapistProfile?.specialization.includes(val)) return;
    updateTherapistProfile({ specialization: [...profile.therapistProfile!.specialization, val] });
  };

  const removeSpecialty = (val: string) => {
    updateTherapistProfile({ specialization: profile.therapistProfile!.specialization.filter(s => s !== val) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 font-roboto">
      {/* Sidebar Settings Menu */}
      <div className="lg:col-span-3 space-y-2">
         <SettingsTab active={activeTab === 'profile'} icon={User} label="Profil Bilgileri" onClick={() => setActiveTab('profile')} />
         <SettingsTab active={activeTab === 'ai'} icon={Brain} label="AI Asistan Ayarları" onClick={() => setActiveTab('ai')} />
         <SettingsTab active={activeTab === 'notifs'} icon={Bell} label="Bildirimler" onClick={() => setActiveTab('notifs')} />
         <SettingsTab active={activeTab === 'security'} icon={Shield} label="Klinik Güvenlik" onClick={() => setActiveTab('security')} />
         
         <div className="pt-6 mt-6 border-t border-slate-800">
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 mb-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Bulut Senkronizasyonu</p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><Check size={12}/> Aktif</span>
                    <span className="text-[8px] font-mono text-slate-600">v5.0-master</span>
                </div>
            </div>
            <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-rose-500/20">
               <Lock size={16} /> Şifreyi Güncelle
            </button>
         </div>
      </div>

      {/* Settings Content Area */}
      <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-[3.5rem] p-10 space-y-10 relative overflow-hidden backdrop-blur-xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
         
         <div className="flex justify-between items-center relative z-10">
            <div>
               <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Profil <span className="text-cyan-400">Yönetimi</span></h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Klinik Uzman Tercihleri ve Sistem Ayarları</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${showSuccess ? 'bg-emerald-500 text-white' : 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-cyan-500/20'}`}
            >
               {isSaving ? <Loader2 className="animate-spin" size={16} /> : showSuccess ? <Check size={16} /> : <Save size={16} />}
               {isSaving ? 'KAYDEDİLİYOR' : showSuccess ? 'BAŞARIYLA KAYDEDİLDİ' : 'DEĞİŞİKLİKLERİ KAYDET'}
            </button>
         </div>

         <div className="relative z-10 min-h-[400px]">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Tam Ad Soyad</label>
                      <input 
                        type="text" 
                        value={profile.fullName} 
                        onChange={e => updateProfile({ fullName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-cyan-500/50 shadow-inner" 
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Globe size={12} /> İletişim E-Postası</label>
                      <input 
                        type="email" 
                        value={profile.email} 
                        onChange={e => updateProfile({ email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-cyan-500/50 shadow-inner" 
                      />
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Smartphone size={12} /> Uzmanlık Alanları</label>
                     <div className="flex flex-wrap gap-2">
                        {profile.therapistProfile?.specialization.map(s => (
                          <span key={s} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black text-cyan-400 uppercase flex items-center gap-2 group/tag">
                            {s} <X size={12} className="text-slate-600 hover:text-rose-500 cursor-pointer" onClick={() => removeSpecialty(s)} />
                          </span>
                        ))}
                        <SpecialtyMiniInput onAdd={addSpecialty} />
                     </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Brain size={12} /> Profesyonel Biyografi</label>
                      <textarea 
                         value={profile.therapistProfile?.bio} 
                         onChange={e => updateTherapistProfile({ bio: e.target.value })}
                         className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-xs font-medium text-slate-300 outline-none h-48 italic leading-relaxed shadow-inner"
                         placeholder="Terapistlik vizyonunuz ve klinik yaklaşımınız..."
                      />
                   </div>
                   <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-center gap-4">
                      <AlertCircle className="text-cyan-400 shrink-0" size={20} />
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                         Profil bilgileriniz, hastalarınızın program çıktıları ve mobil uygulama profillerinde görüntülenecektir.
                      </p>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ToggleCard 
                      icon={Brain}
                      label="Protokol Otomatik Öner" 
                      desc="AI, hasta tanılarına göre en verimli başlangıç programını taslak olarak sunar."
                      active={profile.therapistProfile?.aiAssistantSettings.autoSuggestProtocols || false}
                      onToggle={() => updateAiSettings({ autoSuggestProtocols: !profile.therapistProfile?.aiAssistantSettings.autoSuggestProtocols })}
                    />
                    <ToggleCard 
                      icon={Zap}
                      label="Kritik Risk Uyarıları" 
                      desc="VAS skoru 3 seans üst üste artan hastalar için anlık kırmızı bayrak uyarısı."
                      active={profile.therapistProfile?.aiAssistantSettings.notifyHighRisk || false}
                      onToggle={() => updateAiSettings({ notifyHighRisk: !profile.therapistProfile?.aiAssistantSettings.notifyHighRisk })}
                    />
                    <ToggleCard 
                      icon={Database}
                      label="Haftalık Veri Analizi" 
                      desc="Klinik başarı oranı ve hasta gelişim hızı analizlerini içeren haftalık rapor."
                      active={profile.therapistProfile?.aiAssistantSettings.weeklyReports || false}
                      onToggle={() => updateAiSettings({ weeklyReports: !profile.therapistProfile?.aiAssistantSettings.weeklyReports })}
                    />
                 </div>
                 
                 <div className="p-10 bg-slate-950 border border-slate-800 rounded-[3rem] space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                       <Shield size={18} className="text-cyan-400" /> HIPAA & KVKK Güvenlik Katmanı
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                       "AI motoru, klinik verileri anonimleştirilmiş tokenler üzerinden işlemektedir. Tüm kişisel veriler yerel veritabanında şifreli olarak saklanır ve AI analizleri için yalnızca biyomekanik parametreler kullanılır."
                    </p>
                    <div className="flex gap-4">
                       <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase rounded">256-BIT AES</span>
                       <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase rounded">SOC2 TYPE II</span>
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'}`}
  >
     <Icon size={18} /> {label}
  </button>
);

const ToggleCard = ({ icon: Icon, label, desc, active, onToggle }: any) => (
  <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 group hover:border-cyan-500/20 transition-all">
     <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-cyan-400 shadow-inner group-hover:scale-105 transition-transform">
           <Icon size={24} />
        </div>
        <button onClick={onToggle} className={`w-14 h-7 rounded-full p-1.5 transition-all ${active ? 'bg-cyan-500' : 'bg-slate-800'}`}>
           <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
     </div>
     <div className="space-y-2">
        <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{label}</h5>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">"{desc}"</p>
     </div>
  </div>
);

const SpecialtyMiniInput = ({ onAdd }: { onAdd: (s: string) => void }) => {
  const [val, setVal] = useState('');
  return (
    <div className="relative">
       <input 
          type="text" 
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { onAdd(val); setVal(''); } }}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-bold text-white outline-none w-32 focus:w-48 transition-all"
          placeholder="Ekle..."
       />
    </div>
  );
}
