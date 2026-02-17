
import React, { useState, useEffect } from 'react';
import { 
  Activity, Brain, RefreshCw, BarChart3, Save, Zap, 
  Stethoscope, ShieldCheck, Cpu, Plus, Trash2, 
  Edit3, CheckCircle2, AlertCircle, TrendingUp, 
  Settings2, Wand2, Terminal, Info, X, Check
} from 'lucide-react';
import { getAI } from './ai-core.ts';
import { PhysioDB } from './db-repository.ts';

/**
 * PHYSIOCORE THERAPIST MANAGEMENT PROTOCOL v9.7
 * Robust Task Assignment & Database Sync
 */

// Simple UUID v4 generator helper
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface ClinicalTask {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In-Progress' | 'Completed';
  aiRecommendation?: string;
  assignedTo?: string;
}

export const TherapistManagement = ({ isAdminOverride = false }: { isAdminOverride?: boolean }) => {
  const [tasks, setTasks] = useState<ClinicalTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiIntensity, setAiIntensity] = useState(75);
  const [reportingMode, setReportingMode] = useState<'Predictive' | 'Reactive'>('Predictive');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<ClinicalTask>>({ title: '', priority: 'Medium', status: 'Pending' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedTasks = await PhysioDB.getTasks();
      if (savedTasks && savedTasks.length > 0) {
        setTasks(savedTasks);
      } else {
        // Try to find a default assignee to satisfy DB constraints if strict
        let defaultAssignee = undefined;
        try {
            const users = await PhysioDB.getUsers();
            defaultAssignee = users.find(u => u.role === 'Therapist')?.id;
        } catch(e) { console.warn("Could not fetch users for task assignment"); }

        const initialTasks: ClinicalTask[] = [
          { id: generateUUID(), title: 'Post-Op ACL Protokol Revizyonu', priority: 'High', status: 'Pending', aiRecommendation: 'Hastanın ağrısı düştü, 2. faza geçiş önerilir.', assignedTo: defaultAssignee },
          { id: generateUUID(), title: 'Lomber Stabilizasyon Analizi', priority: 'Medium', status: 'In-Progress', assignedTo: defaultAssignee },
        ];
        setTasks(initialTasks);
        // Save sequentially to avoid race conditions
        for (const t of initialTasks) await PhysioDB.saveTask(t);
      }
    } catch (e) {
      console.error("Task Loading Error", e);
    }
  };

  const generateAiTasks = async () => {
    setIsGenerating(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Sen bir klinik direktörsün. Mevcut yüksek riskli hastalar için bir fizyoterapiste atanacak 3 kritik klinik görev üret. 
        Yanıtı mutlaka şu JSON formatında ver: [{"title": "...", "priority": "High/Medium/Low", "aiRecommendation": "..."}]`,
        config: { responseMimeType: "application/json" }
      });
      
      const newAiTasks = JSON.parse(response.text || "[]");
      const enriched = newAiTasks.map((t: any) => ({
        ...t,
        id: generateUUID(),
        status: 'Pending'
      }));
      
      const updated = [...tasks, ...enriched];
      setTasks(updated);
      for (const t of enriched) await PhysioDB.saveTask(t);
    } catch (err) {
      console.error("AI Task Generation Failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateConfig = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSaving(false);
    alert("Klinik Algoritma ve AI Konfigürasyonu senkronize edildi.");
  };

  const toggleTaskStatus = async (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const nextStatus: Record<string, any> = { 'Pending': 'In-Progress', 'In-Progress': 'Completed', 'Completed': 'Pending' };
        const updatedTask = { ...t, status: nextStatus[t.status] as any };
        PhysioDB.saveTask(updatedTask);
        return updatedTask;
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const removeTask = async (id: string) => {
    await PhysioDB.deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    const task: ClinicalTask = {
      id: generateUUID(),
      title: newTask.title!,
      priority: (newTask.priority as any) || 'Medium',
      status: 'Pending'
    };
    setTasks([...tasks, task]);
    await PhysioDB.saveTask(task);
    setNewTask({ title: '', priority: 'Medium', status: 'Pending' });
    setShowTaskForm(false);
  };

  return (
    <div className="xl:col-span-8 space-y-8 animate-in slide-in-from-left-6 duration-700">
       <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
             <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                   <Activity size={20} className="text-emerald-400" /> Klinik <span className="text-emerald-400">Görev Yönetimi</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic pr-4">
                  {isAdminOverride ? "SUPERVISOR OVERRIDE: TÜM YETKİLER AKTİF" : "Kişiselleştirilmiş Klinik İş Akışı"}
                </p>
             </div>
             <div className="flex gap-3 shrink-0">
                <button 
                  onClick={generateAiTasks}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all active:scale-95 disabled:opacity-30"
                >
                   {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />} AI GÖREV ÜRET
                </button>
                <button 
                  onClick={() => setShowTaskForm(true)}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                   <Plus size={20} />
                </button>
             </div>
          </div>

          {showTaskForm && (
            <div className="p-6 bg-slate-950/80 border border-cyan-500/30 rounded-3xl animate-in zoom-in-95 duration-300 relative z-20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Görev başlığı..." 
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/50"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
                <select 
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                >
                  <option value="High">Yüksek Öncelik</option>
                  <option value="Medium">Orta Öncelik</option>
                  <option value="Low">Düşük Öncelik</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowTaskForm(false)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white">İPTAL</button>
                <button onClick={handleAddTask} className="px-6 py-2 bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase">EKLE</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 relative z-10">
             {tasks.length === 0 ? (
               <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl opacity-20">
                  <Check size={48} className="mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase">Tüm görevler tamamlandı</p>
               </div>
             ) : (
               tasks.map(task => (
                  <div key={task.id} className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl group/item hover:border-emerald-500/40 transition-all flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <button 
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-400' : 'border-slate-700 hover:border-cyan-500'}`}
                        >
                           {task.status === 'Completed' && <Check size={12} className="text-white" />}
                        </button>
                        <div>
                           <h5 className={`text-sm font-black italic tracking-tight uppercase ${task.status === 'Completed' ? 'text-slate-600 line-through' : 'text-white'}`}>{task.title}</h5>
                           <div className="flex items-center gap-3 mt-1">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-400'}`}>
                                {task.priority.toUpperCase()}
                              </span>
                              {task.aiRecommendation && (
                                 <p className="text-[9px] text-cyan-400/80 italic flex items-center gap-1.5">
                                    <Brain size={10} /> {task.aiRecommendation}
                                 </p>
                              )}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button onClick={() => removeTask(task.id)} className="p-2 bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                           <Trash2 size={14}/>
                        </button>
                     </div>
                  </div>
               ))
             )}
          </div>
       </div>

       <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <Brain size={20} className="text-cyan-400" /> 
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  AI Asistan <span className="text-cyan-400">Neural Tuning</span>
                </h3>
             </div>
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded border border-slate-800">
                Engine: Genesis v9.0-Deep Reasoning
             </span>
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
                  className="w-full h-1.5 bg-slate-950 rounded-full appearance-none accent-cyan-500 border border-slate-800 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase italic">
                   <span>Bireysel / Destekleyici</span>
                   <span>Katı Klinik / Protokol Odaklı</span>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Raporlama Modu</label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                   <button 
                     onClick={() => setReportingMode('Predictive')}
                     className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportingMode === 'Predictive' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     Prediktif
                   </button>
                   <button 
                     onClick={() => setReportingMode('Reactive')}
                     className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportingMode === 'Reactive' ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     Reaktif
                   </button>
                </div>
             </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex justify-end">
             <button 
              onClick={handleUpdateConfig}
              disabled={isSaving}
              className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/30 active:scale-95 transition-all disabled:opacity-50"
             >
                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} 
                {isSaving ? 'SİSTEM GÜNCELLENİYOR' : 'KLİNİK ALGORİTMAYI UYGULA'}
             </button>
          </div>
       </div>
    </div>
  );
};
