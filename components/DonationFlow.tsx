import React, { useState, useEffect, useMemo, memo } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Printer, Bus, Laptop, Home, Target, Zap, Pill, Shirt, Briefcase, Sparkles, FileText, Building, Utensils, Receipt, CheckCircle2 } from 'lucide-react';
import { Mascot } from './Mascot';
import { PaymentModal } from './PaymentModal';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';

const ImpactEqualizer: React.FC<{ value: number; color: string }> = memo(({ value, color }) => {
  return (
    <div className="absolute bottom-full left-0 w-full h-16 flex items-end justify-between px-2 mb-2 opacity-30 pointer-events-none">
      {[...Array(20)].map((_, i) => {
        const isActive = i < (value * 2);
        return (
          <div key={i} className={`w-1 rounded-t-sm transition-all duration-300 ease-out`} style={{ height: '40%', backgroundColor: 'currentColor', opacity: isActive ? 1 : 0.2, animation: isActive ? `equalizer 0.8s infinite alternate` : 'none', animationDelay: `${Math.random() * -1}s` }}></div>
        );
      })}
      <style>{`@keyframes equalizer { 0% { height: 20%; transform: scaleY(0.8); } 50% { height: 60%; transform: scaleY(1.2); } 100% { height: 90%; transform: scaleY(1); } }`}</style>
    </div>
  );
});

const SECTORS = [
  { id: 'essentials', label: 'Basic Needs', icon: Utensils, desc: 'Survival Basics' },
  { id: 'stability', label: 'Housing & Safety', icon: Building, desc: 'Foundation' },
  { id: 'access', label: 'Jobs & Tech', icon: Laptop, desc: 'Opportunity' },
  { id: 'flex', label: 'Rapid Response', icon: Sparkles, desc: 'Rapid Response' }
];

