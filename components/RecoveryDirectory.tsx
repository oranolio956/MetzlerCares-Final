
import React from 'react';
import { MapPin, ArrowUpRight, Navigation, Building } from 'lucide-react';

const REGIONS = [
  {
    name: "Denver Metro",
    areas: ["Capitol Hill", "RiNo", "Highlands", "Aurora", "Lakewood", "Englewood", "Littleton"],
    services: ["Sober Living Rent Assistance", "Detox Transport", "IOP Technology Grants", "Felon-Friendly Job Placement"]
  },
  {
    name: "Boulder County",
    areas: ["Boulder Central", "Longmont", "Lafayette", "Louisville", "Superior"],
    services: ["Student Recovery Housing", "Rehab Bus Passes", "Addiction Recovery Coaching", "Medicaid Enrollment"]
  },
  {
    name: "Colorado Springs",
    areas: ["Downtown", "Manitou Springs", "Security-Widefield", "Fountain"],
    services: ["Veteran Recovery Aid", "Faith-Based Sober Living Funding", "Employment Tools", "ID Replacement"]
  },
  {
    name: "Northern Colorado",
    areas: ["Fort Collins", "Greeley", "Loveland", "Evans"],
    services: ["Rural Recovery Transit", "Oxford House Deposits", "Telehealth Laptops", "Emergency Food Assistance"]
  }
];

export const RecoveryDirectory: React.FC = () => {
  const scrollToPartners = () => {
      document.getElementById('partner-directory')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-[#152232] border-t border-brand-navy/20 py-16 lg:py-24" aria-label="Colorado Recovery Directory">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <div className="mb-12 border-b border-brand-lavender/10 pb-8">
           <h2 className="font-display font-bold text-3xl text-white mb-4">Colorado Recovery Network Index</h2>
           <p className="text-brand-lavender/60 max-w-2xl leading-relaxed">
             SecondWind operates the largest direct-to-vendor funding protocol for addiction recovery in the state. 
             We provide financial logistics for verified sober living homes, detox facilities, and intensive outpatient programs (IOP) across the following service zones.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {REGIONS.map((region) => (
             <div key={region.name} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-brand-teal font-bold uppercase tracking-widest text-xs">
                   <MapPin size={14} /> {region.name}
                </div>
                
                {/* Cities List - Semantic List for SEO */}
                <div className="bg-brand-navy/40 p-6 rounded-2xl border border-white/5 group hover:border-brand-teal/30 transition-colors">
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Navigation size={16} className="text-brand-coral" /> Service Areas
                   </h3>
                   <ul className="space-y-2">
                      {region.areas.map(area => (
                        <li key={area} onClick={scrollToPartners} className="text-brand-lavender/60 text-sm hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                           <span className="w-1 h-1 bg-brand-teal rounded-full"></span>
                           {area} Sober Living
                        </li>
                      ))}
                   </ul>
                </div>

                {/* Services List */}
                <div className="bg-brand-navy/40 p-6 rounded-2xl border border-white/5">
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Building size={16} className="text-brand-yellow" /> Active Funding
                   </h3>
                   <ul className="space-y-2">
                      {region.services.map(service => (
                        <li key={service} className="text-brand-lavender/60 text-sm hover:text-white transition-colors cursor-default">
                           {service}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
           ))}
        </div>

        {/* Long-tail Keyword Block */}
        <div className="mt-16 pt-12 border-t border-brand-lavender/5">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                 <span className="text-brand-lavender/40 text-xs font-bold uppercase tracking-widest block mb-2">Protocol Stats</span>
                 <p className="text-white/80 text-sm max-w-xl">
                    SecondWind is a 501(c)(3) non-profit organization complying with all Colorado BHA (Behavioral Health Administration) standards for recovery residences. 
                    We function as a financial bridge for indigent applicants seeking entry into <a href="#partner-directory" className="text-brand-teal hover:underline">Oxford House™</a> and CARR (Colorado Association of Recovery Residences) certified homes.
                 </p>
              </div>
              <a href="#apply" className="flex items-center gap-2 text-brand-teal font-bold text-sm hover:text-white transition-colors">
                 Check Funding Eligibility <ArrowUpRight size={16} />
              </a>
           </div>
        </div>

      </div>
    </section>
  );
};
