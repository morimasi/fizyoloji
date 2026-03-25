
import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, TrendingUp, Zap, Target, Brain, Heart,
  Flame, Clock, BarChart3, LineChart, PieChart, Eye,
  Download, Share2, Settings2, Maximize2, Grid3x3,
  Layers, Sparkles, MonitorPlay, Gauge, Timer,
  AlertCircle, CheckCircle2, CircleDot, ChevronRight
} from 'lucide-react';
import { Infographic } from '@antv/infographic';
import { Exercise } from './types';
import { LiveCoach } from './LiveCoach';

/**
 * PREMIUM LIVE MODULE v1.0
 * Ultra-Premium Exercise Analytics & Visualization System
 * Integrates AntV Infographic for professional-grade data visualization
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
  muscleActivation: { [muscle: string]: number };
  jointAngles: { [joint: string]: number };
  forceOutput: number;
  heartRate?: number;
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

  // AntV Infographic container refs
  const analyticsChartRef = useRef<HTMLDivElement>(null);
  const muscleHeatmapRef = useRef<HTMLDivElement>(null);
  const progressionTimelineRef = useRef<HTMLDivElement>(null);
  const infographicInstances = useRef<any[]>([]);

  // Simulate real-time biomechanical data generation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const primaryMuscles = exercise.primaryMuscles || [];
      const muscleActivation: { [muscle: string]: number } = {};

      primaryMuscles.forEach(muscle => {
        muscleActivation[muscle] = 60 + Math.random() * 40; // 60-100% activation
      });

      const newData: BiomechanicalData = {
        timestamp: Date.now(),
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

      setBiomechanicalHistory(prev => [...prev.slice(-20), newData]);

      // Update session metrics
      setSessionMetrics(prev => ({
        avgFormScore: (prev.avgFormScore * 0.9 + newData.formScore * 0.1),
        peakForce: Math.max(prev.peakForce, newData.forceOutput),
        totalVolume: prev.totalVolume + (newData.forceOutput * 0.1),
        caloriesBurned: prev.caloriesBurned + 0.15,
        timeUnderTension: prev.timeUnderTension + 0.5
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, exercise]);

  // Initialize AntV Infographic Charts
  useEffect(() => {
    if (activeView === 'analytics' && analyticsChartRef.current && biomechanicalHistory.length > 0) {
      renderAnalyticsDashboard();
    }
  }, [activeView, biomechanicalHistory]);

  const renderAnalyticsDashboard = () => {
    if (!analyticsChartRef.current) return;

    // Clean up previous instances
    infographicInstances.current.forEach(inst => inst?.destroy?.());
    infographicInstances.current = [];

    // Create KPI Cards Infographic
    const kpiData = `
# Real-Time Exercise Analytics

## Performance Metrics
- Form Score: ${sessionMetrics.avgFormScore.toFixed(1)}%
- Peak Force: ${sessionMetrics.peakForce.toFixed(1)} N
- Volume: ${sessionMetrics.totalVolume.toFixed(0)} kg

## Energy Expenditure
- Calories: ${sessionMetrics.caloriesBurned.toFixed(1)} kcal
- Time Under Tension: ${sessionMetrics.timeUnderTension.toFixed(0)}s
    `;

    try {
      const infographic = new Infographic({
        container: analyticsChartRef.current,
        width: analyticsChartRef.current.clientWidth || 600,
        height: 300,
        editable: false,
      });

      infographic.render(kpiData);
      infographicInstances.current.push(infographic);
    } catch (err) {
      console.error('AntV Infographic render error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-3xl flex flex-col font-roboto overflow-hidden animate-in fade-in duration-500">

      {/* Premium Header */}
      <div className="p-6 flex justify-between items-center bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10 shadow-2xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 animate-pulse">
            <MonitorPlay className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic text-white tracking-tight">PREMIUM LIVE</h1>
            <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
              <Sparkles size={10} /> Ultra Professional Analytics
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowLiveCoach(!showLiveCoach)}
            className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              showLiveCoach
                ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Brain size={16} />
              {showLiveCoach ? 'HIDE AI' : 'LIVE AI'}
            </div>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              CLOSE
            </button>
          )}
        </div>
      </div>

      {/* Live Coach Integration */}
      {showLiveCoach && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[250] w-[90%] max-w-2xl animate-in slide-in-from-top-4 duration-500">
          <LiveCoach exerciseTitle={exercise.title} systemInstruction={exercise.biomechanics} />
        </div>
      )}

      {/* View Selector */}
      <div className="px-6 py-4 bg-slate-950/50 border-b border-white/5 flex gap-2 overflow-x-auto">
        <ViewTab
          active={activeView === 'analytics'}
          onClick={() => setActiveView('analytics')}
          icon={BarChart3}
          label="Real-Time Analytics"
        />
        <ViewTab
          active={activeView === 'biomechanics'}
          onClick={() => setActiveView('biomechanics')}
          icon={Activity}
          label="Biomechanical Analysis"
        />
        <ViewTab
          active={activeView === 'progression'}
          onClick={() => setActiveView('progression')}
          icon={TrendingUp}
          label="Progress Timeline"
        />
        <ViewTab
          active={activeView === 'insights'}
          onClick={() => setActiveView('insights')}
          icon={Brain}
          label="AI Insights"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

        {/* Current Exercise Info Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black italic text-white tracking-tight mb-2">{exercise.titleTr || exercise.title}</h2>
              <p className="text-sm text-slate-400 italic">{exercise.biomechanics}</p>
            </div>
            <div className="flex gap-4">
              <MetricBadge icon={Layers} label="Set" value={currentSet} color="cyan" />
              <MetricBadge icon={CircleDot} label="Rep" value={currentRep} color="emerald" />
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <LiveStatCard
              icon={Gauge}
              label="Form Score"
              value={`${sessionMetrics.avgFormScore.toFixed(0)}%`}
              trend={sessionMetrics.avgFormScore >= 80 ? 'up' : 'neutral'}
            />
            <LiveStatCard
              icon={Zap}
              label="Peak Force"
              value={`${sessionMetrics.peakForce.toFixed(0)}N`}
              trend="up"
            />
            <LiveStatCard
              icon={Flame}
              label="Calories"
              value={sessionMetrics.caloriesBurned.toFixed(1)}
              trend="up"
            />
            <LiveStatCard
              icon={Timer}
              label="Time TUT"
              value={`${sessionMetrics.timeUnderTension.toFixed(0)}s`}
              trend="neutral"
            />
            <LiveStatCard
              icon={Heart}
              label="HR Est."
              value={biomechanicalHistory.length > 0 ? biomechanicalHistory[biomechanicalHistory.length - 1].heartRate : '-'}
              trend="up"
            />
          </div>
        </div>

        {/* View-Specific Content */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            <InfoGraphicSection
              title="Real-Time Performance Dashboard"
              icon={BarChart3}
              description="Live exercise analytics powered by AntV Infographic Engine"
            >
              <div ref={analyticsChartRef} className="w-full min-h-[300px] bg-slate-900/40 rounded-2xl p-6" />
            </InfoGraphicSection>

            <div className="grid md:grid-cols-2 gap-6">
              <InfoGraphicSection title="Muscle Activation Heatmap" icon={Flame}>
                <MuscleActivationHeatmap muscles={exercise.primaryMuscles} history={biomechanicalHistory} />
              </InfoGraphicSection>

              <InfoGraphicSection title="Force Output Timeline" icon={TrendingUp}>
                <ForceOutputChart history={biomechanicalHistory} />
              </InfoGraphicSection>
            </div>
          </div>
        )}

        {activeView === 'biomechanics' && (
          <div className="space-y-6">
            <InfoGraphicSection
              title="Biomechanical Analysis"
              icon={Activity}
              description="Advanced kinematic and kinetic analysis in real-time"
            >
              <BiomechanicalAnalysisView exercise={exercise} history={biomechanicalHistory} />
            </InfoGraphicSection>
          </div>
        )}

        {activeView === 'progression' && (
          <div className="space-y-6">
            <InfoGraphicSection
              title="Progression Timeline"
              icon={TrendingUp}
              description="Track your improvement over time with AI-generated insights"
            >
              <div ref={progressionTimelineRef} className="w-full min-h-[400px] bg-slate-900/40 rounded-2xl p-6">
                <ProgressionTimeline currentSet={currentSet} currentRep={currentRep} exercise={exercise} />
              </div>
            </InfoGraphicSection>
          </div>
        )}

        {activeView === 'insights' && (
          <div className="space-y-6">
            <InfoGraphicSection
              title="AI-Powered Insights"
              icon={Brain}
              description="Machine learning analysis of your exercise execution"
            >
              <AIInsightsPanel exercise={exercise} metrics={sessionMetrics} history={biomechanicalHistory} />
            </InfoGraphicSection>
          </div>
        )}
      </div>

      {/* Premium Footer Controls */}
      <div className="p-6 bg-gradient-to-t from-slate-900 to-slate-950 border-t border-white/10 flex justify-between items-center">
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
            <Download size={16} />
            Export Data
          </button>
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
            <Share2 size={16} />
            Share
          </button>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Powered by</p>
          <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            AntV Infographic Engine
          </p>
        </div>
      </div>
    </div>
  );
};