const IMPACT_LEVELS = [
  { id: 'food', category: 'essentials', label: "Food Assistance", sub: "Good Eats", desc: "Fills a Denver fridge for a week", transparencyDesc: "Funds credited directly to local co-op account.", story: "Good food fuels recovery.", vendorName: "Kroger / Denver Food Co-op", baseAmount: 45, roi: "Health", roiLabel: "Physical Repair", variant: 'home' as const, color: 'bg-brand-coral', textColor: 'text-brand-coral', icon: Utensils, accent: 'text-brand-coral', sparkSeed: 14 },
  { id: 'meds', category: 'essentials', label: "Meds Assistance", sub: "Pharmacy Co-Pay", desc: "Covers one prescription", transparencyDesc: "Paid directly to pharmacy for specific Rx.", story: "Stabilizing health is the first step.", vendorName: "CVS / Walgreens CO", baseAmount: 25, roi: "Preventative", roiLabel: "ER Diversion", variant: 'home' as const, color: 'bg-brand-coral', textColor: 'text-brand-coral', icon: Pill, accent: 'text-brand-coral', sparkSeed: 19 },
  { id: 'clothing', category: 'essentials', label: "Interview Gear", sub: "Professional", desc: "One professional outfit", transparencyDesc: "Voucher for interview attire only.", story: "Looking the part is half the battle.", vendorName: "Retail Partners Denver", baseAmount: 65, roi: "Confidence", roiLabel: "Interview Success", variant: 'home' as const, color: 'bg-brand-coral', textColor: 'text-brand-coral', icon: Shirt, accent: 'text-brand-coral', sparkSeed: 55 },
  { id: 'housing', category: 'stability', label: "Safe Housing", sub: "Sober Living", desc: "Pays 1 week of rent", transparencyDesc: "Paid to Oxford House CO landlord account.", story: "Recovery cannot happen on the street.", vendorName: "Oxford House / SafeHaven", baseAmount: 125, roi: "∞", roiLabel: "Relapse Prevention", variant: 'home' as const, color: 'bg-brand-teal', textColor: 'text-brand-teal', icon: Home, accent: 'text-brand-teal', sparkSeed: 99 },
  { id: 'operations', category: 'stability', label: "Core Ops", sub: "Lights On", desc: "Powering SecondWind", transparencyDesc: "Server costs & minimal overhead.", story: "Keeps our servers running.", vendorName: "SecondWind Ops", baseAmount: 15, roi: "Scale", roiLabel: "Platform Uptime", variant: 'tech' as const, color: 'bg-brand-teal', textColor: 'text-brand-teal', icon: Briefcase, accent: 'text-brand-teal', sparkSeed: 88 },
  { id: 'laptop', category: 'access', label: "Tech Access", sub: "Laptop Fund", desc: "Refurbished Laptop", transparencyDesc: "Hardware purchased from cert. refurbisher.", story: "Remote work is impossible without hardware.", vendorName: "TechReuse Corp", baseAmount: 150, roi: "100%", roiLabel: "Career Unlock", variant: 'tech' as const, color: 'bg-brand-lavender', textColor: 'text-brand-lavender', icon: Laptop, accent: 'text-brand-lavender', sparkSeed: 45 },
  { id: 'bus', category: 'access', label: "Bus Passes", sub: "Mobility", desc: "Monthly Bus Pass", transparencyDesc: "Direct purchase from Denver Metro.", story: "Transit is the lifeline to employment.", vendorName: "RTD Denver", baseAmount: 35, roi: "10x", roiLabel: "Job Access", variant: 'commute' as const, color: 'bg-brand-lavender', textColor: 'text-brand-lavender', icon: Bus, accent: 'text-brand-lavender', sparkSeed: 12 },
  { id: 'docs', category: 'access', label: "ID Restoration", sub: "Documents", desc: "State ID Fees", transparencyDesc: "State fees for license/birth cert.", story: "You don't exist on paper without an ID.", vendorName: "Colorado DMV", baseAmount: 30, roi: "Binary", roiLabel: "Employment Prerequisite", variant: 'commute' as const, color: 'bg-brand-lavender', textColor: 'text-brand-lavender', icon: FileText, accent: 'text-brand-lavender', sparkSeed: 22 },
  { id: 'custom', category: 'flex', label: "Gap Fund", sub: "Emergency", desc: "Unlisted Critical Needs", transparencyDesc: "Discretionary fund for verified emergencies.", story: "For the specific barriers.", vendorName: "Verified Vendor (Various)", baseAmount: 10, roi: "Agility", roiLabel: "Problem Solving", variant: 'tech' as const, color: 'bg-brand-yellow', textColor: 'text-brand-yellow', icon: Sparkles, accent: 'text-brand-yellow', sparkSeed: 77 }
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

  const filteredImpacts = useMemo(() => IMPACT_LEVELS.filter(i => i.category === activeSector), [activeSector]);

  useEffect(() => {
    if (!filteredImpacts.find(i => i.id === selectedImpact.id)) {
        setSelectedImpact(filteredImpacts[0]);
        setMultiplier(1);
    }
  }, [activeSector, filteredImpacts, selectedImpact]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>; 
    const resetTimer = () => { setIdleMascot(false); clearTimeout(timer); timer = setTimeout(() => setIdleMascot(true), 8000); };
    window.addEventListener('mousemove', resetTimer); window.addEventListener('click', resetTimer); resetTimer(); 
    return () => { window.removeEventListener('mousemove', resetTimer); window.removeEventListener('click', resetTimer); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const id = Math.floor(Math.random() * 90000) + 10000;
    setTxId(`#TX-${id}`);
  }, [selectedImpact, multiplier]);

  const handleSliderChange = (val: number) => {
    setMultiplier(val);
    playClick();
    if (typeof navigator !== 'undefined' && navigator.vibrate && !isCalmMode) navigator.vibrate(10);
  };

  const handlePaymentComplete = () => {
    playSuccess(); triggerConfetti();
    addDonation({ id: txId, amount: selectedImpact.baseAmount * multiplier, itemLabel: `${multiplier}x ${selectedImpact.label}`, impactType: selectedImpact.variant, timestamp: new Date() });
    addNotification('success', 'Support Deployed. Check your portfolio.');
  };

  const handleQuickDonate = () => {
    playClick(); if (typeof navigator !== 'undefined' && navigator.vibrate && !isCalmMode) navigator.vibrate([50, 50, 50]);
    triggerConfetti(); playSuccess();
    addDonation({ id: `#TX-${Math.floor(Math.random() * 90000) + 10000}`, amount: 10, itemLabel: "Rapid Response Fund", impactType: 'commute', timestamp: new Date() });
    addNotification('success', '⚡ $10 Rapid Response Deployed!');
  };

  const totalAmount = selectedImpact.baseAmount * multiplier;

  return (
    <div className="w-full max-w-7xl mx-auto relative z-10 px-0 md:px-4">
      
      {isPaymentModalOpen && (
        <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} item={selectedImpact} quantity={multiplier} totalAmount={totalAmount} onSuccess={handlePaymentComplete} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 relative z-20 px-4 md:px-0">
         <div className="w-full">
            <div className="flex items-center gap-2 mb-2 md:mb-4">
               <div className="bg-brand-navy text-white p-1.5 rounded-md"><TrendingUp size={16} /></div>
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-navy/60">Colorado Recovery Fund</span>
            </div>
            <h3 className="text-3xl md:text-6xl font-display font-bold text-brand-navy leading-none">
               Choose where to <br/>
               <span className="text-brand-teal opacity-100 relative inline-block">Support<svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-yellow/50" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="none" /></svg></span>.
            </h3>
         </div>
         <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl border border-brand-navy/10 shadow-sm transition-transform hover:scale-105 w-full md:w-auto justify-center md:justify-start">
                <ShieldCheck size={20} className="text-brand-teal" />
                <span className="text-sm font-bold uppercase tracking-wider text-brand-navy/60">Verified 501(c)(3)</span>
            </div>
         </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative">
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Category Selector - Scrollable on mobile */}
            <div className="mx-4 md:mx-0 bg-white p-1.5 rounded-2xl shadow-sm border border-brand-navy/5 flex overflow-x-auto no-scrollbar md:flex-wrap sm:flex-nowrap gap-1 relative snap-x touch-pan-x">
               {SECTORS.map((sector) => {
                  const Icon = sector.icon;
                  const isActive = activeSector === sector.id;
                  return (
                     <button 
                        key={sector.id} 
                        onClick={() => { setActiveSector(sector.id); playClick(); }} 
                        className={`flex-none md:flex-1 flex items-center justify-center gap-2 px-6 py-4 md:px-4 md:py-3 rounded-xl transition-all duration-300 font-bold text-sm relative z-10 whitespace-nowrap snap-center ${isActive ? 'text-brand-navy shadow-sm ring-1 ring-black/5' : 'text-brand-navy/50 hover:bg-brand-cream/50'}`}
                     >
                        {isActive && (
                           <div className="absolute inset-0 bg-brand-cream rounded-xl z-[-1] animate-in fade-in zoom-in-95 duration-200"></div>
                        )}
                        <Icon size={16} className={isActive ? "text-brand-teal" : ""} /> 
                        {sector.label}
                     </button>
                  )
               })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0" role="radiogroup">
              {filteredImpacts.map((level, idx) => {
                const isSelected = selectedImpact.id === level.id;
                const Icon = level.icon;
                return (
                  <button key={level.id} onClick={() => { setSelectedImpact(level); setMultiplier(1); playClick(); }} onMouseEnter={playHover} className={`group relative flex flex-col items-start text-left p-6 rounded-[2rem] transition-all duration-300 border-2 outline-none focus-visible:ring-4 focus-visible:ring-brand-teal overflow-hidden min-h-[160px] ${isSelected ? 'bg-brand-navy border-brand-navy shadow-[0_20px_40px_-10px_rgba(26,42,58,0.3)] scale-[1.02] z-10' : 'bg-white border-brand-navy/5 hover:border-brand-navy/20 hover:shadow-lg scale-100 opacity-80 hover:opacity-100'}`}>
                    <div className="w-full flex justify-between items-start mb-6 relative z-10">
                       <div className={`p-3 rounded-2xl transition-colors duration-300 ${isSelected ? 'bg-white/10 text-white' : 'bg-brand-navy/5 text-brand-navy'}`}><Icon size={24} /></div>
                    </div>
                    <div className="mt-auto relative z-10 w-full">
                      <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${isSelected ? 'text-brand-lavender' : 'text-brand-navy/40'}`}>{level.sub}</span>
                      <h4 className={`text-xl font-display font-bold mb-1 leading-tight ${isSelected ? 'text-white' : 'text-brand-navy'}`}>{level.label}</h4>
                      <div className={`text-sm font-medium flex justify-between items-center ${isSelected ? 'text-white/60' : 'text-brand-navy/40'}`}><span>${level.baseAmount} / unit</span></div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white border-2 border-brand-navy/5 rounded-[2.5rem] p-6 md:p-12 shadow-xl relative overflow-hidden flex-grow flex flex-col justify-center min-h-[350px] mx-4 md:mx-0">
               <div className={`absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none transition-all duration-1000 hidden md:block ${idleMascot ? 'translate-y-[-20px] rotate-6 opacity-10' : 'rotate-12'}`}>
                  <Mascot variant={selectedImpact.variant} expression={idleMascot ? 'wink' : 'happy'} className="w-96 h-96" />
               </div>

               <div className="relative z-10">
                  <div className="flex flex-col gap-8 md:gap-12 items-center">
                     <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 md:gap-0">
                           <div>
                              <label className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 block mb-2">Lives to Impact in Colorado</label>
                              <div className="flex items-baseline gap-2">
                                 <span className="text-5xl md:text-6xl font-display font-bold text-brand-navy tabular-nums tracking-tighter">{multiplier}</span>
                                 <span className="text-xl font-medium text-brand-navy/40">{multiplier === 1 ? 'person' : 'people'}</span>
                              </div>
                           </div>
                           <div className="text-left md:text-right w-full md:w-auto p-4 md:p-0 bg-brand-cream md:bg-transparent rounded-xl md:rounded-none">
                              <div className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 mb-1">Total Investment</div>
                              <div className="text-3xl font-display font-bold text-brand-teal tabular-nums">${totalAmount}</div>
                           </div>
                        </div>

                        {/* Enhanced Touch Slider */}
                        <div className="relative h-24 flex items-center group select-none my-4">
                           <div className={`absolute bottom-8 left-0 right-0 h-full ${selectedImpact.accent}`}><ImpactEqualizer value={multiplier} color={selectedImpact.color} /></div>
                           <div className="absolute w-full flex justify-between px-2 pointer-events-none opacity-20 top-1/2 -translate-y-1/2">
                              {[...Array(10)].map((_, i) => (<div key={i} className="w-[1px] h-4 bg-brand-navy"></div>))}
                           </div>
                           <div className="w-full h-4 bg-brand-navy/10 rounded-full overflow-hidden relative z-0 border border-brand-navy/5 shadow-inner">
                              <div className={`h-full transition-all duration-150 ease-out ${selectedImpact.color}`} style={{ width: `${(multiplier / 10) * 100}%` }}></div>
                           </div>
                           <input 
                              type="range" 
                              min="1" 
                              max="10" 
                              step="1" 
                              value={multiplier} 
                              onChange={(e) => handleSliderChange(parseInt(e.target.value))} 
                              className="w-full absolute z-20 opacity-0 cursor-pointer h-24 top-1/2 -translate-y-1/2 focus:outline-none touch-none" 
                              style={{ touchAction: 'none' }} // Critical for mobile
                              aria-label="Adjust donation multiplier"
                           />
                           {/* Slider Thumb with Larger Touch Target */}
                           <div className="absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-150 pointer-events-none flex items-center justify-center transform group-active:scale-95" style={{ left: `calc(${((multiplier - 1) / 9) * 100}% - ${multiplier === 10 ? 56 : multiplier === 1 ? 0 : 28}px)` }}>
                              <div className="h-14 w-14 bg-white border-4 border-brand-navy rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.2)] flex items-center justify-center group-active:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                                 <div className="w-1 h-6 bg-brand-navy/20 rounded-full"></div><div className="w-1 h-6 bg-brand-navy/20 rounded-full mx-1.5"></div><div className="w-1 h-6 bg-brand-navy/20 rounded-full"></div>
                              </div>
                           </div>
                        </div>

                        {/* Impact Cards */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-white rounded-xl border-l-4 border-brand-teal shadow-md w-full">
                              <div className="p-3 bg-brand-teal/10 rounded-full text-brand-teal shrink-0">
                                <Building size={24} />
                              </div>
                              <div className="text-center sm:text-left">
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 block mb-1">Direct-to-Vendor</span>
                                 <p className="text-brand-navy font-bold leading-tight text-sm md:text-base">{selectedImpact.transparencyDesc}</p>
                              </div>
                           </div>
                           
                           <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-brand-cream rounded-xl border border-brand-navy/5 w-full">
                              <div className={`p-3 rounded-full text-white shadow-sm shrink-0 ${selectedImpact.color}`}>
                                <Target size={24} />
                              </div>
                              <div className="text-center sm:text-left">
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 block mb-1">Direct Outcome</span>
                                 <p className="text-brand-navy font-bold leading-tight text-sm md:text-base">{multiplier} x {selectedImpact.desc}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        </div>

        {/* Live Invoice Preview */}
        <div className="lg:col-span-4 flex flex-col h-full mt-8 lg:mt-0 px-4 md:px-0">
            <div className="lg:sticky lg:top-32">
               <div className="relative bg-white shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group rounded-[1.5rem] overflow-hidden">
                  
                  {/* Invoice Header */}
                  <div className="bg-brand-navy p-6 flex justify-between items-center relative overflow-hidden">
                      <div>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal flex items-center gap-1"><Receipt size={12} /> Live Invoice</span>
                         <h4 className="font-display font-bold text-xl text-white mt-1">Pending Transaction</h4>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-mono text-white/40 block">#{Math.floor(Math.random() * 10000)}</span>
                         <span className="text-[10px] font-bold text-brand-yellow uppercase tracking-wider animate-pulse">Draft</span>
                      </div>
                  </div>

                  {/* Receipt Body */}
                  <div className="p-8 bg-white relative">
                     {/* Perforation Effect */}
                     <div className="absolute top-0 left-0 w-full h-2 bg-brand-navy" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>

                     <div className="space-y-6">
                        
                        <div className="flex justify-between items-start border-b border-dashed border-brand-navy/10 pb-4">
                           <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 block mb-1">Payable To</span>
                              <span className="font-bold text-brand-navy text-lg leading-tight block">{selectedImpact.vendorName}</span>
                              <span className="text-xs text-brand-teal flex items-center gap-1 mt-1 font-bold"><CheckCircle2 size={12} /> Verified Vendor</span>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 block mb-1">Date</span>
                              <span className="font-mono text-brand-navy text-sm font-bold">{new Date().toLocaleDateString()}</span>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-brand-navy/60 font-medium">{multiplier}x {selectedImpact.label}</span>
                              <span className="font-mono font-bold text-brand-navy">${totalAmount.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-brand-navy/60 font-medium">Platform Fee (0%)</span>
                              <span className="font-mono font-bold text-brand-navy">$0.00</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-brand-navy/60 font-medium">Processing</span>
                              <span className="font-mono font-bold text-brand-navy">$0.00</span>
                           </div>
                        </div>

                        <div className="border-t-2 border-brand-navy border-dashed pt-4">
                           <div className="flex justify-between items-end">
                              <span className="font-bold text-xl text-brand-navy">Total Due</span>
                              <span className="font-display font-bold text-[clamp(2rem,4vw,2.5rem)] text-brand-navy leading-none">${totalAmount.toFixed(2)}</span>
                           </div>
                        </div>

                     </div>
                     
                     {/* Buttons */}
                     <div className="mt-8 space-y-3">
                        <button onClick={() => { playClick(); setIsPaymentModalOpen(true); }} className="w-full bg-brand-navy text-white font-bold text-lg py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(45,156,142,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-3 border-2 border-brand-navy min-h-[60px] group">
                           Authorize Payment <ArrowRight strokeWidth={3} size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={handleQuickDonate} className="w-full bg-transparent text-brand-navy/60 font-bold text-xs py-3 rounded-xl hover:bg-brand-cream transition-colors flex items-center justify-center gap-2">
                           <Zap size={14} className="text-brand-yellow fill-brand-yellow" /> Quick Flash Fund ($10)
                        </button>
                     </div>

                     <div className="mt-6 text-center">
                        <span className="text-[10px] text-brand-navy/30 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                           <ShieldCheck size={12} /> 100% Secure Checkout
                        </span>
                     </div>
                     
                     {/* Bottom ZigZag */}
                     <div className="absolute bottom-0 left-0 w-full h-2 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }}></div>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};