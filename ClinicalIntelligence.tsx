
import React from 'react';
import { 
  BrainCircuit, ShieldAlert, Zap, 
  TrendingDown, TrendingUp, AlertCircle,
  Activity, ArrowRight, UserCheck, MessageSquare,
  BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  ShieldCheck, Info, Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

/**
 * PHYSIOCORE CLINICAL INTELLIGENCE v4.5
 * RECHARTS INTEGRATION - SPECIAL EDITION
 */

const RECOVERY_DATA = [
  { day: 'Pzt', index: 62 },
  { day: 'Sal', index: 65 },
  { day: 'Çar', index: 63 },
  { day: 'Per', index: 68 },
  { day: 'Cum', index: 74 },
  { day: 'Cmt', index: 78 },
  { day: 'Paz', index: 82 },
];

const RISK_DISTRIBUTION = [
  { name: 'Düşük Risk', value: 45, color: '#10B981' },
  { name: 'Orta Risk', value: 30, color: '#F59E0B' },
  { name: 'Yüksek Risk', value: 25, color: '#EF4444' },
];

export const ClinicalIntelligence = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-roboto">
      {/* Header & Meta Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
            <BrainCircuit size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">Klinik <span className="text-cyan-400">Zeka</span></h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck size={12} className="text-emerald-500" /> Genesis AI Decision Support Engine v5.0
            </p>
          </div>
        </div>

        <div className="flex gap-3">
           <KPICard label="Klinik Doğruluk" value="%98.4" color="text-cyan-400" />
           <KPICard label="Tahmin Gücü" value="High" color="text-emerald-400" />
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recovery Trend Chart */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
           <div className="flex justify-between items-center">
              <div>
                 <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <LineIcon size={16} className="text-cyan-400" /> Kolektif İyileşme Trendi
                 </h4>
                 <p className="text-[9px] text-slate-500 uppercase mt-1 italic">Son 7 Günlük Klinik İndeks Analizi</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                 <TrendingUp size={12} className="text-emerald-400" />
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">+12% ARTIS</span>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={RECOVERY_DATA}>
                    <defs>
                       <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#06B6D4', fontSize: '10px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '9px', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="index" 
                      stroke="#06B6D4" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorIndex)" 
                      animationDuration={2000}
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
           <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <PieIcon size={16} className="text-rose-500" /> Risk Dağılımı
           </h4>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={RISK_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={500}
                      animationDuration={1500}
                    >
                      {RISK_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                       itemStyle={{ fontSize: '10px' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-3">
              {RISK_DISTRIBUTION.map((r, i) => (
                 <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                       <span className="text-slate-400">{r.name}</span>
                    </div>
                    <span className="text-white">%{r.value}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* High Priority Monitor & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
           <div className="flex justify-between items-end px-2">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-500" /> Kritik Müdahale Bekleyenler
              </h4>
              <button className="text-[9px] font-black text-cyan-500 uppercase tracking-widest hover:underline transition-all">Tümünü Gör</button>
           </div>
           
           <div className="space-y-4">
              <RiskCase 
                name="Caner Özkan" 
                diagnosis="Lumbar Disk Hernisi" 
                reason="Ağrı skorunda %40 artış (VAS 4 -> 8)" 
                risk="YÜKSEK" 
                trend="down"
              />
              <RiskCase 
                name="Sibel Erden" 
                diagnosis="ACL Post-Op" 
                reason="Egzersiz uyumu %30'un altına düştü" 
                risk="ORTA" 
                trend="down"
              />
              <RiskCase 
                name="Murat Ak" 
                diagnosis="Tenisçi Dirseği" 
                reason="2 seanstır veri girişi yapılmadı" 
                risk="DÜŞÜK" 
                trend="stale"
              />
           </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
           
           <div className="space-y-2 relative z-10">
             <h4 className="text-lg font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
               <Zap size={20} className="text-cyan-400" fill="currentColor" /> AI Stratejik <span className="text-cyan-400">Kararlar</span>
             </h4>
             <p className="text-[10px] text-slate-500 font-medium italic">Genesis Motoru tarafından üretilen gerçek zamanlı öneriler.</p>
           </div>

           <div className="space-y-6 relative z-10">
              <ActionCard 
                title="Dozaj Adaptasyonu" 
                desc="Caner Özkan için ağrı fazına uygun yüklenmeyi %50 azaltan ve dekompresyon odaklı yeni bir plan öneriliyor." 
                action="PROTOKOLÜ REVİZE ET"
                urgent
              />
              <ActionCard 
                title="Sanal Konsültasyon" 
                desc="Sibel Erden ile mobil uygulama üzerinden seans katılım motivasyonu için otomatik görüntülü görüşme başlatılsın mı?" 
                action="GÖRÜŞME BAŞLAT"
              />
              <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4">
                 <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
                    <Activity size={16} />
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    "Sistem genelinde rehabilitasyon hızı %14 arttı. Yapay zeka periyodizasyonu, manuel periyodizasyona göre %22 daha efektif sonuçlar üretiyor."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, color }: any) => (
  <div className="bg-slate-950 border border-slate-800 px-6 py-3 rounded-2xl flex flex-col justify-center">
     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</span>
     <span className={`text-xl font-black italic tracking-tighter ${color}`}>{value}</span>
  </div>
);

const RiskCase = ({ name, diagnosis, reason, risk, trend }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between group hover:border-rose-500/30 transition-all">
    <div className="flex items-center gap-6">
       <div className={`w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 text-rose-500 shadow-inner group-hover:scale-110 transition-transform`}>
          {trend === 'down' ? <TrendingDown size={28} /> : <AlertCircle size={28} />}
       </div>
       <div>
          <h5 className="text-sm font-black text-white italic tracking-tight">{name} <span className="text-[10px] text-slate-500 not-italic ml-2">{diagnosis}</span></h5>
          <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed italic">"{reason}"</p>
       </div>
    </div>
    <div className="text-right flex flex-col items-end gap-2">
       <span className={`text-[9px] font-black px-3 py-1 rounded-lg border ${risk === 'YÜKSEK' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : risk === 'ORTA' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
         {risk} RİSK
       </span>
       <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowRight size={14} /></button>
    </div>
  </div>
);

const ActionCard = ({ title, desc, action, urgent }: any) => (
  <div className={`p-6 bg-slate-950 rounded-2xl border transition-all ${urgent ? 'border-cyan-500/30 ring-1 ring-cyan-500/10' : 'border-slate-800'}`}>
     <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-cyan-400">
           <Activity size={16} />
           <h6 className="text-[10px] font-black uppercase tracking-widest">{title}</h6>
        </div>
        {urgent && <Flame size={12} className="text-orange-500 animate-pulse" />}
     </div>
     <p className="text-xs text-slate-400 leading-relaxed italic mb-4">"{desc}"</p>
     <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-cyan-400 transition-all flex items-center justify-center gap-2 group">
        {action} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
     </button>
  </div>
);
