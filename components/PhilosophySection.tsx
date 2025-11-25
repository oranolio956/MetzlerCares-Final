import React, { useState, useRef, useEffect } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { Mascot } from './Mascot';
import { useStore } from '../context/StoreContext';
import { 
  ArrowRight, ShieldCheck, Target, HelpCircle, Ban, Lock, Search, FileText, AlertTriangle, XCircle, CheckCircle2, Eye, Fingerprint
} from 'lucide-react';

interface PhilosophySectionProps {
  onNavigate: (section: string) => void;
}

export const PhilosophySection: React.FC<PhilosophySectionProps> = ({ onNavigate }) => {
  const { isCalmMode } = useStore();
  const [viewMode, setViewMode] = useState<'broken' | 'fixed'>('broken');
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is traditional charity broken?",
        "acceptedAnswer": { "@type": "Answer", "text": "Traditional non-profits pool money into general funds with high overhead, red tape, and low transparency. You assume it helps, but you never see the receipt." }
      },
      {
        "@type": "Question",
        "name": "How does SecondWind's direct-to-vendor model work?",
        "acceptedAnswer": { "@type": "Answer", "text": "We don't give cash. We pay specific invoices for rent, laptops, or transit directly to the vendor (e.g., Landlord, Best Buy). This ensures zero fraud and 100% impact." }
      },
      {
        "@type": "Question",
        "name": "Is SecondWind secure and transparent?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. We use bank-grade security and publish a real-time public ledger of all transactions. You can audit every cent from donation to final payment." }
      }
    ]
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (textRef.current) observer.observe(textRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isCalmMode || !containerRef.current || window.innerWidth < 768) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    containerRef.current.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) scale3d(1.005, 1.005, 1.005)`;
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
    setIsHovering(false);
  };

  const isBrokenHidden = viewMode === 'fixed';
  const isFixedHidden = viewMode === 'broken';

  return (
    <div className={`transition-colors duration-1000 ease-in-out ${viewMode === 'broken' ? 'bg-[#F4F4F5]' : 'bg-[#F0FDF9]'} w-full overflow-hidden`}>
      <SectionWrapper 
        id="philosophy" 
        title="Philosophy | SecondWind" 
        description="Charity is broken. We fixed the incentives with direct-to-vendor payments and micro-impact tracking."
        className="overflow-visible" 
        schema={faqSchema}
      >
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 md:px-0">
          
          <div className="text-center mb-8 md:mb-12 relative z-10 w-full max-w-4xl">
            <div className="inline-block relative">
              <h2 ref={textRef} className="font-display text-3xl md:text-7xl font-bold text-brand-navy leading-tight opacity-30 select-none blur-[1px]">Charity is broken.</h2>
              <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none" aria-hidden="true">
                  <path d="M-20,30 Q150,5 300,25 T620,15" fill="none" stroke="#FF8A75" strokeWidth="6" strokeLinecap="round" className={(!isCalmMode && isVisible) ? "animate-draw" : "opacity-0"} style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animation: (!isCalmMode && isVisible) ? 'draw 1.5s ease-out forwards 0.2s' : 'none' }} />
              </svg>
            </div>
            <h2 className="font-display text-[clamp(2.5rem,8vw,6rem)] font-bold text-brand-navy leading-[0.9] mt-2 relative drop-shadow-sm">
              We fixed the <span className="relative inline-block text-brand-teal whitespace-nowrap">
                  incentives
                  <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-2 md:h-4 text-brand-yellow" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
              </span>.
            </h2>
          </div>

          <div 
            className="bg-white p-2 rounded-full mb-8 md:mb-12 flex relative z-20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-brand-navy/10 w-full max-w-xs md:max-w-sm mx-auto select-none"
            role="radiogroup"
            aria-label="View Mode"
          >
            <div 
              className={`absolute top-2 bottom-2 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-0`}
              style={{ left: viewMode === 'broken' ? '0.5rem' : '50%', width: 'calc(50% - 0.5rem)', backgroundColor: viewMode === 'broken' ? '#FF8A75' : '#2D9C8E' }}
            />
            <button 
              role="radio" aria-checked={viewMode === 'broken'} onClick={() => setViewMode('broken')}
              className={`flex-1 py-3 rounded-full font-bold text-xs md:text-base transition-colors duration-300 relative z-10 flex items-center justify-center gap-2 ${viewMode === 'broken' ? 'text-brand-navy' : 'text-brand-navy/50 hover:text-brand-navy/80'}`}
            >
              <AlertTriangle size={16} className={viewMode === 'broken' ? "text-brand-navy" : "text-brand-coral"} /> The Old Way
            </button>
            <button 
              role="radio" aria-checked={viewMode === 'fixed'} onClick={() => setViewMode('fixed')}
              className={`flex-1 py-3 rounded-full font-bold text-xs md:text-base transition-colors duration-300 relative z-10 flex items-center justify-center gap-2 ${viewMode === 'fixed' ? 'text-white' : 'text-brand-navy/50 hover:text-brand-navy/80'}`}
            >
              <ShieldCheck size={16} className={viewMode === 'fixed' ? "text-white" : "text-brand-teal"} /> New Way
            </button>
          </div>

          {/* 
            CARD CONTAINER
            Mobile: min-height auto to prevent clipping
            Desktop: fixed min-height for stable 3D transform
          */}
          <div 
            className="w-full max-w-5xl min-h-auto md:min-h-[600px] relative [perspective:2000px] group mb-8"
            onMouseEnter={() => setIsHovering(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div ref={containerRef} className="w-full h-full relative transition-transform duration-200 ease-out [transform-style:preserve-3d]">

              {/* SIDE A: BROKEN (The Old Way) */}
              <article 
                aria-hidden={isBrokenHidden}
                className={`
                  relative md:absolute inset-0 w-full h-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-2 border-brand-navy/5 shadow-2xl 
                  transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] [backface-visibility:hidden]
                  bg-[#EAEBED]
                  ${viewMode === 'broken' ? 'opacity-100 z-20 pointer-events-auto block' : 'opacity-0 z-10 pointer-events-none hidden md:block'}
                `}
                style={{ transform: (typeof window !== 'undefined' && window.innerWidth >= 768 && !isCalmMode) ? (viewMode === 'broken' ? 'rotateX(0deg)' : 'rotateX(180deg)') : 'none' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-[#D1D5DB]/30 to-[#9CA3AF]/30"></div>
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    {[{ text: 'Admin Fees', top: '10%', left: '10%', delay: '0s' }, { text: 'Red Tape', top: '20%', left: '80%', delay: '1s' }, { text: 'Overhead?', top: '70%', left: '15%', delay: '2s' }].map((item, i) => (
                      <div key={i} className="absolute bg-white/50 px-3 py-1 rounded border border-brand-navy/5 text-brand-navy/40 font-bold text-xs md:text-sm uppercase tracking-widest animate-float backdrop-blur-sm" style={{ top: item.top, left: item.left, animationDuration: `${Math.random() * 5 + 6}s`, animationDelay: item.delay }}>
                        <XCircle size={12} className="inline mr-1 mb-0.5 text-brand-coral" /> {item.text}
                      </div>
                    ))}
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8 md:p-12 overflow-y-auto min-h-[500px] md:min-h-0">
                    <div className="w-24 h-24 md:w-40 md:h-40 bg-brand-navy rounded-3xl flex items-center justify-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] mb-8 relative transform -rotate-3 transition-transform hover:rotate-0 duration-500 group-hover:scale-105 shrink-0">
                      <HelpCircle size={64} className="text-white/20" />
                      <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter animate-pulse">???</span></div>
                      <div className="absolute -right-8 -bottom-4 md:-right-12 md:-bottom-6 w-24 h-24 md:w-32 md:h-32 animate-wiggle origin-bottom" style={{ animationDuration: '4s' }}><Mascot expression="confused" /></div>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-display font-bold text-brand-navy mb-4">The Black Box</h3>
                    <p className="max-w-lg text-brand-navy/60 text-base md:text-xl font-medium leading-relaxed mb-8">Traditional non-profits pool your money into a general fund. You assume it helps. <span className="text-brand-coral font-bold bg-brand-coral/10 px-1 rounded whitespace-nowrap">But you never see the receipt.</span></p>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                      {['Unknown Impact', 'Slow Speed', 'High Overhead'].map((text, i) => (
                        <div key={i} className="bg-white/80 px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-sm border border-brand-navy/5 text-brand-navy/60 font-bold text-xs md:text-sm flex items-center gap-2"><Ban size={14} className="text-brand-coral" />{text}</div>
                      ))}
                    </div>
                </div>
              </article>

              {/* SIDE B: FIXED (New Way) */}
              <article 
                aria-hidden={isFixedHidden}
                className={`
                  relative md:absolute inset-0 w-full h-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-white border-4 border-brand-teal shadow-[0_25px_50px_-12px_rgba(45,156,142,0.25)] 
                  transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] [backface-visibility:hidden]
                  ${viewMode === 'fixed' ? 'opacity-100 z-20 pointer-events-auto block' : 'opacity-0 z-10 pointer-events-none hidden md:block'}
                `}
                style={{ transform: (typeof window !== 'undefined' && window.innerWidth >= 768 && !isCalmMode) ? (viewMode === 'fixed' ? 'rotateX(0deg)' : 'rotateX(-180deg)') : 'none' }}
              >
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#2D9C8E 1px, transparent 1px), linear-gradient(90deg, #2D9C8E 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                {viewMode === 'fixed' && !isCalmMode && (<div className="absolute top-0 left-0 w-full h-[2px] bg-brand-teal shadow-[0_0_40px_rgba(45,156,142,1)] animate-scan z-0 pointer-events-none"></div>)}

                <div className="relative z-10 h-full flex flex-col md:flex-row p-8 md:p-12 gap-8 md:gap-12 items-center overflow-y-auto md:overflow-hidden min-h-[500px] md:min-h-0">
                    <div className="flex-1 text-center md:text-left pt-0 md:pt-0">
                      <div className="inline-flex items-center gap-2 bg-brand-teal/10 text-brand-teal px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-brand-teal/20">
                          <div className="w-2 h-2 bg-brand-teal rounded-full animate-pulse"></div> Direct-to-Vendor Model
                      </div>
                      <h3 className="text-2xl md:text-5xl font-display font-bold text-brand-navy mb-6 leading-tight">We don't give cash. <br className="hidden md:block"/><span className="text-brand-teal bg-brand-teal/5 px-2 rounded-lg">We pay bills.</span></h3>
                      <p className="text-brand-navy/70 text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto md:mx-0">Donations fund specific invoices (Rent, Laptops, Bus Passes). Money goes directly to the Landlord or vendor.<span className="block mt-4 font-bold text-brand-navy flex items-center justify-center md:justify-start gap-2"><CheckCircle2 size={18} className="text-brand-teal" /> Zero fraud. 100% impact.</span></p>
                      <button onClick={() => onNavigate('donate')} className="bg-brand-navy text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-teal hover:scale-105 transition-all shadow-[0_10px_20px_-5px_rgba(26,42,58,0.3)] flex items-center justify-center md:justify-start gap-3 w-full md:w-auto group relative overflow-hidden min-h-[50px]">
                        <span className="relative z-10 flex items-center gap-2"><Target size={20} /> See The Portfolio <ArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
                      </button>
                    </div>

                    <div className="flex-1 w-full min-h-[250px] md:min-h-[300px] h-full relative flex items-center justify-center perspective-500 pb-12 md:pb-0" aria-hidden="true">
                      <div className="absolute -top-6 -right-6 md:-top-12 md:-right-0 z-50 animate-bounce" style={{ animationDuration: '3s' }}>
                          <div className="relative"><Mascot expression="celebration" className="w-24 h-24 md:w-32 md:h-32 drop-shadow-xl" /><div className="absolute -bottom-2 right-0 bg-white px-3 py-1 rounded-full text-[10px] font-bold text-brand-navy border border-brand-navy/10 shadow-sm whitespace-nowrap flex items-center gap-1"><CheckCircle2 size={10} className="text-brand-teal" /> Verified!</div></div>
                      </div>
                      <div className="absolute w-56 md:w-72 bg-white p-5 rounded-2xl border border-brand-navy/10 shadow-lg transform transition-all duration-500 hover:scale-105 hover:z-40 z-30 -rotate-6 -translate-x-2 md:-translate-x-8 hover:rotate-0 top-10 md:top-auto"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-brand-coral/10 rounded-lg text-brand-coral"><Lock size={18} /></div><h4 className="font-bold text-brand-navy text-sm">Fraud Proof</h4></div><p className="text-[11px] text-brand-navy/60 font-medium leading-tight">Funds never touch personal bank accounts. Only verified business vendors are paid.</p></div>
                      <div className="absolute w-56 md:w-72 bg-white p-5 rounded-2xl border border-brand-navy/10 shadow-lg transform transition-all duration-500 hover:scale-105 hover:z-40 z-20 rotate-3 translate-x-1 md:translate-x-4 translate-y-8 md:translate-y-4 hover:rotate-0 top-16 md:top-auto"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-brand-teal/10 rounded-lg text-brand-teal"><Search size={18} /></div><h4 className="font-bold text-brand-navy text-sm">Open Ledger</h4></div><p className="text-[11px] text-brand-navy/60 font-medium leading-tight">Every transaction is published to our public database in real-time. Anyone can audit.</p></div>
                    </div>
                </div>
              </article>
            </div>
          </div>
          
          <div className="mt-8 md:mt-16 flex flex-col md:flex-row items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/50">Trusted By</span>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 filter grayscale mix-blend-multiply items-center">
                <span className="font-display font-bold text-brand-navy text-base md:text-xl flex items-center gap-2"><Lock size={20} className="text-brand-teal" /> Bank-Grade Security</span>
                <span className="font-display font-bold text-brand-navy text-base md:text-xl flex items-center gap-2"><Fingerprint size={20} className="text-brand-coral" /> Verified Identity</span>
            </div>
          </div>
        </div>
        <style>{`@keyframes draw { to { stroke-dashoffset: 0; } } @keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } } .animate-draw { stroke-dasharray: 1000; stroke-dashoffset: 1000; } .animate-scan { animation: scan 3s linear infinite; }`}</style>
      </SectionWrapper>
    </div>
  );
};