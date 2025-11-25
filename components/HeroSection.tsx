import React, { useEffect, useRef } from 'react';
import { HeartHandshake, ArrowRight, Wind } from 'lucide-react';
import { Mascot } from './Mascot';
import { SEOHead } from './SEOHead';
import { useStore } from '../context/StoreContext';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { isCalmMode } = useStore();
  // Use a Ref for the container to update CSS variables directly, bypassing React Render Cycle
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Disable on mobile/Calm Mode for performance
    if (isCalmMode || window.matchMedia("(max-width: 768px)").matches) return;

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
           const x = (e.clientX / window.innerWidth) * 2 - 1;
           const y = (e.clientY / window.innerHeight) * 2 - 1;
           // Directly update CSS Variables on the DOM node
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
      className="relative min-h-[90vh] md:min-h-screen w-full flex flex-col justify-center overflow-hidden"
      aria-label="Introduction"
    >
      <SEOHead 
         title="SecondWind | Invest in Human Potential" 
         description="A direct-action recovery resource platform. We treat donations like investments, paying vendors directly for rent, tech, and transit. 100% transparency."
         schema={{
           "@type": "SpeakableSpecification",
           "xpath": ["/html/body/main/section[1]/div[2]/div[2]/article/div[2]/p"],
           "cssSelector": ["#hero-description"],
           "name": "SecondWind Mission Statement"
         }}
      />
      
      {/* Background Blobs - Driven by CSS Vars */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translate(calc(var(--mouse-x, 0) * -10px), calc(var(--mouse-y, 0) * -10px))` }}
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand-teal opacity-10 rounded-full filter blur-[80px] md:blur-[100px] animate-blob mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-brand-coral opacity-10 rounded-full filter blur-[80px] md:blur-[100px] animate-blob mix-blend-multiply" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-[30%] left-[50%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-brand-yellow opacity-10 rounded-full filter blur-[60px] md:blur-[80px] animate-blob mix-blend-multiply" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-24 pb-12 md:py-0">
         
         {/* Left Side: Typography */}
         <div className="lg:col-span-8 relative flex flex-col items-center lg:items-start text-center lg:text-left z-20">
            
            {/* Parallax Layer: Typography */}
            <div 
              className="relative z-20 transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `translate(calc(var(--mouse-x, 0) * -20px), calc(var(--mouse-y, 0) * -20px))` }}
            >
              <h1 className="font-display font-bold leading-[0.85] md:leading-[0.85] tracking-tighter text-brand-navy select-none pointer-events-none" aria-label="Get back up.">
                {/* Clamp font size: Min 14vw, Ideal 16vw, Max 11rem (approx 176px) */}
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

            {/* Floating Mascot - Driven by CSS Vars */}
            <div 
               className="
                 absolute 
                 z-10
                 top-[-30px] right-[-10px] 
                 sm:top-[-20px] sm:right-[10%]
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
         <div className="lg:col-span-4 perspective-1000 w-full max-w-md lg:max-w-none mx-auto mt-0 lg:mt-32 relative z-30">
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
                     aria-label="Give Support - Navigate to donation section"
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
                     aria-label="Get Support - Navigate to application section"
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

      {/* Scroll Indicator */}
      <div 
        className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-0 animate-slide-up pointer-events-none mix-blend-multiply" 
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