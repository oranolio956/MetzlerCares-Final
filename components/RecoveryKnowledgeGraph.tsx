
import React, { useState } from 'react';
import { BookOpen, Shield, HeartPulse, Activity, Zap, ChevronRight, Lightbulb, GraduationCap, ArrowRight } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface Term {
  id: string;
  term: string;
  acronym?: string;
  definition: string;
  category: 'clinical' | 'housing' | 'financial';
  icon: React.ElementType;
  whyItMatters: string;
  color: string;
}

const TERMS: Term[] = [
  {
    id: 'carr',
    term: 'CARR Certified',
    acronym: 'CARR',
    definition: 'Colorado Association of Recovery Residences. The gold standard for safety and ethics in sober living homes. SecondWind prioritizes funding for CARR-verified facilities.',
    category: 'housing',
    icon: Shield,
    whyItMatters: "Ensures you aren't moving into a 'flop house'. CARR homes have strict safety audits and can't kick you out without cause.",
    color: 'text-brand-teal'
  },
  {
    id: 'mat',
    term: 'Medication Assisted Treatment',
    acronym: 'MAT',
    definition: 'The use of FDA-approved medications (Suboxone, Methadone, Vivitrol) in combination with counseling. We strictly fund MAT-friendly housing.',
    category: 'clinical',
    icon: HeartPulse,
    whyItMatters: "Many old-school sober livings ban MAT. We only pay vendors who respect medical recovery science.",
    color: 'text-brand-coral'
  },
  {
    id: 'iop',
    term: 'Intensive Outpatient',
    acronym: 'IOP',
    definition: 'A treatment structure where patients attend therapy for 3-4 hours a day while living at home or in sober living. A key step after detox.',
    category: 'clinical',
    icon: Activity,
    whyItMatters: "IOP allows you to work while getting treatment. It provides the stability needed for finding a sponsor in Boulder or Denver before full independence.",
    color: 'text-brand-navy'
  },
  {
    id: 'medicaid',
    term: 'Health First Colorado',
    acronym: 'Medicaid',
    definition: 'State-funded health insurance. In Colorado, this provides comprehensive Colorado Medicaid rehab coverage for residential treatment, detox, and Peer Coaching at zero cost.',
    category: 'financial',
    icon: Zap,
    whyItMatters: "If you have this, you have a 'budget'. It unlocks Peer Coaching which we can activate immediately.",
    color: 'text-brand-yellow'
  },
  {
    id: 'peer-coach',
    term: 'Peer Recovery Coach',
    acronym: 'CPRS',
    definition: 'A trained professional with lived experience in addiction. They help navigate systems, find jobs, and provide mentorship. Covered by Medicaid.',
    category: 'clinical',
    icon: GraduationCap,
    whyItMatters: "A professional ally who knows the system. They connect you to vocational training for recovering addicts and can approve expenses that SecondWind can't.",
    color: 'text-brand-lavender'
  },
  {
    id: 'oxford',
    term: 'Oxford House',
    acronym: 'OH',
    definition: 'A democratically run, self-supporting drug-free home. Residents elect officers to enforce Denver sober living requirements like curfews and chores.',
    category: 'housing',
    icon: BookOpen,
    whyItMatters: "The most affordable and autonomous option. Great for people who want independence but need a safety net.",
    color: 'text-brand-teal'
  }
];

