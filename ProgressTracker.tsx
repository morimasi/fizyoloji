
import React from 'react';
import { TrendingUp, Activity, Brain, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { PatientProfile } from './types.ts';

export const ProgressTracker = ({ profile }: { profile: PatientProfile }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard 
          icon={TrendingUp} 
          title="İyileşme Trendi" 
          value="%24 Artış" 
          desc="Son 7 günde mobilite artışı gözlemlendi." 
          color="text-cyan-400"
        />
        <InsightCard 
          icon={Activity} 
          title="Ortalama Ağrı" 
          value={`${profile.progressHistory[profile.progressHistory.length - 1]?.painScore || 0}/10`} 
          desc="VAS (Visual Analog Scale) bazlı." 
          color="text-pink-500"
        />
        <InsightCard 
          icon={CheckCircle2} 
          title="Uyum Skoru" 
          value="%88" 
          desc="Programı tamamlama oranı." 
          color="text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                <Brain size={20} />
             </div>
             <h3 className="font-black italic tracking-tighter uppercase text-lg">AI Klinik <span className="text-cyan-400">Muhakeme</span></h3>
          </div>
          
          {profile.latestInsight ? (
            <div className="space-y-6">
               <div className="space-y-2">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Analiz Özeti</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{profile.latestInsight.summary}</p>
               </div>
               <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 border-l-4 border-l-cyan-500">
                  <p className="text-[10px] font-mono text-cyan-500 uppercase mb-1">Adaptasyon Notu</p>
                  <p className="text-xs italic text-slate-400">{profile.latestInsight.adaptationNote}</p>
               </div>
               <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                  <div className="flex-1">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Sıradaki Adım</p>
                    <p className="text-sm font-bold text-white">{profile.latestInsight.nextStep}</p>
                  </div>
                  <AlertCircle size={20} className="text-cyan-500 animate-pulse" />
               </div>
            </div>
          ) : (
            <div className="py-20 text-center opacity-30 italic text-sm">Yeterli veri toplandığında AI analizi burada belirecektir.</div>
          )}
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest flex items-center gap-2">
                 <Calendar size={16} /> Aktivite Logları
              </h3>
           </div>
           <div className="space-y-4">
              {profile.progressHistory.slice().reverse().map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 group hover:border-slate-600 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500">
                        {new Date(log.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                      </div>
                      <div>
                        <p className="text-xs font-bold">Günlük Egzersiz Tamamlandı</p>
                        <p className="text-[10px] text-slate-500 italic">"{log.feedback}"</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`text-xs font-black ${log.painScore > 6 ? 'text-pink-500' : 'text-cyan-400'}`}>VAS: {log.painScore}</p>
                      <p className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">Uyum: %{log.completionRate}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

function InsightCard({ icon: Icon, title, value, desc, color }: any) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-cyan-500/20 transition-all">
       <div className={`w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={24} />
       </div>
       <div>
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{title}</h4>
          <p className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</p>
          <p className="text-[10px] text-slate-500 mt-2">{desc}</p>
       </div>
    </div>
  );
}
