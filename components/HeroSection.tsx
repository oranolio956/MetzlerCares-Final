
import React, { useEffect, useState } from 'react';
import { HeartHandshake, ArrowRight, Wind } from 'lucide-react';
import { Mascot } from './Mascot';
import { SEOHead } from './SEOHead';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
  isCalmMode: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, isCalmMode }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  // Parallax Logic - Only active on desktop for performance
  useEffect(() => {
    // Disable on mobile completely for battery/performance
    if (isCalmMode || window.matchMedia("(max-width: 768px)").matches) return;

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePos({ x, y });
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
      className="relative min-h-screen w-full flex flex-col justify-start md:justify-center overflow-x-hidden"
      aria-label="Introduction"
    >
      <SEOHead 
         title="SecondWind | Invest in Human Potential" 
         description="A direct-action recovery resource platform. We treat donations like investments, paying vendors directly for rent, tech, and transit. 100% transparency."
         schema={{
           "@type": "SpeakableSpecification",
           "xpath": ["/html/body/main/section[1]/div[2]/div[1]/div[1]/h1"],
           "name": "SecondWind Hero Statement"
         }}
      />
      
      {/* Background Blobs - GPU Accelerated & Optimized */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)` }}
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand-teal opacity-10 rounded-full filter blur-[80px] md:blur-[100px] animate-blob mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-brand-coral opacity-10 rounded-full filter blur-[80px] md:blur-[100px] animate-blob mix-blend-multiply" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-[30%] left-[50%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-brand-yellow opacity-10 rounded-full filter blur-[60px] md:blur-[80px] animate-blob mix-blend-multiply" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Main Content Grid 
          - Mobile: pt-36 ensures content starts BELOW the fixed header logos. 
          - Desktop: pt-0 because flex-col justify-center handles vertical alignment perfectly.
      */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-36 md:pt-0 pb-24 md:pb-0 h-full">
         
         {/* Left Side: Massive Typographic Statement */}
         <div className="lg:col-span-8 relative flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Parallax Layer 2: Typography (Medium Speed) */}
            <div 
              className="relative z-20 transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
            >
              <h1 className="font-display font-bold leading-[0.85] md:leading-[0.9] tracking-tighter text-brand-navy select-none pointer-events-none" aria-label="Get back up.">
                {/* 
                   Responsive Text Sizing Logic:
                   - Mobile: 16vw ensures it fits width but remains huge.
                   - Tablet (sm): 14vw.
                   - Desktop (lg): Fixed rem sizes for consistency.
                */}
                <span className="block text-[16vw] sm:text-[14vw] lg:text-[10rem] xl:text-[11rem] opacity-0 animate-slide-up min-h-[1em]" style={{ animationDelay: '0.1s' }} aria-hidden="true">
                  GET
                </span>
                <span className="block text-[16vw] sm:text-[14vw] lg:text-[10rem] xl:text-[11rem] opacity-0 animate-slide-up text-stroke-navy relative min-h-[1em]" style={{ animationDelay: '0.2s' }} aria-hidden="true">
                   BACK
                   <span className="absolute top-1 left-1 md:top-3 md:left-3 text-brand-coral opacity-20 blur-sm pointer-events-none -z-10">BACK</span>
                </span>
                <span className="block text-[16vw] sm:text-[14vw] lg:text-[10rem] xl:text-[11rem] opacity-0 animate-slide-up text-brand-navy min-h-[1em]" style={{ animationDelay: '0.3s' }} aria-hidden="true">
                  UP<span className="text-brand-coral inline-block animate-pulse text-[1.2em] leading-none">.</span>
                </span>
              </h1>
            </div>

            {/* Floating Mascot - Responsive Positioning */}
            <div 
               className="
                 absolute 
                 z-10
                 top-[-20px] right-[-10px] 
                 sm:top-[0px] sm:right-[10%]
                 md:top-[5%] md:right-[5%] 
                 lg:right-[0%] lg:top-[5%]
                 w-24 h-24 sm:w-32 sm:h-32 md:w-64 md:h-64 lg:w-80 lg:h-80 
                 opacity-0 animate-slide-up pointer-events-none
               " 
               style={{ 
                 animationDelay: '0.6s',
                 transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) rotate(${mousePos.x * 5}deg)`
               }}
               aria-hidden="true"
            >
                <div className="w-full h-full aspect-square">
                    <Mascot 
                      expression="excited" 
                      className="w-full h-full drop-shadow-2xl opacity-90" 
                      lookAt={mousePos} 
                    />
                </div>
            </div>
         </div>

         {/* Right Side: The "Card" - Interactive Glass Panel */}
         <div className="lg:col-span-4 perspective-1000 w-full max-w-md lg:max-w-none mx-auto mt-8 lg:mt-32 relative z-30">
            <article 
              className={`
                relative p-6 md:p-8 rounded-[2rem] transition-all duration-500 ease-out transform 
                ${isHoveringCard ? 'scale-105 shadow-[0_25px_50px_-12px_rgba(255,255,255,0.5)]' : 'scale-100 shadow-2xl'} 
                opacity-0 animate-slide-up will-change-transform
                bg-white/60 backdrop-blur-2xl border border-white/80
              `}
              style={{ 
                animationDelay: '0.8s',
                transform: `
                  translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)
                  rotateX(${mousePos.y * -2}deg)
                  rotateY(${mousePos.x * 2}deg)
                `
              }}
              onMouseEnter={() => setIsHoveringCard(true)}
              onMouseLeave={() => setIsHoveringCard(false)}
            >
               <div className="absolute inset-0 bg-white/20 rounded-[2rem] pointer-events-none"></div>

               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4 md:mb-6">
                   <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center shrink-0 shadow-lg">
                      <Wind size={20} className="animate-pulse-fast" />
                   </div>
                   <h2 className="font-bold text-xl md:text-2xl text-brand-navy font-display leading-none">Zero Red Tape.</h2>
                 </div>
                 
                 <p className="text-base md:text-lg text-brand-navy/80 leading-relaxed mb-6 md:mb-8 font-medium">
                   We replaced the bureaucracy with a bridge. Direct funding for rent, tech, and transit. No black holes.
                 </p>
                 
                 <div className="flex flex-col gap-3">
                   <button 
                     onClick={() => onNavigate('donate')}
                     aria-label="Give Support - Navigate to donation section"
                     className="w-full bg-brand-navy text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-teal transition-all flex items-center justify-between group shadow-lg active:scale-95 relative overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                     <span className="relative z-10">Give Support</span>
                     <div className="relative z-10 bg-white/20 p-1.5 rounded-full group-hover:scale-125 transition-transform">
                        <HeartHandshake size={18} />
                     </div>
                   </button>
                   <button 
                     onClick={() => onNavigate('apply')}
                     aria-label="Get Support - Navigate to application section"
                     className="w-full bg-transparent border-2 border-brand-navy/10 text-brand-navy px-6 py-4 rounded-xl font-bold hover:bg-white/50 transition-colors flex items-center justify-between group active:scale-95"
                   >
                     <span>Get Support</span>
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                 </div>
               </div>
            </article>
         </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-0 animate-slide-up pointer-events-none" 
        style={{ animationDelay: '1.2s' }}
        aria-hidden="true"
      >
         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/40">Our Mission</span>
         <div className="w-[1px] h-12 bg-brand-navy/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-brand-navy/40 animate-slide-up" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }}></div>
         </div>
      </div>

    </section>
  );
};
