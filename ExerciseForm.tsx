
import React, { useState } from 'react';
import { 
  Zap, BrainCircuit, Target, Layers, Activity, Info, 
  Compass, AlertTriangle, Dumbbell, Save, Settings2, Trash2, 
  Sparkles, History, Clock, Thermometer, Hammer, Microscope,
  Languages
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
  const [activeDraft, setActiveDraft] = useState<Partial<Exercise>>(initialData);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'visual' | 'tuning'>('data');
  const [optimizationGoal, setOptimizationGoal] = useState('Daha Fazla Hipertrofi');

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
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const optimized = await optimizeExerciseData(activeDraft, optimizationGoal);
      setActiveDraft(prev => ({ ...prev, ...optimized, isPersonalized: true }));
    } finally {
      setIsOptimizing(false);
    }
  };

  const submitForm = () => {
    if (!activeDraft.title || !activeDraft.description) {
      alert("Başlık ve açıklama zorunludur.");
      return;
    }
    onSave(activeDraft as Exercise);
  };

  const optimizationGoals = [
    "Ağrı Azaltma (Anti-İnflamatuar)",
    "Maksimum Mobilite",
    "Kas Gücü (Hypertrophy)",
    "Nöromüsküler Kontrol",
    "Sporcu Performansı",
    "Post-Op İyileşme"
  ];

  return (
    <div className={`glass-panel p-12 rounded-[4rem] border-2 transition-all duration-500 space-y-10 relative overflow-hidden shadow-2xl ${activeDraft.isPersonalized ? 'border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.1)]' : 'border-slate-800'}`}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-700">
            <Settings2 size={20} />
          </div>
          <div className="flex gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <NavTab active={activeTab === 'data'} onClick={() => setActiveTab('data')} label="KLİNİK VERİ" />
            <NavTab active={activeTab === 'tuning'} onClick={() => setActiveTab('tuning')} label="DEEP TUNING" icon={Microscope} />
            <NavTab active={activeTab === 'visual'} onClick={() => setActiveTab('visual')} label="GÖRSEL STÜDYO" />
          </div>
        </div>
        <div className="flex items-center gap-6">
           {activeDraft.isPersonalized && (
             <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-[9px] font-black uppercase tracking-widest">
               <Sparkles size={12} /> Personalized Content Active
             </div>
           )}
           <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">VAZGEÇ</button>
        </div>
      </div>

      {activeTab === 'data' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
          {/* Core Settings */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2"><Target size={12}/> Klinik Başlık (EN)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={activeDraft.title}
                    onChange={(e) => setActiveDraft({...activeDraft, title: e.target.value})}
                    placeholder="Örn: Scapular Wall Slide" 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-lg font-bold outline-none focus:border-cyan-500 transition-colors shadow-inner text-white"
                  />
                  <button 
                    onClick={handleAISuggest}
                    disabled={isAIGenerating || !activeDraft.title}
                    className="bg-slate-800 hover:bg-slate-700 px-6 rounded-2xl text-cyan-400 transition-all border border-slate-700 disabled:opacity-20 flex items-center gap-2 group/ai"
                  >
                    {isAIGenerating ? <Activity size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2"><Languages size={12}/> Türkçe Karşılığı</label>
                <input 
                  type="text" 
                  value={activeDraft.titleTr}
                  onChange={(e) => setActiveDraft({...activeDraft, titleTr: e.target.value})}
                  placeholder="Örn: Duvar Kürek Kemiği Kaydırma" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-lg font-bold outline-none focus:border-cyan-500 transition-colors shadow-inner text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField label="Kategori" icon={Layers}>
                <select 
                  value={activeDraft.category}
                  onChange={(e) => setActiveDraft({...activeDraft, category: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none shadow-inner text-white"
                >
                  <option>Spine / Lumbar</option>
                  <option>Spine / Cervical</option>
                  <option>Lower Limb / Knee</option>
                  <option>Lower Limb / Hip</option>
                  <option>Upper Limb / Shoulder</option>
                  <option>Stability / Balance</option>
                </select>
              </FormField>
              <FormField label="Klinik Faz" icon={Activity}>
                <select 
                  value={activeDraft.rehabPhase}
                  onChange={(e) => setActiveDraft({...activeDraft, rehabPhase: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none shadow-inner text-white"
                >
                  <option>Akut</option>
                  <option>Sub-Akut</option>
                  <option>Kronik</option>
                  <option>Performans</option>
                </select>
              </FormField>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2"><Info size={12}/> Klinik Talimatlar</label>
              <textarea 
                value={activeDraft.description}
                onChange={(e) => setActiveDraft({...activeDraft, description: e.target.value})}
                placeholder="Egzersizin adım adım uygulanışını yazın..."
                className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-sm h-48 outline-none shadow-inner leading-relaxed text-white"
              />
            </div>
          </div>

          {/* Contextual Deep Data */}
          <div className="space-y-8 bg-slate-950/40 p-10 rounded-[3rem] border border-slate-800/50">
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Düzlem" icon={Compass}>
                <select 
                  value={activeDraft.movementPlane}
                  onChange={(e) => setActiveDraft({...activeDraft, movementPlane: e.target.value as any})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm outline-none text-white"
                >
                  <option>Sagittal</option>
                  <option>Frontal</option>
                  <option>Transverse</option>
                </select>
              </FormField>
              <FormField label="Zorluk (1-10)" icon={Thermometer}>
                <input 
                  type="number" min="1" max="10" 
                  value={activeDraft.difficulty}
                  onChange={(e) => setActiveDraft({...activeDraft, difficulty: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm outline-none text-white"
                />
              </FormField>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest font-black flex items-center gap-2"><Layers size={14} /> Biyomekanik Analiz</label>
              <textarea 
                value={activeDraft.biomechanics}
                onChange={(e) => setActiveDraft({...activeDraft, biomechanics: e.target.value})}
                placeholder="Kas aktivasyonu ve eklem yükü analizi..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs h-32 outline-none border-l-4 border-l-cyan-500 leading-relaxed italic text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <MultiInput 
                label="Yasaklar" 
                icon={AlertTriangle} 
                color="red"
                values={activeDraft.safetyFlags || []}
                onUpdate={(v) => setActiveDraft({...activeDraft, safetyFlags: v})}
               />
               <MultiInput 
                label="Ekipman" 
                icon={Hammer} 
                color="emerald"
                values={activeDraft.equipment || []}
                onUpdate={(v) => setActiveDraft({...activeDraft, equipment: v})}
               />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tuning' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-950/60 p-10 rounded-[3rem] border border-cyan-500/20 shadow-2xl">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-[2rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner shrink-0">
               <Sparkles size={40} className="animate-pulse" />
            </div>
            <div className="flex-1 space-y-2">
               <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">KLİNİK OPTİMİZASYON</h3>
               <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                 AI motoru egzersizi seçilen rehabilitasyon hedefine göre optimize eder. Tempo, dinlenme süresi ve dozaj parametreleri kanıta dayalı tıp kurallarına göre yeniden hesaplanır.
               </p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto min-w-[300px]">
               <select 
                value={optimizationGoal}
                onChange={(e) => setOptimizationGoal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 text-sm font-bold text-white outline-none"
               >
                 {optimizationGoals.map(g => <option key={g} value={g}>{g}</option>)}
               </select>
               <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full bg-cyan-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 {isOptimizing ? <Activity size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                 {isOptimizing ? 'HESAPLANIYOR...' : 'PARAMETRELERİ OPTİMİZE ET'}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TuningBox label="TEMPO" icon={History} value={activeDraft.tempo || "4-1-4"} color="text-cyan-400">
               <input 
                type="text" value={activeDraft.tempo} 
                onChange={(e) => setActiveDraft({...activeDraft, tempo: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center font-mono font-bold text-white outline-none focus:border-cyan-500"
               />
               <p className="text-[8px] text-slate-600 mt-2 uppercase text-center font-black">Eksantrik - İzometrik - Konsantrik</p>
            </TuningBox>

            <TuningBox label="DİNLENME" icon={Clock} value={`${activeDraft.restPeriod || 60}s`} color="text-amber-400">
               <input 
                type="number" value={activeDraft.restPeriod} 
                onChange={(e) => setActiveDraft({...activeDraft, restPeriod: parseInt(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center font-mono font-bold text-white outline-none focus:border-amber-500"
               />
               <p className="text-[8px] text-slate-600 mt-2 uppercase text-center font-black">Saniye Cinsinden Süre</p>
            </TuningBox>

            <TuningBox label="YOĞUNLUK" icon={Thermometer} value={`${activeDraft.difficulty}/10`} color="text-pink-500">
              <div className="flex gap-4 items-center">
                 <div className="flex-1 space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase">{activeDraft.sets} SET</p>
                    <input type="range" min="1" max="10" value={activeDraft.sets} onChange={(e) => setActiveDraft({...activeDraft, sets: parseInt(e.target.value)})} className="w-full accent-pink-500" />
                 </div>
                 <div className="flex-1 space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase">{activeDraft.reps} TEKRAR</p>
                    <input type="range" min="1" max="30" value={activeDraft.reps} onChange={(e) => setActiveDraft({...activeDraft, reps: parseInt(e.target.value)})} className="w-full accent-pink-500" />
                 </div>
              </div>
            </TuningBox>
          </div>

          <div className="bg-slate-950/40 p-10 rounded-[3rem] border border-slate-800">
             <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2 mb-4"><Microscope size={14} /> Klinik Notlar & AI Gözlemi</label>
             <textarea 
              value={activeDraft.clinicalNotes}
              onChange={(e) => setActiveDraft({...activeDraft, clinicalNotes: e.target.value})}
              placeholder="Optimizasyon sonrası ortaya çıkan klinik detaylar..."
              className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 text-xs h-32 outline-none text-slate-400 italic leading-relaxed"
             />
          </div>
        </div>
      )}

      {activeTab === 'visual' && (
        <VisualStudio 
          exercise={activeDraft} 
          onVisualGenerated={(url, style, isMotion) => setActiveDraft({...activeDraft, videoUrl: isMotion ? url : undefined, visualUrl: !isMotion ? url : undefined, visualStyle: style as any, isMotion})} 
        />
      )}

      <div className="flex justify-end gap-4 pt-8 border-t border-slate-800 relative z-10">
        <button onClick={onCancel} className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">İPTAL</button>
        <button onClick={submitForm} className="px-12 py-5 bg-cyan-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-cyan-500/30 flex items-center gap-3 hover:-translate-y-1 active:translate-y-0 transition-all neon-glow">
          <Save size={18} /> {isEditing ? 'SİSTEMİ GÜNCELLE' : 'BANKAYA EKLE'}
        </button>
      </div>
    </div>
  );
};

function NavTab({ active, onClick, label, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}

function FormField({ label, icon: Icon, children }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2">
        <Icon size={12}/> {label}
      </label>
      {children}
    </div>
  );
}

function TuningBox({ label, icon: Icon, value, color, children }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl hover:border-cyan-500/20 transition-all">
       <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 ${color.replace('text', 'bg')}/10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={16} />
             </div>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
          </div>
          <span className={`text-[12px] font-mono font-bold ${color}`}>{value}</span>
       </div>
       {children}
    </div>
  );
}

function MultiInput({ label, icon: Icon, values, onUpdate, color }: any) {
  const colorMap: any = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2"><Icon size={14} /> {label}</label>
      <input 
        type="text" placeholder="Ekle ve Enter..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const val = (e.target as HTMLInputElement).value;
            if (val) { onUpdate([...values, val]); (e.target as HTMLInputElement).value = ''; }
          }
        }}
        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs outline-none text-white focus:border-cyan-500/50"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v: string, i: number) => (
          <span key={i} className={`${colorMap[color]} text-[8px] font-black uppercase px-2 py-1 rounded-lg border flex items-center gap-1`}>
            {v} <Trash2 size={8} className="cursor-pointer hover:text-white" onClick={() => onUpdate(values.filter((_: any, idx: number) => idx !== i))} />
          </span>
        ))}
      </div>
    </div>
  );
}
