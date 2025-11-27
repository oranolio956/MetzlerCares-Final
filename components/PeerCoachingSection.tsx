import React, { useState } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { useStore } from '../context/StoreContext';
import { Mascot } from './Mascot';
import { 
  CheckCircle2, FileText, Briefcase, Utensils, ArrowRight, ShieldCheck, Star, Zap, Sparkles, CreditCard, GraduationCap, MapPin, Unlock, ChevronRight, Lock, XCircle, HelpCircle
} from 'lucide-react';

interface PeerCoachingSectionProps {
  onNavigate: (section: string) => void;
}

// Explicit style mapping to fix Tailwind JIT interpolation issues
const STYLE_MAP: Record<string, { bg: string; lightBg: string; text: string; border: string }> = {
  'brand-navy': { bg: 'bg-brand-navy', lightBg: 'bg-brand-navy/5', text: 'text-brand-navy', border: 'border-brand-navy/10' },
  'brand-teal': { bg: 'bg-brand-teal', lightBg: 'bg-brand-teal/5', text: 'text-brand-teal', border: 'border-brand-teal/10' },
  'brand-coral': { bg: 'bg-brand-coral', lightBg: 'bg-brand-coral/5', text: 'text-brand-coral', border: 'border-brand-coral/10' },
  'brand-yellow': { bg: 'bg-brand-yellow', lightBg: 'bg-brand-yellow/5', text: 'text-brand-yellow', border: 'border-brand-yellow/10' },
};

