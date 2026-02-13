
import React, { useState, useEffect } from 'react';
import { 
  Zap, BrainCircuit, Target, Layers, Activity, Info, 
  Compass, AlertTriangle, Save, Settings2, Trash2, 
  Sparkles, History, Clock, Thermometer, Hammer, Microscope,
  Languages, ChevronRight, X, CheckCircle2, Loader2
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseData, optimizeExerciseData } from './ai-service.ts';
import { VisualStudio } from './VisualStudio.tsx';

interface ExerciseFormProps {
  initialData: Partial<Exercise>;
  onSave: (data: Exercise) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({ initialData, onSave, onCancel, isEditing }) => {
  // FIX: State initialization is handled, but we need useEffect for updates
  const [activeDraft, setActiveDraft] = useState<Partial<Exercise>>(initialData);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // UI Feedback for saving
  const [activeTab, setActiveTab] = useState<'data' | 'visual' | 'tuning'>('data');
  const [optimizationGoal, setOptimizationGoal] = useState('Maksimum Mobilite');

  // CRITICAL FIX: Sync local state with prop changes. 
  // This ensures the form populates correctly when switching between "New" and "Edit" modes.
  useEffect(() => {
    setActiveDraft(initialData);
  }, [initialData]);

  const handleAISuggest = async () => {
    if (!activeDraft.title) return;
    setIsAIGenerating(true);
    try {
      const data = await generateExerciseData(activeDraft.title);
      setActiveDraft(prev => ({ 
        ...prev, 
        ...data,
        safetyFlags: Array.from(new Set([...(prev.safetyFlags || []), ...(data.safetyFlags || [])])),
        muscleGroups: Array.from(new Set([...(prev.muscleGroups || []), ...(data.muscleGroups || [])]))
      }));
    } catch (e: any) {
       if (e.message?.includes("API Key")) {
         const aistudio = (window as any).aistudio;
         if (aistudio) await aistudio.openSelectKey();
       }
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const optimized = await optimizeExerciseData(activeDraft, optimizationGoal);
      setActiveDraft(prev => ({ ...prev, ...optimized, isPersonalized: true }));
    } catch (e: any) {
       if (e.message?.includes("API Key")) {
         const aistudio = (window as any).aistudio;
         if (aistudio) await aistudio.openSelectKey();
       }
    } finally {
      setIsOptimizing(false);
    }
  };

  const submitForm = async () => {
    // 1. Validation Layer
    if (!activeDraft.title || !activeDraft.description) {
      alert("Kritik Hata: Protokol başlığı ve klinik talimatlar zorunludur.");
      return;
    }

    // 2. Processing Layer
    setIsSaving(true);
    try {
        // Simulate a brief delay for UX feedback (optional but good for feeling of "processing")
        await new Promise(r => setTimeout(r, 500)); 
        onSave(activeDraft as Exercise);
    } catch (error) {
        console.error("Save failed", error);
        alert("Kayıt sırasında bir hata oluştu.");
        setIsSaving(false);
    }
  };

  return (
    <div className="glass-panel p-8 md:p-12 rounded-[3rem] border border-slate-800 relative overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      
      {/* Editor Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-cyan-500 shadow-inner">
            <Settings2 size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white tracking-tight italic">
              {isEditing ? 'PROTOKOLÜ' : 'YENİ'} <span className="text-cyan-400 uppercase">Düzenle</span>
            </h3>
            <div className="flex gap-2 mt-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <TabBtn active={activeTab === 'data'} onClick={() => setActiveTab('data')} label="Klinik Veri" />
              <TabBtn active={activeTab === 'tuning'} onClick={() => setActiveTab('tuning')} label="Dozaj Motoru" />
              <TabBtn active={activeTab === 'visual'} onClick={() => setActiveTab('visual')} label="Görsel Stüdyo" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-4 text-slate-500 hover:text-white transition-colors bg-slate-900/50 rounded-2xl border border-slate-800">
            <X size={20} />
          </button>
          <button 
            onClick={submitForm} 
            disabled={isSaving}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-xs shadow-xl transition-all ${isSaving ? 'bg-emerald-600 text-white cursor-wait' : 'bg-cyan-500 text-white hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 shadow-cyan-500/20'}`}
          >
            {isSaving ? (
                <>
                    <Loader2 size={18} className="animate-spin" /> KAYDEDİLİYOR...
                </>
            ) : (
                <>
                    <Save size={18} /> {isEditing ? 'SİSTEMİ GÜNCELLE' : 'PROTOKOLÜ KAYDET'}
                </>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'data' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
          {/* Sol Kolon: Temel Bilgiler */}
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Target size={12}/> Klinik Başlık (EN)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={activeDraft.title || ''}
                    onChange={(e) => setActiveDraft({...activeDraft, title: e.target.value})}
                    placeholder="Örn: Scapular Wall Slide" 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-cyan-500/50 transition-all text-white shadow-inner"
                  />
                  <button 
                    onClick={handleAISuggest}
                    disabled={isAIGenerating || !activeDraft.title}
                    className="bg-slate-800 hover:bg-slate-700 px-4 rounded-2xl text-cyan-400 border border-slate-700 disabled:opacity-20 transition-all"
                  >
                    {isAIGenerating ? <Activity size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Languages size={12}/> Türkçe Karşılığı</label>
                <input 
                  type="text" 
                  value={activeDraft.titleTr || ''}
                  onChange={(e) => setActiveDraft({...activeDraft, titleTr: e.target.value})}
                  placeholder="Örn: Kürek Kemiği Kaydırma" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-cyan-500/50 transition-all text-white shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Info size={12}/> Uygulama Talimatları</label>
              <textarea 
                value={activeDraft.description || ''}
                onChange={(e) => setActiveDraft({...activeDraft, description: e.target.value})}
                placeholder="Hastanın okuyacağı adım adım talimatları girin..."
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm h-48 outline-none shadow-inner leading-relaxed text-slate-300 font-medium"
              />
            </div>
          </div>

          {/* Sağ Kolon: Klinik Parametreler */}
          <div className="lg:col-span-5 space-y-6 bg-slate-950/40 p-8 rounded-[2.5rem] border border-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Kategori" icon={Layers}>
                <select 
                  value={activeDraft.category || 'Spine / Lumbar'}
                  onChange={(e) => setActiveDraft({...activeDraft, category: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-semibold text-white outline-none"
                >
                  <option>Spine / Lumbar</option>
                  <option>Spine / Cervical</option>
                  <option>Lower Limb / Knee</option>
                  <option>Lower Limb / Hip</option>
                  <option>Upper Limb / Shoulder</option>
                  <option>Stability / Balance</option>
                  <option>Neurological</option>
                  <option>Post-Op</option>
                  <option>Cardiovascular</option>
                </select>
              </FormField>
              <FormField label="Rehab Fazı" icon={Activity}>
                <select 
                  value={activeDraft.rehabPhase || 'Sub-Akut'}
                  onChange={(e) => setActiveDraft({...activeDraft, rehabPhase: e.target.value as any})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-semibold text-white outline-none"
                >
                  <option>Akut</option>
                  <option>Sub-Akut</option>
                  <option>Kronik</option>
                  <option>Performans</option>
                </select>
              </FormField>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold text-cyan-500/60 uppercase tracking-widest flex items-center gap-2"><Microscope size={12} /> Biyomekanik Notlar</label>
              <textarea 
                value={activeDraft.biomechanics || ''}
                onChange={(e) => setActiveDraft({...activeDraft, biomechanics: e.target.value})}
                placeholder="Kas aktivasyonu ve eklem yükü analizi..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-[11px] h-28 outline-none border-l-2 border-l-cyan-500 italic text-slate-400 leading-relaxed font-medium"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
               <MultiInput 
                label="Klinik Uyarılar" 
                icon={AlertTriangle} 
                color="red"
                values={activeDraft.safetyFlags || []}
                onUpdate={(v) => setActiveDraft({...activeDraft, safetyFlags: v})}
               />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tuning' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative z-10">
          <div className="flex items-center gap-6 bg-slate-950/60 p-8 rounded-[2rem] border border-cyan-500/20">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 shrink-0">
               <Zap size={32} />
            </div>
            <div className="flex-1">
               <h4 className="text-lg font-semibold text-white italic uppercase tracking-tight">Klinik <span className="text-cyan-400">Optimizasyon</span></h4>
               <p className="text-[11px] text-slate-500 font-medium">AI motoru, parametreleri seçilen rehabilitasyon hedefine göre günceller.</p>
            </div>
            <div className="flex gap-3">
               <select 
                value={optimizationGoal}
                onChange={(e) => setOptimizationGoal(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-semibold text-white outline-none min-w-[200px]"
               >
                 {["Maksimum Mobilite", "Kas Gücü", "Ağrı Yönetimi", "Post-Op", "Performans"].map(g => <option key={g} value={g}>{g}</option>)}
               </select>
               <button onClick={handleOptimize} className="bg-cyan-500 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                 {isOptimizing ? '...' : 'UYGULA'}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TuningBox label="Tempo" icon={History} value={activeDraft.tempo || "3-1-3"} color="text-cyan-400">
               <input type="text" value={activeDraft.tempo} onChange={e => setActiveDraft({...activeDraft, tempo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center font-bold text-white outline-none" />
            </TuningBox>
            <TuningBox label="Dinlenme" icon={Clock} value={`${activeDraft.restPeriod || 60}s`} color="text-amber-400">
               <input type="number" value={activeDraft.restPeriod} onChange={e => setActiveDraft({...activeDraft, restPeriod: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center font-bold text-white outline-none" />
            </TuningBox>
            <TuningBox label="Dozaj" icon={Activity} value={`${activeDraft.sets}x${activeDraft.reps}`} color="text-emerald-400">
               <div className="flex gap-2">
                 <input type="number" placeholder="Set" value={activeDraft.sets} onChange={e => setActiveDraft({...activeDraft, sets: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center font-bold text-white outline-none" />
                 <input type="number" placeholder="Tek" value={activeDraft.reps} onChange={e => setActiveDraft({...activeDraft, reps: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center font-bold text-white outline-none" />
               </div>
            </TuningBox>
          </div>
        </div>
      )}

      {activeTab === 'visual' && (
        <VisualStudio 
          exercise={activeDraft} 
          onVisualGenerated={(url, style, isMotion) => setActiveDraft({...activeDraft, videoUrl: isMotion ? url : undefined, visualUrl: !isMotion ? url : undefined, visualStyle: style as any, isMotion})} 
        />
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${active ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
    {label}
  </button>
);

const FormField = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon size={12}/> {label}
    </label>
    {children}
  </div>
);

const TuningBox = ({ label, icon: Icon, value, color, children }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <span className={`text-[11px] font-bold ${color}`}>{value}</span>
    </div>
    {children}
  </div>
);

function MultiInput({ label, icon: Icon, values, onUpdate, color }: any) {
  const colorMap: any = {
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Icon size={14} /> {label}</label>
      <input 
        type="text" placeholder="Ekle ve Enter..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const val = (e.target as HTMLInputElement).value;
            if (val) { onUpdate([...values, val]); (e.target as HTMLInputElement).value = ''; }
          }
        }}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-medium outline-none text-white focus:border-cyan-500/50"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v: string, i: number) => (
          <span key={i} className={`${colorMap[color]} text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg border flex items-center gap-2`}>
            {v} <X size={10} className="cursor-pointer hover:text-white" onClick={() => onUpdate(values.filter((_: any, idx: number) => idx !== i))} />
          </span>
        ))}
      </div>
    </div>
  );
}
