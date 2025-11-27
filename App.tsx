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
import { RecoveryKnowledgeGraph } from './components/RecoveryKnowledgeGraph';
import { CoachChat } from './components/CoachChat';
import { VisionBoard } from './components/VisionBoard';
import { GlobalChat } from './components/GlobalChat';
import { PeerCoachingTeaser } from './components/PeerCoachingTeaser';
import { HeartHandshake, UserCircle, Volume2, VolumeX, Eye, EyeOff, LogIn, LogOut, Activity, Globe, X, Phone, MessageSquare, LifeBuoy, Building2, Sparkles, Image, Shield } from 'lucide-react';

const BrandLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SecondWind Logo">
    <path d="M15 55C15 85 40 95 75 95V75C55 75 40 70 40 55H15Z" fill="#1A2A3A" />
    <path d="M85 45C85 15 60 5 25 5V25C45 25 60 30 60 45H85Z" fill="#2D9C8E" />
    <circle cx="50" cy="50" r="12" fill="#FF8A75" className="animate-pulse" />
  </svg>
);

// Global Crisis Overlay Component
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
          <a href="tel:1-844-493-8255" className="bg-white/10 text-white border border-white/20 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/20 transition-transform">
            <Building2 size={20} /> CO Crisis Services
          </a>
        </div>
        <p className="mt-8 text-white/60 text-sm font-bold uppercase tracking-widest">Available 24/7 • Confidential • Bilingual</p>
    </div>
  );
};

