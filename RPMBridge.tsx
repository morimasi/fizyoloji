
import React, { useState, useEffect } from 'react';
import { 
  Smartphone, CloudSync, CheckCircle2, AlertTriangle, 
  Wifi, ShieldCheck, Zap, RefreshCw, SmartphoneNfc,
  ArrowRight, Activity, SmartphoneCharging, Signal
} from 'lucide-react';
import { PatientProfile, Exercise } from './types.ts';
import { PhysioDB } from './db-repository.ts';

export const RPMBridge: React.FC<{ profile: PatientProfile }> = ({ profile }) => {
  const [syncQueue, setSyncQueue] = useState<string[]>([]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const handleSyncExercise = async (exId: string) => {
    setSyncQueue(prev => [...prev, exId]);
    await PhysioDB.syncExerciseToMobile('p1', exId);
    setTimeout(() => {
      setSyncQueue(prev => prev.filter(id => id !== exId));
    }, 1500);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    for (const ex of profile.suggestedPlan) {
      await handleSyncExercise(ex.id);
    }
    setIsSyncingAll(false);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-3xl relative overflow-hidden font-roboto">
       <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
       
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-inner">
                <SmartphoneNfc size={28} />
             </div>
             <div>
                <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">RPM <span className="text-cyan-400">Bridge</span></h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Remote Patient Monitoring & Device Sync</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                <Signal size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Pixel 7 Pro • Bağlı</span>
             </div>
             <button 
                onClick={handleSyncAll}
                disabled={isSyncingAll}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-2 transition-all"
             >
                {isSyncingAll ? <RefreshCw size={14} className="animate-spin" /> : <CloudSync size={16} />}
                {isSyncingAll ? 'SENKRONİZE EDİLİYOR' : 'TÜMÜNÜ GÜNCELLE'}
             </button>
          </div>
       </div>

       {/* SYNC STATUS GRID */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {profile.suggestedPlan.map((ex) => {
            const isSyncing = syncQueue.includes(ex.id);
            const isSynced = ex.syncInfo?.isSynced;

            return (
              <div key={ex.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between group hover:border-cyan-500/30 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                       <h4 className="text-[11px] font-bold text-slate-200 uppercase italic tracking-tight truncate pr-4">{ex.titleTr || ex.title}</h4>
                       <p className="text-[9px] text-slate-600 font-mono mt-1">{ex.code}</p>
                    </div>
                    {isSynced ? (
                       <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                       <AlertTriangle size={16} className="text-amber-500" />
                    )}
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-800 relative">
                          {isSyncing && <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping" />}
                          {isSynced && <div className="absolute inset-0 bg-emerald-500 rounded-full" />}
                       </div>
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          {isSyncing ? 'VERİ AKTARILIYOR' : isSynced ? 'SENKRONİZE' : 'BEKLİYOR'}
                       </span>
                    </div>
                    <button 
                      onClick={() => handleSyncExercise(ex.id)}
                      className={`p-2 rounded-lg transition-all ${isSynced ? 'text-slate-700 hover:text-cyan-400' : 'text-cyan-400 bg-cyan-500/10'}`}
                    >
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                 </div>
              </div>
            );
          })}
       </div>

       {/* SYSTEM MONITORING FOOTER */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
          <SyncMetric icon={ShieldCheck} label="KVKK Uyum" value="Uçtan Uca Şifreli" color="text-emerald-500" />
          <SyncMetric icon={SmartphoneCharging} label="Batarya Durumu" value="%84" color="text-cyan-400" />
          <SyncMetric icon={Activity} label="Son Etkileşim" value="Bugün, 14:22" color="text-amber-400" />
       </div>
    </div>
  );
};

const SyncMetric = ({ icon: Icon, label, value, color }: any) => (
  <div className="flex items-center gap-3">
     <div className={`p-2 bg-slate-950 rounded-lg border border-slate-800 ${color}`}>
        <Icon size={14} />
     </div>
     <div>
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        <p className="text-[10px] font-bold text-white uppercase italic">{value}</p>
     </div>
  </div>
);
