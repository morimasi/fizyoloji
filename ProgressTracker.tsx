
import React, { useState } from 'react';
import { 
  TrendingUp, Activity, Brain, CheckCircle2, 
  AlertCircle, Calendar, Thermometer, Info,
  LineChart as LineIcon, BarChart3, Target, 
  ShieldAlert, Download, Share2, FileText,
  ChevronRight, ArrowUpRight, Gauge, Layers,
  Clock, Flame, Zap, ZapOff, Sparkles, Filter,
  History, AlertTriangle
} from 'lucide-react';
import { PatientProfile, ProgressReport } from './types.ts';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  LineChart, Line, BarChart, Bar, Cell 
} from 'recharts';

/**
 * PHYSIOCORE ADVANCED ANALYTICS v6.1
 * Deep Clinical Tracking & AI Trajectory Prediction
 * Support for Demo Mode and Robust Data Guarding
 */

const PREDICTION_DATA = [
  { day: '0', actual: 10, predicted: 10 },
  { day: '7', actual: 25, predicted: 22 },
  { day: '14', actual: 38, predicted: 35 },
  { day: '21', actual: 42, predicted: 48 },
  { day: '28', actual: null, predicted: 62 },
  { day: '35', actual: null, predicted: 75 },
  { day: '42', actual: null, predicted: 90 },
];

