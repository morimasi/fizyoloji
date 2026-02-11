
import React from 'react';
import { 
  Activity, Trash2, Edit3, ChevronRight, 
  Sparkles, Zap, ImageIcon, Clock, History
} from 'lucide-react';
import { Exercise } from './types.ts';
import { ExerciseActions } from './ExerciseActions.tsx';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (ex: Exercise) => void;
  onDelete: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onEdit, onDelete }) => {
  const isCustom = exercise.isPersonalized;

  return (
    <div className={`group glass-panel rounded-[2rem] border transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col h-full ${isCustom ? 'border-cyan-500/40 shadow-xl' : 'border-slate-800/80 hover:border-slate-700'}`}>
      {/* Visual Area */}
      <div className="h-32 bg-slate-950 relative overflow-hidden shrink-0 border-b border-slate-800/50">
        {exercise.visualUrl || exercise.videoUrl ? (
          exercise.isMotion ? (
            <video src={exercise.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
          ) : (
            <img src={exercise.visualUrl} alt={exercise.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
            <ImageIcon size={24} />
            <span className="text-[8px] font-bold uppercase mt-2 tracking-widest">Görsel Yok</span>
          </div>
        )}
        
        {/* Admin Quick Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
          <button onClick={(e) => { e.stopPropagation(); onEdit(exercise); }} className="p-2.5 bg-slate-900/90 rounded-xl text-slate-400 hover:text-white border border-white/5 backdrop-blur-md shadow-2xl"><Edit3 size={14}/></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(exercise.id); }} className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/10 backdrop-blur-md shadow-2xl transition-colors"><Trash2 size={14}/></button>
        </div>

        <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2">
           {isCustom && (
            <div className="flex items-center gap-1.5 bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 px-2 py-1 rounded-lg">
              <Zap size={10} className="text-cyan-400 fill-cyan-400" />
              <span className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter">AI Optimized</span>
            </div>
           )}
           <span className="px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-[8px] font-black text-slate-500 border border-white/5 uppercase tracking-widest">{exercise.code}</span>
        </div>
      </div>
      
      {/* Data Content Area */}
      <div className="p-5 flex-1 flex flex-col gap-4 relative z-10">
        <div className="min-w-0">
          <h4 className="font-semibold text-sm tracking-tight text-white group-hover:text-cyan-400 transition-colors leading-snug italic uppercase line-clamp-1">
            {exercise.titleTr || exercise.title}
          </h4>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-1 flex items-center gap-2">
            <span className="text-cyan-500/60">{exercise.category.split('/')[1]?.trim() || exercise.category}</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <span>{exercise.rehabPhase || 'Genel'}</span>
          </p>
        </div>

        {/* Technical Specs Panel */}
        <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800/50 bg-slate-900/20 rounded-xl px-3 -mx-1">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter flex items-center gap-1"><Activity size={10} /> Dozaj</span>
            <span className="text-[10px] font-semibold text-slate-300">{exercise.sets}x{exercise.reps} ({exercise.tempo || 'N/A'})</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter flex items-center gap-1"><Clock size={10} /> Dinlenme</span>
            <span className="text-[10px] font-semibold text-slate-300">{exercise.restPeriod || 60}sn</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 font-medium italic opacity-80">
          "{exercise.description}"
        </p>
        
        {/* Footer Actions */}
        <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-800/40">
          <div className="scale-90 origin-left">
            <ExerciseActions exercise={exercise} />
          </div>
          <button onClick={() => onEdit(exercise)} className="text-slate-500 hover:text-cyan-400 transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-widest group/btn">
            GÜNCELLE <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
