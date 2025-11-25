
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Clock, Shield } from 'lucide-react';
import { startIntakeSession, sendMessageToGemini } from '../services/geminiService';
import { Message } from '../types';
import { Mascot } from './Mascot';

export const IntakeChat: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [mascotExpression, setMascotExpression] = useState<'happy' | 'thinking' | 'excited' | 'wink'>('happy');
  
  const chatRef = useRef<any>(null); // To store the Chat session instance
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mascot Animation Logic
  useEffect(() => {
    if (isAiTyping) {
      setMascotExpression('thinking');
    } else {
      // Check if the last message was from the model (meaning they just replied)
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
  }, [isAiTyping, messages]);

  useEffect(() => {
    if (hasStarted) {
      // Initialize Chat only when user starts
      chatRef.current = startIntakeSession();
      
      // Initial Greeting
      const initialGreeting = async () => {
        setIsAiTyping(true);
        // Simulate network delay for realism
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

      initialGreeting();
    }
  }, [hasStarted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

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

  // RENDER: LOBBY VIEW (Pre-Chat)
  if (!hasStarted) {
    return (
      <div className="h-[600px] w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(26,42,58,1)] border-4 border-brand-navy overflow-hidden relative flex flex-col items-center justify-center p-8 text-center">
         <div className="absolute top-0 left-0 w-full h-2 bg-brand-navy/5"></div>
         
         <div className="w-32 h-32 mb-6 relative">
            <div className="absolute inset-0 bg-brand-teal rounded-full opacity-10 animate-ping"></div>
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
           onClick={() => setHasStarted(true)}
           className="bg-brand-navy text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-brand-teal hover:scale-105 transition-all shadow-lg flex items-center gap-3"
         >
           Start Check-In <ArrowRightIcon />
         </button>
      </div>
    );
  }

  // RENDER: CHAT VIEW
  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-brand-navy overflow-hidden relative">
      {/* Header */}
      <div className="bg-brand-navy p-4 flex items-center gap-4 text-white z-10 transition-colors duration-500">
        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-white transition-all duration-300 ${mascotExpression === 'thinking' ? 'bg-brand-lavender scale-110 shadow-[0_0_15px_rgba(167,172,217,0.5)]' : mascotExpression === 'excited' ? 'bg-brand-coral scale-110' : 'bg-brand-teal'}`}>
           <Mascot expression={mascotExpression} />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl">Windy</h3>
          <p className="text-xs font-sans text-brand-lavender transition-all">
             {mascotExpression === 'thinking' ? 'Thinking...' : mascotExpression === 'excited' ? 'Got it!' : 'Intake Assistant'}
          </p>
        </div>
        <div className="ml-auto">
          <div className={`w-3 h-3 rounded-full ${mascotExpression === 'thinking' ? 'bg-brand-yellow animate-ping' : 'bg-green-400 animate-pulse'}`}></div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-cream relative">
        {/* Background Decor */}
        <div className="absolute top-10 left-10 text-brand-lavender opacity-20 pointer-events-none">
          <Sparkles size={100} />
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-lg font-medium leading-relaxed shadow-sm transition-all duration-300 ${
                msg.role === 'user'
                  ? 'bg-brand-navy text-white rounded-br-none'
                  : 'bg-white text-brand-navy border-2 border-brand-lavender/30 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isAiTyping && (
          <div className="flex justify-start w-full animate-slide-up">
            <div className="bg-white border-2 border-brand-lavender/30 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-teal rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-brand-teal rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-brand-teal rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t-2 border-brand-navy/10">
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
    </div>
  );
};

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
