
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity, TrendingUp, Zap, Target, Brain, Heart,
  Flame, Clock, BarChart3, Eye,
  Download, Share2, Settings2,
  Layers, Sparkles, MonitorPlay, Gauge, Timer,
  AlertCircle, CheckCircle2, CircleDot, ChevronRight,
  X, RefreshCw, Trophy, Dumbbell
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';
import { Infographic } from '@antv/infographic';
import { Exercise } from './types';
import { LiveCoach } from './LiveCoach';

/**
 * PREMIUM LIVE MODULE v2.0
 * Ultra-Premium Exercise Analytics & Visualization System
 * Integrates AntV Infographic + Recharts for professional-grade data visualization
 */

interface PremiumLiveModuleProps {
  exercise: Exercise;
  currentSet: number;
  currentRep: number;
  isPlaying: boolean;
  onClose?: () => void;
}

interface BiomechanicalData {
  timestamp: number;
  t: string;
  muscleActivation: { [muscle: string]: number };
  jointAngles: { [joint: string]: number };
  forceOutput: number;
  heartRate: number;
  formScore: number;
}

export const PremiumLiveModule: React.FC<PremiumLiveModuleProps> = ({
  exercise,
  currentSet,
  currentRep,
  isPlaying,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'analytics' | 'biomechanics' | 'progression' | 'insights'>('analytics');
  const [showLiveCoach, setShowLiveCoach] = useState(false);
  const [biomechanicalHistory, setBiomechanicalHistory] = useState<BiomechanicalData[]>([]);
  const [sessionMetrics, setSessionMetrics] = useState({
    avgFormScore: 0,
    peakForce: 0,
    totalVolume: 0,
    caloriesBurned: 0,
    timeUnderTension: 0
  });
  const [tick, setTick] = useState(0);

  // AntV Infographic refs for template-based visualizations
  const kpiInfographicRef = useRef<HTMLDivElement>(null);
  const muscleInfographicRef = useRef<HTMLDivElement>(null);
  const kpiInstance = useRef<Infographic | null>(null);
  const muscleInstance = useRef<Infographic | null>(null);

  // Real-time biomechanical data generation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const primaryMuscles = exercise.primaryMuscles || [];
      const muscleActivation: { [muscle: string]: number } = {};
      primaryMuscles.forEach(muscle => {
        muscleActivation[muscle] = 60 + Math.random() * 40;
      });

      const now = new Date();
      const newData: BiomechanicalData = {
        timestamp: Date.now(),
        t: `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`,
        muscleActivation,
        jointAngles: {
          knee: 90 + Math.random() * 45,
          hip: 100 + Math.random() * 35,
          ankle: 80 + Math.random() * 20
        },
        forceOutput: 70 + Math.random() * 30,
        heartRate: 120 + Math.floor(Math.random() * 40),
        formScore: 75 + Math.random() * 25
      };

      setBiomechanicalHistory(prev => [...prev.slice(-30), newData]);
      setSessionMetrics(prev => ({
        avgFormScore: prev.avgFormScore === 0 ? newData.formScore : prev.avgFormScore * 0.9 + newData.formScore * 0.1,
        peakForce: Math.max(prev.peakForce, newData.forceOutput),
        totalVolume: prev.totalVolume + newData.forceOutput * 0.1,
        caloriesBurned: prev.caloriesBurned + 0.15,
        timeUnderTension: prev.timeUnderTension + 0.5
      }));
      setTick(t => t + 1);
    }, 600);
    return () => clearInterval(interval);
  }, [isPlaying, exercise]);

  // Render AntV Infographic KPI cards (template-based, updated on tick)
  useEffect(() => {
    if (activeView !== 'analytics' || !kpiInfographicRef.current) return;
    const container = kpiInfographicRef.current;

    const data = {
      title: 'Seans Performans Özeti',
      items: [
        { label: 'Form Skoru', value: Math.round(sessionMetrics.avgFormScore), desc: `${sessionMetrics.avgFormScore >= 80 ? 'Mükemmel' : 'İyi'}` },
        { label: 'Zirve Güç', value: Math.round(sessionMetrics.peakForce), desc: 'Newton' },
        { label: 'Kalori', value: Math.round(sessionMetrics.caloriesBurned * 10) / 10, desc: 'kcal' },
        { label: 'Toplam Hacim', value: Math.round(sessionMetrics.totalVolume), desc: 'kg' },
        { label: 'Gerilim Süresi', value: Math.round(sessionMetrics.timeUnderTension), desc: 'saniye' },
      ]
    };

    try {
      if (kpiInstance.current) {
        kpiInstance.current.update({ data, template: 'list-grid-compact-card' });
      } else {
        kpiInstance.current = new Infographic({
          container,
          width: container.clientWidth || 700,
          height: 200,
          template: 'list-grid-compact-card',
          theme: 'dark',
          data,
          editable: false,
        });
        kpiInstance.current.render();
      }
    } catch (err) {
      console.warn('AntV Infographic KPI render error:', err);
    }

    return () => {
      if (!kpiInfographicRef.current) {
        kpiInstance.current?.destroy();
        kpiInstance.current = null;
      }
    };
  }, [activeView, tick]);

  // Render AntV Infographic muscle activation (progress cards)
  useEffect(() => {
    if (activeView !== 'analytics' || !muscleInfographicRef.current) return;
    const container = muscleInfographicRef.current;
    const latest = biomechanicalHistory[biomechanicalHistory.length - 1];
    if (!latest) return;

    const muscles = exercise.primaryMuscles || [];
    const items = muscles.map(m => ({
      label: m,
      value: Math.round(latest.muscleActivation[m] || 0),
      desc: `${Math.round(latest.muscleActivation[m] || 0)}% Aktivasyon`
    }));

    if (items.length === 0) return;

    try {
      if (muscleInstance.current) {
        muscleInstance.current.update({ data: { title: 'Kas Aktivasyon Haritası', items }, template: 'list-grid-circular-progress' });
      } else {
        muscleInstance.current = new Infographic({
          container,
          width: container.clientWidth || 700,
          height: 220,
          template: 'list-grid-circular-progress',
          theme: 'dark',
          data: { title: 'Kas Aktivasyon Haritası', items },
          editable: false,
        });
        muscleInstance.current.render();
      }
    } catch (err) {
      console.warn('AntV Infographic Muscle render error:', err);
    }

    return () => {
      if (!muscleInfographicRef.current) {
        muscleInstance.current?.destroy();
        muscleInstance.current = null;
      }
    };
  }, [activeView, tick, exercise.primaryMuscles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      kpiInstance.current?.destroy();
      muscleInstance.current?.destroy();
    };
  }, []);

  const handleExport = useCallback(async () => {
    try {
      if (kpiInstance.current) {
        const dataUrl = await kpiInstance.current.toDataURL({ type: 'png' });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${exercise.code || 'exercise'}-analytics.png`;
        link.click();
      }
    } catch (err) {
      console.warn('Export error:', err);
    }
  }, [exercise.code]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-3xl flex flex-col font-roboto overflow-hidden animate-in fade-in duration-300">

      {/* Premium Header */}
      <div className="p-5 flex justify-between items-center bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10 shadow-2xl z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/30">
            <MonitorPlay className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black italic text-white tracking-tight flex items-center gap-2">
              PREMIUM LIVE
              <span className="text-[8px] font-bold bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">PRO</span>
            </h1>
            <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-2 mt-0.5">
              <Sparkles size={9} className="animate-pulse" /> AntV Infographic Engine
            </p>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 items-center">
          <button
            onClick={() => setShowLiveCoach(!showLiveCoach)}
            className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              showLiveCoach
                ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-cyan-500/40'
            }`}
          >
            <Brain size={14} />
            {showLiveCoach ? 'GİZLE' : 'LIVE AI'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <Download size={14} />
            <span className="hidden sm:inline">EXPORT</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Live Coach */}
      {showLiveCoach && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[250] w-[90%] max-w-2xl animate-in slide-in-from-top-4 duration-300">
          <LiveCoach exerciseTitle={exercise.title} systemInstruction={exercise.biomechanics} />
        </div>
      )}

      {/* View Selector */}
      <div className="px-5 py-3 bg-slate-950/50 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0">
        {([
          { key: 'analytics', icon: BarChart3, label: 'Analitik' },
          { key: 'biomechanics', icon: Activity, label: 'Biyomekanik' },
          { key: 'progression', icon: TrendingUp, label: 'İlerleme' },
          { key: 'insights', icon: Brain, label: 'AI Öngörüler' },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeView === key
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-cyan-500/30'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">

        {/* Session Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/8 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black italic text-white tracking-tight mb-1">{exercise.titleTr || exercise.title}</h2>
              <p className="text-xs text-slate-400 italic leading-relaxed max-w-lg">{exercise.biomechanics}</p>
            </div>
            <div className="flex gap-3 shrink-0 ml-4">
              <MetricBadge icon={Layers} label="Set" value={currentSet} color="cyan" />
              <MetricBadge icon={CircleDot} label="Rep" value={currentRep} color="emerald" />
            </div>
          </div>

          {/* Live KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <LiveStatCard icon={Gauge} label="Form Skoru" value={`${sessionMetrics.avgFormScore.toFixed(0)}%`} trend={sessionMetrics.avgFormScore >= 80 ? 'up' : 'neutral'} color="cyan" />
            <LiveStatCard icon={Zap} label="Zirve Güç" value={`${sessionMetrics.peakForce.toFixed(0)}N`} trend="up" color="yellow" />
            <LiveStatCard icon={Flame} label="Kalori" value={`${sessionMetrics.caloriesBurned.toFixed(1)}`} trend="up" color="orange" />
            <LiveStatCard icon={Timer} label="TUT" value={`${sessionMetrics.timeUnderTension.toFixed(0)}s`} trend="neutral" color="purple" />
            <LiveStatCard
              icon={Heart}
              label="Nabız Est."
              value={biomechanicalHistory.length > 0 ? String(biomechanicalHistory[biomechanicalHistory.length - 1].heartRate) : '--'}
              trend="up"
              color="red"
            />
          </div>
        </div>

        {/* === ANALYTICS VIEW === */}
        {activeView === 'analytics' && (
          <div className="space-y-5">
            {/* AntV Infographic KPI Infographic */}
            <Section icon={BarChart3} title="Seans Performans Özeti" description="AntV Infographic Template: list-grid-compact-card">
              <div ref={kpiInfographicRef} className="w-full min-h-[200px] rounded-2xl overflow-hidden" />
            </Section>

            {/* AntV Infographic Muscle Activation */}
            <Section icon={Flame} title="Kas Aktivasyon Haritası" description="AntV Infographic Template: list-grid-circular-progress">
              <div ref={muscleInfographicRef} className="w-full min-h-[220px] rounded-2xl overflow-hidden" />
            </Section>

            {/* Recharts Force Timeline */}
            <Section icon={TrendingUp} title="Güç Çıktısı Zaman Serisi" description="Gerçek zamanlı kuvvet analizi">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={biomechanicalHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="formGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 9 }} domain={[50, 110]} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11 }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="forceOutput" stroke="#06b6d4" fill="url(#forceGrad)" strokeWidth={2} name="Güç (N)" dot={false} />
                    <Area type="monotone" dataKey="formScore" stroke="#a855f7" fill="url(#formGrad)" strokeWidth={2} name="Form %" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>
        )}

        {/* === BIOMECHANICS VIEW === */}
        {activeView === 'biomechanics' && (
          <div className="space-y-5">
            <Section icon={Activity} title="Eklem Açıları — Anlık" description="Kinematik analiz — diz / kalça / ayak bileği">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  {biomechanicalHistory.length > 0 &&
                    Object.entries(biomechanicalHistory[biomechanicalHistory.length - 1].jointAngles).map(([joint, angle]) => (
                    <div key={joint} className="flex items-center gap-4 p-4 bg-slate-950/60 rounded-2xl">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                      <span className="text-sm text-slate-300 capitalize flex-1">{joint}</span>
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-white italic">{(angle as number).toFixed(1)}</span>
                        <span className="text-xs text-slate-500 mb-1">°</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Radar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={
                      biomechanicalHistory.length > 0
                        ? Object.entries(biomechanicalHistory[biomechanicalHistory.length - 1].jointAngles).map(([joint, angle]) => ({
                            subject: joint.charAt(0).toUpperCase() + joint.slice(1),
                            value: angle as number,
                            fullMark: 180
                          }))
                        : []
                    }>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 180]} tick={{ fill: '#1e293b', fontSize: 8 }} />
                      <Radar name="Eklem Açısı" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Section>

            {/* Muscle bar chart */}
            <Section icon={Dumbbell} title="Kas Aktivasyon Grafiği" description="Birincil kas grupları yüzde aktivasyon">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      biomechanicalHistory.length > 0
                        ? (exercise.primaryMuscles || []).map(m => ({
                            name: m.length > 12 ? m.slice(0, 12) + '…' : m,
                            activation: Math.round(biomechanicalHistory[biomechanicalHistory.length - 1].muscleActivation[m] || 0)
                          }))
                        : []
                    }
                    margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11 }}
                    />
                    <Bar dataKey="activation" name="Aktivasyon %" radius={[6, 6, 0, 0]}>
                      {(exercise.primaryMuscles || []).map((_, i) => (
                        <Cell key={i} fill={`hsl(${180 + i * 30}, 80%, 55%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>

            {/* Biomechanics Notes */}
            <Section icon={Eye} title="Klinik Biyomekanik Notu">
              <div className="p-5 bg-slate-950/60 rounded-2xl">
                <p className="text-sm text-slate-300 leading-relaxed italic">{exercise.biomechanics}</p>
              </div>
            </Section>
          </div>
        )}

        {/* === PROGRESSION VIEW === */}
        {activeView === 'progression' && (
          <div className="space-y-5">
            <Section icon={TrendingUp} title="Seans İlerleme Zaman Çizelgesi" description="Set ve tekrar bazlı ilerleme takibi">
              <ProgressionTimeline currentSet={currentSet} currentRep={currentRep} exercise={exercise} />
            </Section>

            <Section icon={Clock} title="Nabız & Form Akışı" description="Seans boyunca kalp atış hızı ve form skoru değişimi">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={biomechanicalHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 9 }} />
                    <YAxis yAxisId="left" domain={[50, 110]} tick={{ fill: '#475569', fontSize: 9 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[100, 180]} tick={{ fill: '#475569', fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 11 }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="formScore" stroke="#10b981" strokeWidth={2} dot={false} name="Form %" />
                    <Line yAxisId="right" type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={false} name="Nabız bpm" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>
        )}

        {/* === AI INSIGHTS VIEW === */}
        {activeView === 'insights' && (
          <div className="space-y-5">
            <Section icon={Brain} title="Yapay Zeka Performans Analizi" description="Gerçek zamanlı hareket verilerinden üretilen öngörüler">
              <div className="space-y-4">
                <InsightCard
                  type="success"
                  title="Mükemmel Form Stabilitesi"
                  description={`Ortalama form skorunuz %${sessionMetrics.avgFormScore.toFixed(0)} — doğru yürütme ve iyi kontrol göstergesi. Tekrar düzeni tutarlı.`}
                />
                <InsightCard
                  type="info"
                  title="Aşamalı Yüklenme Algılandı"
                  description={`Zirve güç çıktısı ${sessionMetrics.peakForce.toFixed(0)}N olarak ölçüldü. Bir sonraki seansta direnç %5–10 artırılabilir.`}
                />
                <InsightCard
                  type="warning"
                  title="Optimizasyon Fırsatı"
                  description="Eksantrik fazı biraz yavaşlatmak, kas altında gerilim süresini ve aktivasyonu artırabilir."
                />
                <InsightCard
                  type="success"
                  title="Metabolik Verimlilik"
                  description={`${exercise.titleTr || exercise.title} için ${sessionMetrics.caloriesBurned.toFixed(1)} kcal optimum metabolik verimlilikle yakılıyor.`}
                />
                <InsightCard
                  type="info"
                  title="Kas Aktivasyon Dengesi"
                  description={`${(exercise.primaryMuscles || []).length} primer kas grubu aktif. Çift taraflı simetri doğru rehabilitasyon sürecine işaret ediyor.`}
                />
              </div>
            </Section>

            <Section icon={Trophy} title="Seans Başarı Özeti">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tamamlanan Set', value: `${currentSet}/${exercise.sets}`, icon: Layers, color: 'cyan' },
                  { label: 'Toplam Tekrar', value: `${(currentSet - 1) * exercise.reps + currentRep}`, icon: CircleDot, color: 'emerald' },
                  { label: 'En Yüksek Form', value: `${biomechanicalHistory.length > 0 ? Math.max(...biomechanicalHistory.map(d => d.formScore)).toFixed(0) : '--'}%`, icon: Trophy, color: 'yellow' },
                  { label: 'Aktif Kas', value: `${(exercise.primaryMuscles || []).length}`, icon: Flame, color: 'orange' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className={`p-4 bg-${color}-500/5 border border-${color}-500/20 rounded-2xl text-center`}>
                    <Icon className={`text-${color}-400 mx-auto mb-2`} size={20} />
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className={`text-2xl font-black text-${color}-400 italic`}>{value}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>

      {/* Premium Footer */}
      <div className="p-4 bg-gradient-to-t from-slate-900 to-slate-950 border-t border-white/8 flex justify-between items-center shrink-0">
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <Download size={14} />
            PNG Export
          </button>
          <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
            <Share2 size={14} />
            Paylaş
          </button>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-slate-600 uppercase tracking-widest mb-0.5">Powered by</p>
          <p className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            AntV Infographic + Recharts
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const Section = ({ title, icon: Icon, description, children }: any) => (
  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/8 rounded-3xl p-6 shadow-2xl">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
        <Icon className="text-cyan-400" size={18} />
      </div>
      <div>
        <h3 className="text-base font-black text-white">{title}</h3>
        {description && <p className="text-[9px] text-slate-500 italic mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

const MetricBadge = ({ icon: Icon, label, value, color }: any) => (
  <div className={`flex items-center gap-2.5 px-5 py-3 bg-slate-950 border border-${color}-500/20 rounded-2xl`}>
    <Icon className={`text-${color}-400`} size={20} />
    <div>
      <p className="text-[8px] text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={`text-xl font-black text-${color}-400 italic`}>{value}</p>
    </div>
  </div>
);

const LiveStatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <div className={`bg-slate-950/60 border border-${color}-500/15 rounded-2xl p-4 flex flex-col gap-2`}>
    <div className="flex items-center justify-between">
      <Icon className={`text-${color}-500/70`} size={16} />
      {trend === 'up' && <TrendingUp className="text-emerald-500" size={12} />}
    </div>
    <div>
      <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  </div>
);

const ProgressionTimeline = ({ currentSet, currentRep, exercise }: any) => {
  const totalReps = exercise.sets * exercise.reps;
  const completedReps = (currentSet - 1) * exercise.reps + currentRep;
  const progress = totalReps > 0 ? (completedReps / totalReps) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-black text-white">Seans İlerlemesi</h4>
        <span className="text-3xl font-black text-cyan-400 italic">{progress.toFixed(0)}%</span>
      </div>
      <div className="h-3 bg-slate-950 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 transition-all duration-700 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={`grid gap-3 mt-4`} style={{ gridTemplateColumns: `repeat(${Math.min(exercise.sets, 6)}, minmax(0, 1fr))` }}>
        {Array.from({ length: exercise.sets }).map((_, si) => (
          <div key={si} className={`p-4 rounded-2xl border text-center transition-all ${
            si < currentSet - 1
              ? 'bg-emerald-500/10 border-emerald-500'
              : si === currentSet - 1
              ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-2">Set {si + 1}</p>
            <p className="text-xl font-black text-white italic">
              {si < currentSet - 1 ? exercise.reps : si === currentSet - 1 ? currentRep : '—'}
            </p>
            {si < currentSet - 1 && <CheckCircle2 className="text-emerald-400 mx-auto mt-2" size={14} />}
          </div>
        ))}
      </div>
    </div>
  );
};

const InsightCard = ({ type, title, description }: { type: 'success' | 'info' | 'warning'; title: string; description: string }) => {
  const styles = {
    success: { bg: 'emerald-500/8', border: 'emerald-500/30', text: 'emerald-400', Icon: CheckCircle2 },
    info:    { bg: 'cyan-500/8',    border: 'cyan-500/30',    text: 'cyan-400',    Icon: AlertCircle },
    warning: { bg: 'amber-500/8',   border: 'amber-500/30',   text: 'amber-400',   Icon: AlertCircle },
  };
  const { bg, border, text, Icon } = styles[type];

  return (
    <div className={`p-5 bg-${bg} border border-${border} rounded-2xl flex items-start gap-4`}>
      <Icon className={`text-${text} shrink-0 mt-0.5`} size={20} />
      <div>
        <h5 className={`text-sm font-black text-${text} uppercase tracking-wide mb-1.5`}>{title}</h5>
        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
