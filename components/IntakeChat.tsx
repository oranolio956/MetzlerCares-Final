import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Shield, Zap, LifeBuoy, CornerDownLeft, ArrowRight, FileCheck, MapPin, User, Trash2, Lock, Sparkles } from 'lucide-react';
import { startIntakeSession, sendMessageToGemini } from '../services/geminiService';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Message } from '../types';
import { Mascot, MascotProps } from './Mascot';
import { useTypewriter } from '../hooks/useTypewriter';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';

const MessageItem: React.FC<{ message: Message; isLast: boolean }> = ({ message, isLast }) => {
  const { isCalmMode } = useStore();
  // Only animate if it's a new message in the current session view
  const shouldAnimate = message.role === 'model' && isLast && !isCalmMode;
  const displayText = useTypewriter(message.text, 20, shouldAnimate);

  return (
    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up mb-6`}>
       {message.role === 'model' ? (
        <div className="flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] group">
          <div className="shrink-0 pt-1">
             <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 text-brand-teal font-bold text-xs shadow-sm" aria-hidden="true">W</div>
          </div>
          <div className="space-y-1">
             <div className="text-brand-navy font-medium text-base md:text-lg leading-relaxed whitespace-pre-wrap bg-white/50 p-3 rounded-2xl rounded-tl-none border border-brand-navy/5 shadow-sm">
                {displayText}
                {shouldAnimate && displayText.length < message.text.length && (
                   <span className="inline-block w-2 h-4 bg-brand-teal ml-1 animate-pulse align-middle" aria-hidden="true"></span>
                )}
             </div>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest text-brand-navy/30 pl-2">
                Windy • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </div>
          </div>
        </div>
       ) : (
         <div className="max-w-[85%] md:max-w-[75%] bg-brand-navy text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl rounded-tr-sm text-base md:text-lg font-medium shadow-lg leading-relaxed shadow-brand-navy/10">
            {message.text}
         </div>
       )}
    </div>
  );
};

export const IntakeChat: React.FC = () => {
  // Global State for Persistence
  const { 
      intakeSession, 
      updateIntakeSession, 
      resetIntakeSession,
      setCrisisMode, 
      setShowLegalDocs,
      isCalmMode
  } = useStore();

  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [mascotExpression, setMascotExpression] = useState<MascotProps['expression']>('happy');
  const [smartChips, setSmartChips] = useState<string[]>([]);
  
  // Local Refs
  const sessionRef = useRef<any>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { playClick, playSuccess } = useSound();
  const { connect, disconnect, isSpeaking, volume, connected } = useGeminiLive();

  // Restore session object on mount if we have mockState
  useEffect(() => {
      if (intakeSession.hasStarted && !sessionRef.current) {
          // Re-hydrate a lightweight session object
          sessionRef.current = {
              sessionId: `restored_${Date.now()}`,
              type: 'INTAKE',
              mockState: intakeSession.mockState
          };
      }
  }, []);

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

  // SMART REPLIES LOGIC
  useEffect(() => {
      if (intakeSession.messages.length === 0) {
          setSmartChips(["I'm in Denver", "I'm in Boulder", "Colorado Springs", "Outside Colorado"]);
          return;
      }
      
      const lastModelMsg = [...intakeSession.messages].reverse().find(m => m.role === 'model');
      if (lastModelMsg && !isAiTyping) {
          const fullText = lastModelMsg.text.toLowerCase();
          
          // Enhanced mapping for disqualification logic
          if (fullText.includes("arson") || fullText.includes("sex offense") || fullText.includes("violent")) {
              setSmartChips(["No history", "Yes, in the past"]);
          } else if (fullText.includes("income") || fullText.includes("job") || fullText.includes("plan")) {
              setSmartChips(["I have a job", "Looking for work", "SSI / Disability", "Family support"]);
          } else if (fullText.includes("medicaid") || fullText.includes("health first")) {
              setSmartChips(["Yes, I have Medicaid", "No Insurance", "Private Insurance", "I need to apply"]);
          } else if (fullText.includes("specific") || fullText.includes("need") || fullText.includes("funding")) {
              setSmartChips(["Rent Deposit", "Bus Pass", "Work Laptop", "ID Retrieval"]);
          } else if (fullText.includes("sobriety") || fullText.includes("sober") || fullText.includes("clean")) {
              setSmartChips(["Over 6 Months", "30-90 Days", "Just a few days", "I'm currently using"]);
          } else if (fullText.includes("safe") || fullText.includes("sleep")) {
              setSmartChips(["I'm safe", "I'm homeless", "Couch surfing", "In a shelter"]);
          } else if (fullText.includes("colorado") || fullText.includes("located")) {
              setSmartChips(["Yes, in Colorado", "No, out of state"]);
          } else if (fullText.includes("ready") || fullText.includes("start")) {
              setSmartChips(["I'm ready", "How does this work?"]);
          } else {
              setSmartChips([]);
          }
      } else {
          setSmartChips([]); // Hide while typing
      }
  }, [intakeSession.messages, isAiTyping]);

  const handleResetSession = () => {
      if (window.confirm("Start a new intake session? This will clear your chat history.")) {
          playClick();
          resetIntakeSession();
          sessionRef.current = null;
      }
  };

  const startSession = () => {
      playSuccess();
      updateIntakeSession({ hasStarted: true });
      sessionRef.current = startIntakeSession();
      setIsAiTyping(true);
      
      // Simulate network delay for realism
      setTimeout(async () => {
          const response = await sendMessageToGemini("Hello, I am ready to start.", sessionRef.current);
          updateIntakeSession({ 
              messages: [{ id: 'init', role: 'model', text: response.text }] 
          });
          setIsAiTyping(false);
      }, 800);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [intakeSession.messages, isAiTyping]);

  const handleSend = async (text: string = inputText) => {
    if (!text.trim()) return;
    playClick();
    
    // Optimistic Update
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text };
    const newHistory = [...intakeSession.messages, userMsg];
    updateIntakeSession({ messages: newHistory });
    
    setInputText('');
    setIsAiTyping(true);
    if (inputRef.current) inputRef.current.focus();

    try {
      const response = await sendMessageToGemini(text, sessionRef.current, intakeSession.messages);
      
      // Proactive Crisis Check
      if (response.text.toLowerCase().includes("988") || response.text.toLowerCase().includes("suicide")) {
         setCrisisMode(true);
      }
      
      updateIntakeSession({ 
          messages: [...newHistory, { id: (Date.now() + 1).toString(), role: 'model', text: response.text }],
          mockState: sessionRef.current?.mockState
      });

    } catch (e) {
      updateIntakeSession({ 
          messages: [...newHistory, { id: 'err', role: 'model', text: "Connection interrupted. Please check your internet."}]
      });
    } finally {
      setIsAiTyping(false);
    }
  };

  if (!intakeSession.hasStarted) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-brand-navy rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative h-auto md:h-[600px]">
         {/* Left Side: Info */}
         <div className="flex-1 p-6 md:p-14 flex flex-col justify-center relative overflow-hidden text-white border-b md:border-b-0 md:border-r border-white/5">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-teal opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight mb-4 md:mb-8 relative z-10">COLORADO<br/>RECOVERY INTAKE</h1>
            <div className="relative z-10">
               <p className="text-brand-lavender text-base md:text-lg mb-6 md:mb-8 font-medium">Direct-action assistance for Denver & Boulder residents.</p>
               <div className="bg-white/5 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 text-left border border-white/10 hidden sm:block">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-4 block">Checklist:</span>
                  <ul className="space-y-3 text-sm text-white/80">
                    <li className="flex items-center gap-3"><MapPin size={16} className="text-brand-coral" /> <span>Current location/Oxford House</span></li>
                    <li className="flex items-center gap-3"><FileCheck size={16} className="text-brand-coral" /> <span>Vendor Contact Info</span></li>
                    <li className="flex items-center gap-3"><User size={16} className="text-brand-coral" /> <span>Photo ID</span></li>
                  </ul>
               </div>
               <div className="flex gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-teal/80">
                  <span className="flex items-center gap-1"><Lock size={12} /> HIPAA-Compliant</span>
                  <span className="flex items-center gap-1"><Zap size={12} /> Encrypted Session</span>
               </div>
            </div>
         </div>
         
         {/* Right Side: Consent & Start */}
         <div className="flex-1 bg-[#FDFBF7] p-6 md:p-14 flex flex-col justify-center items-center relative">
            <div className="w-full max-w-sm space-y-6 relative z-10">
               <div className="mb-4 flex justify-center"><div className="w-24 h-24 md:w-32 md:h-32 relative"><Mascot expression="happy" className="w-full h-full" /></div></div>
               
               {!intakeSession.hasConsent ? (
                 <div className="bg-white border border-brand-navy/10 rounded-xl p-6 animate-slide-up shadow-lg">
                    <h4 className="font-bold text-brand-navy mb-2 flex items-center gap-2"><Shield size={16}/> Privacy & Consent</h4>
                    <p className="text-xs text-brand-navy/60 mb-4 leading-relaxed">
                      This system uses AI to process your intake. By proceeding, you agree to our <button onClick={() => setShowLegalDocs(true)} className="text-brand-teal underline font-bold">Terms & Privacy Policy</button>. 
                    </p>
                    <div className="flex items-center gap-3 mb-4 p-3 bg-brand-navy/5 rounded-lg border border-brand-navy/5">
                        <input type="checkbox" id="consent" className="w-5 h-5 rounded border-brand-navy text-brand-teal focus:ring-brand-teal" onChange={(e) => e.target.checked && playClick()} />
                        <label htmlFor="consent" className="text-xs font-bold text-brand-navy cursor-pointer">I understand and agree.</label>
                    </div>
                    <button 
                      onClick={() => { playClick(); updateIntakeSession({ hasConsent: true }); }}
                      className="w-full bg-brand-navy text-white py-3 rounded-lg font-bold text-sm hover:bg-brand-teal transition-colors"
                    >
                      Continue
                    </button>
                 </div>
               ) : (
                 <div className="space-y-4 animate-slide-up">
                    <button onClick={startSession} className="w-full bg-brand-navy text-white h-14 md:h-16 rounded-xl font-bold text-lg hover:bg-brand-teal transition-all flex items-center justify-between px-6 group shadow-lg active:scale-95"><span>Begin Session</span><ArrowRight className="group-hover:translate-x-1 transition-transform" /></button>
                    <button onClick={() => { playClick(); startSession(); toggleVoiceMode(); }} className="w-full bg-white border-2 border-brand-navy/10 text-brand-navy h-14 md:h-16 rounded-xl font-bold text-lg hover:border-brand-navy/30 transition-all flex items-center justify-between px-6 group active:scale-95"><span>Voice Mode (Beta)</span><Mic size={20} className="text-brand-coral group-hover:scale-110 transition-transform" /></button>
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  }

  // --- CHAT INTERFACE ---
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-2 md:border-4 border-white/50 ring-1 ring-brand-navy/5 relative font-sans h-[calc(100dvh-120px)] md:h-[700px]">
      
      {/* HEADER */}
      <header className="shrink-0 h-16 flex items-center justify-between px-4 md:px-6 border-b border-brand-navy/5 bg-white/90 backdrop-blur-md z-20">
         <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-navy/5 rounded-xl flex items-center justify-center overflow-hidden">
               <Mascot expression={mascotExpression} className="w-full h-full scale-125 translate-y-1" />
            </div>
            <div>
               <h3 className="font-bold text-brand-navy leading-none text-sm md:text-base">Intake Assistant</h3>
               <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${mode === 'voice' ? 'bg-brand-coral animate-pulse' : 'bg-brand-teal'}`}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40">{mode === 'voice' ? 'Voice Encrypted' : 'Secure Session'}</span>
               </div>
            </div>
         </div>
         <div className="flex gap-1 md:gap-2">
            <button onClick={handleResetSession} className="p-2 md:p-3 text-brand-navy/40 hover:text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-colors" title="Clear Data & Reset"><Trash2 size={18} /></button>
            <button onClick={() => setCrisisMode(true)} className="p-2 md:p-3 text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-colors" title="Crisis Help"><LifeBuoy size={18} /></button>
            <button onClick={toggleVoiceMode} className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${mode === 'voice' ? 'bg-brand-coral text-white shadow-md' : 'bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10'}`}>
               {mode === 'voice' ? <><MicOff size={16}/> Stop</> : <><Mic size={16}/> Voice</>}
            </button>
         </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 relative overflow-hidden bg-[#FDFBF7]" aria-live="polite">
         <div 
            className={`absolute inset-0 overflow-y-auto custom-scrollbar p-4 md:p-8 transition-opacity duration-300 ${mode === 'voice' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-hidden={mode === 'voice' ? 'true' : 'false'}
            inert={mode === 'voice' ? true : undefined}
         >
            {intakeSession.messages.map((msg, idx) => (
               <MessageItem key={msg.id} message={msg} isLast={idx === intakeSession.messages.length - 1} />
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

         {/* VOICE OVERLAY - ENHANCED VISUALIZER */}
         <div 
            className={`absolute inset-0 bg-[#FDFBF7] z-10 flex flex-col items-center justify-center transition-transform duration-500 ${mode === 'voice' ? 'translate-y-0' : 'translate-y-full'}`} 
            aria-hidden={mode !== 'voice' ? 'true' : 'false'}
            aria-modal="true"
         >
             <div className="relative w-80 h-80 flex items-center justify-center mb-8">
                {/* Connecting Ping */}
                {!isSpeaking && connected && <div className="absolute inset-0 border border-brand-coral/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>}
                
                {/* Harmonic Ripple Rings - Driven by Volume */}
                <div className="absolute inset-0 bg-brand-teal/5 rounded-full transition-all duration-75 ease-out" style={{ transform: `scale(${1 + volume * 0.8})` }}></div>
                <div className="absolute inset-0 border border-brand-teal/20 rounded-full transition-all duration-100 ease-out" style={{ transform: `scale(${1 + volume * 1.5})`, opacity: Math.max(0, 1 - volume) }}></div>
                <div className="absolute inset-0 bg-brand-coral/10 rounded-full transition-all duration-150 ease-out" style={{ transform: `scale(${0.8 + volume * 0.5})` }}></div>
                
                {/* Core Mascot */}
                <div className="relative z-20 w-48 h-48 bg-white rounded-full shadow-2xl flex items-center justify-center p-8 border-4 border-white"><Mascot expression={mascotExpression} className="w-full h-full" /></div>
             </div>
             
             <h3 className="font-display font-bold text-3xl text-brand-navy mb-2 animate-slide-up transition-all">{connected ? (isSpeaking ? "Speaking..." : "Listening...") : "Connecting..."}</h3>
             <p className="text-brand-navy/40 font-medium mb-8">Hands-free mode active.</p>
         </div>
      </div>

      {/* INPUT AREA */}
      <div className={`shrink-0 bg-white border-t border-brand-navy/5 transition-transform duration-300 pb-safe ${mode === 'voice' ? 'translate-y-full hidden' : 'translate-y-0 block'}`}>
         
         {/* SMART CHIPS (Dynamic) */}
         {smartChips.length > 0 && (
             <div className="px-4 pt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
                {smartChips.map((chip, idx) => (
                    <button
                    key={`${chip}-${idx}`}
                    onClick={() => handleSend(chip)}
                    className="whitespace-nowrap px-4 py-2 rounded-full bg-brand-navy/5 text-brand-navy/70 text-xs font-bold hover:bg-brand-navy hover:text-white transition-colors border border-brand-navy/5 flex-shrink-0 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                    {chip}
                    </button>
                ))}
             </div>
         )}

         <div className="p-3 md:p-4 lg:p-6">
            <div className="flex items-center gap-2 md:gap-3 relative">
                <input 
                ref={inputRef}
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                /* NOTE: 'text-base' (16px) prevents iOS Safari zooming on focus */
                className="w-full bg-brand-navy/5 text-brand-navy placeholder:text-brand-navy/30 rounded-xl px-4 py-3 md:py-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all pr-12 text-base md:text-lg"
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
         </div>
      </div>

    </div>
  );
};