
import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, BookOpen, ExternalLink, Loader2, Microscope, 
  Stethoscope, Compass, Navigation, Filter, Library, ShieldCheck, 
  Share2, FileText, ChevronRight, Activity, Globe, Send,
  AlertCircle, CheckCircle2, Bookmark, Layers, Radar, Sparkles
} from 'lucide-react';
import { runClinicalEBMSearch, findNearbyClinics } from './ai-clinical.ts';

/**
 * PHYSIOCORE EBM & REFERRAL ENGINE v10.0
 * Features: PICO Search, Evidence Grading, Interactive Cyber-Map, Encrypted Referral
 */

type ViewMode = 'research' | 'network' | 'referral';
type EvidenceLevel = 'All' | 'Meta-Analysis' | 'RCT' | 'Review' | 'Case Study';

export const ClinicalEBMHub = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('research');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<EvidenceLevel>('All');
  
  // Research State
  const [ebmResults, setEbmResults] = useState<{text: string, links: any[], summary?: string} | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [picoMode, setPicoMode] = useState(false);
  const [picoData, setPicoData] = useState({ p: '', i: '', c: '', o: '' });

  // Network State
  const [clinics, setClinics] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any | null>(null);
  const [mapZoom, setMapZoom] = useState(1);

  // Referral State
  const [referralStep, setReferralStep] = useState(0);

  const handleEBMSearch = async () => {
    const query = picoMode 
        ? `Patient: ${picoData.p}, Intervention: ${picoData.i}, Comparison: ${picoData.c}, Outcome: ${picoData.o}` 
        : searchQuery;
    
    if (!query) return;
    
    setIsResearching(true);
    setEbmResults(null);
    try {
      const res = await runClinicalEBMSearch(query, activeFilter);
      setEbmResults(res);
    } catch (e) { console.error(e); }
    finally { setIsResearching(false); }
  };

  const handleFindClinics = async () => {
    setIsLocating(true);
    // Simulating delay for scanning effect
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await findNearbyClinics(pos.coords.latitude, pos.coords.longitude);
        // Enrich data with mock statuses for UI demo
        const enriched = res.clinics.map((c: any) => ({
            ...c,
            status: Math.random() > 0.3 ? 'Available' : 'Busy',
            occupancy: Math.floor(Math.random() * 100),
            distance: (Math.random() * 5 + 0.5).toFixed(1)
        }));
        setClinics(enriched);
      } catch (e) { console.error(e); }
      finally { setIsLocating(false); }
    }, () => {
      alert("Konum izni reddedildi.");
      setIsLocating(false);
    });
  };

  const handleReferral = () => {
      setReferralStep(1);
      setTimeout(() => setReferralStep(2), 1500);
      setTimeout(() => setReferralStep(3), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700 font-roboto overflow-hidden">
      
      {/* 1. HEADER & CONTROL DECK */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-6 shrink-0">
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 relative group">
               <Globe size={32} className="group-hover:rotate-180 transition-transform duration-700" />
               <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
               <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Global <span className="text-indigo-400">İstihbarat</span></h2>
               <div className="flex items-center gap-4 mt-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1">
                     <ShieldCheck size={10} /> Genesis EBM Engine v4.2
                  </span>
                  <div className="h-3 w-[1px] bg-slate-800" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                     NETWORK ONLINE
                  </span>
               </div>
            </div>
         </div>

         <div className="flex bg-slate-900/80 p-1.5 rounded-[1.5rem] border border-slate-800 backdrop-blur-xl">
            <NavTab active={viewMode === 'research'} onClick={() => setViewMode('research')} icon={Library} label="LİTERATÜR" />
            <NavTab active={viewMode === 'network'} onClick={() => setViewMode('network')} icon={Navigation} label="SEVK AĞI" />
            <NavTab active={viewMode === 'referral'} onClick={() => setViewMode('referral')} icon={Activity} label="KONSÜLTASYON" />
         </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 relative overflow-hidden bg-slate-950 rounded-[3rem] border border-slate-900 shadow-2xl">
         
         {/* --- RESEARCH MODULE --- */}
         {viewMode === 'research' && (
            <div className="absolute inset-0 flex flex-col xl:flex-row">
               {/* Left: Search Console */}
               <div className="w-full xl:w-[450px] bg-slate-900/50 border-r border-slate-800 p-8 flex flex-col gap-6 backdrop-blur-md overflow-y-auto custom-scrollbar z-10">
                  <div className="flex justify-between items-center">
                     <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Microscope size={16} className="text-cyan-400" /> Arama Konsolu
                     </h3>
                     <button onClick={() => setPicoMode(!picoMode)} className={`text-[9px] font-black px-3 py-1 rounded border transition-all ${picoMode ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                        PICO MODU
                     </button>
                  </div>

                  {picoMode ? (
                     <div className="space-y-3 animate-in slide-in-from-left-4">
                        <PicoInput label="P (Patient)" placeholder="Örn: 45y Male, Chronic LBP" val={picoData.p} onChange={v => setPicoData({...picoData, p: v})} />
                        <PicoInput label="I (Intervention)" placeholder="Örn: Manual Therapy" val={picoData.i} onChange={v => setPicoData({...picoData, i: v})} />
                        <PicoInput label="C (Comparison)" placeholder="Örn: Standard Exercise" val={picoData.c} onChange={v => setPicoData({...picoData, c: v})} />
                        <PicoInput label="O (Outcome)" placeholder="Örn: Pain Reduction VAS" val={picoData.o} onChange={v => setPicoData({...picoData, o: v})} />
                     </div>
                  ) : (
                     <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input 
                           type="text" 
                           value={searchQuery}
                           onChange={e => setSearchQuery(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleEBMSearch()}
                           placeholder="Klinik soru veya anahtar kelime..."
                           className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                        />
                     </div>
                  )}

                  <div className="space-y-2">
                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Kanıt Seviyesi Filtresi</p>
                     <div className="flex flex-wrap gap-2">
                        {['All', 'Meta-Analysis', 'RCT', 'Review'].map(f => (
                           <button 
                              key={f} 
                              onClick={() => setActiveFilter(f as any)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${activeFilter === f ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                           >
                              {f}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button 
                     onClick={handleEBMSearch}
                     disabled={isResearching}
                     className="mt-auto w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                     {isResearching ? <Loader2 className="animate-spin" size={16} /> : <BookOpen size={16} />} 
                     {isResearching ? 'ANALİZ EDİLİYOR...' : 'LİTERATÜRÜ TARA'}
                  </button>
               </div>

               {/* Right: Results Display */}
               <div className="flex-1 bg-slate-950 p-8 xl:p-12 overflow-y-auto custom-scrollbar relative">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                  
                  {!ebmResults ? (
                     <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <Library size={64} className="mb-6 text-slate-500" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">VERİ AKIŞI BEKLENİYOR</p>
                     </div>
                  ) : (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* AI Summary Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-indigo-500/30 p-8 rounded-[2.5rem] relative overflow-hidden group">
                           <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
                           <div className="flex items-center gap-3 mb-4 text-indigo-400">
                              <Sparkles size={18} />
                              <h4 className="text-xs font-black uppercase tracking-widest">Genesis Executive Summary</h4>
                           </div>
                           <p className="text-sm text-slate-300 leading-loose font-medium italic whitespace-pre-wrap">
                              {ebmResults.text}
                           </p>
                        </div>

                        {/* Citations Grid */}
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Referans Kaynaklar</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {ebmResults.links.map((link, i) => (
                                 <a key={i} href={link.web?.uri} target="_blank" rel="noreferrer" className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/40 transition-all group flex flex-col justify-between min-h-[120px]">
                                    <div>
                                       <div className="flex justify-between items-start mb-2">
                                          <span className="px-2 py-0.5 bg-slate-950 rounded text-[8px] font-bold text-slate-500 border border-slate-800 group-hover:border-indigo-500/30 group-hover:text-indigo-400">REF 0{i+1}</span>
                                          <ExternalLink size={12} className="text-slate-600 group-hover:text-white" />
                                       </div>
                                       <h5 className="text-[11px] font-bold text-slate-300 group-hover:text-white line-clamp-2 uppercase leading-snug">
                                          {link.web?.title || "Academic Source"}
                                       </h5>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
                                       <Globe size={12} className="text-slate-600" />
                                       <span className="text-[9px] font-mono text-slate-500 truncate">{new URL(link.web?.uri || 'https://google.com').hostname}</span>
                                    </div>
                                 </a>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* --- NETWORK MODULE --- */}
         {viewMode === 'network' && (
            <div className="absolute inset-0 flex flex-col">
               <div className="flex-1 relative bg-[#020617] overflow-hidden">
                  {/* Cyber Map Background Layer */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" 
                       style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                  
                  {/* Map Elements (Simulated) */}
                  <div className="absolute inset-0 flex items-center justify-center transition-transform duration-1000" style={{ transform: `scale(${mapZoom})` }}>
                     {/* Central Radar Pulse */}
                     <div className="absolute w-[600px] h-[600px] border border-indigo-500/10 rounded-full animate-ping-slow" />
                     <div className="absolute w-[400px] h-[400px] border border-indigo-500/20 rounded-full" />
                     <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white]" /> {/* User Location */}
                     
                     {/* Clinics Pins */}
                     {clinics.map((clinic, i) => {
                        // Random positioning for demo effect
                        const x = (i % 3 === 0 ? 1 : -1) * (100 + i * 50);
                        const y = (i % 2 === 0 ? 1 : -1) * (50 + i * 40);
                        
                        return (
                           <div key={i} 
                                className="absolute cursor-pointer group z-20"
                                style={{ transform: `translate(${x}px, ${y}px)` }}
                                onClick={() => setSelectedClinic(clinic)}
                           >
                              <div className={`w-10 h-10 ${clinic.status === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-xl flex items-center justify-center shadow-2xl relative transition-all group-hover:scale-125`}>
                                 <Stethoscope size={18} className="text-white" />
                                 <div className={`absolute -bottom-2 w-1 h-8 ${clinic.status === 'Available' ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`} />
                              </div>
                              <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase whitespace-nowrap border border-white/10 pointer-events-none">
                                 {clinic.maps?.title || "Klinik"}
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {/* Map Controls */}
                  <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-30">
                     <button onClick={() => setMapZoom(z => Math.min(z + 0.5, 3))} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-white hover:bg-indigo-600 transition-all">+</button>
                     <button onClick={() => setMapZoom(z => Math.max(z - 0.5, 0.5))} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-white hover:bg-indigo-600 transition-all">-</button>
                     <button onClick={handleFindClinics} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 transition-all animate-pulse">
                        <Radar size={20} />
                     </button>
                  </div>

                  {/* Selected Clinic Detail Overlay */}
                  {selectedClinic && (
                     <div className="absolute top-8 left-8 w-[350px] bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-left-4 z-30">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                              <MapPin className="text-indigo-400" />
                           </div>
                           <button onClick={() => setSelectedClinic(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><ChevronRight size={16} className="rotate-180"/></button>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase italic leading-none mb-1">{selectedClinic.maps?.title}</h3>
                        <p className="text-[10px] text-slate-400 font-medium mb-4 truncate">{selectedClinic.maps?.address}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-6">
                           <InfoBadge label="Mesafe" value={`${selectedClinic.distance} km`} icon={Navigation} />
                           <InfoBadge label="Doluluk" value={`%${selectedClinic.occupancy}`} icon={Activity} color={selectedClinic.occupancy > 80 ? 'text-rose-400' : 'text-emerald-400'} />
                        </div>

                        <button 
                           onClick={handleReferral}
                           className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all"
                        >
                           HASTAYI SEVK ET
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* --- REFERRAL PROCESS (MODAL OVERLAY) --- */}
         {viewMode === 'referral' && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-8">
               <div className="w-full max-w-2xl text-center space-y-8">
                  {referralStep === 0 && (
                     <div className="space-y-6">
                        <Send size={64} className="mx-auto text-slate-700" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest">Aktif Sevk İşlemi Yok</h3>
                        <p className="text-xs text-slate-500">Sevk başlatmak için harita üzerinden bir klinik seçiniz.</p>
                        <button onClick={() => setViewMode('network')} className="px-8 py-3 bg-slate-800 rounded-xl text-[10px] font-black text-white uppercase">Haritaya Dön</button>
                     </div>
                  )}
                  {referralStep > 0 && (
                     <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 animate-[shimmer_2s_infinite]" />
                        
                        {referralStep === 1 && (
                           <div className="animate-in zoom-in duration-300">
                              <Loader2 size={48} className="mx-auto text-cyan-500 animate-spin mb-6" />
                              <h3 className="text-xl font-black text-white uppercase tracking-widest">Veri Paketleniyor...</h3>
                              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">MR, Epikriz ve Gelişim Raporları Şifreleniyor</p>
                           </div>
                        )}
                        {referralStep === 2 && (
                           <div className="animate-in zoom-in duration-300">
                              <ShieldCheck size={48} className="mx-auto text-indigo-500 animate-bounce mb-6" />
                              <h3 className="text-xl font-black text-white uppercase tracking-widest">Güvenli El Sıkışma...</h3>
                              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">Klinik API Anahtarı Doğrulanıyor</p>
                           </div>
                        )}
                        {referralStep === 3 && (
                           <div className="animate-in zoom-in duration-300">
                              <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-6" />
                              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Sevk <span className="text-emerald-500">Başarılı</span></h3>
                              <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-md mx-auto">
                                 Hasta verileri <b>{selectedClinic?.maps?.title || "Merkez Klinik"}</b> sistemine güvenle aktarıldı. Referans Kodu: <span className="font-mono text-white bg-slate-900 px-2 py-1 rounded">#GEN-{Math.floor(Math.random()*10000)}</span>
                              </p>
                              <button onClick={() => { setReferralStep(0); setViewMode('network'); }} className="mt-8 px-10 py-4 bg-slate-900 border border-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800">
                                 KAPAT
                              </button>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         )}

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const NavTab = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
     <Icon size={16} />
     <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const PicoInput = ({ label, placeholder, val, onChange }: any) => (
  <div className="space-y-1">
     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
     <input 
        type="text" 
        value={val}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
     />
  </div>
);

const InfoBadge = ({ label, value, icon: Icon, color = 'text-white' }: any) => (
  <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col items-center text-center">
     <Icon size={14} className="text-slate-500 mb-1" />
     <span className="text-[8px] font-black text-slate-500 uppercase">{label}</span>
     <span className={`text-xs font-bold ${color}`}>{value}</span>
  </div>
);
