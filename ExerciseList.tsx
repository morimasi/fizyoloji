
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
    <div className="space-y-8">
      {/* Search & Categories */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-950/30 p-8 rounded-[3rem] border border-slate-800">
        <div className="flex gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Kütüphanede ara..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-xs outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-800 rounded-[4rem] opacity-20">
            <Database size={64} className="mx-auto mb-4" />
            <p className="font-mono text-xs uppercase tracking-[0.4em]">Database_Empty: Awaiting Selections</p>
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
