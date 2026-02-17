
import React, { useState, useEffect } from 'react';
import { 
  Plus, FlaskConical, ShieldCheck, Database, 
  Zap, Activity, BarChart3, Settings2, 
  Search, Filter, LayoutGrid, List,
  Cpu, Terminal, History, CloudSync, RefreshCw, CheckCircle2,
  Wifi, WifiOff
} from 'lucide-react';
import { PhysioDB } from './db-repository.ts';
import { Exercise } from './types.ts';
import { ExerciseList } from './ExerciseList.tsx';
import { ExerciseForm } from './ExerciseForm.tsx';

export const ExerciseStudio = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const initialDraft: Partial<Exercise> = {
    title: '',
    titleTr: '',
    category: 'Spine / Lumbar',
    difficulty: 5,
    sets: 3,
    reps: 10,
    description: '',
    biomechanics: '',
    safetyFlags: [],
    equipment: [],
    primaryMuscles: [],
    secondaryMuscles: [],
    rehabPhase: 'Sub-Akut',
    movementPlane: 'Sagittal',
    tempo: '3-1-3',
    restPeriod: 60
  };

  const [activeDraft, setActiveDraft] = useState<Partial<Exercise>>(initialDraft);

  useEffect(() => {
    loadExercises();
    
    // Bağlantı durumunu izle
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    // Otomatik yenileme için periyodik kontrol (UI verisi için)
    const interval = setInterval(loadExercises, 10000);

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      clearInterval(interval);
    };
  }, []);

  const loadExercises = async () => {
    const data = await PhysioDB.getExercises();
    setExercises(data);
  };

  const handleGlobalSync = async () => {
    if (!confirm("Bulut veritabanı ile tam senkronizasyon (Force Sync) başlatılsın mı?")) return;
    
    setIsSyncingGlobal(true);
    setSyncStatus("Global senkronizasyon zorlanıyor...");
    
    try {
      const result = await PhysioDB.syncAllLocalToCloud();
      setSyncStatus(`İşlem Tamam: ${result.count} kayıt doğrulandı.`);
      setTimeout(() => setSyncStatus(null), 5000);
      await loadExercises();
    } catch (e) {
      setSyncStatus("Hata: Bulut bağlantısı kurulamadı.");
    } finally {
      setIsSyncingGlobal(false);
    }
  };

  const handleStartNew = () => {
    setActiveDraft(initialDraft);
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEdit = (ex: Exercise) => {
    setActiveDraft({ ...ex });
    setEditingId(ex.id);
    setIsAdding(true);
  };

  const handleSave = async (data: Exercise) => {
    const finalEx: Exercise = {
      ...data,
      id: editingId || crypto.randomUUID(),
      code: data.code || `PRO-${Math.floor(Math.random() * 900) + 100}`
    };

    if (editingId) {
      await PhysioDB.updateExercise(finalEx);
    } else {
      await PhysioDB.addExercise(finalEx);
    }

    await loadExercises();
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu egzersiz klinik kütüphaneden kalıcı olarak silinecek. Onaylıyor musunuz?')) {
      await PhysioDB.deleteExercise(id);
      await loadExercises();
    }
  };

  const dirtyCount = exercises.filter(e => e._sync?.isDirty).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {!isAdding && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-cyan-500/20 group">
                <FlaskConical size={32} className="group-hover:rotate-12 transition-transform" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tighter text-white italic">GENESIS <span className="text-cyan-400 uppercase">Studio</span></h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <Terminal size={10} className="text-cyan-500" /> V5.0 AUTO-SYNC ENGINE
                  </span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>
                    {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {isOnline ? 'Cloud Linked' : 'Offline Mode'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleGlobalSync}
                disabled={isSyncingGlobal || !isOnline}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-slate-300 disabled:opacity-30"
              >
                {isSyncingGlobal ? <RefreshCw size={16} className="animate-spin text-cyan-500" /> : <CloudSync size={16} className="text-cyan-400" />} 
                {isSyncingGlobal ? 'SYCHRONIZING...' : 'FORCE CLOUD SYNC'}
              </button>
              
              <button 
                onClick={handleStartNew}
                className="group relative flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-600 px-10 py-5 rounded-2xl font-semibold text-xs transition-all shadow-2xl shadow-cyan-500/30 active:scale-95 text-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Plus size={18} /> YENİ PROTOKOL ÜRET
              </button>
            </div>
          </div>

          {syncStatus && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{syncStatus}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StudioStatCard icon={Database} label="Klinik Envanter" value={exercises.length.toString()} sub="Aktif Egzersiz" color="text-cyan-400" />
            <StudioStatCard 
              icon={dirtyCount > 0 ? RefreshCw : CheckCircle2} 
              label="Sync Status" 
              value={dirtyCount > 0 ? dirtyCount.toString() : 'Live'} 
              sub={dirtyCount > 0 ? 'Pending Cloud' : 'Global Master'} 
              color={dirtyCount > 0 ? 'text-amber-400' : 'text-emerald-400'}
              animateIcon={dirtyCount > 0}
            />
            <StudioStatCard icon={History} label="Son Revizyon" value="Anlık" sub="7/24 Monitoring" color="text-amber-400" />
            <StudioStatCard icon={ShieldCheck} label="Güvenlik" value="AES-256" sub="Klinik Şifreleme" color="text-blue-400" />
          </div>
        </div>
      )}

      <div className="relative">
        {isAdding ? (
          <ExerciseForm 
            initialData={activeDraft} 
            isEditing={!!editingId} 
            onSave={handleSave} 
            onCancel={() => setIsAdding(false)} 
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-900/40 p-5 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl">
              <div className="relative w-full lg:w-[450px] group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Klinik kod veya başlık ile filtrele..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-xs font-medium outline-none focus:border-cyan-500/50 transition-all text-white shadow-inner"
                />
              </div>
              
              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                <div className="flex bg-slate-900 rounded-xl p-1 gap-1">
                  <ViewBtn active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={LayoutGrid} />
                  <ViewBtn active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={List} />
                </div>
                <div className="w-[1px] h-6 bg-slate-800 mx-1" />
                <button className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700">
                  <Filter size={14} /> FİLTRELE
                </button>
              </div>
            </div>

            <ExerciseList exercises={exercises} onEdit={handleEdit} onDelete={handleDelete} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
        )}
      </div>
    </div>
  );
};

const StudioStatCard = ({ icon: Icon, label, value, sub, color, animateIcon }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-5 hover:border-slate-700 transition-all group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-950 border border-slate-800 ${color} group-hover:scale-105 transition-transform shadow-inner`}>
      <Icon size={24} className={animateIcon ? 'animate-spin' : ''} />
    </div>
    <div>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white tracking-tighter">{value}</span>
        <span className="text-[9px] font-medium text-slate-600 uppercase italic tracking-widest">{sub}</span>
      </div>
    </div>
  </div>
);

const ViewBtn = ({ active, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-2.5 rounded-lg transition-all ${active ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <Icon size={16} />
  </button>
);