const BenefitCard: React.FC<{ 
  title: string; 
  desc: string; 
  value: string; 
  icon: React.ElementType; 
  color: string; 
  delay: string;
  tags: string[];
}> = ({ title, desc, value, icon: Icon, color, delay, tags }) => {
  const styles = STYLE_MAP[color] || STYLE_MAP['brand-navy'];

  return (
    <div 
      className="group relative bg-white rounded-[2rem] p-6 md:p-8 border-2 border-brand-navy/5 hover:border-brand-navy/20 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full overflow-hidden"
      style={{ animationDelay: delay }}
    >
      {/* Corrected Dynamic Background Class */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 ${styles.lightBg}`}></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300 ${styles.bg}`}>
          <Icon size={28} />
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-navy/30 line-through">Market Value {value}</span>
          <span className="block text-lg font-display font-bold text-brand-teal">$0.00</span>
        </div>
      </div>

      <h3 className="font-display font-bold text-2xl text-brand-navy mb-2 relative z-10">{title}</h3>
      <p className="text-brand-navy/60 leading-relaxed mb-6 relative z-10 flex-grow">{desc}</p>

      <div className="flex flex-wrap gap-2 mt-auto relative z-10">
        {tags.map(tag => (
          <span key={tag} className="px-3 py-1 rounded-lg bg-brand-navy/5 text-brand-navy/60 text-xs font-bold uppercase tracking-wide border border-brand-navy/5">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export const PeerCoachingSection: React.FC<PeerCoachingSectionProps> = ({ onNavigate }) => {
  const { login } = useStore();
  const [checkState, setCheckState] = useState<'idle' | 'location' | 'insurance' | 'processing' | 'success' | 'ineligible'>('idle');
  const [successMessage, setSuccessMessage] = useState('You are likely eligible!');

  const handleStartCheck = () => setCheckState('location');

  const handleLocationAnswer = (isColorado: boolean) => {
    if (isColorado) {
      setCheckState('insurance');
    } else {
      setCheckState('ineligible');
    }
  };

  const handleInsuranceAnswer = (hasMedicaid: boolean) => {
    setCheckState('processing');
    setTimeout(() => {
      if (hasMedicaid) {
        setSuccessMessage('You are likely eligible!');
      } else {
        setSuccessMessage('We can help you apply!');
      }
      setCheckState('success');
    }, 1500);
  };

  const handleGetStarted = () => {
    login('beneficiary');
    onNavigate('portal');
  };

  return (
    <SectionWrapper 
      id="peer-coaching" 
      title="Peer Recovery Coaching | SecondWind" 
      description="Unlock your recovery benefits. ID retrieval, SNAP, and Job Placement funded by Medicaid."
      className="overflow-visible"
    >
      <div className="flex flex-col items-center w-full max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* --- HERO: THE BLACK CARD --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full mb-32 mt-8">
            
            {/* Left: The Pitch */}
            <div className="flex-1 max-w-2xl text-center lg:text-left relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-xs md:text-sm uppercase tracking-widest mb-8 animate-slide-up border border-brand-teal/20">
                    <Star size={14} className="fill-brand-teal" />
                    <span>Premium Member Benefit</span>
                </div>
                
                <h1 className="font-display font-bold text-[3.5rem] md:text-[5rem] leading-[0.95] text-brand-navy mb-6 tracking-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Stop asking. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-coral via-brand-yellow to-brand-coral bg-[length:200%_auto] animate-text-shimmer">Start claiming.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-brand-navy/60 leading-relaxed mb-10 font-medium animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    You have insurance. That means you have a budget. <br className="hidden md:block"/>
                    We assign you a <span className="text-brand-navy font-bold">Personal Recovery Agent</span> to navigate the system, handle your paperwork, and get your bills paid.
                </p>

                {/* Interactive Eligibility Checker - Multi-Step Questionnaire */}
                <div className="bg-white p-2 rounded-[1.2rem] shadow-xl border border-brand-navy/10 flex flex-col sm:flex-row w-full max-w-lg animate-slide-up mx-auto lg:mx-0 min-h-[88px] transition-all duration-300" style={{ animationDelay: '0.3s' }}>
                    
                    {/* STEP 0: IDLE */}
                    {checkState === 'idle' && (
                        <>
                            <div className="flex-1 px-6 py-4 flex items-center justify-center sm:justify-start gap-3 text-brand-navy/40 font-medium">
                                <ShieldCheck size={20} />
                                <span>Do I qualify?</span>
                            </div>
                            <button 
                                onClick={handleStartCheck}
                                className="bg-brand-navy text-white px-8 py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-brand-teal transition-all shadow-md whitespace-nowrap active:scale-95 w-full sm:w-auto"
                            >
                                Check Now
                            </button>
                        </>
                    )}

                    {/* STEP 1: LOCATION */}
                    {checkState === 'location' && (
                        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between w-full px-4 py-2 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 text-brand-navy font-bold text-sm sm:text-base">
                                <MapPin size={18} className="text-brand-teal shrink-0" />
                                <span>Do you live in Colorado?</span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => handleLocationAnswer(true)} className="flex-1 sm:flex-none bg-brand-navy/10 hover:bg-brand-teal hover:text-white text-brand-navy px-4 py-2 rounded-lg font-bold text-sm transition-colors">Yes</button>
                                <button onClick={() => handleLocationAnswer(false)} className="flex-1 sm:flex-none bg-brand-navy/5 hover:bg-brand-coral hover:text-white text-brand-navy/60 px-4 py-2 rounded-lg font-bold text-sm transition-colors">No</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: INSURANCE */}
                    {checkState === 'insurance' && (
                        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between w-full px-4 py-2 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 text-brand-navy font-bold text-sm sm:text-base">
                                <ShieldCheck size={18} className="text-brand-teal shrink-0" />
                                <span>Have active Medicaid?</span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => handleInsuranceAnswer(true)} className="flex-1 sm:flex-none bg-brand-navy/10 hover:bg-brand-teal hover:text-white text-brand-navy px-4 py-2 rounded-lg font-bold text-sm transition-colors">Yes</button>
                                <button onClick={() => handleInsuranceAnswer(false)} className="flex-1 sm:flex-none bg-brand-navy/5 hover:bg-brand-yellow hover:text-brand-navy text-brand-navy/60 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap">No / Unsure</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PROCESSING */}
                    {checkState === 'processing' && (
                        <div className="w-full px-6 py-4 flex items-center justify-center gap-3 text-brand-navy font-bold animate-pulse">
                            <Zap size={20} className="text-brand-yellow animate-bounce" />
                            <span>Verifying criteria...</span>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {checkState === 'success' && (
                        <div className="w-full px-2 py-2 flex flex-col sm:flex-row items-center justify-between bg-brand-teal/10 rounded-xl gap-2 sm:gap-0 animate-in zoom-in-95 duration-300">
                            <div className="px-4 py-2 sm:py-0 flex items-center gap-2 text-brand-teal font-bold text-center sm:text-left">
                                <CheckCircle2 size={20} className="shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                            <button 
                                onClick={handleGetStarted}
                                className="bg-brand-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-navy transition-all shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                Unlock <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* STEP 5: INELIGIBLE */}
                    {checkState === 'ineligible' && (
                        <div className="w-full px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
                            <div className="flex items-center gap-2 text-brand-coral font-bold text-sm">
                                <XCircle size={18} className="shrink-0" />
                                <span>Currently available in CO only.</span>
                            </div>
                            <button 
                                onClick={() => setCheckState('idle')}
                                className="text-brand-navy/40 hover:text-brand-navy text-xs font-bold uppercase tracking-widest underline"
                            >
                                Reset
                            </button>
                        </div>
                    )}

                </div>
                <p className="mt-4 text-xs text-brand-navy/30 font-bold uppercase tracking-widest animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    *No cost to you. Billed to insurance.
                </p>
            </div>

            {/* Right: The Visual (CSS Art Black Card) */}
            <div className="flex-1 flex justify-center lg:justify-end relative w-full max-w-md perspective-1000 group mt-8 lg:mt-0">
                {/* Floating Elements */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-yellow rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-teal rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* THE CARD */}
                <div className="relative w-full aspect-[1.586/1] bg-[#1A2A3A] rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(26,42,58,0.5)] border border-white/10 overflow-hidden transform transition-transform duration-700 hover:rotate-y-6 hover:scale-105 hover:-translate-y-4">
                    
                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>
                    
                    {/* Holographic Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/20 via-white/5 to-brand-coral/20 mix-blend-overlay"></div>
                    <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>

                    {/* Card Content */}
                    <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full text-white">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-teal to-brand-navy flex items-center justify-center border border-white/20">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest opacity-50">SecondWind Protocol</span>
                                    <span className="block font-display font-bold tracking-wider text-sm md:text-base">ACCESS PASS</span>
                                </div>
                            </div>
                            <CreditCard size={32} className="opacity-30" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-end gap-4">
                                <div className="w-12 h-8 rounded bg-brand-yellow/20 border border-brand-yellow/40 flex items-center justify-center">
                                    <div className="w-8 h-5 border-2 border-brand-yellow/60 rounded-sm"></div>
                                </div>
                                <div className="font-mono text-lg opacity-80 tracking-widest">•••• •••• •••• 8821</div>
                            </div>
                            <div className="flex justify-between items-end pt-2 border-t border-white/10">
                                <div>
                                    <span className="block text-[8px] font-bold uppercase tracking-widest opacity-50">Member</span>
                                    <span className="font-display font-bold text-lg">FUTURE YOU</span>
                                </div>
                                <div>
                                    <span className="block text-[8px] font-bold uppercase tracking-widest opacity-50 text-right">Status</span>
                                    <span className="font-bold text-brand-teal uppercase tracking-widest text-sm flex items-center gap-1"><CheckCircle2 size={12} /> Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- THE CATALOG --- */}
        <div className="w-full mb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="text-center md:text-left">
                    <h2 className="font-display font-bold text-3xl md:text-5xl text-brand-navy mb-4">The Recovery Catalog.</h2>
                    <p className="text-brand-navy/60 text-lg max-w-xl mx-auto md:mx-0">Everything here is free for you. Select the services you need to rebuild.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy/40 bg-brand-navy/5 px-4 py-2 rounded-full self-center md:self-auto">
                    <MapPin size={14} /> Available in Denver Metro
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <BenefitCard 
                    title="ID Retrieval" 
                    desc="Birth certificates, SS cards, and State IDs. We deal with the DMV lines and pay the fees so you exist on paper again."
                    value="$65.00"
                    icon={FileText}
                    color="brand-navy"
                    delay="0.1s"
                    tags={['Vital Records', 'DMV Fees', 'Notary']}
                />

                <BenefitCard 
                    title="Benefits Optimization" 
                    desc="We audit your situation and apply for maximum SNAP (Food Stamps) and Medicaid benefits on your behalf."
                    value="$200.00"
                    icon={Utensils}
                    color="brand-teal"
                    delay="0.2s"
                    tags={['SNAP', 'Medicaid', 'Tanf']}
                />

                <BenefitCard 
                    title="Career Launch" 
                    desc="Resume writing, interview coaching, and direct introductions to felon-friendly employers in the trades."
                    value="$500.00"
                    icon={Briefcase}
                    color="brand-coral"
                    delay="0.3s"
                    tags={['Resume', 'Placement', 'Tools']}
                />

                <BenefitCard 
                    title="Education Fund" 
                    desc="Funding for GED testing fees, trade school applications, and required certifications for employment."
                    value="$1,200.00"
                    icon={GraduationCap}
                    color="brand-navy"
                    delay="0.4s"
                    tags={['GED', 'Trade School', 'Certs']}
                />

                <BenefitCard 
                    title="Legal Advocacy" 
                    desc="Assistance navigating court dates, probation requirements, and resolving outstanding warrants where possible."
                    value="$350.00"
                    icon={ShieldCheck}
                    color="brand-teal"
                    delay="0.5s"
                    tags={['Court', 'Probation', 'Warrants']}
                />

                <div className="group relative bg-brand-navy rounded-[2rem] p-8 border-2 border-brand-navy flex flex-col justify-center items-center text-center overflow-hidden cursor-pointer" onClick={handleGetStarted}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 mb-6">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-md group-hover:scale-110 transition-transform duration-300 border border-white/20">
                            <Unlock size={32} className="text-brand-teal" />
                        </div>
                    </div>
                    <h3 className="font-display font-bold text-3xl text-white mb-2 relative z-10">Unlock All</h3>
                    <p className="text-brand-lavender mb-8 relative z-10 text-sm px-8">Verify your insurance to access the full suite of tools.</p>
                    <button className="bg-white text-brand-navy px-8 py-3 rounded-xl font-bold hover:bg-brand-teal hover:text-white transition-colors relative z-10 flex items-center gap-2">
                        Get Started <ChevronRight size={16} />
                    </button>
                </div>

            </div>
        </div>

        {/* --- THE ROADMAP --- */}
        <div className="w-full bg-brand-cream rounded-[3rem] p-8 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-navy via-brand-teal to-brand-coral"></div>
            
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                <div className="lg:w-1/3">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40 mb-4 block">The Process</span>
                    <h2 className="font-display font-bold text-4xl md:text-5xl text-brand-navy mb-6">Your path to stability.</h2>
                    <p className="text-brand-navy/60 text-lg leading-relaxed mb-8">
                        This isn't a handout. It's a strategy. We map out the steps to get you from "surviving" to "thriving" using the resources you're entitled to.
                    </p>
                    <Mascot expression="confident" variant="commute" className="w-48 h-48" />
                </div>

                <div className="lg:w-2/3 relative">
                    {/* Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-brand-navy/10 rounded-full hidden md:block"></div>

                    <div className="space-y-12">
                        {/* Step 1 */}
                        <div className="relative md:pl-20 group flex flex-col md:block">
                            <div className="md:absolute left-0 top-0 w-14 h-14 bg-white border-4 border-brand-navy rounded-full flex items-center justify-center font-display font-bold text-xl text-brand-navy z-10 group-hover:scale-110 transition-transform shadow-sm mb-4 md:mb-0">1</div>
                            <h4 className="font-bold text-2xl text-brand-navy mb-2">Verification & Intake</h4>
                            <p className="text-brand-navy/60 text-lg">
                                A 15-minute chat with Windy or a human case manager to verify your Medicaid status and identify your immediate blockers (ID, Court, Hunger).
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative md:pl-20 group flex flex-col md:block">
                            <div className="md:absolute left-0 top-0 w-14 h-14 bg-white border-4 border-brand-teal rounded-full flex items-center justify-center font-display font-bold text-xl text-brand-teal z-10 group-hover:scale-110 transition-transform shadow-sm mb-4 md:mb-0">2</div>
                            <h4 className="font-bold text-2xl text-brand-navy mb-2">The "Quick Wins"</h4>
                            <p className="text-brand-navy/60 text-lg">
                                Within 48 hours, we execute the easy stuff. Food stamps applied for. DMV appointment booked. Bus pass loaded to your phone.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative md:pl-20 group flex flex-col md:block">
                            <div className="md:absolute left-0 top-0 w-14 h-14 bg-brand-navy border-4 border-brand-navy rounded-full flex items-center justify-center font-display font-bold text-xl text-white z-10 group-hover:scale-110 transition-transform shadow-lg mb-4 md:mb-0">3</div>
                            <h4 className="font-bold text-2xl text-brand-navy mb-2">The Long Game</h4>
                            <p className="text-brand-navy/60 text-lg">
                                Once you're stable, we pair you with a career coach to find living-wage employment that works with your background.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </SectionWrapper>
  );
};