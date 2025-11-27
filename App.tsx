import React, { useEffect, useState, useRef } from 'react';
import { IntakeChat } from './components/IntakeChat';
import { DonationFlow } from './components/DonationFlow';
import { BeneficiaryDashboard } from './components/BeneficiaryDashboard';
import { DonorDashboard } from './components/DonorDashboard';
import { TransparencyLedger } from './components/TransparencyLedger';
import { PhilosophySection } from './components/PhilosophySection';
import { HeroSection } from './components/HeroSection';
import { PartnerFlow } from './components/PartnerFlow';
import { PeerCoachingSection } from './components/PeerCoachingSection';
import { NotificationSystem } from './components/NotificationSystem';
import { SectionWrapper } from './components/SectionWrapper'; 
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginExperience } from './components/LoginExperience';
import { useRouter } from './hooks/useRouter';
import { useStore } from './context/StoreContext';
import { useSound } from './hooks/useSound';
import { Confetti } from './components/Confetti';
import { HeartHandshake, UserCircle, Volume2, VolumeX, Eye, EyeOff, TrendingUp, Twitter, Instagram, Linkedin, Activity, Globe, LogIn, LogOut, Menu, X, ArrowRight, Zap, MapPin } from 'lucide-react';

const BrandLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SecondWind Logo">
    {/* Navy Base - Foundation */}
    <path 
      d="M15 55C15 85 40 95 75 95V75C55 75 40 70 40 55H15Z" 
      fill="#1A2A3A" 
    />
    {/* Teal Ascent - Potential */}
    <path 
      d="M85 45C85 15 60 5 25 5V25C45 25 60 30 60 45H85Z" 
      fill="#2D9C8E" 
    />
    {/* Coral Spark - Catalyst */}
    <circle cx="50" cy="50" r="12" fill="#FF8A75" className="animate-pulse" />
  </svg>
);

