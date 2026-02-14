
import React, { useState } from 'react';
import { 
  Target, Activity, Layers, Info, BrainCircuit, 
  AlertTriangle, ShieldAlert, Microscope, FileText, 
  Stethoscope, Database, Plus, X, List, Hash
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseData } from './ai-service.ts';

interface ClinicalDataModuleProps {
  data: Partial<Exercise>;
  onUpdate: (updated: Partial<Exercise>) => void;
}

export const ClinicalDataModule: React.FC<ClinicalDataModuleProps> = ({ data, onUpdate }) => {
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const handleAiAnalysis = async () => {
    if (!data.title) return;

    const aistudio = (window as any).aistudio;
    if (aistudio && !(await aistudio.hasSelectedApiKey())) {
        await aistudio.openSelectKey();
    }

    setIsAiProcessing(true);
    try {
      const result = await generateExerciseData(data.title);
      onUpdate({
        ...data,
        ...result,
        safetyFlags: Array.from(new Set([...(data.safetyFlags || []), ...(result.safetyFlags || [])])),
        primaryMuscles: result.primaryMuscles || data.primaryMuscles,
        secondaryMuscles: result.secondaryMuscles || data.secondaryMuscles,
        biomechanics: result.biomechanics || data.biomechanics,
        description: result.description || data.description
      });
    } catch (err: any) {
      console.error("AI Analysis Failed", err);
      if (err.message?.includes("Requested entity was not found") || err.message?.includes("API_KEY_MISSING")) {
         if (aistudio) await aistudio.openSelectKey();
      } else {
         alert("AI Analizi şu an gerçekleştirilemiyor. Lütfen API anahtarınızı kontrol edin.");
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const addTag = (field: 'safetyFlags' | 'primaryMuscles' | 'secondaryMuscles', value: string) => {
    if (!value) return;
    const current = data[field] || [];
    if (!current.includes(value)) {
      onUpdate({ ...data, [field]: [...current, value] });
    }
  };

  const removeTag = (field: 'safetyFlags' | 'primaryMuscles' | 'secondaryMuscles', value: string) => {
    const current = data[field] || [];
    onUpdate({ ...data, [field]: current.filter(t => t !== value) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <FileText size={16} /> Protokol Kimliği
              </h3>
           </div>

           <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup label="Klinik Başlık (EN)" icon={Target}>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={data.title || ''} 
                         onChange={e => onUpdate({...data, title: e.target.value})}
                         className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50" 
                         placeholder="Örn: Scapular Retraction"
                       />
                       <button 
                         onClick={handleAiAnalysis}
                         disabled={isAiProcessing || !data.title}
                         className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 p-3 rounded-xl transition-all disabled:opacity-30"
                       >
                          {isAiProcessing ? <Activity size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                       </button>
                    </div>
                 </InputGroup>
                 <InputGroup label="Türkçe Karşılık" icon={List}>
                    <input type="text" value={data.titleTr || ''} onChange={e => onUpdate({...data, titleTr: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white outline-none" />
                 </InputGroup>
              </div>
              <InputGroup label="Uygulama Talimatları" icon={Info}>
                  <textarea value={data.description || ''} onChange={e => onUpdate({...data, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 h-32 outline-none resize-none" />
              </InputGroup>
           </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Stethoscope size={16} /> Fonksiyonel Anatomi</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TagInput label="Agonist Kaslar" tags={data.primaryMuscles || []} onAdd={v => addTag('primaryMuscles', v)} onRemove={v => removeTag('primaryMuscles', v)} color="cyan" />
              <TagInput label="Stabilizörler" tags={data.secondaryMuscles || []} onAdd={v => addTag('secondaryMuscles', v)} onRemove={v => removeTag('secondaryMuscles', v)} color="blue" />
           </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
         <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
            <h3 className="text-sm font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2 mb-6"><Microscope size={16} /> Biyomekanik Analiz</h3>
            <textarea value={data.biomechanics || ''} onChange={e => onUpdate({...data, biomechanics: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs font-medium text-slate-400 h-40 outline-none border-l-2 border-l-cyan-500" />
         </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
       {Icon && <Icon size={12} />} {label}
    </label>
    {children}
  </div>
);

const TagInput = ({ label, tags, onAdd, onRemove, color, hideLabel }: any) => {
  const [input, setInput] = useState('');
  const colors: any = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd(input);
      setInput('');
    }
  };

  return (
    <div className="space-y-3">
      {!hideLabel && <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>}
      <div className="relative">
         <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none" placeholder="Ekle..." />
         <button onClick={() => { onAdd(input); setInput(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Plus size={12} /></button>
      </div>
      <div className="flex flex-wrap gap-2">
         {tags.map((tag: string, i: number) => (
           <span key={i} className={`px-2 py-1 rounded-lg border text-[9px] font-bold uppercase flex items-center gap-1.5 ${colors[color]}`}>
              {tag} <button onClick={() => onRemove(tag)} className="hover:text-white"><X size={10} /></button>
           </span>
         ))}
      </div>
    </div>
  );
};
