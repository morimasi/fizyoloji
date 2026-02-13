
import React, { useMemo } from 'react';
import { 
  BrainCircuit, ShieldAlert, Zap, 
  TrendingDown, TrendingUp, AlertCircle,
  Activity, ArrowRight, Info, Target,
  Pulse, History, FlaskConical, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, 
  Cell, Legend, BarChart, Bar, ComposedChart, Line
} from 'recharts';

/**
 * CLINICAL INTELLIGENCE CENTER (v5.3)
 * AI-driven analytics for physical therapy population management.
 */

const MOCK_RECOVERY_TREND = [
  { month: 'Oca', progress: 45, completion: 78, pain: 7 },
  { month: 'Şub', progress: 52, completion: 82, pain: 6 },
  { month: 'Mar', progress: 58, completion: 85, pain: 6 },
  { month: 'Nis', progress: 64, completion: 80, pain: 5 },
  { month: 'May', progress: 72, completion: 90, pain: 4 },
  { month: 'Haz', progress: 78, completion: 92, pain: 3 },
];

const MOCK_RISK_DATA = [
  { name: 'Kritik (Yüksek)', value: 12, color: '#EF4444' },
  { name: 'Stabil (Orta)', value: 45, color: '#F59E0B' },
  { name: 'İyileşiyor (Düşük)', value: 43, color: '#10B981' },
];

export const ClinicalIntelligence = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Dynamic Intelligence Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-[1.5rem] flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <BrainCircuit size={36} className="animate-pulse" />
          </div>
          <div>
             <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Klinik <span className="text-cyan-400">İstihbarat</span></h3>
             <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded border border-white/5">GENESIS_AI CORE v5.3</span>
                <span className="w-1 h-1 bg-slate-800 rounded-full" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1"><Activity size={10}/> Canlı Analiz Aktif</span>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-3xl">
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nöral Muhakeme Hızı</p>
                 <p className="text-lg font-black text-white italic tracking-tighter">0.42 <span className="text-[10px] text-cyan-500">ms/op</span></p>
              </div>
              <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-white/5 text-cyan-500">
                 <Zap size={20} fill="currentColor" />
              </div>
           </div>
        </div>
      </div>

      {/* Analytics Power Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Population Risk Distribution */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
           <div className="space-y-1">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                 <ShieldAlert size={16} className="text-rose-500" /> RİSK_MATRİSİ
              </h4>
              <p className="text-[10px] text-slate-600 font-medium italic">Vaka ciddiyet dağılımı</p>
           </div>
           
           <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_RISK_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {MOCK_RISK_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '10px', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none translate-y-[-10px]">
                 <span className="text-3xl font-black text-white italic tracking-tighter">100</span>
                 <span className="text-[8px] font-black text-slate-500 uppercase">Toplam Vaka</span>
              </div>
           </div>

           <div className="space-y-3">
              {MOCK_RISK_DATA.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-400 uppercase">{item.name}</span>
                   </div>
                   <span className="text-white italic">%{item.value}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Global Recovery Intelligence */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 space-y-8 backdrop-blur-3xl">
           <div className="flex justify-between items-center">
              <div className="space-y-1">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                    <History size={16} className="text-cyan-400" /> İYİLEŞME_ANALİTİĞİ
                 </h4>
                 <p className="text-[10px] text-slate-600 font-medium italic">6 aylık kolektif performans trendi</p>
              </div>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400">KORELASYON_GÜÇLÜ</span>
              </div>
           </div>

           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={MOCK_RECOVERY_TREND}>
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '16px' }}
                    />
                    <Area type="monotone" dataKey="progress" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" name="İyileşme Oranı %" />
                    <Bar dataKey="completion" barSize={12} fill="#1e293b" radius={[4, 4, 0, 0]} name="Uyum Skoru %" />
                    <Line type="monotone" dataKey="pain" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} name="Ağrı Skoru (VAS)" />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* High Priority Monitor */}
        <div className="lg:col-span-7 space-y-6">
           <div className="flex justify-between items-center px-4">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2 italic">
                <AlertCircle size={16} className="text-rose-500" /> KRİTİK_TAKİP_MONİTÖRÜ
              </h4>
              <button className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:underline">TÜMÜNÜ GÖR</button>
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

        {/* AI Prescriptive Engine */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
           <div className="space-y-2 relative z-10">
             <h4 className="text-xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
               <Zap size={22} className="text-cyan-400" fill="currentColor" /> AI ÖNERİ <span className="text-cyan-400">MOTORU</span>
             </h4>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Anlık klinik karar destek sistemi</p>
           </div>

           <div className="space-y-6 relative z-10">
              <ActionCard 
                title="Protokol Revizyonu" 
                desc="Caner Özkan için 'Extension Bias' egzersizleri askıya alınmalı, %30 dozaj düşürülmeli." 
                action="REÇETEYİ GÜNCELLE"
                type="warning"
              />
              <ActionCard 
                title="Proaktif İletişim" 
                desc="Sibel Erden'in rehabilitasyon bariyerlerini anlamak için sesli klinik görüşme başlatın." 
                action="İLETİŞİME GEÇ"
                type="info"
              />
              <ActionCard 
                title="Validasyon Bekleniyor" 
                desc="Murat Ak'ın 14. seans sonrası ROM verileri klinisyen onayı bekliyor." 
                action="VERİLERİ ONAYLA"
                type="success"
              />
           </div>
        </div>
      </div>
    </div>
  );
};

const RiskCase = ({ name, diagnosis, reason, risk, trend }: any) => (
  <div className="bg-slate-900/30 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-rose-500/30 hover:bg-slate-900/50 transition-all duration-500">
    <div className="flex items-center gap-6">
       <div className={`w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5 text-rose-500 shadow-inner group-hover:scale-105 transition-transform duration-500`}>
          {trend === 'down' ? <TrendingDown size={28} className="animate-bounce" /> : <AlertCircle size={28} />}
       </div>
       <div>
          <h5 className="text-sm font-black text-white italic tracking-tight uppercase group-hover:text-rose-400 transition-colors">{name} <span className="text-[9px] text-slate-500 not-italic ml-2 bg-slate-950 px-2 py-0.5 rounded border border-white/5 uppercase tracking-widest">{diagnosis}</span></h5>
          <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">"{reason}"</p>
       </div>
    </div>
    <div className="text-right flex flex-col items-end gap-3">
       <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border shadow-lg ${risk === 'YÜKSEK' ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 shadow-rose-500/10' : 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-amber-500/10'}`}>
         {risk}_ÖNCELİK
       </span>
       <button className="w-10 h-10 bg-slate-800 hover:bg-cyan-500 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center group/btn shadow-xl">
          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
       </button>
    </div>
  </div>
);

const ActionCard = ({ title, desc, action, type }: any) => {
  const colors = {
    warning: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    info: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    success: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
  };

  return (
    <div className="p-6 bg-slate-950/60 rounded-[2rem] border border-white/5 space-y-5 group hover:border-white/10 transition-all shadow-inner">
       <div className={`flex items-center gap-3 ${colors[type as keyof typeof colors]}`}>
          <div className="p-2 bg-current opacity-10 rounded-lg"><Activity size={16} /></div>
          <h6 className="text-[10px] font-black uppercase tracking-[0.2em] italic">{title}</h6>
       </div>
       <p className="text-xs text-slate-400 leading-relaxed italic font-medium">"{desc}"</p>
       <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 hover:text-white transition-all shadow-xl active:scale-95">
          {action}
       </button>
    </div>
  );
};
