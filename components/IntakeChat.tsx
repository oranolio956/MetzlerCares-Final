
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, X, ArrowUp, Activity, Shield, Zap, Circle, Play, Pause, CornerDownLeft, LifeBuoy, Phone, MessageSquare, ArrowRight, FileCheck, MapPin, User, Clock, Trash2, RefreshCcw } from 'lucide-react';
import { startIntakeSession, sendMessageToGemini } from '../services/geminiService';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Message } from '../types';
import { Mascot, MascotProps } from './Mascot';
import { Content } from '@google/genai';
import { useTypewriter } from '../hooks/useTypewriter';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';

const SESSION_KEY = 'secondwind_intake_session_v1';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 Hours

const MessageItem: React.FC<{ message: Message; isLast: boolean }> = ({ message, isLast }) => {
  const { isCalmMode } = useStore();
  const shouldAnimate = message.role === 'model' && isLast && !isCalmMode;
  const displayText = useTypewriter(message.text, 10, shouldAnimate);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end w-full animate-slide-up">
         <div className="max-w-[85%] md:max-w-[80%] bg-brand-navy text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl rounded-tr-sm text-base md:text-lg font-medium shadow-[0_4px_12px_rgba(26,42,58,0.15)] leading-relaxed">
            {message.text}
         </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start pr-2 md:pr-8 animate-slide-up group">
       <div className="flex gap-3 md:gap-6 max-w-[95%] md:max-w-[90%]">
          {/* Avatar / Indicator */}
          <div className="shrink-0 pt-1">
             <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 text-brand-teal font-bold text-[10px] md:text-xs">
                W
             </div>
          </div>
          
          <div className="space-y-1 md:space-y-2">
             <div className="text-brand-navy font-medium text-base md:text-xl leading-relaxed">
                {displayText}
                {shouldAnimate && displayText.length < message.text.length && (
                   <span className="inline-block w-2 h-4 bg-brand-teal ml-1 animate-pulse align-middle"></span>
                )}
             </div>
             {/* Subtle timestamp/status */}
             <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest text-brand-navy/30">
                System • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </div>
          </div>
       </div>
    </div>
  );
};

