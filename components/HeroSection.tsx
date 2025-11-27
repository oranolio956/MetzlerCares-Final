import React, { useEffect, useRef } from 'react';
import { HeartHandshake, ArrowRight, ChevronDown, Activity, Building2, ArrowUpRight, ShieldCheck, Clock, Zap, Star, Crown } from 'lucide-react';
import { Mascot } from './Mascot';
import { SEOHead } from './SEOHead';
import { useStore } from '../context/StoreContext';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

// Simple easing function for the counter
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const AnimatedCounter = ({ end, prefix = '$' }: { end: number, prefix?: string }) => {
  const [count, ReactSetCount] = React.useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2000; // 2s duration

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      ReactSetCount(Math.floor(easedProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end]);

  return <span className="font-mono font-bold">{prefix}{count.toLocaleString()}</span>;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { isCalmMode } = useStore();
  
  // Refs for direct DOM manipulation to avoid re-renders on scroll
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCalmMode) return;
    
    const handleScroll = () => {
      const y = window.scrollY;
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translateY(${y * 0.2}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translateY(${y * -0.1}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCalmMode]);

  return (
    <div className="w-full relative bg-[#FDFBF7]">
      <SEOHead 
         title="Colorado Sober Living Funding & Rehab Assistance | SecondWind" 
         description="Direct-action recovery in Colorado. We pay sober living rent, provide transit for rehab, and fund technology for recovery in Denver and Boulder."
         schema={{
           "@context": "https://schema.org",
           "@type": "NGO",
           "name": "SecondWind Colorado Recovery",
           "alternateName": "SecondWind Fund",
           "areaServed": {
             "@type": "State",
             "name": "Colorado"
           },
           "mainEntityOfPage": "https://secondwind.org",
           "description": "Providing direct financial aid for sober living and addiction recovery in Colorado."
         }}
      />

      {/* --- HERO FOLD --- */}
      <section 
        className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-center"
        aria-label="Introduction"
      >
        {/* Abstract Background Elements - Fixed z-index 0 */}
        <div className="absolute inset-0 pointer-events-none z-0">
            
            {/* Parallax blobs */}
            <div 
                ref={blob1Ref}
                className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-brand-teal/5 rounded-full blur-[80px] md:blur-[120px] transition-transform duration-75 ease-out"
            ></div>
            <div 
                ref={blob2Ref}
                className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-coral/5 rounded-full blur-[80px] md:blur-[120px] transition-transform duration-75 ease-out"
            ></div>
        </div>

        {/* CONTENT CONTAINER - Z-Index 10 */}
        {/* GRID LAYOUT: Strict separation of Text (Left) and Visuals (Right) on Desktop */}
        <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 flex-grow flex flex-col justify-center pt-28 pb-12 lg:py-0">
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
               
               {/* 
                  LEFT COLUMN: TYPOGRAPHY (7 Columns)
                  Using order-1 on mobile ensures text comes first.
               */}
               <div className="lg:col-span-7 flex flex-col justify-center items-start leading-[0.85] select-none order-1">
                   <h1 className="font-display font-bold text-[clamp(2.75rem,12vw,9rem)] text-brand-navy tracking-[-0.04em] animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                      INVEST IN
                   </h1>
                   <div className="flex items-center gap-4 w-full">
                      <h2 className="font-display font-bold text-[clamp(2.75rem,12vw,9rem)] text-brand-teal tracking-[-0.04em] animate-slide-up opacity-0 whitespace-nowrap" style={{ animationDelay: '0.2s' }}>
                         COLORADO
                      </h2>
                      {/* Line Decorator */}
                      <div className="hidden xl:block h-[1vw] flex-grow bg-brand-navy/5 rounded-full mt-3 animate-slide-up opacity-0 origin-left overflow-hidden relative" style={{ animationDelay: '0.4s', transform: 'scaleX(1)' }}>
                         <div className="absolute inset-0 bg-brand-navy/10 animate-slide-left" style={{ width: '200%', background: 'linear-gradient(90deg, transparent, rgba(26,42,58,0.2), transparent)' }}></div>
                      </div>
                   </div>
                   <h2 className="font-display font-bold text-[clamp(2.75rem,12vw,9rem)] text-brand-navy tracking-[-0.04em] animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
                      RECOVERY<span className="text-brand-coral">.</span>
                   </h2>
                   
                   {/* Subtext */}
                   <p className="mt-8 text-lg md:text-xl lg:text-2xl text-brand-navy/60 font-medium max-w-xl animate-slide-up opacity-0 leading-relaxed" style={{ animationDelay: '0.4s' }}>
                      The platform for direct-action aid. We replace bureaucracy with instant, verified funding for sober living rent and rehab access in Denver & Boulder.
                   </p>

                   {/* Mobile Only HUD - Kept under text for immediate action */}
                   <div className="lg:hidden w-full mt-8 animate-slide-up opacity-0" style={{ animationDelay: '0.5s' }}>
                      <div className="flex gap-3">
                        <button 
                           onClick={() => onNavigate('apply')}
                           className="flex-1 bg-brand-navy text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
                        >
                           Get Help
                        </button>
                        <button 
                           onClick={() => onNavigate('donate')}
                           className="flex-1 bg-brand-teal text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
                        >
                           Donate
                        </button>
                      </div>
                   </div>
               </div>

               {/* 
                  RIGHT COLUMN: VISUAL COMPOSITION (5 Columns)
                  order-2 ensures it stacks below text on mobile
               */}
               <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center order-2 mt-8 lg:mt-0 lg:mb-12">
                  
                  {/* Visual Cluster Container */}
                  <div className="relative w-full max-w-md lg:max-w-full flex flex-col items-center lg:items-end">
                      
                      {/* Mascot - Positioned relatively to stack naturally on mobile */}
                      <div className="relative w-[60vw] h-[60vw] max-w-[300px] max-h-[300px] lg:w-[400px] lg:h-[400px] animate-float z-0 lg:mr-24 opacity-60 mb-8 lg:mb-0">
                         <Mascot expression="excited" variant="tech" className="w-full h-full drop-shadow-xl grayscale opacity-50" reactToScroll={true} />
                      </div>

                      {/* SYSTEM STATUS BOARD */}
                      <div className="flex flex-col items-end gap-6 w-full max-w-sm relative z-20 -mt-12 lg:-mt-48 transition-transform duration-300">
                          
                          {/* 1. Small Rent Grant Status (Background) */}
                          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-brand-navy/10 shadow-lg flex items-center justify-between animate-slide-up opacity-0 w-[90%] self-end mr-4 transform scale-95 origin-right" style={{ animationDelay: '0.6s' }}>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow shrink-0"><Clock size={16} /></div>
                                <div>
                                    <div className="font-bold text-brand-navy text-sm">Rent Grants</div>
                                    <div className="text-[10px] text-brand-navy/50 font-bold uppercase tracking-wider">High Demand</div>
                                </div>
                             </div>
                             <span className="px-2 py-1 bg-brand-yellow/10 text-brand-yellow rounded text-[10px] font-bold uppercase tracking-wide border border-brand-yellow/20">Waitlist</span>
                          </div>

                          {/* 2. THE GOLDEN TICKET: PEER COACHING (Featured) */}
                          <div 
                            onClick={() => onNavigate('peer-coaching')}
                            // Increased scale, padding, and z-index for prominence
                            className="w-full relative group cursor-pointer animate-slide-up opacity-0 transform scale-105 hover:scale-[1.08] transition-all duration-300 z-30"
                            style={{ animationDelay: '0.7s' }}
                          >
                             {/* Enhanced Pulsing Ring with stronger glow */}
                             <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-teal via-brand-yellow to-brand-teal rounded-2xl opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition duration-1000 group-hover:duration-200 animate-text-shimmer bg-[length:200%_auto]"></div>
                             
                             {/* Card Body - Larger padding */}
                             <div className="relative bg-[#1A2A3A] text-white p-8 rounded-xl flex flex-col gap-6 overflow-hidden border border-white/20 shadow-[0_20px_60px_-15px_rgba(45,156,142,0.5)]">
                                
                                {/* Background Shine */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-yellow text-brand-navy rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                                        <Crown size={14} fill="currentColor" /> Premium Access
                                    </div>
                                    <div className="w-3 h-3 rounded-full bg-brand-teal animate-pulse shadow-[0_0_15px_#2D9C8E]"></div>
                                </div>

                                <div>
                                    <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">Peer Coaching</h3>
                                    <p className="text-base md:text-lg text-brand-lavender font-medium leading-relaxed">Instant Medicaid Approval. <br/>Skip the waitlist.</p>
                                </div>

                                <div className="mt-2 pt-6 border-t border-white/10 flex justify-between items-center">
                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-[#1A2A3A] bg-brand-teal flex items-center justify-center text-xs font-bold shadow-lg">You</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-[#1A2A3A] bg-white flex items-center justify-center text-xs font-bold text-brand-navy shadow-lg">Coach</div>
                                    </div>
                                    {/* Enhanced High-Contrast Button */}
                                    <button className="bg-white text-brand-navy px-6 py-3 rounded-xl font-bold text-base flex items-center gap-2 hover:bg-brand-teal hover:text-white transition-colors shadow-xl hover:shadow-2xl">
                                        Unlock Now <ArrowRight size={18} />
                                    </button>
                                </div>
                             </div>
                          </div>

                      </div>
                  </div>

               </div>
           </div>

        </div>

        {/* --- BOTTOM HUD / FLOATING DOCK (Desktop Only) --- */}
        <div className="hidden lg:block relative z-30 mt-auto px-12 w-full max-w-[1800px] mx-auto pb-8">
           <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-[2rem] p-3 flex items-center gap-4 shadow-[0_8px_32px_rgba(26,42,58,0.08)] animate-slide-up opacity-0 hover:shadow-xl transition-shadow duration-300" style={{ animationDelay: '0.8s' }}>
              
              {/* Stat Ticker */}
              <div className="flex-1 flex items-center gap-5 px-6 border-r border-brand-navy/5 pr-8">
                 <div className="w-12 h-12 bg-brand-navy text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy to-brand-teal opacity-50"></div>
                    <Activity size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
                 </div>
                 <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40">Funds Distributed in CO</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse"></div>
                    </div>
                    <div className="flex items-baseline gap-3">
                       <span className="font-display font-bold text-3xl text-brand-navy tracking-tight">
                         <AnimatedCounter end={1240402} />
                       </span>
                       <span className="text-brand-navy/20 text-xl font-light">|</span>
                       <span className="font-mono text-xs font-bold text-brand-yellow bg-brand-navy/5 px-2 py-1 rounded border border-brand-navy/5 flex items-center gap-1 cursor-help" title="Active Medicaid contracts available">
                          <ShieldCheck size={10} /> Medicaid Coaching Available
                       </span>
                    </div>
                 </div>
              </div>

              {/* Primary Actions */}
              <div className="flex gap-3 p-1">
                 <button 
                   onClick={() => onNavigate('apply')}
                   className="px-8 py-4 rounded-2xl font-bold text-brand-navy hover:bg-brand-navy/5 transition-colors border-2 border-transparent hover:border-brand-navy/5 flex items-center justify-center gap-2 whitespace-nowrap group text-base"
                 >
                    Get Help <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform opacity-50 w-[18px]" />
                 </button>
                 <button 
                   onClick={() => onNavigate('donate')}
                   className="px-10 py-4 bg-brand-navy text-white rounded-2xl font-bold hover:bg-brand-teal transition-all shadow-lg flex items-center justify-center gap-3 whitespace-nowrap active:scale-95 group text-base relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <HeartHandshake size={18} className="fill-current w-5 h-5 relative z-10" />
                    <span className="relative z-10">Donate Now</span>
                    <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform w-[18px] relative z-10" />
                 </button>
              </div>

           </div>
        </div>
        
      </section>

      {/* --- TRUST SIGNALS --- */}
      <div className="w-full bg-brand-navy/5 py-12 border-y border-brand-navy/5 overflow-hidden">
         <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="text-brand-navy/40 text-xs font-bold uppercase tracking-widest whitespace-nowrap shrink-0">
               Directly Paying Verified Vendors:
            </div>
            <div className="flex items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto no-scrollbar w-full md:w-auto mask-linear-fade">
               <div className="flex items-center gap-2 shrink-0">
                  <Building2 size={24} />
                  <span className="font-display font-bold text-lg text-brand-navy">Oxford House CO</span>
               </div>
               <div className="flex items-center gap-2 shrink-0">
                  <Building2 size={24} />
                  <span className="font-display font-bold text-lg text-brand-navy">RTD Denver</span>
               </div>
               <div className="flex items-center gap-2 shrink-0">
                  <Building2 size={24} />
                  <span className="font-display font-bold text-lg text-brand-navy">TechReuse</span>
               </div>
               <div className="flex items-center gap-2 shrink-0">
                  <Building2 size={24} />
                  <span className="font-display font-bold text-lg text-brand-navy">Denver Health</span>
               </div>
            </div>
         </div>
      </div>

      {/* --- SCROLL PROMPT --- */}
      <div className="w-full flex justify-center py-8">
         <ChevronDown className="animate-bounce text-brand-navy/20 w-8 h-8" />
      </div>

    </div>
  );
};