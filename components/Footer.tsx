import React, { useState } from 'react';
import { HeartHandshake, MapPin, Mail, Phone, ArrowRight, Github, Twitter, Linkedin, Instagram, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';

const BrandLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SecondWind Logo">
    <path d="M15 55C15 85 40 95 75 95V75C55 75 40 70 40 55H15Z" fill="#FDFBF7" />
    <path d="M85 45C85 15 60 5 25 5V25C45 25 60 30 60 45H85Z" fill="#2D9C8E" />
    <circle cx="50" cy="50" r="12" fill="#FF8A75" />
  </svg>
);

export const Footer: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { userType, setShowLegalDocs } = useStore();
  const { playSuccess, playClick } = useSound();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      if(email) {
          playSuccess();
          setSubscribed(true);
          setEmail('');
          setTimeout(() => setSubscribed(false), 4000);
      }
  };

  return (
    <footer className="bg-brand-navy text-white pt-20 pb-10 relative overflow-hidden mt-0">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#2D9C8E 1px, transparent 1px), linear-gradient(90deg, #2D9C8E 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
           
           {/* Brand Column */}
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <BrandLogo className="w-10 h-10" />
                 <span className="font-display font-bold text-2xl tracking-tight">SecondWind</span>
              </div>
              <p className="text-brand-lavender/60 text-sm leading-relaxed max-w-xs">
                 The platform for direct-action recovery. We replace bureaucracy with instant, verified funding for sober living in Colorado.
              </p>
              
              {/* Interactive Subscribe */}
              <form onSubmit={handleSubscribe} className="relative max-w-xs">
                  <input 
                    type="email" 
                    placeholder="Newsletter..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-teal transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscribed}
                  />
                  <button 
                    type="submit" 
                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${subscribed ? 'bg-brand-teal text-white' : 'bg-white/10 text-white/60 hover:bg-white hover:text-brand-navy'}`}
                    disabled={!email || subscribed}
                    onClick={subscribed ? undefined : playClick}
                  >
                      {subscribed ? <Check size={14} /> : <ArrowRight size={14} />}
                  </button>
              </form>

              <div className="flex gap-4 pt-2">
                 <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-teal hover:text-white transition-colors"><Twitter size={18} /></a>
                 <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-teal hover:text-white transition-colors"><Instagram size={18} /></a>
                 <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-teal hover:text-white transition-colors"><Linkedin size={18} /></a>
              </div>
           </div>

           {/* Platform Links */}
           <div>
              <h4 className="font-bold text-lg mb-6 text-brand-teal">Platform</h4>
              <ul className="space-y-4 text-sm font-medium text-brand-lavender/60">
                 <li><button onClick={() => onNavigate('apply')} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 transition-all" /> Get Funding</button></li>
                 <li><button onClick={() => onNavigate('donate')} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 transition-all" /> Invest Portfolio</button></li>
                 <li><button onClick={() => onNavigate('ledger')} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 transition-all" /> Live Ledger</button></li>
                 <li><button onClick={() => onNavigate('peer-coaching')} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 transition-all" /> Peer Coaching</button></li>
                 <li><button onClick={() => onNavigate('partner')} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 transition-all" /> Partner Network</button></li>
              </ul>
           </div>

           {/* Service Areas (SEO) */}
           <div>
              <h4 className="font-bold text-lg mb-6 text-brand-teal">Service Areas</h4>
              <ul className="space-y-4 text-sm font-medium text-brand-lavender/60">
                 <li className="flex items-center gap-2"><MapPin size={14} className="text-brand-coral" /> Denver Metro</li>
                 <li className="flex items-center gap-2"><MapPin size={14} className="text-brand-coral" /> Boulder County</li>
                 <li className="flex items-center gap-2"><MapPin size={14} className="text-brand-coral" /> Colorado Springs</li>
                 <li className="flex items-center gap-2"><MapPin size={14} className="text-brand-coral" /> Aurora / Lakewood</li>
              </ul>
           </div>

           {/* Contact */}
           <div>
              <h4 className="font-bold text-lg mb-6 text-brand-teal">Contact</h4>
              <ul className="space-y-4 text-sm font-medium text-brand-lavender/60">
                 <li className="flex items-center gap-2"><Mail size={16} /> help@metzlercares.com</li>
                 <li className="flex items-center gap-2"><Phone size={16} /> +1 (720) 555-0123</li>
                 <li className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs opacity-50 mb-2">Non-Profit Status</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white">
                       <HeartHandshake size={12} /> 501(c)(3) Verified
                    </div>
                 </li>
              </ul>
           </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-xs text-brand-lavender/40 font-bold uppercase tracking-widest">
              © 2024 SecondWind Fund. All Rights Reserved.
           </p>
           <div className="flex gap-6 text-xs text-brand-lavender/40 font-bold uppercase tracking-widest">
              <button onClick={() => setShowLegalDocs(true)} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => setShowLegalDocs(true)} className="hover:text-white transition-colors">Terms</button>
              <a href="/sitemap.xml" target="_blank" className="hover:text-white transition-colors">Sitemap</a>
           </div>
        </div>

      </div>
    </footer>
  );
};