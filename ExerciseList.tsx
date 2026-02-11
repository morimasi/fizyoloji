
import React, { useState } from 'react';
import { Database, Search, Target, ChevronDown, Layers } from 'lucide-react';
import { Exercise } from './types.ts';
import { ExerciseCard } from './ExerciseCard.tsx';

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (ex: Exercise) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onEdit, onDelete, searchTerm }) => {
  const [activeCategory, setActiveCategory] = useState('Hepsi');
  const categories = ['Hepsi', 'Spine', 'Lower Limb', 'Upper Limb', 'Stability', 'Neurological', 'Cardiovascular', 'Post-Op'];

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ex.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (ex.titleTr && ex.titleTr.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'Hepsi' || ex.category.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Klinik Kategoriler */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all border ${
              activeCategory === cat 
                ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 translate-y-[-1px]' 
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid: Smart Envanter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/10">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
              <Database size={32} />
            </div>
            <p className="font-semibold text-slate-500 text-xs uppercase tracking-[0.2em]">Sonuç Bulunamadı</p>
            <p className="text-[10px] text-slate-600 mt-2 italic">Arama kriterlerinizi veya kategori filtrenizi kontrol edin.</p>
          </div>
        ) : (
          filtered.map((ex) => (
            <ExerciseCard 
              key={ex.id} 
              exercise={ex} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))
        )}
      </div>
    </div>
  );
};
