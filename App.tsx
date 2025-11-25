
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { useRouter } from './hooks/useRouter';
import { useStore } from './context/StoreContext';
import { useSound } from './hooks/useSound';
import { Confetti } from './components/Confetti';
import { SEOHead } from './components/SEOHead';
import { Sparkles, ArrowRight, HeartHandshake, UserCircle, LogIn, TrendingUp, Twitter, Instagram, Linkedin, FileText, WifiOff, Eye, EyeOff, LogOut, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  // Use Custom Hook for Navigation (Back/Forward support)
  const { route: activeSection, navigate } = useRouter();
  const { isCalmMode, toggleCalmMode, addNotification, isSoundEnabled, toggleSound } = useStore();
  const { playHover, playClick } = useSound();
  
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<'beneficiary' | 'donor'>('beneficiary');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const mainContentRef = useRef<HTMLElement>(null);

  const tickerItems = [
    "Bus Pass funded for Sarah in Austin (2m ago)",
    "Laptop refurbished for Mike in Denver (12m ago)",
    "Rent deposit secured for Jane in Portland (45m ago)",
    "New intake started from Chicago (Now)"
  ];

  // Focus Management on Route Change
  useEffect(() => {
    const timer = setTimeout(() => {
      const elementToFocus = document.getElementById(activeSection);
      if (elementToFocus) {
        elementToFocus.focus();
      } else {
        mainContentRef.current?.focus();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [activeSection]);

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

  const handleLogin = () => {
    setIsLoginModalOpen(false);
    playClick();
    if (loginType === 'beneficiary') {
        navigate('portal');
        addNotification('success', 'Welcome back to your dashboard.');
    } else {
        navigate('donor-portal');
        addNotification('success', 'Portfolio Access Granted. Thank you for investing.');
    }
  };

  // SEO: Product/Offer Schema for Donations (Growth Hack for Rich Snippets)
  const donationSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "name": "Recovery Impact Portfolios",
    "itemListElement": [
      {
        "@type": "Product",
        "name": "Mobility Infrastructure (Bus Pass)",
        "description": "Unlimited Monthly Bus Pass for job access.",
        "image": "https://placehold.co/400x400/A7ACD9/1A2A3A/png?text=Bus+Pass",
        "offers": {
          "@type": "Offer",
          "price": "25.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": "2025-12-31"
        }
      },
      {
        "@type": "Product",
        "name": "Digital Inclusion (Refurbished Laptop)",
        "description": "Work-ready laptop for remote employment.",
        "image": "https://placehold.co/400x400/2D9C8E/FFFFFF/png?text=Laptop",
        "offers": {
          "@type": "Offer",
          "price": "75.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": "2025-12-31"
        }
      },
      {
        "@type": "Product",
        "name": "Housing Security (Sober Living)",
        "description": "One week of safe, verified sober living.",
        "image": "https://placehold.co/400x400/FF8A75/1A2A3A/png?text=Housing",
        "offers": {
          "@type": "Offer",
          "price": "200.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": "2025-12-31"
        }
      }
    ]
  };

  // SEO: BreadcrumbList for Site Hierarchy
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://secondwind.org"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Invest",
        "item": "https://secondwind.org#donate"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Get Help",
        "item": "https://secondwind.org#apply"
      }
    ]
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen relative font-sans selection:bg-brand-teal selection:text-white overflow-x-hidden bg-[#FDFBF7]">
      
      {/* Global Schema */}
      <SEOHead title="SecondWind" schema={breadcrumbSchema} />
      
      <Confetti />
      <NotificationSystem />

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
          onClick={() => { playClick(); navigate('intro'); }}
          onMouseEnter={playHover}
        >
          Second<br/>Wind
          <span className="text-brand-coral text-4xl">.</span>
        </h1>
      </div>

      {/* Top Right Controls */}
      <div className="fixed top-6 right-6 z-[60] flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-brand-navy/10 shadow-sm pointer-events-none">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono text-brand-navy/70 key={tickerIndex} animate-float">
            {tickerItems[tickerIndex]}
          </span>
        </div>

        <button
          onClick={() => { playClick(); toggleSound(); }}
          onMouseEnter={playHover}
          className={`p-2 md:px-3 md:py-2 rounded-full border border-brand-navy/10 shadow-sm flex items-center gap-2 transition-all ${isSoundEnabled ? 'bg-white text-brand-navy hover:bg-brand-cream' : 'bg-brand-navy/10 text-brand-navy/50'}`}
          aria-label={isSoundEnabled ? "Mute Audio" : "Enable Audio"}
        >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button 
          onClick={() => { playClick(); toggleCalmMode(); }}
          onMouseEnter={playHover}
          className={`p-2 md:px-3 md:py-2 rounded-full border border-brand-navy/10 shadow-sm flex items-center gap-2 transition-all ${isCalmMode ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy hover:bg-brand-cream'}`}
          aria-label={isCalmMode ? "Disable Calm Mode" : "Enable Calm Mode"}
        >
            {isCalmMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                {isCalmMode ? 'Calm On' : 'Calm Mode'}
            </span>
        </button>

        {activeSection !== 'portal' && activeSection !== 'donor-portal' && (
          <button 
            onClick={() => { playClick(); setIsLoginModalOpen(true); }}
            onMouseEnter={playHover}
            className="bg-brand-navy text-white px-3 py-2 md:px-4 md:py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-teal transition-colors shadow-lg flex items-center gap-2"
          >
            <UserCircle size={16} />
            <span className="hidden sm:inline">Member Access</span>
          </button>
        )}
        {(activeSection === 'portal' || activeSection === 'donor-portal') && (
          <button 
            onClick={() => {
                playClick();
                navigate('intro');
                addNotification('info', 'Logged out successfully.');
            }}
            onMouseEnter={playHover}
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
            onClick={() => { playClick(); navigate('intro'); }}
            onMouseEnter={playHover}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${activeSection === 'intro' ? 'bg-brand-navy text-white' : 'text-brand-navy hover:bg-brand-cream'}`}
            title="Home"
          >1</button>
          <button 
            onClick={() => { playClick(); navigate('philosophy'); }}
            onMouseEnter={playHover}
             className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${activeSection === 'philosophy' ? 'bg-brand-yellow text-brand-navy' : 'text-brand-navy hover:bg-brand-cream'}`}
             title="Our Philosophy"
          >2</button>
          <button 
            onClick={() => { playClick(); navigate('donate'); }}
            onMouseEnter={playHover}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${activeSection === 'donate' ? 'bg-brand-coral text-brand-navy' : 'text-brand-navy hover:bg-brand-cream'}`}
            title="Invest"
          >3</button>
          <button 
            onClick={() => { playClick(); navigate('apply'); }}
            onMouseEnter={playHover}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all ${activeSection === 'apply' ? 'bg-brand-teal text-white' : 'text-brand-navy hover:bg-brand-cream'}`}
            title="Get Help"
          >4</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" ref={mainContentRef} tabIndex={-1} className="outline-none">
        
        {activeSection === 'intro' && (
          <HeroSection onNavigate={(s) => navigate(s)} />
        )}

        {activeSection === 'philosophy' && (
           <PhilosophySection 
             onNavigate={(s) => navigate(s)} 
           />
        )}

        {activeSection === 'donate' && (
          <SectionWrapper
            id="donate"
            title="Invest Now | SecondWind"
            description="Choose a specific recovery barrier to remove. Rent, tech, or transport."
            schema={donationSchema}
          >
            <div className="mb-12 pl-4 md:pl-12 border-l-4 border-brand-coral">
              <h2 className="font-display text-5xl md:text-8xl font-bold text-brand-navy mb-2 leading-none">
                Direct Action.
              </h2>
              <p className="text-lg md:text-2xl text-brand-navy/50 font-display font-bold mt-2">
                No fluff. Choose a problem to solve.
              </p>
            </div>
            <DonationFlow />
          </SectionWrapper>
        )}

        {activeSection === 'apply' && (
          <SectionWrapper
            id="apply"
            title="Get Help | SecondWind"
            description="Apply for rent assistance, bus passes, or technology."
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
                      <p className="text-brand-navy/70 font-medium">Chat with Windy. She'll ask about your clean date and needs.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <p className="text-brand-navy/70 font-medium">Our team reviews your request within 24 hours.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <p className="text-brand-navy/70 font-medium">We pay the vendor directly.</p>
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

        {activeSection === 'portal' && (
          <SectionWrapper id="portal" title="My Dashboard | SecondWind">
            <BeneficiaryDashboard />
          </SectionWrapper>
        )}

        {activeSection === 'donor-portal' && (
          <SectionWrapper id="donor-portal" title="Impact Portfolio | SecondWind">
             <DonorDashboard />
          </SectionWrapper>
        )}

        {activeSection === 'ledger' && (
          <SectionWrapper id="ledger" title="Public Ledger | SecondWind" description="Full financial transparency.">
            <TransparencyLedger />
          </SectionWrapper>
        )}

      </main>

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
                       <li onClick={() => navigate('philosophy')} className="hover:text-brand-teal cursor-pointer transition-colors">Why Direct Aid?</li>
                       <li onClick={() => navigate('ledger')} className="hover:text-brand-teal cursor-pointer transition-colors flex items-center gap-2"><FileText size={14}/> Public Ledger</li>
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
               </div>
            </div>
             <div className="absolute -bottom-24 -right-24 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-teal opacity-5 rounded-full blur-[80px] md:blur-[100px]"></div>
             <div className="absolute top-24 left-24 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-brand-coral opacity-5 rounded-full blur-[60px] md:blur-[80px]"></div>
          </footer>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm" onClick={() => setIsLoginModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 animate-blob" style={{ animationDuration: '0.4s' }}>
             
             <div className="flex bg-brand-navy/5 p-1 rounded-xl mb-6">
                <button 
                  onClick={() => { playClick(); setLoginType('beneficiary'); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'beneficiary' ? 'bg-white shadow text-brand-navy' : 'text-brand-navy/40'}`}
                >
                  Beneficiary
                </button>
                <button 
                  onClick={() => { playClick(); setLoginType('donor'); }}
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
