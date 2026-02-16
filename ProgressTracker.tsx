
import React, { useState } from 'react';
import { 
  TrendingUp, Activity, Brain, CheckCircle2, 
  Target, BarChart3, Download, Clock, Thermometer,
  ShieldAlert, Sparkles, Filter, History, AlertTriangle,
  Gauge, Layers
} from 'lucide-react';
import { PatientProfile, ProgressReport } from './types.ts';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

export const ProgressTracker = ({ profile }: { profile: PatientProfile | null }) => {
  const [activeAnalysis, setActiveAnalysis] = useState<'recovery' | 'pain' | 'compliance'>('recovery');

  const isDemo = !profile;
  const history = profile?.progressHistory || [];
  const lastReport = history.length > 0 ? history[history.length - 1] : null;
  const trajectory = profile?.physicalAssessment?.recoveryTrajectory || 72;

  // Chart data normalization
  const chartData = history.length > 0 
    ? history.map((h, i) => ({ day: `S${i+1}`, actual: 100 - (h.painScore * 10), predicted: trajectory }))
    : [
        { day: '0', actual: 10, predicted: 10 },
        { day: '7', actual: 25, predicted: 22 },
        { day: '14', actual: 38, predicted: 35 },
        { day: '21', actual: 42, predicted: 48 },
      ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-roboto pb-24">
      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl flex items-center justify-between px-10">
           <div className="flex items-center gap-4 text-amber-500">
              <AlertTriangle size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest italic">SİSTEM SİMÜLASYONU AKTİF - GERÇEK VERİ BEKLENİYOR</span>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon={Target} label="İyileşme Yörüngesi" value={`%${trajectory}`} sub="Hedefe Kalan: 12 Gün" color="text-cyan-400" trend="+4.2%" />
        <KPICard icon={Thermometer} label="VAS Ağrı İndeksi" value={lastReport ? `${lastReport.painScore}/10` : '4.2/10'} sub="Son Seans Verisi" color="text-rose-500" trend="-12%" trendInverse />
        <KPICard icon={CheckCircle2} label="Protokol Uyumu" value="%92" sub="Global Sıralama: %5" color="text-emerald-400" />
        <KPICard icon={Clock} label="Toplam Tedavi" value="4. Hafta" sub="Faz: Sub-Akut" color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
           <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-4">
                       <BarChart3 size={28} className="text-cyan-400" /> Genesis <span className="text-cyan-400">Analiz Motoru</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Klinik Veri ve AI Tahmin Modellemesi</p>
                 </div>
              </div>

              <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="day" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }} />
                       <Area type="monotone" dataKey="predicted" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="AI Tahmini" />
                       <Area type="monotone" dataKey="actual" stroke="#06B6D4" strokeWidth={4} fillOpacity={1} fill="url(#colorActual)" name="Gerçekleşen" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-4 text-cyan-400">
                 <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-inner">
                    <Brain size={24} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em]">Klinik Insights</h4>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Genesis v6.0</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                       <Sparkles size={12} /> Analiz Özeti
                    </p>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                       {profile?.latestInsight?.summary || "Henüz analiz verisi toplanmadı. İlk seans sonrası AI raporunuz burada görünecektir."}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, sub, color, trend, trendInverse }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-4 group hover:border-slate-700 transition-all shadow-xl">
     <div className={`w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 ${color} shadow-inner`}>
        <Icon size={24} />
     </div>
     <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-3">
           <span className="text-3xl font-black text-white italic tracking-tighter">{value}</span>
           {trend && <span className={`text-[10px] font-black italic ${trendInverse ? 'text-emerald-400' : 'text-rose-500'}`}>{trend}</span>}
        </div>
        <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{sub}</p>
     </div>
  </div>
);
