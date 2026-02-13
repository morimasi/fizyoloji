
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
    setIsAiProcessing(true);
    try {
      const result = await generateExerciseData(data.title);
      // Merge strategy: Keep existing if user typed, override if empty, append arrays
      onUpdate({
        ...data,
        ...result,
        safetyFlags: Array.from(new Set([...(data.safetyFlags || []), ...(result.safetyFlags || [])])),
        primaryMuscles: result.primaryMuscles || data.primaryMuscles,
        secondaryMuscles: result.secondaryMuscles || data.secondaryMuscles,
        biomechanics: result.biomechanics || data.biomechanics,
        description: result.description || data.description
      });
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
      
      {/* LEFT COLUMN: Identity & Classification */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <FileText size={16} /> Protokol Kimliği
              </h3>
              {data.code && <span className="text-[9px] font-mono bg-slate-950 px-2 py-1 rounded text-cyan-500 border border-slate-800">{data.code}</span>}
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
                         title="AI Klinik Analiz Başlat"
                       >
                          {isAiProcessing ? <Activity size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                       </button>
                    </div>
                 </InputGroup>
                 
                 <InputGroup label="Türkçe Karşılık" icon={List}>
                    <input 
                      type="text" 
                      value={data.titleTr || ''} 
                      onChange={e => onUpdate({...data, titleTr: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50" 
                    />
                 </InputGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="ICD-10 Kodu (Opsiyonel)" icon={Hash}>
                      <input 
                        type="text" 
                        value={data.icdCode || ''} 
                        onChange={e => onUpdate({...data, icdCode: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 outline-none placeholder:text-slate-700"
                        placeholder="Örn: M54.5" 
                      />
                  </InputGroup>
                  <InputGroup label="Rehab Fazı" icon={Activity}>
                      <select 
                        value={data.rehabPhase || 'Sub-Akut'}
                        onChange={e => onUpdate({...data, rehabPhase: e.target.value as any})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none"
                      >
                         <option>Akut</option><option>Sub-Akut</option><option>Kronik</option><option>Performans</option>
                      </select>
                  </InputGroup>
              </div>

              <InputGroup label="Uygulama Talimatları (Hasta Dili)" icon={Info}>
                  <textarea 
                    value={data.description || ''} 
                    onChange={e => onUpdate({...data, description: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 h-32 outline-none resize-none leading-relaxed"
                    placeholder="Hastaya verilecek adım adım komutlar..."
                  />
              </InputGroup>
           </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Stethoscope size={16} /> Fonksiyonel Anatomi
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TagInput 
                label="Agonist Kaslar (Primer)" 
                tags={data.primaryMuscles || []} 
                onAdd={v => addTag('primaryMuscles', v)}
                onRemove={v => removeTag('primaryMuscles', v)}
                color="cyan"
              />
              <TagInput 
                label="Stabilizörler / Sinerjistler" 
                tags={data.secondaryMuscles || []} 
                onAdd={v => addTag('secondaryMuscles', v)}
                onRemove={v => removeTag('secondaryMuscles', v)}
                color="blue"
              />
           </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Biomechanics & Safety */}
      <div className="lg:col-span-5 space-y-6">
         <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <h3 className="text-sm font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2 mb-6">
               <Microscope size={16} /> Biyomekanik Analiz
            </h3>
            
            <textarea 
              value={data.biomechanics || ''}
              onChange={e => onUpdate({...data, biomechanics: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs font-medium text-slate-400 h-40 outline-none leading-relaxed italic border-l-2 border-l-cyan-500"
              placeholder="Eklem artrokinematiği, vektörel kuvvetler ve klinik rasyonel..."
            />

            <div className="mt-6 space-y-4">
               <InputGroup label="Hareket Düzlemi" icon={Layers}>
                   <select 
                      value={data.movementPlane || 'Sagittal'}
                      onChange={e => onUpdate({...data, movementPlane: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none"
                   >
                      <option>Sagittal</option><option>Frontal</option><option>Transverse</option><option>Multi-Planar</option><option>Diagonal (PNF)</option>
                   </select>
               </InputGroup>
            </div>
         </div>

         <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-[2.5rem]">
            <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-4">
               <ShieldAlert size={16} /> Kontrendikasyonlar
            </h3>
            <p className="text-[10px] text-rose-400/60 mb-4 font-medium">Bu protokolü uygularken dikkat edilmesi gereken patolojiler.</p>
            
            <TagInput 
                label="Klinik Uyarılar (Flags)" 
                tags={data.safetyFlags || []} 
                onAdd={v => addTag('safetyFlags', v)}
                onRemove={v => removeTag('safetyFlags', v)}
                color="rose"
                hideLabel
            />
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
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
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
         <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-8 text-xs font-bold text-white outline-none focus:border-slate-600"
            placeholder="Ekle..."
         />
         <button 
           onClick={() => { onAdd(input); setInput(''); }}
           className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
         >
            <Plus size={12} />
         </button>
      </div>
      <div className="flex flex-wrap gap-2">
         {tags.map((tag: string, i: number) => (
           <span key={i} className={`px-2 py-1 rounded-lg border text-[9px] font-bold uppercase flex items-center gap-1.5 animate-in zoom-in-50 ${colors[color]}`}>
              {tag} 
              <button onClick={() => onRemove(tag)} className="hover:text-white"><X size={10} /></button>
           </span>
         ))}
      </div>
    </div>
  );
};
