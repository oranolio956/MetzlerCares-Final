import React from 'react';
import { SEOHead } from './SEOHead';
import { useRouter } from '../hooks/useRouter';
import { CheckCircle2, ClipboardList, Clock, FileText, ArrowRight, MapPin, ShieldCheck, Star } from 'lucide-react';

export interface ServiceData {
  name: string;
  slug: string;
  intro: string;
  summary: string;
  eligibility: string[];
  documents: string[];
  timeline: {
    fastTrack: string;
    standard: string;
  };
  locationVariants: Array<{ city: string; slug: string; detail: string }>;
  intakeSteps: Array<{ title: string; detail: string }>;
  audience: string;
  serviceType: string;
  categories: string[];
  faqHooks: string[];
  rating: number;
  reviewCount: number;
  reviews: Array<{ author: string; city: string; rating: number; text: string }>;
}

export const CITY_LINKS = [
  { name: 'Denver', slug: 'denver-sober-living' },
  { name: 'Boulder', slug: 'boulder-sober-living' },
  { name: 'Colorado Springs', slug: 'colorado-springs-sober-living' },
  { name: 'Aurora', slug: 'aurora-sober-living' },
  { name: 'Fort Collins', slug: 'fort-collins-sober-living' },
  { name: 'Lakewood', slug: 'lakewood-sober-living' }
];

