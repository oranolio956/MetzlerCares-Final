import React from 'react';
import { HeartHandshake, ChevronDown, Activity, Building2, ShieldCheck, Clock, Star } from 'lucide-react';
import { SEOHead } from './SEOHead';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

const AnimatedCounter = ({ end, prefix = '$' }: { end: number; prefix?: string }) => {
  return <span className="font-mono font-bold">{prefix}{end.toLocaleString()}</span>;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
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
           "mainEntityOfPage": "https://metzlercares.com",
           "description": "Providing direct financial aid for sober living and addiction recovery in Colorado."
         }}
      />
      <section
        className="relative w-full overflow-hidden flex flex-col justify-center bg-white/80"
        aria-label="Introduction"
      >
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-28 pb-16 lg:py-24">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                   <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-semibold">
                     Colorado recovery, run by humans
                   </div>
                   <h1 className="font-display font-bold text-[clamp(2.5rem,7vw,4.5rem)] text-brand-navy leading-tight">
                      We move funds to people staying sober in Colorado.
                   </h1>
                   <p className="text-lg text-brand-navy/70 leading-relaxed">
                      No gimmicks, no neon gradients—just a team of neighbors paying verified vendors directly for housing, rides, and recovery tech. We answer every request with a person on the other end.
                   </p>
                   <div className="flex flex-col sm:flex-row gap-3">
                      <button
                         onClick={() => onNavigate('apply')}
                         className="flex-1 bg-brand-navy text-white py-4 px-6 rounded-xl font-bold hover:bg-brand-teal transition-colors"
                      >
                         Apply for support
                      </button>
                      <button
                         onClick={() => onNavigate('donate')}
                         className="flex-1 bg-white border border-brand-navy/10 text-brand-navy py-4 px-6 rounded-xl font-bold hover:border-brand-navy/30 transition-colors"
                      >
                         Donate now
                      </button>
                   </div>
                   <div className="flex items-center gap-4 text-sm text-brand-navy/60">
                      <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand-teal" /> Transparent ledger</div>
                      <div className="flex items-center gap-2"><Clock size={16} className="text-brand-teal" /> Real humans reply fast</div>
                   </div>
               </div>

               <div className="bg-brand-cream border border-brand-navy/10 rounded-3xl p-8 shadow-sm space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-brand-navy/60">This month so far</p>
                      <p className="text-3xl font-display font-bold text-brand-navy mt-1"><AnimatedCounter end={184200} /></p>
                      <p className="text-sm text-brand-navy/60">in direct payments to vendors</p>
                    </div>
                    <div className="p-3 rounded-full bg-brand-teal/15 text-brand-teal"><HeartHandshake size={20} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-white border border-brand-navy/10">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                           <Activity size={16} className="text-brand-teal" /> Requests answered
                        </div>
                        <p className="text-2xl font-display font-bold text-brand-navy mt-2">527</p>
                        <p className="text-sm text-brand-navy/60">We reply in under a day.</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white border border-brand-navy/10">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                           <Building2 size={16} className="text-brand-teal" /> Partners paid directly
                        </div>
                        <p className="text-2xl font-display font-bold text-brand-navy mt-2">22 vendors</p>
                        <p className="text-sm text-brand-navy/60">Housing, transit, and tech.</p>
                     </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-1 p-4 rounded-2xl bg-white border border-brand-navy/10">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                           <Star size={16} className="text-brand-teal" /> Community reviews
                        </div>
                        <p className="text-sm text-brand-navy/70 mt-2 leading-relaxed">
                           "They called me back the same afternoon and paid my rent on time." — Jamie, Denver
                        </p>
                     </div>
                     <div className="flex-1 p-4 rounded-2xl bg-white border border-brand-navy/10">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                           <HeartHandshake size={16} className="text-brand-teal" /> Peer coaching
                        </div>
                        <p className="text-sm text-brand-navy/70 mt-2 leading-relaxed">
                           Matched with a certified peer within 24 hours, with weekly check-ins led by people in long-term recovery.
                        </p>
                     </div>
                  </div>
               </div>
           </div>

           <div className="mt-14 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm text-brand-navy/60">
              <div className="flex items-center gap-2"><ChevronDown size={16} /> Scroll to see how the fund works.</div>
              <div className="hidden md:block h-[1px] w-full bg-brand-navy/10" />
           </div>

        </div>
      </section>
    </div>
  );
};