// Legal Docs Overlay
const LegalOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 max-h-[80vh] flex flex-col overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-brand-navy/5 flex justify-between items-center bg-brand-cream shrink-0">
                    <h3 className="font-bold text-xl text-brand-navy flex items-center gap-2"><Shield size={20} /> Legal & Compliance</h3>
                    <button onClick={onClose}><X size={24} className="text-brand-navy/40 hover:text-brand-navy" /></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar prose prose-sm text-brand-navy/80">
                    <h4 className="font-bold text-lg text-brand-navy mb-2">1. Terms of Service</h4>
                    <p className="mb-4">By using SecondWind, you acknowledge that we are a platform facilitating direct payments to verified recovery vendors. We do not provide medical advice. All donations are final and non-refundable tax-deductible contributions.</p>
                    
                    <h4 className="font-bold text-lg text-brand-navy mb-2">2. Privacy Policy</h4>
                    <p className="mb-4">We prioritize data minimization. Chat logs in the Intake Assistant are ephemeral and not permanently stored. We do not sell user data to third parties. We comply with 42 CFR Part 2 regarding confidentiality of substance use disorder patient records.</p>
                    
                    <h4 className="font-bold text-lg text-brand-navy mb-2">3. HIPAA Compliance</h4>
                    <p className="mb-4">While SecondWind acts as an administrative intermediary, we adhere to HIPAA standards for data encryption and handling of any health-related information provided during the intake process.</p>
                    
                    <h4 className="font-bold text-lg text-brand-navy mb-2">4. Crisis Disclaimer</h4>
                    <p className="mb-4 font-bold text-brand-coral">If you are in immediate danger, call 911. SecondWind is an administrative tool for funding, not an emergency response service.</p>
                </div>
                <div className="p-6 border-t border-brand-navy/5 bg-white shrink-0">
                    <button onClick={onClose} className="w-full bg-brand-navy text-white py-3 rounded-xl font-bold hover:bg-brand-teal transition-colors">Acknowledge & Close</button>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const { route: activeSection, navigate } = useRouter();
  const { isCalmMode, toggleCalmMode, isSoundEnabled, toggleSound, userType, login, logout, isCrisisMode, setCrisisMode, showLegalDocs, setShowLegalDocs, isAuthenticated } = useStore();
  const { playClick } = useSound();
  const [scrolled, setScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handlePointerMove = (x: number, y: number) => {
        const normX = (x / window.innerWidth) * 2 - 1;
        const normY = (y / window.innerHeight) * 2 - 1;
        document.body.style.setProperty('--mouse-x', Math.max(-1, Math.min(1, normX)).toFixed(2));
        document.body.style.setProperty('--mouse-y', Math.max(-1, Math.min(1, normY)).toFixed(2));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isCalmMode) return;
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isCalmMode || e.touches.length === 0) return;
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
    };
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
    document.body.style.overflow = (isMobileMenuOpen || isCrisisMode || showLegalDocs) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen, isCrisisMode, showLegalDocs]);

  const handleLoginSuccess = (type: 'donor' | 'beneficiary') => {
    login(type);
    if (type === 'donor') navigate('donor-portal');
    if (type === 'beneficiary') navigate('portal');
  };

  const renderContent = () => {
    // AUTH GUARD: Redirect unauthenticated users from protected routes
    if ((activeSection === 'portal' || activeSection === 'coach' || activeSection === 'vision') && (!isAuthenticated || userType !== 'beneficiary')) {
        setTimeout(() => setIsLoginOpen(true), 100);
        return <HeroSection onNavigate={navigate} />; 
    }
    if (activeSection === 'donor-portal' && (!isAuthenticated || userType !== 'donor')) {
        setTimeout(() => setIsLoginOpen(true), 100);
        return <HeroSection onNavigate={navigate} />;
    }

    const content = (() => {
      switch (activeSection) {
        case 'intro': return (
            <>
              <HeroSection onNavigate={navigate} />
              <PeerCoachingTeaser onNavigate={navigate} />
            </>
        );
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
              className="pt-24 pb-4 md:py-24 min-h-[auto]" // Updated Padding for optimized viewport usage
            >
               <div className="flex flex-col items-center gap-4 md:gap-8 w-full max-w-4xl mx-auto px-2 md:px-4 h-full">
                 <div className="text-center max-w-2xl mx-auto mb-2 md:mb-8 shrink-0">
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
        case 'portal': return <SectionWrapper id="portal" title="My Dashboard"><BeneficiaryDashboard /></SectionWrapper>;
        case 'coach':
          return (
            <SectionWrapper id="coach" title="Recovery Coach (Pro)">
                <div className="max-w-4xl mx-auto text-center mb-8">
                    <h2 className="font-display font-bold text-3xl text-brand-navy mb-2">Deep Work</h2>
                    <p className="text-brand-navy/60">Advanced AI coaching for career planning and life strategy.</p>
                </div>
                <CoachChat />
            </SectionWrapper>
          );
        case 'vision':
          return (
            <SectionWrapper id="vision" title="Vision Board">
                <VisionBoard />
            </SectionWrapper>
          );
        case 'donor-portal': return <SectionWrapper id="donor-portal" title="Impact Portfolio"><DonorDashboard /></SectionWrapper>;
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
        <LegalOverlay isOpen={showLegalDocs} onClose={() => setShowLegalDocs(false)} />
        <LoginExperience isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
        <NotificationSystem />
        {/* MedicaidPromo is properly layered via z-index in CSS, mobile menu is z-[100], promo is z-[80] */}
        <MedicaidPromo />
        <GlobalChat activeSection={activeSection} />

        {/* MOBILE MENU */}
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
                { id: 'peer-coaching', icon: UserCircle, label: 'Coaching' },
                { id: 'donate', icon: Activity, label: 'Invest' },
                { id: 'partner', icon: Building2, label: 'Partner' },
                { id: 'philosophy', icon: Globe, label: 'Protocol' },
                { id: 'ledger', icon: Activity, label: 'Ledger' }
              ].map(item => (
                <button key={item.id} onClick={() => { navigate(item.id); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <item.icon size={24} /> {item.label}
                </button>
              ))}
              {userType === 'beneficiary' && (
                  <>
                    <button onClick={() => { navigate('coach'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-brand-yellow hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <Sparkles size={24} /> Recovery Coach (Pro)
                    </button>
                    <button onClick={() => { navigate('vision'); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 p-4 text-2xl font-display font-bold text-brand-teal hover:text-white hover:bg-white/10 rounded-xl transition-all">
                      <Image size={24} /> Vision Board
                    </button>
                  </>
              )}
           </div>
           <div className="p-4 border-t border-white/10 shrink-0">
              {isAuthenticated ? (
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full bg-white/10 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"><LogOut size={20} /> Sign Out</button>
              ) : (
                <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-brand-teal text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"><LogIn size={20} /> Member Login</button>
              )}
              <div className="mt-4 flex justify-center gap-4 text-xs text-white/40 font-bold uppercase tracking-widest">
                  <button onClick={() => { setShowLegalDocs(true); setIsMobileMenuOpen(false); }}>Legal</button>
                  <button onClick={() => { setShowLegalDocs(true); setIsMobileMenuOpen(false); }}>Privacy</button>
              </div>
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
                     {[
                       { id: 'intro', label: 'Home' },
                       { id: 'philosophy', label: 'Protocol' },
                       { id: 'peer-coaching', label: 'Coaching' },
                       { id: 'donate', label: 'Invest' },
                       { id: 'partner', label: 'Network' },
                       { id: 'apply', label: 'Apply' },
                       { id: 'ledger', label: 'Ledger' }
                     ].map((item) => (
                        <button key={item.id} onClick={() => { navigate(item.id); playClick(); }} className={`px-5 py-2 rounded-full text-sm font-bold transition-all capitalize ${activeSection === item.id ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/5'}`}>
                          {item.label}
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
                     {isAuthenticated ? (
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
        <main className="flex-grow pt-[100px] md:pt-[128px]">
           {renderContent()}
        </main>

        {/* SEO & KNOWLEDGE COMPONENTS */}
        <RecoveryKnowledgeGraph />
        <RecoveryDirectory />
        <PartnerDirectory />
        <HyperLocalMap />

        <Footer onNavigate={navigate} />
      </div>
    </ErrorBoundary>
  );
};

export default App;