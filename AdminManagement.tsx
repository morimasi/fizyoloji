
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Zap, Sparkles, Crown, Settings2, Brain, 
  Terminal, Cpu, Save, ShieldAlert, Database, History, 
  Plus, Trash2, ShieldCheck, Eye, EyeOff, Lock, 
  RefreshCw, Wand2, AlertTriangle, Fingerprint, Activity
} from 'lucide-react';
import { getAI } from './ai-core.ts';

/**
 * PHYSIOCORE ADMIN COMMAND PROTOCOL v8.0
 * Functionalized Rewards, AI Tuning & Ultra-Permissions
 */

interface RewardRule {
  id: string;
  title: string;
  desc: string;
  icon: any;
  active: boolean;
}

export const AdminManagement = () => {
  const [rewardRules, setRewardRules] = useState<RewardRule[]>([
    { id: '1', title: 'İlk Adım', desc: 'İlk seansını tamamlayan hastalara özel rozet.', icon: Zap, active: true },
    { id: '2', title: 'Biyomekanik Master', desc: '7 gün %100 uyum sağlayanlara özel 4K render.', icon: Sparkles, active: true },
  ]);

  const [aiConfig, setAiConfig] = useState({
    reasoningDepth: 92,
    clinicalThreshold: 65,
    visualQuality: 100
  });

  const [permissions, setPermissions] = useState({
    therapist: { editPrescription: true, deletePatient: false, exportData: true, aiOverride: true },
    patient: { viewBiometrics: true, messageTherapist: true, editProfile: true }
  });

  const [logs, setLogs] = useState([
    { id: 1, time: "09:12", msg: "AI: Lomber fıtık kural seti güncellendi.", type: "info" },
    { id: 2, time: "10:45", msg: "SECURITY: Brute-force denemesi engellendi.", type: "warn" },
    { id: 3, time: "11:30", msg: "SYNC: 42 hasta mobil cihazla eşleşti.", type: "success" },
  ]);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const analyzeLogsWithAI = async () => {
    setIsAiProcessing(true);
    try {
      const ai = getAI();
      const logText = logs.map(l => `[${l.time}] ${l.msg}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Aşağıdaki sistem loglarını analiz et ve yöneticiye 1 cümlelik kritik bir tavsiye ver: \n${logText}`
      });
      setAiInsight(response.text || "Sistem kararlı durumda.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleRewardToggle = (id: string) => {
    setRewardRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteReward = (id: string) => {
    setRewardRules(prev => prev.filter(r => r.id !== id));
  };

  const addAiSuggestedReward = async () => {
    setIsAiProcessing(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Fizyoterapi hastaları için motivasyonel, yaratıcı bir ödül kuralı üret. JSON formatında: {title, desc}",
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text);
      setRewardRules(prev => [...prev, { id: Date.now().toString(), ...data, icon: Trophy, active: true }]);
    } catch (e) { console.error(e); }
    finally { setIsAiProcessing(false); }
  };

  return (
    <>
      <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-6 duration-700">
         
         {/* 1. Reward & Gamification Engine */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-10 group hover:border-cyan-500/30 transition-all shadow-2xl">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Trophy size={20} className="text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Ödül & <span className="text-amber-400">Oyunlaştırma Motoru</span></h3>
               </div>
               <button 
                onClick={addAiSuggestedReward}
                disabled={isAiProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all"
               >
                  {isAiProcessing ? <RefreshCw className="animate-spin" size={12} /> : <Wand2 size={12} />} AI KURAL ÜRET
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {rewardRules.map(rule => (
                  <div key={rule.id} className={`p-6 rounded-[2rem] border transition-all relative group/rule ${rule.active ? 'bg-slate-950 border-cyan-500/40 shadow-xl' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                     <button onClick={() => deleteReward(rule.id)} className="absolute top-4 right-4 opacity-0 group-hover/rule:opacity-100 text-rose-500 hover:scale-110 transition-all">
                        <Trash2 size={14} />
                     </button>
                     <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rule.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                           <rule.icon size={20} />
                        </div>
                        <button onClick={() => handleRewardToggle(rule.id)} className={`w-10 h-5 rounded-full p-1 transition-all ${rule.active ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                           <div className={`w-3 h-3 bg-white rounded-full transition-all ${rule.active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                     </div>
                     <h5 className="text-[11px] font-black text-white uppercase tracking-wider mb-2">{rule.title}</h5>
                     <p className="text-[9px] text-slate-500 leading-relaxed italic">{rule.desc}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* 2. Global AI Tuning */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Brain size={20} className="text-cyan-400" /> Global <span className="text-cyan-400">AI Konfigürasyonu</span>
            </h3>
            <div className="space-y-8">
               <AdminSlider 
                 label="Muhakeme Derinliği (Reasoning Steps)" 
                 value={aiConfig.reasoningDepth} 
                 icon={Cpu} 
                 onChange={(v:number) => setAiConfig({...aiConfig, reasoningDepth: v})} 
               />
               <AdminSlider 
                 label="Klinik Muhafazakarlık Eşiği" 
                 value={aiConfig.clinicalThreshold} 
                 icon={ShieldAlert} 
                 onChange={(v:number) => setAiConfig({...aiConfig, clinicalThreshold: v})} 
               />
            </div>
            <div className="pt-6 border-t border-slate-800 flex justify-end">
               <button className="flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all">
                  <Save size={16} /> GLOBAL STATE'İ GÜNCELLE
               </button>
            </div>
         </div>

         {/* 3. Ultra-Permissions Matrix */}
         <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Fingerprint size={20} className="text-emerald-400" /> Yetki <span className="text-emerald-400">Matrisi (E-RBAC)</span>
               </h3>
               <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-black">MILITARY GRADE ENCRYPTION</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Klinik Uzman Yetkileri</p>
                  <PermissionToggle label="Reçete Manipülasyonu" active={permissions.therapist.editPrescription} onToggle={() => setPermissions({...permissions, therapist: {...permissions.therapist, editPrescription: !permissions.therapist.editPrescription}})} />
                  <PermissionToggle label="Hasta Kaydı Silme" active={permissions.therapist.deletePatient} onToggle={() => setPermissions({...permissions, therapist: {...permissions.therapist, deletePatient: !permissions.therapist.deletePatient}})} />
                  <PermissionToggle label="AI Muhakeme Bypass" active={permissions.therapist.aiOverride} onToggle={() => setPermissions({...permissions, therapist: {...permissions.therapist, aiOverride: !permissions.therapist.aiOverride}})} />
               </div>
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hasta / Bireysel Yetkileri</p>
                  <PermissionToggle label="Biyometrik Veri İzleme" active={permissions.patient.viewBiometrics} onToggle={() => setPermissions({...permissions, patient: {...permissions.patient, viewBiometrics: !permissions.patient.viewBiometrics}})} />
                  <PermissionToggle label="Profil Bilgisi Düzenleme" active={permissions.patient.editProfile} onToggle={() => setPermissions({...permissions, patient: {...permissions.patient, editProfile: !permissions.patient.editProfile}})} />
                  <PermissionToggle label="Direkt Terapist Mesaj" active={permissions.patient.messageTherapist} onToggle={() => setPermissions({...permissions, patient: {...permissions.patient, messageTherapist: !permissions.patient.messageTherapist}})} />
               </div>
            </div>
         </div>
      </div>

      <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-right-6 duration-700">
         {/* System Logs & AI Analyzer */}
         <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex justify-between items-center">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <Terminal size={18} /> Sistem Logları
               </h4>
               <button onClick={analyzeLogsWithAI} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all" title="AI Analiz">
                  <Brain size={16} />
               </button>
            </div>

            {aiInsight && (
               <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl animate-in zoom-in duration-300">
                  <div className="flex items-center gap-2 text-cyan-400 mb-2">
                     <Wand2 size={12} />
                     <span className="text-[9px] font-black uppercase">AI Güvenlik Öngörüsü</span>
                  </div>
                  <p className="text-[10px] text-cyan-100 italic leading-relaxed">"{aiInsight}"</p>
               </div>
            )}

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {logs.map(log => (
                  <LogEntry key={log.id} time={log.time} msg={log.msg} type={log.type} />
               ))}
            </div>
         </div>

         {/* Backup & Database Engine */}
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-6 shadow-2xl">
            <div className="flex items-center gap-4 text-white">
               <Database size={24} className="text-cyan-500" />
               <h4 className="text-sm font-black uppercase tracking-widest">Veritabanı Motoru</h4>
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Son Yedekleme</span>
                  <span className="text-[10px] font-mono text-cyan-500">Bugün, 04:00</span>
               </div>
               <button className="w-full py-4 bg-slate-800 hover:bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  ŞİMDİ YEDEKLE (SNAPSHOT)
               </button>
               <button className="w-full py-4 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  TÜM CACHE'İ TEMİZLE
               </button>
            </div>
         </div>

         <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <Activity size={40} className="mb-6 opacity-20 group-hover:scale-110 transition-transform" />
            <h4 className="text-xl font-black italic uppercase leading-none mb-2">GPU <br/> Analizi</h4>
            <p className="text-xs text-white/70 italic mb-6">"Görsel üretim birimi bu hafta 214 adet hareket plakası render etti."</p>
            <div className="flex justify-between items-end">
               <span className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded">SLA: %99.9</span>
               <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white flex items-center justify-center font-black text-[10px]">99</div>
            </div>
         </div>
      </div>
    </>
  );
};

// --- HELPER COMPONENTS ---

const PermissionToggle = ({ label, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all group">
     <span className="text-[10px] font-bold text-slate-300 uppercase group-hover:text-white transition-colors">{label}</span>
     <button onClick={onToggle} className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
     </button>
  </div>
);

const AdminSlider = ({ label, value, icon: Icon, onChange }: any) => (
  <div className="space-y-4">
     <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <Icon size={14} className="text-cyan-500" /> {label}
        </span>
        <span className="text-[10px] font-mono font-bold text-cyan-400">%{value}</span>
     </div>
     <input 
      type="range" min="0" max="100" value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-slate-950 rounded-full appearance-none accent-cyan-500 cursor-pointer"
     />
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
