
import React, { useState, useEffect, useRef, memo } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Lock, Printer, CreditCard, Bus, Laptop, Home, Target, Activity } from 'lucide-react';
import { Mascot } from './Mascot';
import { PaymentModal } from './PaymentModal';

// --- SUB-COMPONENT: SCRAMBLE TEXT EFFECT (Optimized with Memo) ---
const ScrambleText: React.FC<{ text: string; className?: string; active: boolean }> = memo(({ text = "", className, active }) => {
  const [display, setDisplay] = useState(text || "");
  const chars = "1234567890"; // Only numbers for cleaner financial look

  useEffect(() => {
    const safeText = text || "";
    
    if (!active || !safeText) {
      setDisplay(safeText);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(prev => 
        safeText.split("").map((char, index) => {
          if (index < iteration) return safeText[index];
          if (char === '.' || char === ',' || char === '$') return char;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );

      if (iteration >= safeText.length) clearInterval(interval);
      iteration += 1 / 2; // Speed
    }, 30);

    return () => clearInterval(interval);
  }, [text, active]);

  return <span className={`${className} font-mono tracking-wider`}>{display}</span>;
});

// --- SUB-COMPONENT: MARKET SPARKLINE ---
const MarketSparkline: React.FC<{ color: string; seed: number }> = ({ color, seed }) => {
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
};

// --- SUB-COMPONENT: IMPACT EQUALIZER (Now Active/Live) ---
const ImpactEqualizer: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  // 3. LIVE MARKET DATA (Dancing Bars)
  return (
    <div className="absolute bottom-full left-0 w-full h-16 flex items-end justify-between px-2 mb-2 opacity-30 pointer-events-none">
      {[...Array(20)].map((_, i) => {
        // Only animate bars within the "active" value range (plus a little buffer)
        const isActive = i < (value * 2);
        return (
          <div 
            key={i}
            className={`w-1 rounded-t-sm transition-all duration-300 ease-out`}
            style={{ 
               height: '40%', // Base height
               backgroundColor: 'currentColor',
               opacity: isActive ? 1 : 0.2,
               // Use CSS Animation for "Dancing" effect
               animation: isActive ? `equalizer 0.8s infinite alternate` : 'none',
               animationDelay: `${Math.random() * -1}s` // Randomize start time
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
};

const IMPACT_LEVELS = [
  {
    id: 'commute',
    label: "Mobility",
    sub: "Transit Infrastructure",
    desc: "Unlimited Monthly Bus Pass",
    story: "Transit is the lifeline to employment. Without it, opportunities are out of reach.",
    vendorName: "City Metro Authority",
    baseAmount: 25,
    weeklyGoal: 20,
    currentFunded: 14,
    roi: "10x", 
    roiLabel: "Job Access Multiplier",
    variant: 'commute' as const,
    color: 'bg-brand-lavender',
    textColor: 'text-brand-lavender',
    icon: Bus,
    accent: 'text-brand-lavender',
    sparkSeed: 12
  },
  {
    id: 'tech',
    label: "Access",
    sub: "Digital Inclusion",
    desc: "Refurbished Work Laptop",
    story: "Remote work and education are impossible without hardware. Bridge the digital divide.",
    vendorName: "TechReuse Corp (Certified)",
    baseAmount: 75,
    weeklyGoal: 5,
    currentFunded: 3,
    roi: "100%", 
    roiLabel: "Career Unlock Probability",
    variant: 'tech' as const,
    color: 'bg-brand-teal',
    textColor: 'text-brand-teal',
    icon: Laptop,
    accent: 'text-brand-teal',
    sparkSeed: 45
  },
  {
    id: 'shelter',
    label: "Stability",
    sub: "Housing Security",
    desc: "1 Week Safe Sober Living",
    story: "Recovery cannot happen on the street. A safe bed is the foundation of everything.",
    vendorName: "Oxford House / SafeHaven",
    baseAmount: 200,
    weeklyGoal: 8,
    currentFunded: 4,
    roi: "∞", 
    roiLabel: "Relapse Prevention Score",
    variant: 'home' as const,
    color: 'bg-brand-coral',
    textColor: 'text-brand-coral',
    icon: Home,
    accent: 'text-brand-coral',
    sparkSeed: 99
  }
];

interface DonationFlowProps {
  isCalmMode?: boolean;
}

export const DonationFlow: React.FC<DonationFlowProps> = ({ isCalmMode = false }) => {
  const [selectedImpact, setSelectedImpact] = useState(IMPACT_LEVELS[1]);
  const [multiplier, setMultiplier] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [scrambleTrigger, setScrambleTrigger] = useState(false);
  const [txId, setTxId] = useState("#TX-9921");
  const [idleMascot, setIdleMascot] = useState(false);

  // Idle Timer for Mascot Peek
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>; 
    const resetTimer = () => {
        setIdleMascot(false);
        clearTimeout(timer);
        timer = setTimeout(() => setIdleMascot(true), 8000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer(); // Init
    return () => {
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('click', resetTimer);
        clearTimeout(timer);
    };
  }, []);

  // --- SILENT FEATURE: DEEP LINKING & STATE RESTORATION ---
  useEffect(() => {
    // 1. On Mount: Check URL
    const params = new URLSearchParams(window.location.search);
    const assetParam = params.get('asset');
    const unitsParam = params.get('units');

    if (assetParam) {
        const found = IMPACT_LEVELS.find(i => i.id === assetParam);
        if (found) setSelectedImpact(found);
    }
    if (unitsParam) {
        const qty = parseInt(unitsParam);
        if (!isNaN(qty) && qty >= 1 && qty <= 10) setMultiplier(qty);
    }
  }, []);

  // 2. On Update: Write URL (without reloading)
  useEffect(() => {
    try {
        const params = new URLSearchParams(window.location.search);
        params.set('asset', selectedImpact.id);
        params.set('units', multiplier.toString());
        
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        // Wrap in try-catch to prevent SecurityError in sandboxed iframe environments
        window.history.replaceState({}, '', newUrl);
    } catch (e) {
        // Silently fail if history API is restricted
    }
  }, [selectedImpact, multiplier]);

  // Trigger visual effects on change
  useEffect(() => {
    if (!isCalmMode) {
      setScrambleTrigger(true);
      const t = setTimeout(() => setScrambleTrigger(false), 500);
      
      // Randomize ID for effect
      const id = Math.floor(Math.random() * 90000) + 10000;
      setTxId(`#TX-${id}`);
      
      return () => clearTimeout(t);
    }
  }, [selectedImpact, multiplier, isCalmMode]);

  // --- HAPTIC FEEDBACK HANDLER ---
  const handleSliderChange = (val: number) => {
    setMultiplier(val);
    // Silent Feature: Tactile feedback on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate && !isCalmMode) {
        navigator.vibrate(10); // 10ms pulse (Short & crisp)
    }
  };

  const totalAmount = selectedImpact.baseAmount * multiplier;

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % IMPACT_LEVELS.length;
      setSelectedImpact(IMPACT_LEVELS[nextIndex]);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + IMPACT_LEVELS.length) % IMPACT_LEVELS.length;
      setSelectedImpact(IMPACT_LEVELS[prevIndex]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto relative z-10">
      
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        item={selectedImpact}
        quantity={multiplier}
        totalAmount={totalAmount}
      />

      {/* Accessibility: Live Region */}
      <div className="sr-only" aria-live="polite">
        Selected {selectedImpact.label}. {multiplier} units. Total Investment ${totalAmount}. Impact: {multiplier}x {selectedImpact.desc}.
      </div>

      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-20">
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
         
         <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl border border-brand-navy/10 shadow-sm transition-transform hover:scale-105">
                <ShieldCheck size={20} className="text-brand-teal" />
                <span className="text-sm font-bold uppercase tracking-wider text-brand-navy/60">Verified 501(c)(3)</span>
            </div>
            <p className="text-xs font-bold text-brand-navy/30 uppercase tracking-widest text-right">
               100% Direct-to-Vendor
            </p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {/* LEFT COLUMN: ASSET SELECTION (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* 1. ASSET CARDS */}
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4" 
              role="radiogroup" 
              aria-label="Investment Asset Class"
            >
              {IMPACT_LEVELS.map((level, idx) => {
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
                      if (typeof navigator !== 'undefined' && navigator.vibrate && !isCalmMode) navigator.vibrate(5);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`
                      group relative flex flex-col items-start text-left p-6 rounded-[2rem] transition-all duration-500 border-2 outline-none focus-visible:ring-4 focus-visible:ring-brand-teal overflow-hidden
                      ${isSelected 
                        ? 'bg-brand-navy border-brand-navy shadow-[0_20px_40px_-10px_rgba(26,42,58,0.3)] scale-[1.02] z-10' 
                        : 'bg-white border-brand-navy/5 hover:border-brand-navy/20 hover:shadow-lg scale-100 opacity-80 hover:opacity-100'
                      }
                    `}
                  >
                    {/* Market Pulse Sparkline Background */}
                    <div className="absolute bottom-0 left-0 w-full h-12 opacity-20 pointer-events-none">
                         <MarketSparkline color={isSelected ? "text-brand-teal" : level.textColor} seed={level.sparkSeed} />
                    </div>

                    {/* Glowing Backdrop for Selected */}
                    {isSelected && (
                       <div className="absolute inset-0 bg-brand-teal opacity-10 rounded-[2rem] animate-pulse"></div>
                    )}

                    {/* Header */}
                    <div className="w-full flex justify-between items-start mb-6 relative z-10">
                       <div className={`p-3 rounded-2xl transition-colors duration-300 ${isSelected ? 'bg-white/10 text-white' : 'bg-brand-navy/5 text-brand-navy'}`}>
                          <Icon size={24} />
                       </div>
                       {isSelected && <div className="w-2 h-2 rounded-full bg-brand-teal animate-ping"></div>}
                    </div>

                    {/* Content */}
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

            {/* 2. THE TRADING DESK */}
            <div className="bg-white border-2 border-brand-navy/5 rounded-[3rem] p-8 md:p-12 shadow-xl relative overflow-hidden flex-grow flex flex-col justify-center">
               
               {/* Background Mascot - Interactive on Idle */}
               <div className={`absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none transition-all duration-1000 ${idleMascot ? 'translate-y-[-20px] rotate-6 opacity-10' : 'rotate-12'}`}>
                  <Mascot 
                    variant={selectedImpact.variant} 
                    expression={idleMascot ? 'wink' : 'happy'} 
                    className="w-96 h-96" 
                  />
               </div>

               <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-12 items-center">
                     
                     {/* Volume Control (Slider) */}
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

                        {/* Custom Mechanical Slider Container */}
                        <div className="relative h-24 flex items-center group">
                           
                           {/* IMPACT EQUALIZER (Visual Bar Graph) */}
                           <div className={`absolute bottom-8 left-0 right-0 h-full ${selectedImpact.accent}`}>
                              <ImpactEqualizer value={multiplier} color={selectedImpact.color} />
                           </div>

                           {/* Track Lines */}
                           <div className="absolute w-full flex justify-between px-2 pointer-events-none opacity-20 top-1/2 -translate-y-1/2">
                              {[...Array(10)].map((_, i) => (
                                 <div key={i} className="w-[1px] h-4 bg-brand-navy"></div>
                              ))}
                           </div>
                           
                           {/* The Track (Heavier Look) */}
                           <div className="w-full h-4 bg-brand-navy/10 rounded-full overflow-hidden relative z-0 border border-brand-navy/5 shadow-inner">
                              <div 
                                className={`h-full transition-all duration-150 ease-out ${selectedImpact.color}`} 
                                style={{ width: `${(multiplier / 10) * 100}%` }}
                              ></div>
                           </div>

                           {/* The Input (Accessible & Touch Optimized) */}
                           <input 
                              id="impact-slider"
                              type="range" 
                              min="1" 
                              max="10" 
                              step="1"
                              value={multiplier}
                              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                              className="w-full absolute z-20 opacity-0 cursor-pointer h-24 top-1/2 -translate-y-1/2 touch-none"
                              aria-valuemin={1}
                              aria-valuemax={10}
                              aria-valuenow={multiplier}
                              aria-valuetext={`${multiplier} units of ${selectedImpact.label}`}
                           />

                           {/* The Thumb (Visual - Mechanical Look) */}
                           <div 
                              className="absolute h-14 w-14 top-1/2 -translate-y-1/2 bg-white border-4 border-brand-navy rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.2)] z-10 transition-all duration-150 pointer-events-none flex items-center justify-center transform group-active:scale-95 group-active:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                              style={{ left: `calc(${((multiplier - 1) / 9) * 100}% - ${multiplier === 10 ? 56 : multiplier === 1 ? 0 : 28}px)` }}
                           >
                              {/* Grip Lines */}
                              <div className="w-1 h-6 bg-brand-navy/20 rounded-full"></div>
                              <div className="w-1 h-6 bg-brand-navy/20 rounded-full mx-1.5"></div>
                              <div className="w-1 h-6 bg-brand-navy/20 rounded-full"></div>
                           </div>
                        </div>

                        <div className="mt-8 flex items-center gap-4 p-4 bg-brand-cream rounded-xl border border-brand-navy/5">
                           <div className={`p-2 rounded-lg text-white shadow-sm ${selectedImpact.id === 'commute' ? 'bg-brand-lavender' : selectedImpact.id === 'tech' ? 'bg-brand-teal' : 'bg-brand-coral'}`}>
                              <Target size={20} />
                           </div>
                           <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40">Projected Outcome</span>
                              <p className="text-brand-navy font-bold leading-tight">
                                 {multiplier} x {selectedImpact.desc}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: THE LIVE RECEIPT (Span 4) */}
        <div className="lg:col-span-4 flex flex-col h-full">
            <div className="sticky top-24">
               {/* Receipt Container */}
               <div className="relative bg-white shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  
                  {/* Jagged Top */}
                  <div className="absolute -top-3 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }}></div>
                  
                  <div className="p-8 pb-12">
                     {/* Header */}
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

                     {/* Line Items */}
                     <div className="space-y-4 mb-6 font-mono text-sm">
                        <div className="flex justify-between items-start">
                           <span className="text-brand-navy font-bold">
                              {multiplier}x {selectedImpact.label}
                              <span className="block text-[10px] text-brand-navy/40 font-normal">{selectedImpact.sub}</span>
                           </span>
                           <span className="text-brand-navy font-bold">
                             $<ScrambleText text={totalAmount.toFixed(2)} active={scrambleTrigger} />
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

                     {/* Total */}
                     <div className="border-t-2 border-brand-navy border-dashed pt-4 mb-8">
                        <div className="flex justify-between items-end">
                           <span className="font-bold text-xl text-brand-navy">TOTAL</span>
                           <span className="font-display font-bold text-4xl text-brand-navy">
                              $<ScrambleText text={totalAmount.toFixed(2)} active={scrambleTrigger} />
                           </span>
                        </div>
                     </div>

                     {/* Vendor Lock */}
                     <div className="bg-brand-navy/5 p-4 rounded-xl border border-brand-navy/5 mb-6">
                        <div className="flex items-center gap-2 mb-2 text-brand-navy/60">
                           <Lock size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Vendor Lock Protocol</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-navy shadow-sm">
                              {selectedImpact.id === 'commute' && <Bus size={14} />}
                              {selectedImpact.id === 'tech' && <Laptop size={14} />}
                              {selectedImpact.id === 'shelter' && <Home size={14} />}
                           </div>
                           <div className="text-xs">
                              <span className="block font-bold text-brand-navy">Payable To:</span>
                              <span className="block text-brand-navy/60">{selectedImpact.vendorName}</span>
                           </div>
                        </div>
                     </div>

                     {/* Social ROI */}
                     <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/30 mb-1 block">Est. Social ROI</span>
                        <div className="text-brand-teal font-bold text-lg flex items-center justify-center gap-2">
                           <TrendingUp size={16} />
                           {selectedImpact.roi} <span className="text-xs text-brand-navy/40">({selectedImpact.roiLabel})</span>
                        </div>
                     </div>
                  </div>

                  {/* Jagged Bottom */}
                  <div className="absolute -bottom-3 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>
               </div>

               {/* Action Button */}
               <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full mt-8 bg-brand-navy text-white font-bold text-xl py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(45,156,142,1)] hover:shadow-[4px_4px_0px_0px_rgba(45,156,142,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 active:shadow-none active:translate-x-2 active:translate-y-2 border-2 border-brand-navy"
               >
                  Deploy Capital
                  <ArrowRight strokeWidth={3} size={20} />
               </button>
               
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
