
import React, { useEffect, useRef, useState } from 'react';
import { HeartHandshake, ArrowRight, Wind, Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { Mascot } from './Mascot';
import { SEOHead } from './SEOHead';
import { useStore } from '../context/StoreContext';

// --- SUB-COMPONENT: LIVE TICKER ---
const LiveTicker = () => {
  const items = [
    "RENT PAID: $850 (TX-921)",
    "BUS PASS ISSUED: $45 (TX-922)",
    "LAPTOP FUNDED: $299 (TX-923)",
    "GROCERIES SECURED: $120 (TX-924)",
    "UTILITIES PAID: $150 (TX-925)",
    "WORK BOOTS: $85 (TX-926)",
    "PHARMACY CO-PAY: $35 (TX-927)"
  ];
  
  return (
    <div className="w-full bg-brand-navy text-brand-teal overflow-hidden border-t border-brand-teal/20 fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="flex whitespace-nowrap py-3">
         <div className="animate-slide-left flex gap-12 text-xs font-bold font-mono tracking-widest uppercase items-center">
           {[...items, ...items, ...items].map((item, i) => (
             <span key={i} className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse"></span>
               {item}
             </span>
           ))}
         </div>
      </div>
      <style>{`
        @keyframes slideLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-slide-left {
          animation: slideLeft 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- SUB-COMPONENT: SYSTEM HUD ---
const SystemHUD = () => {
  const [deployed, setDeployed] = useState(1420);
  
  useEffect(() => {
    const interval = setInterval(() => {
       setDeployed(prev => prev + (Math.random() > 0.7 ? Math.floor(Math.random() * 50) : 0));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-32 left-0 w-full px-6 pointer-events-none hidden lg:flex justify-between items-start max-w-[1600px] mx-auto z-40">
       
       {/* Widget Left: Capital Velocity */}
       <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-lg flex items-center gap-4 animate-slide-up">
          <div className="bg-brand-teal/20 p-2 rounded-lg text-brand-teal">
            <TrendingUp size={20} />
          </div>
          <div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/60">Capital Deployed Today</div>
             <div className="text-xl font-display font-bold text-brand-navy font-mono">
               ${deployed.toLocaleString()}
             </div>
          </div>
       </div>

       {/* Widget Right: Active Sessions */}
       <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-lg flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-brand-coral/20 p-2 rounded-lg text-brand-coral">
             <Users size={20} />
          </div>
          <div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/60">Active Intake</div>
             <div className="text-xl font-display font-bold text-brand-navy font-mono flex items-center gap-2">
               4 <span className="text-xs text-brand-navy/40 font-sans">Families in queue</span>
             </div>
          </div>
       </div>
    </div>
  );
};

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { isCalmMode } = useStore();
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isCalmMode || window.matchMedia("(max-width: 768px)").matches) return;

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
           const x = (e.clientX / window.innerWidth) * 2 - 1;
           const y = (e.clientY / window.innerHeight) * 2 - 1;
           containerRef.current.style.setProperty('--mouse-x', x.toString());
           containerRef.current.style.setProperty('--mouse-y', y.toString());
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [isCalmMode]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] md:min-h-screen w-full flex flex-col justify-center overflow-hidden pb-16"
      aria-label="Introduction"
    >
      <SEOHead 
         title="SecondWind | Invest in Human Potential" 
         description="A direct-action recovery resource platform. We treat donations like investments, paying vendors directly for rent, tech, and transit. 100% transparency."
      />
      
      <LiveTicker />
      <SystemHUD />
      
      {/* Background Blobs */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translate(calc(var(--mouse-x, 0) * -10px), calc(var(--mouse-y, 0) * -10px))` }}
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand-teal opacity-10 rounded-full filter blur-[80px] md:blur-[100px] animate-blob mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-brand-coral opacity-10 rounded-full filter blur-[80px] md:blur-[100px] animate-blob mix-blend-multiply" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-[30%] left-[50%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-brand-yellow opacity-10 rounded-full filter blur-[60px] md:blur-[80px] animate-blob mix-blend-multiply" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-32 pb-12 md:py-0">
         
         {/* Left Side: Typography */}
         <div className="lg:col-span-8 relative flex flex-col items-center lg:items-start text-center lg:text-left z-20">
            
            <div 
              className="relative z-20 transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `translate(calc(var(--mouse-x, 0) * -20px), calc(var(--mouse-y, 0) * -20px))` }}
            >
              <h1 className="font-display font-bold leading-[0.85] md:leading-[0.85] tracking-tighter text-brand-navy select-none pointer-events-none" aria-label="Get back up.">
                <span className="block text-[clamp(4rem,15vw,11rem)] opacity-0 animate-slide-up min-h-[1em]" style={{ animationDelay: '0.1s' }} aria-hidden="true">
                  GET
                </span>
                <span className="block text-[clamp(4rem,15vw,11rem)] opacity-0 animate-slide-up text-stroke-navy relative min-h-[1em]" style={{ animationDelay: '0.2s' }} aria-hidden="true">
                   BACK
                   <span className="absolute top-1 left-1 md:top-3 md:left-3 text-brand-coral opacity-20 blur-sm pointer-events-none -z-10">BACK</span>
                </span>
                <span className="block text-[clamp(4rem,15vw,11rem)] opacity-0 animate-slide-up text-brand-navy min-h-[1em]" style={{ animationDelay: '0.3s' }} aria-hidden="true">
                  UP<span className="text-brand-coral inline-block animate-pulse text-[1.2em] leading-none">.</span>
                </span>
              </h1>
            </div>

            {/* Floating Mascot */}
            <div 
               className="
                 absolute 
                 z-10
                 top-[-40px] right-[-10px] 
                 sm:top-[-30px] sm:right-[10%]
                 md:top-[0px] md:right-[5%] 
                 lg:right-[-20px] lg:top-[10px]
                 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-72 lg:h-72 
                 opacity-0 animate-slide-up pointer-events-none
               " 
               style={{ 
                 animationDelay: '0.6s',
                 transform: `
                    translate(calc(var(--mouse-x, 0) * -40px), calc(var(--mouse-y, 0) * -40px)) 
                    rotate(calc(var(--mouse-x, 0) * 5deg))
                 `
               }}
               aria-hidden="true"
            >
                <div className="w-full h-full aspect-square filter drop-shadow-2xl">
                    <Mascot expression="excited" className="w-full h-full opacity-90" />
                </div>
            </div>
         </div>

         {/* Right Side: The "Card" */}
         <div className="lg:col-span-4 perspective-1000 w-full max-w-md lg:max-w-none mx-auto mt-12 lg:mt-32 relative z-30">
            <article 
              className={`
                relative p-6 md:p-10 rounded-[2.5rem] transition-all duration-500 ease-out transform 
                group hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.5)] shadow-2xl
                opacity-0 animate-slide-up will-change-transform
                bg-white/60 backdrop-blur-2xl border border-white/80
              `}
              style={{ 
                animationDelay: '0.8s',
                transform: `
                  translate(calc(var(--mouse-x, 0) * -15px), calc(var(--mouse-y, 0) * -15px))
                  rotateX(calc(var(--mouse-y, 0) * -2deg))
                  rotateY(calc(var(--mouse-x, 0) * 2deg))
                `
              }}
            >
               <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] pointer-events-none"></div>

               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center shrink-0 shadow-lg border-2 border-brand-cream">
                      <Wind size={24} className="animate-pulse-fast" />
                   </div>
                   <h2 className="font-bold text-2xl md:text-3xl text-brand-navy font-display leading-none">Zero Red Tape.</h2>
                 </div>
                 
                 <p id="hero-description" className="text-lg md:text-xl text-brand-navy/80 leading-relaxed mb-8 font-medium tracking-tight">
                   We replaced the bureaucracy with a bridge. Direct funding for rent, tech, and transit. No black holes.
                 </p>
                 
                 <div className="flex flex-col gap-4">
                   <button 
                     onClick={() => onNavigate('donate')}
                     aria-label="Give Support"
                     className="w-full bg-brand-navy text-white px-8 py-5 rounded-2xl font-bold hover:bg-brand-teal transition-all flex items-center justify-between group shadow-lg active:scale-95 relative overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                     <span className="relative z-10 text-lg">Give Support</span>
                     <div className="relative z-10 bg-white/20 p-2 rounded-full group-hover:scale-125 transition-transform">
                        <HeartHandshake size={20} />
                     </div>
                   </button>
                   <button 
                     onClick={() => onNavigate('apply')}
                     aria-label="Get Support"
                     className="w-full bg-white/50 border-2 border-brand-navy/10 text-brand-navy px-8 py-5 rounded-2xl font-bold hover:bg-white hover:border-brand-navy/30 transition-all flex items-center justify-between group active:scale-95"
                   >
                     <span className="text-lg">Get Support</span>
                     <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                 </div>
               </div>
            </article>
         </div>
      </div>
    </section>
  );
};
