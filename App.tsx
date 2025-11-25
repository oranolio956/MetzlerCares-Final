import React, { useEffect, useState, useRef } from 'react';
import { IntakeChat } from './components/IntakeChat';
import { DonationFlow } from './components/DonationFlow';
import { BeneficiaryDashboard } from './components/BeneficiaryDashboard';
import { DonorDashboard } from './components/DonorDashboard';
import { TransparencyLedger } from './components/TransparencyLedger';
import { PhilosophySection } from './components/PhilosophySection';
import { HeroSection } from './components/HeroSection';
import { NotificationSystem } from './components/NotificationSystem';
import { SectionWrapper } from './components/SectionWrapper'; 
import { ErrorBoundary } from './components/ErrorBoundary';
import { useRouter } from './hooks/useRouter';
import { useStore } from './context/StoreContext';
import { useSound } from './hooks/useSound';
import { Confetti } from './components/Confetti';
import { HeartHandshake, UserCircle, Volume2, VolumeX, Eye, EyeOff, TrendingUp, Twitter, Instagram, Linkedin, Activity, Globe } from 'lucide-react';

const BrandLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SecondWind Logo">
    <defs>
      <linearGradient id="beam_grad" x1="50" y1="70" x2="50" y2="15">
        <stop offset="0%" stopColor="#2D9C8E" />
        <stop offset="100%" stopColor="#FF8A75" />
      </linearGradient>
    </defs>
    <path d="M25 75 H75 V85 C75 90 70 95 60 95 H40 C30 95 25 90 25 85 V75 Z" fill="#1A2A3A" />
    <path d="M38 75 L50 15 L62 75 H38 Z" fill="url(#beam_grad)" className="animate-pulse" />
    <circle cx="50" cy="15" r="6" fill="white" className="animate-ping" style={{ animationDuration: '3s' }} />
    <circle cx="50" cy="15" r="3" fill="white" />
  </svg>
);

