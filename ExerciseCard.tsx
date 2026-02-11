
import React from 'react';
import { 
  Activity, Trash2, Edit3, ChevronRight, AlertTriangle, 
  Sparkles, Zap, ShieldCheck, ImageIcon
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
    <div className={`group glass-panel rounded-[3rem] border transition-all hover:-translate-y-2 relative overflow-hidden flex flex-col h-full ${isCustom ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-600'}`}>
      {/* Visual Accent for Personalized Items */}
      {isCustom && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-pulse z-20" />
      )}
      
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Visual Thumbnail */}
      <div className="h-48 bg-slate-950 relative overflow-hidden">
        {exercise.visualUrl || exercise.videoUrl ? (
          exercise.isMotion ? (
            <video src={exercise.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
          ) : (
            <img src={exercise.visualUrl} alt={exercise.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 gap-2">
            <ImageIcon size={48} />
            <span className="text-[9px] font-mono uppercase tracking-widest">Medya Bekleniyor</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {isCustom && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl animate-bounce-subtle">
              <Zap size={10} fill="currentColor" /> AI OPTIMIZED
            </div>
          )}
          {exercise.isMotion && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 rounded-lg text-[8px] font-black uppercase tracking-widest">
              CINEMA MOTION
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={() => onEdit(exercise)} className="p-3 bg-slate-900/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-white transition-all border border-white/10"><Edit3 size={16}/></button>
          <button onClick={() => onDelete(exercise.id)} className="p-3 bg-red-500/10 backdrop-blur-md rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"><Trash2 size={16}/></button>
        </div>
      </div>
      
      <div className="p-8 space-y-5 flex-1 flex flex-col relative z-10">
        <div className="flex items-start gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 group-hover:scale-110 transition-transform ${isCustom ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
            {isCustom ? <Sparkles size={24} /> : <Activity size={24} />}
          </div>
          <div className="flex-1 pr-6">
            <h4 className="font-inter font-black text-lg tracking-tighter uppercase italic leading-none text-white group-hover:text-cyan-400 transition-colors">
              {exercise.title}
            </h4>
            {exercise.titleTr && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1 italic">
                {exercise.titleTr}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <span className="text-[9px] font-mono text-slate-600 font-bold tracking-widest uppercase">{exercise.code}</span>
              <span className="text-[9px] font-mono text-cyan-500/60 font-black tracking-widest uppercase">{exercise.rehabPhase || 'Genel'}</span>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-3 gap-3 py-4 border-y ${isCustom ? 'border-cyan-500/20 bg-cyan-500/5 -mx-8 px-8' : 'border-slate-800/50'}`}>
          <div>
            <p className="text-[7px] font-mono text-slate-500 uppercase mb-0.5">Dozaj</p>
            <p className="text-[10px] font-black text-white">{exercise.sets}x{exercise.reps}</p>
          </div>
          <div>
            <p className="text-[7px] font-mono text-slate-500 uppercase mb-0.5">Zorluk</p>
            <p className={`text-[10px] font-black ${exercise.difficulty > 7 ? 'text-pink-500' : 'text-white'}`}>{exercise.difficulty}/10</p>
          </div>
          <div>
            <p className="text-[7px] font-mono text-slate-500 uppercase mb-0.5">Tempo</p>
            <p className="text-[10px] font-black text-cyan-500 uppercase truncate">{exercise.tempo || '3-1-3'}</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 italic opacity-80 group-hover:opacity-100 transition-opacity">"{exercise.description}"</p>
        
        <div className="mt-auto pt-5 flex justify-between items-center border-t border-slate-800/30">
          <ExerciseActions exercise={exercise} />
          <div onClick={() => onEdit(exercise)} className={`flex items-center gap-1 font-inter font-black text-[9px] uppercase tracking-widest cursor-pointer transition-all ${isCustom ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}>
            {isCustom ? 'DETAYLARI GÖR' : 'DÜZENLE'} <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
