
import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Filter, 
  UserCheck, Shield, MessageSquare, 
  Activity, Calendar, TrendingUp, 
  ChevronRight, MoreVertical, Star,
  AlertCircle, CheckCircle2, Clock,
  History, Thermometer, MapPin, 
  PlusCircle, BookOpen, X, Save,
  Briefcase, UserCog
} from 'lucide-react';
import { PatientUser, PatientStatus, UserRole, DetailedPainLog, TreatmentHistory, PainQuality } from './types.ts';
import { MessagingSystem } from './MessagingSystem.tsx';
import { StaffModule } from './StaffModule.tsx';

// --- SUB-COMPONENTS FOR PATIENT LOGIC ---
// (Kept local to avoid creating too many files, but clearly separated from the new router logic)

// ... [Previous Patient Logic Imports/Components would logically be here, but we will redefine them to keep file consistent]

// Mock Patient Data
const MOCK_PATIENTS: PatientUser[] = [
    {
      id: 'p1',
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet@email.com',
      role: 'Patient',
      status: 'Stabil',
      createdAt: '2024-01-15',
      lastVisit: '2024-02-10',
      recoveryProgress: 65,
      riskScore: 45,
      assignedTherapistId: 't1',
      clinicalProfile: {
        diagnosis: 'L4-L5 Bel Fıtığı, Radikülopati',
        riskLevel: 'Orta',
        notes: [{ id: 'n1', authorId: 't1', text: 'Fleksiyon egzersizlerinde dikkatli olunmalı.', date: '2024-02-01', type: 'Warning' }],
        treatmentHistory: [
          { id: 'h1', date: '2023-11-10', facility: 'Özel Klinik X', summary: '15 seans fizik tedavi uygulandı. Manuel terapi ve ESWT yapıldı.', outcome: 'Kısmi iyileşme sağlandı fakat semptomlar nüksetti.', therapistName: 'Fzt. Caner Bakır' }
        ],
        painLogs: [
          { id: 'l1', date: '2024-02-08', score: 6, location: 'Bel ve Sağ Bacak', quality: 'Yanıcı', triggers: ['Uzun süreli oturma'], duration: '2 saat' },
          { id: 'l2', date: '2024-02-10', score: 4, location: 'Bel', quality: 'Künt', triggers: ['Yürüyüş sonrası'], duration: '30 dk' }
        ]
      }
    }
];

export const UserManager = () => {
  // Router State
  const [activeSection, setActiveSection] = useState<'Patients' | 'Staff'>('Patients');

  return (
    <div className="space-y-6">
      {/* Top Level Navigation Switch */}
      <div className="flex justify-center">
         <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-lg">
            <NavSwitch 
              active={activeSection === 'Patients'} 
              onClick={() => setActiveSection('Patients')} 
              icon={UserCheck} 
              label="HASTA YÖNETİMİ" 
            />
            <div className="w-[1px] h-6 bg-slate-800" />
            <NavSwitch 
              active={activeSection === 'Staff'} 
              onClick={() => setActiveSection('Staff')} 
              icon={UserCog} 
              label="KADRO & İK" 
            />
         </div>
      </div>

      {/* Content Router */}
      <div className="min-h-[600px]">
         {activeSection === 'Patients' ? <PatientManager /> : <StaffModule />}
      </div>
    </div>
  );
};

const NavSwitch = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${active ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
  >
    <Icon size={16} /> {label}
  </button>
);

