
import React, { useState, useEffect } from 'react';
import { 
  Activity, Brain, RefreshCw, BarChart3, Save, Zap, 
  Stethoscope, ShieldCheck, Cpu, Plus, Trash2, 
  Edit3, CheckCircle2, AlertCircle, TrendingUp, 
  Settings2, Wand2, Terminal, Info
} from 'lucide-react';
import { getAI } from './ai-core.ts';

interface ClinicalTask {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In-Progress' | 'Completed';
  aiRecommendation?: string;
}

export const TherapistManagement = ({ isAdminOverride = false }: { isAdminOverride?: boolean }) => {
  const [tasks, setTasks] = useState<ClinicalTask[]>([
    { id: '1', title: 'Post-Op ACL Protokol Revizyonu', priority: 'High', status: 'Pending', aiRecommendation: 'Hastanın ağrısı düştü, 2. faza geçiş önerilir.' },
    { id: '2', title: 'Lomber Stabilizasyon Analizi', priority: 'Medium', status: 'In-Progress' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiIntensity, setAiIntensity] = useState(75);

  const generateAiTasks = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && !(await aistudio.hasSelectedApiKey())) {
        await aistudio.openSelectKey();
    }

    setIsGenerating(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Physiotherapist clinical tasks for today based on high-risk patients. Return 3 tasks in JSON format: [{title, priority, aiRecommendation}].",
        config: { responseMimeType: "application/json" }
      });
      const newTasks = JSON.parse(response.text || "[]");
      setTasks(prev => [...prev, ...newTasks.map((t: any) => ({ ...t, id: Date.now().toString() + Math.random(), status: 'Pending' }))]);
    } catch (err: any) {
      console.error("AI Task Gen Error", err);
      if (err.message?.includes("Requested entity was not found") || err.message?.includes("API_KEY_MISSING")) {
         if (aistudio) await aistudio.openSelectKey();
      } else {
         alert("AI Görev listesi oluşturulamadı. Lütfen API anahtarınızı kontrol edin.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <>
      <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-6 duration-700">
         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
               <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                     <Activity size={20} className="text-emerald-400" /> Klinik <span className="text-emerald-400">Görev Yönetimi</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">
                    {isAdminOverride ? "SUPERVISOR OVERRIDE: TÜM YETKİLER AKTİF" : "Kişiselleştirilmiş Klinik İş Akışı"}
                  </p>
               </div>
               <div className="flex gap-3">
                  <button 
                    onClick={generateAiTasks}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
                  >
                     {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />} AI GÖREV ÜRET
                  </button>
                  <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                     <Plus size={20} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4 relative z-10">
               {tasks.map(task => (
                  <div key={task.id} className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl group/item hover:border-emerald-500/40 transition-all flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`} />
                        <div>
                           <h5 className="text-sm font-black text-white italic tracking-tight uppercase">{task.title}</h5>
                           {task.aiRecommendation && (
                              <p className="text-[10px] text-cyan-400/80 mt-1 italic flex items-center gap-2">
                                 <Brain size={12} /> AI Note: {task.aiRecommendation}
                              </p>
                           )}
                        </div>
                     </div>
                     <div className="flex items-center gap-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-colors"><Edit3 size={14}/></button>
                        <button onClick={() => removeTask(task.id)} className="p-2 bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"><Trash2 size={14}/></button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <Brain size={20} className="text-cyan-400" /> AI Asistan <span className="text-cyan-400">Neural Configuration</span>
               </h3>
               <span className="text-[9px] font-black text-slate-600 uppercase">Engine: Genesis v5.0 DeepReasoning</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" /> Klinik Disiplin / Empati Dengesi
                     </label>
                     <span className="text-[10px] font-mono text-cyan-400">%{aiIntensity}</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={aiIntensity} onChange={(e) => setAiIntensity(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-full appearance-none accent-cyan-500 border border-slate-800"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase italic">
                     <span>Destekleyici / Soft</span>
                     <span>Klinik / Disiplinli</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Raporlama Modu</label>
                  <div className="grid grid-cols-2 gap-3">
                     <button className="py-4 bg-slate-950 border border-cyan-500/40 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Prediktif</button>
                     <button className="py-4 bg-slate-950 border border-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-700">Reaktif</button>
                  </div>
               </div>
            </div>
            
            <div className="pt-8 border-t border-slate-800 flex justify-end">
               <button className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/30 active:scale-95 transition-all">
                  <Save size={18} /> KLİNİK ALGORİTMAYI GÜNCELLE
               </button>
            </div>
         </div>
      </div>

      <div className="xl:col-span-4 space-y-8 animate-in slide-in-from-right-6 duration-700">
         <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center gap-4 text-emerald-400">
               <BarChart3 size={24} />
               <h4 className="text-sm font-black uppercase tracking-widest italic">Klinik KPI Deck</h4>
            </div>
            
            <div className="space-y-8">
               <MetricItem label="Hasta Memnuniyeti" value="%98" color="text-emerald-400" icon={CheckCircle2} />
               <MetricItem label="Ort. İyileşme Hızı" value="3.4 Hf" color="text-white" icon={TrendingUp} />
               <MetricItem label="Protokol Uyumu" value="%92" color="text-cyan-400" icon={ShieldCheck} />
            </div>

            <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
               <div className="flex items-center gap-2 mb-2 text-amber-500">
                  <AlertCircle size={14} />
                  <span className="text-[9px] font-black uppercase">Sistem Notu</span>
               </div>
               <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  "Bu metrikler son 30 günün AI analiz verileriyle valide edilmiştir."
               </p>
            </div>
         </div>

         <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-6 shadow-2xl">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
               <Terminal size={14} /> Global Audit Log
            </h4>
            <div className="space-y-3">
               <LogMini time="10:22" user="System" msg="Dozaj limitleri güncellendi." />
               <LogMini time="11:45" user="Admin" msg="Yeni görev enjekte edildi." />
               <LogMini time="12:00" user="AI" msg="Risk analizi tamamlandı." />
            </div>
         </div>
      </div>
    </>
  );
};

const MetricItem = ({ label, value, color, icon: Icon }: any) => (
  <div className="flex justify-between items-center group/metric cursor-default">
     <div className="flex items-center gap-3">
        <Icon size={16} className="text-slate-700 group-hover/metric:text-cyan-400 transition-colors" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
     </div>
     <span className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</span>
  </div>
);

const LogMini = ({ time, user, msg }: any) => (
  <div className="flex items-center gap-3 px-3 py-2 bg-slate-950 rounded-lg border border-slate-900">
     <span className="text-[8px] font-mono text-slate-700">{time}</span>
     <span className="text-[8px] font-black text-cyan-500 uppercase">{user}</span>
     <span className="text-[9px] text-slate-500 italic truncate">{msg}</span>
  </div>
);
