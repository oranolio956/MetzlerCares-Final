
import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCircle, RefreshCw, Trash2, Sparkles, MessageSquare } from 'lucide-react';
import { startCoachSession, sendMessageToGemini } from '../services/geminiService';
import { Message } from '../types';
import { useTypewriter } from '../hooks/useTypewriter';
import { useSound } from '../hooks/useSound';
import { Mascot } from './Mascot';
import { useStore } from '../context/StoreContext';

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const displayText = useTypewriter(message.text, 10, message.role === 'model');
  
  return (
    <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up mb-6`}>
       {message.role === 'model' ? (
        <div className="flex gap-4 max-w-[90%]">
          <div className="shrink-0 pt-1">
             <div className="w-10 h-10 rounded-full bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20 text-brand-yellow font-bold" aria-hidden="true">
                <Sparkles size={18} />
             </div>
          </div>
          <div className="space-y-1">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-brand-navy/5 shadow-sm text-brand-navy font-medium text-base leading-relaxed whitespace-pre-wrap">
                {displayText}
             </div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/30">
                Coach Windy (Pro)
             </div>
          </div>
        </div>
       ) : (
         <div className="max-w-[85%] bg-brand-navy text-white px-5 py-3 rounded-2xl rounded-tr-none text-base font-medium shadow-md">
            {message.text}
         </div>
       )}
    </div>
  );
};

export const CoachChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playClick, playSuccess } = useSound();
  const { authToken, addNotification } = useStore();

  useEffect(() => {
    // Initialize Pro Chat
    chatRef.current = startCoachSession();
    
    // Initial greeting
    setTimeout(() => {
        setMessages([{
            id: 'init',
            role: 'model',
            text: "Hello. I am your advanced recovery coach. I can help you with career planning, navigating difficult emotions, or building a long-term sobriety roadmap. What's on your mind today?"
        }]);
        playSuccess();
    }, 500);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    playClick();
    const text = inputText;
    setInputText('');
    
    const userMessage = { id: Date.now().toString(), role: 'user', text } as Message;
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsTyping(true);

    try {
        if (!authToken) {
          throw new Error('Please log in before chatting.');
        }

        const response = await sendMessageToGemini(text, chatRef.current, newHistory, authToken);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text }]);
    } catch (e) {
        addNotification('error', e instanceof Error ? e.message : 'Unable to reach backend.');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting to the Pro network. Please try again." }]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleReset = () => {
      playClick();
      setMessages([]);
      chatRef.current = startCoachSession();
      setTimeout(() => {
        setMessages([{
            id: Date.now().toString(),
            role: 'model',
            text: "Session reset. How can I help you navigate your recovery today?"
        }]);
      }, 300);
  };

  return (
    <div className="flex flex-col h-[700px] w-full max-w-4xl mx-auto bg-[#FDFBF7] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
        
        {/* Header */}
        <header className="h-20 bg-brand-navy flex items-center justify-between px-8 text-white relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/10 to-transparent"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Mascot expression="thinking" variant="tech" className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-display font-bold text-xl">Recovery Coach Pro</h3>
                    <div className="flex items-center gap-1.5 text-xs text-brand-yellow font-bold uppercase tracking-wider opacity-80">
                        <Sparkles size={12} /> Powered by Gemini 3 Pro
                    </div>
                </div>
            </div>
            <button onClick={handleReset} className="p-2 text-white/40 hover:text-white transition-colors relative z-10">
                <RefreshCw size={20} />
            </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
            {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
            ))}
            {isTyping && (
               <div className="flex gap-4 animate-slide-up ml-14">
                  <div className="flex items-center gap-1 p-3 bg-white rounded-xl shadow-sm border border-brand-navy/5">
                     <div className="w-1.5 h-1.5 bg-brand-navy/40 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-brand-navy/40 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                     <div className="w-1.5 h-1.5 bg-brand-navy/40 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-brand-navy/5 p-4 md:p-6 shrink-0">
            <div className="relative flex items-center gap-2">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about career, relationships, or complex recovery challenges..."
                    className="w-full bg-brand-navy/5 text-brand-navy placeholder:text-brand-navy/30 rounded-xl px-4 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all pr-12"
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || isTyping}
                    className="absolute right-2 bg-brand-navy text-white p-2.5 rounded-lg hover:bg-brand-yellow hover:text-brand-navy transition-colors disabled:opacity-50 disabled:hover:bg-brand-navy disabled:hover:text-white"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};
