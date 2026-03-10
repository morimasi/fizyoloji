import React, { useState } from 'react';
import { 
  BrainCircuit, Activity, Eye, Layout, 
  ShieldCheck, Zap, Settings2, Target,
  Sparkles, Layers, Sliders, CheckCircle2
} from 'lucide-react';
import { AdaptiveProfile } from './types.ts';

export const MultidisciplinaryHub = () => {
  const [activeTab, setActiveTab] = useState<'physio' | 'special-ed' | 'visual' | 'dev'>('physio');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<AdaptiveProfile>({
    romLimits: { omuz: 120, diz: 90 },
    rpeTarget: 6,
    postureFlags: ['Kifoz', 'Anterior Pelvic Tilt'],
    cognitiveLoadLevel: 'Düşük',
    sensoryProfile: 'Hassas',
    learningStyle: 'Görsel',
    stepByStepMode: true,
    visualContrast: 'Yüksek',
    animationSpeed: 'Normal (24FPS)',
    uiComplexity: 'Basit'
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
            <BrainCircuit className="text-cyan-500" size={36} />
            Multidisipliner <span className="text-cyan-500">Stüdyo</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Klinik Fizyoterapi, Özel Eğitim, Görsel Tasarım ve Yazılım Mimarisi entegrasyon paneli.
          </p>
        </div>
        <button 
          onClick={handleSave}
          className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${
            saved 
              ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
              : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:scale-105'
          }`}
        >
          {saved ? <><CheckCircle2 size={16} /> KAYDEDİLDİ</> : <><ShieldCheck size={16} /> PROFİLİ GÜNCELLE</>}
        </button>
      </div>

      {/* 4 Pillars Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TabButton 
          active={activeTab === 'physio'} 
          onClick={() => setActiveTab('physio')}
          icon={Activity} 
          title="Klinik Fizyoterapi" 
          desc="Biyomekanik & Dozaj"
          color="emerald"
        />
        <TabButton 
          active={activeTab === 'special-ed'} 
          onClick={() => setActiveTab('special-ed')}
          icon={BrainCircuit} 
          title="Özel Eğitim" 
          desc="Bilişsel Yük & Nöroçeşitlilik"
          color="purple"
        />
        <TabButton 
          active={activeTab === 'visual'} 
          onClick={() => setActiveTab('visual')}
          icon={Eye} 
          title="Görsel & Animasyon" 
          desc="24 FPS & UI/UX"
          color="amber"
        />
        <TabButton 
          active={activeTab === 'dev'} 
          onClick={() => setActiveTab('dev')}
          icon={Layout} 
          title="Yazılım Mimarisi" 
          desc="React/TS & Stabilite"
          color="cyan"
        />
      </div>

      {/* Content Area */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-6 md:p-10 shadow-2xl">
        
        {activeTab === 'physio' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 text-emerald-400 mb-6">
              <Activity size={24} />
              <h2 className="text-xl font-black uppercase tracking-widest">Kanıta Dayalı Egzersiz Reçetelendirme</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hedef RPE (Zorluk Derecesi)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="10" 
                    value={profile.rpeTarget}
                    onChange={(e) => setProfile({...profile, rpeTarget: parseInt(e.target.value)})}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-2xl font-black text-emerald-400">{profile.rpeTarget}/10</span>
                </div>
                <p className="text-[10px] text-slate-500 italic">Borg Skalasına göre doku toleransı ve güvenli hareket sınırı.</p>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Postür & Güvenlik Bayrakları</label>
                <div className="flex flex-wrap gap-2">
                  {['Kifoz', 'Skolyoz', 'Anterior Pelvic Tilt', 'Omuz İmpingement'].map(flag => (
                    <button 
                      key={flag}
                      onClick={() => {
                        const flags = profile.postureFlags.includes(flag) 
                          ? profile.postureFlags.filter(f => f !== flag)
                          : [...profile.postureFlags, flag];
                        setProfile({...profile, postureFlags: flags});
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                        profile.postureFlags.includes(flag)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'special-ed' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 text-purple-400 mb-6">
              <BrainCircuit size={24} />
              <h2 className="text-xl font-black uppercase tracking-widest">Nöro-Kapsayıcı Etkileşim Tasarımı</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <SelectCard 
                label="Bilişsel Yük Seviyesi"
                value={profile.cognitiveLoadLevel}
                options={['Düşük', 'Orta', 'Yüksek']}
                onChange={(v) => setProfile({...profile, cognitiveLoadLevel: v as any})}
                color="purple"
              />
              <SelectCard 
                label="Duyusal Profil"
                value={profile.sensoryProfile}
                options={['Hassas', 'Normal', 'Arayışta']}
                onChange={(v) => setProfile({...profile, sensoryProfile: v as any})}
                color="purple"
              />
              <SelectCard 
                label="Öğrenme Stili"
                value={profile.learningStyle}
                options={['Görsel', 'İşitsel', 'Kinestetik']}
                onChange={(v) => setProfile({...profile, learningStyle: v as any})}
                color="purple"
              />
            </div>

            <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-purple-300">Adım Adım Öğrenme (Micro-Learning)</h4>
                <p className="text-xs text-purple-400/70 mt-1">Karmaşık motor becerileri küçük, yönetilebilir parçalara böler.</p>
              </div>
              <button 
                onClick={() => setProfile({...profile, stepByStepMode: !profile.stepByStepMode})}
                className={`w-14 h-8 rounded-full transition-colors relative ${profile.stepByStepMode ? 'bg-purple-500' : 'bg-slate-700'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${profile.stepByStepMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 text-amber-400 mb-6">
              <Eye size={24} />
              <h2 className="text-xl font-black uppercase tracking-widest">Sinematik Akıcılık & Görsel Hiyerarşi</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <SelectCard 
                  label="Animasyon Motoru (Zero-Jitter)"
                  value={profile.animationSpeed}
                  options={['Yavaş', 'Normal (24FPS)', 'Hızlı']}
                  onChange={(v) => setProfile({...profile, animationSpeed: v as any})}
                  color="amber"
                />
                <p className="text-xs text-slate-400 italic border-l-2 border-amber-500/50 pl-3">
                  "24 FPS sinematik akıcılıkta egzersiz animasyonları. Gravity-Lock algoritması ile merkez noktası sabitlenir."
                </p>
              </div>

              <div className="space-y-6">
                <SelectCard 
                  label="Arayüz Karmaşıklığı (UI/UX)"
                  value={profile.uiComplexity}
                  options={['Basit', 'Standart', 'Uzman']}
                  onChange={(v) => setProfile({...profile, uiComplexity: v as any})}
                  color="amber"
                />
                <SelectCard 
                  label="Görsel Kontrast (Erişilebilirlik)"
                  value={profile.visualContrast}
                  options={['Düşük', 'Normal', 'Yüksek']}
                  onChange={(v) => setProfile({...profile, visualContrast: v as any})}
                  color="amber"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dev' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-3 text-cyan-400 mb-6">
              <Layout size={24} />
              <h2 className="text-xl font-black uppercase tracking-widest">Performanslı Sistem Tasarımı</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">React Component Tree</span>
                  <span className="text-xs font-black text-emerald-400">Optimize Edildi</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[95%]" />
                </div>
                <p className="text-[10px] text-slate-400">Gereksiz render'lar önlendi, memoization uygulandı.</p>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">State Management</span>
                  <span className="text-xs font-black text-cyan-400">Stabil</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[100%]" />
                </div>
                <p className="text-[10px] text-slate-400">TypeScript interface'leri ile tip güvenliği sağlandı.</p>
              </div>
            </div>

            <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
              <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2"><Zap size={16}/> Mimari Notlar</h4>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                <li>Modüler bileşen mimarisi (Separation of Concerns).</li>
                <li>Hata ayıklama (Error Boundaries) ve graceful degradation.</li>
                <li>Asenkron veri akışları için Suspense ve lazy loading.</li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, title, desc, color }: any) => {
  const colorMap: any = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20',
  };
  const activeColorMap: any = {
    emerald: 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    purple: 'bg-purple-500 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    amber: 'bg-amber-500 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    cyan: 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 md:p-6 rounded-2xl border text-left transition-all duration-300 ${active ? activeColorMap[color] : colorMap[color]}`}
    >
      <Icon size={24} className="mb-3" />
      <h3 className="font-black text-sm uppercase tracking-wider">{title}</h3>
      <p className={`text-[10px] mt-1 ${active ? 'text-white/80' : 'opacity-70'}`}>{desc}</p>
    </button>
  );
};

const SelectCard = ({ label, value, options, onChange, color }: any) => {
  const accentMap: any = {
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex flex-col gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`p-3 rounded-xl text-xs font-bold transition-all text-left border ${
              value === opt 
                ? accentMap[color]
                : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
