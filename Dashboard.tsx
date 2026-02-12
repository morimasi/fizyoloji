
import React from 'react';
import { 
  Activity, Stethoscope, Zap, TrendingUp, 
  Calendar, ChevronRight, ShieldCheck, 
  Target, AlertCircle, Play, BarChart3,
  Thermometer, Heart
} from 'lucide-react';
import { PatientProfile, Exercise } from './types.ts';

// @fix: Convert sub-components to React.FC to handle React-specific props like 'key'
const PatientIdentity: React.FC<{ profile: PatientProfile }> = ({ profile }) => (
  <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
    <div className="flex items-start gap-4 relative z-10">
      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-cyan-500 shadow-inner">
        <Target size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Klinik Tanı</h3>
        <p className="text-sm font-medium text-slate-200 leading-relaxed line-clamp-3 italic">
          "{profile.diagnosisSummary}"
        </p>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between">
      <div className="text-[9px] font-medium text-slate-500 uppercase">Risk Grubu: <span className={profile.riskLevel === 'Yüksek' ? 'text-rose-500' : 'text-emerald-500'}>{profile.riskLevel}</span></div>
      <div className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">Genesis Engine v3.2</div>
    </div>
  </div>
);

// @fix: Convert sub-components to React.FC
const ClinicalInsights: React.FC<{ profile: PatientProfile }> = ({ profile }) => (
  <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/40">
    <div className="flex items-center gap-2 mb-4">
      {/* Fix: Removed space between < and Zap to correct JSX syntax */}
      <Zap size={14} className="text-cyan-400" />
      <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">AI Pulse Analizi</h3>
    </div>
    <div className="p-4 bg-slate-900/50 rounded-2xl border-l-2 border-cyan-500/50">
      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
        {profile.latestInsight?.recommendation || "Analiz ediliyor: İyileşme periyodu stabil, yüklenme fazına geçiş için uygun biyomekanik altyapı mevcut."}
      </p>
    </div>
  </div>
);

// @fix: Convert sub-components to React.FC
const BiometricStats: React.FC<{ profile: PatientProfile }> = ({ profile }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <TrendingUp size={14} className="text-emerald-400" />
        <span className="text-[8px] font-bold text-slate-600 uppercase">Uyum</span>
      </div>
      <div className="text-xl font-semibold text-white tracking-tight">%92</div>
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
      </div>
    </div>
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Thermometer size={14} className="text-rose-400" />
        <span className="text-[8px] font-bold text-slate-600 uppercase">Ağrı</span>
      </div>
      <div className="text-xl font-semibold text-white tracking-tight">4/10</div>
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-rose-500" style={{ width: '40%' }} />
      </div>
    </div>
  </div>
);

// @fix: Convert TreatmentRow to React.FC to properly support 'key' prop in loops
const TreatmentRow: React.FC<{ exercise: Exercise; onClick: () => void; index: number }> = ({ exercise, onClick, index }) => (
  <div 
    onClick={onClick}
    className="group bg-slate-900/30 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900 rounded-[2rem] p-5 flex items-center gap-5 cursor-pointer transition-all duration-300"
  >
    <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-slate-700 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-inner border border-slate-800 relative shrink-0">
      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-800 rounded-full text-[9px] font-bold flex items-center justify-center border border-slate-700 text-slate-400">{index}</span>
      <Play size={18} fill="currentColor" className="ml-1" />
    </div>
    
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-sm text-slate-200 group-hover:text-cyan-400 transition-colors uppercase italic truncate">
        {exercise.title}
      </h4>
      <div className="flex items-center gap-3 mt-1 text-[9px] font-medium text-slate-500 uppercase tracking-widest">
        <span>{exercise.sets} SET x {exercise.reps} TEKRAR</span>
        <span className="w-1 h-1 bg-slate-800 rounded-full" />
        <span className="text-slate-700">{exercise.category}</span>
      </div>
    </div>

    <div className="hidden md:flex flex-col items-end gap-1 px-4 border-l border-slate-800">
      <span className="text-[8px] font-bold text-slate-600 uppercase">Dozaj Hedefi</span>
      <div className="flex gap-1">
        {[1, 2, 3].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= (exercise.difficulty/3.3) ? 'bg-cyan-500' : 'bg-slate-800'}`} />)}
      </div>
    </div>

    <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
  </div>
);

interface DashboardProps {
  profile: PatientProfile;
  onExerciseSelect: (ex: Exercise) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onExerciseSelect }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
      {/* SOL KOLON: Klinik Metrikler ve Özet */}
      <div className="lg:col-span-4 space-y-6">
        <PatientIdentity profile={profile} />
        <ClinicalInsights profile={profile} />
        <BiometricStats profile={profile} />
      </div>

      {/* SAĞ KOLON: Reçete ve Akış */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white italic">AKTİF <span className="text-cyan-400 uppercase">Protokol</span></h2>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Rehabilitasyon Fazı: {profile.latestInsight?.phaseName || 'Faz 1 (Akut)'}</p>
          </div>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-slate-800 rounded-full text-[9px] font-bold text-slate-400 border border-slate-700">GÜN: 12/21</span>
             <span className="px-3 py-1 bg-cyan-500/10 rounded-full text-[9px] font-bold text-cyan-400 border border-cyan-500/20">TOTAL: {profile.suggestedPlan.length} EGZERSİZ</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {profile.suggestedPlan.map((ex, idx) => (
            <TreatmentRow 
              key={ex.id || idx} 
              exercise={ex} 
              onClick={() => onExerciseSelect(ex)} 
              index={idx + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
