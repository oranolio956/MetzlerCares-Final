
import React, { useEffect, useState } from 'react';
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

// New Brand Mark: "The Prism Beacon"
// Represents stability (Base) and direct energy transmission (Beam).
const BrandLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SecondWind Logo">
    <defs>
      <linearGradient id="beam_grad" x1="50" y1="70" x2="50" y2="15">
        <stop offset="0%" stopColor="#2D9C8E" />
        <stop offset="100%" stopColor="#FF8A75" />
      </linearGradient>
    </defs>
    
    {/* Base Foundation - Stability */}
    <path 
      d="M25 75 H75 V85 C75 90 70 95 60 95 H40 C30 95 25 90 25 85 V75 Z" 
      fill="#1A2A3A" 
    />
    
    {/* The Direct Beam - Energy/Funding */}
    <path 
      d="M38 75 L50 15 L62 75 H38 Z" 
      fill="url(#beam_grad)" 
      className="animate-pulse"
    />
    
    {/* The Spark - Impact */}
    <circle cx="50" cy="15" r="6" fill="white" className="animate-ping" style={{ animationDuration: '3s' }} />
    <circle cx="50" cy="15" r="3" fill="white" />
  </svg>
);

const App: React.FC = () => {
  // Use Custom Hook for Navigation (Back/Forward support)
  const { route: activeSection, navigate } = useRouter();
  const { isCalmMode, toggleCalmMode, isSoundEnabled, toggleSound } = useStore();
  const { playClick, playHover } = useSound();
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener for header compacting
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: isCalmMode ? 'auto' : 'smooth' });
  }, [activeSection, isCalmMode]);

  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return <HeroSection onNavigate={navigate} />;
      case 'philosophy':
        return <PhilosophySection onNavigate={navigate} />;
      case 'donate':
        return (
          <SectionWrapper id="donate" title="Invest in Recovery | SecondWind" description="Directly fund rent, bus passes, and tech for people in recovery.">
             <DonationFlow />
          </SectionWrapper>
        );
      case 'apply':
        return (
          <SectionWrapper id="apply" title="Get Support | SecondWind" description="Chat with Windy for immediate assistance assessment.">
             <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
               <div className="text-center max-w-2xl mx-auto mb-8 px-4">
                  <h2 className="font-display font-bold text-3xl md:text-5xl text-brand-navy mb-4">Let's get you sorted.</h2>
                  <p className="text-brand-navy/60 text-lg">No long forms. Just a chat. Tell us what you need.</p>
               </div>
               <IntakeChat />
             </div>
          </SectionWrapper>
        );
      case 'portal':
        return (
          <SectionWrapper id="portal" title="My Dashboard | SecondWind">
             <BeneficiaryDashboard />
          </SectionWrapper>
        );
      case 'donor-portal':
        return (
          <SectionWrapper id="donor-portal" title="Impact Portfolio | SecondWind">
             <DonorDashboard />
          </SectionWrapper>
        );
      case 'ledger':
        return (
          <SectionWrapper id="ledger" title="Transparency Ledger | SecondWind">
             <TransparencyLedger />
          </SectionWrapper>
        );
      default:
        return <HeroSection onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen w-full transition-colors duration-500 flex flex-col ${isCalmMode ? 'bg-[#F2F2F2]' : 'bg-[#FDFBF7]'}`}>
        
        <Confetti />
        <NotificationSystem />

        {/* --- CONTROL DECK HEADER --- */}
        <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-6 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'} pointer-events-none`}>
            
            <div className={`
              w-full max-w-7xl 
              bg-white/90 backdrop-blur-xl 
              border border-brand-navy/5 
              rounded-full 
              shadow-[0_8px_32px_rgba(26,42,58,0.04)]
              hover:shadow-[0_16px_48px_rgba(26,42,58,0.08)]
              hover:bg-white
              transition-all duration-300
              flex items-center justify-between
              p-2 pr-3
              pointer-events-auto
            `}>

                {/* 1. Identity & Status */}
                <div 
                  onClick={() => { playClick(); navigate('intro'); }}
                  className="flex items-center gap-3 pl-2 pr-4 cursor-pointer group select-none"
                >
                   <div className="relative transition-transform duration-500 group-hover:-translate-y-0.5">
                      <BrandLogo className="w-10 h-10 drop-shadow-md relative z-10" />
                   </div>
                   
                   <div className="flex flex-col justify-center">
                      <span className="font-display font-bold text-brand-navy leading-none text-xl tracking-tight group-hover:text-brand-teal transition-colors">SecondWind</span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity mt-0.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse"></span>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy">Live Impact</span>
                      </div>
                   </div>
                </div>

                {/* 2. Central Navigation (Desktop) */}
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

                {/* 3. Utility & Actions */}
                <div className="flex items-center gap-3">
                   
                   {/* Toggles */}
                   <div className="hidden sm:flex items-center border-r border-brand-navy/10 pr-3 gap-1">
                      <button 
                        onClick={() => { playClick(); toggleSound(); }} 
                        className="p-2.5 rounded-full text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors"
                        title={isSoundEnabled ? "Mute Audio" : "Enable Audio"}
                      >
                          {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      </button>
                      <button 
                        onClick={() => { playClick(); toggleCalmMode(); }} 
                        className="p-2.5 rounded-full text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors"
                        title={isCalmMode ? "Standard Mode" : "Calm Mode (Reduced Motion)"}
                      >
                          {isCalmMode ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                   </div>

                   {/* Main CTA */}
                   {activeSection === 'intro' || activeSection === 'portal' ? (
                      <button 
                        onClick={() => { playClick(); navigate('portal'); }}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-brand-navy/10 rounded-full text-sm font-bold text-brand-navy hover:bg-brand-cream hover:border-brand-navy/20 transition-all"
                      >
                        <UserCircle size={18} />
                        <span className="hidden sm:inline">Access Portal</span>
                      </button>
                   ) : (
                      <button 
                        onClick={() => { playClick(); navigate('donor-portal'); }}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-full text-sm font-bold shadow-lg hover:bg-brand-teal hover:shadow-brand-teal/30 hover:-translate-y-0.5 transition-all group"
                      >
                        <TrendingUp size={16} className="text-brand-yellow group-hover:animate-bounce" />
                        <span className="hidden sm:inline">My Portfolio</span>
                        <span className="sm:hidden">Portfolio</span>
                      </button>
                   )}
                </div>
            </div>
        </header>
        
        {/* Mobile Menu (Bottom Bar) */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-[90] pointer-events-auto">
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
                   className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 w-full ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}
                 >
                    <Icon size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                 </button>
               )
             })}
           </div>
        </div>

        {/* Main Content Area */}
        <main className="relative z-0 flex-grow flex flex-col pt-28 md:pt-0 pb-28 md:pb-0">
           {renderContent()}
        </main>

        {activeSection !== 'intro' && (
           <footer className="w-full max-w-7xl mx-auto px-6 md:px-8 py-12 border-t border-brand-navy/5 mt-auto mb-24 md:mb-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
                 <p className="text-sm font-bold text-brand-navy text-center md:text-left">
                    © 2024 SecondWind Non-Profit. 501(c)(3) Recognized.<br/>
                    <span className="font-medium text-xs text-brand-navy/60 mt-1 block">Open Ledger Active • 100% Direct-to-Vendor</span>
                 </p>
                 <div className="flex gap-6">
                    <button className="hover:text-brand-teal transition-colors transform hover:scale-110"><Twitter size={20} /></button>
                    <button className="hover:text-brand-coral transition-colors transform hover:scale-110"><Instagram size={20} /></button>
                    <button className="hover:text-brand-yellow transition-colors transform hover:scale-110"><Linkedin size={20} /></button>
                 </div>
              </div>
           </footer>
        )}

      </div>
    </ErrorBoundary>
  );
};

export default App;
