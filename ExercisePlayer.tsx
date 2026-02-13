
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  CheckCircle2, Loader2, Activity,
  Eye, Bone, Activity as MuscleIcon, Maximize2,
  Volume2, VolumeX, Mic2
} from 'lucide-react';
import { Exercise, AnimationChoreography } from './types.ts';
import { generateExerciseChoreography, generateCoachingAudio } from './ai-service.ts';

interface PlayerProps {
  exercise: Exercise;
  onClose: (finished?: boolean) => void;
}

// Helper functions for raw PCM audio decoding (GenAI Guidelines requirement)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * KINETIC RENDER ENGINE v5.2
 * Features: Biomechanical Choreography, Neon X-Ray, AI Voice Coaching.
 */
export const ExercisePlayer = ({ exercise, onClose }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [progress, setProgress] = useState(0); // 0-100 for current rep
  const [choreography, setChoreography] = useState<AnimationChoreography | null>(exercise.choreography || null);
  const [isLoadingChoreography, setIsLoadingChoreography] = useState(false);
  const [renderMode, setRenderMode] = useState<'Standard' | 'X-Ray' | 'Muscle'>('Standard');
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Phase 2: Load Choreography
  useEffect(() => {
    if (!choreography) {
      setIsLoadingChoreography(true);
      generateExerciseChoreography(exercise).then(data => {
        if (data) setChoreography(data);
        setIsLoadingChoreography(false);
      });
    }
  }, [exercise]);

  // Phase 4: Voice Guidance & Coaching Cues - Implements raw PCM playback via AudioContext
  useEffect(() => {
    const triggerAudio = async () => {
      // @ts-ignore - Assuming audioCues exists in schema
      if (isPlaying && choreography?.audioCues && !isMuted) {
        // @ts-ignore
        const cue = choreography.audioCues.find(c => Math.abs(c.timestamp - progress) < 1);
        if (cue) {
          try {
            const base64Data = await generateCoachingAudio(cue.text);
            if (base64Data) {
              if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
              }
              const ctx = audioContextRef.current;
              const buffer = await decodeAudioData(decode(base64Data), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start();
            }
          } catch (e) {
            console.error("Audio playback error:", e);
          }
        }
      }
    };
    triggerAudio();
  }, [progress, isPlaying, isMuted, choreography]);

  // Animation Loop: High Precision Kinetic Tracking
  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const duration = (choreography?.totalDuration || 4) * 1000;
    const elapsed = time - startTimeRef.current;
    
    const currentProgress = (elapsed % duration) / duration * 100;
    const repCount = Math.floor(elapsed / duration);

    if (repCount >= exercise.reps) {
      setIsPlaying(false);
      setCurrentRep(exercise.reps);
      setProgress(0);
      return;
    }

    setProgress(currentProgress);
    setCurrentRep(repCount);
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      startTimeRef.current = null;
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, choreography]);

  // CSS Var Injector for Kinetic Dynamics
  const kineticVars = useMemo(() => {
    if (!choreography) return {};
    // Find closest frame for current progress
    const sortedFrames = [...choreography.frames].sort((a, b) => a.timestamp - b.timestamp);
    let currentFrame = sortedFrames[0];
    for (const f of sortedFrames) {
      if (f.timestamp <= progress) currentFrame = f;
      else break;
    }

    return {
      '--k-rotation': `${currentFrame.rotation}deg`,
      '--k-y-offset': `${(currentFrame as any).yOffset || 0}px`,
      '--k-glow-scale': currentFrame.glow === 'high' ? '1.2' : '1.0',
      '--k-opacity': isPlaying ? '1' : '0.6',
    } as React.CSSProperties;
  }, [progress, choreography, isPlaying]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col animate-in fade-in duration-1000 overflow-hidden font-roboto">
      
      {/* Cinematic Navigation */}
      <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5 bg-slate-950/40 backdrop-blur-3xl relative z-10">
        <button onClick={() => onClose(false)} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all group">
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-[10px] uppercase tracking-[0.4em] italic">KLİNİK_ÇIKIŞ</span>
        </button>
        
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tighter leading-none">
            {exercise.titleTr || exercise.title}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-3">
             <p className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" /> 
               KINETIC ENGINE v5.2 ACTIVE
             </p>
             <button onClick={() => setIsMuted(!isMuted)} className={`text-slate-500 hover:text-cyan-400 transition-colors ${isMuted ? 'text-rose-500' : ''}`}>
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
             </button>
          </div>
        </div>

        <div className="flex gap-2">
           <ModeBtn active={renderMode === 'Standard'} onClick={() => setRenderMode('Standard')} icon={Eye} color="cyan" />
           <ModeBtn active={renderMode === 'X-Ray'} onClick={() => setRenderMode('X-Ray')} icon={Bone} color="amber" />
           <ModeBtn active={renderMode === 'Muscle'} onClick={() => setRenderMode('Muscle')} icon={MuscleIcon} color="rose" />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Kinetic Stage */}
        <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center p-4 md:p-12">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
           
           {/* Scanline Effect */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-20 w-full animate-[scan_8s_linear_infinite] pointer-events-none" />

           <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center" style={kineticVars}>
              {isLoadingChoreography ? (
                <div className="flex flex-col items-center gap-8 animate-pulse">
                   <div className="relative">
                      <Loader2 className="animate-spin text-cyan-500" size={84} />
                      <div className="absolute inset-0 flex items-center justify-center"><Mic2 size={32} className="text-cyan-500/50" /></div>
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Biyomekanik_Sekans_Hazırlanıyor</p>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                   {/* Kinetic Core Image */}
                   <img 
                     src={exercise.visualUrl || 'https://img.icons8.com/fluency/512/000000/human-skeleton.png'} 
                     className={`w-[85%] h-[85%] object-contain transition-all duration-300 ${renderMode === 'X-Ray' ? 'invert sepia saturate-200 hue-rotate-15 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]' : renderMode === 'Muscle' ? 'saturate-200 hue-rotate-[320deg] drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'drop-shadow-[0_0_30px_rgba(6,182,212,0.2)]'}`}
                     style={{
                        transform: `rotate(var(--k-rotation)) translateY(var(--k-y-offset)) scale(var(--k-glow-scale))`,
                        opacity: 'var(--k-opacity)'
                     }}
                   />
                   
                   {/* Kinetic Overlay Gradients */}
                   <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="w-[85%] h-[85%] border-[1px] border-cyan-500/10 rounded-full animate-[ping_4s_infinite]" />
                      <div className="absolute w-[1px] h-[70%] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent blur-sm" style={{ left: '50%', transform: 'translateX(-50%)' }} />
                   </div>

                   {/* Real-time Coaching Hint */}
                   {isPlaying && (choreography as any)?.audioCues?.find((c: any) => Math.abs(c.timestamp - progress) < 5) && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-cyan-500/90 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4 shadow-xl shadow-cyan-500/30">
                        {(choreography as any).audioCues.find((c: any) => Math.abs(c.timestamp - progress) < 5)?.text}
                     </div>
                   )}
                </div>
              )}

              {/* Advanced UI: Rep & Phase Tracker */}
              <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 p-8 md:p-12 bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                    <div className="h-full bg-cyan-500 transition-all duration-100" style={{ width: `${progress}%` }} />
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">SEKANS_DÖNGÜSÜ</p>
                 <div className="flex items-baseline gap-4">
                    <span className="text-5xl md:text-7xl font-black text-white italic tracking-tighter group-hover:text-cyan-400 transition-colors">{currentRep}</span>
                    <span className="text-xl md:text-2xl text-slate-600 font-bold">/ {exercise.reps}</span>
                 </div>
              </div>
           </div>

           {/* Floating Control Hub */}
           <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 md:gap-12 bg-slate-900/40 backdrop-blur-3xl p-6 md:p-8 rounded-[3.5rem] border border-white/5 shadow-2xl scale-90 md:scale-100">
              <button onClick={() => {setCurrentRep(0); setProgress(0); setIsPlaying(false)}} className="text-slate-600 hover:text-white transition-all hover:rotate-[-90deg] duration-500"><RotateCcw size={28} /></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center transition-all ${isPlaying ? 'bg-slate-800' : 'bg-cyan-500 shadow-2xl shadow-cyan-500/40 hover:scale-110'}`}
              >
                {isPlaying ? <Pause size={44} className="text-white" fill="currentColor" /> : <Play size={44} className="text-white ml-2" fill="currentColor" />}
              </button>
              <button onClick={() => onClose(true)} className="text-slate-600 hover:text-emerald-400 transition-all hover:scale-125"><CheckCircle2 size={28} /></button>
           </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="w-full lg:w-[450px] bg-slate-950/80 backdrop-blur-3xl border-l border-white/5 p-8 md:p-12 space-y-12 overflow-y-auto custom-scrollbar relative z-20">
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3 italic">
                 <Activity size={18} className="text-cyan-500" /> BİYOMEKANİK_VERİ_MERKEZİ
              </h3>
              <div className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                 <div className="space-y-2">
                    <p className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest">Klinik_Analiz</p>
                    <p className="text-sm text-slate-300 italic leading-relaxed font-medium">"{exercise.biomechanics}"</p>
                 </div>
                 
                 <div className="pt-6 border-t border-white/5">
                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-3">Aktif_Kas_Grupları</p>
                    <div className="flex flex-wrap gap-2">
                       {exercise.muscleGroups?.map(m => {
                         const activation = choreography?.muscleActivationPatterns?.[m]?.[0] || 0;
                         return (
                           <div key={m} className="px-3 py-2 bg-slate-950 border border-white/5 rounded-xl flex items-center gap-3">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{m}</span>
                              <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-cyan-500 animate-pulse" style={{ width: `${activation}%` }} />
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3 italic">
                 <Maximize2 size={18} className="text-emerald-500" /> UYGULAMA_PROTOKOLÜ
              </h3>
              <div className="space-y-6">
                 {exercise.description.split('.').filter(s => s.trim()).map((step, i) => (
                   <div key={i} className="flex gap-6 group cursor-default">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-inner shrink-0">
                        0{i + 1}
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed font-semibold italic">{step.trim()}.</p>
                         <div className="h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-cyan-500/40 to-transparent transition-all duration-700" />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="pt-8 border-t border-white/5">
              <div className="flex items-center gap-4 text-slate-600 group cursor-help">
                 <Zap size={16} />
                 <p className="text-[9px] font-bold uppercase tracking-widest">Klinik_Güvenlik: Tüm parametreler onaylandı.</p>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(500%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.2); }
      `}</style>
    </div>
  );
};

const ModeBtn = ({ active, onClick, icon: Icon, color }: any) => {
  const colorMap: any = {
    cyan: 'bg-cyan-500 border-cyan-400 text-white shadow-cyan-500/20',
    amber: 'bg-amber-500 border-amber-400 text-white shadow-amber-500/20',
    rose: 'bg-rose-500 border-rose-400 text-white shadow-rose-500/20',
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`p-3.5 rounded-2xl border transition-all duration-500 hover:scale-110 active:scale-90 ${active ? colorMap[color] : 'bg-slate-900 border-white/5 text-slate-600 hover:text-white shadow-xl'}`}
    >
      <Icon size={20} />
    </button>
  );
}
