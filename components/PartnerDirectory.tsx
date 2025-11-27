import React, { useState, useEffect } from 'react';
import { CheckCircle2, Building2, MapPin, ShieldCheck, Activity, Search, X, Phone, Globe, Users, Wifi, Coffee, Bus, Ban, ArrowRight, HeartHandshake, BedDouble, FileCheck, Share2, Copy, ExternalLink, Clock, Moon, UserX, Briefcase, BookOpen, ChevronDown, Filter } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSound } from '../hooks/useSound';
import { SEOHead } from './SEOHead';

interface ProgramRequirements {
  curfew: string;
  guests: string;
  meetings: string;
  work: string;
}

interface FacilityDetails {
  description: string;
  amenities: string[];
  rules: string[];
  programRequirements: ProgramRequirements;
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
    id: "tribe-recovery",
    name: "Tribe Recovery Homes", 
    type: "Structured Sober Living", 
    location: "Denver, CO", 
    neighborhood: "Metro Area", 
    status: 'active', 
    carrCertified: true,
    details: {
      description: "A comprehensive recovery community focusing on peer support and structured living. Tribe operates multiple homes across the Denver Metro area, providing a safe, sober environment with a strong emphasis on community reintegration.",
      amenities: ["House Managers", "Weekly UA", "Job Placement Help", "Community Events"],
      rules: ["Zero Tolerance Policy", "Chore Rotation", "Good Neighbor Policy"],
      programRequirements: {
        curfew: "10:00 PM (Sun-Thu) / 12:00 AM (Fri-Sat)",
        guests: "No overnight guests. Visitors allowed in common areas until 9 PM.",
        meetings: "Mandatory 5 meetings per week (12-step or alternatives).",
        work: "Must be employed, looking for work (30hrs+), or in school."
      },
      phone: "(720) 900-3693",
      website: "https://triberecoveryhomes.com",
      capacity: "Multiple Locations",
      fundingEligible: ["Deposit", "2 Weeks Rent", "Bus Pass"]
    }
  },
  { 
    id: "choice-house",
    name: "Choice House", 
    type: "Men's Transitional", 
    location: "Boulder, CO", 
    neighborhood: "Mountain Shadows", 
    status: 'limited', 
    carrCertified: true,
    details: {
      description: "Premier men's recovery program in Boulder combining clinical excellence with outdoor adventure therapy. Focus on long-term brotherhood and vulnerability.",
      amenities: ["Mountain Setting", "Clinical Integration", "Hiking/Skiing", "Chef Prepared Meals"],
      rules: ["Clinical Engagement", "No Personal Vehicles (Phase 1)", "Sober Transport"],
      programRequirements: {
        curfew: "9:30 PM Nightly. Strict accountability.",
        guests: "Family visitation only during approved weekend hours.",
        meetings: "Daily group therapy + 3 outside 12-step meetings.",
        work: "Focus on treatment first. Work integration in Phase 2."
      },
      phone: "(720) 577-4422",
      website: "https://choicehousecolorado.com",
      capacity: "Waitlist",
      fundingEligible: ["Insurance Deductible", "Gear Grant"]
    }
  },
  { 
    id: "oxford-union",
    name: "Oxford House Union", 
    type: "Sober Living (Men)", 
    location: "Denver, CO", 
    neighborhood: "Capitol Hill", 
    status: 'active', 
    carrCertified: false,
    details: {
      description: "A historic Victorian home converted into a democratically run sober living environment. Located in the heart of Cap Hill, walking distance to meetings and jobs. Self-run, self-supported.",
      amenities: ["High-Speed Wifi", "In-house Laundry", "Shared Kitchen", "Close to Bus 15"],
      rules: ["Equal Expense Sharing", "Officer Elections", "Disruptive Behavior Eviction"],
      programRequirements: {
        curfew: "Determined by house vote. Typically 11 PM for new members.",
        guests: "No overnight guests. No opposite gender in bedrooms.",
        meetings: "MANDATORY weekly House Business Meeting (usually Sunday).",
        work: "Must pay equal share of rent. No specific work hours mandated."
      },
      phone: "(303) 555-0199",
      capacity: "9 Beds",
      fundingEligible: ["Deposit", "1st Month Rent"]
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
      rules: ["Daily Check-in", "Mandatory Meeting Sheet", "Cleanliness Standards"],
      programRequirements: {
        curfew: "10:00 PM Nightly (11 PM Fri/Sat w/ privileges).",
        guests: "No overnight guests. No opposite gender in bedrooms.",
        meetings: "5 meetings per week minimum with signed sheet.",
        work: "Must work, volunteer, or attend IOP (32+ hours/week)."
      },
      phone: "(303) 856-6649",
      website: "https://hazelbrooksoberliving.com",
      capacity: "12 Beds",
      fundingEligible: ["Full Scholarship", "Gap Funding"]
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
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('facility', partner.id);
            navigator.clipboard.writeText(url.toString());
            setCopied(true);
            playSuccess();
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            addNotification('info', 'Link copied to clipboard (fallback)');
        }
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if(e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 pt-safe" role="dialog" aria-modal="true" aria-labelledby="facility-title">
            {/* DYNAMIC SEO for "Individual Page" Effect */}
            <SEOHead 
                title={`${partner.name} - Sober Living Funding | SecondWind`} 
                description={`Apply for rent assistance and funding for ${partner.name} in ${partner.location}. ${partner.details.description}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": partner.name,
                    "image": "https://secondwind.org/social-card.svg",
                    "telephone": partner.details.phone,
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": partner.neighborhood,
                        "addressLocality": partner.location.split(',')[0],
                        "addressRegion": "CO",
                        "addressCountry": "US"
                    },
                    "description": partner.details.description,
                    "url": partner.details.website || window.location.href
                }}
            />

            <div className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} aria-hidden="true"></div>
            
            <div 
                className="relative w-full max-w-4xl bg-[#FDFBF7] rounded-none md:rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 h-[100dvh] md:max-h-[90dvh] flex flex-col"
                itemScope
                itemType="https://schema.org/LocalBusiness"
            >
                {/* Header Image Area */}
                <div className="h-40 bg-brand-navy relative shrink-0">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] to-transparent"></div>
                    
                    {/* Close Buttons with Safe Area Handling */}
                    <div className="absolute top-4 right-4 flex gap-2 md:pt-0 pt-safe pr-safe z-20">
                        <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-md" title="Copy Link" aria-label="Copy link to clipboard">
                            {copied ? <CheckCircle2 size={24} className="text-brand-teal" /> : <Share2 size={24} />}
                        </button>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-md" aria-label="Close details">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="absolute -bottom-8 left-8 flex items-end">
                        <div className="w-24 h-24 bg-white rounded-2xl p-4 shadow-lg flex items-center justify-center text-brand-navy border-4 border-[#FDFBF7]">
                            <Building2 size={40} />
                        </div>
                    </div>
                </div>

                <div className="px-6 md:px-8 pt-12 pb-24 md:pb-8 overflow-y-auto custom-scrollbar flex-1 pb-safe">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${partner.status === 'active' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-yellow/10 text-yellow-700'}`}>
                                    {partner.status === 'active' ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                                    {partner.status === 'active' ? 'Funding Active' : 'Limited Space'}
                                </span>
                                {partner.carrCertified && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-brand-navy/5 text-brand-navy flex items-center gap-1">
                                        <ShieldCheck size={10} /> CARR Certified
                                    </span>
                                )}
                            </div>
                            <h2 id="facility-title" className="font-display font-bold text-3xl md:text-4xl text-brand-navy leading-tight" itemProp="name">{partner.name}</h2>
                            <p className="text-brand-navy/50 font-bold uppercase tracking-widest text-xs mt-2 mb-1">{partner.type}</p>
                            
                            {/* CLICKABLE MAP LINK */}
                            <a 
                                href={`https://maps.google.com/?q=${encodeURIComponent(`${partner.name}, ${partner.location}`)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-brand-navy/60 font-medium mt-1 hover:text-brand-teal transition-colors group" 
                                itemProp="address" 
                                itemScope 
                                itemType="https://schema.org/PostalAddress"
                            >
                                <MapPin size={16} className="text-brand-coral group-hover:scale-110 transition-transform" />
                                <span className="group-hover:underline decoration-brand-teal underline-offset-2">
                                    <span itemProp="addressLocality">{partner.location.split(',')[0]}</span>, <span itemProp="addressRegion">CO</span> • <span itemProp="streetAddress">{partner.neighborhood}</span>
                                </span>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                            {activeApplication ? (
                                <div className="flex-1 md:flex-none bg-brand-navy/5 text-brand-navy px-6 py-3 rounded-xl font-bold flex flex-col items-center justify-center border border-brand-navy/10 min-w-[160px]">
                                    <span className="text-[10px] uppercase tracking-widest text-brand-navy/50">Application Status</span>
                                    <span className={`text-sm flex items-center gap-2 ${activeApplication.status === 'funded' ? 'text-brand-teal' : 'text-yellow-700'}`}>
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="prose prose-sm text-brand-navy/80 leading-relaxed bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm">
                                <p className="text-lg" itemProp="description">{partner.details.description}</p>
                            </div>

                            {/* PROTOCOL GRID */}
                            <div>
                                <h4 className="font-bold text-brand-navy mb-4 flex items-center gap-2"><FileCheck size={18} /> House Protocols</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-brand-navy/5 p-4 rounded-xl border border-brand-navy/5">
                                        <div className="flex items-center gap-2 text-brand-navy mb-2 font-bold text-sm">
                                            <Moon size={16} className="text-brand-teal" /> Curfew Policy
                                        </div>
                                        <p className="text-sm text-brand-navy/70 leading-relaxed">{partner.details.programRequirements?.curfew || "Contact house for details."}</p>
                                    </div>
                                    <div className="bg-brand-navy/5 p-4 rounded-xl border border-brand-navy/5">
                                        <div className="flex items-center gap-2 text-brand-navy mb-2 font-bold text-sm">
                                            <UserX size={16} className="text-brand-coral" /> Guest Policy
                                        </div>
                                        <p className="text-sm text-brand-navy/70 leading-relaxed">{partner.details.programRequirements?.guests || "Contact house for details."}</p>
                                    </div>
                                    <div className="bg-brand-navy/5 p-4 rounded-xl border border-brand-navy/5">
                                        <div className="flex items-center gap-2 text-brand-navy mb-2 font-bold text-sm">
                                            <Users size={16} className="text-yellow-700" /> Meeting Quota
                                        </div>
                                        <p className="text-sm text-brand-navy/70 leading-relaxed">{partner.details.programRequirements?.meetings || "Mandatory house meeting weekly."}</p>
                                    </div>
                                    <div className="bg-brand-navy/5 p-4 rounded-xl border border-brand-navy/5">
                                        <div className="flex items-center gap-2 text-brand-navy mb-2 font-bold text-sm">
                                            <Briefcase size={16} className="text-brand-lavender" /> Productivity
                                        </div>
                                        <p className="text-sm text-brand-navy/70 leading-relaxed">{partner.details.programRequirements?.work || "Must pay rent."}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-brand-navy mb-4 flex items-center gap-2"><Wifi size={18} /> Amenities</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {partner.details.amenities.map(a => (
                                        <div key={a} className="flex items-center gap-2 text-sm text-brand-navy/70 bg-white p-2 rounded-lg border border-brand-navy/5" itemProp="amenityFeature" itemScope itemType="https://schema.org/LocationFeatureSpecification">
                                            <div className="w-1.5 h-1.5 bg-brand-teal rounded-full"></div> 
                                            <span itemProp="value">{a}</span>
                                        </div>
                                    ))}
                                </div>
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
                                <a href={`tel:${partner.details.phone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-navy/5 transition-colors text-brand-navy group" itemProp="telephone" aria-label={`Call ${partner.name}`}>
                                    <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-colors"><Phone size={14} /></div>
                                    <div className="text-sm font-bold">{partner.details.phone}</div>
                                </a>
                                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-navy/5 transition-colors text-brand-navy">
                                    <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center"><Users size={14} /></div>
                                    <div className="text-sm font-bold">Capacity: {partner.details.capacity}</div>
                                </div>
                                {partner.details.website && (
                                    <a href={partner.details.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-navy/5 transition-colors text-brand-navy group" itemProp="url" aria-label={`Visit website of ${partner.name}`}>
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [carrOnly, setCarrOnly] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const { playClick } = useSound();

  const uniqueTypes = Array.from(new Set(PARTNERS.map(p => p.type)));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const facilityId = params.get('facility');
    if (facilityId) {
        const p = PARTNERS.find(x => x.id === facilityId);
        if(p) {
            setSelectedPartner(p);
            setTimeout(() => {
                document.getElementById('partner-directory')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }
    
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
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('facility', p.id);
        window.history.pushState({}, '', url.toString());
    } catch (e) {
        console.debug("Deep linking skipped in restricted environment");
    }
  };

  const closePartner = () => {
    setSelectedPartner(null);
    try {
        const url = new URL(window.location.href);
        url.searchParams.delete('facility');
        window.history.pushState({}, '', url.toString());
    } catch (e) {
        console.debug("Deep linking skipped in restricted environment");
    }
  };

  const filteredPartners = PARTNERS.filter(p => {
    const matchesText = p.name.toLowerCase().includes(filter.toLowerCase()) || 
                        p.location.toLowerCase().includes(filter.toLowerCase()) ||
                        p.neighborhood.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCarr = !carrOnly || p.carrCertified;
    return matchesText && matchesType && matchesStatus && matchesCarr;
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Verified Colorado Sober Living Homes",
    "description": "List of Oxford Houses and CARR-certified recovery residences in Denver and Boulder that accept direct funding.",
    "itemListElement": filteredPartners.map((p, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": p.name,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": p.location.split(',')[0],
            "addressRegion": "CO"
        },
        "description": p.details.description
      }
    }))
  };

  return (
    <>
      <section id="partner-directory" className="w-full bg-[#FDFBF7] py-16 border-t border-brand-navy/5" aria-label="Verified Sober Living Network">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
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

          {/* ADVANCED FILTERING TOOLBAR - SCROLLABLE */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-navy/5 animate-slide-up overflow-x-auto no-scrollbar snap-x touch-pan-x">
              {/* Type Filter */}
              <div className="relative shrink-0 snap-start">
                  <select 
                      value={typeFilter}
                      onChange={(e) => { setTypeFilter(e.target.value); playClick(); }}
                      className="appearance-none bg-white border border-brand-navy/10 hover:border-brand-navy/30 rounded-xl px-4 py-2 pr-8 text-sm font-bold text-brand-navy focus:outline-none focus:border-brand-teal transition-colors cursor-pointer"
                  >
                      <option value="all">All Facility Types</option>
                      {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-brand-navy">
                      <ChevronDown size={14} />
                  </div>
              </div>

              {/* Status Filter */}
              <div className="flex bg-white rounded-xl p-1 border border-brand-navy/10 shrink-0 snap-start">
                  <button 
                      onClick={() => { setStatusFilter('all'); playClick(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-brand-navy text-white shadow-sm' : 'text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/5'}`}
                  >
                      All
                  </button>
                  <button 
                      onClick={() => { setStatusFilter('active'); playClick(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'active' ? 'bg-brand-teal text-white shadow-sm' : 'text-brand-navy/60 hover:text-brand-teal hover:bg-brand-teal/10'}`}
                  >
                      Active
                  </button>
                  <button 
                      onClick={() => { setStatusFilter('limited'); playClick(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'limited' ? 'bg-brand-yellow text-brand-navy shadow-sm' : 'text-brand-navy/60 hover:text-brand-yellow hover:bg-brand-yellow/10'}`}
                  >
                      Limited
                  </button>
              </div>

              {/* CARR Toggle */}
              <button 
                  onClick={() => { setCarrOnly(!carrOnly); playClick(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shrink-0 snap-start ${carrOnly ? 'bg-brand-navy/5 border-brand-navy text-brand-navy' : 'bg-white border-brand-navy/10 text-brand-navy/60 hover:border-brand-navy/30'}`}
              >
                  <ShieldCheck size={16} className={carrOnly ? 'text-brand-teal' : ''} />
                  <span className="text-sm font-bold whitespace-nowrap">CARR Certified</span>
              </button>

              {/* Reset Filters */}
              {(typeFilter !== 'all' || statusFilter !== 'all' || carrOnly || filter) && (
                  <button 
                      onClick={() => {
                          setFilter('');
                          setTypeFilter('all');
                          setStatusFilter('all');
                          setCarrOnly(false);
                          playClick();
                      }}
                      className="text-xs font-bold text-brand-coral hover:underline ml-auto flex items-center gap-1 shrink-0 snap-start"
                  >
                      <X size={12} /> Reset Filters
                  </button>
              )}
          </div>

          {filteredPartners.length === 0 ? (
             <div className="text-center py-20 bg-brand-navy/5 rounded-3xl border-2 border-dashed border-brand-navy/10">
                <Filter size={48} className="mx-auto text-brand-navy/20 mb-4" />
                <h3 className="font-bold text-xl text-brand-navy">No facilities found.</h3>
                <p className="text-brand-navy/50 text-sm mt-2">Try adjusting your filters or search terms.</p>
                <button 
                    onClick={() => { setFilter(''); setTypeFilter('all'); setStatusFilter('all'); setCarrOnly(false); }}
                    className="mt-6 text-brand-teal font-bold text-sm hover:underline"
                >
                    Clear all filters
                </button>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPartners.map((partner) => (
                <button 
                    key={partner.id}
                    onClick={() => openPartner(partner)}
                    className="bg-white border border-brand-navy/5 rounded-xl p-6 hover:shadow-lg hover:border-brand-teal/30 transition-all group text-left relative overflow-hidden active:scale-[0.98]"
                    itemScope 
                    itemType="https://schema.org/Place"
                >
                    <div className="absolute right-0 top-0 w-20 h-20 bg-brand-navy/5 rounded-bl-[4rem] -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-10 h-10 bg-brand-navy/5 rounded-lg flex items-center justify-center text-brand-navy/40 group-hover:bg-brand-navy group-hover:text-white transition-colors">
                            <Building2 size={20} />
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${partner.status === 'active' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-yellow/10 text-yellow-700'}`}>
                            {partner.status === 'active' ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                            {partner.status === 'active' ? 'Active' : 'Limited'}
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-brand-navy mb-1 group-hover:text-brand-teal transition-colors" itemProp="name">{partner.name}</h3>
                    <p className="text-xs text-brand-navy/50 font-bold uppercase tracking-wider mb-4" itemProp="description">{partner.type}</p>
                    
                    <div className="space-y-2 text-sm text-brand-navy/70" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-brand-coral" />
                            <span>{partner.location.split(',')[0]} • {partner.neighborhood}</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-brand-navy/5 flex items-center text-xs font-bold text-brand-navy/40 group-hover:text-brand-navy transition-colors">
                        View Profile <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {selectedPartner && (
        <FacilityModal partner={selectedPartner} onClose={closePartner} />
      )}
    </>
  );
};