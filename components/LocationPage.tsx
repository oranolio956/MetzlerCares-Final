import React from 'react';
import { MapPin, Building2, Users, DollarSign, ArrowRight, Phone, Clock, ShieldCheck, Star, Play } from 'lucide-react';
import { SEOHead } from './SEOHead';
import { useRouter } from '../hooks/useRouter';
import { useStore } from '../context/StoreContext';

interface CityData {
  name: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  population: string;
  avgRent: string;
  facilities: number;
  services: string[];
  keywords: string[];
  coordinates: { lat: number; lng: number };
  video?: { title: string; url: string; description: string; thumbnailUrl: string };
}

export const CITY_DATA: Record<string, CityData> = {
  'denver-sober-living': {
    name: 'Denver',
    slug: 'denver-sober-living',
    description: "Denver is Colorado's largest city and recovery hub, with the highest concentration of sober living homes, IOP programs, and recovery resources. SecondWind actively funds rent assistance, rehab transportation, and technology grants across Denver Metro including Capitol Hill, RiNo, Highlands, Aurora, Lakewood, and Englewood.",
    metaTitle: 'Denver Sober Living Funding | Same-Week Rent & Transit for Recovery',
    metaDescription: 'Apply for sober living rent, RTD passes, and tech grants in Denver. We fund verified vendors so you keep your bed and hit clinical milestones.',
    population: '715,000+',
    avgRent: '$600-$800/month',
    facilities: 45,
    services: ['Sober Living Rent Assistance', 'RTD Bus Passes', 'IOP Technology Grants', 'Felon-Friendly Job Placement', 'Medicaid Peer Coaching'],
    keywords: ['Denver sober living', 'Denver recovery housing', 'Denver rehab funding', 'Denver Oxford House', 'Denver CARR certified'],
    coordinates: { lat: 39.7392, lng: -104.9903 },
    video: {
      title: 'How Denver members keep their beds funded',
      url: 'https://www.youtube.com/embed/E7wJTI-1dvQ',
      description: 'Walkthrough of a Denver member securing sober living funding and RTD access in under a week.',
      thumbnailUrl: 'https://img.youtube.com/vi/E7wJTI-1dvQ/hqdefault.jpg'
    }
  },
  'boulder-sober-living': {
    name: 'Boulder',
    slug: 'boulder-sober-living',
    description: 'Boulder County offers a unique recovery environment combining outdoor therapy with clinical excellence. SecondWind funds student recovery housing, rehab bus passes, addiction recovery coaching, and Medicaid enrollment support in Boulder, Longmont, Lafayette, Louisville, and Superior.',
    metaTitle: 'Boulder Sober Living Scholarships | Fund Housing + Transit Near Campus',
    metaDescription: 'Student-focused sober living and transit funding in Boulder County. Secure housing, RTD passes, and coaching that keeps you close to campus and the mountains.',
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
    metaTitle: 'Colorado Springs Sober Living Aid | Veteran-Ready Funding & Transport',
    metaDescription: 'Cover sober living rent, ride credits, and ID replacement in Colorado Springs. Veteran and faith-based homes get priority verification.',
    population: '478,000+',
    avgRent: '$500-$700/month',
    facilities: 18,
    services: ['Veteran Recovery Aid', 'Faith-Based Sober Living Funding', 'Employment Tools', 'ID Replacement', 'Rehab Transportation'],
    keywords: ['Colorado Springs sober living', 'Colorado Springs recovery housing', 'Colorado Springs rehab funding', 'Colorado Springs Oxford House'],
    coordinates: { lat: 38.8339, lng: -104.8214 },
    video: {
      title: 'Colorado Springs veteran ride + rent story',
      url: 'https://www.youtube.com/embed/ysz5S6PUM-U',
      description: 'A veteran keeps her sober living bed while ride credits cover IOP and MAT appointments.',
      thumbnailUrl: 'https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg'
    }
  },
  'aurora-sober-living': {
    name: 'Aurora',
    slug: 'aurora-sober-living',
    description: 'Aurora is Denver\'s largest suburb with growing recovery resources. SecondWind funds sober living deposits, first month rent, and gap funding for CARR-certified homes in Aurora\'s Del Mar, Buckley, and Smoky Hill neighborhoods.',
    metaTitle: 'Aurora Sober Living Funding | Deposits & First Month Covered',
    metaDescription: 'Bridge deposits and first month rent for Aurora sober living so you can move in without losing your job start date.',
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
    metaTitle: 'Fort Collins Recovery Transit | Rural Sober Living Funding',
    metaDescription: 'Rural Larimer County residents can fund Oxford House deposits, laptops, and transit to detox or IOP without losing work shifts.',
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
    metaTitle: 'Lakewood Sober Living Grants | Jefferson County Coverage',
    metaDescription: 'Fund rent, rehab rides, and tech in Lakewood so you can stay close to Jefferson County treatment and employment.',
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
    metaTitle: 'Westminster Sober Living Deposits | Keep Your Front Range Bed',
    metaDescription: 'Secure deposits and first-month rent in Westminster so you can access Denver and Boulder treatment without losing housing.',
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
    metaTitle: 'Arvada Sober Living Rent | Family-Friendly Funding',
    metaDescription: 'Fund rent, rides, and tech for Arvada sober living so you can focus on family reconnection and employment.',
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
    metaTitle: 'Thornton Sober Living Funding | North Metro Move-Ins Covered',
    metaDescription: 'Adams County residents can secure sober living deposits, rides, and first-month rent so treatment schedules stay on track.',
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
    metaTitle: 'Pueblo Sober Living Grants | Southern Colorado Funding',
    metaDescription: 'Cover rent, groceries, and rides for Pueblo sober living while you stabilize employment and family routines.',
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
    metaTitle: 'Greeley Recovery Housing | Oxford House Deposits & Rural Transit',
    metaDescription: 'Weld County residents can fund Oxford House deposits, rural transit, and telehealth gear without leaving work or treatment.',
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
    metaTitle: 'Longmont Sober Living Funding | Keep Work + Recovery Balanced',
    metaDescription: 'Secure rent, transit, and tech in Longmont so you can keep working while attending Boulder County treatment.',
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
    metaTitle: 'Broomfield Sober Living Deposits | Front Range Bridge Funding',
    metaDescription: 'Between Denver and Boulder? We bridge deposits, first month rent, and rides for Broomfield sober living move-ins.',
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
    metaTitle: 'Littleton Sober Living Rent | South Metro Funding',
    metaDescription: 'Arapahoe County residents can fund sober living rent, rides, and tech in Littleton without pausing treatment.',
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
    metaTitle: 'Englewood Sober Living Funding | Move-In + Gap Support',
    metaDescription: 'Cover deposits, first month rent, and rides in Englewood so you can stay employed while stabilizing recovery.',
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
  const { reviews } = useStore();
  
  // Extract location slug from route (e.g., "locations/denver-sober-living")
  const locationSlug = route.replace('locations/', '');
  const cityData = CITY_DATA[locationSlug];

  const cityReviews = reviews.filter(review => review.citySlug === locationSlug);
  const globalAverage = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '4.8';
  const averageRating = cityReviews.length
    ? (cityReviews.reduce((sum, review) => sum + review.rating, 0) / cityReviews.length).toFixed(1)
    : globalAverage;

  const featuredReviews = cityReviews.slice(0, 3);

  const reviewVideo = (() => {
    if (cityData?.video) return cityData.video;
    const testimonialWithVideo = cityReviews.find(review => review.videoUrl);
    if (!testimonialWithVideo) return undefined;
    const match = testimonialWithVideo.videoUrl?.match(/embed\/([\w-]+)/);
    const videoId = match?.[1];
    return {
      title: `${testimonialWithVideo.name}'s walkthrough`,
      url: testimonialWithVideo.videoUrl,
      description: testimonialWithVideo.summary,
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined
    };
  })();

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

  const reviewSchema = featuredReviews.map(review => ({
    "@type": "Review",
    "name": review.summary,
    "reviewBody": review.quote,
    "author": { "@type": "Person", "name": review.name },
    "datePublished": review.date,
    "reviewRating": { "@type": "Rating", "ratingValue": review.rating, "bestRating": "5" },
    "itemReviewed": {
      "@type": "Service",
      "name": `Sober Living Funding ${cityData.name}`,
      "areaServed": { "@type": "City", "name": cityData.name }
    }
  }));

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
        "category": "Recovery Housing",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": averageRating,
          "reviewCount": cityReviews.length || reviews.length
        }
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
      },
      {
        "@type": "AggregateRating",
        "ratingValue": averageRating,
        "reviewCount": cityReviews.length || reviews.length,
        "itemReviewed": `https://secondwind.org/locations/${cityData.slug}`
      },
      ...reviewSchema,
      ...(reviewVideo
        ? [{
            "@type": "VideoObject",
            "name": reviewVideo.title,
            "description": reviewVideo.description,
            "thumbnailUrl": reviewVideo.thumbnailUrl || 'https://secondwind.org/social-card.svg',
            "uploadDate": cityReviews[0]?.date || '2024-11-01',
            "embedUrl": reviewVideo.url,
            "contentUrl": reviewVideo.url
          }]
        : [])
    ]
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pt-32 pb-16">
      <SEOHead
        title={cityData.metaTitle}
        description={cityData.metaDescription}
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

        {/* Testimonials & Reviews */}
        <div className="mb-12 grid lg:grid-cols-[1.6fr,1fr] gap-6 items-start">
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-navy/50">
                  <Star className="text-brand-yellow" size={16} />
                  Verified Stories
                </div>
                <h3 className="font-display font-bold text-2xl text-brand-navy">{cityData.name} community proof</h3>
              </div>
              <div className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-full shadow-sm">
                <Star size={16} className="text-brand-yellow fill-brand-yellow" />
                <span className="font-bold text-lg">{averageRating}</span>
                <span className="text-white/70 text-sm">({cityReviews.length || reviews.length} reviews)</span>
              </div>
            </div>

            <p className="text-brand-navy/60 mb-4">Direct quotes from residents and partners funded in {cityData.name}. We verify every testimonial before featuring it.</p>

            <div className="grid md:grid-cols-3 gap-4">
              {featuredReviews.length > 0 ? (
                featuredReviews.map(review => (
                  <article key={review.id} className="p-4 rounded-xl border border-brand-navy/10 bg-brand-navy/2">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-brand-navy">{review.name}</p>
                        <p className="text-xs uppercase tracking-widest text-brand-navy/40">{review.role}</p>
                      </div>
                      <div className="flex items-center gap-1 text-brand-yellow font-bold">
                        <Star size={14} className="fill-brand-yellow" />
                        <span>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-brand-navy/70 text-sm leading-relaxed">{review.quote}</p>
                    <p className="text-xs text-brand-navy/50 mt-3 font-semibold">{review.service}</p>
                  </article>
                ))
              ) : (
                <div className="md:col-span-3 p-4 bg-brand-navy/5 rounded-xl border border-brand-navy/10 text-brand-navy/70">
                  We have reviews live for this city, but none surfaced yet. Submit yours to help neighbors see what funding looks like in practice.
                </div>
              )}
            </div>
          </div>

          {reviewVideo && (
            <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-navy/50 mb-2">
                <Play size={16} /> Video walkthrough
              </div>
              <h4 className="font-display font-bold text-xl text-brand-navy mb-2">{reviewVideo.title}</h4>
              <p className="text-brand-navy/60 text-sm mb-4">{reviewVideo.description}</p>
              <div className="rounded-xl overflow-hidden border border-brand-navy/10 shadow-lg aspect-video">
                <iframe
                  src={reviewVideo.url}
                  title={reviewVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
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
