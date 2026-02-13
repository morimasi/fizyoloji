import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BrainCircuit, Settings, 
  Search, Bell, LogOut, ChevronRight, Activity,
  ShieldCheck, Terminal, Filter, Zap
} from 'lucide-react';
import { TherapistDashboard } from './TherapistDashboard.tsx';
import { ClinicalIntelligence } from './ClinicalIntelligence.tsx';
import { TherapistSettings } from './TherapistSettings.tsx';
import { UserManager } from './UserManager.tsx';
import { TherapistTab, User } from './types.ts';

export const TherapistHub = () => {
  const [activeTab, setActiveTab] = useState<TherapistTab>('dashboard');
  
  const currentTherapist: User = {
    id: 't1',
    fullName: 'Uzm. Fzt. Erdem Arslan',
    email: 'erdem@physiocore.ai',
    role: 'Therapist',
    createdAt: '2023-01-01',
    therapistProfile: {
      specialization: ['Ortopedik Rehabilitasyon', 'Sporcu Sağlığı'],
      bio: '12 yıllık klinik tecrübe, Manuel Terapi uzmanı.',
      yearsOfExperience: 12,
      successRate: 94.5,
      totalPatientsActive: 28,
      averageRecoveryTime: '4.2 Hafta',
      status: 'Aktif',
      aiAssistantSettings: {
        autoSuggestProtocols: true,
        notifyHighRisk: true,
        weeklyReports: true
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center border border-slate-800 text-cyan-500 shadow-2xl relative">
            <Zap size={32} fill="currentColor" className="animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase leading-none">TERAPİST <span className="text-cyan-400">Hub</span></h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded border border-slate-800">
                LİSANS: PC-99412
              </span>
              <span className="w-1 h-1 bg-slate-800 rounded-full" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sistem Senkronize</span>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-900/50 p-1.5 rounded-[1.5rem] border border-slate-800 backdrop-blur-xl">
           <TabNav active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="PANEL" />
           <TabNav active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} icon={Users} label="HASTALAR" />
           <TabNav active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} icon={BrainCircuit} label="KLİNİK ZEKA" />
           <TabNav active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="AYARLAR" />
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="relative min-h-[600px]">
        {activeTab === 'dashboard' && <TherapistDashboard therapist={currentTherapist} />}
        {activeTab === 'patients' && <UserManager />}
        {activeTab === 'intelligence' && <ClinicalIntelligence />}
        {activeTab === 'settings' && <TherapistSettings therapist={currentTherapist} />}
      </div>
    </div>
  );
};

const TabNav = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${active ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
  >
    <Icon size={14} /> {label}
  </button>
);