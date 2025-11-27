
import React, { useRef } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { Mascot } from './Mascot';
import { useStore } from '../context/StoreContext';
import { 
  ArrowRight, ShieldCheck, HelpCircle, Lock, Search, CheckCircle2, Fingerprint, XCircle, ArrowDown, Ban, FileWarning, ArrowBigRight, Home, Bus, Laptop, Hammer
} from 'lucide-react';

interface PhilosophySectionProps {
  onNavigate: (section: string) => void;
}

// SEO: FAQ Schema Generator for "How to get sober living funding"
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I find sober living in Denver?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SecondWind connects you with verified Oxford Houses and CARR-certified sober living homes in Denver, Aurora, and Lakewood. Use our Partner Directory to see real-time vacancies and apply for immediate rent funding."
      }
    },
    {
      "@type": "Question",
      "name": "Does SecondWind pay for rehab transport?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We fund monthly RTD bus passes and ride-share credits specifically for Colorado residents accessing detox, intensive outpatient (IOP), and recovery meetings."
      }
    },
    {
      "@type": "Question",
      "name": "What is CARR certification?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CARR (Colorado Association of Recovery Residences) certification ensures a sober living home meets strict safety, management, and ethical standards. SecondWind prioritizes funding for these verified facilities to ensure your safety."
      }
    },
    {
      "@type": "Question",
      "name": "Am I eligible for help if I have Colorado Medicaid?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. If you have active Health First Colorado (Medicaid), you automatically qualify for our Peer Recovery Coaching service. This provides dedicated support for ID retrieval, food stamps (SNAP), and job placement at no cost to you."
      }
    },
    {
      "@type": "Question",
      "name": "Is this a legitimate non-profit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. SecondWind is a 100% transparent protocol. Every donation is tracked on our public ledger and paid directly to verified vendors, not individuals."
      }
    }
  ]
};

