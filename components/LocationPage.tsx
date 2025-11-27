import React from 'react';
import { MapPin, Building2, Users, DollarSign, ArrowRight, Phone, Clock, ShieldCheck } from 'lucide-react';
import { SEOHead } from './SEOHead';
import { useRouter } from '../hooks/useRouter';

interface CityData {
  name: string;
  slug: string;
  description: string;
  population: string;
  avgRent: string;
  facilities: number;
  services: string[];
  keywords: string[];
  coordinates: { lat: number; lng: number };
}

const CITY_DATA: Record<string, CityData> = {
  'denver-sober-living': {
    name: 'Denver',
    slug: 'denver-sober-living',
    description: 'Denver is Colorado\'s largest city and recovery hub, with the highest concentration of sober living homes, IOP programs, and recovery resources. SecondWind actively funds rent assistance, rehab transportation, and technology grants across Denver Metro including Capitol Hill, RiNo, Highlands, Aurora, Lakewood, and Englewood.',
    population: '715,000+',
    avgRent: '$600-$800/month',
    facilities: 45,
    services: ['Sober Living Rent Assistance', 'RTD Bus Passes', 'IOP Technology Grants', 'Felon-Friendly Job Placement', 'Medicaid Peer Coaching'],
    keywords: ['Denver sober living', 'Denver recovery housing', 'Denver rehab funding', 'Denver Oxford House', 'Denver CARR certified'],
    coordinates: { lat: 39.7392, lng: -104.9903 }
  },
  'boulder-sober-living': {
    name: 'Boulder',
    slug: 'boulder-sober-living',
    description: 'Boulder County offers a unique recovery environment combining outdoor therapy with clinical excellence. SecondWind funds student recovery housing, rehab bus passes, addiction recovery coaching, and Medicaid enrollment support in Boulder, Longmont, Lafayette, Louisville, and Superior.',
    population: '108,000+',
    avgRent: '$700-$900/month',
    facilities: 12,
    services: ['Student Recovery Housing', 'Rehab Bus Passes', 'Addiction Recovery Coaching', 'Medicaid Enrollment', 'Mountain-Based Recovery Support'],
    keywords: ['Boulder sober living', 'Boulder recovery housing', 'Boulder rehab funding', 'Boulder Oxford House', 'Boulder CARR certified'],
    coordinates: { lat: 40.0150, lng: -105.2705 }
  },
  'colorado-springs-sober-living': {
    name: 'Colorado Springs',
    slug: 'colorado-springs-sober-living',
    description: 'Colorado Springs serves a large veteran population and faith-based recovery community. SecondWind provides veteran recovery aid, faith-based sober living funding, employment tools, and ID replacement services in Downtown, Manitou Springs, Security-Widefield, and Fountain.',
    population: '478,000+',
    avgRent: '$500-$700/month',
    facilities: 18,
    services: ['Veteran Recovery Aid', 'Faith-Based Sober Living Funding', 'Employment Tools', 'ID Replacement', 'Rehab Transportation'],
    keywords: ['Colorado Springs sober living', 'Colorado Springs recovery housing', 'Colorado Springs rehab funding', 'Colorado Springs Oxford House'],
    coordinates: { lat: 38.8339, lng: -104.8214 }
  },
  'aurora-sober-living': {
    name: 'Aurora',
    slug: 'aurora-sober-living',
    description: 'Aurora is Denver\'s largest suburb with growing recovery resources. SecondWind funds sober living deposits, first month rent, and gap funding for CARR-certified homes in Aurora\'s Del Mar, Buckley, and Smoky Hill neighborhoods.',
    population: '387,000+',
    avgRent: '$550-$750/month',
    facilities: 8,
    services: ['Sober Living Deposits', 'First Month Rent', 'Gap Funding', 'CARR Certified Housing', 'Medicaid Peer Coaching'],
    keywords: ['Aurora sober living', 'Aurora recovery housing', 'Aurora rehab funding', 'Aurora Oxford House'],
    coordinates: { lat: 39.7294, lng: -104.8319 }
  },
  'fort-collins-sober-living': {
    name: 'Fort Collins',
    slug: 'fort-collins-sober-living',
    description: 'Fort Collins serves Northern Colorado with rural recovery transit, Oxford House deposits, telehealth laptops, and emergency food assistance. SecondWind connects residents to recovery resources across Larimer County.',
    population: '169,000+',
    avgRent: '$500-$650/month',
    facilities: 6,
    services: ['Rural Recovery Transit', 'Oxford House Deposits', 'Telehealth Laptops', 'Emergency Food Assistance', 'Rural Recovery Support'],
    keywords: ['Fort Collins sober living', 'Fort Collins recovery housing', 'Fort Collins rehab funding', 'Fort Collins Oxford House'],
    coordinates: { lat: 40.5853, lng: -105.0844 }
  },
  'lakewood-sober-living': {
    name: 'Lakewood',
    slug: 'lakewood-sober-living',
    description: 'Lakewood offers affordable recovery housing options in the Denver Metro area. SecondWind funds sober living rent, rehab transportation, and technology grants for residents accessing treatment across Jefferson County.',
    population: '155,000+',
    avgRent: '$550-$700/month',
    facilities: 10,
    services: ['Sober Living Rent Assistance', 'Rehab Transportation', 'Technology Grants', 'Medicaid Peer Coaching', 'Job Placement Support'],
    keywords: ['Lakewood sober living', 'Lakewood recovery housing', 'Lakewood rehab funding', 'Lakewood Oxford House'],
    coordinates: { lat: 39.7047, lng: -105.0814 }
  },
  'westminster-sober-living': {
    name: 'Westminster',
    slug: 'westminster-sober-living',
    description: 'Westminster provides suburban recovery options between Denver and Boulder. SecondWind funds sober living deposits, first month rent, and provides gap funding for residents accessing treatment in the Front Range.',
    population: '116,000+',
    avgRent: '$600-$750/month',
    facilities: 5,
    services: ['Sober Living Deposits', 'First Month Rent', 'Gap Funding', 'Rehab Transportation', 'Medicaid Peer Coaching'],
    keywords: ['Westminster sober living', 'Westminster recovery housing', 'Westminster rehab funding'],
    coordinates: { lat: 39.8367, lng: -105.0372 }
  },
  'arvada-sober-living': {
    name: 'Arvada',
    slug: 'arvada-sober-living',
    description: 'Arvada offers family-friendly recovery housing in the Denver Metro. SecondWind funds sober living rent, rehab transportation, and technology grants for residents maintaining recovery while rebuilding family connections.',
    population: '124,000+',
    avgRent: '$550-$700/month',
    facilities: 7,
    services: ['Sober Living Rent Assistance', 'Rehab Transportation', 'Technology Grants', 'Family Reintegration Support', 'Medicaid Peer Coaching'],
    keywords: ['Arvada sober living', 'Arvada recovery housing', 'Arvada rehab funding'],
    coordinates: { lat: 39.8028, lng: -105.0875 }
  },
  'thornton-sober-living': {
    name: 'Thornton',
    slug: 'thornton-sober-living',
    description: 'Thornton provides affordable recovery housing in the Denver Metro North. SecondWind funds sober living deposits, first month rent, and provides transportation funding for residents accessing treatment across Adams County.',
    population: '141,000+',
    avgRent: '$500-$650/month',
    facilities: 6,
    services: ['Sober Living Deposits', 'First Month Rent', 'Rehab Transportation', 'Technology Grants', 'Medicaid Peer Coaching'],
    keywords: ['Thornton sober living', 'Thornton recovery housing', 'Thornton rehab funding'],
    coordinates: { lat: 39.8680, lng: -104.9719 }
  },
  'pueblo-sober-living': {
    name: 'Pueblo',
    slug: 'pueblo-sober-living',
    description: 'Pueblo serves Southern Colorado with affordable recovery housing and comprehensive support. SecondWind funds sober living rent, rehab transportation, and provides gap funding for residents accessing treatment in Pueblo County.',
    population: '112,000+',
    avgRent: '$400-$600/month',
    facilities: 8,
    services: ['Sober Living Rent Assistance', 'Rehab Transportation', 'Gap Funding', 'Medicaid Peer Coaching', 'Rural Recovery Support'],
    keywords: ['Pueblo sober living', 'Pueblo recovery housing', 'Pueblo rehab funding'],
    coordinates: { lat: 38.2544, lng: -104.6091 }
  },
  'greeley-sober-living': {
    name: 'Greeley',
    slug: 'greeley-sober-living',
    description: 'Greeley provides rural recovery support in Northern Colorado. SecondWind funds Oxford House deposits, rural transit, telehealth technology, and emergency assistance for residents accessing treatment across Weld County.',
    population: '108,000+',
    avgRent: '$450-$600/month',
    facilities: 5,
    services: ['Oxford House Deposits', 'Rural Transit', 'Telehealth Technology', 'Emergency Assistance', 'Medicaid Peer Coaching'],
    keywords: ['Greeley sober living', 'Greeley recovery housing', 'Greeley rehab funding'],
    coordinates: { lat: 40.4233, lng: -104.7091 }
  },
  'longmont-sober-living': {
    name: 'Longmont',
    slug: 'longmont-sober-living',
    description: 'Longmont offers suburban recovery housing in Boulder County. SecondWind funds sober living rent, rehab transportation, and provides technology grants for residents accessing treatment while maintaining employment.',
    population: '98,000+',
    avgRent: '$600-$750/month',
    facilities: 4,
    services: ['Sober Living Rent Assistance', 'Rehab Transportation', 'Technology Grants', 'Employment Support', 'Medicaid Peer Coaching'],
    keywords: ['Longmont sober living', 'Longmont recovery housing', 'Longmont rehab funding'],
    coordinates: { lat: 40.1672, lng: -105.1019 }
  },
  'broomfield-sober-living': {
    name: 'Broomfield',
    slug: 'broomfield-sober-living',
    description: 'Broomfield provides suburban recovery options between Denver and Boulder. SecondWind funds sober living deposits, first month rent, and provides gap funding for residents accessing treatment in the Front Range.',
    population: '75,000+',
    avgRent: '$650-$800/month',
    facilities: 3,
    services: ['Sober Living Deposits', 'First Month Rent', 'Gap Funding', 'Rehab Transportation', 'Medicaid Peer Coaching'],
    keywords: ['Broomfield sober living', 'Broomfield recovery housing', 'Broomfield rehab funding'],
    coordinates: { lat: 39.9205, lng: -105.0867 }
  },
  'littleton-sober-living': {
    name: 'Littleton',
    slug: 'littleton-sober-living',
    description: 'Littleton offers suburban recovery housing in the Denver Metro South. SecondWind funds sober living rent, rehab transportation, and provides technology grants for residents accessing treatment across Arapahoe County.',
    population: '46,000+',
    avgRent: '$600-$750/month',
    facilities: 5,
    services: ['Sober Living Rent Assistance', 'Rehab Transportation', 'Technology Grants', 'Medicaid Peer Coaching', 'Job Placement Support'],
    keywords: ['Littleton sober living', 'Littleton recovery housing', 'Littleton rehab funding'],
    coordinates: { lat: 39.6133, lng: -105.0166 }
  },
  'englewood-sober-living': {
    name: 'Englewood',
    slug: 'englewood-sober-living',
    description: 'Englewood provides suburban recovery housing in the Denver Metro. SecondWind funds sober living deposits, first month rent, and provides gap funding for residents accessing treatment while maintaining employment.',
    population: '33,000+',
    avgRent: '$600-$750/month',
    facilities: 4,
    services: ['Sober Living Deposits', 'First Month Rent', 'Gap Funding', 'Rehab Transportation', 'Medicaid Peer Coaching'],
    keywords: ['Englewood sober living', 'Englewood recovery housing', 'Englewood rehab funding'],
    coordinates: { lat: 39.6478, lng: -104.9878 }
  }
};

