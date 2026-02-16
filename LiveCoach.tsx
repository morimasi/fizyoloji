
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Video, VideoOff, BrainCircuit, Activity, Volume2, Wind } from 'lucide-react';

/**
 * PHYSIOCORE LIVE COACH v1.0
 * Real-time Clinical Audio/Visual Guidance System
 */

// Implementation of manual encode/decode as per @google/genai guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Implementation of decodeAudioData as per @google/genai guidelines for raw PCM
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveCoach = ({ exerciseTitle, systemInstruction }: { exerciseTitle: string, systemInstruction: string }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return alert("API Key Gerekli");

    const ai = new GoogleGenAI({ apiKey });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `Sen uzman bir fizyoterapistsin. Şu an hasta "${exerciseTitle}" egzersizini yapıyor. ${systemInstruction}. Seans boyunca hastaya kısa, net ve motive edici klinik direktifler ver.`,
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) pcmData[i] = inputData[i] * 32768;
              
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: encode(new Uint8Array(pcmData.buffer)), mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             if (message.serverContent?.outputTranscription) {
                setTranscription(prev => (prev + ' ' + message.serverContent?.outputTranscription?.text).slice(-100));
             }
             const audioB64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (audioB64) {
                const audioData = decode(audioB64);
                // Correctly use decodeAudioData for raw PCM streaming as per guidelines
                const audioBuffer = await decodeAudioData(audioData, audioContextRef.current!, 24000, 1);
                const source = audioContextRef.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current!.destination);
                const startTime = Math.max(nextStartTimeRef.current, audioContextRef.current!.currentTime);
                source.start(startTime);
                nextStartTimeRef.current = startTime + audioBuffer.duration;
             }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => console.error("Live Error", e)
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsActive(false);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-pulse' : 'bg-slate-800'}`}>
         {isActive ? <BrainCircuit className="text-white" size={32} /> : <Activity className="text-slate-500" size={32} />}
      </div>

      <div className="flex-1">
         <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Live Clinical Guidance</span>
            {isActive && <div className="flex gap-1"><div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" /><div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce delay-75" /><div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce delay-150" /></div>}
         </div>
         <p className="text-xs text-slate-300 font-medium italic truncate max-w-[200px]">
            {isActive ? (transcription || "Sizi dinliyorum...") : "Canlı koçu başlatmak için dokunun."}
         </p>
      </div>

      <div className="flex items-center gap-2">
         {isActive ? (
            <>
               <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-xl border transition-all ${isMuted ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
               </button>
               <button onClick={stopSession} className="px-6 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">DURDUR</button>
            </>
         ) : (
            <button onClick={startSession} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">KOÇU BAŞLAT</button>
         )}
      </div>
    </div>
  );
};