export const IntakeChat: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [mascotExpression, setMascotExpression] = useState<MascotProps['expression']>('happy');
  
  const chatRef = useRef<any>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isCalmMode } = useStore();
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

  // --- SESSION RESTORATION ---
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const { messages: savedMsgs, hasStarted: savedStarted, timestamp } = JSON.parse(saved);
        
        // Expiry Check (24h)
        if (Date.now() - timestamp > SESSION_EXPIRY) {
            localStorage.removeItem(SESSION_KEY);
            return;
        }

        if (savedStarted) {
          setHasStarted(true);
          setMessages(savedMsgs);
          
          // Reconstruct Chat History for Model Context
          // Filter out internal messages or error messages
          const history: Content[] = savedMsgs
            .filter((m: Message) => m.id !== 'init' && m.id !== 'err') 
            .map((m: Message) => ({ role: m.role, parts: [{ text: m.text }] }));
            
          chatRef.current = startIntakeSession(history);
        }
      } catch (e) { 
          console.error("Session restore failed", e);
          localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  // --- SESSION PERSISTENCE ---
  useEffect(() => {
    if (hasStarted && messages.length > 0) {
      const stateToSave = {
          messages,
          hasStarted,
          timestamp: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(stateToSave));
    }
  }, [messages, hasStarted]);

  // --- MANUAL RESET ---
  const handleResetSession = () => {
      if (window.confirm("Start a new intake session? This will clear your current conversation.")) {
          playClick();
          localStorage.removeItem(SESSION_KEY);
          setMessages([]);
          setHasStarted(false);
          chatRef.current = null;
      }
  };

  useEffect(() => {
    if (hasStarted && !chatRef.current && mode === 'text') {
      // If we started but chatRef is null (and it wasn't restored), initialize fresh
      if (messages.length === 0) {
          chatRef.current = startIntakeSession();
          const initialGreeting = async () => {
            setIsAiTyping(true);
            setTimeout(async () => {
              try {
                const response = await sendMessageToGemini("Hello, I am a new user looking for help.", chatRef.current);
                setMessages([{ id: 'init', role: 'model', text: response }]);
              } catch(e) { console.error(e); }
              setIsAiTyping(false);
            }, 1000);
          };
          initialGreeting();
      } else {
          // Fallback: If messages exist but chatRef is lost (rare race condition), reconstruct
           const history: Content[] = messages
            .filter((m: Message) => m.id !== 'init' && m.id !== 'err') 
            .map((m: Message) => ({ role: m.role, parts: [{ text: m.text }] }));
           chatRef.current = startIntakeSession(history);
      }
    }
  }, [hasStarted, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    playClick();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);
    if (inputRef.current) inputRef.current.focus();

    try {
      const responseText = await sendMessageToGemini(inputText, chatRef.current);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Connection interrupted. Please try again."}]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // --- LOBBY VIEW ---
  if (!hasStarted) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-brand-navy rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative min-h-[70vh] md:min-h-[600px]">
         {/* Left: Brand / Intro */}
         <div className="flex-1 p-6 md:p-14 flex flex-col justify-center relative overflow-hidden text-white border-b md:border-b-0 md:border-r border-white/5">
            <div className="absolute top-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-brand-teal opacity-10 rounded-full blur-[60px] md:blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="z-10 space-y-2 mb-8 text-center md:text-left">
               <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[0.9] tracking-tight">
                 COLORADO<br/>RECOVERY INTAKE
               </h1>
            </div>

            <div className="z-10 mt-4 text-center md:text-left">
               <p className="text-brand-lavender text-base md:text-lg max-w-sm mx-auto md:mx-0 leading-relaxed mb-8 font-medium">
                 Direct-action assistance for Denver & Boulder residents. 
               </p>
               
               {/* Pre-flight Checklist (Crucial for UX) */}
               <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-4 block">What you'll need ready:</span>
                  <ul className="space-y-3 text-sm text-white/80">
                    <li className="flex items-center gap-3"><MapPin size={16} className="text-brand-coral" /> <span>Current location/Oxford House</span></li>
                    <li className="flex items-center gap-3"><FileCheck size={16} className="text-brand-coral" /> <span>Vendor/Landlord Contact Info</span></li>
                    <li className="flex items-center gap-3"><User size={16} className="text-brand-coral" /> <span>Photo ID (State ID or Mugshot)</span></li>
                    <li className="flex items-center gap-3"><Clock size={16} className="text-brand-coral" /> <span>Approximate Sobriety Date</span></li>
                  </ul>
               </div>

               <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-teal/80">
                  <span className="flex items-center gap-1.5"><Shield size={12} className="md:w-[14px] md:h-[14px]"/> Encrypted</span>
                  <span className="flex items-center gap-1.5"><Zap size={12} className="md:w-[14px] md:h-[14px]"/> Instant</span>
                  <span className="flex items-center gap-1.5"><Activity size={12} className="md:w-[14px] md:h-[14px]"/> 24/7 Active</span>
               </div>
            </div>
         </div>

         {/* Right: Actions */}
         <div className="flex-1 bg-[#FDFBF7] p-6 md:p-14 flex flex-col justify-center items-center relative">
            <div className="w-full max-w-xs sm:max-w-sm space-y-3 md:space-y-4 relative z-10">
               <div className="mb-6 md:mb-8 flex justify-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 relative">
                     <Mascot expression="happy" className="w-full h-full" />
                  </div>
               </div>
               
               <button 
                  onClick={() => { playSuccess(); setHasStarted(true); }}
                  className="w-full bg-brand-navy text-white h-14 md:h-16 rounded-xl font-bold text-base md:text-lg hover:bg-brand-teal transition-all flex items-center justify-between px-6 group shadow-lg active:scale-95"
               >
                  <span>Begin Session</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
               </button>
               
               <button 
                  onClick={() => { playClick(); setHasStarted(true); toggleVoiceMode(); }}
                  className="w-full bg-white border-2 border-brand-navy/10 text-brand-navy h-14 md:h-16 rounded-xl font-bold text-base md:text-lg hover:border-brand-navy/30 transition-all flex items-center justify-between px-6 group active:scale-95"
               >
                  <span>Voice Mode</span>
                  <Mic size={20} className="text-brand-coral group-hover:scale-110 transition-transform" />
               </button>
            </div>
         </div>
      </div>
    );
  }

  // --- CHAT INTERFACE ---
  return (
    <div className="flex flex-col h-[75dvh] md:h-[700px] w-full max-w-4xl mx-auto bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white/50 ring-1 ring-brand-navy/5 relative font-sans">
      
      {/* Crisis Overlay */}
      {showCrisis && (
        <div className="absolute inset-0 bg-brand-coral/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
           <button onClick={() => setShowCrisis(false)} className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full"><X size={32} /></button>
           <LifeBuoy size={64} className="text-white mb-6" />
           <h3 className="font-display font-bold text-3xl text-white mb-2">Immediate Help</h3>
           <div className="flex flex-col w-full max-w-sm gap-3 mt-8">
              <a href="tel:988" className="bg-white text-brand-coral font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg"><Phone size={20} /> Call 988</a>
              <a href="sms:741741" className="bg-brand-navy text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg"><MessageSquare size={20} /> Text 741741</a>
           </div>
        </div>
      )}

      {/* HEADER */}
      <header className="shrink-0 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-brand-navy/5 bg-white/90 backdrop-blur-md z-20">
         <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-navy/5 rounded-xl flex items-center justify-center overflow-hidden">
               <Mascot expression={mascotExpression} className="w-full h-full scale-125 translate-y-1" />
            </div>
            <div>
               <h3 className="font-bold text-brand-navy leading-none text-sm md:text-base">Intake Assistant</h3>
               <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${mode === 'voice' ? 'bg-brand-coral animate-pulse' : 'bg-brand-teal'}`}></div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-navy/40">
                     {mode === 'voice' ? 'Voice Active' : 'Secure Connection'}
                  </span>
               </div>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={handleResetSession} className="p-2 md:p-3 text-brand-navy/40 hover:text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-colors" title="Reset Session">
                <Trash2 size={18} className="md:w-5 md:h-5" />
            </button>
            <button onClick={() => setShowCrisis(true)} className="p-2 md:p-3 text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-colors" title="Crisis Help">
                <LifeBuoy size={18} className="md:w-5 md:h-5" />
            </button>
            <button onClick={toggleVoiceMode} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2 transition-all ${mode === 'voice' ? 'bg-brand-coral text-white shadow-md' : 'bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10'}`}>
               {mode === 'voice' ? <><MicOff size={14} className="md:w-4 md:h-4"/> <span className="hidden sm:inline">End Call</span></> : <><Mic size={14} className="md:w-4 md:h-4"/> Voice</>}
            </button>
         </div>
      </header>

      {/* MAIN CONTAINER (Relative parent for overlays) */}
      <div className="flex-1 relative overflow-hidden bg-[#FDFBF7]">
         
         {/* MESSAGES LAYER */}
         <div className={`absolute inset-0 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6 md:space-y-8 transition-opacity duration-300 ${mode === 'voice' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {messages.map((msg, idx) => (
               <MessageItem key={msg.id} message={msg} isLast={idx === messages.length - 1} />
            ))}
            {isAiTyping && (
               <div className="flex gap-4 md:gap-6 animate-slide-up">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy/5 flex items-center justify-center"><Activity size={14} className="text-brand-navy/30 animate-spin" /></div>
                  <div className="flex items-center gap-1">
                     <div className="w-1.5 h-1.5 bg-brand-navy/20 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-brand-navy/20 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                     <div className="w-1.5 h-1.5 bg-brand-navy/20 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
         </div>

         {/* VOICE LAYER (Absolute Inset) */}
         <div className={`absolute inset-0 bg-[#FDFBF7] z-10 flex flex-col items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${mode === 'voice' ? 'translate-y-0' : 'translate-y-full'}`}>
             
             {/* Visualizer Area */}
             <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center mb-8">
                
                {/* Listening Rings (Microphone) - Coral/User */}
                {!isSpeaking && (
                    <>
                        <div className="absolute inset-0 border-2 border-brand-coral/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="absolute inset-0 border border-brand-coral/10 rounded-full scale-150 opacity-0 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                         <div 
                           className="absolute bg-brand-coral/10 rounded-full transition-all duration-75 ease-out"
                           style={{ 
                              width: `${50 + volume * 50}%`, 
                              height: `${50 + volume * 50}%`,
                              opacity: 0.2 + volume 
                           }}
                        ></div>
                    </>
                )}

                {/* Speaking Rings (AI) - Teal/Windy */}
                {isSpeaking && (
                    <>
                       <div className="absolute inset-0 bg-brand-teal/5 rounded-full animate-pulse"></div>
                        <div 
                           className="absolute border-2 border-brand-teal/20 rounded-full transition-all duration-75"
                           style={{ 
                              width: `${60 + volume * 40}%`, 
                              height: `${60 + volume * 40}%`
                           }}
                        ></div>
                        <div 
                           className="absolute bg-brand-teal/10 rounded-full transition-all duration-75"
                           style={{ 
                              width: `${45 + volume * 55}%`, 
                              height: `${45 + volume * 55}%`,
                           }}
                        ></div>
                    </>
                )}

                {/* Core Mascot */}
                <div className="relative z-20 w-32 h-32 md:w-48 md:h-48 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(26,42,58,0.2)] flex items-center justify-center p-6 transition-transform duration-300">
                   <Mascot expression={mascotExpression} className="w-full h-full" />
                </div>
             </div>

             <div className="text-center space-y-3 relative z-20">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest transition-colors ${isSpeaking ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-coral/10 text-brand-coral'}`}>
                    {isSpeaking ? <Activity size={16} className="animate-pulse" /> : <Mic size={16} />}
                    {isSpeaking ? "Windy is speaking" : "Listening..."}
                </div>
                <p className="text-brand-navy/40 font-medium text-sm md:text-base h-6 transition-opacity duration-300">
                   {isSpeaking ? "" : "Go ahead, I'm listening."}
                </p>
             </div>
         </div>

      </div>

      {/* FOOTER INPUT */}
      <footer className={`shrink-0 p-3 md:p-6 bg-white border-t border-brand-navy/5 z-20 transition-all duration-300 ${mode === 'voice' ? 'grayscale opacity-50 pointer-events-none' : ''}`}>
         <div className="flex items-center gap-2 md:gap-3 bg-brand-navy/5 p-1.5 md:p-2 pr-2 md:pr-3 rounded-2xl border border-transparent focus-within:border-brand-navy/10 focus-within:bg-white transition-all">
            <input 
               ref={inputRef}
               type="text" 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Type response..."
               className="flex-1 bg-transparent border-none outline-none px-3 md:px-4 py-2 md:py-3 text-base md:text-lg font-medium text-brand-navy placeholder:text-brand-navy/30"
               disabled={mode === 'voice' || isAiTyping}
            />
            <button 
               onClick={handleSend}
               disabled={!inputText.trim() || mode === 'voice' || isAiTyping}
               className="w-10 h-10 md:w-12 md:h-12 bg-brand-navy text-white rounded-xl flex items-center justify-center hover:bg-brand-teal disabled:bg-brand-navy/10 disabled:text-brand-navy/20 disabled:cursor-not-allowed transition-all shadow-sm"
            >
               <CornerDownLeft size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
            </button>
         </div>
      </footer>

    </div>
  );
};
