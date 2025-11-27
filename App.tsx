
import React, { useEffect, useState } from 'react';
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
import { Footer } from './components/Footer';
import { RecoveryDirectory } from './components/RecoveryDirectory';
import { PartnerDirectory } from './components/PartnerDirectory';
import { ImpactTicker } from './components/ImpactTicker';
import { HyperLocalMap } from './components/HyperLocalMap';
import { MedicaidPromo } from './components/MedicaidPromo';
import { HeartHandshake, UserCircle, Volume2, VolumeX, Eye, EyeOff, LogIn, LogOut, Activity, Globe, X, Phone, MessageSquare, LifeBuoy } from 'lucide-react';

const BrandLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SecondWind Logo">
    <path d="M15 55C15 85 40 95 75 95V75C55 75 40 70 40 55H15Z" fill="#1A2A3A" />
    <path d="M85 45C85 15 60 5 25 5V25C45 25 60 30 60 45H85Z" fill="#2D9C8E" />
    <circle cx="50" cy="50" r="12" fill="#FF8A75" className="animate-pulse" />
  </svg>
);

// Global Crisis Overlay Component - High Z-Index to block everything
const CrisisOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-brand-coral/98 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
    >
        <button onClick={onClose} className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Close crisis help">
          <X size={32} />
        </button>
        <LifeBuoy size={64} className="text-white mb-6 animate-pulse" />
        <h3 id="crisis-title" className="font-display font-bold text-3xl md:text-5xl text-white mb-2">Immediate Help</h3>
        <p className="text-white/90 text-lg mb-8 max-w-md">Your safety is the priority. Please connect with a human crisis counselor now.</p>
        <div className="flex flex-col w-full max-w-sm gap-4">
          <a href="tel:988" className="bg-white text-brand-coral font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-transform">
            <Phone size={24} /> Call 988 (Crisis Line)
          </a>
          <a href="sms:741741" className="bg-brand-navy text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-transform">
            <MessageSquare size={24} /> Text HOME to 741741
          </a>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const { route: activeSection, navigate } = useRouter();
  const { isCalmMode, toggleCalmMode, isSoundEnabled, toggleSound, userType, login, logout, isCrisisMode, setCrisisMode } = useStore();
  const { playClick } = useSound();
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isCalmMode) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      document.body.style.setProperty('--mouse-x', Math.max(-1, Math.min(1, x)).toFixed(2));
      document.body.style.setProperty('--mouse-y', Math.max(-1, Math.min(1, y)).toFixed(2));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isCalmMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: isCalmMode ? 'auto' : 'smooth' });
    setIsMobileMenuOpen(false);
  }, [activeSection, isCalmMode]);

  useEffect(() => {
    document.body.style.overflow = (isMobileMenuOpen || isCrisisMode) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen, isCrisisMode]);

  const handleLoginSuccess = (type: 'donor' | 'beneficiary') => {
    login(type);
    if (type === 'donor') navigate('donor-portal');
    if (type === 'beneficiary') navigate('portal');
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeSection) {
        case 'intro': return <HeroSection onNavigate={navigate} />;
        case 'philosophy': return <PhilosophySection onNavigate={navigate} />;
        case 'donate': return (
            <SectionWrapper 
              id="donate" 
              title="Donate to Sober Living Colorado" 
              description="Fund recovery directly. 100% of funds go to verified vendor payments."
              schema={{ "@type": "DonateAction", "recipient": { "@type": "NGO", "name": "SecondWind" } }}
            >
               <DonationFlow />
            </SectionWrapper>
          );
        case 'apply': return (
            <SectionWrapper 
              id="apply" 
              title="Apply for Recovery Funding" 
              description="Immediate rent assistance and rehab funding for Colorado residents."
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
        case 'peer-coaching': return <PeerCoachingSection onNavigate={navigate} />;
        case 'partner': return (
            <SectionWrapper
              id="partner"
              title="Partner With Us"
              description="Join the SecondWind network of verified recovery residences."
            >
              <PartnerFlow />
            </SectionWrapper>
        );
        case 'portal': 
          if (userType !== 'beneficiary') { setTimeout(() => navigate('intro'), 0); return null; }
          return <SectionWrapper id="portal" title="My Dashboard"><BeneficiaryDashboard /></SectionWrapper>;
        case 'donor-portal': 
          if (userType !== 'donor') { setTimeout(() => navigate('intro'), 0); return null; }
          return <SectionWrapper id="donor-portal" title="Impact Portfolio"><DonorDashboard /></SectionWrapper>;
        case 'ledger': return (
            <SectionWrapper 
              id="ledger" 
              title="Transparency Ledger"
              description="View our real-time impact in Colorado."
              className="mb-24 md:mb-32"
            >
               <TransparencyLedger />
            </SectionWrapper>
          );
        default: return <HeroSection onNavigate={navigate} />;
      }
    })();

    // Animation Wrapper for Smooth Transitions with explicit key
    return (
      <div 
        key={activeSection} 
        className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards w-full"
      >
        {content}
      </div>
    );
  };

  const bgColor = isCalmMode ? 'bg-[#F2F2F2]' : 'bg-[#FDFBF7]';

  return (
    <ErrorBoundary>
      <div className={`min-h-[100dvh] w-full transition-colors duration-500 flex flex-col ${bgColor} relative selection:bg-brand-teal selection:text-white overflow-x-hidden`}>
        
        {/* GLOBAL OVERLAYS */}
        <CrisisOverlay isOpen={isCrisisMode} onClose={() => setCrisisMode(false)} />
        <LoginExperience isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
        <NotificationSystem />
        <MedicaidPromo />

        {/* MOBILE MENU - Lower Z-Index than Crisis Overlay but higher than content */}
        <div className={`fixed inset-0 z-[100] bg-brand-navy/95 backdrop-blur-xl text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${isMobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}>
           <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 opacity-50">
                 <BrandLogo className="w-8 h-8 grayscale brightness-200" />
                 <span className="font-display font-bold text-lg">Menu</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/50 hover:text-white transition-colors" aria-label="Close menu">
                <X size={24} />
              </button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {[
                { id: 'intro', icon: Activity, label: 'Home' },
                { id: 'apply', icon: HeartHandshake, label: 'Get Help' },
                { id: 'donate', icon: Activity, label: 'Invest' },
                { id: 'philosophy', icon: Globe, label: 'Protocol' },
                { id: 'ledger', icon: Activity, label: 'Ledger' }
              ].map(item => (
                <button key={item.id} onClick={() => { navigate(item.id); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <item.icon size={24} /> {item.label}
                </button>
              ))}
           </div>
           <div className="p-4 border-t border-white/10 shrink-0">
              {userType ? (
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full bg-white/10 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"><LogOut size={20} /> Sign Out</button>
              ) : (
                <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-brand-teal text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"><LogIn size={20} /> Member Login</button>
              )}
           </div>
        </div>

        {/* HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
            <header className={`transition-all duration-300 w-full ${scrolled ? 'bg-brand-navy/90 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4 md:py-6'}`}>
               <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('intro')}>
                     <BrandLogo className={`w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:rotate-12 ${isCalmMode || scrolled ? 'brightness-100' : 'brightness-0 md:brightness-100'}`} />
                     <span className={`font-display font-bold text-xl tracking-tight ${isCalmMode || scrolled ? 'text-white' : 'text-brand-navy md:text-brand-navy opacity-0 md:opacity-100'}`}>SecondWind</span>
                  </div>
                  
                  <nav className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-sm absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                     {['intro', 'philosophy', 'donate', 'apply', 'ledger'].map((id) => (
                        <button key={id} onClick={() => { navigate(id); playClick(); }} className={`px-5 py-2 rounded-full text-sm font-bold transition-all capitalize ${activeSection === id ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/5'}`}>
                          {id === 'intro' ? 'Home' : id}
                        </button>
                     ))}
                  </nav>

                  <div className="flex items-center gap-3">
                     <button onClick={toggleSound} className={`p-2.5 rounded-full transition-colors hidden sm:flex ${scrolled ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5'}`} aria-label="Toggle sound">
                        {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                     </button>
                     <button onClick={toggleCalmMode} className={`p-2.5 rounded-full transition-colors hidden sm:flex ${scrolled ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5'}`} aria-label="Toggle calm mode">
                        {isCalmMode ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                     {userType ? (
                        <button onClick={() => navigate(userType === 'donor' ? 'donor-portal' : 'portal')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-full font-bold text-sm hover:bg-brand-teal transition-colors shadow-lg">
                           <UserCircle size={18} /> <span>Dashboard</span>
                        </button>
                     ) : (
                        <button onClick={() => setIsLoginOpen(true)} className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors border-2 ${scrolled ? 'border-white/20 text-white hover:bg-white hover:text-brand-navy' : 'border-brand-navy/10 text-brand-navy hover:bg-brand-navy hover:text-white'}`}>
                           <LogIn size={18} /> <span>Member Login</span>
                        </button>
                     )}
                     <button onClick={() => setIsMobileMenuOpen(true)} className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-white' : 'text-brand-navy'}`}>
                       <div className="space-y-1.5">
                         <div className="w-6 h-0.5 bg-current"></div>
                         <div className="w-6 h-0.5 bg-current"></div>
                         <div className="w-6 h-0.5 bg-current"></div>
                       </div>
                     </button>
                  </div>
               </div>
            </header>
            
            {/* Impact Ticker below header */}
            <ImpactTicker />
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-grow pt-[120px]">
           {renderContent()}
        </main>

        {/* SEO COMPONENTS */}
        <RecoveryDirectory />
        <PartnerDirectory />
        <HyperLocalMap />

        <Footer onNavigate={navigate} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