// --- ORIGINAL PATIENT MANAGER LOGIC (Encapsulated) ---
const PatientManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientUser | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'history' | 'pain'>('overview');
  const [showAddForm, setShowAddForm] = useState<'history' | 'pain' | null>(null);
  const [users, setUsers] = useState<PatientUser[]>(MOCK_PATIENTS);

  const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddHistory = (item: TreatmentHistory) => {
    if (!selectedPatient) return;
    const updatedPatient = {
      ...selectedPatient,
      clinicalProfile: {
        ...selectedPatient.clinicalProfile,
        treatmentHistory: [...selectedPatient.clinicalProfile.treatmentHistory, item]
      }
    };
    setUsers(users.map(u => u.id === updatedPatient.id ? updatedPatient : u));
    setSelectedPatient(updatedPatient);
    setShowAddForm(null);
  };

  const handleAddPainLog = (log: DetailedPainLog) => {
    if (!selectedPatient) return;
    const updatedPatient = {
      ...selectedPatient,
      clinicalProfile: {
        ...selectedPatient.clinicalProfile,
        painLogs: [...selectedPatient.clinicalProfile.painLogs, log]
      }
    };
    setUsers(users.map(u => u.id === updatedPatient.id ? updatedPatient : u));
    setSelectedPatient(updatedPatient);
    setShowAddForm(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-cyan-500 shadow-2xl">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tighter text-white italic">KLİNİK <span className="text-cyan-400 uppercase">HASTALAR</span></h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Aktif Tedavi Protokolleri</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-${selectedPatient ? '4' : '12'} space-y-4 transition-all duration-500`}>
           <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-4 mb-4">
              <Search size={18} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Hasta adı veya tanı ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full font-medium"
              />
           </div>
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              onClick={() => setSelectedPatient(user)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer ${selectedPatient?.id === user.id ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
            >
              <h4 className="font-semibold text-white italic">{user.fullName}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{user.clinicalProfile.diagnosis}</p>
            </div>
          ))}
        </div>

        {selectedPatient && (
          <div className="lg:col-span-8 space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className="glass-panel rounded-[3rem] border border-slate-800 overflow-hidden relative">
              <div className="p-8 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <div className="flex gap-2">
                  <TabButton active={detailTab === 'overview'} onClick={() => setDetailTab('overview')} icon={Activity} label="ÖZET" />
                  <TabButton active={detailTab === 'history'} onClick={() => setDetailTab('history')} icon={History} label="GEÇMİŞ" />
                  <TabButton active={detailTab === 'pain'} onClick={() => setDetailTab('pain')} icon={Thermometer} label="AĞRI" />
                </div>
                <button onClick={() => setShowMessaging(true)} className="p-4 bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-500/20"><MessageSquare size={18} /></button>
              </div>

              <div className="p-10 min-h-[400px]">
                {detailTab === 'overview' && <OverviewTab patient={selectedPatient} />}
                {detailTab === 'history' && <HistoryTab history={selectedPatient.clinicalProfile.treatmentHistory} onAdd={() => setShowAddForm('history')} />}
                {detailTab === 'pain' && <PainTab logs={selectedPatient.clinicalProfile.painLogs} onAdd={() => setShowAddForm('pain')} />}
              </div>

              {showAddForm === 'history' && <AddHistoryForm onSave={handleAddHistory} onCancel={() => setShowAddForm(null)} />}
              {showAddForm === 'pain' && <AddPainForm onSave={handleAddPainLog} onCancel={() => setShowAddForm(null)} />}
            </div>
          </div>
        )}
      </div>
      {showMessaging && selectedPatient && <MessagingSystem patient={selectedPatient} onClose={() => setShowMessaging(false)} />}
    </div>
  );
}

// ... [Sub-components from original file are preserved below for PatientManager functionality] ...

const AddHistoryForm = ({ onSave, onCancel }: { onSave: (h: TreatmentHistory) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<TreatmentHistory>({ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], facility: '', summary: '', outcome: '', therapistName: '' });
  return (
    <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-xl p-10 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-black italic text-cyan-400 uppercase tracking-tighter">YENİ TEDAVİ ÖZETİ</h4>
          <button onClick={onCancel} className="text-slate-500 hover:text-white"><X size={24}/></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tarih" type="date" value={formData.date} onChange={(v: string) => setFormData({...formData, date: v})} />
          <Input label="Kurum" value={formData.facility} onChange={(v: string) => setFormData({...formData, facility: v})} />
        </div>
        <Input label="Terapist" value={formData.therapistName} onChange={(v: string) => setFormData({...formData, therapistName: v})} />
        <TextArea label="Tedavi Özeti" value={formData.summary} onChange={(v: string) => setFormData({...formData, summary: v})} />
        <TextArea label="Sonuç ve Notlar" value={formData.outcome} onChange={(v: string) => setFormData({...formData, outcome: v})} />
        <button onClick={() => onSave(formData)} className="w-full bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2"><Save size={18}/> SİSTEME KAYDET</button>
      </div>
    </div>
  );
};

const AddPainForm = ({ onSave, onCancel }: { onSave: (p: DetailedPainLog) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<DetailedPainLog>({ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], score: 5, location: '', quality: 'Künt', triggers: [], duration: '' });
  return (
    <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-xl p-10 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-black italic text-rose-500 uppercase tracking-tighter">YENİ AĞRI KAYDI</h4>
          <button onClick={onCancel} className="text-slate-500 hover:text-white"><X size={24}/></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tarih" type="date" value={formData.date} onChange={(v: string) => setFormData({...formData, date: v})} />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">Ağrı Skoru: {formData.score}</label>
            <input type="range" min="0" max="10" value={formData.score} onChange={e => setFormData({...formData, score: parseInt(e.target.value)})} className="w-full" />
          </div>
        </div>
        <Input label="Lokasyon" value={formData.location} onChange={(v: string) => setFormData({...formData, location: v})} />
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase">Karakter</label>
             <select value={formData.quality} onChange={e => setFormData({...formData, quality: e.target.value as any})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs">
                {['Keskin', 'Künt', 'Yanıcı', 'Batıcı', 'Elektriklenme'].map(q => <option key={q} value={q}>{q}</option>)}
             </select>
           </div>
           <Input label="Süre" value={formData.duration} onChange={(v: string) => setFormData({...formData, duration: v})} />
        </div>
        <button onClick={() => onSave(formData)} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2"><Save size={18}/> KAYDI OLUŞTUR</button>
      </div>
    </div>
  );
};

const Input = ({ label, type = "text", value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-cyan-500/50" />
  </div>
);

const TextArea = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase">{label}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-24 outline-none focus:border-cyan-500/50" />
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${active ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-white'}`}>
    <Icon size={14} /> {label}
  </button>
);

