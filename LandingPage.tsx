import React, { useRef } from 'react';
import { 
  Activity, Zap, BrainCircuit, ShieldCheck, 
  Sparkles, Target, Globe,
  ArrowRight, Microscope, Layers,
  MousePointer2, Fingerprint, Award,
  Cpu, Workflow
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020617] text-white font-inter overflow-x-hidden relative selection:bg-cyan-500/30">
      {/* Premium Background Layers */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[160px] animate-pulse" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[200px]" 
        />
        <div className="absolute inset-0 bg-[url('/carbon-fibre.svg')] opacity-[0.05] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-[#020617]" />
        
        {/* Animated Noise/Grain */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light pointer-events-none bg-[url('/noise.svg')]" />
      </div>

      {/* Floating Particles (CSS Only for performance) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 md:px-12 flex justify-between items-center backdrop-blur-md bg-slate-950/20 border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] group-hover:rotate-12 transition-transform duration-500">
            <Activity size={24} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
              PhysioCore <span className="text-cyan-400">AI</span>
            </h1>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">Genesis Protocol</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
          {['Teknoloji', 'Klinik Kanıt', 'Ekosistem', 'Kurumsal'].map((item) => (
            <a key={item} href="#" className="hover:text-cyan-400 transition-all relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-cyan-400 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        <button 
          onClick={onStart}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
        >
          Erişim Sağla
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 text-center">
        <motion.div 
          style={{ opacity, scale }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 max-w-6xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/40 border border-cyan-500/20 backdrop-blur-2xl mb-4 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Ultra-Premium Rehabilitation Ecosystem</span>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-6xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.85] text-white">
            Geleceğin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              Fizyoterapisi
            </span>
          </motion.h2>

          <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-slate-400 text-base md:text-xl font-medium leading-relaxed mt-10 tracking-tight">
            Yapay zeka destekli biyomekanik analiz, <span className="text-white font-bold">24 FPS sinematik</span> egzersiz akışı ve 
            kişiselleştirilmiş dozaj motoru ile klinik mükemmelliği dijitalleştirin.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16">
            <button 
              onClick={onStart}
              className="group relative px-12 py-6 bg-cyan-600 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs overflow-hidden transition-all hover:bg-cyan-500 hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(6,182,212,0.4)]"
            >
              <div className="relative z-10 flex items-center gap-4">
                Sistemi Başlat <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
            
            <button className="flex items-center gap-4 px-12 py-6 bg-slate-900/40 border border-white/10 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all backdrop-blur-2xl group">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <Zap size={18} className="text-cyan-400" />
              </div>
              Teknik İnceleme
            </button>
          </motion.div>
        </motion.div>

        {/* Features Bento Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-32 w-full max-w-7xl px-4"
        >
          <FeatureCard 
            icon={BrainCircuit} 
            title="Klinik Zeka" 
            desc="AI Destekli Biyomekanik Analiz" 
            color="cyan"
          />
          <FeatureCard 
            icon={Workflow} 
            title="Dinamik Akış" 
            desc="24 FPS Sinematik Animasyon" 
            color="blue"
          />
          <FeatureCard 
            icon={Target} 
            title="Hassas Dozaj" 
            desc="Kişiselleştirilmiş Protokoller" 
            color="purple"
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="EBM Standart" 
            desc="Kanıta Dayalı Klinik Yaklaşım" 
            color="emerald"
          />
        </motion.div>

        {/* Stats / Social Proof Section */}
        <div className="mt-40 w-full max-w-7xl border-t border-white/5 pt-20 pb-40">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              <StatItem value="10k+" label="Klinik Analiz" />
              <StatItem value="99.8%" label="Doğruluk Oranı" />
              <StatItem value="24 FPS" label="Sinematik Akış" />
              <StatItem value="4K" label="Görsel Kalite" />
           </div>
        </div>
      </main>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
      >
        <span className="text-[8px] font-black uppercase tracking-widest">Keşfet</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-500 to-transparent" />
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 p-12 md:p-20 border-t border-white/5 bg-slate-950/80 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Activity size={24} className="text-cyan-400" />
              <h3 className="text-lg font-black uppercase tracking-tighter italic">PhysioCore AI</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Fizyoterapi ve rehabilitasyon süreçlerini yapay zeka ve yüksek teknolojili görselleştirme ile birleştiren dünyanın en gelişmiş klinik ekosistemi.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Teknoloji</h4>
            <ul className="space-y-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Genesis Engine</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Neural Motion</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Bio-Feedback</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Sistem</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Operasyonel</span>
              </div>
              <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                <span className="text-[10px] font-mono text-cyan-400">v2.5.0-STABLE</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Bağlantılar</h4>
            <div className="flex gap-6">
               <Microscope size={20} className="text-slate-600 hover:text-cyan-400 transition-colors cursor-pointer" />
               <Globe size={20} className="text-slate-600 hover:text-cyan-400 transition-colors cursor-pointer" />
               <Layers size={20} className="text-slate-600 hover:text-cyan-400 transition-colors cursor-pointer" />
               <Award size={20} className="text-slate-600 hover:text-cyan-400 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">© 2024 PhysioCore AI. All Rights Reserved.</p>
          <div className="flex gap-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
            <span className="hover:text-white cursor-pointer transition-colors">Gizlilik</span>
            <span className="hover:text-white cursor-pointer transition-colors">Kullanım Şartları</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => {
  const colorMap: any = {
    cyan: 'group-hover:text-cyan-400 group-hover:bg-cyan-500/10 border-cyan-500/5',
    blue: 'group-hover:text-blue-400 group-hover:bg-blue-500/10 border-blue-500/5',
    purple: 'group-hover:text-purple-400 group-hover:bg-purple-500/10 border-purple-500/5',
    emerald: 'group-hover:text-emerald-400 group-hover:bg-emerald-500/10 border-emerald-500/5',
  };

  return (
    <div className="p-8 bg-slate-900/20 border border-white/5 rounded-[2.5rem] backdrop-blur-xl hover:bg-slate-900/40 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className={`w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 border border-white/5 transition-all duration-500 ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-2">{title}</h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter leading-relaxed">{desc}</p>
      
      <div className="mt-6 flex items-center gap-2 text-[8px] font-black text-cyan-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
        Detayları Gör <ArrowRight size={10} />
      </div>
    </div>
  );
};

const StatItem = ({ value, label }: any) => (
  <div className="text-center space-y-2">
    <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">{value}</h3>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</p>
  </div>
);
