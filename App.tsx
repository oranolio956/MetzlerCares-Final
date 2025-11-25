
import React, { useState, useEffect, useRef } from 'react';
import { IntakeChat } from './components/IntakeChat';
import { DonationFlow } from './components/DonationFlow';
import { BeneficiaryDashboard } from './components/BeneficiaryDashboard';
import { DonorDashboard } from './components/DonorDashboard';
import { TransparencyLedger } from './components/TransparencyLedger';
import { PhilosophySection } from './components/PhilosophySection';
import { Mascot } from './components/Mascot';
import { HeroSection } from './components/HeroSection';
import { NotificationSystem } from './components/NotificationSystem';
import { SectionWrapper } from './components/SectionWrapper'; 
import { ErrorBoundary } from './components/ErrorBoundary'; // New Import
import { Notification } from './types';
import { Sparkles, ArrowRight, HeartHandshake, UserCircle, LogIn, TrendingUp, Twitter, Instagram, Linkedin, FileText, WifiOff, Eye, EyeOff, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'intro' | 'philosophy' | 'donate' | 'apply' | 'portal' | 'donor-portal' | 'ledger'>('intro');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<'beneficiary' | 'donor'>('beneficiary');
  const [isCalmMode, setIsCalmMode] = useState(false);
  
  // New States for "Silent" Features
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Focus Management Ref
  const mainContentRef = useRef<HTMLElement>(null);

  // Mock "Live" activity feed for social proof
  const tickerItems = [
    "Bus Pass funded for Sarah in Austin (2m ago)",
    "Laptop refurbished for Mike in Denver (12m ago)",
    "Rent deposit secured for Jane in Portland (45m ago)",
    "New intake started from Chicago (Now)"
  ];

  // EXPERT GAP 1: Focus Management
  // When activeSection changes, move focus to the main container or the first heading
  useEffect(() => {
    // Small timeout to allow DOM to update
    const timer = setTimeout(() => {
      const elementToFocus = document.getElementById(activeSection);
      if (elementToFocus) {
        elementToFocus.focus();
      } else {
        // Fallback to main content wrapper
        mainContentRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeSection]);

  // Toggle Calm Mode Logic
  const toggleCalmMode = () => {
    const newState = !isCalmMode;
    setIsCalmMode(newState);
    if (newState) {
        document.body.classList.add('calm-mode');
        addNotification('info', 'Calm Mode active. Reduced motion & contrast.');
    } else {
        document.body.classList.remove('calm-mode');
        addNotification('success', 'Standard Mode active.');
    }
  };

  // Global Offline/Online Listener
  useEffect(() => {
    const handleOnline = () => {
        setIsOffline(false);
        addNotification('success', 'Back online. We are rolling.');
    };
    const handleOffline = () => {
        setIsOffline(true);
        addNotification('error', 'The wind died down. Check your connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Toast System Logic
  const addNotification = (type: 'success' | 'info' | 'error', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000); // Auto dismiss
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const scrollTo = (section: 'intro' | 'philosophy' | 'donate' | 'apply' | 'portal' | 'donor-portal' | 'ledger') => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    setIsLoginModalOpen(false);
    if (loginType === 'beneficiary') {
        scrollTo('portal');
        addNotification('success', 'Welcome back to your dashboard.');
    } else {
        scrollTo('donor-portal');
        addNotification('success', 'Portfolio Access Granted. Thank you for investing.');
    }
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen relative font-sans selection:bg-brand-teal selection:text-white overflow-x-hidden bg-[#FDFBF7]">
      
      <NotificationSystem notifications={notifications} removeNotification={removeNotification} />

      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 w-full bg-brand-navy text-white text-center py-1 z-[100] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <WifiOff size={12} />
            Offline Mode
        </div>
      )}

      {/* Branding Header */}
      <div className="fixed top-6 left-6 z-[60] mix-blend-multiply pointer-events-none md:pointer-events-auto flex items-center gap-4">
        <h1 
          className="font-display font-bold text-2xl md:text-3xl text-brand-navy tracking-tight leading-none cursor-pointer pointer-events-auto hover:scale-105 transition-transform select-none"
          onClick={() => scrollTo('intro')}
        >
          Second<br/>Wind
          <span className="text-brand-coral text-4xl">.</span>
        </h1>
      </div>

      {/* Top Right Controls */}
      <div className="fixed top-6 right-6 z-[60] flex items-center gap-4">
        {/* Live Ticker (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-brand-navy/10 shadow-sm pointer-events-none">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono text-brand-navy/70 key={tickerIndex} animate-float">
            {tickerItems[tickerIndex]}
          </span>
        </div>

        {/* Calm Mode Toggle */}
        <button 
          onClick={toggleCalmMode}
          className={`p-2 md:px-3 md:py-2 rounded-full border border-brand-navy/10 shadow-sm flex items-center gap-2 transition-all ${isCalmMode ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy hover:bg-brand-cream'}`}
          aria-label={isCalmMode ? "Disable Calm Mode" : "Enable Calm Mode"}
          title={isCalmMode ? "Restore Animations" : "Reduce Motion & Contrast"}
        >
            {isCalmMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                {isCalmMode ? 'Calm On' : 'Calm Mode'}
            </span>
        </button>

        {/* Member Access Button */}
        {activeSection !== 'portal' && activeSection !== 'donor-portal' && (
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-brand-navy text-white px-3 py-2 md:px-4 md:py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-teal transition-colors shadow-lg flex items-center gap-2"
          >
            <UserCircle size={16} />
            <span className="hidden sm:inline">Member Access</span>
          </button>
        )}
        {(activeSection === 'portal' || activeSection === 'donor-portal') && (
          <button 
            onClick={() => {
                scrollTo('intro');
                addNotification('info', 'Logged out successfully.');
            }}
            className="bg-white text-brand-navy border border-brand-navy/20 px-3 py-2 md:px-4 md:py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-cream transition-colors shadow-lg flex items-center gap-2"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        )}
      </div>

      {/* Navigation - Bottom Right */}
      <nav className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] flex flex-col gap-4 items-end pointer-events-none md:pointer-events-auto">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-xl p-1.5 md:p-2 rounded-[2rem] border-2 border-brand-navy shadow-[4px_4px_0px_0px_rgba(26,42,58,0.2)] md:shadow-[8px_8px_0px_0px_rgba(26,42,58,0.2)] flex flex-col gap-2">
          <button 
            onClick={() => scrollTo('intro')}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${activeSection === 'intro' ? 'bg-brand-navy text-white' : 'text-brand-navy hover:bg-brand-cream'}`}
            title="Home"
            aria-label="Navigate to Home Section"
          >
            1
          </button>
          <button 
            onClick={() => scrollTo('philosophy')}
             className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${activeSection === 'philosophy' ? 'bg-brand-yellow text-brand-navy' : 'text-brand-navy hover:bg-brand-cream'}`}
             title="Our Philosophy"
             aria-label="Navigate to Philosophy Section"
          >
            2
          </button>
          <button 
            onClick={() => scrollTo('donate')}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${activeSection === 'donate' ? 'bg-brand-coral text-brand-navy' : 'text-brand-navy hover:bg-brand-cream'}`}
            title="Invest"
            aria-label="Navigate to Donation Section"
          >
            3
          </button>
          <button 
            onClick={() => scrollTo('apply')}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${activeSection === 'apply' ? 'bg-brand-teal text-white' : 'text-brand-navy hover:bg-brand-cream'}`}
            title="Get Help"
            aria-label="Navigate to Application Section"
          >
            4
          </button>
        </div>
      </nav>

      {/* Main Content Area - ID for Skip Link */}
      <main id="main-content" ref={mainContentRef} tabIndex={-1} className="outline-none">
        
        {/* INTRO VIEW (HERO) */}
        {activeSection === 'intro' && (
          <HeroSection onNavigate={(section) => scrollTo(section as any)} isCalmMode={isCalmMode} />
        )}

        {/* PHILOSOPHY VIEW (MANIFESTO) */}
        {activeSection === 'philosophy' && (
           <PhilosophySection 
             onNavigate={scrollTo} 
             isCalmMode={isCalmMode} 
           />
        )}

        {/* DONATE VIEW */}
        {activeSection === 'donate' && (
          <SectionWrapper
            id="donate"
            title="Invest Now | SecondWind"
            description="Choose a specific recovery barrier to remove. Rent, tech, or transport."
            isCalmMode={isCalmMode}
            schema={{ 
              "@type": "DonateAction", 
              "name": "Direct Aid Investment",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://secondwind.org/invest"
              },
              "priceSpecification": {
                "@type": "PriceSpecification",
                "minPrice": "25",
                "priceCurrency": "USD"
              }
            }}
          >
            <div className="mb-12 pl-4 md:pl-12 border-l-4 border-brand-coral">
              <h2 className="font-display text-5xl md:text-8xl font-bold text-brand-navy mb-2 leading-none">
                Direct Action.
              </h2>
              <p className="text-lg md:text-2xl text-brand-navy/50 font-display font-bold mt-2">
                No fluff. Choose a problem to solve.
              </p>
            </div>
            <DonationFlow isCalmMode={isCalmMode} />
          </SectionWrapper>
        )}

        {/* APPLY VIEW */}
        {activeSection === 'apply' && (
          <SectionWrapper
            id="apply"
            title="Get Help | SecondWind"
            description="Apply for rent assistance, bus passes, or technology. No long forms. Just chat with Windy."
            isCalmMode={isCalmMode}
            schema={{
              "@type": "Service",
              "name": "Recovery Resource Assistance",
              "serviceType": "Social Service",
              "provider": {
                "@type": "NGO",
                "name": "SecondWind"
              },
              "audience": {
                 "@type": "Audience",
                 "audienceType": "Individuals in Recovery"
              }
            }}
          >
            <div className="flex flex-col md:flex-row gap-12 items-start">
               <div className="flex-1 pt-8 md:sticky md:top-24">
                  <div className="bg-brand-teal/10 inline-block p-6 rounded-full mb-8">
                     <Mascot expression="wink" className="w-16 h-16 md:w-24 md:h-24" />
                  </div>
                  <h2 className="font-display text-4xl md:text-7xl font-bold text-brand-navy mb-8 leading-[0.9]">
                    Let's clear the <br/>
                    <span className="text-brand-teal">obstacles.</span>
                  </h2>
                  <div className="space-y-6 max-w-md">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <p className="text-brand-navy/70 font-medium">Chat with Windy. She'll ask about your clean date, living situation, and what you need.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <p className="text-brand-navy/70 font-medium">Our team reviews your request within 24 hours. No long forms.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <p className="text-brand-navy/70 font-medium">We pay the vendor directly. You get the receipt and the resource.</p>
                    </div>
                  </div>
               </div>
               <div className="flex-1 w-full">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-brand-navy/5 rounded-[2.5rem] transform rotate-2"></div>
                    <IntakeChat />
                  </div>
               </div>
            </div>
          </SectionWrapper>
        )}

        {/* BENEFICIARY PORTAL VIEW */}
        {activeSection === 'portal' && (
          <SectionWrapper
            id="portal"
            title="My Dashboard | SecondWind"
            isCalmMode={isCalmMode}
          >
            <BeneficiaryDashboard />
          </SectionWrapper>
        )}

        {/* DONOR PORTAL VIEW */}
        {activeSection === 'donor-portal' && (
          <SectionWrapper
            id="donor-portal"
            title="Impact Portfolio | SecondWind"
            isCalmMode={isCalmMode}
          >
             <DonorDashboard />
          </SectionWrapper>
        )}

        {/* LEDGER VIEW */}
        {activeSection === 'ledger' && (
          <SectionWrapper
            id="ledger"
            title="Public Ledger | SecondWind"
            description="Full financial transparency. View every transaction."
            isCalmMode={isCalmMode}
            schema={{
               "@type": "Dataset",
               "name": "SecondWind Real-time Financial Ledger",
               "description": "A real-time public record of all donations received and vendor payments made.",
               "license": "https://creativecommons.org/publicdomain/zero/1.0/"
            }}
          >
            <TransparencyLedger />
          </SectionWrapper>
        )}

      </main>

      {/* MANIFESTO FOOTER */}
      {activeSection !== 'portal' && activeSection !== 'donor-portal' && (
          <footer className="w-full bg-brand-navy text-brand-cream pt-24 pb-8 px-8 relative overflow-hidden mt-12">
            <div className="max-w-[1600px] mx-auto relative z-10">
               <div className="grid md:grid-cols-4 gap-12 mb-24">
                  <div className="md:col-span-2">
                     <h2 className="font-display text-4xl md:text-6xl font-bold leading-none mb-8">
                       Help humans <br/>
                       <span className="text-brand-teal">be human.</span>
                     </h2>
                     <p className="text-brand-lavender text-lg max-w-md">
                        SecondWind is a non-profit movement dedicated to removing the small financial barriers that prevent recovery from sticking.
                     </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white mb-6">Manifesto</h4>
                    <ul className="space-y-4 text-brand-lavender/60">
                       <li onClick={() => scrollTo('philosophy')} className="hover:text-brand-teal cursor-pointer transition-colors">Why Direct Aid?</li>
                       <li onClick={() => scrollTo('ledger')} className="hover:text-brand-teal cursor-pointer transition-colors flex items-center gap-2"><FileText size={14}/> Public Ledger</li>
                       <li className="hover:text-brand-teal cursor-pointer transition-colors">Vendor Partners</li>
                       <li className="hover:text-brand-teal cursor-pointer transition-colors">Financial Reports</li>
                    </ul>
                  </div>

                   <div>
                    <h4 className="font-bold text-white mb-6">Connect</h4>
                    <ul className="space-y-4 text-brand-lavender/60">
                       <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors"><Twitter size={18} /> Twitter</li>
                       <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors"><Instagram size={18} /> Instagram</li>
                       <li className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors"><Linkedin size={18} /> LinkedIn</li>
                    </ul>
                  </div>
               </div>

               <div className="border-t border-brand-lavender/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-bold uppercase tracking-widest text-brand-lavender/30">
                  <p>© SecondWind 2024</p>
                  <p>501(c)(3) EIN: 88-129412</p>
                  <div className="flex gap-4 mt-4 md:mt-0">
                     <span>Privacy Policy</span>
                     <span>Terms of Service</span>
                  </div>
               </div>
            </div>

            {/* Footer Background Art */}
             <div className="absolute -bottom-24 -right-24 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-teal opacity-5 rounded-full blur-[80px] md:blur-[100px]"></div>
             <div className="absolute top-24 left-24 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-brand-coral opacity-5 rounded-full blur-[60px] md:blur-[80px]"></div>
          </footer>
      )}

      {/* Login Modal Overlay */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 animate-blob" style={{ animationDuration: '0.4s' }}>
             
             {/* Toggle Login Type */}
             <div className="flex bg-brand-navy/5 p-1 rounded-xl mb-6">
                <button 
                  onClick={() => setLoginType('beneficiary')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'beneficiary' ? 'bg-white shadow text-brand-navy' : 'text-brand-navy/40'}`}
                >
                  Beneficiary
                </button>
                <button 
                  onClick={() => setLoginType('donor')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'donor' ? 'bg-white shadow text-brand-navy' : 'text-brand-navy/40'}`}
                >
                  Donor
                </button>
             </div>

             <div className="text-center mb-6">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${loginType === 'donor' ? 'bg-brand-coral/20 text-brand-coral' : 'bg-brand-lavender/20 text-brand-navy'}`}>
                 {loginType === 'donor' ? <TrendingUp size={24} /> : <LogIn size={24} />}
               </div>
               <h3 className="font-display font-bold text-2xl text-brand-navy">
                  {loginType === 'donor' ? 'Investor Access' : 'Welcome Back'}
               </h3>
               <p className="text-brand-navy/60 text-sm">
                  {loginType === 'donor' ? 'View your portfolio and dividends.' : 'Enter your access code to view your dashboard.'}
               </h3>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy/50 mb-1">
                    {loginType === 'donor' ? 'Email Address' : 'Access Code'}
                 </label>
                 <input 
                    type={loginType === 'donor' ? 'email' : 'text'} 
                    placeholder={loginType === 'donor' ? 'you@example.com' : 'e.g. SW-8821'} 
                    className="w-full bg-brand-cream border-2 border-brand-navy/10 rounded-xl px-4 py-3 font-mono font-bold text-center text-xl focus:border-brand-teal outline-none" 
                 />
               </div>
               <button 
                 onClick={handleLogin}
                 className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl hover:bg-brand-teal transition-colors shadow-lg"
               >
                 Enter {loginType === 'donor' ? 'Portfolio' : 'Dashboard'}
               </button>
             </div>
             <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-brand-navy/30 hover:text-brand-navy">
               ✕
             </button>
          </div>
        </div>
      )}

    </div>
    </ErrorBoundary>
  );
};

export default App;
