
import React from 'react';
import { Database, Search, Target } from 'lucide-react';
import { Exercise } from './types.ts';
import { ExerciseCard } from './ExerciseCard.tsx';

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (ex: Exercise) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onEdit, onDelete, searchTerm, onSearchChange }) => {
  const [activeCategory, setActiveCategory] = React.useState('Hepsi');
  const categories = ['Hepsi', 'Spine', 'Lower Limb', 'Upper Limb', 'Stability', 'Neurological', 'Cardiovascular', 'Post-Op'];

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase()) || ex.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Hepsi' || ex.category.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Categories - Daha Kompakt */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-950/20 p-4 rounded-[2rem] border border-slate-800/50">
        <div className="flex gap-1.5 p-1 bg-slate-900/50 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400" size={12} />
          <input 
            type="text" 
            placeholder="Ara..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-[10px] outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
      </div>

      {/* Grid - Kart genişliğini yarıya indiren yoğun yapı */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-[2rem] opacity-20">
            <Database size={48} className="mx-auto mb-2" />
            <p className="font-mono text-[8px] uppercase tracking-[0.3em]">NO_RECORDS_FOUND</p>
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
