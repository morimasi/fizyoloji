
import React, { useState, useEffect } from 'react';
import { 
  Activity, Zap, TrendingUp, Calendar, 
  ChevronRight, Target, AlertCircle, Play, 
  Thermometer, Heart, Flame, Shield, 
  MessageSquare, ArrowRight, Clock, Trophy
} from 'lucide-react';
import { PatientProfile, Exercise } from './types.ts';

// --- SHARED UI COMPONENTS (MICRO-WIDGETS) ---

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

// --- WIDGETS ---

const WelcomeHero: React.FC<{ profile: PatientProfile }> = ({ profile }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi Günler" : "İyi Akşamlar";
  const streak = 4; // Bu veri veritabanından gelmeli, şimdilik statik.

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
        <div className="hidden md:flex flex-col items-center bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
            <Flame className="text-orange-500 mb-1" size={24} fill="currentColor" />
            <span className="text-2xl font-black text-white italic">{streak}</span>
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">GÜNLÜK SERİ</span>
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
  const painLevel = 4; // Örnek veri
  
  return (
    <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
      <GlassCard className="col-span-1 flex flex-col justify-between aspect-square">
        <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500"><Thermometer size={20} /></div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded">VAS</span>
        </div>
        <div>
            <div className="text-3xl font-black text-white italic">{painLevel}<span className="text-base text-slate-500 not-italic">/10</span></div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ağrı Seviyesi</p>
        </div>
        <ProgressBar value={painLevel * 10} color="bg-rose-500" height="h-1.5" />
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

const AiInsightWidget: React.FC<{ profile: PatientProfile }> = ({ profile }) => (
  <GlassCard className="col-span-12 border-l-4 border-l-cyan-500 bg-gradient-to-r from-slate-900/80 to-slate-900/40">
    <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
            <Zap size={24} className="text-cyan-400" fill="currentColor" />
        </div>
        <div className="flex-1 text-center md:text-left">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-1 flex items-center justify-center md:justify-start gap-2">
                <Shield size={12} /> Genesis AI Klinik Analiz
            </h3>
            <p className="text-sm font-medium text-slate-200 italic leading-relaxed">
                "{profile.latestInsight?.recommendation || "Analiz tamamlandı: Eklem mobilitenizde %15 artış saptandı. Bugün yüklenme fazına geçiş yapıyoruz. Lütfen bel bölgesindeki propriyosepsiyona odaklanın."}"
            </p>
        </div>
        <button className="px-6 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all hover:border-slate-600 shrink-0">
            Detaylı Rapor
        </button>
    </div>
  </GlassCard>
);

const ProtocolList: React.FC<{ plan: Exercise[], onSelect: (ex: Exercise) => void }> = ({ plan, onSelect }) => {
  return (
    <div className="col-span-12 lg:col-span-8 space-y-4">
        <div className="flex justify-between items-end px-2">
            <div>
                <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Bugünkü <span className="text-cyan-400">Görevler</span></h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Klinik Protokol: Faz 2 (Sub-Akut)</p>
            </div>
            <div className="flex gap-2">
               <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-white border border-slate-700">{plan.length}</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
            {plan.map((ex, idx) => (
                <div 
                    key={ex.id || idx}
                    onClick={() => onSelect(ex)}
                    className="group bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80 p-4 rounded-2xl flex items-center gap-5 cursor-pointer transition-all duration-300 relative overflow-hidden"
                >
                    {/* Index Badge */}
                    <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-slate-600 font-black italic text-lg border border-slate-800 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors z-10">
                        {idx + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 z-10">
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-white uppercase italic tracking-tight">{ex.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="px-2 py-0.5 bg-slate-950 rounded text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-800 group-hover:border-slate-700">
                                {ex.sets} SET x {ex.reps} TEKRAR
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                <Clock size={10} /> {ex.restPeriod}sn Dinlenme
                            </span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="bg-slate-950 p-3 rounded-full text-slate-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all z-10 border border-slate-800">
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                    </div>

                    {/* Hover Effect BG */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
            ))}
        </div>
    </div>
  );
};

const QuickActions: React.FC = () => (
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

        <GlassCard className="flex items-center gap-4 hover:border-amber-500/30 cursor-pointer">
            <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500"><Trophy size={18} /></div>
            <div className="flex-1">
                <h4 className="text-xs font-bold text-white uppercase">Başarılarım</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">3 yeni rozet kazandın</p>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
        </GlassCard>

        <div className="mt-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-[2rem] text-center space-y-4">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                <Calendar size={24} className="text-slate-400" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sonraki Kontrol</p>
                <p className="text-lg font-black text-white italic">14 Şubat, 15:30</p>
            </div>
            <button className="w-full py-3 bg-slate-800 rounded-xl text-[9px] font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors">Takvime Ekle</button>
        </div>
    </div>
);

// --- MAIN LAYOUT ---

interface DashboardProps {
  profile: PatientProfile;
  onExerciseSelect: (ex: Exercise) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, onExerciseSelect }) => {
  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* 1. Hero & Stats Section */}
      <WelcomeHero profile={profile} />
      <VitalsPanel profile={profile} />

      {/* 2. Intelligence Section */}
      <AiInsightWidget profile={profile} />

      {/* 3. Main Content: Protocol & Side Actions */}
      <ProtocolList plan={profile.suggestedPlan} onSelect={onExerciseSelect} />
      <QuickActions />
    </div>
  );
};
