
import React, { useEffect, useRef } from 'react';
import { HeartHandshake, ArrowRight, Wind, ChevronDown, Activity, Building2, Sparkles, ArrowUpRight, Crown, CheckCircle2, ShieldCheck } from 'lucide-react';
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
         title="SecondWind | Sober Living Funding & Rehab Assistance Colorado" 
         description="Direct-action recovery in Colorado. We pay sober living rent, provide transit for rehab, and fund technology for recovery in Denver and Boulder."
         schema={{
           "@context": "https://schema.org",
           "@type": "WebPage",
           "name": "SecondWind Colorado Recovery",
           "spatialCoverage": "Colorado",
           "mainEntity": {
              "@type": "Organization",
              "name": "SecondWind Recovery",
              "description": "Providing direct financial aid for sober living and addiction recovery in Colorado."
           }
         }}
      />

      {/* --- HERO FOLD --- */}
      <section 
        className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-center"
        aria-label="Introduction"
      >
        {/* Abstract Background Elements - Fixed z-index 0 */}
        <div className="absolute inset-0 pointer-events-none z-0">
            {/* Moving Grid */}
            <div className="absolute inset-0 opacity-[0.03] animate-slide-left" style={{ 
                backgroundImage: 'linear-gradient(90deg, #1A2A3A 1px, transparent 1px), linear-gradient(#1A2A3A 1px, transparent 1px)', 
                backgroundSize: '80px 80px',
                width: '200%' 
            }}></div>
            
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
        <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 flex-grow flex flex-col justify-center pt-24 pb-8 lg:pt-0 lg:pb-0">
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center h-full">
               
               {/* 
                  LEFT COLUMN: TYPOGRAPHY (7 Columns)
                  Order 1 on Mobile, Order 1 on Desktop
               */}
               <div className="lg:col-span-7 flex flex-col justify-center items-start leading-[0.85] select-none order-1">
                   <h1 className="font-display font-bold text-[13vw] lg:text-[7.5vw] xl:text-[8vw] text-brand-navy tracking-[-0.04em] animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                      INVEST IN
                   </h1>
                   <div className="flex items-center gap-4 w-full">
                      <h1 className="font-display font-bold text-[13vw] lg:text-[7.5vw] xl:text-[8vw] text-brand-teal tracking-[-0.04em] animate-slide-up opacity-0 whitespace-nowrap" style={{ animationDelay: '0.2s' }}>
                         COLORADO
                      </h1>
                      {/* Line Decorator */}
                      <div className="hidden xl:block h-[1vw] flex-grow bg-brand-navy/5 rounded-full mt-3 animate-slide-up opacity-0 origin-left overflow-hidden relative" style={{ animationDelay: '0.4s', transform: 'scaleX(1)' }}>
                         <div className="absolute inset-0 bg-brand-navy/10 animate-slide-left" style={{ width: '200%', background: 'linear-gradient(90deg, transparent, rgba(26,42,58,0.2), transparent)' }}></div>
                      </div>
                   </div>
                   <h1 className="font-display font-bold text-[13vw] lg:text-[7.5vw] xl:text-[8vw] text-brand-navy tracking-[-0.04em] animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
                      RECOVERY<span className="text-brand-coral">.</span>
                   </h1>
                   
                   {/* Subtext */}
                   <p className="mt-8 text-lg md:text-xl lg:text-2xl text-brand-navy/60 font-medium max-w-xl animate-slide-up opacity-0 leading-relaxed" style={{ animationDelay: '0.4s' }}>
                      The protocol for direct-action aid. We replace bureaucracy with instant, verified funding for sober living rent and rehab access.
                   </p>

                   {/* Mobile Only HUD (Moved here for flow) */}
                   <div className="lg:hidden w-full mt-8 animate-slide-up opacity-0" style={{ animationDelay: '0.5s' }}>
                      <div className="flex gap-3">
                        <button 
                           onClick={() => onNavigate('apply')}
                           className="flex-1 bg-brand-navy text-white py-4 rounded-xl font-bold"
                        >
                           Get Help
                        </button>
                        <button 
                           onClick={() => onNavigate('donate')}
                           className="flex-1 bg-brand-teal text-white py-4 rounded-xl font-bold"
                        >
                           Invest
                        </button>
                      </div>
                   </div>
               </div>

               {/* 
                  RIGHT COLUMN: VISUAL COMPOSITION (5 Columns)
                  Order 2 on Mobile, Order 2 on Desktop
                  Vertically stacked Visuals
               */}
               <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center order-2 mt-8 lg:mt-0">
                  
                  {/* Visual Cluster Container */}
                  <div className="relative w-full max-w-md lg:max-w-full flex flex-col items-center lg:items-end">
                      
                      {/* Mascot - Anchored */}
                      <div className="relative w-[60vw] h-[60vw] max-w-[300px] max-h-[300px] lg:w-[500px] lg:h-[500px] lg:max-w-none lg:max-h-none animate-float z-10 lg:-mr-12">
                         <Mascot expression="excited" variant="tech" className="w-full h-full drop-shadow-2xl" />
                      </div>

                      {/* Cards Stack - Overlapping Mascot slightly */}
                      <div className="flex flex-col gap-4 w-full max-w-sm relative z-20 -mt-12 lg:-mt-24 lg:mr-8">
                          
                          {/* MANIFESTO CARD */}
                          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-xl hover:rotate-1 transition-transform duration-500 group animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
                             <div className="flex items-center gap-2 mb-3 text-brand-navy/40 font-mono text-xs uppercase tracking-widest">
                                <Wind size={14} className="animate-pulse text-brand-teal" /> The Protocol
                             </div>
                             <p className="font-medium text-brand-navy text-base leading-relaxed">
                                We bridge the gap. <span className="text-brand-teal font-bold bg-brand-teal/10 px-1 rounded cursor-default">Direct-to-vendor payments</span> ensure every dollar hits the target.
                             </p>
                          </div>

                          {/* PEER COACHING CARD (THE UNLOCK) */}
                          {/* Designed to look like a Premium/Gold Credit Card or VIP Pass */}
                          <div 
                            onClick={() => onNavigate('peer-coaching')}
                            className="relative overflow-hidden p-[2px] rounded-2xl shadow-2xl cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group animate-slide-up opacity-0"
                            style={{ animationDelay: '0.7s' }}
                          >
                             {/* Animated Border Gradient */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow via-brand-coral to-brand-teal opacity-80 group-hover:opacity-100 animate-spin-slow" style={{ animationDuration: '4s' }}></div>
                             
                             {/* Card Body */}
                             <div className="relative bg-brand-navy h-full rounded-[14px] p-5 flex items-center justify-between">
                                {/* Glass Shine */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                                
                                <div className="flex flex-col gap-1 relative z-10">
                                   <div className="flex items-center gap-2 mb-1">
                                      <div className="bg-brand-yellow/20 text-brand-yellow p-1.5 rounded-lg">
                                        <Crown size={16} fill="currentColor" />
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow">Benefit Unlocked</span>
                                   </div>
                                   <h4 className="font-bold text-white text-lg leading-tight">Peer Recovery Agent</h4>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className="text-white/40 text-xs line-through">$500/mo Value</span>
                                      <span className="text-brand-teal font-bold text-xs bg-brand-teal/10 px-2 py-0.5 rounded flex items-center gap-1">
                                        Free with Medicaid <CheckCircle2 size={10} />
                                      </span>
                                   </div>
                                </div>

                                <div className="bg-white/10 p-3 rounded-full group-hover:bg-brand-yellow group-hover:text-brand-navy transition-all duration-300">
                                   <ArrowRight size={20} />
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
           <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-[2rem] p-3 flex items-center gap-4 shadow-[0_8px_32px_rgba(26,42,58,0.08)] animate-slide-up opacity-0" style={{ animationDelay: '0.8s' }}>
              
              {/* Stat Ticker */}
              <div className="flex-1 flex items-center gap-5 px-6 border-r border-brand-navy/5 pr-8">
                 <div className="w-12 h-12 bg-brand-navy text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy to-brand-teal opacity-50"></div>
                    <Activity size={20} className="relative z-10" />
                 </div>
                 <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40">Live Capital Deployed in CO</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse"></div>
                    </div>
                    <div className="flex items-baseline gap-3">
                       <span className="font-display font-bold text-3xl text-brand-navy tracking-tight">
                         <AnimatedCounter end={1240402} />
                       </span>
                       <span className="text-brand-navy/20 text-xl font-light">|</span>
                       <span className="font-mono text-xs font-bold text-brand-yellow bg-brand-navy/5 px-2 py-1 rounded border border-brand-navy/5 flex items-center gap-1">
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
                    <span className="relative z-10">Invest Now</span>
                    <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform w-[18px] relative z-10" />
                 </button>
              </div>

           </div>
        </div>
        
      </section>

      {/* --- TRUST SIGNALS --- */}
      <div className="w-full bg-brand-navy/5 py-8 border-y border-brand-navy/5 overflow-hidden">
         <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="text-brand-navy/40 text-xs font-bold uppercase tracking-widest whitespace-nowrap shrink-0">
               Directly Paying Verified Vendors:
            </div>
            <div className="flex items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto no-scrollbar w-full md:w-auto">
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
