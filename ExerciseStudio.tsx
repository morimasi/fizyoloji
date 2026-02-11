
import React, { useState, useEffect } from 'react';
import { Plus, FlaskConical, ShieldCheck } from 'lucide-react';
import { PhysioDB } from './db-repository.ts';
import { Exercise } from './types.ts';
import { ExerciseList } from './ExerciseList.tsx';
import { ExerciseForm } from './ExerciseForm.tsx';

export const ExerciseStudio = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialDraft: Partial<Exercise> = {
    title: '',
    category: 'Spine / Lumbar',
    difficulty: 5,
    sets: 3,
    reps: 10,
    description: '',
    biomechanics: '',
    safetyFlags: [],
    equipment: [],
    muscleGroups: [],
    rehabPhase: 'Sub-Akut',
    movementPlane: 'Sagittal'
  };

  const [activeDraft, setActiveDraft] = useState<Partial<Exercise>>(initialDraft);

  useEffect(() => {
    setExercises(PhysioDB.getExercises());
  }, []);

  const handleStartNew = () => {
    setActiveDraft(initialDraft);
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEdit = (ex: Exercise) => {
    setActiveDraft(ex);
    setEditingId(ex.id);
    setIsAdding(true);
  };

  const handleSave = (data: Exercise) => {
    const finalEx = {
      ...data,
      id: editingId || Date.now().toString(),
      code: data.code || `PRO-${Math.floor(Math.random() * 900) + 100}`
    };

    if (editingId) {
      PhysioDB.updateExercise(finalEx);
    } else {
      PhysioDB.addExercise(finalEx);
    }

    setExercises(PhysioDB.getExercises());
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Klinik kütüphaneden silinsin mi?')) {
      PhysioDB.deleteExercise(id);
      setExercises(PhysioDB.getExercises());
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
              <FlaskConical size={28} />
            </div>
            <div>
              <h2 className="font-inter text-4xl font-black italic tracking-tighter uppercase leading-none">ULTRA <span className="text-cyan-400 text-glow">STUDIO</span></h2>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.4em] flex items-center gap-2 mt-1">
                <ShieldCheck size={12} className="text-emerald-500" /> MODULAR ENGINE v3.5
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleStartNew}
          className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-600 px-10 py-5 rounded-2xl font-inter font-black text-xs transition-all shadow-2xl shadow-cyan-500/30 active:scale-95 group text-white neon-glow"
        >
          <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" /> YENİ ÜRETİM BAŞLAT
        </button>
      </div>

      {/* Conditional View: List or Form */}
      {isAdding ? (
        <ExerciseForm 
          initialData={activeDraft} 
          isEditing={!!editingId} 
          onSave={handleSave} 
          onCancel={() => setIsAdding(false)} 
        />
      ) : (
        <ExerciseList 
          exercises={exercises} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />
      )}
    </div>
  );
};
