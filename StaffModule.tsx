import React, { useState } from 'react';
import { 
  Users, Award, Activity, Briefcase, 
  Settings, Clock, ChevronRight, Zap,
  BarChart2, Shield, Mail, Phone,
  Calendar, CheckCircle2, XCircle, Search,
  Filter, UserPlus, Sliders
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { User } from './types.ts';

const generatePerformanceData = () => Array.from({ length: 12 }, (_, i) => ({
  month: i,
  score: 85 + Math.random() * 15,
  load: 60 + Math.random() * 40
}));

const MOCK_STAFF: User[] = [
  {
    id: 't1',
    fullName: 'Uzm. Fzt. Erdem Arslan',
    email: 'erdem@physiocore.ai',
    role: 'Therapist',
    createdAt: '2023-01-01',
    therapistProfile: {
      specialization: ['Ortopedik', 'Sporcu Sağlığı', 'Manuel Terapi'],
      bio: '12 yıllık klinik tecrübe. OMT sertifikalı.',
      yearsOfExperience: 12,
      successRate: 94.5,
      totalPatientsActive: 28,
      averageRecoveryTime: '4.2 Hafta',
      availabilityStatus: 'In-Session',
      shiftSchedule: '09:00 - 17:00',
      performanceMetrics: {
        monthlyRetention: 92,
        avgSessionDuration: 45,
        protocolAdherence: 98,
        patientSatisfaction: 4.9
      },
      aiAssistantSettings: {
        autoSuggestProtocols: true,
        notifyHighRisk: true,
        weeklyReports: true,
        sensitivityLevel: 'Balanced'
      }
    }
  },
  {
    id: 't2',
    fullName: 'Fzt. Selin Yılmaz',
    email: 'selin@physiocore.ai',
    role: 'Therapist',
    createdAt: '2023-06-15',
    therapistProfile: {
      specialization: ['Pediatrik', 'Nörolojik Rehab'],
      bio: 'Bobath terapisti. Pediatrik alanda 5 yıl deneyim.',
      yearsOfExperience: 5,
      successRate: 88.0,
      totalPatientsActive: 15,
      averageRecoveryTime: '6.1 Hafta',
      availabilityStatus: 'Online',
      shiftSchedule: '10:00 - 18:00',
      performanceMetrics: {
        monthlyRetention: 85,
        avgSessionDuration: 50,
        protocolAdherence: 95,
        patientSatisfaction: 4.7
      },
      aiAssistantSettings: {
        autoSuggestProtocols: true,
        notifyHighRisk: true,
        weeklyReports: false,
        sensitivityLevel: 'Conservative'
      }
    }
  },
  {
    id: 't3',
    fullName: 'Dr. Fzt. Mehmet Demir',
    email: 'mehmet@physiocore.ai',
    role: 'Admin',
    createdAt: '2022-11-01',
    therapistProfile: {
      specialization: ['Kardiyopulmoner', 'Geriatrik'],
      bio: 'Akademik danışman ve klinik direktör.',
      yearsOfExperience: 18,
      successRate: 97.2,
      totalPatientsActive: 10,
      averageRecoveryTime: '5.0 Hafta',
      availabilityStatus: 'Offline',
      shiftSchedule: '08:00 - 16:00',
      performanceMetrics: {
        monthlyRetention: 99,
        avgSessionDuration: 60,
        protocolAdherence: 100,
        patientSatisfaction: 5.0
      },
      aiAssistantSettings: {
        autoSuggestProtocols: false,
        notifyHighRisk: true,
        weeklyReports: true,
        sensitivityLevel: 'Aggressive'
      }
    }
  }
];

export const StaffModule = () => {
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | 'Therapist' | 'Admin'>('All');

  const filteredStaff = MOCK_STAFF.filter(s => {
    const matchesSearch = String(s.fullName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.therapistProfile?.specialization?.some(spec => String(spec).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'All' || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
            <Briefcase size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">KADRO <span className="text-indigo-400">YÖNETİMİ</span></h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">HR & Klinik Performans Modülü v2.0</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
             <FilterBtn active={filterRole === 'All'} label="Tümü" onClick={() => setFilterRole('All')} />
             <FilterBtn active={filterRole === 'Therapist'} label="Terapistler" onClick={() => setFilterRole('Therapist')} />
             <FilterBtn active={filterRole === 'Admin'} label="Yöneticiler" onClick={() => setFilterRole('Admin')} />
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all">
            <UserPlus size={16} /> Personel Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <KPICard icon={Users} label="Toplam Personel" value={String(MOCK_STAFF.length)} sub="Aktif Kadro" color="text-indigo-400" />
         <KPICard icon={Activity} label="Ort. Doluluk" value="%78" sub="Klinik Kapasitesi" color="text-emerald-400" />
         <KPICard icon={Award} label="Başarı Skoru" value="9.4" sub="Hasta Geri Bildirimi" color="text-amber-400" />
         <KPICard icon={Zap} label="AI Adaptasyonu" value="%92" sub="Protokol Kullanımı" color="text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`${selectedStaff ? 'lg:col-span-5' : 'lg:col-span-12'} transition-all duration-500 space-y-4`}>
           <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
              <Search size={18} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="İsim veya uzmanlık alanı ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full font-medium"
              />
           </div>
           
           <div className="grid grid-cols-1 gap-4">
             {filteredStaff.map(staff => (
               <StaffCard 
                 key={staff.id} 
                 user={staff} 
                 isSelected={selectedStaff?.id === staff.id} 
                 onClick={() => setSelectedStaff(staff)} 
               />
             ))}
           </div>
        </div>

        {selectedStaff && (
          <div className="lg:col-span-7 animate-in slide-in-from-right-8 duration-500">
             <StaffDetailPanel user={selectedStaff} onClose={() => setSelectedStaff(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

const StaffCard: React.FC<{ user: User, isSelected: boolean, onClick: () => void }> = ({ user, isSelected, onClick }) => {
  const profile = user.therapistProfile;
  const statusColors: Record<string, string> = {
    'Online': 'bg-emerald-500',
    'In-Session': 'bg-amber-500',
    'Offline': 'bg-slate-600',
    'Break': 'bg-rose-500'
  };

  return (
    <div 
      onClick={onClick}
      className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'bg-indigo-900/20 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'}`}
    >
      <div className="flex justify-between items-start">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-lg font-black text-slate-400 border border-slate-800 shadow-inner relative">
               {String(user.fullName).charAt(0)}
               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${statusColors[profile?.availabilityStatus || 'Offline']}`} />
            </div>
            <div>
               <h4 className={`font-bold text-base transition-colors ${isSelected ? 'text-indigo-400' : 'text-slate-200 group-hover:text-white'}`}>{String(user.fullName)}</h4>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{String(user.role)} • {String(profile?.shiftSchedule || 'N/A')}</p>
            </div>
         </div>
         <ChevronRight size={18} className={`transition-transform ${isSelected ? 'text-indigo-400 rotate-90' : 'text-slate-600'}`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
         {profile?.specialization?.slice(0, 3).map(s => (
           <span key={String(s)} className="px-2.5 py-1 bg-slate-950/50 border border-slate-800 rounded-lg text-[9px] font-semibold text-slate-400 uppercase tracking-tight">
             {String(s)}
           </span>
         ))}
      </div>
      
      <div className="mt-4 h-10 w-full opacity-30 group-hover:opacity-60 transition-opacity">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generatePerformanceData()}>
               <Area type="monotone" dataKey="score" stroke={isSelected ? '#818cf8' : '#94a3b8'} fill="none" strokeWidth={2} />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

const StaffDetailPanel = ({ user, onClose }: { user: User, onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'performance'>('overview');
  const profile = user.therapistProfile;

  if (!profile) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl h-full flex flex-col">
       <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
          <div>
            <h3 className="text-xl font-black italic tracking-tight text-white uppercase">{String(user.fullName)}</h3>
            <div className="flex items-center gap-2 mt-1">
               <Briefcase size={12} className="text-indigo-400" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{String(user.email)}</span>
            </div>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
             <PanelTab active={activeTab === 'overview'} icon={Users} onClick={() => setActiveTab('overview')} />
             <PanelTab active={activeTab === 'performance'} icon={BarChart2} onClick={() => setActiveTab('performance')} />
             <PanelTab active={activeTab === 'settings'} icon={Sliders} onClick={() => setActiveTab('settings')} />
          </div>
       </div>

       <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="space-y-4">
                  <SectionTitle icon={CheckCircle2} label="Klinik Profil" />
                  <p className="text-sm text-slate-400 italic font-medium leading-relaxed p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    "{String(profile.bio)}"
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     <InfoBox label="Deneyim" value={`${String(profile.yearsOfExperience)} Yıl`} />
                     <InfoBox label="Ort. İyileşme" value={String(profile.averageRecoveryTime || 'N/A')} />
                     <InfoBox label="Aktif Vaka" value={String(profile.totalPatientsActive)} />
                     <InfoBox label="Başarı Oranı" value={`%${String(profile.successRate)}`} highlight />
                  </div>
               </div>

               <div className="space-y-4">
                  <SectionTitle icon={Clock} label="Vardiya & Uygunluk" />
                  <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                     <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Calendar size={20} /></div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Çalışma Saatleri</p>
                        <p className="text-sm font-bold text-white mt-1">{String(profile.shiftSchedule)}</p>
                     </div>
                     <div className="ml-auto">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${profile.availabilityStatus === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                           {String(profile.availabilityStatus)}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <SectionTitle icon={Activity} label="KPI Metrikleri" />
              <div className="h-48 w-full bg-slate-950/50 rounded-2xl border border-slate-800 p-4 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generatePerformanceData()}>
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ fontSize: '12px' }} />
                       <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="none" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <MetricCard label="Hasta Tutma" value={`%${String(profile.performanceMetrics?.monthlyRetention || 0)}`} color="text-emerald-400" />
                 <MetricCard label="Protokol Uyumu" value={`%${String(profile.performanceMetrics?.protocolAdherence || 0)}`} color="text-indigo-400" />
                 <MetricCard label="Memnuniyet" value={`${String(profile.performanceMetrics?.patientSatisfaction || 0)}/5.0`} color="text-amber-400" />
                 <MetricCard label="Ort. Seans" value={`${String(profile.performanceMetrics?.avgSessionDuration || 0)}dk`} color="text-slate-200" />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
             <div className="space-y-8 animate-in fade-in duration-300">
                <SectionTitle icon={Settings} label="AI Asistan Konfigürasyonu" />
                <div className="bg-slate-950/50 rounded-[2rem] border border-slate-800 p-6 space-y-6">
                   <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">AI Hassasiyet Modu</span>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">{String(profile.aiAssistantSettings.sensitivityLevel)}</span>
                   </div>
                   <div className="space-y-4">
                      <ToggleSetting label="Otomatik Protokol Öner" active={!!profile.aiAssistantSettings.autoSuggestProtocols} />
                      <ToggleSetting label="Yüksek Risk Bildirimleri" active={!!profile.aiAssistantSettings.notifyHighRisk} />
                      <ToggleSetting label="Haftalık Raporlama" active={!!profile.aiAssistantSettings.weeklyReports} />
                   </div>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

const FilterBtn = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {String(label)}
  </button>
);

const KPICard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-[2rem] hover:border-slate-700 transition-all group">
    <div className="flex justify-between items-start mb-2">
       <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={18} />
       </div>
    </div>
    <div className="text-2xl font-black text-white italic tracking-tighter">{String(value)}</div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{String(label)}</p>
    <p className="text-[9px] font-medium text-slate-600 italic mt-2">{String(sub)}</p>
  </div>
);

const PanelTab = ({ active, icon: Icon, onClick }: any) => (
  <button onClick={onClick} className={`p-3 rounded-lg transition-all ${active ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
    <Icon size={18} />
  </button>
);

const SectionTitle = ({ icon: Icon, label }: any) => (
  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
     <Icon size={14} className="text-indigo-400" /> {String(label)}
  </h4>
);

const InfoBox = ({ label, value, highlight }: any) => (
  <div className={`p-4 rounded-xl border ${highlight ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-950 border-slate-800'}`}>
     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{String(label)}</p>
     <p className={`text-sm font-black italic ${highlight ? 'text-indigo-400' : 'text-white'}`}>{String(value)}</p>
  </div>
);

const MetricCard = ({ label, value, color }: any) => (
  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
     <p className={`text-xl font-black italic tracking-tighter ${color}`}>{String(value)}</p>
     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{String(label)}</p>
  </div>
);

const ToggleSetting = ({ label, active }: any) => (
  <div className="flex items-center justify-between">
     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{String(label)}</span>
     <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${active ? 'bg-indigo-500' : 'bg-slate-800'}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
     </div>
  </div>
);