
import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Edit3, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PhysioDB } from './db-repository.ts';
import { Exercise } from './types.ts';

export const ExerciseCMS = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    setExercises(PhysioDB.getExercises());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Bu egzersizi klinik kütüphaneden silmek istediğinize emin misiniz?')) {
      PhysioDB.deleteExercise(id);
      setExercises(PhysioDB.getExercises());
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-inter text-3xl font-black italic tracking-tighter">GOD <span className="text-cyan-400">MODE</span></h2>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} className="text-cyan-500" /> FAZ 1: İÇERİK YÖNETİM SİSTEMİ (CMS)
          </p>
        </div>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-8 py-4 rounded-2xl font-inter font-black text-xs transition-all shadow-xl shadow-cyan-500/20 active:scale-95">
          <Plus size={18} /> YENİ EGZERSİZ EKLE
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {exercises.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] opacity-30">
            <Database size={48} className="mx-auto mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest">Kütüphane Boş</p>
          </div>
        ) : (
          exercises.map((ex) => (
            <div key={ex.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-cyan-500/30 transition-all hover:bg-slate-900 shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-700 group-hover:text-cyan-400 transition-colors shadow-inner border border-slate-800">
                  <Database size={24} />
                </div>
                <div>
                  <h4 className="font-inter font-black text-lg group-hover:text-white transition-colors">{ex.title} <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-500 ml-2 font-mono">{ex.code}</span></h4>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">{ex.category}</span>
                    <span className="text-[10px] font-mono text-slate-700 uppercase">Zorluk: {ex.difficulty}/10</span>
                    {ex.safetyFlags.length > 0 && <span className="text-[10px] font-mono text-red-500/70 uppercase flex items-center gap-1 font-bold"><AlertTriangle size={10} /> Kritik</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all border border-slate-700"><Edit3 size={18} /></button>
                <button onClick={() => handleDelete(ex.id)} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
