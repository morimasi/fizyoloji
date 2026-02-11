
import React from 'react';
import { 
  Activity, Trash2, Edit3, ChevronRight, AlertTriangle, 
  Dumbbell, Compass 
} from 'lucide-react';
import { Exercise } from './types.ts';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (ex: Exercise) => void;
  onDelete: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onEdit, onDelete }) => {
  return (
    <div className="group glass-panel p-8 rounded-[3rem] border border-slate-800 hover:border-cyan-500/40 transition-all hover:-translate-y-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="absolute top-6 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => onEdit(exercise)} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg border border-slate-700"><Edit3 size={16}/></button>
        <button onClick={() => onDelete(exercise.id)} className="p-3 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg border border-red-500/20"><Trash2 size={16}/></button>
      </div>
      
      <div className="space-y-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-500 border border-slate-800 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
          <div className="pr-12">
            <h4 className="font-inter font-black text-xl tracking-tighter uppercase italic group-hover:text-cyan-400 transition-colors leading-tight">{exercise.title}</h4>
            <div className="flex gap-2 mt-1">
              <span className="text-[9px] font-mono text-slate-600 font-bold tracking-widest uppercase">{exercise.code}</span>
              <span className="text-[9px] font-mono text-cyan-500/60 font-black tracking-widest uppercase">{exercise.rehabPhase || 'Genel'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-y border-slate-800/50 py-5">
          <div className="flex-1">
            <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Dozaj</p>
            <p className="text-[11px] font-black text-white">{exercise.sets}x{exercise.reps}</p>
          </div>
          <div className="flex-1">
            <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Zorluk</p>
            <p className="text-[11px] font-black text-white">{exercise.difficulty}/10</p>
          </div>
          <div className="flex-1">
            <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Düzlem</p>
            <p className="text-[11px] font-black text-cyan-500">{exercise.movementPlane || 'N/A'}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 italic opacity-80 group-hover:opacity-100 transition-opacity">"{exercise.description}"</p>
        
        <div className="flex justify-between items-center pt-2">
          <div className="flex flex-wrap gap-1">
            {exercise.equipment?.slice(0, 2).map((eq, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-800 text-[8px] font-bold text-slate-400 rounded uppercase">{eq}</span>
            ))}
            {exercise.safetyFlags?.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500/10 text-[8px] font-bold text-red-500 rounded uppercase flex items-center gap-1 border border-red-500/20">
                <AlertTriangle size={8} /> KRİTİK
              </span>
            )}
          </div>
          <div onClick={() => onEdit(exercise)} className="text-cyan-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all flex items-center gap-1 font-inter font-black text-[10px] uppercase tracking-widest cursor-pointer">
            DÜZENLE <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