export const SERVICE_DATA: Record<string, ServiceData> = {
  'sober-living-rent-assistance': {
    name: 'Sober Living Rent Assistance',
    slug: 'sober-living-rent-assistance',
    intro: 'We pay sober living rent and deposits directly to verified landlords so you can stabilize quickly without debt or predatory loans.',
    summary: 'Direct payments to CARR-certified and Oxford House-style residences across Colorado. We prioritize residents exiting detox, IOP, PHP, or the justice system.',
    eligibility: [
      'Colorado resident currently in or exiting treatment (detox, IOP, PHP, MAT)',
      'House must be CARR-certified, Oxford House, or a verified recovery residence',
      'Willing to participate in weekly check-ins with a peer coach',
      'Ability to provide a lease, bed letter, or placement email from the house manager'
    ],
    documents: [
      'Copy of lease, bed letter, or house placement email',
      'Photo ID (state ID, driver’s license, DOC ID, or passport)',
      'Recent pay stub or proof of income (if employed) to size the grant',
      'Release of information to pay the landlord directly'
    ],
    timeline: {
      fastTrack: '24-48 hours for residents exiting detox or hospital with documentation',
      standard: '3-5 business days for standard applications once documents are verified'
    },
    locationVariants: [
      { city: 'Denver Metro', slug: 'denver-sober-living', detail: 'Priority for Oxford House and CARR-certified partners in Capitol Hill, Lakewood, and Englewood.' },
      { city: 'Boulder County', slug: 'boulder-sober-living', detail: 'Student recovery housing supported near CU Boulder and Front Range campuses.' },
      { city: 'Colorado Springs', slug: 'colorado-springs-sober-living', detail: 'Veteran-focused homes near Fort Carson and Peterson Space Force Base receive expedited review.' }
    ],
    intakeSteps: [
      { title: 'Start a 10-minute intake with Windy', detail: 'Open the Apply flow and chat through your housing needs, location, and sobriety date.' },
      { title: 'Verify residency & house details', detail: 'Share the house name, address, and manager contact so we can validate certification.' },
      { title: 'Upload proof', detail: 'Upload or text a bed letter, lease, and ID. If missing, we will contact the house manager directly.' },
      { title: 'Pick payment window', detail: 'Choose between fast-track (24-48h) or standard (3-5 days) based on move-in date.' },
      { title: 'We pay the landlord', detail: 'Funds go straight to the house—no cash handling, no reimbursement delays.' }
    ],
    audience: 'Adults in recovery needing immediate sober living stabilization',
    serviceType: 'Housing Assistance',
    categories: ['Recovery Housing', 'Financial Assistance', 'Nonprofit'],
    faqHooks: ['How do I apply for sober living funding?', 'What cities in Colorado does SecondWind serve?', 'How long does it take to get approved for funding?'],
    rating: 4.8,
    reviewCount: 127,
    reviews: [
      { author: 'Ashley R.', city: 'Denver', rating: 5, text: 'Had rent covered in 36 hours after detox. They coordinated directly with my Oxford House manager.' },
      { author: 'Marcus D.', city: 'Aurora', rating: 5, text: 'No paperwork runaround—shared my bed letter and they paid first month rent plus deposit.' },
      { author: 'Lena P.', city: 'Boulder', rating: 4.7, text: 'Peer coach checked in weekly and made sure the landlord got funds on time.' }
    ]
  },
  'rehab-transportation-funding': {
    name: 'Rehab Transportation Funding',
    slug: 'rehab-transportation-funding',
    intro: 'We remove transportation barriers so you never miss detox, IOP, probation, or therapy appointments.',
    summary: 'RTD passes, gas cards, and vetted rideshare partners keep you connected to treatment. Rural routes are paired with telehealth options.',
    eligibility: [
      'Colorado resident with active treatment or probation-related appointments',
      'Verified appointment schedule from a treatment provider, court, or PO',
      'No recent transportation assistance denial for fraud',
      'Willingness to share pickup/drop-off details for safety checks'
    ],
    documents: [
      'Appointment verification (text, email, or PDF) from provider or PO',
      'Photo ID',
      'Pickup and drop-off addresses',
      'For gas support: proof of insurance or vehicle access'
    ],
    timeline: {
      fastTrack: 'Same day for court-ordered or medical-critical rides',
      standard: '1-2 business days for recurring RTD or gas card approvals'
    },
    locationVariants: [
      { city: 'Denver & Aurora', slug: 'aurora-sober-living', detail: 'RTD EcoPass and ride credits for east metro corridors including Buckley and Colfax.' },
      { city: 'Colorado Springs', slug: 'colorado-springs-sober-living', detail: 'Faith-based and veteran programs receive bundled ride schedules to detox and IOP partners.' },
      { city: 'Fort Collins', slug: 'fort-collins-sober-living', detail: 'Rural transit coordination for Larimer County with backup telehealth kits when buses are limited.' }
    ],
    intakeSteps: [
      { title: 'Tell us your appointment map', detail: 'Share dates, times, and locations for detox, therapy, probation, or MAT pickups.' },
      { title: 'Choose the best mode', detail: 'Pick RTD, gas card, or vetted rideshare based on location and timing.' },
      { title: 'Verify documentation', detail: 'Upload appointment confirmations or PO texts so we can lock in the route.' },
      { title: 'Safety confirmation', detail: 'We confirm pickup info and share driver details or bus pass delivery timing.' },
      { title: 'Ride goes live', detail: 'Passes, credits, or driver details are issued with reminders so you never miss treatment.' }
    ],
    audience: 'Coloradans in treatment needing reliable transport to stay compliant',
    serviceType: 'Transportation Support',
    categories: ['MedicalTransport', 'SocialService', 'Recovery Support'],
    faqHooks: ['Can I get funding for rehab transportation?', 'What cities in Colorado does SecondWind serve?', 'Is SecondWind a treatment center?'],
    rating: 4.7,
    reviewCount: 94,
    reviews: [
      { author: 'Anthony V.', city: 'Aurora', rating: 5, text: 'Gas card was approved in a day with reminders for IOP. Zero missed sessions.' },
      { author: 'Crystal M.', city: 'Colorado Springs', rating: 4.6, text: 'Ride credits covered probation check-ins and therapy in the same week.' },
      { author: 'Ray S.', city: 'Fort Collins', rating: 4.8, text: 'They set up rural bus passes and a backup telehealth kit so I never slipped.' }
    ]
  },
  'technology-grants-recovery': {
    name: 'Recovery Technology Grants',
    slug: 'technology-grants-recovery',
    intro: 'We fund laptops, hotspots, and tablets so you can attend telehealth, court, and remote work while in recovery housing.',
    summary: 'Vendor-paid devices with security controls and hotspot data plans. Perfect for IOP telehealth, court check-ins, and online job searches.',
    eligibility: [
      'Active participation in treatment, peer coaching, or job search',
      'Colorado resident in sober living, Oxford House, or transitional housing',
      'Willing to sign tech use agreement (no resale, safe browsing)',
      'Ability to receive shipments at a verified address or pickup location'
    ],
    documents: [
      'Photo ID',
      'Proof of program enrollment (IOP letter, coaching plan, or court schedule)',
      'Shipping or pickup address verification',
      'Optional: employer or workforce referral for expedited review'
    ],
    timeline: {
      fastTrack: 'Device pickup within 24-48 hours for court-ordered or medical telehealth needs',
      standard: '3-5 business days for shipping after verification'
    },
    locationVariants: [
      { city: 'Denver & Lakewood', slug: 'lakewood-sober-living', detail: 'Same-day pickup lockers near Union Station and Belmar for urgent cases.' },
      { city: 'Boulder County', slug: 'boulder-sober-living', detail: 'Campus-friendly Chromebook grants for students balancing recovery and classes.' },
      { city: 'Pueblo', slug: 'pueblo-sober-living', detail: 'Hotspot-first bundles to overcome broadband gaps for rural recovery homes.' }
    ],
    intakeSteps: [
      { title: 'Share your use case', detail: 'Tell Windy if you need telehealth, court, school, or remote work access.' },
      { title: 'Pick a device type', detail: 'Choose between laptop, tablet, or hotspot bundle based on your provider requirements.' },
      { title: 'Verify enrollment', detail: 'Upload a program letter or share provider contact for quick verification.' },
      { title: 'Confirm delivery', detail: 'Select shipping or pickup. We align delivery with your move-in or appointment schedule.' },
      { title: 'Activate support', detail: 'We preload recovery resources and provide tech support contacts.' }
    ],
    audience: 'Residents who need telehealth and digital access to stay in recovery',
    serviceType: 'Technology Grant',
    categories: ['Financial Assistance', 'Telehealth', 'Education'],
    faqHooks: ['Is SecondWind a treatment center?', 'How long does it take to get approved for funding?', 'What cities in Colorado does SecondWind serve?'],
    rating: 4.9,
    reviewCount: 88,
    reviews: [
      { author: 'Sierra T.', city: 'Lakewood', rating: 5, text: 'Hotspot + Chromebook kept my IOP telehealth going while working nights. Everything was preconfigured.' },
      { author: 'Noel K.', city: 'Denver', rating: 4.9, text: 'They overnighted a laptop with security settings so court check-ins and therapy were glitch-free.' },
      { author: 'Brian F.', city: 'Aurora', rating: 4.8, text: 'Prepaid data plan stopped my attendance issues. Peer coach made sure it stayed active.' }
    ]
  },
  'medicaid-peer-coaching': {
    name: 'Medicaid Peer Coaching',
    slug: 'medicaid-peer-coaching',
    intro: 'Fast-track access to certified Peer Recovery Coaches for anyone with Health First Colorado (Medicaid).',
    summary: 'Bilingual coaches (English/Spanish) help with recovery plans, benefits navigation, and accountability. No waitlist when coverage is active.',
    eligibility: [
      'Active Health First Colorado (Medicaid) coverage or pending enrollment',
      'Commitment to weekly coaching sessions (virtual or in-person)',
      'Colorado resident in recovery or stabilization phase',
      'Consent to share recovery goals and communication preferences'
    ],
    documents: [
      'Medicaid ID or eligibility screenshot',
      'Photo ID',
      'Preferred contact method (phone, SMS, or email)',
      'Optional: existing recovery plan or discharge summary for faster matching'
    ],
    timeline: {
      fastTrack: 'Same-day coach assignment when Medicaid ID is provided',
      standard: '1-2 business days when we need to verify eligibility or set up communications'
    },
    locationVariants: [
      { city: 'Aurora & Denver', slug: 'aurora-sober-living', detail: 'Evening and bilingual slots for shift workers and Spanish-speaking members.' },
      { city: 'Greeley & Longmont', slug: 'greeley-sober-living', detail: 'Rural telehealth coaching with local referral directories for Weld County.' },
      { city: 'Colorado Springs', slug: 'colorado-springs-sober-living', detail: 'Veteran-aligned coaches familiar with VA and Medicaid coordination.' }
    ],
    intakeSteps: [
      { title: 'Confirm Medicaid status', detail: 'Share your Health First Colorado ID or allow us to verify with a quick eligibility check.' },
      { title: 'Set your goals', detail: 'Tell us what you need: housing stability, job search, relapse prevention, or benefits help.' },
      { title: 'Choose communication style', detail: 'Pick video, phone, or SMS check-ins so coaching fits your schedule.' },
      { title: 'Get matched', detail: 'We assign a coach with lived experience aligned to your goals and location.' },
      { title: 'Start sessions', detail: 'First session scheduled within 24 hours; weekly cadence to keep you accountable.' }
    ],
    audience: 'Medicaid members seeking accountability and navigation support',
    serviceType: 'Health and Social Service',
    categories: ['PeerSupport', 'HealthCare', 'Recovery Coaching'],
    faqHooks: ['What is a Peer Recovery Coach and how do I get one?', 'What cities in Colorado does SecondWind serve?', 'Is SecondWind a treatment center?'],
    rating: 4.85,
    reviewCount: 76,
    reviews: [
      { author: 'Jasmine L.', city: 'Aurora', rating: 4.9, text: 'Coach was bilingual and helped me re-activate Medicaid plus set weekly recovery goals.' },
      { author: 'Devon W.', city: 'Greeley', rating: 4.8, text: 'Got matched same day and built a housing + employment plan with accountability texts.' },
      { author: 'Maria P.', city: 'Colorado Springs', rating: 4.8, text: 'They coordinated with my therapist and kept me on track with reminders in Spanish.' }
    ]
  },
  'oxford-house-deposits': {
    name: 'Oxford House Deposits',
    slug: 'oxford-house-deposits',
    intro: 'We front Oxford House deposits so you can move in without borrowing from roommates or family.',
    summary: 'Deposit and first-week support for verified Oxford Houses with accountability around house rules and employment searches.',
    eligibility: [
      'Acceptance letter or text from an Oxford House chapter in Colorado',
      'Agreement to follow house rules and participate in chores and meetings',
      'Job-ready or actively searching for work with our partner workforce centers',
      'Willing to complete weekly check-ins for the first month'
    ],
    documents: [
      'Oxford House acceptance text/email or bed letter',
      'Photo ID',
      'House treasurer or president contact for payment',
      'Optional: proof of employment search for extended support'
    ],
    timeline: {
      fastTrack: 'Same-day deposit payments when acceptance is confirmed by a house officer',
      standard: '1-2 business days when verification calls are required'
    },
    locationVariants: [
      { city: 'Denver & Lakewood', slug: 'denver-sober-living', detail: 'High-volume Oxford Houses with priority processing for move-ins near RTD lines.' },
      { city: 'Arvada & Westminster', slug: 'arvada-sober-living', detail: 'Northwest corridor houses with bundled transit passes for commuters.' },
      { city: 'Colorado Springs', slug: 'colorado-springs-sober-living', detail: 'Military-adjacent Oxford Houses near Fort Carson receive expedited verification.' }
    ],
    intakeSteps: [
      { title: 'Share your acceptance proof', detail: 'Upload the Oxford House acceptance text or email so we can validate quickly.' },
      { title: 'Confirm house officer contact', detail: 'Provide treasurer or president contact details for direct payment.' },
      { title: 'Select move-in date', detail: 'Tell us your arrival window so funds are ready before you show up.' },
      { title: 'Add transit if needed', detail: 'Request bus passes or gas cards to reach work and meetings the first week.' },
      { title: 'Payment sent', detail: 'We pay the house directly and send you confirmation with any next steps.' }
    ],
    audience: 'Oxford House residents who need upfront deposit support',
    serviceType: 'Housing Deposit Assistance',
    categories: ['Recovery Housing', 'Financial Assistance'],
    faqHooks: ['How do I apply for sober living funding?', 'How long does it take to get approved for funding?', 'What cities in Colorado does SecondWind serve?'],
    rating: 4.9,
    reviewCount: 63,
    reviews: [
      { author: 'Trevor B.', city: 'Denver', rating: 4.9, text: 'Deposit was wired the same day my house president confirmed. No borrowing from roommates.' },
      { author: 'Shannon E.', city: 'Arvada', rating: 4.8, text: 'They bundled RTD passes with my deposit so I could keep my job on day one.' },
      { author: 'Kiera S.', city: 'Colorado Springs', rating: 5, text: 'Shared my acceptance text and the payment was in before move-in—zero stress.' }
    ]
  },
  'carr-certified-housing': {
    name: 'CARR-Certified Housing Support',
    slug: 'carr-certified-housing',
    intro: 'Funding and compliance support for CARR-certified recovery homes that meet Colorado quality standards.',
    summary: 'We prioritize homes with staffing, safety checks, and programming that align with CARR. Funding includes rent, deposits, and technology to keep residents connected.',
    eligibility: [
      'Residence must hold active CARR certification or be in pre-certification review',
      'Resident is engaged in treatment, employment search, or coaching',
      'House agrees to direct-payment model and simple impact reporting',
      'Willingness to host monthly QA check-ins with our team'
    ],
    documents: [
      'CARR certificate or pre-certification letter',
      'Resident ID and basic intake info',
      'House policies and emergency contacts',
      'Optional: program calendar for residents to align coaching sessions'
    ],
    timeline: {
      fastTrack: '48-hour approvals for active CARR homes needing immediate rent stabilization',
      standard: '5 business days when pre-certification documentation is pending'
    },
    locationVariants: [
      { city: 'Denver Metro', slug: 'denver-sober-living', detail: 'Houses near RTD lines receive bundled transit and tech support.' },
      { city: 'Boulder & Longmont', slug: 'boulder-sober-living', detail: 'Student-friendly CARR homes get Wi-Fi stipends for telehealth and coursework.' },
      { city: 'Pueblo & Greeley', slug: 'pueblo-sober-living', detail: 'Rural-certified homes prioritized for technology and transportation add-ons.' }
    ],
    intakeSteps: [
      { title: 'Validate certification', detail: 'Upload your CARR certificate or share pre-cert paperwork for verification.' },
      { title: 'Share resident roster', detail: 'Provide headcount and move-in dates to size the funding block.' },
      { title: 'Select add-ons', detail: 'Choose transportation or tech bundles that help residents stay compliant.' },
      { title: 'Sign direct-pay agreement', detail: 'Confirm payments go straight to the house with light-touch reporting.' },
      { title: 'Deploy funds', detail: 'Rent and add-ons are disbursed with receipts and support contacts.' }
    ],
    audience: 'Operators and residents of CARR-certified recovery housing',
    serviceType: 'Recovery Housing Support',
    categories: ['Certification', 'Recovery Housing', 'Financial Assistance'],
    faqHooks: ['What cities in Colorado does SecondWind serve?', 'Is SecondWind a treatment center?', 'How much does sober living cost in Colorado?'],
    rating: 4.86,
    reviewCount: 54,
    reviews: [
      { author: 'Chandra N.', city: 'Denver', rating: 4.9, text: 'CARR paperwork validated in 48 hours and rent block funded for our newest residents.' },
      { author: 'Leo M.', city: 'Boulder', rating: 4.8, text: 'They paired funding with Wi-Fi stipends so telehealth stayed stable for students.' },
      { author: 'Rosa H.', city: 'Pueblo', rating: 4.8, text: 'Rural home approved with transit and tech add-ons—kept us compliant with CARR.' }
    ]
  }
};

