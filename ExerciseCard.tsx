
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
    <div className={`group glass-panel rounded-[1.5rem] border transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col h-full ${isCustom ? 'border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-slate-800 hover:border-slate-700'}`}>
      {/* Görsel Alan - Yükseklik Daha da Azaltıldı (h-28) */}
      <div className="h-28 bg-slate-950 relative overflow-hidden shrink-0">
        {exercise.visualUrl || exercise.videoUrl ? (
          exercise.isMotion ? (
            <video src={exercise.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
          ) : (
            <img src={exercise.visualUrl} alt={exercise.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 gap-1">
            <ImageIcon size={20} />
            <span className="text-[6px] font-mono uppercase tracking-widest">Görsel Yok</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        {/* Hızlı Rozetler - Minimalist */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isCustom && (
            <div className="px-1.5 py-0.5 bg-cyan-500 text-white rounded text-[6px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-0.5">
              <Zap size={6} fill="currentColor" /> AI
            </div>
          )}
          {exercise.isMotion && (
            <div className="px-1.5 py-0.5 bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-400 rounded text-[6px] font-black uppercase tracking-tighter">
              LIVE
            </div>
          )}
        </div>

        {/* Hızlı Aksiyonlar - Daha Küçük */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={() => onEdit(exercise)} className="p-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg text-slate-400 hover:text-white border border-white/5 transition-colors"><Edit3 size={10}/></button>
          <button onClick={() => onDelete(exercise.id)} className="p-1.5 bg-red-500/10 backdrop-blur-md rounded-lg text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10 transition-colors"><Trash2 size={10}/></button>
        </div>
      </div>
      
      {/* İçerik Alanı - Minimal Padding (p-4) */}
      <div className="p-4 flex-1 flex flex-col gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${isCustom ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
            {isCustom ? <Sparkles size={14} /> : <Activity size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-inter font-black text-xs tracking-tight uppercase italic leading-none text-white group-hover:text-cyan-400 transition-colors truncate">
              {exercise.title}
            </h4>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter mt-1 italic truncate">
              {exercise.code} • {exercise.rehabPhase || 'Genel'}
            </p>
          </div>
        </div>

        {/* İnce Değerler Paneli */}
        <div className="flex items-center justify-between py-2 border-y border-slate-800/30 -mx-4 px-4 bg-slate-950/20">
          <div className="flex gap-3">
             <div className="flex flex-col">
               <span className="text-[6px] font-mono text-slate-600 uppercase">Dozaj</span>
               <span className="text-[9px] font-black text-white">{exercise.sets}x{exercise.reps}</span>
             </div>
             <div className="w-[1px] h-5 bg-slate-800/50" />
             <div className="flex flex-col">
               <span className="text-[6px] font-mono text-slate-600 uppercase">Zorluk</span>
               <span className={`text-[9px] font-black ${exercise.difficulty > 7 ? 'text-pink-500' : 'text-slate-300'}`}>{exercise.difficulty}/10</span>
             </div>
          </div>
          <div className="text-right">
             <span className="text-[6px] font-mono text-slate-600 uppercase block">Tempo</span>
             <span className="text-[8px] font-black text-cyan-500 uppercase">{exercise.tempo || '3-1-3'}</span>
          </div>
        </div>

        <p className="text-[9px] text-slate-500 leading-snug line-clamp-2 italic opacity-70">
          {exercise.description}
        </p>
        
        {/* Alt Aksiyonlar - Ölçeklendirilmiş */}
        <div className="mt-auto pt-3 flex justify-between items-center border-t border-slate-800/30">
          <div className="scale-75 origin-left">
            <ExerciseActions exercise={exercise} />
          </div>
          <button onClick={() => onEdit(exercise)} className="flex items-center gap-0.5 text-slate-600 hover:text-cyan-400 font-inter font-black text-[7px] uppercase tracking-widest transition-all">
            DÜZENLE <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};
