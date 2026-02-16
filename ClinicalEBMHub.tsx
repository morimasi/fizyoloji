
import React, { useState } from 'react';
import { Search, MapPin, BookOpen, ExternalLink, Loader2, Microscope, Stethoscope, Compass, Navigation } from 'lucide-react';
import { runClinicalEBMSearch, findNearbyClinics } from './ai-clinical.ts';

export const ClinicalEBMHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ebmResults, setEbmResults] = useState<{text: string, links: any[]} | null>(null);
  const [nearbyClinics, setNearbyClinics] = useState<{text: string, clinics: any[]} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEBMSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await runClinicalEBMSearch(searchQuery);
      setEbmResults(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFindClinics = async () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await findNearbyClinics(pos.coords.latitude, pos.coords.longitude);
        setNearbyClinics(res);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }, () => {
      alert("Konum izni reddedildi.");
      setLoading(false);
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-700 pb-20 font-roboto">
      <div className="xl:col-span-12">
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
             <div className="w-20 h-20 bg-cyan-500/10 rounded-[2rem] flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
                <Microscope size={44} />
             </div>
             <div className="flex-1">
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Klinik <span className="text-cyan-400">Arastirma & Sevk</span></h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">EBM Search Grounding & Maps Integration</p>
             </div>
             <div className="flex gap-4">
                <button onClick={handleFindClinics} className="flex items-center gap-3 px-8 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-300 hover:text-cyan-400 transition-all">
                   <Compass size={18} /> YAKIN KLİNİKLER
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-8">
        <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] space-y-8 shadow-2xl relative">
           <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-[2rem] border border-slate-800 focus-within:border-cyan-500/50 transition-all">
              <div className="p-4 text-slate-500"><Search size={20} /></div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Klinik vaka veya literatür sorusu (örn: ACL Greft iyileşme süreleri 2024)..." 
                className="flex-1 bg-transparent border-none outline-none text-sm text-white italic font-medium" 
              />
              <button onClick={handleEBMSearch} disabled={loading} className="bg-cyan-500 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-30">
                 {loading ? <Loader2 className="animate-spin" size={16} /> : "ARAŞTIR"}
              </button>
           </div>

           {ebmResults && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5">
                   <div className="flex items-center gap-3 mb-6 text-emerald-400">
                      <BookOpen size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">AI Klinik Analiz Yanıtı</span>
                   </div>
                   <div className="text-sm text-slate-300 leading-loose italic whitespace-pre-wrap">
                      {ebmResults.text}
                   </div>
                </div>

                <div className="space-y-3">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Referans Kaynaklar</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ebmResults.links.map((link: any, idx: number) => (
                        <a key={idx} href={link.web?.uri || '#'} target="_blank" rel="noreferrer" className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-cyan-500/50 transition-all group">
                           <div className="flex items-center gap-3 truncate">
                              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-600 group-hover:text-cyan-400 font-black text-[10px] italic">0{idx+1}</div>
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white truncate uppercase">{link.web?.title || "Klinik Kaynak"}</span>
                           </div>
                           <ExternalLink size={14} className="text-slate-600 group-hover:text-cyan-400" />
                        </a>
                      ))}
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="xl:col-span-4 space-y-8">
         <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Navigation size={20} className="text-cyan-400" /> Sevk <span className="text-cyan-400">Ağı</span>
            </h3>
            
            {nearbyClinics ? (
               <div className="space-y-4">
                  {nearbyClinics.clinics.map((clinic: any, idx: number) => (
                     <div key={idx} className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-3 group hover:border-emerald-500/30 transition-all">
                        <div className="flex justify-between items-start">
                           <h5 className="text-[11px] font-black text-white uppercase tracking-tight italic">{clinic.maps?.title || "Klinik İsim"}</h5>
                           <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black">DOĞRULANDI</span>
                        </div>
                        <p className="text-[10px] text-slate-500 italic leading-relaxed">{clinic.maps?.address || "Lokasyon bilgisi için tıklayın."}</p>
                        <a href={clinic.maps?.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-black text-cyan-500 uppercase tracking-widest group-hover:underline">
                           YOL TARİFİ AL <ArrowRight size={10} />
                        </a>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] opacity-20 flex flex-col items-center">
                  <MapPin size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase">Sevk listesi bos</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
