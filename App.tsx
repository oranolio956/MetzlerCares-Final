
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
            description="Join the SecondWind network. We fill beds with verified leads and pay rent directly via protocol transfer."
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
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={24} />
              </button>
           </div>
           
           <div className="flex-1 flex flex-col justify-center px-6 md:px-8 space-y-4 md:space-y-8 overflow-y-auto py-4">
              {[
                { id: 'intro', label: 'Home' },
                { id: 'philosophy', label: 'Protocol' },
                { id: 'donate', label: 'Invest' },
                { id: 'apply', label: 'Intake' },
                { id: 'peer-coaching', label: 'Peer Coaching' },
                { id: 'ledger', label: 'Ledger' },
                { id: 'partner', label: 'Partners' }
              ].map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => { playClick(); navigate(item.id); }}
                  className="text-left font-display font-bold text-3xl md:text-5xl flex items-center justify-between group py-1"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <span className={`transition-colors ${activeSection === item.id ? 'text-brand-teal' : 'text-white group-hover:text-brand-teal/80'}`}>{item.label}</span>
                  <ArrowRight className={`opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-teal hidden md:block`} size={32} />
                </button>
              ))}
              <button
                onClick={() => { playClick(); setIsMobileMenuOpen(false); setIsLoginOpen(true); }}
                className="text-left font-display font-bold text-3xl md:text-5xl flex items-center justify-between group text-brand-coral py-1"
              >
                <span>Login</span>
                <LogIn size={28} className="md:w-8 md:h-8" />
              </button>
           </div>

           <div className="p-6 md:p-8 border-t border-white/10 bg-brand-navy/50 backdrop-blur-sm shrink-0">
              <div className="flex gap-4 mb-6 md:mb-8">
                  <button 
                    onClick={() => { playClick(); toggleSound(); }} 
                    className="flex-1 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 font-bold text-xs md:text-sm hover:bg-white/10 transition-colors"
                  >
                      {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      {isSoundEnabled ? 'Sound On' : 'Sound Off'}
                  </button>
                  <button 
                    onClick={() => { playClick(); toggleCalmMode(); }} 
                    className="flex-1 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 font-bold text-xs md:text-sm hover:bg-white/10 transition-colors"
                  >
                      {isCalmMode ? <EyeOff size={16} /> : <Eye size={16} />}
                      {isCalmMode ? 'Calm Mode' : 'Standard'}
                  </button>
              </div>
              <div className="flex justify-between items-center opacity-40 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                 <span>© 2024 MetzlerFoundations</span>
                 <div className="flex gap-4">
                    <Twitter size={14} />
                    <Instagram size={14} />
                 </div>
              </div>
           </div>
        </div>

        {/* GLOBAL BACKGROUND BLOBS */}
        <div 
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            aria-hidden="true"
        >
            <div className="absolute top-[-10%] left-[-20%] md:left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand-teal opacity-[0.05] rounded-full filter blur-[60px] md:blur-[100px] animate-blob mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] right-[-20%] md:right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-coral opacity-[0.05] rounded-full filter blur-[60px] md:blur-[100px] animate-blob mix-blend-multiply" style={{animationDelay: '2s'}}></div>
        </div>

        <Confetti />
        <NotificationSystem />

        {/* --- RE-DESIGNED HEADER --- */}
        <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${scrolled ? 'py-2 px-2 md:py-3 md:px-4' : 'py-4 px-4 md:py-6'} pointer-events-none`}>
            <div className={`
              w-full max-w-[1800px]
              ${scrolled ? 'bg-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.05)] border-white/40' : 'bg-transparent border-transparent'}
              backdrop-blur-xl border
              rounded-2xl
              flex items-center justify-between
              pl-4 pr-3 py-2.5 md:px-6 md:py-4
              pointer-events-auto
              transition-all duration-500
            `}>
                {/* Identity */}
                <div 
                  onClick={() => { playClick(); navigate('intro'); }}
                  className="flex items-center gap-2.5 md:gap-3 cursor-pointer group select-none shrink-0"
                >
                   <div className="relative transition-transform duration-500 group-hover:-translate-y-0.5">
                      <BrandLogo className="w-8 h-8 md:w-10 md:h-10" />
                      <div className="absolute inset-0 bg-brand-teal rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                   </div>
                   <div className="flex flex-col">
                      <h1 className="font-display font-bold text-lg md:text-2xl leading-none tracking-tight text-brand-navy">SecondWind</h1>
                      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${scrolled ? 'text-brand-navy/40' : 'text-brand-navy/60'}`}>Protocol</span>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 md:gap-3">
                   {userType ? (
                     <div className="flex items-center gap-1 md:gap-2">
                        {/* Mobile Dashboard Icon Only */}
                        <button 
                          onClick={() => { playClick(); navigate(userType === 'donor' ? 'donor-portal' : 'portal'); }}
                          className="md:hidden p-2 rounded-full hover:bg-brand-navy/5 text-brand-navy transition-colors"
                          aria-label="Dashboard"
                        >
                          <UserCircle size={22} />
                        </button>

                        <button 
                          onClick={() => { playClick(); navigate(userType === 'donor' ? 'donor-portal' : 'portal'); }}
                          className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-navy/5 hover:bg-brand-navy/10 rounded-full text-sm font-bold text-brand-navy transition-colors"
                        >
                          <UserCircle size={18} />
                          <span>Dashboard</span>
                        </button>
                        <button 
                          onClick={() => { playClick(); logout(); navigate('intro'); }}
                          className="p-2 md:p-3 rounded-full hover:bg-brand-coral/10 text-brand-navy/40 hover:text-brand-coral transition-colors"
                          title="Logout"
                        >
                          <LogOut size={20} />
                        </button>
                     </div>
                   ) : (
                     <>
                        {/* Mobile Login Icon Only */}
                        <button 
                           onClick={() => { playClick(); setIsLoginOpen(true); }}
                           className="md:hidden p-2 rounded-full hover:bg-brand-navy/5 text-brand-navy transition-colors"
                           aria-label="Login"
                        >
                           <LogIn size={22} />
                        </button>

                        <button 
                           onClick={() => { playClick(); setIsLoginOpen(true); }}
                           className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-full text-sm font-bold hover:bg-brand-teal transition-all shadow-md active:scale-95"
                        >
                           <LogIn size={16} />
                           <span>Login</span>
                        </button>
                     </>
                   )}
                   
                   <div className="h-6 w-px bg-brand-navy/10 mx-0.5 md:hidden"></div>

                   <button 
                     onClick={() => setIsMobileMenuOpen(true)}
                     className="p-2 rounded-full hover:bg-brand-navy/5 transition-colors relative group"
                     aria-label="Menu"
                   >
                     <Menu size={24} className="text-brand-navy" />
                   </button>
                </div>
            </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main id="main-content" className={`flex-grow relative z-10 transition-all duration-500 ${isLoginOpen ? 'blur-sm scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
            {renderContent()}
        </main>
        
        {/* FOOTER - Updated Aesthetic */}
        <footer className="relative z-10 bg-brand-navy text-white pt-24 pb-12 overflow-hidden rounded-t-[3rem] mt-0">
            <div className="absolute top-0 left-0 w-full h-px bg-white/10"></div>
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
               
               <div className="md:col-span-4 flex flex-col items-start">
                  <div className="flex items-center gap-3 mb-8">
                    <BrandLogo className="w-12 h-12" />
                    <span className="font-display font-bold text-3xl tracking-tight">SecondWind</span>
                  </div>
                  <p className="text-brand-lavender max-w-sm text-lg leading-relaxed mb-8 font-medium">
                     Rebuilding the safety net with direct-to-vendor payments and radical transparency.
                  </p>
                  
                  {/* LIVE IMPACT COUNTER */}
                  <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl inline-flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-teal flex items-center gap-2"><Zap size={12} className="fill-brand-teal" /> Total Capital Deployed</span>
                      <span className="text-3xl font-mono font-bold tracking-tight text-white">$1,240,402.00</span>
                  </div>
               </div>

               {/* SEO POWERHOUSE FOOTER SECTION */}
               <div className="md:col-span-2">
                  <h4 className="font-bold text-white mb-8 uppercase tracking-widest text-xs opacity-50 flex items-center gap-2"><MapPin size={12} /> Service Areas</h4>
                  <ul className="space-y-4 text-brand-lavender/60 text-sm">
                     <li><a href="#" className="hover:text-brand-teal transition-colors">Denver Sober Living</a></li>
                     <li><a href="#" className="hover:text-brand-teal transition-colors">Boulder Rehab Support</a></li>
                     <li><a href="#" className="hover:text-brand-teal transition-colors">Colorado Springs Recovery</a></li>
                     <li><a href="#" className="hover:text-brand-teal transition-colors">Fort Collins Oxford Houses</a></li>
                     <li><a href="#" className="hover:text-brand-teal transition-colors">Aurora Addiction Help</a></li>
                  </ul>
               </div>

               <div className="md:col-span-2">
                  <h4 className="font-bold text-white mb-8 uppercase tracking-widest text-xs opacity-50">Platform</h4>
                  <ul className="space-y-6 text-brand-lavender/80 font-medium">
                     <li><button onClick={() => navigate('intro')} className="hover:text-brand-teal transition-colors">Home</button></li>
                     <li><button onClick={() => navigate('donate')} className="hover:text-brand-teal transition-colors">Invest</button></li>
                     <li><button onClick={() => navigate('apply')} className="hover:text-brand-teal transition-colors">Intake</button></li>
                     <li><button onClick={() => navigate('peer-coaching')} className="hover:text-brand-teal transition-colors">Peer Coaching</button></li>
                     <li><button onClick={() => navigate('ledger')} className="hover:text-brand-teal transition-colors">Live Ledger</button></li>
                     <li><button onClick={() => navigate('partner')} className="hover:text-brand-teal transition-colors font-bold text-brand-teal">Partner With Us</button></li>
                  </ul>
               </div>

               <div className="md:col-span-4">
                  <div className="bg-[#233549] p-8 rounded-3xl">
                     <h4 className="font-bold text-white mb-3 text-xl">Transparency Report</h4>
                     <p className="text-brand-lavender text-sm mb-6 leading-relaxed">Subscribe to our monthly impact audits. We send the raw data, not marketing fluff.</p>
                     <div className="flex gap-2">
                        <input type="email" placeholder="Email Address" className="bg-black/20 border-none rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 flex-1 outline-none focus:ring-2 focus:ring-brand-teal" />
                        <button className="bg-brand-teal text-white p-3 rounded-xl hover:bg-brand-teal/80 transition-colors"><ArrowRight size={18} /></button>
                     </div>
                  </div>
               </div>

            </div>
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 font-bold uppercase tracking-widest">
               <span>© 2024 MetzlerFoundations, Inc.</span>
               <div className="flex gap-8">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Sitemap</a>
               </div>
            </div>
        </footer>

      </div>
    </ErrorBoundary>
  );
};

export default App;
