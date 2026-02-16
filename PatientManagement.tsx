
import React, { useState, useEffect } from 'react';
import { 
  Palette, CloudSync, Lock, Smartphone, ShieldCheck, 
  Zap, Monitor, Activity, User, ShieldAlert, 
  Settings2, Heart, Brain, Download, RefreshCw, 
  Mic2, Eye, EyeOff, FileJson, Share2, Sparkles,
  Stethoscope, Info, Fingerprint
} from 'lucide-react';
import { getAI } from './ai-core.ts';
import { PhysioDB } from './db-repository.ts';

/**
 * PHYSIOCORE PATIENT SELF-MANAGEMENT PROTOCOL v9.5
 * Interactive Visual Layers, AI Empathy & Data Sovereignty
 */

export const PatientManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [activeTheme, setActiveTheme] = useState('X-Ray Blue');
  const [aiEmpathy, setAiEmpathy] = useState(85);
  const [syncSettings, setSyncSettings] = useState({
    sensors: true,
    smartwatch: false,
    lowLatency: true
  });
  
  const [dataPermissions, setDataPermissions] = useState({
    biometrics: true,
    sessionVideos: false,
    painLogs: true,
    clinicalNotes: true
  });

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const themes = [
    { id: 'xray', label: 'X-Ray Blue', icon: Monitor, color: 'text-blue-400' },
    { id: 'anatomical', label: 'Anatomical', icon: Activity, color: 'text-rose-400' },
    { id: 'cyber', label: 'Cyber-Grid', icon: Zap, color: 'text-cyan-400' },
    { id: 'clinical', label: 'Clinical White', icon: ShieldCheck, color: 'text-emerald-400' }
  ];

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate complex data encryption and bundling
    await new Promise(r => setTimeout(r, 2000));
    const data = {
      timestamp: new Date().toISOString(),
      user: "Caner Ozkan",
      clinical_passport_v1: true,
      data: "ENCRYPTED_BLOB_0x4421"
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PhysioCore_Health_Passport.json`;
    a.click();
    setIsExporting(false);
  };

  const getAiHealthSummary = async () => {
    setIsAiProcessing(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Ben bir hastayım. Son 3 seansımdaki gelişimimi özetle ve beni motive edecek bir cümle kur. (Kısa ve teknik olmasın)"
      });
      setAiSummary(response.text || "Verileriniz analiz edildi, gelişiminiz stabil.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <>
      <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-6 duration-700">
         
         {/* 1. Visual Experience & AI Companion Tuner */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="flex justify-between items-center relative z-10">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Palette size={20} className="text-blue-400" /> Deneyim & <span className="text-blue-400">AI Karakteri</span>
               </h3>
               <button 
                onClick={getAiHealthSummary}
                disabled={isAiProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
               >
                  {isAiProcessing ? <RefreshCw className="animate-spin" size={12} /> : <Sparkles size={12} />} AI ÖZETİ AL
               </button>
            </div>

            {aiSummary && (
               <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl animate-in zoom-in duration-300 relative z-10">
                  <p className="text-xs text-cyan-100 italic leading-relaxed">"{aiSummary}"</p>
               </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
               {themes.map(t => (
                  <ThemeOption 
                    key={t.id} 
                    label={t.label} 
                    active={activeTheme === t.label} 
                    icon={t.icon} 
                    onClick={() => setActiveTheme(t.label)} 
                  />
               ))}
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-6 relative z-10">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Brain size={14} className="text-cyan-400" /> AI Coach Empati Tonu
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">%{aiEmpathy}</span>
               </div>
               <input 
                 type="range" min="0" max="100" value={aiEmpathy} 
                 onChange={(e) => setAiEmpathy(parseInt(e.target.value))}
                 className="w-full h-1.5 bg-slate-950 rounded-full appearance-none accent-cyan-500 border border-slate-800 cursor-pointer"
               />
               <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase italic">
                  <span>Klinik / Katı</span>
                  <span>Destekleyici / Empatik</span>
               </div>
            </div>
         </div>

         {/* 2. Biometric Sync & Connectivity Matrix */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
               <CloudSync size={20} className="text-emerald-400" /> Bağlantı & <span className="text-emerald-400">Canlı Veri Akışı</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <ToggleOption 
                label="Cihaz Sensörlerini Kullan" 
                desc="Gelişmiş hareket analizi için ivmeölçer verilerini sisteme aktar." 
                active={syncSettings.sensors} 
                onToggle={() => setSyncSettings({...syncSettings, sensors: !syncSettings.sensors})}
               />
               <ToggleOption 
                label="Akıllı Saat Entegrasyonu" 
                desc="Nabız (Heart Rate) ve HRV verilerini Apple/Google Health'ten çek." 
                active={syncSettings.smartwatch} 
                onToggle={() => setSyncSettings({...syncSettings, smartwatch: !syncSettings.smartwatch})}
               />
               <ToggleOption 
                label="Düşük Gecikmeli Stream" 
                desc="Live Coach sesli yanıtları için yüksek performanslı kanal." 
                active={syncSettings.lowLatency} 
                onToggle={() => setSyncSettings({...syncSettings, lowLatency: !syncSettings.lowLatency})}
               />
               <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-3">
                     <Smartphone size={20} className="text-slate-600 group-hover:text-cyan-400" />
                     <span className="text-[10px] font-black text-slate-400 uppercase">Mobil Uygulama Durumu</span>
                  </div>
                  <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">SENKRONİZE</span>
               </div>
            </div>
         </div>

         {/* 3. Granular Privacy Matrix */}
         <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Fingerprint size={20} className="text-amber-400" /> Veri <span className="text-amber-400">Egemenliği Matrisi</span>
               </h3>
               <span className="text-[8px] bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-black">USER-CONTROLLED ACCESS</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paylaşılan Veriler</p>
                  <PermissionItem label="Biyometrik Ölçümler" active={dataPermissions.biometrics} onToggle={() => setDataPermissions({...dataPermissions, biometrics: !dataPermissions.biometrics})} />
                  <PermissionItem label="Seans Kayıt Videoları" active={dataPermissions.sessionVideos} onToggle={() => setDataPermissions({...dataPermissions, sessionVideos: !dataPermissions.sessionVideos})} />
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Klinik Görünürlük</p>
                  <PermissionItem label="Günlük Ağrı Logları" active={dataPermissions.painLogs} onToggle={() => setDataPermissions({...dataPermissions, painLogs: !dataPermissions.painLogs})} />
                  <PermissionItem label="Klinik Not Erişimi" active={dataPermissions.clinicalNotes} onToggle={() => setDataPermissions({...dataPermissions, clinicalNotes: !dataPermissions.clinicalNotes})} />
               </div>
            </div>
         </div>
      </div>

      <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-right-6 duration-700">
         
         {/* 4. Digital Health Passport */}
         <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center gap-4 text-amber-500">
               <Lock size={24} />
               <h4 className="text-sm font-black uppercase tracking-widest">Gizlilik & Arşiv</h4>
            </div>
            <p className="text-xs text-slate-500 italic leading-relaxed">
               "Klinik verileriniz uçtan uca şifrelidir. Tüm tedavi geçmişinizi tek bir paket halinde indirebilir veya hesabınızı tamamen silebilirsiniz."
            </p>
            <div className="space-y-4 pt-4 border-t border-slate-800">
               <button 
                 onClick={handleExportData}
                 disabled={isExporting}
                 className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-800 transition-all flex items-center justify-center gap-3"
               >
                  {isExporting ? <RefreshCw className="animate-spin" size={16} /> : <FileJson size={16} className="text-cyan-400" />} 
                  {isExporting ? 'HAZIRLANIYOR...' : 'SAĞLIK PASAPORTUNU İNDİR'}
               </button>
               <button className="w-full py-4 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 transition-all flex items-center justify-center gap-2">
                  <ShieldAlert size={16} /> HESABI DONDUR / SİL
               </button>
            </div>
         </div>

         {/* 5. Clinical Expert Access */}
         <div className="p-10 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-[3.5rem] space-y-6 group cursor-pointer hover:border-blue-400 transition-all relative overflow-hidden">
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                   <User size={28} />
                </div>
                <div>
                   <h5 className="text-sm font-black text-white uppercase italic">Atanan Uzman</h5>
                   <p className="text-[10px] text-blue-300 font-bold uppercase mt-1">Uzm. Fzt. Erdem Arslan</p>
                </div>
             </div>
             <div className="pt-4 border-t border-white/5 space-y-2 relative z-10">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500">
                   <span>Son Görüşme</span>
                   <span className="text-blue-400">Dün, 14:30</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500">
                   <span>Sonraki Randevu</span>
                   <span className="text-emerald-400">Yarın, 10:00</span>
                </div>
             </div>
             <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative z-10">
                TERAPİSTE MESAJ GÖNDER
             </button>
         </div>

         <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
            <Heart size={32} className="text-rose-500 animate-pulse" />
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Kardiyovasküler Durum</h5>
            <p className="text-[9px] text-slate-500 italic leading-relaxed">"Bugünkü egzersizler sırasında ortalama nabzınız 72 BPM olarak ölçüldü."</p>
         </div>
      </div>
    </>
  );
};

// --- HELPER COMPONENTS ---

const ThemeOption = ({ label, active, icon: Icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-3xl border text-center transition-all flex flex-col items-center gap-3 relative group/theme ${active ? 'bg-blue-600 border-blue-400 text-white shadow-xl scale-105' : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-300'}`}
  >
     {active && <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping" />}
     <Icon size={24} className={active ? 'text-white' : 'text-slate-700'} />
     <span className="text-[8px] font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const ToggleOption = ({ label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-emerald-500/30 transition-all shadow-inner">
     <div className="space-y-1">
        <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{label}</h5>
        <p className="text-[9px] text-slate-500 font-medium italic">{desc}</p>
     </div>
     <button onClick={onToggle} className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'} shadow-lg`} />
     </button>
  </div>
);

const PermissionItem = ({ label, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all group">
     <div className="flex items-center gap-3">
        {active ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-slate-600" />}
        <span className="text-[10px] font-bold text-slate-300 uppercase group-hover:text-white transition-colors">{label}</span>
     </div>
     <button onClick={onToggle} className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-amber-500' : 'bg-slate-800'}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
     </button>
  </div>
);
