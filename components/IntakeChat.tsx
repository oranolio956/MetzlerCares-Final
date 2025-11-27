
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Shield, Zap, LifeBuoy, CornerDownLeft, ArrowRight, FileCheck, MapPin, User, Clock, Trash2, MessageCircle } from 'lucide-react';
import { startIntakeSession, sendMessageToGemini } from '../services/geminiService';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Message } from '../types';
import { Mascot, MascotProps } from './Mascot';
import { Content } from '@google/genai';
import { useTypewriter } from '../hooks/useTypewriter';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';

const SESSION_KEY = 'secondwind_intake_session_v1';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;

// QUICK CHIPS - Suggested replies
const QUICK_CHIPS = [
    "Yes, I'm in Colorado",
    "No, I don't have insurance",
    "I have Medicaid",
    "Oxford House",
    "Homeless / Shelter",
    "Less than 30 days sober"
];

const MessageItem: React.FC<{ message: Message; isLast: boolean }> = ({ message, isLast }) => {
  const { isCalmMode } = useStore();
  const shouldAnimate = message.role === 'model' && isLast && !isCalmMode;
  const displayText = useTypewriter(message.text, 20, shouldAnimate);

  return (
    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up mb-6`}>
       {message.role === 'model' ? (
        <div className="flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] group">
          <div className="shrink-0 pt-1">
             <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 text-brand-teal font-bold text-xs" aria-hidden="true">W</div>
          </div>
          <div className="space-y-1">
             <div className="text-brand-navy font-medium text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {displayText}
                {shouldAnimate && displayText.length < message.text.length && (
                   <span className="inline-block w-2 h-4 bg-brand-teal ml-1 animate-pulse align-middle" aria-hidden="true"></span>
                )}
             </div>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest text-brand-navy/30">
                Windy • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </div>
          </div>
        </div>
       ) : (
         <div className="max-w-[85%] md:max-w-[75%] bg-brand-navy text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl rounded-tr-sm text-base md:text-lg font-medium shadow-md leading-relaxed">
            {message.text}
         </div>
       )}
    </div>
  );
};

export const IntakeChat: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [mascotExpression, setMascotExpression] = useState<MascotProps['expression']>('happy');
  
  const chatRef = useRef<any>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setCrisisMode } = useStore();
  const { playClick, playSuccess } = useSound();
  const { connect, disconnect, isSpeaking, volume } = useGeminiLive();

  const toggleVoiceMode = () => {
     playClick();
     if (mode === 'text') {
        setMode('voice');
        connect();
     } else {
        setMode('text');
        disconnect();
     }
  };

  useEffect(() => {
     return () => disconnect();
  }, [disconnect]);

  useEffect(() => {
     if (mode === 'voice') {
        setMascotExpression(isSpeaking ? 'excited' : volume > 0.1 ? 'thinking' : 'happy');
     }
  }, [mode, isSpeaking, volume]);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const { messages: savedMsgs, hasStarted: savedStarted, timestamp } = JSON.parse(saved);
        if (Date.now() - timestamp > SESSION_EXPIRY) {
            localStorage.removeItem(SESSION_KEY);
            return;
        }
        if (savedStarted) {
          setHasStarted(true);
          setMessages(savedMsgs);
          const history: Content[] = savedMsgs
            .filter((m: Message) => m.id !== 'init' && m.id !== 'err') 
            .map((m: Message) => ({ role: m.role, parts: [{ text: m.text }] }));
          chatRef.current = startIntakeSession(history);
        }
      } catch (e) { localStorage.removeItem(SESSION_KEY); }
    }
  }, []);

  useEffect(() => {
    if (hasStarted && messages.length > 0) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ messages, hasStarted, timestamp: Date.now() }));
    }
  }, [messages, hasStarted]);

  const handleResetSession = () => {
      if (window.confirm("Start a new intake session?")) {
          playClick();
          localStorage.removeItem(SESSION_KEY);
          setMessages([]);
          setHasStarted(false);
          chatRef.current = null;
      }
  };

  useEffect(() => {
    if (hasStarted && !chatRef.current && mode === 'text') {
      if (messages.length === 0) {
          chatRef.current = startIntakeSession();
          setIsAiTyping(true);
          setTimeout(async () => {
              try {
                const response = await sendMessageToGemini("Hello, I am a new user looking for help.", chatRef.current);
                setMessages([{ id: 'init', role: 'model', text: response }]);
              } catch(e) { console.error(e); }
              setIsAiTyping(false);
          }, 600);
      } else {
           const history: Content[] = messages
            .filter((m: Message) => m.id !== 'init' && m.id !== 'err') 
            .map((m: Message) => ({ role: m.role, parts: [{ text: m.text }] }));
           chatRef.current = startIntakeSession(history);
      }
    }
  }, [hasStarted, mode]);

  // Improved scroll logic
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isAiTyping]);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return;
    playClick();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);
    if (inputRef.current) inputRef.current.focus();

    try {
      const responseText = await sendMessageToGemini(text, chatRef.current);
      // Basic heuristic to detect crisis response
      if (responseText.toLowerCase().includes("988") || responseText.toLowerCase().includes("suicide")) {
         setCrisisMode(true);
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Connection interrupted. Please try again."}]);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (!hasStarted) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-brand-navy rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative min-h-[600px]">
         <div className="flex-1 p-8 md:p-14 flex flex-col justify-center relative overflow-hidden text-white border-b md:border-b-0 md:border-r border-white/5">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-teal opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[0.9] tracking-tight mb-8 relative z-10">COLORADO<br/>RECOVERY INTAKE</h1>
            <div className="relative z-10">
               <p className="text-brand-lavender text-lg mb-8 font-medium">Direct-action assistance for Denver & Boulder residents.</p>
               <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-4 block">Checklist:</span>
                  <ul className="space-y-3 text-sm text-white/80">
                    <li className="flex items-center gap-3"><MapPin size={16} className="text-brand-coral" /> <span>Current location/Oxford House</span></li>
                    <li className="flex items-center gap-3"><FileCheck size={16} className="text-brand-coral" /> <span>Vendor Contact Info</span></li>
                    <li className="flex items-center gap-3"><User size={16} className="text-brand-coral" /> <span>Photo ID</span></li>
                    <li className="flex items-center gap-3"><Clock size={16} className="text-brand-coral" /> <span>Approximate Sobriety Date</span></li>
                  </ul>
               </div>
               <div className="flex gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-teal/80">
                  <span className="flex items-center gap-1"><Shield size={12} /> Encrypted</span>
                  <span className="flex items-center gap-1"><Zap size={12} /> Instant</span>
                  <span className="flex items-center gap-1"><Activity size={12} /> 24/7 Active</span>
               </div>
            </div>
         </div>
         <div className="flex-1 bg-[#FDFBF7] p-8 md:p-14 flex flex-col justify-center items-center relative">
            <div className="w-full max-w-sm space-y-4 relative z-10">
               <div className="mb-8 flex justify-center"><div className="w-32 h-32 relative"><Mascot expression="happy" className="w-full h-full" /></div></div>
               <button onClick={() => { playSuccess(); setHasStarted(true); }} className="w-full bg-brand-navy text-white h-16 rounded-xl font-bold text-lg hover:bg-brand-teal transition-all flex items-center justify-between px-6 group shadow-lg active:scale-95"><span>Begin Session</span><ArrowRight className="group-hover:translate-x-1 transition-transform" /></button>
               <button onClick={() => { playClick(); setHasStarted(true); toggleVoiceMode(); }} className="w-full bg-white border-2 border-brand-navy/10 text-brand-navy h-16 rounded-xl font-bold text-lg hover:border-brand-navy/30 transition-all flex items-center justify-between px-6 group active:scale-95"><span>Voice Mode</span><Mic size={20} className="text-brand-coral group-hover:scale-110 transition-transform" /></button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[90dvh] max-h-[800px] md:h-[700px] w-full max-w-4xl mx-auto bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white/50 ring-1 ring-brand-navy/5 relative font-sans">
      
      {/* HEADER */}
      <header className="shrink-0 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-brand-navy/5 bg-white/90 backdrop-blur-md z-20">
         <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 bg-brand-navy/5 rounded-xl flex items-center justify-center overflow-hidden">
               <Mascot expression={mascotExpression} className="w-full h-full scale-125 translate-y-1" />
            </div>
            <div>
               <h3 className="font-bold text-brand-navy leading-none">Intake Assistant</h3>
               <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${mode === 'voice' ? 'bg-brand-coral animate-pulse' : 'bg-brand-teal'}`}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40">{mode === 'voice' ? 'Voice Active' : 'Secure Connection'}</span>
               </div>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={handleResetSession} className="p-3 text-brand-navy/40 hover:text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-colors" title="Reset Session"><Trash2 size={20} /></button>
            <button onClick={() => setCrisisMode(true)} className="p-3 text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-colors" title="Crisis Help"><LifeBuoy size={20} /></button>
            <button onClick={toggleVoiceMode} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${mode === 'voice' ? 'bg-brand-coral text-white shadow-md' : 'bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10'}`}>
               {mode === 'voice' ? <><MicOff size={16}/> End Call</> : <><Mic size={16}/> Voice</>}
            </button>
         </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 relative overflow-hidden bg-[#FDFBF7]" aria-live="polite">
         <div 
            className={`absolute inset-0 overflow-y-auto custom-scrollbar p-4 md:p-8 transition-opacity duration-300 ${mode === 'voice' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-hidden={mode === 'voice'}
            inert={mode === 'voice' ? '' : undefined}
         >
            {messages.map((msg, idx) => (
               <MessageItem key={msg.id} message={msg} isLast={idx === messages.length - 1} />
            ))}
            {isAiTyping && (
               <div className="flex gap-4 animate-slide-up ml-12">
                  <div className="flex items-center gap-1 p-3 bg-brand-navy/5 rounded-xl">
                     <div className="w-1.5 h-1.5 bg-brand-navy/40 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-brand-navy/40 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                     <div className="w-1.5 h-1.5 bg-brand-navy/40 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
         </div>

         {/* VOICE OVERLAY */}
         <div 
            className={`absolute inset-0 bg-[#FDFBF7] z-10 flex flex-col items-center justify-center transition-transform duration-500 ${mode === 'voice' ? 'translate-y-0' : 'translate-y-full'}`} 
            aria-hidden={mode !== 'voice'}
            aria-modal="true"
         >
             <div className="relative w-72 h-72 flex items-center justify-center mb-8">
                {!isSpeaking && <div className="absolute inset-0 border-2 border-brand-coral/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>}
                <div className={`absolute bg-brand-coral/10 rounded-full transition-all duration-75 ease-out`} style={{ width: `${50 + volume * 50}%`, height: `${50 + volume * 50}%`, opacity: 0.2 + volume }}></div>
                <div className="relative z-20 w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center p-6"><Mascot expression={mascotExpression} className="w-full h-full" /></div>
             </div>
             
             <h3 className="font-display font-bold text-2xl text-brand-navy mb-2 animate-slide-up">Listening...</h3>
             <p className="text-brand-navy/40 font-medium mb-8">Speak naturally. Windy is ready.</p>
         </div>
      </div>

      {/* INPUT AREA */}
      <div className={`shrink-0 bg-white border-t border-brand-navy/5 transition-transform duration-300 ${mode === 'voice' ? 'translate-y-full hidden' : 'translate-y-0 block'}`}>
         
         {/* QUICK CHIPS - Suggested Replies */}
         <div className="px-4 pt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {QUICK_CHIPS.map((chip) => (
                <button
                   key={chip}
                   onClick={() => handleSend(chip)}
                   className="whitespace-nowrap px-4 py-2 rounded-full bg-brand-navy/5 text-brand-navy/70 text-xs font-bold hover:bg-brand-navy hover:text-white transition-colors border border-brand-navy/5 flex-shrink-0"
                >
                   {chip}
                </button>
            ))}
         </div>

         <div className="p-4 md:p-6">
            <div className="flex items-center gap-3 relative">
                <input 
                ref={inputRef}
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="w-full bg-brand-navy/5 text-brand-navy placeholder:text-brand-navy/30 rounded-xl px-4 py-3 md:py-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all pr-12"
                aria-label="Message input"
                />
                <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="absolute right-2 p-2 bg-brand-navy text-white rounded-lg hover:bg-brand-teal disabled:opacity-50 disabled:hover:bg-brand-navy transition-all"
                aria-label="Send message"
                >
                <CornerDownLeft size={18} />
                </button>
            </div>
            <div className="text-center mt-3 hidden md:block">
                <p className="text-[10px] text-brand-navy/30 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"><Shield size={10} /> Private & Encrypted • HIPAA Compliant Protocol</p>
            </div>
         </div>
      </div>

    </div>
  );
};
