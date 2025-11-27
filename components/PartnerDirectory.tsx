
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Building2, MapPin, ShieldCheck, Activity, Search, X, Phone, Globe, Users, Wifi, Coffee, Bus, Ban, ArrowRight, HeartHandshake, BedDouble, FileCheck, Share2, Copy, ExternalLink, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';

interface FacilityDetails {
  description: string;
  amenities: string[];
  rules: string[];
  website?: string;
  phone: string;
  capacity: string;
  fundingEligible: string[];
}

interface Partner {
  id: string;
  name: string;
  type: string;
  location: string;
  neighborhood: string;
  status: 'active' | 'limited';
  carrCertified: boolean;
  details: FacilityDetails;
}

const PARTNERS: Partner[] = [
  { 
    id: "oxford-union",
    name: "Oxford House Union", 
    type: "Sober Living (Men)", 
    location: "Denver, CO", 
    neighborhood: "Capitol Hill", 
    status: 'active', 
    carrCertified: false,
    details: {
      description: "A historic Victorian home converted into a democratically run sober living environment. Located in the heart of Cap Hill, walking distance to meetings and jobs.",
      amenities: ["High-Speed Wifi", "In-house Laundry", "Shared Kitchen", "Close to Bus 15"],
      rules: ["Zero Tolerance", "Weekly House Meeting", "Chore Rotation", "Curfew (11 PM)"],
      phone: "(303) 555-0199",
      capacity: "9 Beds",
      fundingEligible: ["Deposit", "1st Month Rent"]
    }
  },
  { 
    id: "oxford-park-hill",
    name: "Oxford House Park Hill", 
    type: "Sober Living (Women)", 
    location: "Denver, CO", 
    neighborhood: "Park Hill", 
    status: 'active', 
    carrCertified: false,
    details: {
      description: "Quiet residential neighborhood home focused on women in early recovery. Large backyard and community garden space.",
      amenities: ["Garden", "Parking", "Streaming Services", "Single Rooms Avail"],
      rules: ["Zero Tolerance", "3 Guest Limit", "Weekly Dinner"],
      phone: "(303) 555-0244",
      capacity: "7 Beds",
      fundingEligible: ["Deposit", "Rent Assistance"]
    }
  },
  { 
    id: "hazelbrook",
    name: "Hazelbrook Sober Living", 
    type: "Recovery Residence", 
    location: "Aurora, CO", 
    neighborhood: "Del Mar", 
    status: 'active', 
    carrCertified: true,
    details: {
      description: "Professionally managed recovery residence with on-site house manager. Structured living with emphasis on accountability and community reintegration.",
      amenities: ["House Manager", "UA Testing", "Job Board", "Rec Room"],
      rules: ["Daily Check-in", "Mandatory Meeting Sheet", "No Overnight Guests"],
      phone: "(720) 555-0881",
      capacity: "12 Beds",
      fundingEligible: ["Full Scholarship", "Gap Funding"]
    }
  },
  { 
    id: "stout-street",
    name: "Stout Street Foundation", 
    type: "Therapeutic Community", 
    location: "Commerce City, CO", 
    neighborhood: "Commerce City", 
    status: 'limited', 
    carrCertified: true,
    details: {
      description: "Long-term residential therapeutic community. 28-day intensive followed by long-term vocational training program.",
      amenities: ["Vocational Training", "Clinical Staff", "Dining Hall", "Gym"],
      rules: ["Blackout Period", "Structured Schedule", "Phone Restrictions"],
      phone: "(303) 555-9911",
      capacity: "Waitlist Only",
      fundingEligible: ["Entry Fee", "Hygiene Supplies"]
    }
  },
  { 
    id: "sobriety-house",
    name: "Sobriety House", 
    type: "Transitional Housing", 
    location: "Denver, CO", 
    neighborhood: "Baker", 
    status: 'active', 
    carrCertified: true,
    details: {
        description: "Oldest recovery center in Denver. Stepped care model from intensive residential to independent sober living apartments.",
        amenities: ["Clinical Support", "Downtown Access", "Substance Free", "Counseling"],
        rules: ["Curfew", "Breathalyzer", "Case Management"],
        phone: "(303) 555-1234",
        capacity: "Varies",
        fundingEligible: ["Treatment Copay", "Rent"]
    }
  },
  { 
    id: "step-denver",
    name: "Step Denver", 
    type: "Men's Residential", 
    location: "Denver, CO", 
    neighborhood: "LoDo", 
    status: 'active', 
    carrCertified: true,
    details: {
        description: "Men's residential recovery program helping low-income men overcome addiction through sobriety, work, and accountability.",
        amenities: ["Career Coaching", "Dorm Style", "Meals Provided", "Gym Access"],
        rules: ["Work Requirement", "Sober Campus", "Early Curfew"],
        phone: "(303) 555-5555",
        capacity: "Open Enrollment",
        fundingEligible: ["Work Boots", "Bus Pass"]
    }
  },
  { 
    id: "oxford-lakewood",
    name: "Oxford House Lakewood", 
    type: "Sober Living (Co-Ed)", 
    location: "Lakewood, CO", 
    neighborhood: "Belmar", 
    status: 'active', 
    carrCertified: false,
    details: {
        description: "Co-ed democratically run house near Belmar shopping district. Strong community focus.",
        amenities: ["Near Lightrail", "Large Kitchen", "Pet Friendly (Review)"],
        rules: ["Democratic Vote", "Weekly Chores", "Financial Officer Audit"],
        phone: "(303) 555-8822",
        capacity: "8 Beds",
        fundingEligible: ["Deposit", "Rent"]
    }
  },
  { 
    id: "harmony",
    name: "Harmony Foundation", 
    type: "Addiction Treatment", 
    location: "Estes Park, CO", 
    neighborhood: "Estes Park", 
    status: 'active', 
    carrCertified: true,
    details: {
        description: "Residential addiction treatment center in the Rocky Mountains. Evidence-based clinical care.",
        amenities: ["Mountain Views", "Medical Detox", "Family Program", "Alumni Network"],
        rules: ["Clinical Driven", "No Electronics (Phase 1)"],
        phone: "(970) 555-4321",
        capacity: "Intake Daily",
        fundingEligible: ["Transportation to Admit", "Insurance Deductible"]
    }
  },
  { 
    id: "cedar",
    name: "CeDAR", 
    type: "Treatment Center", 
    location: "Aurora, CO", 
    neighborhood: "Anschutz", 
    status: 'active', 
    carrCertified: true,
    details: {
        description: "Center for Dependency, Addiction and Rehabilitation at UCHealth. Hospital-affiliated high-acuity care.",
        amenities: ["Medical Staff", "Psychiatry", "Fitness Center", "Spiritual Care"],
        rules: ["Medical Clearance", "Tobacco Free Campus"],
        phone: "(720) 555-9000",
        capacity: "Assessment Req",
        fundingEligible: ["Ride Share Funding"]
    }
  },
  { 
    id: "phoenix",
    name: "The Phoenix", 
    type: "Recovery Community", 
    location: "Denver, CO", 
    neighborhood: "Five Points", 
    status: 'active', 
    carrCertified: false,
    details: {
        description: "Active sober community gym and event center. Free to anyone with 48 hours of sobriety.",
        amenities: ["CrossFit Gym", "Rock Climbing", "Social Events", "Yoga"],
        rules: ["48 Hours Sober", "Code of Conduct"],
        phone: "(720) 555-1111",
        capacity: "Unlimited",
        fundingEligible: ["Gym Gear", "Transport"]
    }
  },
  { 
    id: "oxford-arvada",
    name: "Oxford House Arvada", 
    type: "Sober Living (Men)", 
    location: "Arvada, CO", 
    neighborhood: "Olde Town", 
    status: 'active', 
    carrCertified: false,
    details: {
        description: "Established house in Olde Town Arvada. Close to G-Line train station.",
        amenities: ["Train Access", "Garage", "BBQ Area"],
        rules: ["Zero Tolerance", "Weekly Meeting"],
        phone: "(303) 555-7777",
        capacity: "8 Beds",
        fundingEligible: ["Rent", "Deposit"]
    }
  },
  { 
    id: "ready-to-work",
    name: "Ready To Work", 
    type: "Employment Housing", 
    location: "Boulder, CO", 
    neighborhood: "Boulder Central", 
    status: 'limited', 
    carrCertified: true,
    details: {
        description: "Bridge House program combining paid work with housing and support services.",
        amenities: ["Case Management", "Paid Traineeship", "Dorm Living"],
        rules: ["Work Crew Participation", "Savings Requirement"],
        phone: "(303) 555-4444",
        capacity: "Application Only",
        fundingEligible: ["Work Clothing", "Hygiene"]
    }
  }
];

