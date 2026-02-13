
import React from 'react';
import { 
  Activity, Zap, TrendingUp, Calendar, 
  ChevronRight, Play, 
  Thermometer, Heart, Flame, Shield, 
  MessageSquare, Clock, Trophy, CloudSync
} from 'lucide-react';
import { PatientProfile, Exercise } from './types.ts';
import { RPMBridge } from './RPMBridge.tsx';

const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-300 hover:border-slate-700/80 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

const ProgressBar = ({ value, color = "bg-cyan-500", height = "h-2" }: { value: number, color?: string, height?: string }) => (
  <div className={`w-full ${height} bg-slate-950 rounded-full overflow-hidden shadow-inner`}>
    <div 
      className={`h-full ${color} rounded-full transition-all duration-1000 ease-out relative`} 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    >
        <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/20 animate-pulse" />
    </div>
  </div>
);

const WelcomeHero: React.FC<{ profile: PatientProfile }> = ({ profile }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi Günler" : "İyi Akşamlar";

  return (
    <GlassCard className="col-span-12 lg:col-span-8 flex flex-col justify-between min-h-[220px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase">
              {greeting}, <span className="text-cyan-400">Şampiyon</span>
            </h1>
            <p className="text-xs md:text-sm font-medium text-slate-400 max-w-md leading-relaxed">
              Bugünkü seansın hazır. İyileşme hedefine sadece %12 kaldı. Disiplini koru, sağlığına kavuş.
            </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 px-4 py-2 rounded-2xl h-fit">
            <div className={`w-2 h-2 rounded-full ${profile.syncStatus === 'Synced' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">MOBİL SENKRON: {profile.syncStatus || 'YOK'}</span>
        </div>
      </div>

      <div className="relative z-10 mt-6 flex items-center gap-4">
        <div className="flex-1">
            <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">
                <span>Haftalık Hedef</span>
                <span className="text-white">4/5 Seans</span>
            </div>
            <ProgressBar value={80} color="bg-gradient-to-r from-cyan-500 to-blue-600" height="h-3" />
        </div>
      </div>
    </GlassCard>
  );
};

const VitalsPanel: React.FC<{ profile: PatientProfile }> = ({ profile }) => {
  return (
    <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
      <GlassCard className="col-span-1 flex flex-col justify-between aspect-square">
        <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500"><Thermometer size={20} /></div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded">VAS</span>
        </div>
        <div>
            <div className="text-3xl font-black text-white italic">4<span className="text-base text-slate-500 not-italic">/10</span></div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ağrı Seviyesi</p>
        </div>
        <ProgressBar value={40} color="bg-rose-500" height="h-1.5" />
      </GlassCard>

      <GlassCard className="col-span-1 flex flex-col justify-between aspect-square">
         <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Activity size={20} /></div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">ROM</span>
        </div>
        <div>
            <div className="text-3xl font-black text-white italic">%92</div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hareket Açıklığı</p>
        </div>
        <ProgressBar value={92} color="bg-emerald-500" height="h-1.5" />
      </GlassCard>
    </div>
  );
};

export const Dashboard: React.FC<{ profile: PatientProfile, onExerciseSelect: (ex: Exercise) => void }> = ({ profile, onExerciseSelect }) => {
  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <WelcomeHero profile={profile} />
      <VitalsPanel profile={profile} />

      {/* NEW: RPM BRIDGE COMPONENT */}
      <div className="col-span-12">
         <RPMBridge profile={profile} />
      </div>

      <div className="col-span-12 lg:col-span-8 space-y-4">
        <div className="flex justify-between items-end px-2">
            <div>
                <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Egzersiz <span className="text-cyan-400">Programı</span></h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Klinik Protokol: Faz 2</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
            {profile.suggestedPlan.map((ex, idx) => (
                <div 
                    key={ex.id || idx}
                    onClick={() => onExerciseSelect(ex)}
                    className="group bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-2xl flex items-center gap-5 cursor-pointer transition-all"
                >
                    <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-slate-600 font-black italic text-lg border border-slate-800 group-hover:text-cyan-400 transition-colors">
                        {idx + 1}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-white uppercase italic tracking-tight">{ex.titleTr || ex.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="px-2 py-0.5 bg-slate-950 rounded text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-800">
                                {ex.sets} SET x {ex.reps} TEKRAR
                            </span>
                            {ex.syncInfo?.isSynced && (
                               <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                  <CloudSync size={10} /> MOBİLDE HAZIR
                               </span>
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-full text-slate-500 group-hover:text-cyan-400 transition-all border border-slate-800">
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Hızlı Erişim</h3>
         <GlassCard className="flex items-center gap-4 hover:border-cyan-500/30 cursor-pointer">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400"><MessageSquare size={18} /></div>
            <div className="flex-1">
                <h4 className="text-xs font-bold text-white uppercase">Terapiste Danış</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">Mesaj gönder veya randevu al</p>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
        </GlassCard>
      </div>
    </div>
  );
};