export const RecoveryKnowledgeGraph: React.FC = () => {
  const [activeId, setActiveId] = useState<string>(TERMS[0].id);
  const { playHover, playClick } = useSound();
  const activeTerm = TERMS.find(t => t.id === activeId) || TERMS[0];

  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Colorado Recovery Glossary",
    "description": "Definitions of key addiction recovery terms used in Colorado's behavioral health system, covering Medicaid coverage, housing requirements, and vocational resources.",
    "hasDefinedTerm": TERMS.map(t => ({
      "@type": "DefinedTerm",
      "name": t.term,
      "termCode": t.acronym || t.term,
      "description": t.definition,
      "inDefinedTermSet": "https://metzlercares.com/glossary"
    }))
  };

  return (
    <section className="w-full bg-[#FDFBF7] py-20 relative overflow-hidden border-t border-brand-navy/5" aria-labelledby="knowledge-graph-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      {/* Soft Background Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="mb-12 text-center md:text-left">
           <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 mb-2 block">Educational Resource</span>
           <h2 id="knowledge-graph-title" className="font-display font-bold text-3xl md:text-5xl text-brand-navy mb-4">
              The Recovery Dictionary.
           </h2>
           <p className="text-brand-navy/60 text-lg max-w-2xl leading-relaxed">
              The system is intentionally complex. We decode the terminology so you can navigate your recovery with confidence.
           </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
           
           {/* LEFT COLUMN: NAVIGATION LIST */}
           <div className="lg:w-1/3 flex flex-col gap-2 w-full">
              {TERMS.map((term) => {
                  const isActive = activeId === term.id;
                  const Icon = term.icon;
                  return (
                    <button
                        key={term.id}
                        onClick={() => { setActiveId(term.id); playClick(); }}
                        onMouseEnter={playHover}
                        className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left w-full ${isActive ? 'bg-white shadow-lg border-2 border-brand-teal scale-[1.02] z-10' : 'bg-transparent border-2 border-transparent hover:bg-white/50 hover:border-brand-navy/5'}`}
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-navy/5 text-brand-navy/40 group-hover:text-brand-navy group-hover:bg-brand-navy/10'}`}>
                            <Icon size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <span className={`font-bold text-sm md:text-base block truncate ${isActive ? 'text-brand-navy' : 'text-brand-navy/60 group-hover:text-brand-navy'}`}>
                                {term.term}
                            </span>
                        </div>

                        {isActive && <ChevronRight size={16} className="text-brand-teal animate-slide-right" />}
                    </button>
                  );
              })}
           </div>

           {/* RIGHT COLUMN: DETAIL CARD */}
           <div className="lg:w-2/3 w-full">
               <div className="sticky top-32">
                   <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-brand-navy/5 overflow-hidden min-h-[400px] flex flex-col transition-all duration-500">
                        
                        {/* Dynamic Background Icon */}
                        <div className={`absolute -right-12 -bottom-12 opacity-5 pointer-events-none transition-transform duration-700 ${activeTerm.color}`}>
                            {React.createElement(activeTerm.icon, { size: 350 })}
                        </div>

                        {/* Card Header */}
                        <div className="mb-8 relative z-10 animate-slide-up">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-navy/5 text-brand-navy/60 text-xs font-bold uppercase tracking-wider`}>
                                    {activeTerm.category}
                                </div>
                                {activeTerm.acronym && (
                                    <span className="font-display font-bold text-4xl text-brand-navy/10 select-none">
                                        {activeTerm.acronym}
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="font-display font-bold text-3xl md:text-5xl text-brand-navy mb-6 leading-tight">
                                {activeTerm.term}
                            </h3>

                            <div className="prose prose-lg text-brand-navy/80 leading-relaxed mb-8">
                                <p>{activeTerm.definition}</p>
                            </div>
                        </div>

                        {/* "The Advantage" Box */}
                        <div className="mt-auto bg-brand-cream rounded-2xl p-6 border-l-4 border-brand-teal relative z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-start gap-4">
                                <div className="bg-brand-teal w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md text-white mt-1">
                                    <Lightbulb size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-navy text-sm uppercase tracking-widest mb-1">Why it matters</h4>
                                    <p className="text-brand-navy/70 italic text-lg font-medium">
                                        "{activeTerm.whyItMatters}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-8 pt-6 border-t border-brand-navy/5 flex justify-end relative z-10">
                            <a href="#apply" className="flex items-center gap-2 text-sm font-bold text-brand-teal hover:text-brand-navy transition-colors group">
                                Apply for this resource <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>

                   </div>
               </div>
           </div>

        </div>
      </div>
    </section>
  );
};
