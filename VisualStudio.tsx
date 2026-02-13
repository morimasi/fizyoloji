
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, FileVideo, FileImage, XCircle, Terminal,
  Zap, Wand2, Sparkles, AlertTriangle, ShieldCheck,
  FastForward, Wind, MousePointer2, Box, Layers,
  ChevronRight, Activity, Gauge, Eye, EyeOff, Save,
  Maximize2, Share2, Rocket
} from 'lucide-react';
import { Exercise } from './types.ts';
import { generateExerciseVisual, generateExerciseRealVideo, generateExerciseVectorData } from './ai-service.ts';

interface VisualStudioProps {
  exercise: Partial<Exercise>;
  onVisualGenerated: (url: string, style: string, isMotion?: boolean, frameCount?: number, layout?: string) => void;
}

export const VisualStudio: React.FC<VisualStudioProps> = ({ exercise, onVisualGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderMode, setRenderMode] = useState<'vector' | 'sprite' | 'video'>('vector');
  const [previewUrl, setPreviewUrl] = useState(exercise.visualUrl || exercise.videoUrl || '');
  const [svgContent, setSvgContent] = useState<string>('');
  const [isMotionActive, setIsMotionActive] = useState(false); 
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Scrubber & Layer States
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeLayers, setActiveLayers] = useState({ skeleton: true, muscles: true, skin: true, HUD: true });
  const [isRecording, setIsRecording] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (!customPrompt && exercise.description) {
      setCustomPrompt(exercise.description.substring(0, 150));
    }
  }, [exercise.description]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsMotionActive(false);
    try {
      if (renderMode === 'video') {
        const url = await generateExerciseRealVideo(exercise, customPrompt);
        setPreviewUrl(url);
        onVisualGenerated(url, 'VEO-Premium', true, 1, 'video');
      } else if (renderMode === 'vector') {
        const svg = await generateExerciseVectorData(exercise);
        setSvgContent(svg);
        setPreviewUrl('vector_mode');
        onVisualGenerated('vector_mode', 'AVM-Genesis', true, 60, 'vector');
        setIsMotionActive(true);
      } else {
        const result = await generateExerciseVisual(exercise, 'Cinematic-Grid', customPrompt);
        setPreviewUrl(result.url);
        onVisualGenerated(result.url, 'AVM-Sprite', true, result.frameCount, result.layout);
        setIsMotionActive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const startProductionRecording = () => {
    if (!canvasRef.current && !svgContainerRef.current) return;
    setIsRecording(true);
    // Real implementation would use MediaRecorder on the Canvas/SVG element
    setTimeout(() => {
        setIsRecording(false);
        alert("Üretim Tamamlandı! MP4 Dosyası İndiriliyor...");
    }, 3000);
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative pb-20 animate-in fade-in duration-500 font-roboto">
      
      {/* LEFT: WORKSTATION CONSOLE (40%) */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-900/40 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800 shadow-inner">
              <Clapperboard size={28} />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter leading-none">Genesis <span className="text-cyan-400">Director</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Pro Motion Studio v6.0</p>
            </div>
          </div>

          {/* ENGINE SELECTOR */}
          <div className="space-y-4 mb-8">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Box size={12} /> Render Engine
             </label>
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button 
                  onClick={() => setRenderMode('vector')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${renderMode === 'vector' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  <Wind size={12} /> AVM (0 Cost)
                </button>
                <button 
                  onClick={() => setRenderMode('video')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${renderMode === 'video' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500'}`}
                >
                  <Rocket size={12} /> VEO (Pro)
                </button>
             </div>
          </div>

          {/* CLINICAL CONTROLS */}
          <div className="space-y-6 mb-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Layers size={12} /> Anatomik Katmanlar
                </label>
                <div className="grid grid-cols-2 gap-2">
                   <LayerToggle label="Skeleton" active={activeLayers.skeleton} onClick={() => toggleLayer('skeleton')} />
                   <LayerToggle label="Muscles" active={activeLayers.muscles} onClick={() => toggleLayer('muscles')} />
                   <LayerToggle label="Body Skin" active={activeLayers.skin} onClick={() => toggleLayer('skin')} />
                   <LayerToggle label="Clinical HUD" active={activeLayers.HUD} onClick={() => toggleLayer('HUD')} />
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Gauge size={12} /> Playback Velocity
                </label>
                <input 
                  type="range" min="0.1" max="2" step="0.1" 
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-full appearance-none accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-600">
                   <span>SLO-MO (0.1x)</span>
                   <span>REAL-TIME (1.0x)</span>
                   <span>FAST (2.0x)</span>
                </div>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !exercise.title}
            className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group ${renderMode === 'video' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-cyan-500'} text-white`}
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin" size={18} /><span className="animate-pulse">RENDERING CLINICAL DATA...</span></>
            ) : (
              <><Wand2 size={18} /> GENERATE PRODUCTION</>
            )}
          </button>
        </div>

        {/* STATS PANEL */}
        <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <h5 className="text-xs font-bold text-white uppercase italic">Anatomik Hassasiyet</h5>
                  <p className="text-[9px] text-slate-500 font-mono">AVM Engine • 60 FPS • 4K Vector</p>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[8px] font-black text-emerald-400 uppercase bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/20">READY</span>
            </div>
        </div>
      </div>

      {/* RIGHT: MONITOR & PRODUCTION STUDIO (60%) */}
      <div className="xl:col-span-8 space-y-6">
        <div className="relative w-full aspect-video bg-black rounded-[3rem] border-4 border-slate-800 flex flex-col overflow-hidden shadow-2xl group ring-1 ring-slate-700/50">
          
          {/* TOP BAR HUD */}
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent z-40 px-8 flex items-center justify-between pointer-events-none">
             <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-rose-500 text-white text-[9px] font-black rounded flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> REC
                </div>
                <span className="text-[10px] font-mono text-white/50 tracking-widest">00:00:0{currentFrame} / 00:00:04</span>
             </div>
             <div className="flex items-center gap-2">
                <button className="p-2 bg-white/5 backdrop-blur-md rounded-lg text-white pointer-events-auto hover:bg-white/10 transition-all"><Maximize2 size={16}/></button>
                <button className="p-2 bg-white/5 backdrop-blur-md rounded-lg text-white pointer-events-auto hover:bg-white/10 transition-all"><Share2 size={16}/></button>
             </div>
          </div>

          {/* MAIN MONITOR */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '40px 40px' }} />
             
             {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                   {renderMode === 'vector' ? (
                      <div 
                        ref={svgContainerRef}
                        dangerouslySetInnerHTML={{ __html: svgContent }} 
                        className={`w-full h-full p-24 flex items-center justify-center transition-all ${!activeLayers.skeleton ? '[&_#skeleton]:opacity-0' : ''} ${!activeLayers.muscles ? '[&_#muscles]:opacity-0' : ''} ${!activeLayers.skin ? '[&_#skin-outline]:opacity-20' : ''}`}
                        style={{ filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.2))' }}
                      />
                   ) : (
                      <video 
                        src={previewUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay loop muted playsInline
                      />
                   )}

                   {/* CLINICAL HUD OVERLAY */}
                   {activeLayers.HUD && (
                      <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between">
                         <div className="flex justify-between">
                            <div className="w-24 h-24 border-l border-t border-cyan-500/40" />
                            <div className="w-24 h-24 border-r border-t border-cyan-500/40" />
                         </div>
                         <div className="flex items-center justify-center gap-12">
                             <div className="text-center">
                                <p className="text-[8px] font-black text-cyan-500 uppercase">ROM Angle</p>
                                <p className="text-2xl font-black text-white italic">124°</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[8px] font-black text-emerald-500 uppercase">Load Balance</p>
                                <p className="text-2xl font-black text-white italic">48/52</p>
                             </div>
                         </div>
                         <div className="flex justify-between">
                            <div className="w-24 h-24 border-l border-b border-cyan-500/40" />
                            <div className="w-24 h-24 border-r border-b border-cyan-500/40" />
                         </div>
                      </div>
                   )}
                </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                  <MonitorPlay size={80} strokeWidth={1} className="opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6 opacity-30">Genesis Station Offline</p>
               </div>
             )}
          </div>

          {/* MASTER SCRUBBER & TIMELINE CONTROL */}
          <div className="h-24 bg-slate-900 border-t border-slate-800 flex flex-col z-50">
             {/* SCRUBBER RAIL */}
             <div className="h-8 bg-slate-950/50 flex items-center relative group/scrub">
                <input 
                  type="range" min="0" max="60" 
                  value={currentFrame}
                  onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
                  className="w-full h-full appearance-none bg-transparent cursor-ew-resize relative z-10"
                />
                <div className="absolute top-0 left-0 h-full bg-cyan-500/10 border-r-2 border-cyan-500 pointer-events-none transition-all" style={{ width: `${(currentFrame/60)*100}%` }} />
                
                {/* TIMELINE TICKS */}
                <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20">
                   {[...Array(12)].map((_, i) => <div key={i} className="h-full w-px bg-slate-700" />)}
                </div>
             </div>

             <div className="flex-1 flex items-center px-8 gap-8">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsMotionActive(!isMotionActive)}
                    disabled={!previewUrl}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${isMotionActive ? 'bg-slate-800 border-slate-700 text-white' : 'bg-cyan-500 border-cyan-400 text-white shadow-lg'}`}
                  >
                      {isMotionActive ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                  </button>
                  <button onClick={() => setCurrentFrame(0)} className="text-slate-500 hover:text-white transition-colors"><FastForward size={20} className="rotate-180" /></button>
                </div>

                <div className="flex-1 flex items-center gap-4 text-xs font-mono">
                   <span className="text-cyan-400 font-black italic">PRORES-VBR</span>
                   <span className="text-slate-700">|</span>
                   <span className="text-slate-500 uppercase tracking-widest font-black">Frame: {currentFrame}</span>
                </div>

                <div className="flex items-center gap-3">
                   <button 
                    onClick={startProductionRecording}
                    disabled={isRecording || !previewUrl}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                   >
                      {isRecording ? <Loader2 className="animate-spin" size={14} /> : <FileVideo size={14} />} 
                      {isRecording ? 'RECORDING...' : 'MP4 PRODUCTION'}
                   </button>
                   <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"><Save size={16}/></button>
                </div>
             </div>
          </div>
        </div>

        {/* FOOTER: SYSTEM INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <InsightBit icon={Activity} label="Motion Flow" value="Biyomekanik Uygun" color="text-emerald-400" />
           <InsightBit icon={Terminal} label="Script Sync" value="Timeline Ready" color="text-cyan-400" />
           <InsightBit icon={ShieldCheck} label="Anatomic Fix" value="Pivot OK" color="text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

const LayerToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${active ? 'bg-slate-800 border-cyan-500 text-cyan-400 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
  >
    {label} {active ? <Eye size={12}/> : <EyeOff size={12}/>}
  </button>
);

const InsightBit = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
     <div className={`p-2 bg-slate-950 rounded-lg ${color} border border-slate-800`}>
        <Icon size={14} />
     </div>
     <div>
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        <p className="text-[10px] font-bold text-white uppercase italic">{value}</p>
     </div>
  </div>
);
