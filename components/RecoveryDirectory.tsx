import React from 'react';
import { MapPin, ArrowUpRight, Navigation, Building, Wifi, Radio } from 'lucide-react';

const REGIONS = [
  {
    name: "Denver Metro",
    status: 'online',
    ping: '24ms',
    areas: ["Capitol Hill", "RiNo", "Highlands", "Aurora", "Lakewood", "Englewood", "Littleton"],
    services: ["Sober Living Rent Assistance", "Detox Transport", "IOP Technology Grants", "Felon-Friendly Job Placement"]
  },
  {
    name: "Boulder County",
    status: 'online',
    ping: '42ms',
    areas: ["Boulder Central", "Longmont", "Lafayette", "Louisville", "Superior"],
    services: ["Student Recovery Housing", "Rehab Bus Passes", "Addiction Recovery Coaching", "Medicaid Enrollment"]
  },
  {
    name: "Colorado Springs",
    status: 'busy',
    ping: '88ms',
    areas: ["Downtown", "Manitou Springs", "Security-Widefield", "Fountain"],
    services: ["Veteran Recovery Aid", "Faith-Based Sober Living Funding", "Employment Tools", "ID Replacement"]
  },
  {
    name: "Northern Colorado",
    status: 'online',
    ping: '65ms',
    areas: ["Fort Collins", "Greeley", "Loveland", "Evans"],
    services: ["Rural Recovery Transit", "Oxford House Deposits", "Telehealth Laptops", "Emergency Food Assistance"]
  }
];

export const RecoveryDirectory: React.FC = () => {
  const scrollToPartners = () => {
      document.getElementById('partner-directory')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-[#152232] border-t border-brand-navy/20 py-16 lg:py-24 relative overflow-hidden" aria-label="Colorado Recovery Directory">
      {/* Background Radar Scanner */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(45,156,142,0.1)_360deg)] rounded-full animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="mb-12 border-b border-brand-lavender/10 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
           <div>
               <div className="flex items-center gap-2 text-brand-teal font-bold uppercase tracking-widest text-xs mb-2">
                   <Radio size={16} className="animate-pulse" /> Live Network Index
               </div>
               <h2 className="font-display font-bold text-3xl text-white">Active Service Zones</h2>
               <p className="text-brand-lavender/60 max-w-xl leading-relaxed mt-2">
                 SecondWind operates a real-time funding protocol across these verified sectors. We monitor bed availability and grant capacity every 15 minutes.
               </p>
           </div>
           <div className="flex items-center gap-4 text-xs font-mono text-white/40 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-teal"></div> Online</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-yellow"></div> High Traffic</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-coral"></div> Full</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {REGIONS.map((region, idx) => (
             <div 
                key={region.name} 
                className="group relative bg-[#1A2A3A] p-6 rounded-2xl border border-white/5 hover:border-brand-teal/30 transition-all hover:-translate-y-1 flex flex-col gap-4 overflow-hidden"
                style={{ animationDelay: `${idx * 0.1}s` }}
             >
                {/* Status Indicator */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-brand-teal font-bold uppercase tracking-widest text-xs">
                        <MapPin size={14} /> {region.name}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${region.status === 'online' ? 'bg-brand-teal shadow-[0_0_10px_#2D9C8E]' : 'bg-brand-yellow shadow-[0_0_10px_#F4D35E]'} animate-pulse`}></div>
                </div>
                
                {/* Cities List - Semantic List for SEO */}
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-3 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      <Navigation size={12} /> Coverage
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {region.areas.map(area => (
                        <span key={area} onClick={scrollToPartners} className="text-white/70 text-xs bg-white/5 px-2 py-1 rounded cursor-pointer hover:bg-brand-teal/20 hover:text-brand-teal transition-colors">
                           {area}
                        </span>
                      ))}
                   </div>
                </div>

                {/* Services List - Reveals on Hover */}
                <div className="border-t border-white/5 pt-4 mt-auto">
                   <div className="flex items-center justify-between text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-brand-teal transition-colors">
                      <span className="flex items-center gap-2"><Building size={12} /> Protocol</span>
                      <span className="font-mono opacity-50">{region.ping}</span>
                   </div>
                   <ul className="space-y-1">
                      {region.services.slice(0, 2).map(service => (
                        <li key={service} className="text-brand-lavender/60 text-xs truncate">
                           {service}
                        </li>
                      ))}
                      <li className="text-brand-teal text-xs font-bold pt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          + View All Services <ArrowUpRight size={10} />
                      </li>
                   </ul>
                </div>
             </div>
           ))}
        </div>

        {/* Long-tail Keyword Block */}
        <div className="mt-16 pt-12 border-t border-brand-lavender/5">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                 <span className="text-brand-lavender/40 text-xs font-bold uppercase tracking-widest block mb-2">System Status</span>
                 <p className="text-white/80 text-sm max-w-xl">
                    SecondWind is a 501(c)(3) non-profit organization complying with all Colorado BHA (Behavioral Health Administration) standards. 
                    We function as a financial bridge for indigent applicants seeking entry into <a href="#partner-directory" className="text-brand-teal hover:underline">Oxford House™</a> and CARR (Colorado Association of Recovery Residences) certified homes.
                 </p>
              </div>
              <a href="#apply" className="flex items-center gap-2 text-brand-navy bg-brand-teal hover:bg-white transition-colors px-6 py-3 rounded-xl font-bold text-sm shadow-lg">
                 <Wifi size={16} /> Check Funding Eligibility
              </a>
           </div>
        </div>

      </div>
    </section>
  );
};