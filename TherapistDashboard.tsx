
import React from 'react';
import { 
  TrendingUp, Users, Clock, Star, 
  Activity, ArrowUpRight, Calendar, 
  CheckCircle2, AlertTriangle, Briefcase
} from 'lucide-react';
import { User } from './types.ts';

export const TherapistDashboard = ({ therapist }: { therapist: User }) => {
  const stats = therapist.therapistProfile;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Aktif Takip" 
          value={stats?.totalPatientsActive.toString() || '0'} 
          sub="+3 Bu Hafta" 
          color="text-cyan-400" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Başarı Oranı" 
          value={`%${stats?.successRate}`} 
          sub="Klinik Hedef %90" 
          color="text-emerald-400" 
        />
        <StatCard 
          icon={Clock} 
          label="Ort. İyileşme" 
          value={stats?.averageRecoveryTime || 'N/A'} 
          sub="Hızlanma Trendi" 
          color="text-amber-400" 
        />
        <StatCard 
          icon={Star} 
          label="Deneyim" 
          value={`${stats?.yearsOfExperience} Yıl`} 
          sub="Kıdemli Terapist" 
          color="text-purple-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Workload Distribution */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="flex justify-between items-center relative z-10">
            <div>
               <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Klinik <span className="text-cyan-400">İş Yükü</span></h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Vaka Dağılımı ve Önceliklendirme</p>
            </div>
            <button className="text-[9px] font-black text-cyan-400 flex items-center gap-1 uppercase tracking-widest hover:underline">
               DETAYLI RAPOR <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
             <LoadIndicator label="Bel & Omurga" percent={65} color="bg-cyan-500" />
             <LoadIndicator label="Alt Ekstremite" percent={20} color="bg-emerald-500" />
             <LoadIndicator label="Post-Op Takip" percent={15} color="bg-amber-500" />
          </div>

          <div className="pt-8 border-t border-slate-800/50 space-y-4 relative z-10">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kritik Uyarılar</h4>
             <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                <AlertTriangle className="text-rose-500" size={20} />
                <p className="text-xs text-rose-200 font-medium italic">"3 hastanızda son 48 saatte ağrı skorunda beklenmedik artış saptandı. Lütfen Klinik Zeka sekmesini kontrol edin."</p>
             </div>
          </div>
        </div>

        {/* Quick Actions / Schedule */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
           <h3 className="text-sm font-black italic tracking-widest text-slate-400 uppercase flex items-center gap-2">
             <Calendar size={16} /> Bugünü Yönet
           </h3>
           <div className="space-y-4">
              <ScheduleItem time="09:00" patient="Ahmet Yılmaz" type="Kontrol" status="Onaylandı" />
              <ScheduleItem time="10:30" patient="Selin Kara" type="Yeni Vaka" status="Beklemede" />
              <ScheduleItem time="14:00" patient="Mehmet Demir" type="Taburcu" status="Onaylandı" />
           </div>
           <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700">
             TÜM TAKVİMİ GÖR
           </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-4 group hover:border-slate-700 transition-all shadow-xl">
    <div className={`w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 ${color} shadow-inner group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-3xl font-black text-white italic tracking-tighter">{value}</div>
      <p className="text-[9px] font-bold text-slate-600 uppercase mt-2 tracking-widest">{sub}</p>
    </div>
  </div>
);

const LoadIndicator = ({ label, percent, color }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{label}</span>
      <span className="text-[10px] font-mono font-bold text-slate-500">%{percent}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const ScheduleItem = ({ time, patient, type, status }: any) => (
  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-cyan-500/30 transition-all">
    <div className="flex items-center gap-4">
      <div className="text-[10px] font-mono font-bold text-cyan-500">{time}</div>
      <div>
        <div className="text-xs font-bold text-white italic">{patient}</div>
        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{type}</div>
      </div>
    </div>
    <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${status === 'Onaylandı' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
      {status}
    </div>
  </div>
);