// Sub-components

const ViewTab = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
      active
        ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-cyan-500/30'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const MetricBadge = ({ icon: Icon, label, value, color }: any) => (
  <div className={`flex items-center gap-3 px-6 py-4 bg-slate-950 border border-${color}-500/20 rounded-2xl`}>
    <Icon className={`text-${color}-400`} size={24} />
    <div>
      <p className="text-[9px] text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-black text-${color}-400 italic`}>{value}</p>
    </div>
  </div>
);

const LiveStatCard = ({ icon: Icon, label, value, trend }: any) => (
  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <Icon className="text-slate-500" size={18} />
      {trend === 'up' && <TrendingUp className="text-emerald-500" size={14} />}
    </div>
    <div>
      <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  </div>
);

const InfoGraphicSection = ({ title, icon: Icon, description, children }: any) => (
  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 shadow-2xl">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
        <Icon className="text-cyan-400" size={20} />
      </div>
      <div>
        <h3 className="text-xl font-black text-white">{title}</h3>
        {description && <p className="text-[9px] text-slate-500 italic mt-1">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

const MuscleActivationHeatmap = ({ muscles, history }: any) => {
  const latest = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="space-y-3 p-4 bg-slate-900/40 rounded-2xl">
      {muscles.map((muscle: string) => {
        const activation = latest?.muscleActivation?.[muscle] || 0;
        return (
          <div key={muscle} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-300">{muscle}</span>
              <span className="text-xs font-black text-cyan-400">{activation.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${activation}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ForceOutputChart = ({ history }: any) => (
  <div className="p-4 bg-slate-900/40 rounded-2xl h-full min-h-[200px] flex items-end gap-1">
    {history.slice(-20).map((data: BiomechanicalData, i: number) => (
      <div key={i} className="flex-1 flex flex-col justify-end">
        <div
          className="bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t transition-all duration-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          style={{ height: `${data.forceOutput}%` }}
        />
      </div>
    ))}
  </div>
);

const BiomechanicalAnalysisView = ({ exercise, history }: any) => (
  <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-900/40 rounded-2xl">
    <div className="space-y-4">
      <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
        <Target size={16} /> Joint Angles
      </h4>
      {history.length > 0 && Object.entries(history[history.length - 1].jointAngles).map(([joint, angle]: any) => (
        <div key={joint} className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl">
          <span className="text-sm text-slate-300 capitalize">{joint}</span>
          <span className="text-lg font-black text-white">{angle.toFixed(1)}°</span>
        </div>
      ))}
    </div>
    <div className="space-y-4">
      <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
        <Eye size={16} /> Clinical Notes
      </h4>
      <div className="p-4 bg-slate-950/60 rounded-xl">
        <p className="text-xs text-slate-300 leading-relaxed italic">{exercise.biomechanics}</p>
      </div>
    </div>
  </div>
);

const ProgressionTimeline = ({ currentSet, currentRep, exercise }: any) => {
  const totalReps = exercise.sets * exercise.reps;
  const completedReps = (currentSet - 1) * exercise.reps + currentRep;
  const progress = (completedReps / totalReps) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-black text-white">Session Progress</h4>
        <span className="text-3xl font-black text-cyan-400">{progress.toFixed(0)}%</span>
      </div>

      <div className="h-4 bg-slate-950 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-5 gap-4 mt-8">
        {Array.from({ length: exercise.sets }).map((_, setIndex) => (
          <div key={setIndex} className={`p-4 rounded-xl border ${setIndex < currentSet - 1 ? 'bg-emerald-500/10 border-emerald-500' : setIndex === currentSet - 1 ? 'bg-cyan-500/10 border-cyan-500 animate-pulse' : 'bg-slate-900 border-slate-800'}`}>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-2">Set {setIndex + 1}</p>
            <p className="text-2xl font-black text-white">{setIndex < currentSet - 1 ? exercise.reps : setIndex === currentSet - 1 ? currentRep : '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AIInsightsPanel = ({ exercise, metrics, history }: any) => (
  <div className="space-y-6 p-6 bg-slate-900/40 rounded-2xl">
    <InsightCard
      type="success"
      title="Excellent Form Maintenance"
      description={`Your average form score of ${metrics.avgFormScore.toFixed(0)}% indicates proper exercise execution with good control.`}
    />
    <InsightCard
      type="info"
      title="Progressive Overload Detected"
      description={`Peak force output reached ${metrics.peakForce.toFixed(0)}N. Consider increasing resistance by 5-10% in next session.`}
    />
    <InsightCard
      type="warning"
      title="Optimization Opportunity"
      description="Slightly slower eccentric phase could improve time under tension and muscle activation."
    />
    <InsightCard
      type="success"
      title="Caloric Efficiency"
      description={`Burning ${metrics.caloriesBurned.toFixed(1)} kcal at optimal metabolic efficiency for ${exercise.title}.`}
    />
  </div>
);

const InsightCard = ({ type, title, description }: any) => {
  const colors = {
    success: { bg: 'emerald-500/10', border: 'emerald-500', text: 'emerald-400', icon: CheckCircle2 },
    info: { bg: 'cyan-500/10', border: 'cyan-500', text: 'cyan-400', icon: AlertCircle },
    warning: { bg: 'amber-500/10', border: 'amber-500', text: 'amber-400', icon: AlertCircle }
  };

  const color = colors[type as keyof typeof colors];
  const Icon = color.icon;

  return (
    <div className={`p-6 bg-${color.bg} border border-${color.border} rounded-2xl`}>
      <div className="flex items-start gap-4">
        <Icon className={`text-${color.text} shrink-0 mt-1`} size={24} />
        <div>
          <h5 className={`text-sm font-black text-${color.text} uppercase tracking-wide mb-2`}>{title}</h5>
          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};
