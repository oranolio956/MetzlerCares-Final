
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Clock, Shield, Mic, MicOff, Volume2 } from 'lucide-react';
import { startIntakeSession, sendMessageToGemini } from '../services/geminiService';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Message } from '../types';
import { Mascot } from './Mascot';
import { Content } from '@google/genai';
import { useTypewriter } from '../hooks/useTypewriter';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';
import { useRouter } from '../hooks/useRouter';

const SESSION_KEY = 'secondwind_intake_session';

// Sub-component for displaying message text with typewriter effect if needed
const MessageBubble: React.FC<{ message: Message; isLast: boolean }> = ({ message, isLast }) => {
  const { isCalmMode } = useStore();
  const { playTyping } = useSound();
  const shouldAnimate = message.role === 'model' && isLast && !isCalmMode;
  const displayText = useTypewriter(message.text, 20, shouldAnimate);

  useEffect(() => {
    if (shouldAnimate && displayText.length < message.text.length) {
       if (displayText.length % 3 === 0) playTyping();
    }
  }, [displayText, shouldAnimate, message.text, playTyping]);

  return (
    <div
      className={`max-w-[80%] p-4 rounded-2xl text-lg font-medium leading-relaxed shadow-sm transition-all duration-300 ${
        message.role === 'user'
          ? 'bg-brand-navy text-white rounded-br-none'
          : 'bg-white text-brand-navy border-2 border-brand-lavender/30 rounded-bl-none'
      }`}
    >
      {displayText}
    </div>
  );
};

