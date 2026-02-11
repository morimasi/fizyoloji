
import React from 'react';
import { 
  Activity, Trash2, Edit3, ChevronRight, 
  Sparkles, Zap, ImageIcon
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
    <div className={`group glass-panel rounded-xl border transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col h-full ${isCustom ? 'border-cyan-500/40 shadow-md' : 'border-slate-800/80 hover:border-slate-700'}`}>
      {/* Görsel Alan - Dengeli Yükseklik */}
      <div className="h-24 bg-slate-950 relative overflow-hidden shrink-0">
        {exercise.visualUrl || exercise.videoUrl ? (
          exercise.isMotion ? (
            <video src={exercise.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          ) : (
            <img src={exercise.visualUrl} alt={exercise.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
            <ImageIcon size={18} />
          </div>
        )}
        
        {/* Kontrol Butonları */}
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={() => onEdit(exercise)} className="p-1.5 bg-slate-900/90 rounded-md text-slate-400 hover:text-white border border-white/5"><Edit3 size={11}/></button>
          <button onClick={() => onDelete(exercise.id)} className="p-1.5 bg-red-500/10 rounded-md text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10"><Trash2 size={11}/></button>
        </div>

        <div className="absolute bottom-1.5 left-2 z-10">
           {isCustom && <Zap size={10} className="text-cyan-400 fill-cyan-400" />}
        </div>
      </div>
      
      {/* İçerik Alanı - Okunabilirlik Odaklı */}
      <div className="p-3 flex-1 flex flex-col gap-2.5 relative z-10">
        <div className="min-w-0">
          <h4 className="font-inter font-semibold text-[11px] tracking-tight text-white group-hover:text-cyan-400 transition-colors leading-snug">
            {exercise.title}
          </h4>
          <p className="text-[9px] font-medium text-slate-500 uppercase tracking-normal mt-0.5 truncate">
            {exercise.code} • {exercise.rehabPhase || 'Genel Prosedür'}
          </p>
        </div>

        {/* Değerler Paneli - Daha Net Fontlar */}
        <div className="flex items-center justify-between py-2 border-y border-slate-800/50 -mx-3 px-3 bg-slate-900/30">
          <div className="flex gap-2.5 text-[10px] font-medium text-slate-300">
             <span className="flex items-center gap-1"><Activity size={10} className="text-cyan-500/70" /> {exercise.sets}x{exercise.reps}</span>
             <span className="text-slate-800">|</span>
             <span className={exercise.difficulty > 7 ? 'text-pink-500' : 'text-slate-400'}>Zorluk: {exercise.difficulty}/10</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 font-normal">
          {exercise.description}
        </p>
        
        {/* Alt Aksiyonlar */}
        <div className="mt-auto pt-2.5 flex justify-between items-center border-t border-slate-800/40">
          <div className="scale-90 origin-left opacity-70 group-hover:opacity-100 transition-opacity">
            <ExerciseActions exercise={exercise} />
          </div>
          <button onClick={() => onEdit(exercise)} className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-0.5 text-[9px] font-medium">
            Detay <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};
