
import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, X, HeartHandshake, ArrowRight, Check, Apple, Loader2, Lock } from 'lucide-react';
import { Mascot } from './Mascot';
import { useSound } from '../hooks/useSound';

interface LoginExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (type: 'donor' | 'beneficiary') => void;
}

export const LoginExperience: React.FC<LoginExperienceProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'donor' | 'beneficiary' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isIphone, setIsIphone] = useState(false);
  const { playHover, playClick, playSuccess } = useSound();

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
       const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
       if (/iPhone/i.test(ua)) {
          setIsIphone(true);
       }
    }
  }, []);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
        setIsAnimating(false);
        setSelectedRole(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (provider: 'google' | 'apple') => {
    if (!selectedRole) return;
    setIsAnimating(true);
    playSuccess();
    setTimeout(() => {
      onLoginSuccess(selectedRole);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-navy/80 backdrop-blur-md transition-opacity duration-300" 
        onClick={isAnimating ? undefined : onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#FDFBF7] rounded-[2rem] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row md:min-h-[550px] animate-slide-up border border-white/20 my-auto transform transition-all">
        
        {/* Background Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

        {/* LOADING OVERLAY */}
        {isAnimating && (
             <div className="absolute inset-0 bg-[#FDFBF7] z-[60] flex flex-col items-center justify-center animate-fadeIn">
                <div className="w-40 h-40 mb-8 relative">
                   <div className="absolute inset-0 bg-brand-teal/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                   <Mascot expression="excited" variant={selectedRole === 'donor' ? 'tech' : 'home'} className="relative z-10 w-full h-full" />
                </div>
                <h3 className="font-display font-bold text-3xl text-brand-navy mb-2">Connecting...</h3>
                <div className="flex items-center gap-2 text-brand-navy/50 font-medium bg-brand-navy/5 px-4 py-2 rounded-full">
                   <Loader2 size={16} className="animate-spin" /> 
                   <span>Verifying credentials with {selectedRole === 'donor' ? 'BankID' : 'Identity check'}</span>
                </div>
             </div>
        )}

        {/* Close Button - Hidden during animation */}
        {!isAnimating && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 text-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        )}

        {/* LEFT SIDE: Visual Identity (Desktop) */}
        <div className="hidden md:flex flex-col justify-between w-[40%] bg-brand-navy text-white p-10 relative overflow-hidden transition-colors duration-500 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-teal/20 to-transparent opacity-50"></div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-2 opacity-50 mb-8">
                <ShieldCheck size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Secure Gateway</span>
             </div>
             <h2 className="font-display font-bold text-4xl leading-tight mb-4 transition-all duration-300 drop-shadow-md">
               {selectedRole === 'donor' ? "Welcome back, Partner." : selectedRole === 'beneficiary' ? "Help is on the way." : "One platform. Two paths."}
             </h2>
             <p className="text-white/60 text-sm leading-relaxed max-w-[200px] transition-all duration-300">
               {selectedRole === 'donor' 
                 ? "Access your impact portfolio and track your social ROI in real-time." 
                 : selectedRole === 'beneficiary' 
                 ? "Connect with Windy to access rent, transit, and tech assistance immediately." 
                 : "Select your role to access the SecondWind Protocol ecosystem."}
             </p>
          </div>

          <div className="absolute bottom-[-20px] right-[-40px] w-64 h-64 pointer-events-none transition-transform duration-700 ease-out" style={{ transform: selectedRole ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)' }}>
             <Mascot 
               expression={selectedRole === 'donor' ? 'wink' : selectedRole === 'beneficiary' ? 'happy' : 'thinking'} 
               variant={selectedRole === 'donor' ? 'tech' : selectedRole === 'beneficiary' ? 'home' : 'default'}
               className="w-full h-full drop-shadow-2xl" 
             />
          </div>
        </div>

        {/* RIGHT SIDE: Interaction */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10">
           
           <div className="mb-8">
             <h3 className="font-display font-bold text-3xl text-brand-navy mb-2">Identify Yourself</h3>
             <p className="text-brand-navy/50">Choose your access level to continue.</p>
           </div>

           <div className="grid grid-cols-1 gap-4 mb-8">
              {/* Donor Option */}
              <button 
                onClick={() => { setSelectedRole('donor'); playClick(); }}
                onMouseEnter={playHover}
                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 text-left ${selectedRole === 'donor' ? 'border-brand-navy bg-brand-navy text-white shadow-xl scale-[1.02]' : 'border-brand-navy/10 bg-white text-brand-navy hover:border-brand-navy/30 hover:bg-white'}`}
              >
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedRole === 'donor' ? 'bg-white/10 text-white' : 'bg-brand-navy/5 text-brand-navy'}`}>
                    <TrendingUp size={24} />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-lg">Investor Access</h4>
                    <p className={`text-xs ${selectedRole === 'donor' ? 'text-white/60' : 'text-brand-navy/40'}`}>For donors managing portfolios.</p>
                 </div>
                 {selectedRole === 'donor' && <div className="absolute right-4"><Check size={20} className="text-brand-yellow" /></div>}
              </button>

              {/* Beneficiary Option */}
              <button 
                onClick={() => { setSelectedRole('beneficiary'); playClick(); }}
                onMouseEnter={playHover}
                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 text-left ${selectedRole === 'beneficiary' ? 'border-brand-teal bg-brand-teal text-white shadow-xl scale-[1.02]' : 'border-brand-navy/10 bg-white text-brand-navy hover:border-brand-teal/30 hover:bg-white'}`}
              >
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedRole === 'beneficiary' ? 'bg-white/10 text-white' : 'bg-brand-teal/10 text-brand-teal'}`}>
                    <HeartHandshake size={24} />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-lg">Beneficiary Portal</h4>
                    <p className={`text-xs ${selectedRole === 'beneficiary' ? 'text-white/60' : 'text-brand-navy/40'}`}>For applicants seeking aid.</p>
                 </div>
                 {selectedRole === 'beneficiary' && <div className="absolute right-4"><Check size={20} className="text-white" /></div>}
              </button>
           </div>

           {/* Action Area */}
           <div className={`transition-all duration-500 overflow-hidden flex flex-col gap-3 ${selectedRole ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              
              {/* Google Button */}
              <button 
                onClick={() => handleLogin('google')}
                className="w-full bg-white border border-brand-navy/10 hover:bg-gray-50 text-brand-navy p-1 rounded-xl flex items-center shadow-sm transition-transform hover:scale-[1.01] active:scale-95 group"
              >
                 <div className="bg-white p-3 rounded-lg shrink-0 border border-brand-navy/5">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                 </div>
                 <span className="flex-1 text-center font-bold text-sm tracking-wide">Continue with Google</span>
                 <div className="pr-4 opacity-50 group-hover:translate-x-1 transition-transform"><ArrowRight size={16} /></div>
              </button>

              {/* Apple Button (iPhone Only) */}
              {isIphone && (
                <button 
                  onClick={() => handleLogin('apple')}
                  className="w-full bg-black text-white p-1 rounded-xl flex items-center shadow-md transition-transform hover:scale-[1.01] active:scale-95 group"
                >
                  <div className="p-3 rounded-lg shrink-0">
                      <Apple className="w-5 h-5 fill-white" />
                  </div>
                  <span className="flex-1 text-center font-bold text-sm tracking-wide">Continue with Apple</span>
                  <div className="pr-4 opacity-50 group-hover:translate-x-1 transition-transform"><ArrowRight size={16} /></div>
                </button>
              )}

              <p className="text-center text-[10px] text-brand-navy/30 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
                 <Lock size={10} /> Secure Encryption via Google Auth
              </p>
           </div>

        </div>

      </div>
    </div>
  );
};