export const ProgressTracker = ({ profile }: { profile: PatientProfile | null }) => {
  const [activeAnalysis, setActiveAnalysis] = useState<'recovery' | 'pain' | 'compliance'>('recovery');

  // Guard: Handle missing profile with Demo Data
  const isDemo = !profile;
  const history = profile?.progressHistory || [];
  const lastReport = history.length > 0 ? history[history.length - 1] : null;
  const trajectory = profile?.physicalAssessment?.recoveryTrajectory || 72;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-roboto pb-24">
      
      {/* DEMO MODE INDICATOR */}
      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl flex items-center justify-between px-10">
           <div className="flex items-center gap-4 text-amber-500">
              <AlertTriangle size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Sistem Simülasyonu Aktif - Henüz Bir Hasta Kaydı Saptanmadı</span>
           </div>
           <p className="text-[9px] text-amber-500/60 font-bold uppercase italic">Genesis Predictive Engine v6.1</p>
        </div>
      )}

      {/* 1. CLINICAL KPI HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          icon={Target} 
          label="İyileşme Yörüngesi" 
          value={`%${trajectory}`} 
          sub="Hedefe Kalan: 12 Gün" 
          color="text-cyan-400" 
          trend="+4.2%" 
        />
        <KPICard 
          icon={Thermometer} 
          label="VAS Ağrı İndeksi" 
          value={lastReport ? `${lastReport.painScore}/10` : '4.2/10'} 
          sub={lastReport ? "Son Seans Verisi" : "Tahmini Ortalamada"} 
          color="text-rose-500" 
          trend="-12%" 
          trendInverse 
        />
        <KPICard 
          icon={CheckCircle2} 
          label="Protokol Uyumu" 
          value="%92" 
          sub="Global Sıralama: İlk %5" 
          color="text-emerald-400" 
          trend="+2%" 
        />
        <KPICard 
          icon={Clock} 
          label="Toplam Tedavi" 
          value="4. Hafta" 
          sub="Faz: Sub-Akut" 
          color="text-amber-400" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* 2. MAIN ANALYTICS ENGINE */}
        <div className="xl:col-span-8 space-y-8">
           <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                 <div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-4">
                       <BarChart3 size={28} className="text-cyan-400" /> Genesis <span className="text-cyan-400">Analiz Motoru</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Klinik Veri ve AI Tahmin Modellemesi</p>
                 </div>
                 <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
                    <AnalysisTab active={activeAnalysis === 'recovery'} onClick={() => setActiveAnalysis('recovery')} label="İyileşme" />
                    <AnalysisTab active={activeAnalysis === 'pain'} onClick={() => setActiveAnalysis('pain')} label="Ağrı" />
                    <AnalysisTab active={activeAnalysis === 'compliance'} onClick={() => setActiveAnalysis('compliance')} label="Uyum" />
                 </div>
              </div>

              <div className="h-[400px] w-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PREDICTION_DATA}>
                       <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="day" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                         itemStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
                       />
                       <Area type="monotone" dataKey="predicted" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="AI Tahmini" />
                       <Area type="monotone" dataKey="actual" stroke="#06B6D4" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" name="Gerçekleşen" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="mt-8 p-6 bg-slate-950/50 rounded-3xl border border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Öngörülen Final</span>
                       <span className="text-sm font-black text-white italic">24 Mart 2026</span>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-800" />
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Başarı Olasılığı</span>
                       <span className="text-sm font-black text-emerald-400 italic">%94.2</span>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest transition-all">
                    <Download size={14} /> Detaylı Raporu İndir
                 </button>
              </div>
           </div>

           {/* 3. BIOMETRIC RADAR MAP */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 space-y-8">
                 <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                       <Gauge size={20} className="text-emerald-400" /> Biyometrik <span className="text-emerald-400">ROM Map</span>
                    </h4>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">Degree Tracking v2.1</span>
                 </div>
                 <div className="space-y-6">
                    <BiometricProgress label="Lumbar Fleksiyon" current={45} target={90} unit="°" />
                    <BiometricProgress label="Lumbar Ekstansiyon" current={15} target={30} unit="°" />
                    <BiometricProgress label="Lateral Eğilme (Sağ)" current={22} target={35} unit="°" />
                 </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 space-y-8">
                 <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                       <Layers size={20} className="text-amber-400" /> Kas <span className="text-amber-400">Kuvveti (MMT)</span>
                    </h4>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">Load Balance Analysis</span>
                 </div>
                 <div className="space-y-6">
                    <BiometricProgress label="Multifidus Dayanıklılık" current={3} target={5} unit="/5" color="bg-amber-500" />
                    <BiometricProgress label="Transversus Kontrol" current={4} target={5} unit="/5" color="bg-amber-500" />
                    <BiometricProgress label="Gluteal Ateşleme" current={2} target={5} unit="/5" color="bg-amber-500" />
                 </div>
              </div>
           </div>
        </div>

        {/* 4. AI CLINICAL INSIGHTS SIDEBAR */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="flex items-center gap-4 text-cyan-400">
                 <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-inner group-hover:rotate-12 transition-transform">
                    <Brain size={24} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em]">Klinik Muhakeme</h4>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">AI Insights v6.0</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={12} /> Pozitif Gelişim
                    </p>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                       {isDemo ? '"Hasta, sabah tutukluğu süresinde %40 azalma bildirdi. L5-S1 nöral mobilizasyonu optimal seviyeye ulaştı."' : profile?.latestInsight?.summary}
                    </p>
                 </div>

                 <div className="p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 space-y-3">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                       <ShieldAlert size={12} /> Kritik Uyarı
                    </p>
                    <p className="text-xs text-slate-400 italic leading-relaxed">
                       "Dün yapılan egzersiz sonrası bacakta yanıcı ağrı (neurogenic) artışı saptandı. Bir sonraki seansı Korumacı Faza almanız önerilir."
                    </p>
                 </div>
              </div>

              <button className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-900/20 transition-all flex items-center justify-center gap-3">
                 SİSTEME ÖZEL SORU SOR <Zap size={14} fill="currentColor" />
              </button>
           </div>

           {/* SMART CHRONOLOGY */}
           <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-inner">
              <div className="flex justify-between items-center">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                    <Calendar size={18} /> Aktivite Günlüğü
                 </h4>
                 <button className="p-2 bg-slate-950 rounded-lg text-slate-600 hover:text-cyan-400 border border-slate-800 transition-all">
                    <Filter size={14} />
                 </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                 {history.length > 0 ? history.slice().reverse().map((log, i) => (
                    <div key={i} className="p-6 bg-slate-950 rounded-[2rem] border border-slate-800 group hover:border-cyan-500/30 transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-[10px] font-mono font-bold text-cyan-500">
                                {new Date(log.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                             </div>
                             <div>
                                <p className="text-xs font-black text-white italic uppercase leading-none">Seans #{history.length - i}</p>
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Tamamlandı</span>
                             </div>
                          </div>
                          <div className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${log.painScore > 6 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                             VAS: {log.painScore}
                          </div>
                       </div>
                       <p className="text-[10px] text-slate-400 leading-relaxed italic line-clamp-2">"{log.feedback || 'Geri bildirim girilmedi.'}"</p>
                    </div>
                 )) : (
                    <div className="py-20 text-center flex flex-col items-center gap-6 bg-slate-950/30 rounded-[2rem] border border-slate-800/50">
                       <History size={48} className="text-slate-800" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Kronolojik Veri Yok</p>
                          <p className="text-[8px] text-slate-700 italic">Hastanın ilk seansını tamamlaması bekleniyor.</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const KPICard = ({ icon: Icon, label, value, sub, color, trend, trendInverse }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-4 group hover:border-slate-700 transition-all shadow-xl relative overflow-hidden">
     <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
     <div className={`w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 ${color} shadow-inner group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
     </div>
     <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-3">
           <span className="text-3xl font-black text-white italic tracking-tighter">{value}</span>
           {trend && (
              <span className={`text-[10px] font-black italic ${trendInverse ? (trend.includes('-') ? 'text-emerald-400' : 'text-rose-500') : (trend.includes('+') ? 'text-emerald-400' : 'text-rose-500')}`}>
                 {trend}
              </span>
           )}
        </div>
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter mt-1">{sub}</p>
     </div>
  </div>
);

const AnalysisTab = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {label}
  </button>
);

const BiometricProgress = ({ label, current, target, unit, color = "bg-cyan-500" }: any) => (
  <div className="space-y-3">
     <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{label}</span>
        <div className="flex items-baseline gap-1">
           <span className="text-xs font-black text-white italic">{current}</span>
           <span className="text-[8px] font-bold text-slate-600">/ {target} {unit}</span>
        </div>
     </div>
     <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner p-[1px]">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.4)]`} style={{ width: `${(current / target) * 100}%` }} />
     </div>
  </div>
);
