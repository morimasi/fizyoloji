
import React, { useState } from 'react';
import { Shield, Stethoscope, User, Crown, AlertCircle } from 'lucide-react';
import { UserRole } from './types.ts';
import { AdminManagement } from './AdminManagement.tsx';
import { TherapistManagement } from './TherapistManagement.tsx';
import { PatientManagement } from './PatientManagement.tsx';

/**
 * PHYSIOCORE COMMAND CENTER v6.5
 * Ultra-Professional Role-Based Orchestrator
 */
export const ManagementHub = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('Admin');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-roboto pb-24">
      
      {/* 1. COMMANDER HUD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-[3.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-cyan-500/10 rounded-[1.5rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
                  <Shield size={32} />
               </div>
               <div>
                  <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">COMMAND <span className="text-cyan-400">Center</span></h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 italic">Genesis v6.5 Security & Admin Protocol</p>
               </div>
            </div>

            <div className="flex bg-slate-950 p-1.5 rounded-[1.5rem] border border-slate-800 shadow-2xl">
               <RoleTab active={activeRole === 'Admin'} onClick={() => setActiveRole('Admin')} icon={Crown} label="Root Admin" color="text-cyan-400" />
               <RoleTab active={activeRole === 'Therapist'} onClick={() => setActiveRole('Therapist')} icon={Stethoscope} label="Klinik Uzman" color="text-emerald-400" />
               <RoleTab active={activeRole === 'Patient'} onClick={() => setActiveRole('Patient')} icon={User} label="Bireysel" color="text-blue-400" />
            </div>
         </div>
      </div>

      {activeRole === 'Admin' && (
        <div className="px-10 py-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4 mx-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertCircle className="text-amber-500" size={18} />
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">
            YÖNETİCİ YETKİSİ AKTİF: Terapist ve Hasta görevlerini manipüle edebilir, sistem algoritmalarını doğrudan değiştirebilirsiniz.
          </p>
        </div>
      )}

      {/* 2. DYNAMIC MODULES */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-[600px]">
         {activeRole === 'Admin' && (
           <>
             <AdminManagement />
             <div className="col-span-full mt-10 border-t border-slate-800 pt-10">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 px-4 flex items-center gap-3">
                   <Stethoscope size={18} /> Supervisor Dashboard: Terapist Görev Manipülasyonu
                </h4>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <TherapistManagement isAdminOverride={true} />
                </div>
             </div>
           </>
         )}
         {activeRole === 'Therapist' && <TherapistManagement />}
         {activeRole === 'Patient' && <PatientManagement />}
      </div>
    </div>
  );
};

const RoleTab = ({ active, onClick, icon: Icon, label, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-slate-900 text-white shadow-2xl scale-[1.02] border border-slate-700' : 'text-slate-600 hover:text-slate-400'
    }`}
  >
    <Icon size={16} className={active ? color : ''} /> {label}
  </button>
);
