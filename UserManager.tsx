
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, 
  UserCheck, Shield, MessageSquare, 
  Activity, Calendar, TrendingUp, 
  ChevronRight, MoreVertical, Star,
  AlertCircle, CheckCircle2, Clock,
  History, Thermometer, MapPin, 
  PlusCircle, BookOpen, X, Save,
  Briefcase, GraduationCap, Phone, Mail,
  Stethoscope, LayoutGrid, List, Trash2, Edit,
  Zap, Bell, Brain, Info, Plus
} from 'lucide-react';
import { User, UserRole, TherapistProfile, DetailedPainLog, TreatmentHistory, RiskLevel, PatientStatus, PatientProfile } from './types.ts';
import { PhysioDB } from './db-repository.ts';

// Simple UUID v4 generator helper
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const stats = {
    total: users.length,
    therapists: users.filter(u => u.role === 'Therapist').length,
    patients: users.filter(u => u.role === 'Patient').length,
    activePatients: users.filter(u => u.role === 'Patient' && u.patientStatus === 'Stabil').length
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await PhysioDB.getUsers();
    setUsers(data);
  };

  const handleSaveUser = async (user: User) => {
    try {
      const existing = users.find(u => u.id === user.id);
      if (existing) {
        await PhysioDB.updateUser(user);
      } else {
        await PhysioDB.addUser(user);
      }
      await loadUsers();
      setShowForm(false);
    } catch (err) {
      console.error("Kullanıcı kaydı başarısız", err);
      alert("Kullanıcı kaydedilirken bir hata oluştu. Teknik detay: UUID Format Error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      await PhysioDB.deleteUser(id);
      await loadUsers();
      if (selectedUser?.id === id) setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = activeRole === 'All' || u.role === activeRole;
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-700 text-cyan-500 shadow-2xl relative">
            <Briefcase size={32} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white italic">KADRO <span className="text-cyan-400 uppercase">Yönetimi</span></h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">İnsan Kaynakları ve Hasta Kabul</p>
          </div>
        </div>
        
        <button 
          onClick={() => { setSelectedUser(null); setShowForm(true); }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> Yeni Kayıt
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBadge icon={Users} label="Toplam Kadro" value={stats.total} color="text-white" />
        <StatBadge icon={Stethoscope} label="Terapistler" value={stats.therapists} color="text-cyan-400" />
        <StatBadge icon={Activity} label="Aktif Hastalar" value={stats.activePatients} color="text-emerald-400" />
        <StatBadge icon={UserCheck} label="Doluluk" value={`%${Math.min(100, (stats.patients / (stats.therapists * 10 || 1)) * 100).toFixed(0)}`} color="text-amber-400" />
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-[2rem] flex flex-col lg:flex-row items-center justify-between gap-4">
         <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full lg:w-auto">
            <FilterBtn active={activeRole === 'All'} onClick={() => setActiveRole('All')} label="Tümü" />
            <FilterBtn active={activeRole === 'Therapist'} onClick={() => setActiveRole('Therapist')} label="Uzmanlar" />
            <FilterBtn active={activeRole === 'Patient'} onClick={() => setActiveRole('Patient')} label="Hastalar" />
         </div>

         <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                 type="text" 
                 placeholder="İsim, E-posta veya ID..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-cyan-500/50"
               />
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
               <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}><LayoutGrid size={16}/></button>
               <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-slate-500'}`}><List size={16}/></button>
            </div>
         </div>
      </div>

      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
         {filteredUsers.map(user => (
           <UserCard 
             key={user.id} 
             user={user} 
             onEdit={() => { setSelectedUser(user); setShowForm(true); }} 
             onDelete={() => handleDeleteUser(user.id)}
             therapists={users.filter(u => u.role === 'Therapist')}
           />
         ))}
      </div>

      {showForm && (
        <UserFormModal 
          user={selectedUser} 
          onClose={() => setShowForm(false)} 
          onSave={handleSaveUser}
          therapists={users.filter(u => u.role === 'Therapist')}
        />
      )}
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-all">
     <div className={`w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner ${color}`}>
        <Icon size={20} />
     </div>
     <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-white italic tracking-tighter">{value}</p>
     </div>
  </div>
);

const FilterBtn = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {label}
  </button>
);

const UserCard: React.FC<{ user: User, onEdit: () => void, onDelete: () => void | Promise<void>, therapists: User[] }> = ({ user, onEdit, onDelete, therapists }) => {
  const isTherapist = user.role === 'Therapist';
  const assignedTherapist = therapists.find(t => t.id === user.assignedTherapistId);

  return (
    <div className={`group relative p-6 rounded-[2rem] border transition-all hover:-translate-y-1 ${isTherapist ? 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/30' : 'bg-slate-900/20 border-slate-800 hover:border-emerald-500/30'}`}>
       <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 bg-slate-950 rounded-lg text-slate-400 hover:text-white border border-slate-800"><Edit size={14} /></button>
          <button onClick={() => onDelete()} className="p-2 bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20"><Trash2 size={14} /></button>
       </div>

       <div className="flex items-center gap-4 mb-6">
          <div className="relative">
             <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-xl font-black text-slate-700">{user.fullName.charAt(0)}</span>}
             </div>
             <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-950 ${isTherapist ? 'bg-cyan-500 text-white' : 'bg-emerald-500 text-white'}`}>
               {isTherapist ? 'Uzman' : 'Hasta'}
             </div>
          </div>
          <div>
             <h4 className="font-bold text-white text-lg tracking-tight italic">{user.fullName}</h4>
             <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1"><Mail size={10} /> {user.email}</p>
          </div>
       </div>

       <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
          {isTherapist && user.therapistProfile ? (
             <>
               <InfoRow label="Uzmanlık" value={user.therapistProfile.specialization[0] || 'Genel'} icon={GraduationCap} />
               <InfoRow label="Deneyim" value={`${user.therapistProfile.yearsOfExperience} Yıl`} icon={Star} color="text-amber-400" />
               <InfoRow label="Aktif Hasta" value={user.therapistProfile.totalPatientsActive} icon={Users} />
               <div className="flex gap-1 mt-2 flex-wrap">
                  {user.therapistProfile.specialization.slice(1).map(s => <span key={s} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[8px] text-slate-400 font-bold">{s}</span>)}
               </div>
             </>
          ) : user.patientProfile ? (
             <>
               <InfoRow label="Klinik Tanı" value={user.patientProfile.diagnosisSummary || 'Belirtilmedi'} icon={Activity} color="text-white" />
               <InfoRow label="Risk Seviyesi" value={user.patientProfile.riskLevel || 'Düşük'} icon={AlertCircle} color={(user.patientProfile.riskLevel === 'Yüksek') ? 'text-rose-500' : 'text-emerald-500'} />
               <InfoRow label="Atanan Uzman" value={assignedTherapist?.fullName || 'Atanmadı'} icon={UserCheck} />
             </>
          ) : (
            <p className="text-[9px] text-slate-600 uppercase text-center py-2 italic tracking-widest">Klinik profil verisi yok</p>
          )}
       </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon, color = 'text-slate-300' }: any) => (
  <div className="flex justify-between items-center">
     <div className="flex items-center gap-2 text-slate-500">
        <Icon size={12} />
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
     </div>
     <span className={`text-[10px] font-bold ${color}`}>{value}</span>
  </div>
);

const UserFormModal = ({ user, onClose, onSave, therapists }: { user: User | null, onClose: () => void, onSave: (u: User) => void, therapists: User[] }) => {
  const [formData, setFormData] = useState<User>(() => {
    if (user) return JSON.parse(JSON.stringify(user));
    return {
      id: generateUUID(),
      role: 'Patient',
      fullName: '',
      email: '',
      phone: '',
      createdAt: new Date().toISOString(),
      patientStatus: 'Stabil',
      patientProfile: {
        user_id: '',
        diagnosisSummary: '',
        riskLevel: 'Düşük',
        status: 'Stabil',
        rehabPhase: 'Akut',
        suggestedPlan: [],
        progressHistory: [],
        treatmentHistory: [],
        painLogs: [],
        physicalAssessment: { rom: {}, strength: {}, posture: '' },
        syncStatus: 'Synced'
      },
      therapistProfile: {
        specialization: [],
        bio: '',
        yearsOfExperience: 0,
        successRate: 0,
        totalPatientsActive: 0,
        averageRecoveryTime: '0 Hafta',
        status: 'Aktif',
        aiAssistantSettings: { autoSuggestProtocols: true, notifyHighRisk: true, weeklyReports: true }
      }
    } as User;
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'clinical' | 'professional' | 'ai'>('basic');

  const updateTherapistProfile = (fields: Partial<TherapistProfile>) => {
    setFormData(prev => ({
      ...prev,
      therapistProfile: { ...prev.therapistProfile!, ...fields }
    }));
  };

  const updateAiSettings = (settings: any) => {
    setFormData(prev => ({
      ...prev,
      therapistProfile: {
        ...prev.therapistProfile!,
        aiAssistantSettings: { ...prev.therapistProfile!.aiAssistantSettings, ...settings }
      }
    }));
  };

  const updatePatientProfile = (fields: Partial<PatientProfile>) => {
    setFormData(prev => ({
      ...prev,
      patientProfile: { ...prev.patientProfile!, ...fields }
    }));
  };

  const addSpecialty = (val: string) => {
    if (!val || formData.therapistProfile?.specialization.includes(val)) return;
    updateTherapistProfile({ specialization: [...formData.therapistProfile!.specialization, val] });
  };

  const removeSpecialty = (val: string) => {
    updateTherapistProfile({ specialization: formData.therapistProfile!.specialization.filter(s => s !== val) });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
       <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-2xl font-black italic text-white uppercase">{user ? 'Profili' : 'Yeni Kayıt'} <span className="text-cyan-400">Yönet</span></h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Genesis Veri Yönetim Sistemi</p>
             </div>
             <button onClick={onClose} className="p-3 bg-slate-950 rounded-xl text-slate-500 hover:text-white border border-slate-800"><X size={20}/></button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 bg-slate-950 p-2 rounded-2xl border border-slate-800 shrink-0">
             <FilterBtn active={activeTab === 'basic'} onClick={() => setActiveTab('basic')} label="Kimlik" />
             {formData.role === 'Patient' && <FilterBtn active={activeTab === 'clinical'} onClick={() => setActiveTab('clinical')} label="Klinik Dosya" />}
             {formData.role === 'Therapist' && (
                <>
                  <FilterBtn active={activeTab === 'professional'} onClick={() => setActiveTab('professional')} label="Kariyer" />
                  <FilterBtn active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Ayarları" />
                </>
             )}
          </div>

          <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar">
             {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sistem Rolü</label>
                         <select 
                           value={formData.role} 
                           onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                           className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-xs font-bold outline-none"
                           disabled={!!user}
                         >
                            <option value="Patient">Hasta</option>
                            <option value="Therapist">Terapist / Uzman</option>
                            <option value="Admin">Yönetici</option>
                         </select>
                      </div>
                      <Input label="Tam Ad Soyad" value={formData.fullName} onChange={(v:string) => setFormData({...formData, fullName: v})} />
                   </div>
                   <div className="space-y-6">
                      <Input label="E-Posta Adresi" value={formData.email} onChange={(v:string) => setFormData({...formData, email: v})} />
                      <Input label="İletişim Numarası" value={formData.phone || ''} onChange={(v:string) => setFormData({...formData, phone: v})} />
                   </div>
                </div>
             )}
             {/* ... rest of the form content ... */}
          </div>

          <div className="pt-8 border-t border-slate-800 mt-8 shrink-0">
             <button onClick={() => onSave(formData)} className="w-full bg-cyan-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all">
               <Save size={20} /> Kaydı Sisteme İşle
             </button>
          </div>
       </div>
    </div>
  );
};

const SpecialtyInput = ({ onAdd }: { onAdd: (s: string) => void }) => {
  const [val, setVal] = useState('');
  return (
    <div className="relative">
       <input 
          type="text" 
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { onAdd(val); setVal(''); } }}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-bold text-white outline-none w-32 focus:w-48 transition-all"
          placeholder="Yeni Ekle..."
       />
       <button onClick={() => { onAdd(val); setVal(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500"><Plus size={14}/></button>
    </div>
  );
}

const ToggleOption = ({ label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-2xl group hover:border-cyan-500/30 transition-all">
     <div className="space-y-1">
        <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{label}</h5>
        <p className="text-[9px] text-slate-500 font-medium italic">{desc}</p>
     </div>
     <button onClick={onToggle} className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-cyan-500' : 'bg-slate-800'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'} shadow-lg`} />
     </button>
  </div>
);

const Input = ({ label, type = "text", value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-xs font-bold outline-none focus:border-cyan-500/50 shadow-inner" />
  </div>
);
