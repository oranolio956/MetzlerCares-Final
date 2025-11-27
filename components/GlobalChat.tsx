import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Maximize2, Minimize2, ExternalLink, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';
import { startGlobalSession, sendMessageToGemini } from '../services/geminiService';
import { useSound } from '../hooks/useSound';
import { useTypewriter } from '../hooks/useTypewriter';

interface GlobalMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: any[];
}

const MessageBubble: React.FC<{ msg: GlobalMessage; isLast: boolean }> = ({ msg, isLast }) => {
    const displayText = useTypewriter(msg.text, 15, msg.role === 'model' && isLast);
    
    return (
        <div className={`flex flex-col gap-1 mb-4 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-brand-navy text-white rounded-br-sm' : 'bg-white text-brand-navy border border-brand-navy/10 rounded-bl-sm'}`}>
                {msg.role === 'model' ? displayText : msg.text}
            </div>
            
            {/* Sources / Grounding Data */}
            {msg.sources && msg.sources.length > 0 && (
                <div className="flex gap-2 flex-wrap max-w-[85%]">
                    {msg.sources.map((source: any, idx: number) => (
                        source.web?.uri && (
                            <a 
                                key={idx} 
                                href={source.web.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] bg-white/50 border border-brand-navy/10 px-2 py-1 rounded-md text-brand-navy/60 hover:text-brand-teal hover:border-brand-teal transition-colors flex items-center gap-1 truncate max-w-[200px]"
                            >
                                <ExternalLink size={10} /> {source.web.title || "Source"}
                            </a>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export const GlobalChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playClick, playSuccess, playHover } = useSound();

  useEffect(() => {
      if (isOpen && !sessionRef.current) {
          sessionRef.current = startGlobalSession();
          if (!hasGreeted) {
              setIsTyping(true);
              setTimeout(() => {
                  setMessages([{
                      id: 'init',
                      role: 'model',
                      text: "Hi! I'm Windy. I can answer questions about SecondWind, find local meetings, or help you navigate recovery resources. What do you need?"
                  }]);
                  setIsTyping(false);
                  setHasGreeted(true);
                  playSuccess();
              }, 600);
          }
      }
      if (isOpen && inputRef.current) {
          setTimeout(() => inputRef.current?.focus(), 100);
      }
  }, [isOpen]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
      if (!inputText.trim()) return;
      playClick();
      
      const userText = inputText;
      setInputText('');
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
      setIsTyping(true);

      try {
          // Note: sendMessageToGemini now returns an object { text, sources }
          const response = await sendMessageToGemini(userText, sessionRef.current);
          setMessages(prev => [...prev, { 
              id: (Date.now() + 1).toString(), 
              role: 'model', 
              text: response.text,
              sources: response.sources
          }]);
      } catch (e) {
          setMessages(prev => [...prev, { id: 'err', role: 'model', text: "I lost my connection to the server. Try again?" }]);
      } finally {
          setIsTyping(false);
      }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); playClick(); }}
        onMouseEnter={playHover}
        className={`fixed bottom-6 right-6 z-[90] w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-4 border-white ${isOpen ? 'bg-brand-navy rotate-90' : 'bg-white'}`}
        aria-label="Open Support Chat"
      >
        {isOpen ? (
            <X className="text-white" size={28} />
        ) : (
            <div className="relative w-full h-full p-2">
                <Mascot expression="excited" className="w-full h-full" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-brand-teal rounded-full border-2 border-white animate-pulse"></div>
            </div>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed z-[90] bg-[#FDFBF7] shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-brand-navy/5 ${
            isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-10 pointer-events-none'
        } ${
            isExpanded 
            ? 'bottom-0 right-0 w-full h-full md:bottom-24 md:right-6 md:w-[600px] md:h-[80vh] md:rounded-3xl' 
            : 'bottom-24 right-6 w-[calc(100vw-3rem)] h-[500px] max-w-[380px] rounded-[2rem]'
        }`}
      >
         {/* Header */}
         <div className="bg-brand-navy p-4 flex justify-between items-center shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/20 to-transparent"></div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Mascot expression="thinking" variant="tech" className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight">Windy Support</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Gemini 3 Pro • Search Active</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 relative z-10">
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:block">
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#FDFBF7] relative">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1A2A3A 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 p-8">
                    <Sparkles className="text-brand-teal mb-4" size={32} />
                    <p className="text-sm font-bold text-brand-navy">Ask me anything about SecondWind.</p>
                </div>
            )}

            {messages.map((msg, idx) => (
                <MessageBubble key={msg.id} msg={msg} isLast={idx === messages.length - 1} />
            ))}
            
            {isTyping && (
                <div className="flex gap-2 ml-4 mb-4 items-center animate-slide-up">
                    <div className="w-2 h-2 bg-brand-navy/20 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-brand-navy/20 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                    <div className="w-2 h-2 bg-brand-navy/20 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                </div>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input */}
         <div className="p-3 bg-white border-t border-brand-navy/5 shrink-0">
            <div className="relative flex items-center">
                <input 
                    ref={inputRef}
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a question..."
                    className="w-full bg-brand-navy/5 text-brand-navy rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all placeholder:text-brand-navy/30"
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputText.trim() || isTyping}
                    className="absolute right-2 p-2 bg-brand-navy text-white rounded-lg hover:bg-brand-teal transition-colors disabled:opacity-50 disabled:hover:bg-brand-navy shadow-sm"
                >
                    <Send size={16} />
                </button>
            </div>
            <div className="mt-2 text-center">
                <span className="text-[10px] text-brand-navy/30 font-bold uppercase tracking-wider">Powered by Gemini 3 Pro</span>
            </div>
         </div>

      </div>
    </>
  );
};
