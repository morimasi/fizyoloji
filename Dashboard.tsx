
import React from 'react';
import { 
  Activity, Zap, TrendingUp, Calendar, 
  ChevronRight, Play, Thermometer, Heart, 
  Flame, Shield, MessageSquare, Clock, 
  Trophy, CloudSync, BrainCircuit, AlertTriangle, 
  Target, BarChart3, Settings2, Sparkles,
  ArrowUpRight, Gauge, Layers, Info, History,
  TrendingDown, Repeat, Timer, HeartPulse, User, ShieldAlert
} from 'lucide-react';
import { PatientProfile, Exercise } from './types.ts';
import { RPMBridge } from './RPMBridge.tsx';
import { ClinicalRules } from './ClinicalRules.ts';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

/**
 * PHYSIOCORE CLINICAL DASHBOARD v6.5
 * Recharts & Biometric Visualization Hub with Red-Flag Alerts
 */

const DEMO_RECOVERY_DATA = [
  { name: 'Hafta 1', score: 30, target: 40 },
  { name: 'Hafta 2', score: 45, target: 50 },
  { name: 'Hafta 3', score: 42, target: 60 },
  { name: 'Hafta 4', score: 68, target: 70 },
  { name: 'Hafta 5', score: 85, target: 80 },
];

export const Dashboard: React.FC<{ profile: PatientProfile | null, onExerciseSelect: (ex: Exercise) => void }> = ({ profile, onExerciseSelect }) => {
  
  // Vaka yoksa gösterilecek Demo verisi
  const isDemo = !profile;
  const displayProfile = profile || {
    diagnosisSummary: "Demo: Lomber Disk Hernisi (L5-S1)",
    riskLevel: "Düşük",
    status: "Stabil",
    rehabPhase: "Sub-Akut",
    suggestedPlan: [],
    progressHistory: [],
    physicalAssessment: { recoveryTrajectory: 72 },
    latestInsight: { summary: "Hasta iyileşme trendinde. Hareket açıklığı %15 arttı.", nextStep: "Faz 2 Egzersizlerine Geçiş" }
  };

  // Kırmızı Bayrak Analizi
  const redFlags = ClinicalRules.detectRedFlags(displayProfile.progressHistory);

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 font-roboto">
      
      {/* 0. RED FLAG ALERTS (EBM v3.2) */}
      {redFlags.length > 0 && (
        <div className="col-span-12 animate-in slide-in-from-top-4 duration-500">
           <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl shadow-rose-500/10">
              <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 animate-pulse">
                 <ShieldAlert size={32} />
              </div>
              <div className="flex-1">
                 <h4 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] mb-1">Kritik Klinik Uyarı (Red Flag)</h4>
                 <p className="text-sm text-rose-100 font-medium italic">{redFlags[0]}</p>
              </div>
              <button className="px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">
                 UZMANA SEVK ET
              </button>
           </div>
        </div>
      )}

      {/* 1. AI STRATEGIC COMMAND HUB */}
      <div className="col-span-12">
        <div className="bg-slate-900/60 backdrop-blur-3xl border-l-4 border-cyan-500 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
           <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-cyan-500/10 rounded-[2rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    <BrainCircuit size={44} className="animate-pulse" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-1">Genesis Strategic Intelligence</p>
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Klinik <span className="text-cyan-400">Öngörü Paneli</span></h2>
                    {isDemo && <span className="text-[8px] bg-amber-500 text-black px-2 py-0.5 rounded font-black mt-2 inline-block">DEMO MODU</span>}
                 </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                 <Metric label="İyileşme Yörüngesi" value={`%${displayProfile.physicalAssessment.recoveryTrajectory || 0}`} icon={Target} sub="Tahmini Hedef: 14 Gün" />
                 <Metric label="Nöromusküler Uyum" value="%88" icon={Activity} sub="Optimal Seviye" />
                 <Metric label="Risk İndeksi" value={displayProfile.riskLevel} icon={Shield} sub="Kırmızı Bayrak Yok" color={redFlags.length > 0 ? "text-rose-500" : "text-emerald-400"} />
              </div>

              <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 lg:max-w-xs">
                 <p className="text-[9px] font-black text-slate-500 uppercase mb-2">AI Direktifi</p>
                 <p className="text-xs text-slate-300 italic leading-relaxed">"{displayProfile.latestInsight?.summary || "Analiz bekleniyor..."}"</p>
              </div>
           </div>
        </div>
      </div>

      {/* 2. BIOMETRIC HUD & RECOVERY CHART */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
         <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 h-48 flex flex-col justify-between group hover:border-rose-500/30 transition-all">
            <div className="flex justify-between items-start">
               <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20 shadow-lg group-hover:scale-110 transition-transform"><Thermometer size={24} /></div>
               <div className="text-right">
                  <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 uppercase tracking-widest">Pain Score</span>
                  <p className="text-[8px] text-slate-600 mt-1 uppercase font-bold italic">VAS Sensity v2.1</p>
               </div>
            </div>
            <div>
               <div className="text-5xl font-black text-white italic tracking-tighter">
                {displayProfile.progressHistory.length > 0 ? displayProfile.progressHistory[displayProfile.progressHistory.length-1].painScore : '4.2'}
                <span className="text-lg text-slate-600 not-italic ml-2">/10</span>
               </div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <TrendingDown size={14} className={redFlags.length > 0 ? "text-rose-500" : "text-emerald-500"} /> 
                  {redFlags.length > 0 ? "Ağrı trendi yükselişte!" : "Son seansa göre iyileşme"}
               </p>
            </div>
         </div>

         <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 h-48 flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-start">
               <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-lg group-hover:scale-110 transition-transform"><Gauge size={24} /></div>
               <div className="text-right">
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Mobility ROM</span>
                  <p className="text-[8px] text-slate-600 mt-1 uppercase font-bold italic">Joint Flex Index</p>
               </div>
            </div>
            <div>
               <div className="text-5xl font-black text-white italic tracking-tighter">%92</div>
               <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
               </div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 text-right">Hedef: %95</p>
            </div>
         </div>
      </div>

      <div className="col-span-12 lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-3">
                  <BarChart3 size={20} className="text-cyan-400" /> İyileşme <span className="text-cyan-400">Yörüngesi</span>
               </h3>
               <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Haftalık Biyomekanik Performans Verisi</p>
            </div>
         </div>

         <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={DEMO_RECOVERY_DATA}>
                  <defs>
                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="target" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                  <Area type="monotone" dataKey="score" stroke="#06B6D4" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 3. EXERCISE ATELIER */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
         <div className="flex justify-between items-center px-4">
             <div>
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Egzersiz <span className="text-cyan-400">Atölyesi</span></h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">GÜNLÜK REHABİLİTASYON PROGRAMI</p>
             </div>
         </div>
         
         <div className="grid grid-cols-1 gap-4">
            {displayProfile.suggestedPlan.length > 0 ? (
               displayProfile.suggestedPlan.map((ex, idx) => (
                  <div key={idx} onClick={() => onExerciseSelect(ex)} className="bg-slate-900/40 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-[2rem] flex items-center gap-8 cursor-pointer transition-all">
                     <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-700 font-black italic border border-slate-800 text-lg">0{idx+1}</div>
                     <div className="flex-1">
                        <h4 className="font-black text-lg text-slate-200 uppercase italic tracking-tight">{ex.titleTr || ex.title}</h4>
                        <div className="flex gap-4 mt-1">
                           <span className="text-[10px] font-black text-slate-600 uppercase">{ex.sets}x{ex.reps} Dozaj</span>
                           <span className="text-[10px] font-black text-cyan-500 uppercase">{ex.rehabPhase} Faz</span>
                        </div>
                     </div>
                     <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center text-slate-600 hover:text-cyan-400 border border-slate-800 shadow-xl transition-all">
                        <Play size={20} fill="currentColor" className="ml-1" />
                     </div>
                  </div>
               ))
            ) : (
               <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30">
                  <Flame size={48} className="mx-auto mb-4" />
                  <p className="font-black text-[10px] uppercase tracking-widest">Aktif Program Yok</p>
                  <p className="text-[10px] italic mt-2">Lütfen Klinik modülünden analiz başlatın.</p>
               </div>
            )}
         </div>
      </div>

      {/* 4. CLINICAL SIDEBAR */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
         <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <Trophy size={48} className="text-white/20 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-2xl font-black italic uppercase leading-none mb-2">Haftalık <br/> Başarı</h4>
            <p className="text-xs text-white/70 font-medium leading-relaxed italic">"7 gün üst üste program uyumu sağladınız. Biyolojik doku iyileşmesi %14 hızlandı."</p>
         </div>

         <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={16} /> Son Aktivite</h3>
            <div className="space-y-4">
               <ActivityLogItem date="Bugün" text="Program Revize Edildi" status="info" />
               <ActivityLogItem date="Dün" text="Diz Stabilizasyonu Tamamlandı" status="success" />
            </div>
         </div>
      </div>

      {/* RPM Bridge Integration */}
      <div className="col-span-12">
         {profile && <RPMBridge profile={profile} />}
      </div>
    </div>
  );
};

const Metric = ({ label, value, icon: Icon, sub, color = "text-white" }: any) => (
  <div className="space-y-1">
     <div className="flex items-center gap-2 text-slate-500">
        <Icon size={14} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
     </div>
     <div className={`text-2xl font-black italic ${color}`}>{value}</div>
     <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{sub}</p>
  </div>
);

const ActivityLogItem = ({ date, text, status }: any) => (
  <div className="flex items-center gap-4">
     <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
     <div>
        <p className="text-[10px] font-bold text-white uppercase italic">{text}</p>
        <p className="text-[8px] font-black text-slate-600 uppercase">{date}</p>
     </div>
  </div>
);
