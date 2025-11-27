
import React, { useState, useEffect } from 'react';
import { Crown, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MedicaidPromo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { userType } = useStore();

  useEffect(() => {
    // Show after 8 seconds to allow user to settle
    const timer = setTimeout(() => {
      if (!userType) setIsVisible(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [userType]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 md:bottom-8 z-[80] w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="bg-brand-navy text-white p-1 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-brand-teal/30 flex items-stretch relative overflow-hidden group">
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="bg-brand-teal w-14 flex flex-col items-center justify-center rounded-l-xl relative shrink-0">
           <div className="absolute inset-0 bg-brand-teal animate-pulse opacity-50"></div>
           <Crown size={24} className="text-white relative z-10" />
        </div>
        
        <div className="p-4 flex-1 relative z-10">
           <div className="flex justify-between items-start mb-1 pr-8">
             <h4 className="font-display font-bold text-lg leading-tight">Waitlist Bypass</h4>
           </div>
           
           <p className="text-xs text-brand-lavender mb-3 leading-relaxed">
             Active <strong>Colorado Medicaid</strong> members qualify for <span className="text-white font-bold underline decoration-brand-yellow">instant</span> peer coaching support.
           </p>
           
           <div className="flex gap-2">
             <a 
               href="#peer-coaching" 
               onClick={() => setIsVisible(false)} 
               className="text-xs font-bold bg-white text-brand-navy hover:bg-brand-yellow transition-colors px-4 py-2 rounded-lg inline-flex items-center gap-2 shadow-lg"
             >
                Check Eligibility <ArrowRight size={12} />
             </a>
           </div>
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute top-1 right-1 text-white/40 hover:text-white hover:bg-white/10 transition-all p-2 rounded-full z-20 cursor-pointer"
          aria-label="Dismiss"
        >
           <X size={18} />
        </button>
      </div>
    </div>
  );
};
