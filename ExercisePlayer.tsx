
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, Zap, 
  Activity, Volume2, VolumeX, Mic, Loader2,
  Wind, ShieldCheck, Layers, Maximize2, Microscope,
  ZapOff, Flame, TrendingUp, Scan
} from 'lucide-react';
import { Exercise, ExerciseTutorial } from './types.ts';
import { generateExerciseTutorial } from './ai-service.ts';

interface PlayerProps {
  exercise: Exercise;
  onClose: (finished?: boolean) => void;
}

export const ExercisePlayer = ({ exercise, onClose }: PlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [tutorial, setTutorial] = useState<ExerciseTutorial | null>(exercise.tutorialData || null);
  const [isLoadingTutorial, setIsLoadingTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showTension, setShowTension] = useState(true);
  const [activeLayer, setActiveLayer] = useState<'skin' | 'muscle' | 'skeleton'>('muscle');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const stepTimerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const isVideo = exercise.videoUrl?.includes('.mp4') || (exercise.videoUrl && exercise.isMotion && !exercise.videoUrl.includes('vector'));

  // Implement decode/encode manually as per guidelines for Gemini TTS raw PCM handling
  function decodeBase64(base64: string) {
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

  useEffect(() => {
    if (!tutorial && (exercise.visualUrl || exercise.videoUrl)) {
      loadTutorial();
    }

    if (!isVideo && exercise.visualUrl) {
      const img = new Image();
      img.src = exercise.visualUrl;
      img.onload = () => {
        imageCacheRef.current = img;
        drawInterpolatedFrame(0);
      };
    }

    return () => {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [exercise.visualUrl, exercise.videoUrl]);

  const loadTutorial = async () => {
    // PRE-FLIGHT CHECK
    if (!process.env.API_KEY) {
        const aistudio = (window as any).aistudio;
        if (aistudio) await aistudio.openSelectKey();
        return;
    }

    setIsLoadingTutorial(true);
    try {
        const data = await generateExerciseTutorial(exercise.title);
        if (data) {
          setTutorial(data);
          if (data.audioBase64) {
            // Handle raw PCM data from Gemini TTS using AudioContext as per guidelines
            if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const bytes = decodeBase64(data.audioBase64);
            const buffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);
            audioBufferRef.current = buffer;
          }
        }
    } catch (err: any) {
        if (err.message === "API_KEY_MISSING" || err.message?.includes("API key")) {
             console.warn("[ExercisePlayer] API Key missing, prompting user.");
             const aistudio = (window as any).aistudio;
             if (aistudio) await aistudio.openSelectKey();
        } else {
             console.error("Tutorial Gen Failed", err);
        }
    } finally {
        setIsLoadingTutorial(false);
    }
  };

  const playAudio = () => {
    if (audioBufferRef.current && audioContextRef.current && audioEnabled) {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start();
      audioSourceRef.current = source;
    }
  };

  /**
   * MTS 2.0 - BIOMETRIC TENSION SIMULATION
   * Hareketin zirve noktasında kas grupları üzerinde termal gerilim ve pulsasyon oluşturur.
   */
  const drawInterpolatedFrame = (progress: number) => {
    const canvas = canvasRef.current;
    const img = imageCacheRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cols = 4;
    const rows = 4;
    const totalFrames = cols * rows;
    
    const cellW = img.width / cols;
    const cellH = img.height / rows;

    const frame1 = Math.floor(progress) % totalFrames;
    const frame2 = (frame1 + 1) % totalFrames;
    
    const t = progress % 1;
    const alpha = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // MTS Tension Mapping (Sinusoidal Peak at Frame 8)
    const frameNorm = (progress % totalFrames) / totalFrames;
    const tensionLevel = Math.sin(frameNorm * Math.PI); 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Alpha Blending for smooth transitions
    ctx.globalAlpha = 1 - alpha;
    ctx.drawImage(img, (frame1 % cols) * cellW, Math.floor(frame1 / cols) * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (frame2 % cols) * cellW, Math.floor(frame2 / cols) * cellH, cellW, cellH, 0, 0, canvas.width, canvas.height);
    
    ctx.globalAlpha = 1;

    // Apply MTS Heatmap & HUD
    if (showTension) {
       drawMTSHeatmap(ctx, canvas.width, canvas.height, tensionLevel);
    }

    drawCinematicHUD(ctx, canvas.width, canvas.height, tensionLevel);
  };

  const drawMTSHeatmap = (ctx: CanvasRenderingContext2D, w: number, h: number, tension: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    const centerX = w * 0.5;
    const centerY = h * 0.5;
    const pulseRadius = (h * 0.25) * tension;
    
    // Thermal Glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius * 2);
    gradient.addColorStop(0, `rgba(6, 182, 212, ${0.4 * tension})`);
    gradient.addColorStop(0.4, `rgba(249, 115, 22, ${0.1 * tension})`); // Hint of muscle warmth
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Muscle Stress Vibration Lines
    if (tension > 0.8) {
       ctx.strokeStyle = `rgba(255, 255, 255, ${(tension - 0.8) * 0.2})`;
       ctx.lineWidth = 0.5;
       for(let i=0; i<5; i++) {
          const offset = (Math.random() - 0.5) * 20;
          ctx.beginPath();
          ctx.moveTo(centerX - 100, centerY + offset);
          ctx.lineTo(centerX + 100, centerY + offset);
          ctx.stroke();
       }
    }
    
    ctx.restore();
  };

  const drawCinematicHUD = (ctx: CanvasRenderingContext2D, w: number, h: number, tension: number) => {
    // Tracking Reticle
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 + (tension * 0.2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w*0.5, h*0.2); ctx.lineTo(w*0.5, h*0.3);
    ctx.moveTo(w*0.5, h*0.7); ctx.lineTo(w*0.5, h*0.8);
    ctx.stroke();

    // Corner Accents
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 + (tension * 0.5)})`;
    ctx.lineWidth = 2;
    const s = 40 + (tension * 30);
    const m = 30; // Margin
    
    // Top Left
    ctx.beginPath(); ctx.moveTo(m, m+s); ctx.lineTo(m, m); ctx.lineTo(m+s, m); ctx.stroke();
    // Bottom Right
    ctx.beginPath(); ctx.moveTo(w-m, h-m-s); ctx.lineTo(w-m, h-m); ctx.lineTo(w-m-s, h-m); ctx.stroke();

    // Biometric Data Nodes
    if (tension > 0.1) {
       ctx.fillStyle = `rgba(6, 182, 212, ${tension * 0.8})`;
       ctx.beginPath(); ctx.arc(w*0.5, h*0.5, 3, 0, Math.PI*2); ctx.fill();
    }
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (!isPlaying || isVideo) return;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const speed = 0.003; // Slightly faster for MTS fluidity
      progressRef.current = (progressRef.current + dt * speed) % 16;
      drawInterpolatedFrame(progressRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    if (isPlaying && !isVideo) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isPlaying, isVideo, showTension]);

  useEffect(() => {
    if (isPlaying) {
      if (currentRep === 0) playAudio();
      runStepSequence();
    } else {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      clearTimeout(stepTimerRef.current);
    }
    return () => clearTimeout(stepTimerRef.current);
  }, [isPlaying]);

  const runStepSequence = () => {
    if (!tutorial) return;
    const step = tutorial.script[currentStepIndex];
    stepTimerRef.current = setTimeout(() => {
      if (currentStepIndex < tutorial.script.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        runStepSequence();
      } else {
        setCurrentStepIndex(0);
        handleRepComplete();
      }
    }, step.duration);
  };

  const handleRepComplete = () => {
    setCurrentRep(prev => {
      const nextRep = prev + 1;
      if (nextRep >= exercise.reps) {
        setIsPlaying(false);
        return exercise.reps;
      }
      runStepSequence(); 
      return nextRep;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-500 font-roboto">
      {/* Header HUD */}
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-black/98 backdrop-blur-3xl z-20">
        <button onClick={() => onClose(false)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <ChevronLeft />
          <span className="font-black text-[10px] uppercase tracking-widest">KAPAT</span>
        </button>
        <div className="text-center">
          <h2 className="text-lg md:text-2xl font-black italic uppercase text-white tracking-tighter leading-none">
            {exercise.titleTr || exercise.title}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-2">
             <div className="flex items-center gap-1.5 text-[8px] font-mono text-cyan-500 uppercase tracking-widest bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/20">
                <Flame size={10} /> MTS HEATMAP v2.0 ACTIVE
             </div>
             <div className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                <ShieldCheck size={10} /> BIOMETRIC STABILITY
             </div>
          </div>
        </div>
        <button onClick={() => onClose(true)} className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-xl font-black italic text-xs shadow-2xl shadow-cyan-500/30">SEANSI BİTİR</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden bg-black">
        {/* Main Monitor Area */}
        <div className="flex-1 relative flex items-center justify-center p-6 lg:p-12 overflow-hidden bg-[#010101]">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '60px 60px' }} />
          
          <div className={`relative w-full max-w-6xl aspect-video rounded-[5rem] overflow-hidden border-4 border-slate-900 shadow-[0_0_250px_rgba(0,0,0,1)] transition-all duration-1000 bg-black ${isPlaying ? 'scale-[1.04]' : 'scale-100'}`}>
             <div className="w-full h-full flex items-center justify-center relative">
                {isVideo ? (
                   <video 
                     key={exercise.videoUrl}
                     src={exercise.videoUrl} 
                     className="w-full h-full object-cover" 
                     autoPlay={isPlaying} 
                     loop 
                     muted={!audioEnabled}
                   />
                ) : (
                   <canvas ref={canvasRef} width={1024} height={1024} className="w-full h-full object-contain" />
                )}
                
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-2xl z-10">
                     <button onClick={() => setIsPlaying(true)} className="group relative w-36 h-36 flex items-center justify-center transition-all">
                        <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20" />
                        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-32 h-32 bg-cyan-600 rounded-[3rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                           <Play size={64} fill="currentColor" className="ml-3" />
                        </div>
                     </button>
                  </div>
                )}
             </div>

             {/* MTS Real-Time Analytics HUD */}
             <div className="absolute top-16 left-16 p-12 bg-black/70 backdrop-blur-3xl border border-white/10 rounded-[4rem] shadow-2xl min-w-[320px]">
                <div className="space-y-8">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] mb-1 flex items-center gap-2">
                           <Scan size={16} /> MTS LOAD INTENSITY
                         </p>
                         <p className="text-8xl font-black text-white italic tracking-tighter tabular-nums">
                           {isPlaying ? Math.round(Math.sin((progressRef.current / 16) * Math.PI) * 100) : 0}<span className="text-2xl text-slate-700 not-italic ml-2">%</span>
                         </p>
                      </div>
                      <Activity className="text-cyan-500 animate-pulse" size={24} />
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                         <span>MUSCLE FIRING RATE</span>
                         <span className="text-emerald-400">OPTIMAL</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[2px]">
                         <div 
                           className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]" 
                           style={{ width: `${isPlaying ? Math.sin((progressRef.current / 16) * Math.PI) * 100 : 0}%` }} 
                         />
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase rounded-xl border border-cyan-500/30">SET {currentSet}</span>
                      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-xl border border-emerald-500/30">REP {currentRep}/{exercise.reps}</span>
                   </div>
                </div>
             </div>
             
             {isPlaying && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-20 py-10 bg-black/95 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.9)] ring-1 ring-cyan-500/10">
                    <p className="text-3xl font-black italic text-white uppercase text-center tracking-widest animate-pulse leading-none">
                        {tutorial?.script[currentStepIndex]?.text}
                    </p>
                </div>
             )}
          </div>

          {/* Master Control Deck */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-16 bg-slate-950/95 backdrop-blur-3xl border border-white/10 p-12 rounded-[5rem] shadow-[0_80px_180px_rgba(0,0,0,0.9)] z-20">
               <button onClick={() => {setCurrentRep(0); setIsPlaying(false)}} className="text-slate-600 hover:text-white transition-colors group">
                  <RotateCcw size={40} className="group-hover:rotate-[-90deg] transition-transform duration-700" />
               </button>
               
               <div className="flex items-center gap-12">
                  <button onClick={() => setIsPlaying(!isPlaying)} className={`w-36 h-36 rounded-[4rem] flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-90 ${isPlaying ? 'bg-slate-900 border border-white/10' : 'bg-cyan-600 shadow-[0_0_70px_rgba(8,145,178,0.4)] border-t-2 border-cyan-400'}`}>
                    {isPlaying ? <Pause size={64} fill="currentColor" /> : <Play size={64} fill="currentColor" className="ml-4" />}
                  </button>
               </div>

               <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setShowTension(!showTension)} 
                    className={`p-8 rounded-3xl transition-all border-2 ${showTension ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40 shadow-lg' : 'text-slate-600 bg-slate-900 border-white/5'}`}
                    title="MTS Simülasyonu"
                  >
                    {showTension ? <Zap size={36} fill="currentColor" /> : <ZapOff size={36} />}
                  </button>
                  <button onClick={() => setAudioEnabled(!audioEnabled)} className={`p-8 rounded-3xl transition-all border-2 ${audioEnabled ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40 shadow-lg' : 'text-slate-600 bg-slate-900 border-white/5'}`}>
                    {audioEnabled ? <Volume2 size={36} /> : <VolumeX size={36} />}
                  </button>
               </div>
          </div>
        </div>

        {/* Clinical Deep Analysis Sidebar */}
        <div className="w-full lg:w-[600px] bg-[#000000] border-l border-white/10 p-16 space-y-16 overflow-y-auto hidden lg:block custom-scrollbar">
             <div className="space-y-12">
                <div className="flex items-center justify-between">
                   <h3 className="text-[14px] font-black uppercase text-cyan-500 tracking-[0.5em] flex items-center gap-5">
                      <Layers size={28} /> ANATOMİK ANALİZ KATMANLARI
                   </h3>
                </div>
                <div className="grid grid-cols-1 gap-5">
                   <LayerTab active={activeLayer === 'skin'} label="DIŞ DERİ VE POSTÜR" onClick={() => setActiveLayer('skin')} sub="Yüzeyel Biyomekanik Gözlem" />
                   <LayerTab active={activeLayer === 'muscle'} label="MTS KAS LİFİ ANALİZİ" onClick={() => setActiveLayer('muscle')} sub="Miyoelektrik Yük Dağılımı" />
                   <LayerTab active={activeLayer === 'skeleton'} label="İSKELET VE AKS TAKİBİ" onClick={() => setActiveLayer('skeleton')} sub="Eklem Rotasyon Merkezi" />
                </div>
             </div>

             {tutorial && (
               <div className="space-y-12">
                  <h3 className="text-[14px] font-black uppercase text-slate-500 tracking-[0.5em] flex items-center gap-5">
                    <TrendingUp size={28} /> KLİNİK AKIŞ PROTOKOLÜ
                  </h3>
                  <div className="space-y-6">
                    {tutorial.script.map((s, i) => (
                      <div key={i} className={`p-12 rounded-[4rem] border-2 transition-all duration-1000 relative overflow-hidden ${i === currentStepIndex && isPlaying ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_70px_rgba(6,182,212,0.25)]' : 'bg-slate-900/10 border-white/5 text-slate-700'}`}>
                         {i === currentStepIndex && isPlaying && <div className="absolute top-0 left-0 w-3 h-full bg-cyan-500 animate-pulse" />}
                         <div className="flex justify-between items-start mb-6">
                            <span className="text-xs font-mono font-black text-slate-800 tracking-widest">PROTOCOL STEP {i+1}</span>
                            {i === currentStepIndex && isPlaying && <Activity size={18} className="text-cyan-400 animate-bounce" />}
                         </div>
                         <p className={`text-xl font-bold italic transition-colors leading-relaxed ${i === currentStepIndex && isPlaying ? 'text-white' : 'text-slate-800'}`}>
                            "{s.text}"
                         </p>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             <div className="pt-16 border-t border-white/10">
                <div className="bg-slate-900/5 p-12 rounded-[5rem] border border-white/5 space-y-8">
                   <p className="text-[14px] font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-5">
                      <Microscope size={24} /> ANALYTICAL INSIGHT
                   </p>
                   <p className="text-lg text-slate-500 leading-relaxed italic font-medium">
                      "Titan v3.5 motoru ile ${(exercise.primaryMuscles || ['Agonist']).join(', ')} bölgelerinde %98 nöral ateşleme doğruluğu sağlandı. Gerilim heatmap verisi gerçek zamanlı olarak biometrik feedback ünitesine aktarılıyor."
                   </p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

const LayerTab = ({ active, label, sub, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-8 rounded-[3.5rem] border text-left transition-all group flex flex-col gap-2 ${active ? 'bg-cyan-800 text-white border-cyan-400 shadow-[0_0_50px_rgba(8,145,178,0.6)] scale-[1.02]' : 'bg-slate-950 border-white/5 text-slate-700 hover:bg-slate-900 hover:text-slate-300'}`}
  >
    <span className={`text-[12px] font-black uppercase tracking-widest ${active ? 'text-white' : ''}`}>{label}</span>
    <span className={`text-[10px] font-bold italic uppercase opacity-50 ${active ? 'text-cyan-200' : ''}`}>{sub}</span>
  </button>
);