const App: React.FC = () => {
  const { route: activeSection, navigate } = useRouter();
  const { isCalmMode, toggleCalmMode, isSoundEnabled, toggleSound } = useStore();
  const { playClick, playHover } = useSound();
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Mouse Tracking for Blobs
  useEffect(() => {
    if (isCalmMode || window.matchMedia("(max-width: 768px)").matches) return;
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
           const x = (e.clientX / window.innerWidth) * 2 - 1;
           const y = (e.clientY / window.innerHeight) * 2 - 1;
           containerRef.current.style.setProperty('--mouse-x', x.toString());
           containerRef.current.style.setProperty('--mouse-y', y.toString());
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isCalmMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: isCalmMode ? 'auto' : 'smooth' });
  }, [activeSection, isCalmMode]);

  const renderContent = () => {
    switch (activeSection) {
      case 'intro': return <HeroSection onNavigate={navigate} />;
      case 'philosophy': return <PhilosophySection onNavigate={navigate} />;
      case 'donate': return (
          <SectionWrapper id="donate" title="Invest in Recovery | SecondWind" description="Directly fund rent, bus passes, and tech for people in recovery.">
             <DonationFlow />
          </SectionWrapper>
        );
      case 'apply': return (
          <SectionWrapper id="apply" title="Get Support | SecondWind" description="Chat with Windy for immediate assistance assessment.">
             <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto px-4">
               <div className="text-center max-w-2xl mx-auto mb-4 md:mb-8">
                  <h2 className="font-display font-bold text-3xl md:text-5xl text-brand-navy mb-4">Let's get you sorted.</h2>
                  <p className="text-brand-navy/60 text-lg">No long forms. Just a chat. Tell us what you need.</p>
               </div>
               <IntakeChat />
             </div>
          </SectionWrapper>
        );
      case 'portal': return (
          <SectionWrapper id="portal" title="My Dashboard | SecondWind">
             <BeneficiaryDashboard />
          </SectionWrapper>
        );
      case 'donor-portal': return (
          <SectionWrapper id="donor-portal" title="Impact Portfolio | SecondWind">
             <DonorDashboard />
          </SectionWrapper>
        );
      case 'ledger': return (
          <SectionWrapper id="ledger" title="Transparency Ledger | SecondWind">
             <TransparencyLedger />
          </SectionWrapper>
        );
      default: return <HeroSection onNavigate={navigate} />;
    }
  };

  const bgColor = isCalmMode ? 'bg-[#F2F2F2]' : 'bg-[#FDFBF7]';
  const headerBg = isCalmMode ? 'bg-[#F2F2F2]' : 'bg-[#FDFBF7]'; // Match main body exactly

  return (
    <ErrorBoundary>
      <div 
        ref={containerRef}
        className={`min-h-[100dvh] w-full transition-colors duration-500 flex flex-col ${bgColor} relative`}
      >
        
        {/* GLOBAL BACKGROUND BLOBS - Fixed position ensures they cover the top padding area */}
        <div 
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translate(calc(var(--mouse-x, 0) * -10px), calc(var(--mouse-y, 0) * -10px))` }}
            aria-hidden="true"
        >
            <div className="absolute top-[-10%] left-[-20%] md:left-[10%] w-[200px] md:w-[600px] h-[200px] md:h-[600px] bg-brand-teal opacity-10 rounded-full filter blur-[40px] md:blur-[100px] animate-blob mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] right-[-20%] md:right-[10%] w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-brand-coral opacity-10 rounded-full filter blur-[40px] md:blur-[100px] animate-blob mix-blend-multiply" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-[30%] left-[50%] w-[150px] md:w-[300px] h-[150px] md:h-[300px] bg-brand-yellow opacity-10 rounded-full filter blur-[40px] md:blur-[80px] animate-blob mix-blend-multiply" style={{animationDelay: '4s'}}></div>
        </div>

        <Confetti />
        <NotificationSystem />

        {/* --- HEADER --- */}
        <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-6 transition-all duration-300 ${scrolled ? 'py-2 md:py-3' : 'py-3 md:py-6'} pointer-events-none`}>
            <div className={`
              w-full max-w-7xl 
              ${headerBg}
              rounded-2xl md:rounded-full 
              flex items-center justify-between
              p-2 pr-3
              pointer-events-auto
              transition-all duration-300
              ${scrolled ? 'shadow-lg border border-brand-navy/5' : 'border border-transparent'}
            `}>
                {/* Identity */}
                <div 
                  onClick={() => { playClick(); navigate('intro'); }}
                  className="flex items-center gap-3 pl-2 pr-4 cursor-pointer group select-none"
                >
                   <div className="relative transition-transform duration-500 group-hover:-translate-y-0.5">
                      <BrandLogo className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md relative z-10" />
                   </div>
                   <div className="flex flex-col justify-center">
                      <span className="font-display font-bold text-brand-navy leading-none text-lg md:text-xl tracking-tight group-hover:text-brand-teal transition-colors">SecondWind</span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity mt-0.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse"></span>
                         <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-navy">Live Impact</span>
                      </div>
                   </div>
                </div>

                {/* Nav (Desktop) */}
                <nav className="hidden md:flex items-center gap-1 bg-brand-navy/5 rounded-full p-1.5 border border-brand-navy/5">
                   {[
                     { id: 'philosophy', label: 'Philosophy', icon: Globe },
                     { id: 'donate', label: 'Invest', icon: TrendingUp },
                     { id: 'ledger', label: 'Ledger', icon: Activity }
                   ].map((item) => {
                     const Icon = item.icon;
                     const isActive = activeSection === item.id;
                     return (
                       <button
                         key={item.id}
                         onClick={() => { playClick(); navigate(item.id); }}
                         onMouseEnter={playHover}
                         className={`
                           px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300
                           ${isActive 
                             ? 'bg-white text-brand-navy shadow-sm' 
                             : 'text-brand-navy/60 hover:text-brand-navy hover:bg-white/50'
                           }
                         `}
                       >
                         {isActive && <Icon size={14} className="text-brand-teal" />}
                         {item.label}
                       </button>
                     )
                   })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                   <div className="hidden sm:flex items-center border-r border-brand-navy/10 pr-3 gap-1">
                      <button 
                        onClick={() => { playClick(); toggleSound(); }} 
                        className="p-2.5 rounded-full text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors"
                        aria-label="Toggle Sound"
                      >
                          {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      </button>
                      <button 
                        onClick={() => { playClick(); toggleCalmMode(); }} 
                        className="p-2.5 rounded-full text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors"
                        aria-label="Toggle Calm Mode"
                      >
                          {isCalmMode ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                   </div>
                   
                   {activeSection === 'intro' || activeSection === 'portal' ? (
                      <button 
                        onClick={() => { playClick(); navigate('portal'); }}
                        className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 bg-white border border-brand-navy/10 rounded-full text-sm font-bold text-brand-navy hover:bg-brand-cream hover:border-brand-navy/20 transition-all"
                      >
                        <UserCircle size={18} />
                        <span className="hidden sm:inline">Portal</span>
                      </button>
                   ) : (
                      <button 
                        onClick={() => { playClick(); navigate('donor-portal'); }}
                        className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-brand-navy text-white rounded-full text-sm font-bold shadow-lg hover:bg-brand-teal hover:shadow-brand-teal/30 hover:-translate-y-0.5 transition-all group"
                      >
                        <TrendingUp size={16} className="text-brand-yellow group-hover:animate-bounce" />
                        <span className="hidden sm:inline">Portfolio</span>
                        <span className="sm:hidden">Invest</span>
                      </button>
                   )}
                </div>
            </div>
        </header>
        
        {/* Mobile Menu (Bottom Bar) - With Safe Area Support */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-[90] pointer-events-auto pb-[env(safe-area-inset-bottom)]">
           <div className="bg-brand-navy/90 backdrop-blur-xl text-white p-2 rounded-2xl shadow-2xl border border-white/10 flex justify-around items-center">
             {[
               { id: 'intro', icon: HeartHandshake, label: 'Home' },
               { id: 'donate', icon: TrendingUp, label: 'Invest' },
               { id: 'apply', icon: UserCircle, label: 'Apply' },
               { id: 'ledger', icon: Activity, label: 'Ledger' }
             ].map((item) => {
               const Icon = item.icon;
               const isActive = activeSection === item.id;
               return (
                 <button 
                   key={item.id}
                   onClick={() => { playClick(); navigate(item.id); }}
                   className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 w-full min-h-[44px] ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
                 >
                    <Icon size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                 </button>
               )
             })}
           </div>
        </div>

        {/* Main Content Area - Responsive Padding to prevent header overlap. z-10 ensures content sits above blobs */}
        <main 
           id="main-content"
           className="relative z-10 flex-grow flex flex-col pt-28 md:pt-36 pb-32 md:pb-0 min-h-[100dvh]"
        >
           {renderContent()}
        </main>

        {activeSection !== 'intro' && (
           <footer className="w-full max-w-7xl mx-auto px-6 md:px-8 py-12 border-t border-brand-navy/5 mt-auto mb-24 md:mb-0 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
                 <p className="text-sm font-bold text-brand-navy text-center md:text-left">
                    © 2024 SecondWind Non-Profit. 501(c)(3) Recognized.<br/>
                    <span className="font-medium text-xs text-brand-navy/60 mt-1 block">Open Ledger Active • 100% Direct-to-Vendor</span>
                 </p>
                 <div className="flex gap-6">
                    <button className="hover:text-brand-teal transition-colors transform hover:scale-110 p-2"><Twitter size={20} /></button>
                    <button className="hover:text-brand-coral transition-colors transform hover:scale-110 p-2"><Instagram size={20} /></button>
                    <button className="hover:text-brand-yellow transition-colors transform hover:scale-110 p-2"><Linkedin size={20} /></button>
                 </div>
              </div>
           </footer>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;