const OverviewTab = ({ patient }: { patient: PatientUser }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="bg-slate-950/40 p-8 rounded-3xl border border-slate-800 space-y-4">
      <h5 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14} className="text-cyan-400" /> Aktif Klinik Durum</h5>
      <p className="text-sm text-slate-300 italic">"{patient.clinicalProfile.diagnosis}"</p>
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase">Risk Seviyesi</span>
          <p className={`text-xs font-black uppercase mt-1 ${patient.clinicalProfile.riskLevel === 'Yüksek' ? 'text-rose-500' : 'text-emerald-500'}`}>{patient.clinicalProfile.riskLevel}</p>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase">İyileşme Oranı</span>
          <p className="text-xs font-black text-white mt-1">%{patient.recoveryProgress}</p>
        </div>
      </div>
    </div>
  </div>
);

const HistoryTab = ({ history, onAdd }: { history: TreatmentHistory[], onAdd: () => void }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tedavi Kronolojisi</h5>
      <button onClick={onAdd} className="flex items-center gap-2 text-[9px] font-black text-cyan-400 uppercase tracking-widest"><PlusCircle size={14}/> Yeni Özet Ekle</button>
    </div>
    {history.map(item => (
      <div key={item.id} className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4 group hover:border-slate-600 transition-all">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{item.date}</span>
            <h6 className="text-sm font-semibold text-white italic mt-1">{item.facility}</h6>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase">{item.therapistName}</span>
          </div>
        </div>
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
           <p className="text-xs text-slate-400 leading-relaxed font-medium italic">"{item.summary}"</p>
        </div>
        <div>
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Klinik Sonuç</span>
           <p className="text-xs text-slate-300 italic mt-1">{item.outcome}</p>
        </div>
      </div>
    ))}
  </div>
);

const PainTab = ({ logs, onAdd }: { logs: DetailedPainLog[], onAdd: () => void }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Güncel Ağrı Logları</h5>
      <button onClick={onAdd} className="flex items-center gap-2 text-[9px] font-black text-rose-400 uppercase tracking-widest"><PlusCircle size={14}/> Kayıt Gir</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {logs.map(log => (
        <div key={log.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4 group">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <MapPin size={14} className="text-rose-500" />
                 <span className="text-xs font-bold text-slate-200">{log.location}</span>
              </div>
              <span className="text-xl font-black italic text-rose-500">{log.score}/10</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                 <span className="text-[8px] font-black text-slate-600 uppercase">Karakter</span>
                 <p className="text-[10px] font-bold text-slate-300">{log.quality}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                 <span className="text-[8px] font-black text-slate-600 uppercase">Süre</span>
                 <p className="text-[10px] font-bold text-slate-300">{log.duration}</p>
              </div>
           </div>
           <div>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Tetikleyiciler</span>
              <div className="flex flex-wrap gap-1 mt-2">
                 {log.triggers.map(t => <span key={t} className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-bold text-slate-400">{t}</span>)}
              </div>
           </div>
        </div>
      ))}
    </div>
  </div>
);
