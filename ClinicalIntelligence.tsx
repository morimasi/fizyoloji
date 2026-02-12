
import React from 'react';
import { 
  BrainCircuit, ShieldAlert, Zap, 
  TrendingDown, TrendingUp, AlertCircle,
  Activity, ArrowRight, UserCheck, MessageSquare
} from 'lucide-react';

export const ClinicalIntelligence = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
          <BrainCircuit size={28} />
        </div>
        <div>
           <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Klinik <span className="text-cyan-400">Zeka</span></h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Genesis AI Karar Destek Sistemi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk Monitor */}
        <div className="lg:col-span-7 space-y-6">
           <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
             <ShieldAlert size={14} className="text-rose-500" /> Yüksek Öncelikli Vakalar
           </h4>
           
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

        {/* AI Action Suggestions */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 space-y-8">
           <div className="space-y-2">
             <h4 className="text-lg font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
               <Zap size={20} className="text-cyan-400" fill="currentColor" /> AI Aksiyon <span className="text-cyan-400">Önerileri</span>
             </h4>
             <p className="text-[10px] text-slate-500 font-medium italic">Sistem tarafından önerilen kritik müdahaleler.</p>
           </div>

           <div className="space-y-6">
              <ActionCard 
                title="Protokol Güncellemesi Gerekli" 
                desc="Caner Özkan için ağrı fazına uygun yüklenmeyi %50 azaltan bir plan oluşturulmalı." 
                action="PROTOKOLÜ REVİZE ET"
              />
              <ActionCard 
                title="Motivasyonel Müdahale" 
                desc="Sibel Erden için katılımı artırmak adına teşvik edici bir mesaj gönderilmeli." 
                action="MESAJ GÖNDER"
              />
              <ActionCard 
                title="Yeni Seans Planla" 
                desc="Murat Ak için durum değerlendirmesi adına bir kontrol seansı atanmalı." 
                action="SEANS EKLE"
              />
           </div>
        </div>
      </div>
    </div>
  );
};

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
       <span className={`text-[9px] font-black px-3 py-1 rounded-lg border ${risk === 'YÜKSEK' ? 'bg-rose-500 text-white' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
         {risk} RİSK
       </span>
       <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><ArrowRight size={14} /></button>
    </div>
  </div>
);

const ActionCard = ({ title, desc, action }: any) => (
  <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
     <div className="flex items-center gap-2 text-cyan-400">
        <Activity size={16} />
        <h6 className="text-[10px] font-black uppercase tracking-widest">{title}</h6>
     </div>
     <p className="text-xs text-slate-400 leading-relaxed italic">"{desc}"</p>
     <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-cyan-400 transition-all">
        {action}
     </button>
  </div>
);
