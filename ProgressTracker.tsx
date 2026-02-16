
import React, { useState } from 'react';
import { 
  TrendingUp, Activity, Brain, CheckCircle2, 
  Target, BarChart3, Download, Clock, Thermometer,
  ShieldAlert, Sparkles, Filter, History, AlertTriangle,
  Gauge, Layers, Radio, Zap, Ruler
} from 'lucide-react';
import { PatientProfile, ProgressReport } from './types.ts';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export const ProgressTracker = ({ profile }: { profile: PatientProfile | null }) => {
  const [activeAnalysis, setActiveAnalysis] = useState<'recovery' | 'pain' | 'mobility'>('recovery');

  const isDemo = !profile;
  const history = profile?.progressHistory || [];
  const trajectory = profile?.physicalAssessment?.recoveryTrajectory || 72;

  // ROM (Range of Motion) Radar Data
  const romData = [
    { subject: 'Flexion', A: 85, B: 110, fullMark: 150 },
    { subject: 'Extension', A: 20, B: 30, fullMark: 150 },
    { subject: 'Rot. Right', A: 45, B: 60, fullMark: 150 },
    { subject: 'Rot. Left', A: 42, B: 60, fullMark: 150 },
    { subject: 'Lat. Flex', A: 30, B: 40, fullMark: 150 },
  ];

  const chartData = history.length > 0 
    ? history.map((h, i) => ({ day: `S${i+1}`, actual: 100 - (h.painScore * 10), predicted: trajectory }))
    : [
        { day: '0', actual: 10, predicted: trajectory },
        { day: 'S1', actual: 25, predicted: trajectory + 5 },
        { day: 'S2', actual: 38, predicted: trajectory + 10 },
        { day: 'S3', actual: 42, predicted: trajectory + 15 },
      ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-roboto pb-24">
      {isDemo && (
        <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-[2rem] flex items-center justify-between px-10">
           <div className="flex items-center gap-4 text-amber-500">
              <AlertTriangle size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">GENESIS SİMÜLASYON MODU: GERÇEK KLİNİK VERİ BEKLENİYOR</span>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon={Target} label="İyileşme Yörüngesi" value={`%${trajectory}`} sub="Tahmini Hedef: 12 Gün" color="text-cyan-400" trend="+4.2%" />
        <KPICard icon={Thermometer} label="VAS Ağrı İndeksi" value={history.length > 0 ? `${history[history.length-1].painScore}/10` : '4.2/10'} sub="Son Seans Verisi" color="text-rose-500" trend="-12%" trendInverse />
        <KPICard icon={Ruler} label="Eklem Mobilitesi" value="%84" sub="ROM Skoru (Total)" color="text-emerald-400" />
        <KPICard icon={Zap} label="Nöral Adaptasyon" value="%92" sub="Global Sıralama: %5" color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Trend Analizi */}
        <div className="xl:col-span-8 bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
           <div className="flex justify-between items-center mb-10 relative z-10">
              <div>
                 <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-4">
                    <TrendingUp size={28} className="text-cyan-400" /> Genesis <span className="text-cyan-400">Analiz Motoru</span>
                 </h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Vaka Gelişim ve AI Tahmin Modellemesi</p>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                 <button onClick={() => setActiveAnalysis('recovery')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeAnalysis === 'recovery' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-600'}`}>Gelişim</button>
                 <button onClick={() => setActiveAnalysis('mobility')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeAnalysis === 'mobility' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-600'}`}>Mobilite</button>
              </div>
           </div>

           <div className="h-[420px] w-full relative z-10">
              {activeAnalysis === 'recovery' ? (
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
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '24px', padding: '16px' }} />
                       <Area type="monotone" dataKey="predicted" stroke="#334155" strokeWidth={2} strokeDasharray="10 5" fill="transparent" name="AI Tahmini" />
                       <Area type="monotone" dataKey="actual" stroke="#06B6D4" strokeWidth={5} fillOpacity={1} fill="url(#colorActual)" name="Gerçekleşen" />
                    </AreaChart>
                 </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={romData}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Başlangıç" dataKey="A" stroke="#334155" fill="#334155" fillOpacity={0.3} />
                        <Radar name="Güncel" dataKey="B" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
              )}
           </div>
        </div>

        {/* Klinik Insights */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-10 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-5 text-cyan-400">
                 <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-inner group hover:scale-110 transition-transform">
                    <Brain size={28} className="animate-pulse" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] leading-none">Klinik Zeka</h4>
                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 italic tracking-widest">Genesis v7.0 DeepReasoning</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-slate-800 space-y-4 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                       <Sparkles size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 italic">
                       Analiz Özeti
                    </p>
                    <p className="text-[13px] text-slate-300 italic leading-relaxed font-medium">
                       {profile?.latestInsight?.summary || "İyileşme hızı klinik hedefin %12 üzerinde. Eklem hareket açıklığında (ROM) anlamlı artış saptandı. Bir sonraki faz için kas kuvveti testleri planlanabilir."}
                    </p>
                 </div>

                 <div className="p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-[2rem] space-y-3">
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2 italic">
                       <TrendingUp size={14} /> Önerilen Aksiyon
                    </p>
                    <p className="text-xs text-slate-400 italic leading-relaxed">
                       "Yüklenmeyi %15 artırarak Sub-Akut Faz 2'ye geçiş yapılması güvenli görünmektedir."
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
  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 group hover:border-slate-700 transition-all shadow-xl relative overflow-hidden">
     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
        <Icon size={64} />
     </div>
     <div className={`w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 ${color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={28} />
     </div>
     <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-3">
           <span className="text-4xl font-black text-white italic tracking-tighter">{value}</span>
           {trend && <span className={`text-[10px] font-black italic px-2 py-0.5 rounded-lg ${trendInverse ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>{trend}</span>}
        </div>
        <p className="text-[10px] font-bold text-slate-600 uppercase mt-2 italic">{sub}</p>
     </div>
  </div>
);
