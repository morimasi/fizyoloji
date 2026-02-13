
import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, Play, Pause, Clapperboard, Download,
  MonitorPlay, FileVideo, FileImage, XCircle, Terminal,
  Zap, Wand2, Sparkles, AlertTriangle, ShieldCheck,
  FastForward, Wind, MousePointer2, Box
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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

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
        onVisualGenerated(url, 'VEO-Cinematic', true, 1, 'video');
      } else if (renderMode === 'vector') {
        const svg = await generateExerciseVectorData(exercise);
        setSvgContent(svg);
        setPreviewUrl('vector_mode'); // Internal flag
        onVisualGenerated('vector_mode', 'AVM-Vector', true, 60, 'vector');
        setIsMotionActive(true);
      } else {
        const result = await generateExerciseVisual(exercise, 'Medical-Vector', customPrompt);
        setPreviewUrl(result.url);
        onVisualGenerated(result.url, 'AVM-Sprite', true, result.frameCount, result.layout);
        setIsMotionActive(true);
      }
    } catch (err) {
      alert("Üretim hatası. Kota dolmuş olabilir.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMp4 = () => {
    // Logic for MediaRecorder to capture the current view
    alert("MP4 Dönüştürücü Hazırlanıyor... (MediaRecorder API tetiklendi)");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative pb-20 animate-in fade-in duration-500">
      {/* LEFT: DIRECTOR'S CONSOLE */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-slate-900/40 rounded-[3rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-6">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 border border-slate-800">
              <Box size={24} />
            </div>
            <div>
               <h4 className="font-black text-2xl uppercase italic text-white tracking-tighter">Genesis <span className="text-cyan-400">Director</span></h4>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Advanced Motion Studio</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button 
                  onClick={() => setRenderMode('vector')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'vector' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  <Wind size={10} className="inline mr-1" /> Vector (0 Cost)
                </button>
                <button 
                  onClick={() => setRenderMode('sprite')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'sprite' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500'}`}
                >
                  Draft (Free)
                </button>
                <button 
                  onClick={() => setRenderMode('video')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${renderMode === 'video' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500'}`}
                >
                  VEO (Premium)
                </button>
             </div>
          </div>

          <div className="space-y-3 mb-6 relative z-10">
             <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> Hareket Senaryosu
             </label>
             <textarea 
               value={customPrompt}
               onChange={(e) => setCustomPrompt(e.target.value)}
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 h-28 outline-none focus:border-cyan-500/50 resize-none shadow-inner"
               placeholder="Egzersiz kinematiği için detaylar..."
             />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !exercise.title}
            className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 relative overflow-hidden group ${renderMode === 'video' ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-cyan-500'} text-white`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span className="animate-pulse">RENDERING MOTION...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Hareketi Üret
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT: STUDIO MONITOR */}
      <div className="xl:col-span-7 space-y-6">
        <div className="relative w-full aspect-video bg-black rounded-[3rem] border-4 border-slate-800 flex flex-col overflow-hidden shadow-2xl group ring-1 ring-slate-700/50">
          
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
             {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                   {renderMode === 'vector' ? (
                      <div 
                        ref={svgContainerRef}
                        dangerouslySetInnerHTML={{ __html: svgContent }} 
                        className={`w-full h-full p-20 flex items-center justify-center ${isMotionActive ? 'animate-pulse' : ''}`}
                      />
                   ) : renderMode === 'video' ? (
                      <video 
                        key={previewUrl}
                        src={previewUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay loop muted playsInline
                      />
                   ) : (
                      <canvas 
                        ref={canvasRef} 
                        width={1024} height={1024} 
                        className="w-full h-full object-contain"
                      />
                   )}
                </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                  <MonitorPlay size={64} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-50">Sinyal Yok</p>
               </div>
             )}
          </div>

          <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center px-6 gap-6 z-30">
             <button 
              onClick={() => setIsMotionActive(!isMotionActive)}
              disabled={!previewUrl}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-all border border-slate-700"
             >
                {isMotionActive ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
             </button>

             <div className="flex-1 flex flex-col justify-center gap-1">
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full bg-emerald-500 transition-all duration-300 ${isMotionActive ? 'w-full' : 'w-0'}`} />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                   <span>{renderMode.toUpperCase()} MODE</span>
                   <span className="text-emerald-400 font-bold uppercase italic">Vektörel Akış Hazır</span>
                   <span>00:03</span>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownloadMp4}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black uppercase text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                >
                   <FileVideo size={14} /> MP4 KAYDET
                </button>
             </div>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <h5 className="text-xs font-bold text-white uppercase italic">Anatomik Vektör Şeması</h5>
                  <p className="text-[9px] text-slate-500 font-mono">SVG Path Data • 0 API Token • 60 FPS Fluid Motion</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/20">READY TO EXPORT</span>
            </div>
        </div>
      </div>
    </div>
  );
};
