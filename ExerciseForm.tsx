
import React, { useState, useEffect } from 'react';
import { 
  Settings2, Save, X, Loader2
} from 'lucide-react';
import { Exercise } from './types.ts';
import { VisualStudio } from './VisualStudio.tsx';
import { ClinicalDataModule } from './ClinicalDataModule.tsx';
import { DosageEngineModule } from './DosageEngineModule.tsx';

interface ExerciseFormProps {
  initialData: Partial<Exercise>;
  onSave: (data: Exercise) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({ initialData, onSave, onCancel, isEditing }) => {
  const [activeDraft, setActiveDraft] = useState<Partial<Exercise>>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'visual' | 'tuning'>('data');

  // Sync state with props
  useEffect(() => {
    setActiveDraft(initialData);
  }, [initialData]);

  const submitForm = async () => {
    // Validation Layer
    if (!activeDraft.title || !activeDraft.description) {
      alert("Kritik Hata: Protokol başlığı ve klinik talimatlar zorunludur.");
      return;
    }

    setIsSaving(true);
    try {
        await new Promise(r => setTimeout(r, 500)); // UX Feedback delay
        onSave(activeDraft as Exercise);
    } catch (error) {
        console.error("Save failed", error);
        alert("Kayıt sırasında bir hata oluştu.");
        setIsSaving(false);
    }
  };

  const updateDraft = (updatedFields: Partial<Exercise>) => {
    setActiveDraft(prev => ({ ...prev, ...updatedFields }));
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

      {/* MODULAR CONTENT AREA */}
      <div className="relative z-10 min-h-[500px]">
        {activeTab === 'data' && (
          <ClinicalDataModule data={activeDraft} onUpdate={updateDraft} />
        )}

        {activeTab === 'tuning' && (
          <DosageEngineModule data={activeDraft} onUpdate={updateDraft} />
        )}

        {activeTab === 'visual' && (
          <VisualStudio 
            exercise={activeDraft} 
            onVisualGenerated={(url, style, isMotion, frameCount) => updateDraft({
              videoUrl: isMotion ? url : undefined, 
              visualUrl: !isMotion ? url : undefined, 
              visualStyle: style as any, 
              visualFrameCount: frameCount || 6, // Default fallback
              isMotion
            })} 
          />
        )}
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${active ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
    {label}
  </button>
);
