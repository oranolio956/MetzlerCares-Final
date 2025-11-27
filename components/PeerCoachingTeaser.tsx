import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, FileText, Briefcase, Utensils, ShieldCheck, Crown } from 'lucide-react';
import { Mascot } from './Mascot';

interface PeerCoachingTeaserProps {
  onNavigate: (section: string) => void;
}

export const PeerCoachingTeaser: React.FC<PeerCoachingTeaserProps> = ({ onNavigate }) => {
  return (
    <section className="w-full bg-[#FDFBF7] py-24 relative overflow-hidden" aria-label="Peer Coaching Benefits">
      
      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
         <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-brand-yellow/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-brand-teal/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
           
           {/* Left: Typography & Value Prop */}
           <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-navy/5 text-brand-navy font-bold text-xs uppercase tracking-widest mb-6 border border-brand-navy/10 animate-slide-up">
                 <Crown size={14} className="text-brand-yellow fill-brand-yellow" />
                 <span>Medicaid Member Benefit</span>
              </div>
              
              <h2 className="font-display font-bold text-4xl md:text-6xl text-brand-navy mb-6 leading-[0.95] tracking-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
                 Your insurance <br/>
                 <span className="text-brand-teal">pays your bills.</span>
              </h2>
              
              <p className="text-lg md:text-xl text-brand-navy/60 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                 If you have <strong>Health First Colorado</strong> (Medicaid), you have a hidden budget. We unlock it to pay for your ID, work boots, and career coaching. <br/><span className="font-bold text-brand-navy">Zero cost to you.</span>
              </p>

              <button 
                onClick={() => onNavigate('peer-coaching')}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-brand-navy text-white rounded-2xl font-bold text-lg hover:bg-brand-teal transition-all shadow-xl hover:shadow-2xl active:scale-95 animate-slide-up"
                style={{ animationDelay: '0.3s' }}
              >
                 <span>Unlock Coaching</span>
                 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                 <div className="absolute -top-2 -right-2 w-4 h-4 bg-brand-yellow rounded-full animate-pulse border-2 border-white"></div>
              </button>
           </div>

           {/* Right: Visual Cards */}
           <div className="flex-1 w-full max-w-md lg:max-w-full">
              <div className="relative">
                 {/* Decorative Blobs */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-brand-teal/20 to-brand-coral/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>

                 {/* Stacked Cards */}
                 <div className="grid gap-4 relative z-10">
                    
                    {/* Card 1: ID Retrieval */}
                    <div 
                        onClick={() => onNavigate('peer-coaching')}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-brand-navy/5 flex items-center gap-6 transform translate-x-4 hover:translate-x-2 transition-transform cursor-pointer group"
                    >
                       <div className="w-16 h-16 bg-brand-lavender/20 rounded-2xl flex items-center justify-center text-brand-navy shrink-0 group-hover:scale-110 transition-transform">
                          <FileText size={32} />
                       </div>
                       <div>
                          <h4 className="font-bold text-xl text-brand-navy">ID Retrieval</h4>
                          <p className="text-sm text-brand-navy/50">Birth Certs & State IDs funded.</p>
                       </div>
                       <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-brand-teal"><ArrowRight /></div>
                    </div>

                    {/* Card 2: Career (Featured) */}
                    <div 
                        onClick={() => onNavigate('peer-coaching')}
                        className="bg-brand-navy p-6 rounded-3xl shadow-2xl border border-brand-navy flex items-center gap-6 transform -translate-x-4 scale-105 z-20 cursor-pointer relative overflow-hidden group"
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="w-16 h-16 bg-brand-teal rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                          <Briefcase size={32} />
                       </div>
                       <div className="text-white">
                          <h4 className="font-bold text-xl">Career Launch</h4>
                          <p className="text-brand-lavender text-sm">Tools, Boots & Job Placement.</p>
                       </div>
                       <div className="ml-auto bg-white/10 p-2 rounded-full"><ArrowRight className="text-white" size={20} /></div>
                    </div>

                    {/* Card 3: Benefits */}
                    <div 
                        onClick={() => onNavigate('peer-coaching')}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-brand-navy/5 flex items-center gap-6 transform translate-x-8 hover:translate-x-6 transition-transform cursor-pointer group"
                    >
                       <div className="w-16 h-16 bg-brand-coral/10 rounded-2xl flex items-center justify-center text-brand-coral shrink-0 group-hover:scale-110 transition-transform">
                          <Utensils size={32} />
                       </div>
                       <div>
                          <h4 className="font-bold text-xl text-brand-navy">Benefits Audit</h4>
                          <p className="text-sm text-brand-navy/50">Maximize SNAP & Food Stamps.</p>
                       </div>
                       <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-brand-teal"><ArrowRight /></div>
                    </div>

                 </div>
              </div>
           </div>

        </div>

        {/* Trust Strip */}
        <div className="mt-20 pt-10 border-t border-brand-navy/5 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           <span className="text-xs font-bold uppercase tracking-widest text-brand-navy/40">Powered by</span>
           <div className="flex items-center gap-2 font-bold text-brand-navy">
              <ShieldCheck size={20} /> Health First Colorado
           </div>
           <div className="flex items-center gap-2 font-bold text-brand-navy">
              <ShieldCheck size={20} /> Rocky Mountain Health
           </div>
           <div className="flex items-center gap-2 font-bold text-brand-navy">
              <ShieldCheck size={20} /> CO Access
           </div>
        </div>

      </div>
    </section>
  );
};
