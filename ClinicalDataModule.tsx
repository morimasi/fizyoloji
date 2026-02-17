
import React, { useState } from 'react';
import { 
  Target, Activity, Layers, Info, BrainCircuit, 
  AlertTriangle, ShieldAlert, Microscope, FileText, 
  Stethoscope, Database, Plus, X, List, Hash,
  Dna, Flame, Box, Bone, Scan
} from 'lucide-react';
import { Exercise, KineticChain, ContractionType, TissueTarget } from './types.ts';
import { generateExerciseData, ensureApiKey, isApiKeyError } from './ai-service.ts';

interface ClinicalDataModuleProps {
  data: Partial<Exercise>;
  onUpdate: (updated: Partial<Exercise>) => void;
}

export const ClinicalDataModule: React.FC<ClinicalDataModuleProps> = ({ data, onUpdate }) => {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'biomechanics' | 'safety'>('general');

  const handleAiAnalysis = async () => {
    if (!data.title) return;
    const ok = await ensureApiKey();
    if (!ok) return;

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
        description: result.description || data.description,
        kineticChain: 'Closed', // AI could predict this, defaulting for demo
        contractionType: 'Concentric'
      });
    } catch (err: any) {
      console.error("AI Analysis Failed", err);
      if (isApiKeyError(err)) {
         await (window as any).aistudio?.openSelectKey();
      } else {
         alert("AI Analizi gerçekleştirilemedi.");
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  const addTag = (field: 'safetyFlags' | 'primaryMuscles' | 'secondaryMuscles' | 'equipment', value: string) => {
    if (!value) return;
    const current = data[field] || [];
    if (!current.includes(value)) {
      onUpdate({ ...data, [field]: [...current, value] });
    }
  };

  const removeTag = (field: 'safetyFlags' | 'primaryMuscles' | 'secondaryMuscles' | 'equipment', value: string) => {
    const current = data[field] || [];
    onUpdate({ ...data, [field]: current.filter(t => t !== value) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 font-roboto">
      {/* LEFT COLUMN: MAIN INPUTS */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-all" />
           
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <FileText size={16} className="text-cyan-500" /> Protokol Kimliği
              </h3>
              <div className="flex gap-2">
                 <TabBtn active={activeTab === 'general'} onClick={() => setActiveTab('general')} label="Genel" />
                 <TabBtn active={activeTab === 'biomechanics'} onClick={() => setActiveTab('biomechanics')} label="Biyomekanik" />
                 <TabBtn active={activeTab === 'safety'} onClick={() => setActiveTab('safety')} label="Güvenlik" />
              </div>
           </div>

           {activeTab === 'general' && (
             <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InputGroup label="Klinik Başlık (EN)" icon={Target}>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           value={data.title || ''} 
                           onChange={e => onUpdate({...data, title: e.target.value})}
                           className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600" 
                           placeholder="Örn: Scapular Retraction"
                         />
                         <button 
                           onClick={handleAiAnalysis}
                           disabled={isAiProcessing || !data.title}
                           title="Genesis AI ile Analiz Et"
                           className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 p-3 rounded-xl transition-all disabled:opacity-30 group/ai"
                         >
                            {isAiProcessing ? <Activity size={18} className="animate-spin" /> : <BrainCircuit size={18} className="group-hover/ai:scale-110 transition-transform" />}
                         </button>
                      </div>
                   </InputGroup>
                   <InputGroup label="ICD-10 Kodu" icon={Hash}>
                      <input 
                        type="text" 
                        value={data.icdCode || ''} 
                        onChange={e => onUpdate({...data, icdCode: e.target.value})} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-cyan-400 outline-none placeholder:text-slate-600"
                        placeholder="Örn: M51.1" 
                      />
                   </InputGroup>
                </div>
                <InputGroup label="Klinik Talimatlar" icon={Info}>
                    <textarea value={data.description || ''} onChange={e => onUpdate({...data, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 h-32 outline-none resize-none focus:border-slate-700 transition-all custom-scrollbar" placeholder="Adım adım uygulama detayları..." />
                </InputGroup>
                <InputGroup label="Gerekli Ekipman" icon={Box}>
                   <TagInput tags={data.equipment || []} onAdd={v => addTag('equipment', v)} onRemove={v => removeTag('equipment', v)} color="slate" placeholder="+ Ekipman ekle" />
                </InputGroup>
             </div>
           )}

           {activeTab === 'biomechanics' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                   <SelectGroup label="Kinetik Zincir" value={data.kineticChain} onChange={v => onUpdate({...data, kineticChain: v as KineticChain})} options={['Open', 'Closed', 'Mixed']} icon={Dna} />
                   <SelectGroup label="Kontraksiyon" value={data.contractionType} onChange={v => onUpdate({...data, contractionType: v as ContractionType})} options={['Concentric', 'Eccentric', 'Isometric', 'Isokinetic']} icon={Activity} />
                   <SelectGroup label="Hedef Doku" value={data.tissueTarget} onChange={v => onUpdate({...data, tissueTarget: v as TissueTarget})} options={['Muscle Belly', 'Tendon', 'Ligament', 'Neural', 'Fascia']} icon={Microscope} />
                   <SelectGroup label="Hareket Düzlemi" value={data.movementPlane} onChange={v => onUpdate({...data, movementPlane: v})} options={['Sagittal', 'Frontal', 'Transverse', 'Combined']} icon={Layers} />
                </div>
                <InputGroup label="Biyomekanik Notlar" icon={Stethoscope}>
                   <textarea value={data.biomechanics || ''} onChange={e => onUpdate({...data, biomechanics: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-cyan-200/80 h-24 outline-none resize-none border-l-2 border-l-cyan-500" placeholder="Eklem açıları ve yüklenme vektörleri..." />
                </InputGroup>
             </div>
           )}

           {activeTab === 'safety' && (
             <div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-4 items-start">
                   <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-1" />
                   <div>
                      <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Kontrendikasyonlar</h4>
                      <p className="text-[9px] text-rose-200/60 mt-1">Bu egzersizin uygulanmaması gereken durumları belirtin.</p>
                   </div>
                </div>
                <TagInput label="Risk Faktörleri" tags={data.safetyFlags || []} onAdd={v => addTag('safetyFlags', v)} onRemove={v => removeTag('safetyFlags', v)} color="rose" placeholder="+ Risk ekle (örn: Akut Fıtık)" />
             </div>
           )}
        </div>
      </div>

      {/* RIGHT COLUMN: MUSCLE MAP & VISUAL PREVIEW */}
      <div className="lg:col-span-5 space-y-6">
         <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 mb-6 text-emerald-400">
               <Flame size={20} />
               <h3 className="text-sm font-black uppercase tracking-widest">Fonksiyonel Anatomi</h3>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Agonist (Birincil) Kaslar</label>
                  <TagInput tags={data.primaryMuscles || []} onAdd={v => addTag('primaryMuscles', v)} onRemove={v => removeTag('primaryMuscles', v)} color="emerald" placeholder="+ Kas ekle" />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sinerjist & Stabilizörler</label>
                  <TagInput tags={data.secondaryMuscles || []} onAdd={v => addTag('secondaryMuscles', v)} onRemove={v => removeTag('secondaryMuscles', v)} color="blue" placeholder="+ Kas ekle" />
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="flex items-center gap-2 mb-2">
                  <Scan size={14} className="text-purple-400" />
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Sistem Taraması</span>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <StatusBadge label="Kinetik Zincir" value={data.kineticChain || 'N/A'} />
                  <StatusBadge label="Kontraksiyon" value={data.contractionType || 'N/A'} />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-950 text-slate-500 hover:text-white'}`}>
    {label}
  </button>
);

const InputGroup = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
       {Icon && <Icon size={12} />} {label}
    </label>
    {children}
  </div>
);

const SelectGroup = ({ label, value, onChange, options, icon }: any) => (
  <InputGroup label={label} icon={icon}>
     <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-cyan-500/50 appearance-none">
        <option value="" disabled>Seçiniz...</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
     </select>
  </InputGroup>
);

const StatusBadge = ({ label, value }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col items-center text-center">
     <span className="text-[8px] font-bold text-slate-500 uppercase">{label}</span>
     <span className="text-[10px] font-black text-white uppercase">{value}</span>
  </div>
);

const TagInput = ({ tags, onAdd, onRemove, color, placeholder }: any) => {
  const [input, setInput] = useState('');
  const colors: any = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700'
  };
  return (
    <div className="space-y-3">
      <div className="relative">
         <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter'){ onAdd(input); setInput(''); } }} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-slate-600" placeholder={placeholder} />
         <button onClick={() => { onAdd(input); setInput(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Plus size={12} /></button>
      </div>
      <div className="flex flex-wrap gap-2">
         {tags.map((tag: string, i: number) => (
           <span key={i} className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase flex items-center gap-1.5 ${colors[color]}`}>
              {tag} <button onClick={() => onRemove(tag)} className="hover:text-white"><X size={10} /></button>
           </span>
         ))}
      </div>
    </div>
  );
};
