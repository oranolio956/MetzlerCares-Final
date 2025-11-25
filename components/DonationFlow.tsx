
import React, { useState, useEffect, useMemo, memo } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Lock, Printer, CreditCard, Bus, Laptop, Home, Target, Activity, Zap, Apple, Pill, FileBadge, Smartphone, Shirt, Briefcase, Smile, Package, Building, Utensils, Sparkles, FileText, HardHat } from 'lucide-react';
import { Mascot } from './Mascot';
import { PaymentModal } from './PaymentModal';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';

// --- SUB-COMPONENT: MARKET SPARKLINE ---
const MarketSparkline: React.FC<{ color: string; seed: number }> = memo(({ color, seed }) => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const x = i * 10;
    const y = 20 - (Math.sin(i + seed) * 10 + 10); 
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 90 20" className="w-full h-8 opacity-30" preserveAspectRatio="none">
       <polyline 
         points={points} 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="2" 
         className={color}
       />
       <polygon 
         points={`0,20 ${points} 90,20`} 
         className={color} 
         fillOpacity="0.2" 
         fill="currentColor"
         stroke="none"
       />
    </svg>
  );
});

// --- SUB-COMPONENT: IMPACT EQUALIZER (Memoized) ---
const ImpactEqualizer: React.FC<{ value: number; color: string }> = memo(({ value, color }) => {
  return (
    <div className="absolute bottom-full left-0 w-full h-16 flex items-end justify-between px-2 mb-2 opacity-30 pointer-events-none">
      {[...Array(20)].map((_, i) => {
        const isActive = i < (value * 2);
        return (
          <div 
            key={i}
            className={`w-1 rounded-t-sm transition-all duration-300 ease-out`}
            style={{ 
               height: '40%',
               backgroundColor: 'currentColor',
               opacity: isActive ? 1 : 0.2,
               animation: isActive ? `equalizer 0.8s infinite alternate` : 'none',
               animationDelay: `${Math.random() * -1}s`
            }}
          ></div>
        );
      })}
      <style>{`
        @keyframes equalizer {
          0% { height: 20%; transform: scaleY(0.8); }
          50% { height: 60%; transform: scaleY(1.2); }
          100% { height: 90%; transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
});

const SECTORS = [
  { id: 'essentials', label: 'Essentials', icon: Utensils, desc: 'Survival Basics' },
  { id: 'stability', label: 'Stability', icon: Building, desc: 'Foundation' },
  { id: 'access', label: 'Access', icon: Laptop, desc: 'Opportunity' },
  { id: 'flex', label: 'Flex', icon: Sparkles, desc: 'Rapid Response' }
];

const IMPACT_LEVELS = [
  // --- ESSENTIALS ---
  {
    id: 'food',
    category: 'essentials',
    label: "Nutrition",
    sub: "Food Security",
    desc: "1 Week Grocery Credit",
    story: "Recovery requires physical repair. Real food builds the resilience needed to stay sober.",
    vendorName: "Kroger / Local Co-op",
    baseAmount: 75,
    roi: "Health",
    roiLabel: "Physical Repair",
    variant: 'home' as const,
    color: 'bg-brand-coral',
    textColor: 'text-brand-coral',
    icon: Utensils,
    accent: 'text-brand-coral',
    sparkSeed: 14
  },
  {
    id: 'meds',
    category: 'essentials',
    label: "Wellness",
    sub: "Medical Access",
    desc: "Rx Co-Pay Assistance",
    story: "Stabilizing chronic health conditions prevents emergency room visits and relapse.",
    vendorName: "CVS / Walgreens",
    baseAmount: 40,
    roi: "Preventative",
    roiLabel: "ER Diversion",
    variant: 'home' as const,
    color: 'bg-brand-coral',
    textColor: 'text-brand-coral',
    icon: Pill,
    accent: 'text-brand-coral',
    sparkSeed: 19
  },
  {
    id: 'clothing',
    category: 'essentials',
    label: "Attire",
    sub: "Dignity Kit",
    desc: "Work/Interview Outfit",
    story: "Looking the part is half the battle. Basic professional clothing opens doors.",
    vendorName: "Retail Partners",
    baseAmount: 100,
    roi: "Confidence",
    roiLabel: "Interview Success",
    variant: 'home' as const,
    color: 'bg-brand-coral',
    textColor: 'text-brand-coral',
    icon: Shirt,
    accent: 'text-brand-coral',
    sparkSeed: 55
  },

  // --- STABILITY ---
  {
    id: 'housing',
    category: 'stability',
    label: "Emergency Bed",
    sub: "Sober Living Entry",
    desc: "1 Week Safe Housing",
    story: "Recovery cannot happen on the street. A safe bed is the foundation of everything.",
    vendorName: "Oxford House / SafeHaven",
    baseAmount: 250,
    roi: "∞", 
    roiLabel: "Relapse Prevention",
    variant: 'home' as const,
    color: 'bg-brand-teal',
    textColor: 'text-brand-teal',
    icon: Home,
    accent: 'text-brand-teal',
    sparkSeed: 99
  },
  {
    id: 'operations',
    category: 'stability',
    label: "Ops Fund",
    sub: "Platform Sustainability",
    desc: "Powering SecondWind",
    story: "Keeps our servers running, our intake AI live, and our team coordinating care.",
    vendorName: "SecondWind Ops",
    baseAmount: 50,
    roi: "Scale",
    roiLabel: "Platform Uptime",
    variant: 'tech' as const,
    color: 'bg-brand-teal',
    textColor: 'text-brand-teal',
    icon: Briefcase,
    accent: 'text-brand-teal',
    sparkSeed: 88
  },

  // --- ACCESS ---
  {
    id: 'laptop',
    category: 'access',
    label: "Tech",
    sub: "Digital Access",
    desc: "Refurbished Laptop",
    story: "Remote work, education, and telehealth are impossible without hardware.",
    vendorName: "TechReuse Corp",
    baseAmount: 300,
    roi: "100%", 
    roiLabel: "Career Unlock",
    variant: 'tech' as const,
    color: 'bg-brand-lavender',
    textColor: 'text-brand-lavender',
    icon: Laptop,
    accent: 'text-brand-lavender',
    sparkSeed: 45
  },
  {
    id: 'bus',
    category: 'access',
    label: "Mobility",
    sub: "Transit Infrastructure",
    desc: "Monthly Bus Pass",
    story: "Transit is the lifeline to employment. Without it, opportunities are out of reach.",
    vendorName: "City Metro Auth",
    baseAmount: 60,
    roi: "10x", 
    roiLabel: "Job Access",
    variant: 'commute' as const,
    color: 'bg-brand-lavender',
    textColor: 'text-brand-lavender',
    icon: Bus,
    accent: 'text-brand-lavender',
    sparkSeed: 12
  },
  {
    id: 'docs',
    category: 'access',
    label: "Identity",
    sub: "Legal Status",
    desc: "ID Replacement Fees",
    story: "You don't exist on paper without an ID. It's the first step to a job.",
    vendorName: "DMV / Vital Records",
    baseAmount: 50,
    roi: "Binary",
    roiLabel: "Employment Prerequisite",
    variant: 'commute' as const,
    color: 'bg-brand-lavender',
    textColor: 'text-brand-lavender',
    icon: FileText,
    accent: 'text-brand-lavender',
    sparkSeed: 22
  },

  // --- FLEX ---
  {
    id: 'custom',
    category: 'flex',
    label: "Rapid Response",
    sub: "Gap Funding",
    desc: "Unlisted Critical Needs",
    story: "For the specific, unique barriers that fall through the cracks of traditional aid.",
    vendorName: "Verified Vendor (Various)",
    baseAmount: 25,
    roi: "Agility",
    roiLabel: "Problem Solving",
    variant: 'tech' as const,
    color: 'bg-brand-yellow',
    textColor: 'text-brand-yellow',
    icon: Sparkles,
    accent: 'text-brand-yellow',
    sparkSeed: 77
  }
];

export const DonationFlow: React.FC = () => {
  const { isCalmMode, addDonation, addNotification, triggerConfetti } = useStore();
  const { playHover, playClick, playSuccess } = useSound();
  
  const [activeSector, setActiveSector] = useState('essentials');
  const [selectedImpact, setSelectedImpact] = useState(IMPACT_LEVELS[0]);
  const [multiplier, setMultiplier] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [txId, setTxId] = useState("#TX-9921");
  const [idleMascot, setIdleMascot] = useState(false);

  const filteredImpacts = useMemo(() => 
    IMPACT_LEVELS.filter(i => i.category === activeSector), 
  [activeSector]);

  useEffect(() => {
    // Auto-select first item when sector changes if current selection is not in new sector
    if (!filteredImpacts.find(i => i.id === selectedImpact.id)) {
        setSelectedImpact(filteredImpacts[0]);
        setMultiplier(1);
    }
  }, [activeSector, filteredImpacts, selectedImpact]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>; 
    const resetTimer = () => {
        setIdleMascot(false);
        clearTimeout(timer);
        timer = setTimeout(() => setIdleMascot(true), 8000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer(); 
    return () => {
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('click', resetTimer);
        clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const assetParam = params.get('asset');
    const unitsParam = params.get('units');

    if (assetParam) {
        const found = IMPACT_LEVELS.find(i => i.id === assetParam);
        if (found) {
            setSelectedImpact(found);
            setActiveSector(found.category);
        }
    }
    if (unitsParam) {
        const qty = parseInt(unitsParam);
        if (!isNaN(qty) && qty >= 1 && qty <= 10) setMultiplier(qty);
    }
  }, []);

  useEffect(() => {
    try {
        const params = new URLSearchParams(window.location.search);
        params.set('asset', selectedImpact.id);
        params.set('units', multiplier.toString());
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
    } catch (e) {}
  }, [selectedImpact, multiplier]);

  useEffect(() => {
    const id = Math.floor(Math.random() * 90000) + 10000;
    setTxId(`#TX-${id}`);
  }, [selectedImpact, multiplier]);

  const handleSliderChange = (val: number) => {
    setMultiplier(val);
    playClick();
    if (typeof navigator !== 'undefined' && navigator.vibrate && !isCalmMode) {
        navigator.vibrate(10);
    }
  };

  const handlePaymentComplete = () => {
    playSuccess();
    triggerConfetti();
    addDonation({
      id: txId,
      amount: selectedImpact.baseAmount * multiplier,
      itemLabel: `${multiplier}x ${selectedImpact.label}`,
      impactType: selectedImpact.variant,
      timestamp: new Date()
    });
    addNotification('success', 'Investment Deployed. Check your portfolio.');
  };

  const handleQuickDonate = () => {
    playClick();
    if (typeof navigator !== 'undefined' && navigator.vibrate && !isCalmMode) {
        navigator.vibrate([50, 50, 50]);
    }
    
    // Immediate feedback
    triggerConfetti();
    playSuccess();
    
    addDonation({
        id: `#TX-${Math.floor(Math.random() * 90000) + 10000}`,
        amount: 25,
        itemLabel: "Rapid Response Fund",
        impactType: 'commute', // Generic fallback
        timestamp: new Date()
    });
    
    addNotification('success', '⚡ $25 Rapid Response Deployed!');
  };

  const totalAmount = selectedImpact.baseAmount * multiplier;

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % filteredImpacts.length;
      setSelectedImpact(filteredImpacts[nextIndex]);
      playClick();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + filteredImpacts.length) % filteredImpacts.length;
      setSelectedImpact(filteredImpacts[prevIndex]);
      playClick();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto relative z-10">
      
      {isPaymentModalOpen && (
        <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            item={selectedImpact}
            quantity={multiplier}
            totalAmount={totalAmount}
            onSuccess={handlePaymentComplete}
        />
      )}

      <div className="sr-only" aria-live="polite">
        Selected {selectedImpact.label}. {multiplier} units. Total Investment ${totalAmount}. Impact: {multiplier}x {selectedImpact.desc}.
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 relative z-20">
         <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-brand-navy text-white p-1.5 rounded-md">
                 <TrendingUp size={16} />
               </div>
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-navy/60">Impact Allocation</span>
            </div>
            <h3 className="text-4xl md:text-6xl font-display font-bold text-brand-navy leading-none">
               Select Resource <br/>
               <span className="text-brand-teal opacity-100 relative inline-block">
                 Class
                 <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-yellow/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
               </span>.
            </h3>
         </div>
         
         <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl border border-brand-navy/10 shadow-sm transition-transform hover:scale-105 w-full md:w-auto">
                <ShieldCheck size={20} className="text-brand-teal" />
                <span className="text-sm font-bold uppercase tracking-wider text-brand-navy/60">Verified 501(c)(3)</span>
            </div>
            <p className="text-xs font-bold text-brand-navy/30 uppercase tracking-widest text-right hidden md:block">
               100% Direct-to-Vendor
            </p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* SECTOR SELECTOR */}
            <div className="flex flex-wrap gap-2 md:gap-4 p-2 bg-brand-navy/5 rounded-2xl overflow-x-auto no-scrollbar">
               {SECTORS.map((sector) => {
                  const Icon = sector.icon;
                  const isActive = activeSector === sector.id;
                  return (
                     <button
                        key={sector.id}
                        onClick={() => { setActiveSector(sector.id); playClick(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${
                           isActive 
                           ? 'bg-brand-navy text-white shadow-lg' 
                           : 'bg-white text-brand-navy/50 hover:text-brand-navy hover:bg-white/80'
                        }`}
                     >
                        <Icon size={16} />
                        {sector.label}
                     </button>
                  )
               })}
            </div>

            {/* ASSET GRID */}
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]" 
              role="radiogroup" 
              aria-label="Investment Asset Class"
            >
              {filteredImpacts.map((level, idx) => {
                const isSelected = selectedImpact.id === level.id;
                const Icon = level.icon;
                return (
                  <button
                    key={level.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => {
                      setSelectedImpact(level);
                      setMultiplier(1);
                      playClick();
                      if (typeof navigator !== 'undefined' && navigator.vibrate && !isCalmMode) navigator.vibrate(5);
                    }}
                    onMouseEnter={playHover}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`
                      group relative flex flex-col items-start text-left p-6 rounded-[2rem] transition-all duration-500 border-2 outline-none focus-visible:ring-4 focus-visible:ring-brand-teal overflow-hidden animate-slide-up
                      ${isSelected 
                        ? 'bg-brand-navy border-brand-navy shadow-[0_20px_40px_-10px_rgba(26,42,58,0.3)] scale-[1.02] z-10' 
                        : 'bg-white border-brand-navy/5 hover:border-brand-navy/20 hover:shadow-lg scale-100 opacity-80 hover:opacity-100'
                      }
                    `}
                  >
                    <div className="absolute bottom-0 left-0 w-full h-12 opacity-20 pointer-events-none">
                         <MarketSparkline color={isSelected ? "text-brand-teal" : level.textColor} seed={level.sparkSeed} />
                    </div>
                    {isSelected && (
                       <div className="absolute inset-0 bg-brand-teal opacity-10 rounded-[2rem] animate-pulse"></div>
                    )}
                    <div className="w-full flex justify-between items-start mb-6 relative z-10">
                       <div className={`p-3 rounded-2xl transition-colors duration-300 ${isSelected ? 'bg-white/10 text-white' : 'bg-brand-navy/5 text-brand-navy'}`}>
                          <Icon size={24} />
                       </div>
                       {isSelected && <div className="w-2 h-2 rounded-full bg-brand-teal animate-ping"></div>}
                    </div>
                    <div className="mt-auto relative z-10 w-full">
                      <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${isSelected ? 'text-brand-lavender' : 'text-brand-navy/40'}`}>
                        {level.sub}
                      </span>
                      <h4 className={`text-2xl font-display font-bold mb-1 leading-none ${isSelected ? 'text-white' : 'text-brand-navy'}`}>
                        {level.label}
                      </h4>
                      <div className={`text-sm font-medium flex justify-between items-center ${isSelected ? 'text-white/60' : 'text-brand-navy/40'}`}>
                         <span>${level.baseAmount} / unit</span>
                         <Activity size={14} className="opacity-50" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white border-2 border-brand-navy/5 rounded-[3rem] p-6 md:p-12 shadow-xl relative overflow-hidden flex-grow flex flex-col justify-center">
               <div className={`absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none transition-all duration-1000 ${idleMascot ? 'translate-y-[-20px] rotate-6 opacity-10' : 'rotate-12'}`}>
                  <Mascot 
                    variant={selectedImpact.variant} 
                    expression={idleMascot ? 'wink' : 'happy'} 
                    className="w-96 h-96" 
                  />
               </div>

               <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                     <div className="flex-1 w-full">
                        <div className="flex justify-between items-end mb-8">
                           <div>
                              <label htmlFor="impact-slider" className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 block mb-2">Impact Volume</label>
                              <div className="flex items-baseline gap-2">
                                 <span className="text-6xl font-display font-bold text-brand-navy tabular-nums tracking-tighter">
                                    {multiplier}
                                 </span>
                                 <span className="text-xl font-medium text-brand-navy/40">
                                    {multiplier === 1 ? 'unit' : 'units'}
                                 </span>
                              </div>
                           </div>
                           <div className="text-right hidden md:block">
                              <div className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 mb-1">Total Investment</div>
                              <div className="text-3xl font-display font-bold text-brand-teal tabular-nums">
                                 ${totalAmount}
                              </div>
                           </div>
                        </div>

                        <div className="relative h-24 flex items-center group touch-none">
                           <div className={`absolute bottom-8 left-0 right-0 h-full ${selectedImpact.accent}`}>
                              <ImpactEqualizer value={multiplier} color={selectedImpact.color} />
                           </div>
                           <div className="absolute w-full flex justify-between px-2 pointer-events-none opacity-20 top-1/2 -translate-y-1/2">
                              {[...Array(10)].map((_, i) => (
                                 <div key={i} className="w-[1px] h-4 bg-brand-navy"></div>
                              ))}
                           </div>
                           <div className="w-full h-4 bg-brand-navy/10 rounded-full overflow-hidden relative z-0 border border-brand-navy/5 shadow-inner">
                              <div 
                                className={`h-full transition-all duration-150 ease-out ${selectedImpact.color}`} 
                                style={{ width: `${(multiplier / 10) * 100}%` }}
                              ></div>
                           </div>
                           <input 
                              id="impact-slider"
                              type="range" 
                              min="1" 
                              max="10" 
                              step="1"
                              value={multiplier}
                              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                              className="w-full absolute z-20 opacity-0 cursor-pointer h-24 top-1/2 -translate-y-1/2 touch-none focus:outline-none"
                              aria-valuemin={1}
                              aria-valuemax={10}
                              aria-valuenow={multiplier}
                              aria-valuetext={`${multiplier} units of ${selectedImpact.label}`}
                           />
                           <div 
                              className="absolute h-14 w-14 top-1/2 -translate-y-1/2 bg-white border-4 border-brand-navy rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.2)] z-10 transition-all duration-150 pointer-events-none flex items-center justify-center transform group-active:scale-95 group-active:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                              style={{ left: `calc(${((multiplier - 1) / 9) * 100}% - ${multiplier === 10 ? 56 : multiplier === 1 ? 0 : 28}px)` }}
                           >
                              <div className="w-1 h-6 bg-brand-navy/20 rounded-full"></div>
                              <div className="w-1 h-6 bg-brand-navy/20 rounded-full mx-1.5"></div>
                              <div className="w-1 h-6 bg-brand-navy/20 rounded-full"></div>
                           </div>
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-brand-cream rounded-xl border border-brand-navy/5">
                           <div className={`p-2 rounded-lg text-white shadow-sm shrink-0 ${selectedImpact.color}`}>
                              <Target size={20} />
                           </div>
                           <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40">Projected Outcome</span>
                              <p className="text-brand-navy font-bold leading-tight">
                                 {multiplier} x {selectedImpact.desc}
                              </p>
                           </div>
                           <div className="sm:ml-auto md:hidden pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-navy/10 w-full sm:w-auto">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy">Total</span>
                              <div className="text-xl font-display font-bold text-brand-teal tabular-nums">
                                 ${totalAmount}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        </div>

        <div className="lg:col-span-4 flex flex-col h-full">
            <div className="sticky top-24">
               <div className="relative bg-white shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="absolute -top-3 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }}></div>
                  <div className="p-8 pb-12">
                     <div className="text-center border-b-2 border-dashed border-brand-navy/10 pb-6 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2 text-brand-navy/30">
                           <Printer size={16} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Pre-Authorization</span>
                        </div>
                        <h4 className="font-display font-bold text-2xl text-brand-navy">ESTIMATE</h4>
                        <div className="text-xs font-mono text-brand-navy/40 mt-1 flex items-center justify-center gap-2">
                           <span>{new Date().toLocaleDateString()}</span>
                           <span>•</span>
                           <span className="uppercase">{txId}</span>
                        </div>
                     </div>
                     <div className="space-y-4 mb-6 font-mono text-sm">
                        <div className="flex justify-between items-start">
                           <span className="text-brand-navy font-bold">
                              {multiplier}x {selectedImpact.label}
                              <span className="block text-[10px] text-brand-navy/40 font-normal">{selectedImpact.sub}</span>
                           </span>
                           <span className="text-brand-navy font-bold">
                             ${totalAmount.toFixed(2)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center text-brand-navy/40">
                           <span>Processing</span>
                           <span>$0.00</span>
                        </div>
                        <div className="flex justify-between items-center text-brand-teal bg-brand-teal/5 px-2 py-1 -mx-2 rounded">
                           <span className="font-bold">Overhead Fee</span>
                           <span className="font-bold">$0.00</span>
                        </div>
                     </div>
                     <div className="border-t-2 border-brand-navy border-dashed pt-4 mb-8">
                        <div className="flex justify-between items-end">
                           <span className="font-bold text-xl text-brand-navy">TOTAL</span>
                           <span className="font-display font-bold text-4xl text-brand-navy">
                              ${totalAmount.toFixed(2)}
                           </span>
                        </div>
                     </div>
                     <div className="bg-brand-navy/5 p-4 rounded-xl border border-brand-navy/5 mb-6">
                        <div className="flex items-center gap-2 mb-2 text-brand-navy/60">
                           <Lock size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Vendor Lock Protocol</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-navy shadow-sm">
                              {/* Dynamic Icon based on variant for receipt */}
                              <selectedImpact.icon size={14} />
                           </div>
                           <div className="text-xs">
                              <span className="block font-bold text-brand-navy">Payable To:</span>
                              <span className="block text-brand-navy/60">{selectedImpact.vendorName}</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/30 mb-1 block">Est. Social ROI</span>
                        <div className="text-brand-teal font-bold text-lg flex items-center justify-center gap-2">
                           <TrendingUp size={16} />
                           {selectedImpact.roi} <span className="text-xs text-brand-navy/40">({selectedImpact.roiLabel})</span>
                        </div>
                     </div>
                  </div>
                  <div className="absolute -bottom-3 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>
               </div>
               
               <div className="mt-8 space-y-4">
                   <button 
                      onClick={() => { playClick(); setIsPaymentModalOpen(true); }}
                      onMouseEnter={playHover}
                      className="w-full bg-brand-navy text-white font-bold text-xl py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(45,156,142,1)] hover:shadow-[4px_4px_0px_0px_rgba(45,156,142,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 active:shadow-none active:translate-x-2 active:translate-y-2 border-2 border-brand-navy"
                   >
                      Deploy Capital
                      <ArrowRight strokeWidth={3} size={20} />
                   </button>

                   <button 
                      onClick={handleQuickDonate}
                      onMouseEnter={playHover}
                      className="w-full bg-brand-yellow/10 text-brand-navy font-bold text-sm py-3 rounded-xl border border-brand-yellow/20 hover:bg-brand-yellow/20 transition-all flex items-center justify-center gap-2 group"
                   >
                      <Zap size={16} className="text-brand-yellow group-hover:fill-brand-yellow transition-colors" />
                      Flash Fund $25 (Single Click)
                   </button>
               </div>

               <div className="mt-4 text-center">
                  <span className="text-[10px] font-bold text-brand-navy/30 uppercase tracking-wider flex items-center justify-center gap-2">
                     <CreditCard size={12} />
                     Secure Stripe Checkout
                  </span>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};
