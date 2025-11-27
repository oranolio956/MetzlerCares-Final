
import React, { useEffect, useState, useRef } from 'react';
import { HeartHandshake, ArrowRight, Wind, ChevronDown, Zap, ShieldCheck, FileText, Lock, ArrowUpRight, Activity, Building2, Users, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';
import { SEOHead } from './SEOHead';
import { useStore } from '../context/StoreContext';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

// Simple easing function for the counter
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const AnimatedCounter = ({ end, prefix = '$' }: { end: number, prefix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2000; // 2s duration

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      setCount(Math.floor(easedProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end]);

  return <span className="font-mono font-bold">{prefix}{count.toLocaleString()}</span>;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [offset, setOffset] = useState(0);
  const { isCalmMode } = useStore();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCalmMode) return;
    const handleScroll = () => {
      if (heroRef.current) {
        setOffset(window.pageYOffset);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCalmMode]);

  return (
    <div className="w-full" ref={heroRef}>
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

      {/* --- HERO FOLD: EDITORIAL LAYOUT --- */}
      <section 
        className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col pt-24 pb-4 md:pb-8"
        aria-label="Introduction"
      >
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
            {/* Moving Grid */}
            <div className="absolute inset-0 opacity-[0.03] animate-slide-left" style={{ 
                backgroundImage: 'linear-gradient(90deg, #1A2A3A 1px, transparent 1px), linear-gradient(#1A2A3A 1px, transparent 1px)', 
                backgroundSize: '80px 80px',
                width: '200%' 
            }}></div>
            
            {/* Parallax blobs */}
            <div 
                className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-brand-teal/5 rounded-full blur-[80px] md:blur-[120px]"
                style={{ transform: `translateY(${offset * 0.2}px)` }}
            ></div>
            <div 
                className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-coral/5 rounded-full blur-[80px] md:blur-[120px]"
                style={{ transform: `translateY(${offset * -0.1}px)` }}
            ></div>
        </div>

        <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 flex-grow flex flex-col justify-center">
           
           {/* MASSIVE TYPOGRAPHY LAYER */}
           <div className="relative w-full mt-12 md:mt-0">
              <div className="flex flex-col items-start leading-[0.85] select-none pointer-events-none mix-blend-darken relative z-10">
                 <h1 className="font-display font-bold text-[13vw] md:text-[11vw] text-brand-navy tracking-[-0.04em] animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                    INVEST IN
                 </h1>
                 <div className="flex items-center gap-4 w-full">
                    <h1 className="font-display font-bold text-[13vw] md:text-[11vw] text-brand-teal tracking-[-0.04em] animate-slide-up opacity-0 whitespace-nowrap" style={{ animationDelay: '0.2s' }}>
                       COLORADO
                    </h1>
                    {/* Desktop Line Decorator */}
                    <div className="hidden md:block h-[1.5vw] flex-grow bg-brand-navy/5 rounded-full mt-4 animate-slide-up opacity-0 origin-left overflow-hidden relative" style={{ animationDelay: '0.4s', transform: 'scaleX(1)' }}>
                       <div className="absolute inset-0 bg-brand-navy/10 animate-slide-left" style={{ width: '200%', background: 'linear-gradient(90deg, transparent, rgba(26,42,58,0.2), transparent)' }}></div>
                    </div>
                 </div>
                 <h1 className="font-display font-bold text-[13vw] md:text-[11vw] text-brand-navy tracking-[-0.04em] animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
                    RECOVERY<span className="text-brand-coral">.</span>
                 </h1>
              </div>

              {/* MASCOT INTERACTION LAYER (Overlaps Text) */}
              <div 
                className="absolute right-[-8%] top-[12%] md:right-0 md:top-[8%] w-[50vw] h-[50vw] md:w-[38vw] md:h-[38vw] max-w-[550px] max-h-[550px] z-20 pointer-events-none animate-float"
                style={{ transform: `translateY(${offset * 0.15}px)` }}
              >
                 <Mascot expression="excited" variant="tech" className="w-full h-full drop-shadow-[0_20px_50px_rgba(45,156,142,0.3)]" />
              </div>

              {/* MANIFESTO SNIPPET (Adaptive Positioning) */}
              <div className="mt-8 md:mt-0 relative md:absolute left-0 md:left-[55%] bottom-auto md:bottom-[15%] z-20 max-w-sm md:max-w-md animate-slide-up opacity-0 w-full" style={{ animationDelay: '0.6s' }}>
                  <div className="bg-white/70 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] md:rotate-1 hover:rotate-0 transition-transform duration-500 group mb-4">
                     <div className="flex items-center gap-2 mb-2 md:mb-3 text-brand-navy/40 font-mono text-[10px] md:text-xs uppercase tracking-widest">
                        <Wind size={14} className="animate-pulse text-brand-teal" /> The Colorado Recovery Protocol
                     </div>
                     <h2 className="sr-only">Sober Living Funding in Denver</h2>
                     <p className="font-medium text-brand-navy text-base md:text-lg leading-relaxed">
                        We replaced the bureaucracy with a bridge. <span className="text-brand-teal font-bold bg-brand-teal/10 px-1 rounded group-hover:bg-brand-teal group-hover:text-white transition-colors cursor-default">Direct-to-vendor payments</span> for sober living rent and rehab access across Colorado.
                     </p>
                  </div>

                  {/* UPGRADED PEER COACHING TEASER */}
                  <div 
                    onClick={() => onNavigate('peer-coaching')}
                    className="relative bg-brand-navy text-white p-1 rounded-2xl shadow-xl cursor-pointer transform hover:scale-105 hover:-rotate-1 transition-all group"
                  >
                     {/* Pop Art Border */}
                     <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-brand-yellow opacity-30 group-hover:opacity-100 transition-opacity"></div>
                     
                     <div className="bg-brand-navy rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                        {/* Shine */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-teal/30 rounded-full blur-xl -mr-6 -mt-6 animate-pulse"></div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="bg-brand-yellow text-brand-navy p-3 rounded-xl shadow-lg font-bold transform group-hover:rotate-12 transition-transform">
                              <Sparkles size={20} fill="currentColor" />
                           </div>
                           <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow mb-0.5 block">New Feature</span>
                              <span className="font-display font-bold text-lg leading-none block">Free Peer Coaching</span>
                              <span className="text-xs text-white/60">Unlock with Medicaid</span>
                           </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-full group-hover:bg-white group-hover:text-brand-navy transition-colors">
                           <ArrowRight size={16} />
                        </div>
                     </div>
                  </div>
              </div>
           </div>

        </div>

        {/* --- BOTTOM HUD / FLOATING DOCK --- */}
        <div className="relative z-30 mt-auto px-4 sm:px-6 md:px-12 w-full max-w-[1800px] mx-auto pt-8 md:pt-12 pb-4">
           <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-[2rem] p-2 md:p-3 flex flex-col lg:flex-row items-center gap-4 shadow-[0_8px_32px_rgba(26,42,58,0.08)] animate-slide-up opacity-0" style={{ animationDelay: '0.8s' }}>
              
              {/* Stat Ticker (Left) */}
              <div className="flex-1 w-full lg:w-auto flex items-center gap-3 md:gap-5 px-4 md:px-6 py-2 border-b lg:border-b-0 lg:border-r border-brand-navy/5 pb-4 lg:pb-0 lg:pr-8">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-navy text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy to-brand-teal opacity-50"></div>
                    <Activity size={20} className="relative z-10" />
                 </div>
                 <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 truncate">Live Capital Deployed in CO</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse"></div>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2 md:gap-3 overflow-hidden">
                       <span className="font-display font-bold text-xl md:text-3xl text-brand-navy whitespace-nowrap tracking-tight">
                         <AnimatedCounter end={1240402} />
                       </span>
                       <span className="text-brand-navy/20 hidden sm:inline text-xl font-light">|</span>
                       <span className="font-mono text-xs md:text-sm font-bold text-brand-teal whitespace-nowrap bg-brand-teal/10 px-2 py-0.5 rounded">850 Rent Payments</span>
                    </div>
                 </div>
              </div>

              {/* Primary Actions (Right) */}
              <div className="flex flex-row w-full lg:w-auto gap-2 md:gap-3 p-1">
                 <button 
                   onClick={() => onNavigate('apply')}
                   className="flex-1 lg:flex-none px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-brand-navy hover:bg-brand-navy/5 transition-colors border-2 border-transparent hover:border-brand-navy/5 flex items-center justify-center gap-2 whitespace-nowrap group text-sm md:text-base"
                 >
                    Get Help <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform opacity-50 md:w-[18px]" />
                 </button>
                 <button 
                   onClick={() => onNavigate('donate')}
                   className="flex-[2] lg:flex-none px-6 md:px-10 py-3 md:py-4 bg-brand-navy text-white rounded-xl md:rounded-2xl font-bold hover:bg-brand-teal transition-all shadow-lg flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap active:scale-95 group text-sm md:text-base relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <HeartHandshake size={18} className="fill-current md:w-5 md:h-5 relative z-10" />
                    <span className="relative z-10">Invest Now</span>
                    <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform md:w-[18px] relative z-10" />
                 </button>
              </div>

           </div>
        </div>
        
      </section>

      {/* --- TRUST SIGNALS (SEO & CREDIBILITY BRIDGE) --- */}
      <div className="w-full bg-brand-navy/5 py-6 md:py-8 border-y border-brand-navy/5 overflow-hidden">
         <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <div className="text-brand-navy/40 text-xs font-bold uppercase tracking-widest whitespace-nowrap shrink-0">
               Directly Paying Verified Vendors:
            </div>
            <div className="flex items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto no-scrollbar w-full md:w-auto">
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
               <div className="flex items-center gap-2 shrink-0">
                  <Building2 size={24} />
                  <span className="font-display font-bold text-lg text-brand-navy">Peer 180</span>
               </div>
            </div>
         </div>
      </div>

      {/* --- SCROLL PROMPT --- */}
      <div className="w-full flex justify-center py-4 md:py-8">
         <ChevronDown className="animate-bounce text-brand-navy/20 w-6 h-6 md:w-8 md:h-8" />
      </div>

    </div>
  );
};