const FacilityModal: React.FC<{ partner: Partner; onClose: () => void }> = ({ partner, onClose }) => {
    const { playClick, playSuccess } = useSound();
    const { beneficiaryProfile, addNotification } = useStore();
    const [copied, setCopied] = useState(false);
    
    // Check if current user has an active application for this facility
    const activeApplication = beneficiaryProfile?.requests.find(r => 
        r.details?.toLowerCase().includes(partner.name.toLowerCase()) || 
        r.type.toLowerCase().includes(partner.name.toLowerCase())
    );

    const handleShare = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('facility', partner.id);
        navigator.clipboard.writeText(url.toString());
        setCopied(true);
        playSuccess();
        setTimeout(() => setCopied(false), 2000);
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if(e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} aria-hidden="true"></div>
            
            <div className="relative w-full max-w-3xl bg-[#FDFBF7] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90dvh] flex flex-col">
                
                {/* Header Image Area */}
                <div className="h-40 bg-brand-navy relative shrink-0">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] to-transparent"></div>
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-md" title="Copy Link">
                            {copied ? <CheckCircle2 size={24} className="text-brand-teal" /> : <Share2 size={24} />}
                        </button>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-md">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="absolute -bottom-8 left-8 flex items-end">
                        <div className="w-24 h-24 bg-white rounded-2xl p-4 shadow-lg flex items-center justify-center text-brand-navy border-4 border-[#FDFBF7]">
                            <Building2 size={40} />
                        </div>
                    </div>
                </div>

                <div className="px-8 pt-12 pb-8 overflow-y-auto custom-scrollbar flex-1">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${partner.status === 'active' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-yellow/10 text-brand-yellow'}`}>
                                    {partner.status === 'active' ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                                    {partner.status === 'active' ? 'Funding Active' : 'Limited Space'}
                                </span>
                                {partner.carrCertified && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-brand-navy/5 text-brand-navy flex items-center gap-1">
                                        <ShieldCheck size={10} /> CARR Certified
                                    </span>
                                )}
                            </div>
                            <h2 className="font-display font-bold text-3xl md:text-4xl text-brand-navy">{partner.name}</h2>
                            <div className="flex items-center gap-2 text-brand-navy/60 font-medium mt-1">
                                <MapPin size={16} className="text-brand-coral" />
                                <span>{partner.location} • {partner.neighborhood}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                            {activeApplication ? (
                                <div className="flex-1 md:flex-none bg-brand-navy/5 text-brand-navy px-6 py-3 rounded-xl font-bold flex flex-col items-center justify-center border border-brand-navy/10 min-w-[160px]">
                                    <span className="text-[10px] uppercase tracking-widest text-brand-navy/50">Application Status</span>
                                    <span className={`text-sm flex items-center gap-2 ${activeApplication.status === 'funded' ? 'text-brand-teal' : 'text-brand-yellow'}`}>
                                        {activeApplication.status === 'funded' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                        {activeApplication.status === 'funded' ? 'Approved & Paid' : 'In Review'}
                                    </span>
                                </div>
                            ) : (
                                <a href="#apply" onClick={onClose} className="flex-1 md:flex-none bg-brand-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-navy transition-colors shadow-lg flex items-center justify-center gap-2">
                                    <HeartHandshake size={18} /> Apply for Funding
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="prose prose-sm text-brand-navy/80 leading-relaxed bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm">
                                <p className="text-lg">{partner.details.description}</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-brand-navy mb-4 flex items-center gap-2"><Wifi size={18} /> Amenities</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {partner.details.amenities.map(a => (
                                        <div key={a} className="flex items-center gap-2 text-sm text-brand-navy/70 bg-white p-2 rounded-lg border border-brand-navy/5">
                                            <div className="w-1.5 h-1.5 bg-brand-teal rounded-full"></div> {a}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-brand-navy mb-4 flex items-center gap-2"><FileCheck size={18} /> House Rules</h4>
                                <ul className="space-y-2">
                                    {partner.details.rules.map(r => (
                                        <li key={r} className="flex items-center gap-2 text-sm text-brand-navy/70">
                                            <CheckCircle2 size={14} className="text-brand-navy/30" /> {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-brand-cream border border-brand-navy/10 rounded-2xl p-6">
                                <h4 className="font-bold text-brand-navy mb-4 text-sm uppercase tracking-widest border-b border-brand-navy/10 pb-2">Protocol Coverage</h4>
                                <p className="text-xs text-brand-navy/60 mb-4">SecondWind actively funds the following costs at this facility:</p>
                                <div className="flex flex-wrap gap-2">
                                    {partner.details.fundingEligible.map(f => (
                                        <span key={f} className="px-2 py-1 bg-brand-teal text-white text-xs font-bold rounded flex items-center gap-1">
                                            <CheckCircle2 size={10} /> {f}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <a href={`tel:${partner.details.phone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-navy/5 transition-colors text-brand-navy group">
                                    <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-colors"><Phone size={14} /></div>
                                    <div className="text-sm font-bold">{partner.details.phone}</div>
                                </a>
                                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-navy/5 transition-colors text-brand-navy">
                                    <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center"><Users size={14} /></div>
                                    <div className="text-sm font-bold">Capacity: {partner.details.capacity}</div>
                                </div>
                                {partner.details.website && (
                                    <a href={partner.details.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-navy/5 transition-colors text-brand-navy group">
                                        <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-colors"><ExternalLink size={14} /></div>
                                        <div className="text-sm font-bold underline">Visit Website</div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export const PartnerDirectory: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const { playClick } = useSound();

  // DEEP LINKING LOGIC
  useEffect(() => {
    // 1. Check URL on mount
    const params = new URLSearchParams(window.location.search);
    const facilityId = params.get('facility');
    if (facilityId) {
        const p = PARTNERS.find(x => x.id === facilityId);
        if(p) {
            setSelectedPartner(p);
            // Optional: Scroll to directory if deep linked
            setTimeout(() => {
                document.getElementById('partner-directory')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }
    
    // 2. Handle browser back/forward buttons
    const handlePopState = () => {
        const newParams = new URLSearchParams(window.location.search);
        const newId = newParams.get('facility');
        if (newId) {
             const p = PARTNERS.find(x => x.id === newId);
             if (p) setSelectedPartner(p);
        } else {
             setSelectedPartner(null);
        }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openPartner = (p: Partner) => {
    playClick();
    setSelectedPartner(p);
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('facility', p.id);
    window.history.pushState({}, '', url);
  };

  const closePartner = () => {
    setSelectedPartner(null);
    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete('facility');
    window.history.pushState({}, '', url);
  };

  const filteredPartners = PARTNERS.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.location.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <section id="partner-directory" className="w-full bg-[#FDFBF7] py-16 border-t border-brand-navy/5" aria-label="Verified Sober Living Network">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
             <div>
                <div className="flex items-center gap-2 text-brand-teal font-bold uppercase tracking-widest text-xs mb-2">
                   <Activity size={14} className="animate-pulse" /> Live Network Status
                </div>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-brand-navy">Verified Vendor Database</h2>
                <p className="text-brand-navy/60 mt-2 max-w-2xl">
                   Real-time funding eligibility for specific Colorado recovery residences. 
                   We pay rent directly to these verified <strong>Oxford Houses</strong> and <strong>CARR Certified</strong> locations.
                </p>
             </div>
             
             <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/30" size={18} />
                <input 
                  type="text" 
                  placeholder="Search facility name..." 
                  className="w-full bg-white border border-brand-navy/10 rounded-xl py-3 pl-12 pr-4 text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:border-brand-teal transition-colors"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredPartners.map((partner) => (
               <button 
                  key={partner.id}
                  onClick={() => openPartner(partner)}
                  className="bg-white border border-brand-navy/5 rounded-xl p-6 hover:shadow-lg hover:border-brand-teal/30 transition-all group text-left relative overflow-hidden"
                  itemScope 
                  itemType="https://schema.org/Place"
               >
                  <div className="absolute right-0 top-0 w-20 h-20 bg-brand-navy/5 rounded-bl-[4rem] -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                     <div className="w-10 h-10 bg-brand-navy/5 rounded-lg flex items-center justify-center text-brand-navy/40 group-hover:bg-brand-navy group-hover:text-white transition-colors">
                        <Building2 size={20} />
                     </div>
                     <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${partner.status === 'active' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-yellow/10 text-brand-yellow'}`}>
                        {partner.status === 'active' ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                        {partner.status === 'active' ? 'Funding Active' : 'Limited Space'}
                     </div>
                  </div>

                  <h3 className="font-bold text-lg text-brand-navy mb-1 group-hover:text-brand-teal transition-colors" itemProp="name">{partner.name}</h3>
                  <p className="text-xs text-brand-navy/50 font-bold uppercase tracking-wider mb-4" itemProp="description">{partner.type}</p>
                  
                  <div className="space-y-2 text-sm text-brand-navy/70" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                     <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-brand-coral" />
                        <span><span itemProp="addressLocality">{partner.location}</span> • {partner.neighborhood}</span>
                     </div>
                     {partner.carrCertified && (
                        <div className="flex items-center gap-2 text-brand-navy/60">
                           <ShieldCheck size={14} />
                           <span>CARR Certified / Verified</span>
                        </div>
                     )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-brand-navy/5 flex items-center text-xs font-bold text-brand-navy/40 group-hover:text-brand-navy transition-colors">
                      View Facility Profile <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Meta data for Search Engines */}
                  <meta itemProp="addressRegion" content="CO" />
                  <meta itemProp="addressCountry" content="US" />
               </button>
             ))}
          </div>
          
          <div className="mt-8 text-center">
              <p className="text-xs text-brand-navy/30 font-bold uppercase tracking-widest">
                  * SecondWind is an independent 501(c)(3) funding source and is not owned by any listed facility.
              </p>
          </div>

        </div>
      </section>

      {/* MODAL */}
      {selectedPartner && (
        <FacilityModal partner={selectedPartner} onClose={closePartner} />
      )}
    </>
  );
};
