
import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Filter, 
  UserCheck, Shield, MessageSquare, 
  Activity, Calendar, TrendingUp, 
  ChevronRight, MoreVertical, Star,
  AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { PatientUser, PatientStatus, UserRole } from './types.ts';
import { MessagingSystem } from './MessagingSystem.tsx';

export const UserManager = () => {
  const [activeRole, setActiveRole] = useState<UserRole | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientUser | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  // Mock Data: Gerçek uygulamada DB'den gelir
  const [users] = useState<PatientUser[]>([
    {
      id: 'p1',
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet@email.com',
      role: 'Patient',
      status: 'Stabil',
      createdAt: '2024-01-15',
      lastVisit: '2024-02-10',
      recoveryProgress: 65,
      assignedTherapistId: 't1',
      clinicalProfile: {
        diagnosis: 'L4-L5 Bel Fıtığı, Radikülopati',
        riskLevel: 'Orta',
        notes: [
          { id: 'n1', authorId: 't1', text: 'Fleksiyon egzersizlerinde dikkatli olunmalı.', date: '2024-02-01', type: 'Warning' }
        ]
      }
    },
    {
      id: 'p2',
      fullName: 'Ayşe Demir',
      email: 'ayse@email.com',
      role: 'Patient',
      status: 'Kritik',
      createdAt: '2024-02-01',
      lastVisit: '2024-02-11',
      recoveryProgress: 12,
      assignedTherapistId: 't1',
      clinicalProfile: {
        diagnosis: 'Akut Menisküs Yırtığı (Post-Op)',
        riskLevel: 'Yüksek',
        notes: []
      }
    },
    {
      id: 'p3',
      fullName: 'Mehmet Öz',
      email: 'mehmet@email.com',
      role: 'Patient',
      status: 'İyileşiyor',
      createdAt: '2023-11-20',
      lastVisit: '2024-02-08',
      recoveryProgress: 88,
      assignedTherapistId: 't2',
      clinicalProfile: {
        diagnosis: 'Donuk Omuz (Faz 3)',
        riskLevel: 'Düşük',
        notes: []
      }
    }
  ]);

  const filteredUsers = users.filter(u => {
    const matchesRole = activeRole === 'All' || u.role === activeRole;
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Modül Başlığı */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-cyan-500 shadow-2xl">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tighter text-white italic">OPERASYON <span className="text-cyan-400 uppercase">Merkezi</span></h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Klinik Kadro ve Hasta Yönetimi</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all">
            <UserPlus size={16} /> YENİ KAYIT
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-600 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-cyan-500/20 transition-all active:scale-95">
            <Shield size={16} /> ERİŞİM YÖNETİMİ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Panel: Liste ve Filtreler */}
        <div className={`lg:col-span-${selectedPatient ? '4' : '12'} space-y-6 transition-all duration-500`}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-950/40 p-4 rounded-3xl border border-slate-800">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={16} />
              <input 
                type="text" 
                placeholder="İsim veya protokol ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium outline-none focus:border-cyan-500/50 transition-all text-white"
              />
            </div>
            <div className="flex bg-slate-900 rounded-xl p-1 gap-1 border border-slate-800">
              {['All', 'Patient', 'Therapist'].map((role) => (
                <button 
                  key={role}
                  onClick={() => setActiveRole(role as any)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeRole === role ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white'}`}
                >
                  {role === 'All' ? 'HEPSİ' : role === 'Patient' ? 'HASTALAR' : 'EKİP'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map(user => (
              <UserSummaryCard 
                key={user.id} 
                user={user} 
                active={selectedPatient?.id === user.id}
                onClick={() => setSelectedPatient(user)}
              />
            ))}
          </div>
        </div>

        {/* Sağ Panel: Detay Görünümü */}
        {selectedPatient && (
          <div className="lg:col-span-8 space-y-6 animate-in slide-in-from-right-8 duration-500">
             <div className="glass-panel rounded-[3rem] border border-slate-800 overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border-b border-slate-800 flex items-center px-12 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                   <div className="flex items-center gap-8 relative z-10 w-full">
                      <div className="w-20 h-20 bg-slate-900 rounded-[2rem] border-4 border-slate-950 flex items-center justify-center text-cyan-400 text-2xl font-black italic shadow-2xl">
                         {selectedPatient.fullName.charAt(0)}
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-semibold text-white italic tracking-tight uppercase">{selectedPatient.fullName}</h3>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                              selectedPatient.status === 'Kritik' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                              selectedPatient.status === 'Stabil' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                              'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}>{selectedPatient.status}</span>
                         </div>
                         <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-widest"><Clock size={10}/> Son Görülme: {selectedPatient.lastVisit}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedPatient.email}</span>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           onClick={() => setShowMessaging(true)}
                           className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 text-cyan-400 transition-all hover:scale-110 active:scale-95 shadow-xl"
                         >
                           <MessageSquare size={20} />
                         </button>
                         <button className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 text-slate-400 transition-all hover:scale-110 active:scale-95 shadow-xl">
                           <Star size={20} />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Klinik Tanı Bölümü */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                         <Activity size={18} className="text-cyan-400" />
                         <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Klinik Profil Analizi</h4>
                      </div>
                      <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 space-y-4">
                         <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Mevcut Tanı</p>
                            <p className="text-sm font-medium text-slate-300 italic">"{selectedPatient.clinicalProfile.diagnosis}"</p>
                         </div>
                         <div className="flex items-center gap-4 py-4 border-y border-slate-800/50">
                            <div className="flex-1">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">İyileşme Skoru</p>
                               <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                                     <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000" style={{ width: `${selectedPatient.recoveryProgress}%` }} />
                                  </div>
                                  <span className="text-xs font-black text-white italic">%{selectedPatient.recoveryProgress}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Faktörü</span>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${
                               selectedPatient.clinicalProfile.riskLevel === 'Yüksek' ? 'text-rose-500 bg-rose-500/10' : 'text-emerald-500 bg-emerald-500/10'
                            }`}>{selectedPatient.clinicalProfile.riskLevel}</span>
                         </div>
                      </div>
                   </div>

                   {/* Terapist Notları */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                         <TrendingUp size={18} className="text-emerald-400" />
                         <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Klinik Projeksiyon</h4>
                      </div>
                      <div className="space-y-4">
                         {selectedPatient.clinicalProfile.notes.length > 0 ? (
                           selectedPatient.clinicalProfile.notes.map(note => (
                             <div key={note.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 border-l-4 border-l-rose-500">
                                <div className="flex justify-between items-center mb-2">
                                   <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{note.type}</span>
                                   <span className="text-[8px] font-mono text-slate-500">{note.date}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium italic">"{note.text}"</p>
                             </div>
                           ))
                         ) : (
                           <div className="py-12 text-center bg-slate-950/20 border-2 border-dashed border-slate-800 rounded-3xl">
                              <AlertCircle size={32} className="mx-auto text-slate-800 mb-2" />
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ek Not Bulunamadı</p>
                           </div>
                         )}
                         <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                            YENİ KLİNİK NOT EKLE
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {showMessaging && selectedPatient && (
        <MessagingSystem 
          patient={selectedPatient} 
          onClose={() => setShowMessaging(false)} 
        />
      )}
    </div>
  );
};

const UserSummaryCard = ({ user, active, onClick }: { user: PatientUser, active: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`p-5 rounded-3xl border transition-all cursor-pointer group flex items-center justify-between ${
      active ? 'bg-cyan-500/10 border-cyan-500/50 shadow-xl' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
    }`}
  >
    <div className="flex items-center gap-4">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic border transition-all ${
         active ? 'bg-cyan-500 text-white border-white/20' : 'bg-slate-950 text-slate-500 border-slate-800 group-hover:text-cyan-400 group-hover:border-cyan-500/30'
       }`}>
          {user.fullName.charAt(0)}
       </div>
       <div>
          <h4 className={`text-sm font-semibold tracking-tight transition-colors ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
            {user.fullName}
          </h4>
          <div className="flex items-center gap-3 mt-1">
             <span className={`text-[8px] font-black uppercase tracking-widest ${
               user.status === 'Kritik' ? 'text-rose-500' : 'text-cyan-400'
             }`}>{user.status}</span>
             <span className="w-1 h-1 bg-slate-800 rounded-full" />
             <span className="text-[8px] font-bold text-slate-500 uppercase">%{user.recoveryProgress} İlerleme</span>
          </div>
       </div>
    </div>
    <ChevronRight size={16} className={`transition-all ${active ? 'text-cyan-400 translate-x-1' : 'text-slate-700 group-hover:text-slate-500'}`} />
  </div>
);
