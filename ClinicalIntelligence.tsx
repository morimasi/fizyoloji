
import React from 'react';
import { 
  BrainCircuit, ShieldAlert, Zap, 
  TrendingDown, TrendingUp, AlertCircle,
  Activity, ArrowRight, UserCheck, MessageSquare,
  BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  ShieldCheck, Info, Flame, Target, Users, AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

/**
 * PHYSIOCORE CLINICAL INTELLIGENCE v5.0
 * RECHARTS MASTER ANALYTICS MODULE
 */

const RECOVERY_TREND = [
  { week: '1. Hafta', progress: 42, target: 45 },
  { week: '2. Hafta', progress: 48, target: 50 },
  { week: '3. Hafta', progress: 45, target: 55 },
  { week: '4. Hafta', progress: 58, target: 60 },
  { week: '5. Hafta', progress: 66, target: 65 },
  { week: '6. Hafta', progress: 74, target: 70 },
  { week: '7. Hafta', progress: 82, target: 75 },
];

const RISK_LEVELS = [
  { name: 'Kritik (Kırmızı)', value: 12, color: '#EF4444' },
  { name: 'Yüksek Risk', value: 18, color: '#F97316' },
  { name: 'Orta Risk', value: 35, color: '#F59E0B' },
  { name: 'Stabil/Düşük', value: 35, color: '#10B981' },
];

const PATHOLOGY_RISK = [
  { category: 'Lomber', risk: 85, load: 40 },
  { category: 'Servikal', risk: 45, load: 25 },
  { category: 'Alt Eks.', risk: 65, load: 20 },
  { category: 'Üst Eks.', risk: 30, load: 10 },
  { category: 'Post-Op', risk: 92, load: 5 },
];

export const ClinicalIntelligence = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-roboto">
      
      {/* GLOBAL HUD */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-[1.5rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner group">
            <BrainCircuit size={36} className="group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">Klinik <span className="text-cyan-400">Zeka</span></h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                 <ShieldCheck size={10} /> GENESIS AI v5.0 ACTIVE
              </span>
              <span className="w-1 h-1 bg-slate-800 rounded-full" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tahmin Doğruluğu: %98.7</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <KPITile label="Aktif Risk" value="24" sub="Hasta" color="text-rose-500" />
           <KPITile label="İyileşme Hızı" value="+%18" sub="Global" color="text-emerald-400" />
           <KPITile label="Sistem Yükü" value="%72" sub="Kapasite" color="text-cyan-400" />
        </div>
      </div>

      {/* PRIMARY ANALYTICS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* RECOVERY TREND (Area Chart) */}
        <div className="xl:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden backdrop-blur-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
           
           <div className="flex justify-between items-center relative z-10">
              <div>
                 <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <LineIcon size={16} className="text-cyan-400" /> İyileşme Trend Analizi
                 </h4>
                 <p className="text-[9px] text-slate-500 uppercase mt-1 italic">Kohort Bazlı Gelişim vs Klinik Hedef</p>
              </div>
              <div className="flex gap-4">
                 <LegendItem color="#06B6D4" label="Mevcut" />
                 <LegendItem color="#1e293b" label="Hedef" dashed />
              </div>
           </div>
           
           <div className="h-[320px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={RECOVERY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="week" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '12px' }}
                      itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '9px', marginBottom: '4px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="target" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" fill="transparent" animationDuration={1000} />
                    <Area type="monotone" dataKey="progress" stroke="#06B6D4" strokeWidth={4} fillOpacity={1} fill="url(#colorProgress)" animationDuration={2000} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* RISK DISTRIBUTION (Pie Chart) */}
        <div className="xl:col-span-4 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 flex flex-col backdrop-blur-xl">
           <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <PieIcon size={16} className="text-rose-500" /> Risk Dağılım Özeti
           </h4>
           
           <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
              <div className="h-[220px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={RISK_LEVELS}
                         cx="50%" cy="50%"
                         innerRadius={65} outerRadius={85}
                         paddingAngle={8}
                         dataKey="value"
                         stroke="none"
                         animationDuration={1500}
                       >
                         {RISK_LEVELS.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                         itemStyle={{ fontSize: '10px', color: '#fff' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white italic leading-none">120</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Toplam Vaka</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full pt-4">
                 {RISK_LEVELS.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{r.name}</span>
                          <span className="text-xs font-bold text-white tracking-tighter">%{r.value}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* SECONDARY ANALYTICS (Bar Chart & Warnings) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* PATHOLOGY RISK HEATMAP (Bar Chart) */}
        <div className="xl:col-span-5 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
           <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-500" /> Patoloji & Yük Analizi
           </h4>
           <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={PATHOLOGY_RISK} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="category" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                    <Bar dataKey="risk" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} animationDuration={2000} />
                    <Bar dataKey="load" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={20} animationDuration={2500} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="flex gap-6 justify-center">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-sm bg-rose-500" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Risk İndeksi</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-sm bg-cyan-500" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">İş Yükü</span>
              </div>
           </div>
        </div>

        {/* SMART ALERTS & SYSTEM RED FLAGS */}
        <div className="xl:col-span-7 space-y-4">
           <div className="flex justify-between items-end px-2">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-500" /> Kritik Klinik Uyarılar (Red Flags)
              </h4>
              <button className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1 hover:underline">
                 ARŞİVE GİT <ArrowRight size={10} />
              </button>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              <AlertItem 
                type="danger"
                title="Şiddetli Ağrı Artışı (VAS 9+)"
                desc="Caner Özkan (ID: 4412) - Lomber fıtık hastasında son 24 saatte beklenmedik nörolojik defisit bulgusu ve ağrı artışı saptandı."
                time="14 Dakika Önce"
              />
              <AlertItem 
                type="warning"
                title="Egzersiz Uyumu Kritik Eşik"
                desc="Sibel Erden (Post-Op ACL) - Seans tamamlama oranı %30 altına düştü. İyileşme trendinde sapma (Slope -2.4)."
                time="2 Saat Önce"
              />
              <AlertItem 
                type="info"
                title="AI Protokol Önerisi Hazır"
                desc="Murat Ak için yapılan analizler sonucunda 'Kronik Faz'a geçiş kriterleri sağlandı. Protokol revizyonu öneriliyor."
                time="Bugün, 09:12"
              />
           </div>
        </div>
      </div>

      {/* STRATEGIC DECISION BOARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-4">
               <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-lg">
                  <Zap size={24} fill="currentColor" />
               </div>
               <div>
                  <h4 className="text-2xl font-black italic tracking-tighter text-white uppercase">AI Stratejik <span className="text-cyan-400">Kararlar</span></h4>
                  <p className="text-xs text-slate-500 font-medium italic mt-2 leading-relaxed">
                     Genesis motoru tarafından işlenen gerçek zamanlı veriler ışığında önerilen öncelikli klinik aksiyonlar.
                  </p>
               </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
               <DecisionCard 
                 title="Dozaj Adaptasyonu Uygula" 
                 target="Caner Özkan" 
                 action="Yüklenmeyi %50 Azalt" 
                 reason="Nöral Inflamasyon Riski"
                 urgent
               />
               <DecisionCard 
                 title="Konsültasyon Başlat" 
                 target="Sibel Erden" 
                 action="Görüntülü Arama" 
                 reason="Düşük Motivasyon / Uyum"
               />
            </div>
         </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const KPITile = ({ label, value, sub, color }: any) => (
  <div className="bg-slate-950 border border-slate-800 px-6 py-3 rounded-2xl flex flex-col justify-center min-w-[120px] shadow-xl group hover:border-slate-700 transition-all">
     <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{label}</span>
     <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</span>
        <span className="text-[8px] font-bold text-slate-500 uppercase">{sub}</span>
     </div>
  </div>
);

const LegendItem = ({ color, label, dashed }: any) => (
  <div className="flex items-center gap-2">
     <div className={`w-8 h-1 rounded-full ${dashed ? 'border-t-2 border-dashed border-slate-700' : ''}`} style={{ backgroundColor: dashed ? 'transparent' : color }} />
     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

const AlertItem = ({ type, title, desc, time }: any) => {
  const configs: any = {
    danger: { icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    info: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  };
  const C = configs[type];
  const Icon = C.icon;

  return (
    <div className={`flex items-start gap-5 p-6 ${C.bg} ${C.border} border rounded-[2rem] group hover:scale-[1.01] transition-all cursor-pointer shadow-lg`}>
       <div className={`w-12 h-12 ${C.bg} border ${C.border} rounded-2xl flex items-center justify-center ${C.color} shrink-0 shadow-inner group-hover:rotate-12 transition-transform`}>
          <Icon size={24} />
       </div>
       <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
             <h5 className={`text-sm font-black italic tracking-tight uppercase ${C.color}`}>{title}</h5>
             <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{time}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic">"{desc}"</p>
       </div>
       <button className="self-center p-2 bg-slate-950/50 rounded-xl text-slate-500 hover:text-white transition-colors">
          <ArrowRight size={14} />
       </button>
    </div>
  );
};

const DecisionCard = ({ title, target, action, reason, urgent }: any) => (
  <div className={`p-6 rounded-[2rem] border transition-all ${urgent ? 'bg-rose-500/5 border-rose-500/30' : 'bg-slate-950 border-slate-800'} hover:border-cyan-500/40 group`}>
     <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</span>
           <h6 className="text-sm font-black text-white italic tracking-tight uppercase group-hover:text-cyan-400 transition-colors">{target}</h6>
        </div>
        {urgent && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
     </div>
     
     <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
           <p className="text-[8px] font-black text-slate-600 uppercase">Önerilen Aksiyon</p>
           <p className={`text-[10px] font-bold ${urgent ? 'text-rose-400' : 'text-emerald-400'} uppercase`}>{action}</p>
        </div>
        <div className="space-y-1">
           <p className="text-[8px] font-black text-slate-600 uppercase">Klinik Sebep</p>
           <p className="text-[10px] font-bold text-slate-400 uppercase italic truncate">{reason}</p>
        </div>
     </div>

     <button className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${urgent ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'bg-slate-900 text-cyan-400 border border-slate-800 group-hover:border-cyan-500/40'}`}>
        SİSTEMİ GÜNCELLE <Activity size={12} />
     </button>
  </div>
);
