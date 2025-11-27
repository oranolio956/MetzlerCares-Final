
import React, { useState } from 'react';
import { BookOpen, Search, X, Zap, Shield, HeartPulse, Activity, ChevronRight } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface Term {
  id: string;
  term: string;
  acronym?: string;
  definition: string;
  category: 'clinical' | 'housing' | 'financial';
  icon: React.ElementType;
}

const TERMS: Term[] = [
  {
    id: 'carr',
    term: 'CARR Certified',
    acronym: 'CARR',
    definition: 'Colorado Association of Recovery Residences. The gold standard for safety and ethics in sober living homes. SecondWind prioritizes funding for CARR-verified facilities.',
    category: 'housing',
    icon: Shield
  },
  {
    id: 'mat',
    term: 'Medication Assisted Treatment',
    acronym: 'MAT',
    definition: 'The use of FDA-approved medications (Suboxone, Methadone, Vivitrol) in combination with counseling. We strictly fund MAT-friendly housing.',
    category: 'clinical',
    icon: HeartPulse
  },
  {
    id: 'iop',
    term: 'Intensive Outpatient Program',
    acronym: 'IOP',
    definition: 'A treatment structure where patients attend therapy for 3-4 hours a day while living at home or in sober living. A key step after detox.',
    category: 'clinical',
    icon: Activity
  },
  {
    id: 'medicaid',
    term: 'Health First Colorado',
    acronym: 'Medicaid',
    definition: 'State-funded health insurance. In Colorado, this covers Peer Coaching, mental health, and substance use treatment at zero cost to the member.',
    category: 'financial',
    icon: Zap
  },
  {
    id: 'peer-coach',
    term: 'Peer Recovery Coach',
    acronym: 'CPRS',
    definition: 'A trained professional with lived experience in addiction. They help navigate systems, find jobs, and provide mentorship. Covered by Medicaid.',
    category: 'clinical',
    icon: BookOpen
  },
  {
    id: 'oxford',
    term: 'Oxford House',
    acronym: 'OH',
    definition: 'A democratically run, self-supporting drug-free home. There are no staff; residents elect officers to manage the house. SecondWind pays entry deposits here.',
    category: 'housing',
    icon: Activity
  }
];

export const RecoveryKnowledgeGraph: React.FC = () => {
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const { playClick } = useSound();

  // Schema.org Injection for Knowledge Graph
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Colorado Recovery Glossary",
    "description": "Definitions of key addiction recovery terms used in Colorado's behavioral health system.",
    "hasDefinedTerm": TERMS.map(t => ({
      "@type": "DefinedTerm",
      "name": t.term,
      "termCode": t.acronym || t.term,
      "description": t.definition,
      "inDefinedTermSet": "https://secondwind.org/glossary"
    }))
  };

  return (
    <section className="w-full bg-[#FDFBF7] py-24 relative overflow-hidden" aria-labelledby="knowledge-graph-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1A2A3A 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-brand-teal font-bold uppercase tracking-widest text-xs mb-2">
                 <BookOpen size={14} /> Recovery Intelligence
              </div>
              <h2 id="knowledge-graph-title" className="font-display font-bold text-3xl md:text-5xl text-brand-navy">
                 Speak the language.
              </h2>
              <p className="text-brand-navy/60 mt-4 text-lg">
                 The recovery system is full of confusing acronyms. We decode them so you can advocate for yourself.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {TERMS.map((term) => (
             <button
               key={term.id}
               onClick={() => { setActiveTerm(term); playClick(); }}
               className="group bg-white rounded-2xl p-6 border border-brand-navy/5 hover:border-brand-teal/50 shadow-sm hover:shadow-xl transition-all text-left relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <term.icon size={80} />
                </div>
                
                <div className="flex justify-between items-start mb-4">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${term.category === 'housing' ? 'bg-brand-teal/10 text-brand-teal' : term.category === 'financial' ? 'bg-brand-yellow/10 text-brand-yellow' : 'bg-brand-coral/10 text-brand-coral'}`}>
                      <term.icon size={20} />
                   </div>
                   {term.acronym && (
                      <span className="font-mono font-bold text-xs bg-brand-navy/5 text-brand-navy/60 px-2 py-1 rounded">
                         {term.acronym}
                      </span>
                   )}
                </div>

                <h3 className="font-bold text-xl text-brand-navy mb-2 group-hover:text-brand-teal transition-colors">
                   {term.term}
                </h3>
                <p className="text-sm text-brand-navy/60 line-clamp-2">
                   {term.definition}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy/30 group-hover:text-brand-navy transition-colors">
                   Learn More <ChevronRight size={12} />
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Detail Modal */}
      {activeTerm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={() => setActiveTerm(null)}></div>
           <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 animate-in zoom-in-95 shadow-2xl">
              <button onClick={() => setActiveTerm(null)} className="absolute top-6 right-6 text-brand-navy/30 hover:text-brand-navy"><X size={24}/></button>
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${activeTerm.category === 'housing' ? 'bg-brand-teal text-white' : activeTerm.category === 'financial' ? 'bg-brand-yellow text-brand-navy' : 'bg-brand-coral text-white'}`}>
                 <activeTerm.icon size={32} />
              </div>

              <div className="flex items-center gap-3 mb-2">
                 <h3 className="font-display font-bold text-3xl text-brand-navy">{activeTerm.term}</h3>
                 {activeTerm.acronym && <span className="font-mono font-bold text-lg text-brand-navy/40">({activeTerm.acronym})</span>}
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-brand-navy/5 text-brand-navy/50 text-xs font-bold uppercase tracking-widest mb-6">
                 Category: {activeTerm.category}
              </span>

              <p className="text-lg text-brand-navy/80 leading-relaxed mb-8">
                 {activeTerm.definition}
              </p>

              <div className="bg-brand-navy/5 p-4 rounded-xl flex items-start gap-3">
                 <Search size={18} className="text-brand-teal mt-0.5 shrink-0" />
                 <p className="text-sm text-brand-navy/60">
                    <span className="font-bold text-brand-navy">Why it matters:</span> Knowing this term helps you verify if a facility is legitimate and safe for your recovery journey.
                 </p>
              </div>
           </div>
        </div>
      )}

    </section>
  );
};
