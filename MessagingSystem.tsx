
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, X, Paperclip, ShieldCheck, 
  User as UserIcon, CheckCheck, Smile, MoreHorizontal,
  Phone, Video, Info
} from 'lucide-react';
// Fix: PatientUser member not exported, using base User type instead
import { User, Message } from './types.ts';

interface MessagingSystemProps {
  patient: User;
  onClose: () => void;
}

export const MessagingSystem: React.FC<MessagingSystemProps> = ({ patient, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'p1', receiverId: 't1', text: 'Bugünkü egzersizlerde dizimde hafif bir yanma oldu.', timestamp: '14:20', isRead: true },
    { id: 'm2', senderId: 't1', receiverId: 'p1', text: 'Anladım Ahmet Bey. Zorluk seviyesini biraz düşürelim, buz uygulamasını 20 dakikaya çıkarın.', timestamp: '14:45', isRead: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 't1', // Mevcut kullanıcı (Terapist)
      receiverId: patient.id,
      text: inputValue,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[80vh] rounded-[3.5rem] flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-pulse" />
        
        {/* Chat Header */}
        <div className="px-10 py-8 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center relative z-10">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-cyan-400 font-black italic shadow-xl">
                 {patient.fullName.charAt(0)}
              </div>
              <div>
                 <h3 className="text-xl font-semibold text-white italic tracking-tight uppercase">{patient.fullName}</h3>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Güvenli Bağlantı Aktif</span>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 transition-all"><Phone size={18} /></button>
              <button className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 transition-all"><Video size={18} /></button>
              <div className="w-[1px] h-6 bg-slate-800 mx-2" />
              <button onClick={onClose} className="p-3 bg-slate-900 hover:bg-rose-500/20 hover:text-rose-500 border border-slate-800 rounded-xl text-slate-500 transition-all">
                <X size={20} />
              </button>
           </div>
        </div>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar bg-slate-950/20">
           <div className="text-center py-6">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900/50 rounded-full border border-slate-800">
                 <ShieldCheck size={14} className="text-cyan-400" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Uçtan uca şifreli klinik görüşme</span>
              </div>
           </div>

           {messages.map((msg) => {
             const isMe = msg.senderId === 't1';
             return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-${isMe ? 'right' : 'left'}-4 duration-500`}>
                 <div className={`max-w-[70%] space-y-2`}>
                   <div className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed italic ${
                     isMe 
                       ? 'bg-cyan-500 text-white rounded-tr-none shadow-xl shadow-cyan-500/10' 
                       : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                   }`}>
                     {msg.text}
                   </div>
                   <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'} px-2`}>
                      <span className="text-[9px] font-mono text-slate-600 font-bold">{msg.timestamp}</span>
                      {isMe && <CheckCheck size={12} className="text-cyan-500" />}
                   </div>
                 </div>
               </div>
             );
           })}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-slate-800 bg-slate-950/50 relative z-10">
           <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-2 rounded-[2rem] focus-within:border-cyan-500/50 transition-all">
              <button className="p-4 text-slate-500 hover:text-white transition-colors"><Paperclip size={20} /></button>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Mesajınızı yazın..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white px-2 italic"
              />
              <button className="p-4 text-slate-500 hover:text-white transition-colors"><Smile size={20} /></button>
              <button 
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className="w-14 h-14 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 transition-all active:scale-90"
              >
                <Send size={20} className="ml-1" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