export const LocationPage: React.FC = () => {
  const { route } = useRouter();
  
  // Extract location slug from route (e.g., "locations/denver-sober-living")
  const locationSlug = route.replace('locations/', '');
  const cityData = CITY_DATA[locationSlug];

  if (!cityData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl text-brand-navy mb-4">Location Not Found</h1>
          <p className="text-brand-navy/60 mb-6">The location page you're looking for doesn't exist.</p>
          <a href="#intro" className="text-brand-teal font-bold hover:underline">Return Home</a>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: 'https://secondwind.org/' },
    { name: 'Locations', url: 'https://secondwind.org/locations' },
    { name: `${cityData.name} Sober Living`, url: `https://secondwind.org/locations/${cityData.slug}` }
  ];

  const locationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": `Sober Living Funding ${cityData.name}, Colorado`,
        "description": cityData.description,
        "provider": {
          "@id": "https://secondwind.org#organization"
        },
        "areaServed": {
          "@type": "City",
          "name": cityData.name,
          "containedIn": {
            "@type": "State",
            "name": "Colorado"
          }
        },
        "serviceType": "Financial Assistance",
        "category": "Recovery Housing"
      },
      {
        "@type": "Place",
        "name": `${cityData.name}, Colorado`,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": cityData.coordinates.lat,
          "longitude": cityData.coordinates.lng
        },
        "containedIn": {
          "@type": "State",
          "name": "Colorado"
        }
      }
    ]
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pt-32 pb-16">
      <SEOHead
        title={`${cityData.name} Sober Living Funding & Recovery Resources | SecondWind`}
        description={`Get sober living rent assistance, rehab transportation, and recovery funding in ${cityData.name}, Colorado. ${cityData.description.substring(0, 120)}...`}
        path={`locations/${cityData.slug}`}
        breadcrumbs={breadcrumbs}
        schema={locationSchema}
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy/40">
            <li><a href="#intro" className="hover:text-brand-teal transition-colors">Home</a></li>
            <li>/</li>
            <li><a href="#partner" className="hover:text-brand-teal transition-colors">Locations</a></li>
            <li>/</li>
            <li className="text-brand-teal">{cityData.name}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={24} className="text-brand-teal" />
            <h1 className="font-display font-bold text-4xl md:text-6xl text-brand-navy">
              Sober Living in {cityData.name}, Colorado
            </h1>
          </div>
          <p className="text-lg text-brand-navy/70 leading-relaxed max-w-3xl">
            {cityData.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-6 rounded-xl border border-brand-navy/5 shadow-sm">
            <div className="flex items-center gap-2 text-brand-navy/40 text-xs font-bold uppercase tracking-widest mb-2">
              <Users size={14} /> Population
            </div>
            <div className="font-display font-bold text-2xl text-brand-navy">{cityData.population}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-brand-navy/5 shadow-sm">
            <div className="flex items-center gap-2 text-brand-navy/40 text-xs font-bold uppercase tracking-widest mb-2">
              <DollarSign size={14} /> Avg Rent
            </div>
            <div className="font-display font-bold text-2xl text-brand-navy">{cityData.avgRent}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-brand-navy/5 shadow-sm">
            <div className="flex items-center gap-2 text-brand-navy/40 text-xs font-bold uppercase tracking-widest mb-2">
              <Building2 size={14} /> Facilities
            </div>
            <div className="font-display font-bold text-2xl text-brand-navy">{cityData.facilities}+</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-brand-navy/5 shadow-sm">
            <div className="flex items-center gap-2 text-brand-navy/40 text-xs font-bold uppercase tracking-widest mb-2">
              <ShieldCheck size={14} /> Active
            </div>
            <div className="font-display font-bold text-2xl text-brand-teal">Yes</div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-12">
          <h2 className="font-display font-bold text-2xl text-brand-navy mb-6">Available Services in {cityData.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cityData.services.map((service, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-brand-navy/5 flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-teal rounded-full"></div>
                <span className="text-brand-navy font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-brand-navy text-white p-8 md:p-12 rounded-2xl text-center">
          <h2 className="font-display font-bold text-3xl mb-4">Ready to Get Help in {cityData.name}?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Apply for sober living funding, rehab transportation, or Medicaid peer coaching. The process takes 10-15 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#apply"
              className="bg-brand-teal text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-teal/90 transition-colors flex items-center justify-center gap-2"
            >
              Apply for Funding <ArrowRight size={20} />
            </a>
            <a
              href="#partner"
              className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              View Facilities <Building2 size={20} />
            </a>
          </div>
        </div>

        {/* Keywords Section (Hidden but crawlable) */}
        <div className="mt-12 text-xs text-brand-navy/30 leading-relaxed">
          <p>
            Keywords: {cityData.keywords.join(', ')}. Sober living {cityData.name.toLowerCase()}, recovery housing {cityData.name.toLowerCase()}, 
            rehab funding {cityData.name.toLowerCase()}, {cityData.name.toLowerCase()} Oxford House, CARR certified {cityData.name.toLowerCase()}, 
            sober living near {cityData.name.toLowerCase()}, {cityData.name.toLowerCase()} recovery resources, 
            {cityData.name.toLowerCase()} addiction treatment funding.
          </p>
        </div>
      </div>
    </div>
  );
};