const App: React.FC = () => {
  const { route: activeSection, navigate } = useRouter();
  const { isCalmMode, toggleCalmMode, isSoundEnabled, toggleSound, userType, login, logout } = useStore();
  const { playClick, playHover } = useSound();
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Mouse Tracking for Mascot Eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      const clampedX = Math.max(-1, Math.min(1, x));
      const clampedY = Math.max(-1, Math.min(1, y));
      document.body.style.setProperty('--mouse-x', clampedX.toFixed(2));
      document.body.style.setProperty('--mouse-y', clampedY.toFixed(2));
    };

    if (!isCalmMode) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCalmMode]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: isCalmMode ? 'auto' : 'smooth' });
    setIsMobileMenuOpen(false); // Close menu on route change
  }, [activeSection, isCalmMode]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleLoginSuccess = (type: 'donor' | 'beneficiary') => {
    login(type);
    if (type === 'donor') navigate('donor-portal');
    if (type === 'beneficiary') navigate('portal');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'intro': return <HeroSection onNavigate={navigate} />;
      
      case 'philosophy': return <PhilosophySection onNavigate={navigate} />;
      
      case 'donate': return (
          <SectionWrapper 
            id="donate" 
            title="Donate to Sober Living Colorado | Fund Recovery Directly" 
            description="The most effective way to donate to addiction recovery in Denver. 100% of funds go to verified vendor payments for rent, bus passes, and work tech."
            schema={{
              "@context": "https://schema.org",
              "@type": "DonateAction",
              "name": "Fund Sober Living Rent",
              "description": "Pay rent directly for someone in a Colorado Oxford House.",
              "object": { "@type": "Offer", "price": "250", "priceCurrency": "USD" },
              "recipient": { "@type": "NGO", "name": "SecondWind Colorado" }
            }}
          >
             <DonationFlow />
          </SectionWrapper>
        );
      
      case 'apply': return (
          <SectionWrapper 
            id="apply" 
            title="Apply for Sober Living Funding | Colorado Recovery Aid" 
            description="Immediate rent assistance and rehab funding for Colorado residents. Chat with our AI intake for immediate assessment. We fund Oxford House rent and rehab transport."
            schema={{
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Emergency Sober Living Funding",
              "provider": { "@type": "NGO", "name": "SecondWind" },
              "areaServed": ["Denver", "Boulder", "Colorado Springs"],
              "serviceType": "Rent Assistance",
              "offers": { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sober Living Rent Payment" } }
            }}
          >
             <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto px-4">
               <div className="text-center max-w-2xl mx-auto mb-4 md:mb-8">
                  <h2 className="font-display font-bold text-3xl md:text-5xl text-brand-navy mb-4">Let's get you sorted.</h2>
                  <p className="text-brand-navy/60 text-lg">No long forms. Just a chat. Tell us what you need.</p>
               </div>
               <IntakeChat />
             </div>
          </SectionWrapper>
        );

      case 'peer-coaching': return (
        <PeerCoachingSection onNavigate={navigate} />
      );
      
      case 'partner': return (
          <SectionWrapper
            id="partner"
            title="Partner With Us | Recovery Residence Network"
            description="Join the SecondWind network. We fill beds with verified leads and pay the rent directly via protocol transfer."
          >
            <PartnerFlow />
          </SectionWrapper>
      );

      case 'portal': 
        if (userType !== 'beneficiary') {
          setTimeout(() => navigate('intro'), 0);
          return null;
        }
        return (
          <SectionWrapper id="portal" title="My Dashboard | SecondWind">
             <BeneficiaryDashboard />
          </SectionWrapper>
        );
      
      case 'donor-portal': 
        if (userType !== 'donor') {
          setTimeout(() => navigate('intro'), 0);
          return null;
        }
        return (
          <SectionWrapper id="donor-portal" title="Impact Portfolio | SecondWind">
             <DonorDashboard />
          </SectionWrapper>
        );
      
      case 'ledger': return (
          <SectionWrapper 
            id="ledger" 
            title="Live Transparency Ledger | Colorado Non-Profit Audit"
            description="View our real-time impact in Colorado. See every donation for sober living and rehab assistance tracked on a public ledger."
            className="mb-24 md:mb-32"
            schema={{
               "@context": "https://schema.org",
               "@type": "Dataset",
               "name": "SecondWind Impact Ledger",
               "description": "Real-time record of direct-to-vendor payments for recovery services in Colorado."
            }}
          >
             <TransparencyLedger />
          </SectionWrapper>
        );
      
      default: return <HeroSection onNavigate={navigate} />;
    }
  };

  const bgColor = isCalmMode ? 'bg-[#F2F2F2]' : 'bg-[#FDFBF7]';

  return (
    <ErrorBoundary>
      <div 
        className={`min-h-[100dvh] w-full transition-colors duration-500 flex flex-col ${bgColor} relative`}
      >
        <LoginExperience 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onLoginSuccess={handleLoginSuccess}
        />

        {/* FULL SCREEN MOBILE MENU OVERLAY */}
        <div 
          className={`fixed inset-0 z-[100] bg-brand-navy/95 backdrop-blur-xl text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isMobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}
        >
           <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 opacity-50">
                 <BrandLogo className="w-8 h-8 grayscale brightness-200" />
                 <span className="font-display font-bold text-lg">Menu</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              <button onClick={() => { navigate('intro'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <Activity size={24} /> Home
              </button>
              <button onClick={() => { navigate('apply'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <HeartHandshake size={24} /> Get Help
              </button>
              <button onClick={() => { navigate('donate'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <TrendingUp size={24} /> Invest
              </button>
              <button onClick={() => { navigate('philosophy'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <Globe size={24} /> Protocol
              </button>
              <button onClick={() => { navigate('peer-coaching'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <Zap size={24} /> Peer Coaching
              </button>
              <button onClick={() => { navigate('partner'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <UserCircle size={24} /> Partner
              </button>
              <button onClick={() => { navigate('ledger'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <Activity size={24} /> Ledger
              </button>
           </div>

           <div className="p-4 border-t border-white/10 shrink-0">
              {userType ? (
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full bg-white/10 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <LogOut size={20} /> Sign Out
                </button>
              ) : (
                <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-brand-teal text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <LogIn size={20} /> Member Login
                </button>
              )}
           </div>
        </div>

        {/* HEADER */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-brand-navy/90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-4 md:py-6'}`}>
           <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
              
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('intro')}>
                 <BrandLogo className={`w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:rotate-12 ${isCalmMode || scrolled ? 'brightness-100' : 'brightness-0 md:brightness-100'}`} />
                 <span className={`font-display font-bold text-xl tracking-tight ${isCalmMode || scrolled ? 'text-white' : 'text-brand-navy md:text-brand-navy opacity-0 md:opacity-100'}`}>SecondWind</span>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-sm">
                 {[
                   { id: 'intro', label: 'Home' },
                   { id: 'philosophy', label: 'Protocol' },
                   { id: 'donate', label: 'Invest' },
                   { id: 'apply', label: 'Get Help' },
                   { id: 'ledger', label: 'Ledger' }
                 ].map((link) => (
                    <button 
                      key={link.id}
                      onClick={() => navigate(link.id)}
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeSection === link.id ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/5'}`}
                    >
                      {link.label}
                    </button>
                 ))}
              </nav>

              {/* Controls */}
              <div className="flex items-center gap-3">
                 <button onClick={toggleSound} className={`p-2.5 rounded-full transition-colors hidden sm:flex ${scrolled ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5'}`}>
                    {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                 </button>
                 <button onClick={toggleCalmMode} className={`p-2.5 rounded-full transition-colors hidden sm:flex ${scrolled ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5'}`}>
                    {isCalmMode ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
                 
                 {userType ? (
                    <button onClick={() => navigate(userType === 'donor' ? 'donor-portal' : 'portal')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-full font-bold text-sm hover:bg-brand-teal transition-colors shadow-lg">
                       <UserCircle size={18} />
                       <span>Dashboard</span>
                    </button>
                 ) : (
                    <button onClick={() => setIsLoginOpen(true)} className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors border-2 ${scrolled ? 'border-white/20 text-white hover:bg-white hover:text-brand-navy' : 'border-brand-navy/10 text-brand-navy hover:border-brand-navy'}`}>
                       <LogIn size={16} />
                       <span>Login</span>
                    </button>
                 )}

                 <button onClick={() => setIsMobileMenuOpen(true)} className={`lg:hidden p-2 rounded-full ${scrolled ? 'text-white' : 'text-brand-navy'}`}>
                    <Menu size={24} />
                 </button>
              </div>

           </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-grow flex flex-col relative z-0">
           {renderContent()}
        </main>

        <NotificationSystem />
        <Confetti />

      </div>
    </ErrorBoundary>
  );
};

export default App;