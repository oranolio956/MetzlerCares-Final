import React from 'react';
import { MapPin } from 'lucide-react';

const COVERAGE = [
  {
    zip: "80205",
    area: "Five Points / RiNo",
    services: ["Sober Living", "Methadone Clinic Access", "Detox Shuttle"]
  },
  {
    zip: "80203",
    area: "Capitol Hill",
    services: ["LGBTQ+ Recovery", "Oxford House Men's", "IOP Funding"]
  },
  {
    zip: "80010",
    area: "Aurora North",
    services: ["Family Recovery Housing", "Medicaid Rehab", "Felon Friendly Jobs"]
  },
  {
    zip: "80302",
    area: "Boulder Central",
    services: ["Student Recovery", "Tech Grants", "Mountain Transit"]
  },
  {
    zip: "80903",
    area: "Colorado Springs Downtown",
    services: ["Veteran Services", "Faith Based Living", "Work Boots Funding"]
  }
];

export const HyperLocalMap: React.FC = () => {
  return (
    <div className="w-full bg-[#1A2A3A] py-12 border-t border-white/5 font-mono text-[10px] text-brand-lavender/40" aria-hidden="true">
       <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
             {COVERAGE.map(zone => (
               <div key={zone.zip} className="space-y-2">
                  <div className="font-bold text-brand-teal flex items-center gap-1">
                     <MapPin size={10} /> {zone.zip} - {zone.area}
                  </div>
                  <ul className="space-y-1">
                     {zone.services.map(s => (
                       <li key={s} className="hover:text-white cursor-crosshair transition-colors">{s}</li>
                     ))}
                  </ul>
                  {/* Semantic Meta for Bots */}
                  <div itemScope itemType="https://schema.org/Service" className="hidden">
                    <span itemProp="serviceType">{zone.services.join(', ')}</span>
                    <span itemProp="areaServed">{zone.area}</span>
                    <span itemProp="postalCode">{zone.zip}</span>
                  </div>
               </div>
             ))}
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center opacity-50">
             SECONDWIND COLORADO // 501(C)(3) NON-PROFIT
          </div>
       </div>
    </div>
  );
};