export const IntakeChat: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [mascotExpression, setMascotExpression] = useState<'happy' | 'thinking' | 'excited' | 'wink'>('happy');
  
  const chatRef = useRef<any>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isCalmMode } = useStore();
  const { playClick, playHover } = useSound();
  const { navigate } = useRouter();

  // Voice Hook
  const { connect, disconnect, isConnected, isSpeaking, volume } = useGeminiLive();

  // Toggle Voice Mode
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

  // Cleanup on unmount
  useEffect(() => {
     return () => disconnect();
  }, [disconnect]);

  // Handle Mascot State based on Live API
  useEffect(() => {
     if (mode === 'voice') {
        if (isSpeaking) {
           setMascotExpression('excited');
        } else if (volume > 0.1) {
           // User is speaking
           setMascotExpression('thinking');
        } else {
           setMascotExpression('happy');
        }
     }
  }, [mode, isSpeaking, volume]);

  // Load Session on Mount (Text Mode)
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const { messages: savedMsgs, hasStarted: savedStarted } = JSON.parse(saved);
        if (savedStarted) {
          setHasStarted(true);
          setMessages(savedMsgs);
          const history: Content[] = savedMsgs
            .filter((m: Message) => m.id !== 'init') 
            .map((m: Message) => ({
              role: m.role,
              parts: [{ text: m.text }]
            }));
          chatRef.current = startIntakeSession(history);
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  useEffect(() => {
    if (hasStarted && messages.length > 0) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        messages,
        hasStarted
      }));
    }
  }, [messages, hasStarted]);

  // Mascot Text Logic
  useEffect(() => {
    if (mode === 'text') {
        if (isAiTyping) {
          setMascotExpression('thinking');
        } else {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg?.role === 'model') {
            setMascotExpression('excited');
            const timer = setTimeout(() => {
                setMascotExpression('happy');
            }, 2000);
            return () => clearTimeout(timer);
          } else {
            setMascotExpression('happy');
          }
        }
    }
  }, [isAiTyping, messages, mode]);

  useEffect(() => {
    if (hasStarted && !chatRef.current && mode === 'text') {
      chatRef.current = startIntakeSession();
      const initialGreeting = async () => {
        setIsAiTyping(true);
        setTimeout(async () => {
          const response = await sendMessageToGemini("Hello, I am a new user looking for help.", chatRef.current);
          setMessages([{
            id: 'init',
            role: 'model',
            text: response
          }]);
          setIsAiTyping(false);
        }, 1000);
      };
      if (messages.length === 0) initialGreeting();
    }
  }, [hasStarted, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    playClick();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);
    try {
      const responseText = await sendMessageToGemini(inputText, chatRef.current);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiTyping(false);
    }
  };

  // RENDER: LOBBY VIEW
  if (!hasStarted) {
    return (
      <div className="h-[600px] w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(26,42,58,1)] border-4 border-brand-navy overflow-hidden relative flex flex-col items-center justify-center p-8 text-center">
         <div className="absolute top-0 left-0 w-full h-2 bg-brand-navy/5"></div>
         
         <div className="w-32 h-32 mb-6 relative">
            <div className={`absolute inset-0 bg-brand-teal rounded-full opacity-10 ${!isCalmMode && 'animate-ping'}`}></div>
            <Mascot expression="excited" className="relative z-10" />
         </div>

         <h2 className="font-display font-bold text-3xl text-brand-navy mb-3">Hi, I'm Windy.</h2>
         <p className="text-brand-navy/60 max-w-sm mb-8 leading-relaxed">
           I'm here to help you get the resources you need. No judgment, just a quick chat to see how we can help.
         </p>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md mb-8">
            <div className="flex flex-col items-center gap-2 p-3 bg-brand-cream rounded-xl border border-brand-navy/5">
              <Clock size={20} className="text-brand-coral" />
              <span className="text-xs font-bold uppercase text-brand-navy/50">2 Minutes</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-brand-cream rounded-xl border border-brand-navy/5">
              <Shield size={20} className="text-brand-teal" />
              <span className="text-xs font-bold uppercase text-brand-navy/50">Private</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-brand-cream rounded-xl border border-brand-navy/5">
              <MessageSquare size={20} className="text-brand-lavender" />
              <span className="text-xs font-bold uppercase text-brand-navy/50">AI Assist</span>
            </div>
         </div>

         <button 
           onClick={() => { playClick(); setHasStarted(true); }}
           onMouseEnter={playHover}
           className="bg-brand-navy text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-brand-teal hover:scale-105 transition-all shadow-lg flex items-center gap-3"
         >
           Start Check-In <ArrowRightIcon />
         </button>
      </div>
    );
  }

  // RENDER: ACTIVE CHAT/VOICE VIEW
  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-brand-navy overflow-hidden relative">
      {/* Header */}
      <div className={`p-4 flex items-center gap-4 text-white z-10 transition-colors duration-500 ${mode === 'voice' ? 'bg-brand-teal' : 'bg-brand-navy'}`}>
        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-white transition-all duration-300 ${mascotExpression === 'thinking' ? 'bg-brand-lavender scale-110 shadow-[0_0_15px_rgba(167,172,217,0.5)]' : mascotExpression === 'excited' ? 'bg-brand-coral scale-110' : 'bg-brand-teal'}`}>
           <Mascot expression={mascotExpression} />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl">Windy</h3>
          <p className="text-xs font-sans text-white/80 transition-all flex items-center gap-2">
             {mode === 'voice' && isConnected ? (
                <><span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Live Audio</>
             ) : (
                mascotExpression === 'thinking' ? 'Thinking...' : 'Intake Assistant'
             )}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
            <button 
               onClick={toggleVoiceMode}
               className={`p-2 rounded-lg transition-all ${mode === 'voice' ? 'bg-white text-brand-teal' : 'bg-white/10 text-white hover:bg-white/20'}`}
               title={mode === 'voice' ? "Switch to Text" : "Switch to Voice"}
            >
               {mode === 'voice' ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button 
              onClick={() => {
                disconnect();
                sessionStorage.removeItem(SESSION_KEY);
                setHasStarted(false);
                setMessages([]);
                chatRef.current = null;
              }}
              className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white/60 hover:text-white transition-colors"
            >
              Reset
            </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-hidden relative bg-brand-cream flex flex-col">
        
        {/* VOICE MODE VISUALIZER */}
        {mode === 'voice' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-brand-cream">
              <div 
                 className="relative transition-all duration-75"
                 style={{ transform: `scale(${1 + volume})` }}
              >
                  <div className="w-64 h-64 opacity-10 bg-brand-teal rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div>
                  <Mascot expression={mascotExpression} className="w-48 h-48" />
              </div>
              
              <div className="mt-12 text-center space-y-2">
                 {isConnected ? (
                    <p className="text-brand-navy font-bold text-xl animate-pulse">
                       {isSpeaking ? "Windy is speaking..." : "Listening..."}
                    </p>
                 ) : (
                    <p className="text-brand-navy/40 font-bold">Connecting to audio...</p>
                 )}
                 <p className="text-brand-navy/40 text-sm">Speak clearly. I'm listening.</p>
              </div>

              {/* Live Waveform Simulation */}
              <div className="flex gap-1 h-12 items-center mt-8">
                 {[...Array(5)].map((_,i) => (
                    <div 
                       key={i} 
                       className="w-2 bg-brand-navy rounded-full transition-all duration-75"
                       style={{ 
                          height: isConnected ? `${20 + (volume * 100 * Math.random())}%` : '20%',
                          opacity: isConnected ? 1 : 0.2
                       }}
                    ></div>
                 ))}
              </div>
           </div>
        )}

        {/* TEXT MODE MESSAGES */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 relative transition-opacity duration-300 ${mode === 'voice' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
           <div className="absolute top-10 left-10 text-brand-lavender opacity-20 pointer-events-none">
             <Sparkles size={100} />
           </div>

           {messages.map((msg, idx) => (
             <div
               key={msg.id}
               className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${!isCalmMode && 'animate-slide-up'}`}
             >
               <MessageBubble message={msg} isLast={idx === messages.length - 1} />
             </div>
           ))}
           
           {isAiTyping && (
             <div className={`flex justify-start w-full ${!isCalmMode && 'animate-slide-up'}`}>
               <div className="bg-white border-2 border-brand-lavender/30 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                 <span className="w-2 h-2 bg-brand-teal rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-brand-teal rounded-full animate-bounce delay-100"></span>
                 <span className="w-2 h-2 bg-brand-teal rounded-full animate-bounce delay-200"></span>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA (Only visible in Text Mode) */}
      {mode === 'text' && (
        <div className="p-4 bg-white border-t-2 border-brand-navy/10 z-30">
          <div className={`flex items-center gap-2 bg-brand-cream rounded-xl border-2 p-2 transition-all duration-300 ${isAiTyping ? 'opacity-50 pointer-events-none border-brand-navy/10' : 'border-brand-navy focus-within:ring-4 focus-within:ring-brand-teal/20'}`}>
            <input
              type="text"
              className="flex-1 bg-transparent px-4 py-2 outline-none text-brand-navy font-bold placeholder-brand-navy/40"
              placeholder={isAiTyping ? "Windy is thinking..." : "Type your answer here..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
              disabled={isAiTyping}
            />
            <button
              onClick={handleSend}
              disabled={isAiTyping || !inputText.trim()}
              className={`p-3 rounded-lg transition-all duration-300 border-2 border-brand-navy shadow-[2px_2px_0px_0px_rgba(26,42,58,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                  !inputText.trim() || isAiTyping 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 shadow-none' 
                  : 'bg-brand-coral hover:bg-brand-teal text-brand-navy'
              }`}
            >
              <Send size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