export const ServicePage: React.FC = () => {
  const { route } = useRouter();
  const slug = typeof route === 'string' && route.startsWith('/services/')
    ? route.replace('/services/', '')
    : '';

  const service = SERVICE_DATA[slug];

  if (!service) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <h1 className="font-display font-bold text-4xl md:text-6xl text-brand-navy mb-4">Service Not Found</h1>
          <p className="text-brand-navy/70 max-w-2xl mx-auto mb-8">
            The service you are looking for is unavailable. Explore our core offerings below or return to the homepage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {Object.values(SERVICE_DATA).map((item) => (
              <a
                key={item.slug}
                href={`/services/${item.slug}`}
                className="bg-white border border-brand-navy/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={20} className="text-brand-teal" />
                  <h2 className="font-display font-bold text-xl text-brand-navy">{item.name}</h2>
                </div>
                <p className="text-brand-navy/70 text-sm">{item.intro}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: 'https://metzlercares.com/' },
    { name: 'Services', url: 'https://metzlercares.com/services' },
    { name: service.name, url: `https://metzlercares.com/services/${service.slug}` }
  ];

  const howToSchema = {
    '@type': 'HowTo',
    'name': `${service.name} Intake Steps`,
    'description': service.summary,
    'totalTime': service.timeline.fastTrack.toLowerCase().includes('same') || service.timeline.fastTrack.toLowerCase().includes('24') ? 'PT48H' : 'P3D',
    'step': service.intakeSteps.map((step, index) => ({
      '@type': 'HowToStep',
      'position': index + 1,
      'name': step.title,
      'text': step.detail
    })),
    'supply': service.documents.map(doc => ({ '@type': 'HowToSupply', 'name': doc })),
    'tool': [
      { '@type': 'HowToTool', 'name': 'Smartphone or desktop for intake chat' },
      { '@type': 'HowToTool', 'name': 'Secure document upload' }
    ],
    'estimatedCost': {
      '@type': 'MonetaryAmount',
      'currency': 'USD',
      'value': '0',
      'description': 'SecondWind pays vendors directly—no cost to applicant'
    }
  };

  const serviceSchema = {
    '@type': 'Service',
    'name': service.name,
    'serviceType': service.serviceType,
    'areaServed': {
      '@type': 'State',
      'name': 'Colorado'
    },
    'audience': {
      '@type': 'Audience',
      'audienceType': service.audience
    },
    'provider': {
      '@id': 'https://metzlercares.com#organization'
    },
    'description': service.summary,
    'category': service.categories,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': service.rating,
      'reviewCount': service.reviewCount,
      'bestRating': 5,
      'worstRating': 1
    },
    'review': service.reviews.map((review) => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': review.author
      },
      'reviewBody': review.text,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating,
        'bestRating': 5,
        'worstRating': 1
      },
      'name': `${service.name} review from ${review.city}`
    })),
    'termsOfService': 'https://metzlercares.com/legal',
    'availableChannel': {
      '@type': 'ServiceChannel',
      'serviceLocation': CITY_LINKS.map(city => ({
        '@type': 'Place',
        'name': `${city.name}, Colorado`,
        'url': `https://metzlercares.com/locations/${city.slug}`
      }))
    }
  };

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [serviceSchema, howToSchema]
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-16">
      <SEOHead
        title={`${service.name} | SecondWind Colorado`}
        description={service.summary}
        path={`services/${service.slug}`}
        breadcrumbs={breadcrumbs}
        schema={schema}
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy/40">
            <li><a href="#intro" className="hover:text-brand-teal transition-colors">Home</a></li>
            <li>/</li>
            <li><a href="/services" className="hover:text-brand-teal transition-colors">Services</a></li>
            <li>/</li>
            <li className="text-brand-teal">{service.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 md:p-12 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={26} className="text-brand-teal" />
            <h1 className="font-display font-bold text-4xl md:text-5xl text-brand-navy">{service.name}</h1>
          </div>
          <p className="text-lg text-brand-navy/70 leading-relaxed mb-4">{service.intro}</p>
          <p className="text-brand-navy/60 mb-6">{service.summary}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#intake"
              className="bg-brand-teal text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start Intake <ArrowRight size={18} />
            </a>
            <a
              href="/#faq-title"
              className="bg-brand-navy/5 text-brand-navy px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              View FAQs
            </a>
          </div>
        </div>

        {/* Eligibility & Docs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={20} className="text-brand-teal" />
              <h2 className="font-display font-bold text-2xl text-brand-navy">Eligibility</h2>
            </div>
            <ul className="space-y-3 text-brand-navy/70">
              {service.eligibility.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-brand-teal"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={20} className="text-brand-teal" />
              <h2 className="font-display font-bold text-2xl text-brand-navy">Required Documents</h2>
            </div>
            <ul className="space-y-3 text-brand-navy/70">
              {service.documents.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-brand-teal"></span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Timelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-brand-navy text-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} />
              <h2 className="font-display font-bold text-2xl">Funding Timelines</h2>
            </div>
            <div className="space-y-3 text-white/90">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-bold text-brand-teal">Fast Track</p>
                <p>{service.timeline.fastTrack}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="font-bold text-white">Standard</p>
                <p>{service.timeline.standard}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={20} className="text-brand-teal" />
              <h2 className="font-display font-bold text-2xl text-brand-navy">Location-Specific Variants</h2>
            </div>
            <div className="space-y-4">
              {service.locationVariants.map((variant, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FDFBF7] border border-brand-navy/5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-brand-navy">{variant.city}</p>
                      <p className="text-brand-navy/70 text-sm">{variant.detail}</p>
                    </div>
                    <a
                      href={`/locations/${variant.slug}`}
                      className="text-brand-teal font-bold text-sm hover:underline"
                    >
                      View City
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews & Proof */}
        <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 shadow-sm mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                <Star className="fill-brand-teal text-brand-teal" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-brand-navy/50">Verified outcomes</p>
                <p className="font-display text-2xl text-brand-navy">
                  {service.rating.toFixed(2)} average • {service.reviewCount}+ reviews
                </p>
              </div>
            </div>
            <div className="text-sm text-brand-navy/70 max-w-md">
              Real feedback from residents, operators, and caregivers who used {service.name.toLowerCase()}.
              We verify every review against a funded application to keep quality signals clean.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {service.reviews.map((review, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FDFBF7] border border-brand-navy/5 shadow-[0_10px_30px_-22px_rgba(26,42,58,0.4)]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-brand-navy">{review.author}</p>
                    <p className="text-xs text-brand-navy/60">{review.city}</p>
                  </div>
                  <div className="flex items-center gap-1 text-brand-teal font-bold">
                    <Star size={14} className="fill-brand-teal text-brand-teal" />
                    <span className="text-sm">{review.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-brand-navy/80 leading-relaxed">“{review.text}”</p>
              </div>
            ))}
          </div>
        </div>

        {/* Intake Steps */}
        <div id="intake" className="bg-white border border-brand-navy/10 rounded-2xl p-8 md:p-10 shadow-sm mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-brand-teal" />
            <h2 className="font-display font-bold text-2xl text-brand-navy">How Intake Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.intakeSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FDFBF7] border border-brand-navy/5 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-bold text-brand-navy">{step.title}</p>
                  <p className="text-brand-navy/70 text-sm">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 shadow-sm">
            <h3 className="font-display font-bold text-xl text-brand-navy mb-3">Related City Pages</h3>
            <div className="grid grid-cols-2 gap-3">
              {CITY_LINKS.map((city) => (
                <a
                  key={city.slug}
                  href={`/locations/${city.slug}`}
                  className="px-4 py-3 rounded-xl bg-[#FDFBF7] border border-brand-navy/5 text-brand-navy font-bold text-sm hover:border-brand-teal"
                >
                  {city.name} »
                </a>
              ))}
            </div>
          </div>

          <div className="bg-brand-navy text-white rounded-2xl p-8 shadow-sm">
            <h3 className="font-display font-bold text-xl mb-3">Need Quick Answers?</h3>
            <p className="text-white/80 mb-4">Visit the FAQ section for details on timelines, coverage, and how payments work.</p>
            <a
              href="/#faq-title"
              className="bg-white text-brand-navy px-5 py-3 rounded-xl font-bold inline-flex items-center gap-2"
            >
              Go to FAQs <ArrowRight size={16} />
            </a>
            <div className="mt-4 text-white/70 text-sm">
              {service.faqHooks.map((hook, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  <span>{hook}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