export const PhilosophySection: React.FC<PhilosophySectionProps> = ({ onNavigate }) => {
  const { isCalmMode } = useStore();
  
  return (
    <div className="w-full overflow-hidden">
      <SectionWrapper 
        id="philosophy" 
        title="How It Works | SecondWind Colorado" 
        description="Charity is broken. We fixed the incentives with direct-to-vendor payments for Colorado sober living and rehab assistance."
        className="overflow-visible pb-0 pt-16 md:pt-24" // Adjusted PT for better flow
        schema={faqSchema}
      >
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 md:px-0">
          
          {/* Header Area */}
          <div className="text-center mb-16 relative z-10 w-full max-w-4xl">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-bold text-brand-navy leading-[0.9] tracking-tight">
              We fixed the <br/>
              <span className="relative inline-block text-brand-teal">
                  system
                  <svg className="absolute -bottom-2 left-0 w-full h-3 md:h-4 text-brand-yellow" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
              </span>.
            </h2>
            <p className="mt-8 text-brand-navy/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Most charities are "black boxes"—money goes in, but you never see the result. <br className="hidden md:block"/>
                We built a transparent engine for direct human impact in the Colorado recovery ecosystem.
            </p>
          </div>

          {/* SIDE-BY-SIDE COMPARISON (Restored) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-24 relative">
             
             {/* Center VS Badge (Desktop) */}
             <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded-full shadow-xl border-4 border-[#FDFBF7]">
                <div className="bg-brand-navy text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-sm border-2 border-brand-teal">VS</div>
             </div>

             {/* CARD 1: THE OLD WAY (Bureaucracy) */}
             <div className="relative group">
                <div className="absolute inset-0 bg-gray-200/50 transform rotate-[-2deg] rounded-[2.5rem] scale-[0.98] group-hover:rotate-[-3deg] transition-transform duration-500"></div>
                <div className="relative bg-[#EAEBED] rounded-[2.5rem] p-8 md:p-12 h-full flex flex-col items-center text-center border border-brand-navy/5 shadow-lg overflow-hidden">
                    
                    {/* Background Noise */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
                    
                    {/* Floating Badges */}
                    <div className="absolute top-10 right-10 bg-white/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-coral border border-brand-coral/20 transform rotate-12 animate-float shadow-sm">
                        <Ban size={12} className="inline mr-1" /> Admin Bloat
                    </div>
                    <div className="absolute bottom-20 left-10 bg-white/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 border border-brand-navy/10 transform -rotate-6 animate-float shadow-sm" style={{ animationDelay: '1s' }}>
                        <FileWarning size={12} className="inline mr-1" /> Lost Receipts
                    </div>

                    <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-md mb-8 transform -rotate-3 border-2 border-brand-navy/5 mt-8">
                       <Mascot expression="confused" className="w-24 h-24 grayscale opacity-80" />
                    </div>

                    <h3 className="font-display font-bold text-3xl text-brand-navy mb-4">The Black Box</h3>
                    <p className="text-brand-navy/60 text-lg leading-relaxed mb-8 max-w-sm">
                       Traditional charities swallow up to 40% of donations in "overhead". You give money, but you never know if it actually helped a human in recovery.
                    </p>

                    <div className="mt-auto w-full bg-brand-navy/5 rounded-2xl p-4 flex flex-col gap-2 opacity-70">
                        <div className="flex justify-between items-center text-sm font-bold text-brand-navy/40">
                            <span>Your Donation</span>
                            <span>$100.00</span>
                        </div>
                        <div className="h-4 w-full bg-white rounded-full overflow-hidden flex">
                            <div className="h-full bg-brand-navy/20 w-[40%]"></div>
                            <div className="h-full bg-brand-coral w-[60%]"></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-navy/30">
                            <span>Admin Fees (40%)</span>
                            <span>Impact (60%)</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* CARD 2: THE NEW WAY (Protocol) */}
             <div className="relative group">
                <div className="absolute inset-0 bg-brand-teal transform rotate-[2deg] rounded-[2.5rem] scale-[0.98] opacity-20 group-hover:rotate-[3deg] transition-transform duration-500"></div>
                <div className="relative bg-brand-navy rounded-[2.5rem] p-8 md:p-12 h-full flex flex-col items-center text-center border-4 border-brand-teal shadow-2xl overflow-hidden">
                    
                    {/* Clean Grid Background */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#2D9C8E 1px, transparent 1px), linear-gradient(90deg, #2D9C8E 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-teal/50 shadow-[0_0_20px_#2D9C8E]"></div>

                    <div className="absolute top-10 right-10 bg-brand-teal text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-teal/50 shadow-[0_0_15px_rgba(45,156,142,0.4)] animate-pulse">
                        <CheckCircle2 size={12} className="inline mr-1" /> Verified 100%
                    </div>

                    <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(45,156,142,0.3)] mb-8 border border-brand-teal/30 mt-8 relative">
                       <div className="absolute inset-0 rounded-full border border-white/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                       <Mascot expression="excited" variant="tech" className="w-24 h-24" />
                    </div>

                    <h3 className="font-display font-bold text-3xl text-white mb-4">Direct Action</h3>
                    <p className="text-brand-lavender text-lg leading-relaxed mb-8 max-w-sm">
                       We verify the need (Rent, Tools, Transit) in Denver/Boulder and pay the <span className="text-brand-teal font-bold">vendor directly</span>. 
                       Zero fraud. Zero waste. You see the receipt.
                    </p>

                    <div className="mt-auto w-full bg-white/5 rounded-2xl p-4 flex flex-col gap-2 border border-brand-teal/20">
                        <div className="flex justify-between items-center text-sm font-bold text-white">
                            <span>Your Investment</span>
                            <span>$100.00</span>
                        </div>
                        <div className="h-4 w-full bg-brand-navy rounded-full overflow-hidden flex border border-white/10 relative">
                            <div className="absolute inset-0 bg-brand-teal animate-slide-right w-full"></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-teal">
                            <span>Vendor Payment</span>
                            <span>100% Impact</span>
                        </div>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); onNavigate('donate'); }} 
                      className="mt-8 bg-brand-teal text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-brand-navy transition-all flex items-center gap-2 w-full justify-center group shadow-lg"
                    >
                       Invest Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
             </div>

          </div>

          {/* WHAT WE FUND GRID (CRITICAL FOR NEW USERS & SEO) */}
          <div className="w-full mb-24">
             <div className="flex items-center gap-4 mb-8">
                <span className="h-px bg-brand-navy/10 flex-1"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40">Concrete Assistance</span>
                <span className="h-px bg-brand-navy/10 flex-1"></span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Item 1 */}
                <div className="bg-white p-6 rounded-3xl border border-brand-navy/5 shadow-sm hover:shadow-lg transition-all group">
                   <div className="w-12 h-12 bg-brand-teal/10 rounded-xl flex items-center justify-center text-brand-teal mb-4 group-hover:scale-110 transition-transform">
                      <Home size={24} />
                   </div>
                   <h4 className="font-bold text-xl text-brand-navy mb-2">Sober Living Rent</h4>
                   <p className="text-sm text-brand-navy/60">We pay up to 2 weeks of rent directly to Oxford Houses and verified homes in Colorado.</p>
                </div>
                {/* Item 2 */}
                <div className="bg-white p-6 rounded-3xl border border-brand-navy/5 shadow-sm hover:shadow-lg transition-all group">
                   <div className="w-12 h-12 bg-brand-coral/10 rounded-xl flex items-center justify-center text-brand-coral mb-4 group-hover:scale-110 transition-transform">
                      <Bus size={24} />
                   </div>
                   <h4 className="font-bold text-xl text-brand-navy mb-2">Transit Passes</h4>
                   <p className="text-sm text-brand-navy/60">Monthly RTD bus passes to ensure you can get to therapy, work, and meetings.</p>
                </div>
                {/* Item 3 */}
                <div className="bg-white p-6 rounded-3xl border border-brand-navy/5 shadow-sm hover:shadow-lg transition-all group">
                   <div className="w-12 h-12 bg-brand-lavender/20 rounded-xl flex items-center justify-center text-brand-navy mb-4 group-hover:scale-110 transition-transform">
                      <Laptop size={24} />
                   </div>
                   <h4 className="font-bold text-xl text-brand-navy mb-2">Work Tech</h4>
                   <p className="text-sm text-brand-navy/60">Refurbished laptops and phones for job applications and remote work access.</p>
                </div>
                {/* Item 4 */}
                <div className="bg-white p-6 rounded-3xl border border-brand-navy/5 shadow-sm hover:shadow-lg transition-all group">
                   <div className="w-12 h-12 bg-brand-yellow/20 rounded-xl flex items-center justify-center text-brand-navy mb-4 group-hover:scale-110 transition-transform">
                      <Hammer size={24} />
                   </div>
                   <h4 className="font-bold text-xl text-brand-navy mb-2">Tools & ID</h4>
                   <p className="text-sm text-brand-navy/60">Work boots, tools for trades, and fees for retrieving state IDs and documents.</p>
                </div>
             </div>
          </div>

          {/* PROTOCOL PIPELINE (Visual Flow) */}
          <div className="w-full relative z-10 mb-0">
             <div className="flex items-center justify-center gap-3 mb-12 opacity-80">
                <div className="h-px bg-brand-navy/10 w-12 md:w-24"></div>
                <h3 className="text-center font-display font-bold text-xl md:text-2xl text-brand-navy">How capital flows</h3>
                <div className="h-px bg-brand-navy/10 w-12 md:w-24"></div>
             </div>
             
             <div className="relative flex flex-col md:flex-row justify-between items-stretch gap-6 max-w-6xl mx-auto">
                
                {/* Connector Line (Desktop) */}
                <div className="absolute top-1/2 left-0 w-full h-1 -z-10 hidden md:block border-t-2 border-dashed border-brand-navy/10"></div>
                
                {/* Step 1 */}
                <div className="bg-white p-8 rounded-[2rem] border border-brand-navy/10 shadow-lg flex-1 relative group hover:-translate-y-2 transition-transform">
                   <div className="w-12 h-12 bg-brand-navy/5 rounded-2xl flex items-center justify-center mb-6 text-brand-teal group-hover:scale-110 transition-transform">
                      <Search size={24} />
                   </div>
                   <h4 className="font-bold text-xl text-brand-navy mb-2">1. AI Vetting</h4>
                   <p className="text-sm text-brand-navy/60 leading-relaxed">Windy interviews the applicant and verifies their needs against local vendor databases in real-time.</p>
                </div>

                {/* Arrow Mobile */}
                <div className="md:hidden flex justify-center text-brand-navy/20"><ArrowDown /></div>

                {/* Step 2 */}
                <div className="bg-white p-8 rounded-[2rem] border border-brand-navy/10 shadow-lg flex-1 relative group hover:-translate-y-2 transition-transform">
                   <div className="w-12 h-12 bg-brand-coral/10 rounded-2xl flex items-center justify-center mb-6 text-brand-coral group-hover:scale-110 transition-transform">
                      <Lock size={24} />
                   </div>
                   <h4 className="font-bold text-xl text-brand-navy mb-2">2. Vendor Lock</h4>
                   <p className="text-sm text-brand-navy/60 leading-relaxed">Capital is routed directly to the service provider (e.g. Oxford House). Funds never touch the applicant's hands.</p>
                </div>

                {/* Arrow Mobile */}
                <div className="md:hidden flex justify-center text-brand-navy/20"><ArrowDown /></div>

                {/* Step 3 */}
                <div className="bg-white p-8 rounded-[2rem] border border-brand-navy/10 shadow-lg flex-1 relative group hover:-translate-y-2 transition-transform">
                   <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center mb-6 text-brand-teal group-hover:scale-110 transition-transform">
                      <Fingerprint size={24} />
                   </div>
                   <h4 className="font-bold text-xl text-brand-navy mb-2">3. Public Audit</h4>
                   <p className="text-sm text-brand-navy/60 leading-relaxed">The transaction receipt is published to the live ledger. You get a notification that your specific dollar did the job.</p>
                </div>

             </div>
          </div>
          
          {/* FAQ Section */}
          <div className="w-full mt-24 max-w-4xl">
             <div className="text-center mb-12">
                 <h2 className="font-display font-bold text-3xl text-brand-navy">Common Questions</h2>
                 <p className="text-brand-navy/50 mt-2">Everything you need to know about our funding protocol.</p>
             </div>
             
             <div className="space-y-4">
                 <details className="group bg-white rounded-2xl border border-brand-navy/5 open:border-brand-teal/30 open:ring-4 open:ring-brand-teal/5 transition-all">
                     <summary className="p-6 cursor-pointer list-none flex justify-between items-center font-bold text-brand-navy">
                         Do you fund CARR Certified homes?
                         <ArrowDown className="group-open:rotate-180 transition-transform text-brand-teal" size={20} />
                     </summary>
                     <div className="px-6 pb-6 pt-0 text-brand-navy/70 leading-relaxed text-sm">
                         Yes. SecondWind prioritizes funding for facilities certified by CARR (Colorado Association of Recovery Residences). These homes meet higher safety and management standards. We verify certification in real-time before releasing funds.
                     </div>
                 </details>

                 <details className="group bg-white rounded-2xl border border-brand-navy/5 open:border-brand-teal/30 open:ring-4 open:ring-brand-teal/5 transition-all">
                     <summary className="p-6 cursor-pointer list-none flex justify-between items-center font-bold text-brand-navy">
                         How to find Oxford House vacancies in Denver?
                         <ArrowDown className="group-open:rotate-180 transition-transform text-brand-teal" size={20} />
                     </summary>
                     <div className="px-6 pb-6 pt-0 text-brand-navy/70 leading-relaxed text-sm">
                         Oxford House vacancies change daily. While we don't manage their list directly, our "Partner Network" tool tracks active houses where we have successfully placed residents recently. Start a chat with Windy to check eligibility for funding at specific locations.
                     </div>
                 </details>

                 <details className="group bg-white rounded-2xl border border-brand-navy/5 open:border-brand-teal/30 open:ring-4 open:ring-brand-teal/5 transition-all">
                     <summary className="p-6 cursor-pointer list-none flex justify-between items-center font-bold text-brand-navy">
                         Am I eligible for help if I have Colorado Medicaid?
                         <ArrowDown className="group-open:rotate-180 transition-transform text-brand-teal" size={20} />
                     </summary>
                     <div className="px-6 pb-6 pt-0 text-brand-navy/70 leading-relaxed text-sm">
                         Yes. If you have active Health First Colorado (Medicaid), you automatically qualify for our Peer Recovery Coaching service. This provides dedicated support for ID retrieval, food stamps (SNAP), and job placement at no cost to you.
                     </div>
                 </details>

                 <details className="group bg-white rounded-2xl border border-brand-navy/5 open:border-brand-teal/30 open:ring-4 open:ring-brand-teal/5 transition-all">
                     <summary className="p-6 cursor-pointer list-none flex justify-between items-center font-bold text-brand-navy">
                         What if I relapse?
                         <ArrowDown className="group-open:rotate-180 transition-transform text-brand-teal" size={20} />
                     </summary>
                     <div className="px-6 pb-6 pt-0 text-brand-navy/70 leading-relaxed text-sm">
                         Recovery is non-linear. If you relapse, funding may be paused, but we do not ban you. We will require a new verified sobriety date and may redirect you to higher levels of care (Detox/Rehab) before resuming sober living rent payments.
                     </div>
                 </details>
             </div>
          </div>

        </div>
      </SectionWrapper>
    </div>
  );
};
