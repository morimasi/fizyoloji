
import React, { useState } from 'react';
import { 
  Zap, BrainCircuit, Target, Layers, Activity, Info, 
  Compass, AlertTriangle, Dumbbell, Save, Settings2, Trash2, Camera
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseData } from './ai-service.ts';
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
  const [activeTab, setActiveTab] = useState<'data' | 'visual'>('data');

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

  const submitForm = () => {
    if (!activeDraft.title || !activeDraft.description) {
      alert("Başlık ve açıklama zorunludur.");
      return;
    }
    onSave(activeDraft as Exercise);
  };

  return (
    <div className="glass-panel p-12 rounded-[4rem] border-2 border-cyan-500/20 animate-in zoom-in-95 duration-500 space-y-10 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-700">
            <Settings2 size={20} />
          </div>
          <div className="flex gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('data')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'data' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              KLİNİK VERİ
            </button>
            <button 
              onClick={() => setActiveTab('visual')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-cyan-500 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              GÖRSEL STÜDYO
            </button>
          </div>
        </div>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">VAZGEÇ</button>
      </div>

      {activeTab === 'data' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
          {/* Core Settings */}
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2"><Target size={12}/> Egzersiz Adı</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={activeDraft.title}
                  onChange={(e) => setActiveDraft({...activeDraft, title: e.target.value})}
                  placeholder="Örn: Scapular Wall Slide" 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-lg font-bold outline-none focus:border-cyan-500 transition-colors shadow-inner"
                />
                <button 
                  onClick={handleAISuggest}
                  disabled={isAIGenerating || !activeDraft.title}
                  className="bg-slate-800 hover:bg-slate-700 px-6 rounded-2xl text-cyan-400 transition-all border border-slate-700 disabled:opacity-20 flex items-center gap-2 group/ai"
                >
                  {isAIGenerating ? <Zap size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
                  <span className="text-[10px] font-black uppercase tracking-tighter">AI DRAFT</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2"><Layers size={12}/> Kategori</label>
                <select 
                  value={activeDraft.category}
                  onChange={(e) => setActiveDraft({...activeDraft, category: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none shadow-inner"
                >
                  <option>Spine / Lumbar</option>
                  <option>Spine / Cervical</option>
                  <option>Lower Limb / Knee</option>
                  <option>Lower Limb / Hip</option>
                  <option>Upper Limb / Shoulder</option>
                  <option>Stability / Balance</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2"><Activity size={12}/> Klinik Faz</label>
                <select 
                  value={activeDraft.rehabPhase}
                  onChange={(e) => setActiveDraft({...activeDraft, rehabPhase: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none shadow-inner"
                >
                  <option>Akut</option>
                  <option>Sub-Akut</option>
                  <option>Kronik</option>
                  <option>Performans</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2"><Info size={12}/> Klinik Talimatlar</label>
              <textarea 
                value={activeDraft.description}
                onChange={(e) => setActiveDraft({...activeDraft, description: e.target.value})}
                placeholder="Egzersizin adım adım uygulanışını yazın..."
                className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-sm h-48 outline-none shadow-inner leading-relaxed"
              />
            </div>
          </div>

          {/* Deep Customization */}
          <div className="space-y-8 bg-slate-950/40 p-10 rounded-[3rem] border border-slate-800/50">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest font-black flex items-center gap-2"><Compass size={12}/> Düzlem</label>
                <select 
                  value={activeDraft.movementPlane}
                  onChange={(e) => setActiveDraft({...activeDraft, movementPlane: e.target.value as any})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm outline-none"
                >
                  <option>Sagittal</option>
                  <option>Frontal</option>
                  <option>Transverse</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-2">Zorluk (1-10)</label>
                <input 
                  type="number" min="1" max="10" 
                  value={activeDraft.difficulty}
                  onChange={(e) => setActiveDraft({...activeDraft, difficulty: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest font-black flex items-center gap-2"><Layers size={14} /> Biyomekanik Analiz</label>
              <textarea 
                value={activeDraft.biomechanics}
                onChange={(e) => setActiveDraft({...activeDraft, biomechanics: e.target.value})}
                placeholder="Kas aktivasyonu ve eklem yükü analizi..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs h-32 outline-none border-l-4 border-l-cyan-500 leading-relaxed italic"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest font-black flex items-center gap-2"><AlertTriangle size={14} /> Yasaklar</label>
                <input 
                  type="text" placeholder="Ekle..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) { setActiveDraft({...activeDraft, safetyFlags: [...(activeDraft.safetyFlags || []), val]}); (e.target as HTMLInputElement).value = ''; }
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs outline-none"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {activeDraft.safetyFlags?.map((f, i) => (
                    <span key={i} className="bg-red-500/10 text-red-400 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-red-500/20 flex items-center gap-1">
                      {f} <Trash2 size={8} className="cursor-pointer" onClick={() => setActiveDraft({...activeDraft, safetyFlags: activeDraft.safetyFlags?.filter((_, idx) => idx !== i)})} />
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest font-black flex items-center gap-2"><Dumbbell size={14} /> Ekipman</label>
                <input 
                  type="text" placeholder="Ekle..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) { setActiveDraft({...activeDraft, equipment: [...(activeDraft.equipment || []), val]}); (e.target as HTMLInputElement).value = ''; }
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs outline-none"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {activeDraft.equipment?.map((eq, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                      {eq} <Trash2 size={8} className="cursor-pointer" onClick={() => setActiveDraft({...activeDraft, equipment: activeDraft.equipment?.filter((_, idx) => idx !== i)})} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <VisualStudio 
          exercise={activeDraft} 
          onVisualGenerated={(url, style) => setActiveDraft({...activeDraft, visualUrl: url, visualStyle: style as any})} 
        />
      )}

      <div className="flex justify-end gap-4 pt-8 border-t border-slate-800 relative z-10">
        <button onClick={onCancel} className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">İPTAL</button>
        <button onClick={submitForm} className="px-12 py-5 bg-cyan-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-cyan-500/30 flex items-center gap-3 hover:-translate-y-1 transition-all">
          <Save size={18} /> {isEditing ? 'SİSTEMİ GÜNCELLE' : 'BANKAYA EKLE'}
        </button>
      </div>
    </div>
  );
};
