import React, { useEffect } from 'react';
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
import { Sparkles, ArrowRight, HeartHandshake, UserCircle, LogIn, TrendingUp, Twitter, Instagram, Linkedin, FileText, WifiOff, Eye, EyeOff, LogOut, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  // Use Custom Hook for Navigation (Back/Forward support)
  const { route: activeSection, navigate } = useRouter();
  const { isCalmMode, toggleCalmMode, isSoundEnabled, toggleSound } = useStore();
  const { playClick } = useSound();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

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
             <div className="flex flex-col items-center gap-8 w-full">
               <div className="text-center max-w-2xl mx-auto mb-8">
                  <h2 className="font-display font-bold text-4xl text-brand-navy mb-4">Let's get you sorted.</h2>
                  <p className="text-brand-navy/60">No long forms. Just a chat. Tell us what you need.</p>
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
      <div className={`min-h-screen w-full transition-colors duration-500 ${isCalmMode ? 'bg-[#F2F2F2]' : 'bg-[#FDFBF7]'}`}>
        
        <Confetti />
        <NotificationSystem />

        {/* Global Navigation */}
        <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 pointer-events-none flex justify-between items-start md:items-center">
            
            {/* Logo / Brand */}
            <div 
              onClick={() => { playClick(); navigate('intro'); }}
              className="pointer-events-auto cursor-pointer group flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 pr-4 rounded-full border border-brand-navy/5 shadow-sm"
            >
               <div className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-110">
                 SW
               </div>
               <span className="font-display font-bold text-lg text-brand-navy hidden md:block">SecondWind</span>
            </div>

            {/* Center Menu (Desktop) */}
            <div className="hidden md:flex pointer-events-auto bg-white/80 backdrop-blur-md border border-brand-navy/5 rounded-full p-1.5 shadow-lg items-center gap-1">
               <button 
                 onClick={() => { playClick(); navigate('philosophy'); }}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeSection === 'philosophy' ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy'}`}
               >
                 Philosophy
               </button>
               <button 
                 onClick={() => { playClick(); navigate('donate'); }}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeSection === 'donate' ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy'}`}
               >
                 Invest
               </button>
               <button 
                 onClick={() => { playClick(); navigate('ledger'); }}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeSection === 'ledger' ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/60 hover:bg-brand-navy/5 hover:text-brand-navy'}`}
               >
                 Ledger
               </button>
            </div>

            {/* Right Actions */}
            <div className="pointer-events-auto flex items-center gap-3">
               
               {/* Utils */}
               <div className="flex bg-white/80 backdrop-blur-md border border-brand-navy/5 rounded-full p-1 shadow-sm">
                  <button onClick={() => { playClick(); toggleSound(); }} className="p-2 rounded-full text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors">
                      {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  <button onClick={() => { playClick(); toggleCalmMode(); }} className="p-2 rounded-full text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5 transition-colors">
                      {isCalmMode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>

               {/* Profile / CTAs */}
               {activeSection === 'intro' ? (
                  <button 
                    onClick={() => { playClick(); navigate('portal'); }}
                    className="hidden md:flex items-center gap-2 px-5 py-3 bg-white border border-brand-navy/10 rounded-full text-sm font-bold text-brand-navy hover:shadow-lg transition-all"
                  >
                    <UserCircle size={18} />
                    Login
                  </button>
               ) : (
                  <button 
                    onClick={() => { playClick(); navigate('donor-portal'); }}
                    className="flex items-center gap-2 px-5 py-3 bg-brand-navy text-white rounded-full text-sm font-bold shadow-lg hover:bg-brand-teal transition-all group"
                  >
                    <TrendingUp size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">My Portfolio</span>
                  </button>
               )}
            </div>
        </nav>
        
        {/* Mobile Menu (Bottom) */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex gap-4 bg-brand-navy text-white p-3 rounded-2xl shadow-2xl border border-white/10">
           <button onClick={() => navigate('intro')} className={`p-2 rounded-xl ${activeSection === 'intro' ? 'bg-white/20' : ''}`}><HeartHandshake size={24} /></button>
           <button onClick={() => navigate('donate')} className={`p-2 rounded-xl ${activeSection === 'donate' ? 'bg-white/20' : ''}`}><TrendingUp size={24} /></button>
           <button onClick={() => navigate('apply')} className={`p-2 rounded-xl ${activeSection === 'apply' ? 'bg-white/20' : ''}`}><UserCircle size={24} /></button>
        </div>

        <main className="relative z-0 min-h-screen flex flex-col pt-20 md:pt-0">
           {renderContent()}
        </main>

        {activeSection !== 'intro' && (
           <footer className="w-full max-w-7xl mx-auto px-8 py-12 border-t border-brand-navy/5 mt-auto mb-20 md:mb-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                 <p className="text-sm font-bold text-brand-navy">© 2024 SecondWind Non-Profit. 501(c)(3) Recognized.</p>
                 <div className="flex gap-6">
                    <Twitter className="cursor-pointer hover:text-brand-teal transition-colors" size={20} />
                    <Instagram className="cursor-pointer hover:text-brand-coral transition-colors" size={20} />
                    <Linkedin className="cursor-pointer hover:text-brand-yellow transition-colors" size={20} />
                 </div>
              </div>
           </footer>
        )}

      </div>
    </ErrorBoundary>
  );
};

export default App;