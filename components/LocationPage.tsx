import React from 'react';
import { MapPin, Building2, Users, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react';
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
  neighborhoodHighlights: string[];
  transit: string;
  partnerOrgs: string[];
  proofPoints: { title: string; detail: string }[];
  testimonial: { quote: string; name: string; role: string };
  mapEmbedUrl: string;
  nearby: string[];
  localStats: { label: string; value: string; context?: string }[];
}

const CITY_DATA: Record<string, CityData> = {
  'denver-sober-living': {
    name: 'Denver',
    slug: 'denver-sober-living',
    description:
      "Denver is Colorado's largest recovery hub with the highest concentration of sober living homes, IOP partners, and Medicaid-friendly options. SecondWind funds rent assistance, transit passes, and technology grants across Capitol Hill, Five Points, Colfax, Aurora, Lakewood, and Englewood to keep people stably housed near care.",
    population: '715,000+',
    avgRent: '$600-$800/month',
    facilities: 45,
    services: [
      'Rent relief for CARR-certified Denver homes',
      'RTD bus/light rail passes for IOP/IOC visits',
      'Laptop and hotspot grants for telehealth',
      'Felon-friendly job placement coaching',
      'Medicaid enrollment and peer coaching',
      'Emergency deposits for Oxford House move-ins'
    ],
    keywords: [
      'Denver sober living',
      'Denver recovery housing',
      'Denver rehab funding',
      'Denver Oxford House',
      'Denver CARR certified'
    ],
    coordinates: { lat: 39.7392, lng: -104.9903 },
    neighborhoodHighlights: [
      'Capitol Hill, Colfax, and Five Points shared housing with quick access to detox centers',
      'RiNo and Aurora A-Line corridor homes for clients working downtown or DIA',
      'Lakewood and Littleton MAT-friendly houses for families rebuilding stability'
    ],
    transit:
      'RTD A, D, F, H, and W lines plus 15/15L Colfax and 0/0L Broadway buses for consistent IOP access without a vehicle.',
    partnerOrgs: [
      'Colorado Coalition for the Homeless',
      'Second Chance Center Denver',
      'Sobriety House',
      'Denver Rescue Mission Peer Recovery'
    ],
    proofPoints: [
      { title: '$220k+ rent relief delivered', detail: '2024 Denver Metro stipends covered 310 weeks of sober living.' },
      { title: 'Transit coverage', detail: '175 RTD passes issued in the last quarter for IOP and job interviews.' },
      { title: 'Tech-enabled care', detail: 'Telehealth laptops and hotspots deployed in RiNo and Capitol Hill houses.' }
    ],
    testimonial: {
      quote:
        'SecondWind covered my Oxford House deposit near Colfax and kept my IOP ride covered until I got back to work. I felt backed the whole time.',
      name: 'Marcus T.',
      role: 'Denver resident in long-term recovery'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Denver%20CO%20sober%20living&z=12&output=embed',
    nearby: ['aurora-sober-living', 'lakewood-sober-living', 'arvada-sober-living', 'westminster-sober-living', 'littleton-sober-living'],
    localStats: [
      { label: 'Average move-in time', value: '4.2 days', context: 'from approval to keys for funded clients' },
      { label: 'Neighborhood coverage', value: '6 metro areas', context: 'Capitol Hill, RiNo, Aurora, Lakewood, Littleton, Englewood' },
      { label: 'Weekly referrals', value: '18+', context: 'from detox, sober companions, and MAT clinics' }
    ]
  },
  'boulder-sober-living': {
    name: 'Boulder',
    slug: 'boulder-sober-living',
    description:
      'Boulder County blends outdoor therapy with campus recovery culture. SecondWind funds student-friendly recovery housing, RTD bus passes, and coaching across University Hill, North Boulder, and Longmont to keep people close to CU clinics and outpatient partners.',
    population: '108,000+',
    avgRent: '$700-$900/month',
    facilities: 12,
    services: [
      'Student recovery housing stipends near CU Boulder',
      'RTD SKIP/BOLT passes for therapy and work',
      'Mountain-based recovery coaching weekends',
      'Medicaid enrollment and technology grants',
      'Family re-entry planning with local counselors'
    ],
    keywords: ['Boulder sober living', 'Boulder recovery housing', 'Boulder rehab funding', 'Boulder Oxford House', 'Boulder CARR certified'],
    coordinates: { lat: 40.015, lng: -105.2705 },
    neighborhoodHighlights: [
      'University Hill and Goss-Grove student-friendly recovery houses',
      'North Boulder and Iris corridor homes near outpatient clinics',
      'Longmont and Louisville options for commuters working in Boulder'
    ],
    transit:
      'RTD SKIP, Bolt, and FF routes connect sober living to CU campus services, Foothills Medical, and Louisville/Lafayette employers.',
    partnerOrgs: ['CU Collegiate Recovery Center', 'Mental Health Partners', 'Boulder Bridge House Ready to Work', 'Longmont Recovery Café'],
    proofPoints: [
      { title: 'Campus linkage', detail: 'Fast-track aid for students completing CARE team recommendations.' },
      { title: 'Outdoor recovery', detail: 'Funded sober hiking and service outings twice monthly for Boulder clients.' },
      { title: 'Deposit flexibility', detail: 'Emergency deposits paid within 24 hours for Goss-Grove move-ins.' }
    ],
    testimonial: {
      quote: 'Getting the SKIP pass funded meant I never missed IOP even without a car. The tech grant let me keep telehealth while working.',
      name: 'Alyssa R.',
      role: 'Boulder County client'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Boulder%20CO%20sober%20living&z=12&output=embed',
    nearby: ['longmont-sober-living', 'broomfield-sober-living', 'denver-sober-living'],
    localStats: [
      { label: 'Student placements', value: '42', context: 'CU and FRCC students housed in the last 12 months' },
      { label: 'Average stipend', value: '$725', context: 'per month toward Boulder County rent gaps' },
      { label: 'Transit-funded rides', value: '95', context: 'RTD trips covered for IOP and MAT follow-ups quarterly' }
    ]
  },
  'colorado-springs-sober-living': {
    name: 'Colorado Springs',
    slug: 'colorado-springs-sober-living',
    description:
      'Colorado Springs serves a large veteran population and faith-based recovery community. SecondWind provides veteran recovery aid, faith-friendly sober living deposits, employment tools, and ID replacement services around Downtown, Manitou Springs, Security-Widefield, and Fountain.',
    population: '478,000+',
    avgRent: '$500-$700/month',
    facilities: 18,
    services: [
      'Veteran-focused sober living stipends near Fort Carson',
      'Faith-based house deposits and program gap funding',
      'Mountain Metro passes and rideshare credits for treatment',
      'Employment tools, IDs, and work gear replacements',
      'Medicaid peer coaching and telehealth access kits'
    ],
    keywords: ['Colorado Springs sober living', 'Colorado Springs recovery housing', 'Colorado Springs rehab funding', 'Colorado Springs Oxford House'],
    coordinates: { lat: 38.8339, lng: -104.8214 },
    neighborhoodHighlights: [
      'Downtown and South Nevada Avenue homes close to detox and day programs',
      'Manitou Springs and Old Colorado City houses for clients pairing nature therapy with IOP',
      'Security-Widefield and Fountain placements for military families near Fort Carson'
    ],
    transit: 'Mountain Metro routes 1, 3, 5, and 10 plus VA shuttle connections to keep veteran clients on schedule.',
    partnerOrgs: ['Springs Rescue Mission', 'Mt. Carmel Veterans Service Center', 'Crossroads Turning Points', 'Homeward Pikes Peak'],
    proofPoints: [
      { title: 'Veteran retention', detail: '84% of veteran clients maintained housing for 90+ days with our stipends.' },
      { title: 'Rapid ID recovery', detail: 'Replacement IDs sourced in 72 hours so clients could start work quickly.' },
      { title: 'Faith integration', detail: 'Funded 11 faith-friendly homes with pastoral counseling partnerships.' }
    ],
    testimonial: {
      quote: 'They covered my first month near Fort Carson and even paid for work boots. I never missed group because the bus pass was ready day one.',
      name: 'Jermaine L.',
      role: 'Army veteran in outpatient care'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Colorado%20Springs%20CO%20recovery%20housing&z=12&output=embed',
    nearby: ['pueblo-sober-living', 'denver-sober-living', 'aurora-sober-living'],
    localStats: [
      { label: 'Veteran households', value: '63', context: 'receiving sustained rent aid this year' },
      { label: 'Faith-based partners', value: '9', context: 'programs aligned with sober living standards' },
      { label: 'Average work start', value: '6 days', context: 'from move-in to first paycheck with gear covered' }
    ]
  },
  'aurora-sober-living': {
    name: 'Aurora',
    slug: 'aurora-sober-living',
    description:
      "Aurora is Denver's largest suburb with diverse recovery resources. SecondWind funds sober living deposits, first month rent, and gap support for CARR-certified homes in Del Mar, Havana, Buckley, and Smoky Hill while coordinating transit to Anschutz and Fitzsimons clinics.",
    population: '387,000+',
    avgRent: '$550-$750/month',
    facilities: 8,
    services: [
      'Sober living deposits and first month rent',
      'RTD R Line and Colfax rapid bus passes for treatment',
      'CARR-certified housing gap funding and inspections',
      'Medicaid peer coaching and bilingual navigation',
      'Laptop hotspots for Anschutz telehealth follow-ups'
    ],
    keywords: ['Aurora sober living', 'Aurora recovery housing', 'Aurora rehab funding', 'Aurora Oxford House'],
    coordinates: { lat: 39.7294, lng: -104.8319 },
    neighborhoodHighlights: [
      'Del Mar and Colfax corridor homes close to detox and day programs',
      'Buckley and Havana placements for aerospace and DIA workers',
      'Southlands and Smoky Hill homes for families balancing school and recovery'
    ],
    transit: 'RTD R Line rail, 15/15L Colfax, and 121/131 bus routes provide car-free links to Anschutz, Fitzsimons, and downtown Denver.',
    partnerOrgs: ['Aurora Mental Health & Recovery', 'Comitis Crisis Center', 'Colorado Access', 'Second Chance Center Aurora'],
    proofPoints: [
      { title: 'Healthcare proximity', detail: 'Average transit time to Anschutz-funded clinics: 22 minutes door to door.' },
      { title: 'Bilingual navigation', detail: 'Spanish-speaking peer coaches staffed five days a week for Aurora residents.' },
      { title: 'Deposit turnaround', detail: 'Colfax and Del Mar homes funded within 36 hours of referral approval.' }
    ],
    testimonial: {
      quote: 'I got placed near Fitzsimons so I could keep chemo and IOP on the same campus. The R Line pass kept every appointment on time.',
      name: 'Daniela M.',
      role: 'Aurora client managing dual diagnoses'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Aurora%20CO%20sober%20living&z=12&output=embed',
    nearby: ['denver-sober-living', 'lakewood-sober-living', 'englewood-sober-living', 'littleton-sober-living'],
    localStats: [
      { label: 'Hospitals served', value: '3', context: 'Anschutz, Fitzsimons, and Lowry clinics within transit routes' },
      { label: 'Average deposit', value: '$575', context: 'paid toward Aurora move-ins' },
      { label: 'Transit funding', value: '140+', context: 'R Line and Colfax passes issued annually' }
    ]
  },
  'fort-collins-sober-living': {
    name: 'Fort Collins',
    slug: 'fort-collins-sober-living',
    description:
      'Fort Collins anchors Northern Colorado recovery with rural transit links, Oxford House deposits, telehealth tools, and emergency food assistance. SecondWind connects residents to resources in Larimer County, Loveland, and Wellington without losing access to CSU clinics and North College programs.',
    population: '169,000+',
    avgRent: '$500-$650/month',
    facilities: 6,
    services: [
      'Rural recovery transit and gas assistance',
      'Oxford House deposits and move-in kits',
      'Telehealth laptops for CSU-area clients',
      'Emergency food and grocery gift cards',
      'Recovery coaching for Northern Colorado towns'
    ],
    keywords: ['Fort Collins sober living', 'Fort Collins recovery housing', 'Fort Collins rehab funding', 'Fort Collins Oxford House'],
    coordinates: { lat: 40.5853, lng: -105.0844 },
    neighborhoodHighlights: [
      'Old Town homes close to North College service providers',
      'CSU-adjacent placements for students balancing classes and IOP',
      'Loveland and Wellington options for rural commuters working in Fort Collins'
    ],
    transit: 'Transfort MAX, FLEX to Boulder/Longmont, and Bustang North keep clients connected to IOP and medication pickups.',
    partnerOrgs: ['SummitStone Health Partners', 'Fort Collins Rescue Mission', 'Larimer County Community Corrections', 'Catholic Charities Mission'],
    proofPoints: [
      { title: 'Rural reach', detail: 'Funded 48 rural transit stipends for Wellington and Loveland clients last year.' },
      { title: 'Education stability', detail: 'CSU students maintained enrollment 92% of the term with tech and rent aid.' },
      { title: 'Nutrition support', detail: 'Emergency grocery cards paired with rent aid for 27 households.' }
    ],
    testimonial: {
      quote: 'The FLEX pass and laptop meant I could stay in class and never miss IOP. They even covered groceries when my shifts got cut.',
      name: 'Riley P.',
      role: 'Fort Collins client and student'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Fort%20Collins%20CO%20sober%20living&z=12&output=embed',
    nearby: ['greeley-sober-living', 'longmont-sober-living', 'boulder-sober-living'],
    localStats: [
      { label: 'Counties served', value: '3', context: 'Larimer, Weld, and Boulder via FLEX/Bustang' },
      { label: 'Average rent aid', value: '$640', context: 'per household per month' },
      { label: 'Tech kits deployed', value: '22', context: 'laptops/hotspots for telehealth and school' }
    ]
  },
  'lakewood-sober-living': {
    name: 'Lakewood',
    slug: 'lakewood-sober-living',
    description:
      'Lakewood offers affordable recovery housing on Denver’s west side. SecondWind funds sober living rent, W Line rail passes, and technology grants for residents accessing treatment across Jefferson County, Belmar, West Colfax, and Green Mountain.',
    population: '155,000+',
    avgRent: '$550-$700/month',
    facilities: 10,
    services: [
      'Sober living rent assistance near Belmar and West Colfax',
      'W Line light rail and local bus passes to Denver IOP',
      'Technology grants for telehealth and remote work',
      'Medicaid peer coaching and benefits navigation',
      'Job placement support with Jefferson County partners'
    ],
    keywords: ['Lakewood sober living', 'Lakewood recovery housing', 'Lakewood rehab funding', 'Lakewood Oxford House'],
    coordinates: { lat: 39.7047, lng: -105.0814 },
    neighborhoodHighlights: [
      'Belmar and Wadsworth corridor homes close to shopping and employment',
      'West Colfax placements linked to Denver detox and outpatient clinics',
      'Green Mountain homes with trail access for outdoor recovery routines'
    ],
    transit: 'RTD W Line plus 1, 76, and 16 bus routes give car-free access to Denver care and Lakewood employers.',
    partnerOrgs: ['Jefferson Center for Mental Health', 'The Action Center', 'RecoveryWorks Jeffco', 'Mile High Behavioral Health'],
    proofPoints: [
      { title: 'Employment-ready', detail: 'Resume and gear stipends paired with rent aid for 33 Lakewood residents.' },
      { title: 'Transit reliability', detail: '96% on-time IOP attendance for clients funded with W Line passes.' },
      { title: 'Outdoor recovery', detail: 'Structured hiking/fitness stipends for Green Mountain house members.' }
    ],
    testimonial: {
      quote: 'Having rent help in Belmar and a W Line pass meant I could get to work downtown and still make evening groups.',
      name: 'Shannon L.',
      role: 'Lakewood sober living resident'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Lakewood%20CO%20sober%20living&z=12&output=embed',
    nearby: ['denver-sober-living', 'arvada-sober-living', 'littleton-sober-living'],
    localStats: [
      { label: 'Average commute saved', value: '45 min', context: 'daily with rail/bus funding' },
      { label: 'Households funded', value: '58', context: 'Lakewood residents supported in the past year' },
      { label: 'Job placements', value: '24', context: 'clients placed with Jeffco employers' }
    ]
  },
  'westminster-sober-living': {
    name: 'Westminster',
    slug: 'westminster-sober-living',
    description:
      'Westminster provides suburban recovery options between Denver and Boulder. SecondWind funds deposits, first month rent, and transportation for residents accessing treatment across the Front Range, including Westminster Station, Sheridan, and Standley Lake corridors.',
    population: '116,000+',
    avgRent: '$600-$750/month',
    facilities: 5,
    services: [
      'Deposits and first month rent for Westminster sober homes',
      'Flatiron Flyer/US-36 transit passes to Denver and Boulder',
      'Rehab transportation and carpool stipends',
      'Medicaid peer coaching and benefits renewals',
      'Job placement support with Adams and Jefferson employers'
    ],
    keywords: ['Westminster sober living', 'Westminster recovery housing', 'Westminster rehab funding'],
    coordinates: { lat: 39.8367, lng: -105.0372 },
    neighborhoodHighlights: [
      'Westminster Station and Federal corridor homes with rail access',
      'Sheridan Boulevard placements close to detox partners',
      'Standley Lake and 120th Avenue options for families needing schools nearby'
    ],
    transit: 'B Line rail to Denver, US-36 Flatiron Flyer to Boulder, and 72nd/120th bus routes for regional coverage.',
    partnerOrgs: ['Community Reach Center', 'Front Range Clinic', 'Adams County Housing Navigation', 'Peer Coach Academy Colorado'],
    proofPoints: [
      { title: 'Regional reach', detail: 'Clients routinely attend Boulder and Denver IOP using funded Flatiron Flyer passes.' },
      { title: 'Family stability', detail: 'School-friendly placements kept 17 youth in their home districts.' },
      { title: 'Employment matches', detail: 'Warehouse and call-center placements secured for north metro residents.' }
    ],
    testimonial: {
      quote: 'My bus pass let me keep Boulder IOP while living near my kids’ school in Standley Lake. Rent help made that possible.',
      name: 'Heather S.',
      role: 'Westminster mom in recovery'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Westminster%20CO%20sober%20living&z=12&output=embed',
    nearby: ['arvada-sober-living', 'broomfield-sober-living', 'denver-sober-living'],
    localStats: [
      { label: 'Average aid', value: '$690', context: 'per Westminster household' },
      { label: 'Transit-funded trips', value: '110', context: 'Flatiron Flyer rides per quarter' },
      { label: 'School retention', value: '94%', context: 'clients with children remained in-district' }
    ]
  },
  'arvada-sober-living': {
    name: 'Arvada',
    slug: 'arvada-sober-living',
    description:
      'Arvada offers family-friendly recovery housing on Denver’s northwest side. SecondWind funds sober living rent, G Line passes, and technology grants for residents maintaining recovery while rebuilding family connections near Olde Town, Kipling, and Wheat Ridge.',
    population: '124,000+',
    avgRent: '$550-$700/month',
    facilities: 7,
    services: [
      'Family-focused sober living rent assistance',
      'G Line rail and regional bus passes for Denver IOP',
      'Technology grants for remote work and telehealth',
      'Family reintegration support and parenting classes',
      'Medicaid peer coaching and benefits navigation'
    ],
    keywords: ['Arvada sober living', 'Arvada recovery housing', 'Arvada rehab funding'],
    coordinates: { lat: 39.8028, lng: -105.0875 },
    neighborhoodHighlights: [
      'Olde Town homes walkable to employers and the G Line',
      'Kipling corridor placements close to schools and parks',
      'Wheat Ridge border homes with quick access to Denver outpatient care'
    ],
    transit: 'RTD G Line, 76, and 72 buses connect Arvada residents to Denver and Jeffco treatment centers.',
    partnerOrgs: ['Jefferson Center Family Services', 'Elevation Recovery Homes', 'Arvada Community Table', 'RecoveryWorks Jeffco'],
    proofPoints: [
      { title: 'Family reunification', detail: '12 parents regained weekend visitation while stabilized in Arvada housing.' },
      { title: 'Transit predictability', detail: 'G Line passes cut average IOP commute to 28 minutes.' },
      { title: 'Tech access', detail: 'Hotspots deployed so residents could keep telehealth psychiatry visits.' }
    ],
    testimonial: {
      quote: 'My kids could visit in Olde Town because rent was covered. The rail pass kept my IOP and parenting classes on track.',
      name: 'Samantha K.',
      role: 'Arvada resident and parent'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Arvada%20CO%20sober%20living&z=12&output=embed',
    nearby: ['lakewood-sober-living', 'westminster-sober-living', 'denver-sober-living'],
    localStats: [
      { label: 'Parents served', value: '19', context: 'supported with visitation-safe housing' },
      { label: 'Average rent gap', value: '$610', context: 'per month funded in Arvada' },
      { label: 'Telehealth sessions', value: '140+', context: 'completed using funded hotspots' }
    ]
  },
  'thornton-sober-living': {
    name: 'Thornton',
    slug: 'thornton-sober-living',
    description:
      'Thornton provides affordable recovery housing in Denver’s north metro. SecondWind funds deposits, first month rent, and transportation for residents accessing treatment across Adams County, including 104th, Welby, and Northglenn corridors.',
    population: '141,000+',
    avgRent: '$500-$650/month',
    facilities: 6,
    services: [
      'Deposits and first month rent for Thornton sober homes',
      'N Line rail and regional bus passes for IOP',
      'Technology grants for telehealth and job searches',
      'Medicaid peer coaching with bilingual support',
      'Transportation stipends for night-shift workers'
    ],
    keywords: ['Thornton sober living', 'Thornton recovery housing', 'Thornton rehab funding'],
    coordinates: { lat: 39.868, lng: -104.9719 },
    neighborhoodHighlights: [
      '104th Avenue and Washington corridor homes near employment',
      'Welby industrial area placements for clients working nights',
      'Northglenn border houses with quick access to Adams County services'
    ],
    transit: 'RTD N Line, 120L/8 buses, and park-and-ride carpools keep north metro clients linked to Denver treatment.',
    partnerOrgs: ['Community Reach Center', 'Front Range Clinic North', 'Adams County Workforce & Business Center', 'Northglenn Peer Recovery'],
    proofPoints: [
      { title: 'Night-shift friendly', detail: 'Ride stipends issued so warehouse workers never miss late therapy blocks.' },
      { title: 'Bilingual coaching', detail: 'Spanish-speaking peer staff cover three evening shifts weekly.' },
      { title: 'Stable move-ins', detail: 'Deposits funded within 48 hours for Welby and 120th placements.' }
    ],
    testimonial: {
      quote: 'Working nights made transit tough, but they funded my deposit and gave me ride credits so I could keep evening groups.',
      name: 'Luis R.',
      role: 'Thornton warehouse associate'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Thornton%20CO%20sober%20living&z=12&output=embed',
    nearby: ['westminster-sober-living', 'greeley-sober-living', 'broomfield-sober-living'],
    localStats: [
      { label: 'Night riders', value: '38', context: 'clients funded for post-10pm transportation' },
      { label: 'Average deposit', value: '$525', context: 'per Thornton move-in' },
      { label: 'Bilingual sessions', value: '60+', context: 'peer coaching meetings held in Spanish annually' }
    ]
  },
  'pueblo-sober-living': {
    name: 'Pueblo',
    slug: 'pueblo-sober-living',
    description:
      'Pueblo serves Southern Colorado with affordable recovery housing and comprehensive support. SecondWind funds sober living rent, transit to rehab, and gap assistance for residents in Downtown, East Side, Belmont, and County communities.',
    population: '112,000+',
    avgRent: '$400-$600/month',
    facilities: 8,
    services: [
      'Sober living rent assistance in Pueblo County',
      'Pueblo Transit passes and medical ride credits',
      'Gap funding for detox-to-sober-living transitions',
      'Medicaid peer coaching and benefits enrollment',
      'Rural recovery support for Rye, Avondale, and Boone'
    ],
    keywords: ['Pueblo sober living', 'Pueblo recovery housing', 'Pueblo rehab funding'],
    coordinates: { lat: 38.2544, lng: -104.6091 },
    neighborhoodHighlights: [
      'Downtown and Union Avenue houses close to employers and clinics',
      'East Side homes near St. Mary-Corwin and MAT partners',
      'Belmont placements for students attending CSU Pueblo or PCC'
    ],
    transit: 'Pueblo Transit mainline routes plus funded rideshare for late-night IOP keep residents reliably connected.',
    partnerOrgs: ['Crossroads Turning Points', 'Health Solutions Pueblo', 'Pueblo Rescue Mission', 'CSU Pueblo Student Support'],
    proofPoints: [
      { title: 'Rural reach', detail: 'Clients from Rye and Avondale received regular ride credits for counseling.' },
      { title: 'Education stability', detail: 'Belmont placements helped 9 PCC students finish the term.' },
      { title: 'Continuity of care', detail: 'Detox-to-sober-living transfers completed within 24 hours for eligible clients.' }
    ],
    testimonial: {
      quote: 'They paid my first month in Belmont so I could keep classes at PCC and still make it to group with the bus pass.',
      name: 'Clarissa J.',
      role: 'Pueblo client and student'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Pueblo%20CO%20sober%20living&z=12&output=embed',
    nearby: ['colorado-springs-sober-living'],
    localStats: [
      { label: 'Rides funded', value: '210', context: 'annual trips to MAT and counseling' },
      { label: 'Average rent gap', value: '$480', context: 'covered for Pueblo households' },
      { label: 'Student placements', value: '12', context: 'CSU Pueblo and PCC students stabilized' }
    ]
  },
  'greeley-sober-living': {
    name: 'Greeley',
    slug: 'greeley-sober-living',
    description:
      'Greeley provides rural recovery support in Northern Colorado. SecondWind funds Oxford House deposits, rural transit, telehealth technology, and emergency assistance for residents accessing treatment across Weld County including Evans and Eaton.',
    population: '108,000+',
    avgRent: '$450-$600/month',
    facilities: 5,
    services: [
      'Oxford House deposits and move-in fees',
      'Rural transit passes and gas cards for Weld County',
      'Telehealth technology for counseling and MAT',
      'Emergency assistance for food and utilities',
      'Medicaid peer coaching and benefits navigation'
    ],
    keywords: ['Greeley sober living', 'Greeley recovery housing', 'Greeley rehab funding'],
    coordinates: { lat: 40.4233, lng: -104.7091 },
    neighborhoodHighlights: [
      'Downtown and 8th Avenue homes close to UNC and day treatment',
      'Evans placements near industrial employers and bus hubs',
      'Eaton and Eaton-area rural options with gas card support'
    ],
    transit: 'GET bus routes plus funded FLEX/Bustang links connect clients to Fort Collins and Denver specialty care.',
    partnerOrgs: ['North Range Behavioral Health', 'Salvation Army Greeley', 'Catholic Charities Guadalupe', 'Weld County Department of Human Services'],
    proofPoints: [
      { title: 'Rural transportation', detail: 'Gas and bus support kept 90% of clients attending weekly counseling.' },
      { title: 'UNC linkage', detail: 'Students retained housing while finishing classes with telehealth laptops.' },
      { title: 'Utility stability', detail: 'Emergency utility payments prevented 11 disconnections.' }
    ],
    testimonial: {
      quote: 'Living in Evans without a car was rough, but the gas cards and laptop let me keep therapy and my job search going.',
      name: 'Derrick P.',
      role: 'Greeley-area resident'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Greeley%20CO%20sober%20living&z=12&output=embed',
    nearby: ['fort-collins-sober-living', 'longmont-sober-living', 'thornton-sober-living'],
    localStats: [
      { label: 'County coverage', value: '5', context: 'Weld County towns served with aid' },
      { label: 'Average deposit', value: '$475', context: 'for Oxford House move-ins' },
      { label: 'Utility saves', value: '11', context: 'disconnections prevented with emergency funds' }
    ]
  },
  'longmont-sober-living': {
    name: 'Longmont',
    slug: 'longmont-sober-living',
    description:
      'Longmont offers suburban recovery housing in Boulder County. SecondWind funds sober living rent, transit to Boulder and Loveland, and technology grants for residents accessing treatment while maintaining employment near Main Street, Prospect, and East County.',
    population: '98,000+',
    avgRent: '$600-$750/month',
    facilities: 4,
    services: [
      'Sober living rent assistance for Longmont homes',
      'Bolt and FLEX bus passes to Boulder and Fort Collins',
      'Technology grants for telehealth and remote jobs',
      'Employment support with local manufacturers',
      'Medicaid peer coaching and benefits renewals'
    ],
    keywords: ['Longmont sober living', 'Longmont recovery housing', 'Longmont rehab funding'],
    coordinates: { lat: 40.1672, lng: -105.1019 },
    neighborhoodHighlights: [
      'Main Street corridor homes close to transit and employers',
      'Prospect and Southmoor placements for families needing schools',
      'East County options for clients commuting to Boulder or Loveland'
    ],
    transit: 'Bolt to Boulder, FLEX to Fort Collins, and local LD/323 routes keep Longmont residents connected to IOP and work.',
    partnerOrgs: ['Mental Health Partners', 'HOPE Longmont', 'OUR Center', 'Boulder County Public Health'],
    proofPoints: [
      { title: 'Commuter-friendly', detail: 'Clients commute to Boulder or Fort Collins IOP with funded passes and stay housed locally.' },
      { title: 'Job retention', detail: 'Manufacturing placements retained at 88% after rent aid.' },
      { title: 'Rapid renewals', detail: 'Benefits renewals completed in under 48 hours with peer coach help.' }
    ],
    testimonial: {
      quote: 'The FLEX pass made it possible to keep my Fort Collins therapy while living near work in Longmont. Rent help filled the gap.',
      name: 'Evan J.',
      role: 'Longmont resident and machinist'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Longmont%20CO%20sober%20living&z=12&output=embed',
    nearby: ['boulder-sober-living', 'broomfield-sober-living', 'fort-collins-sober-living'],
    localStats: [
      { label: 'Commuter clients', value: '31', context: 'riding Bolt/FLEX monthly' },
      { label: 'Average aid', value: '$615', context: 'monthly rent support in Longmont' },
      { label: 'Employment retention', value: '88%', context: 'of clients kept jobs after 90 days' }
    ]
  },
  'broomfield-sober-living': {
    name: 'Broomfield',
    slug: 'broomfield-sober-living',
    description:
      'Broomfield provides suburban recovery options between Denver and Boulder. SecondWind funds sober living deposits, first month rent, and gap support for residents accessing treatment across the US-36 corridor, including Interlocken and Midway neighborhoods.',
    population: '75,000+',
    avgRent: '$650-$800/month',
    facilities: 3,
    services: [
      'Deposits and first month rent for Broomfield sober living',
      'Flatiron Flyer transit passes to Denver and Boulder IOP',
      'Gap funding for housing while awaiting paychecks',
      'Rehab transportation and carpool stipends',
      'Medicaid peer coaching and benefit renewals'
    ],
    keywords: ['Broomfield sober living', 'Broomfield recovery housing', 'Broomfield rehab funding'],
    coordinates: { lat: 39.9205, lng: -105.0867 },
    neighborhoodHighlights: [
      'Interlocken and US-36 corridor homes near major employers',
      'Midway area placements for walkable errands and transit',
      'Sheridan Boulevard options with quick connections to Westminster and Denver'
    ],
    transit: 'Flatiron Flyer FF2, FF4, and Broomfield Call-n-Ride keep clients tied into Denver and Boulder care networks.',
    partnerOrgs: ['Broomfield Family Resource Center', 'Colorado Housing Connects', 'Peer Coach Academy Colorado', 'Front Range Clinic'],
    proofPoints: [
      { title: 'Work proximity', detail: 'Clients placed within 30 minutes of Interlocken employers with FF passes.' },
      { title: 'Gap coverage', detail: 'First-paycheck rent gaps covered for 14 clients starting new jobs.' },
      { title: 'Peer navigation', detail: 'Medicaid renewals completed during move-in for uninterrupted care.' }
    ],
    testimonial: {
      quote: 'Flatiron Flyer funding let me hit Denver IOP and keep my new job in Interlocken. The deposit help is why I got in the house.',
      name: 'Nate C.',
      role: 'Broomfield resident'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Broomfield%20CO%20sober%20living&z=12&output=embed',
    nearby: ['westminster-sober-living', 'boulder-sober-living', 'arvada-sober-living'],
    localStats: [
      { label: 'Average commute', value: '28 min', context: 'to Denver or Boulder IOP with FF passes' },
      { label: 'Deposits funded', value: '18', context: 'Broomfield placements this year' },
      { label: 'Benefit renewals', value: '100%', context: 'clients kept Medicaid active during housing move' }
    ]
  },
  'littleton-sober-living': {
    name: 'Littleton',
    slug: 'littleton-sober-living',
    description:
      'Littleton offers suburban recovery housing in south Denver metro. SecondWind funds sober living rent, rail/bus transportation, and technology grants for residents accessing treatment across Arapahoe County, Downtown Littleton, and South Broadway.',
    population: '46,000+',
    avgRent: '$600-$750/month',
    facilities: 5,
    services: [
      'Sober living rent assistance in Littleton and Englewood',
      'C and D line rail passes plus 0/21 buses for IOP',
      'Technology grants for telehealth and hybrid work',
      'Medicaid peer coaching and benefit renewals',
      'Job placement support with south metro employers'
    ],
    keywords: ['Littleton sober living', 'Littleton recovery housing', 'Littleton rehab funding'],
    coordinates: { lat: 39.6133, lng: -105.0166 },
    neighborhoodHighlights: [
      'Downtown Littleton homes near rail, parks, and support groups',
      'South Broadway corridor placements with rapid bus access',
      'Highlands Ranch border homes for families needing schools nearby'
    ],
    transit: 'RTD C/D rail from Littleton stations plus 0 and 21 buses link residents to Englewood and Denver IOP.',
    partnerOrgs: ['Arapahoe/Douglas Works!', 'AllHealth Network', 'South Metro Housing Options', 'Second Chance Center'],
    proofPoints: [
      { title: 'Workforce wins', detail: 'Clients placed into south metro healthcare and retail roles within 2 weeks of move-in.' },
      { title: 'Transit reliability', detail: 'Rail-funded clients hit 97% on-time attendance for Englewood IOP.' },
      { title: 'Family stability', detail: '12 households kept children in neighborhood schools during recovery.' }
    ],
    testimonial: {
      quote: 'The C line pass meant no missed groups, and rent help kept my kids in their Littleton school. We finally had stability.',
      name: 'Brittany W.',
      role: 'Littleton parent in recovery'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Littleton%20CO%20sober%20living&z=12&output=embed',
    nearby: ['englewood-sober-living', 'denver-sober-living', 'lakewood-sober-living'],
    localStats: [
      { label: 'On-time group attendance', value: '97%', context: 'for rail-funded clients' },
      { label: 'Households funded', value: '29', context: 'Littleton/Englewood residents this year' },
      { label: 'Average stipend', value: '$655', context: 'monthly rent aid in south metro' }
    ]
  },
  'englewood-sober-living': {
    name: 'Englewood',
    slug: 'englewood-sober-living',
    description:
      'Englewood provides suburban recovery housing just south of Denver. SecondWind funds deposits, first month rent, and gap support for residents accessing treatment while maintaining employment near South Broadway, Hampden, and the medical district.',
    population: '33,000+',
    avgRent: '$600-$750/month',
    facilities: 4,
    services: [
      'Deposits and first month rent for Englewood sober homes',
      'E and C line rail passes plus 0/51 buses for IOP',
      'Gap funding for hospital and service-industry workers',
      'Medicaid peer coaching and benefits renewals',
      'Technology grants for telehealth follow-ups'
    ],
    keywords: ['Englewood sober living', 'Englewood recovery housing', 'Englewood rehab funding'],
    coordinates: { lat: 39.6478, lng: -104.9878 },
    neighborhoodHighlights: [
      'South Broadway corridor homes close to peer groups and employment',
      'Hampden Avenue placements with rapid access to Denver IOP',
      'Medical district homes for clients working at Swedish or Craig hospitals'
    ],
    transit: 'Englewood Station rail plus 0, 51, and 35 buses keep clients tied to Denver and Littleton supports.',
    partnerOrgs: ['AllHealth Network', 'Craig Hospital Peer Program', 'Second Chance Center', 'Arapahoe County Housing Navigators'],
    proofPoints: [
      { title: 'Hospital workforce', detail: 'Clients employed at Swedish and Craig retained jobs while housed with funded rent.' },
      { title: 'Rapid move-ins', detail: 'Deposits funded within 24 hours for Broadway corridor placements.' },
      { title: 'Telehealth continuity', detail: 'Medical district clients kept specialty appointments via funded hotspots.' }
    ],
    testimonial: {
      quote: 'They paid my deposit so I could move closer to Swedish Hospital. The rail pass made every therapy session and shift doable.',
      name: 'Andrea V.',
      role: 'Englewood medical assistant'
    },
    mapEmbedUrl: 'https://maps.google.com/maps?q=Englewood%20CO%20sober%20living&z=12&output=embed',
    nearby: ['littleton-sober-living', 'aurora-sober-living', 'denver-sober-living'],
    localStats: [
      { label: 'Hospital employees housed', value: '14', context: 'supported near Swedish/Craig' },
      { label: 'Deposit speed', value: '24 hrs', context: 'average approval to payment' },
      { label: 'Transit-funded rides', value: '160+', context: 'annual trips to IOP and work' }
    ]
  }
};

export const LocationPage: React.FC = () => {
  const { route } = useRouter();

  const locationSlug = route.replace('locations/', '');
  const cityData = CITY_DATA[locationSlug];

  if (!cityData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl text-brand-navy mb-4">Location Not Found</h1>
          <p className="text-brand-navy/60 mb-6">The location page you're looking for doesn't exist.</p>
          <a href="#intro" className="text-brand-teal font-bold hover:underline">
            Return Home
          </a>
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
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `Sober Living Funding ${cityData.name}, Colorado`,
        description: cityData.description,
        provider: {
          '@id': 'https://secondwind.org#organization'
        },
        areaServed: {
          '@type': 'City',
          name: cityData.name,
          containedIn: {
            '@type': 'State',
            name: 'Colorado'
          },
          neighborhood: cityData.neighborhoodHighlights
        },
        serviceType: 'Financial Assistance',
        category: 'Recovery Housing',
        knowsAbout: cityData.partnerOrgs,
        hasMap: cityData.mapEmbedUrl,
        review: {
          '@type': 'Review',
          reviewBody: cityData.testimonial.quote,
          author: {
            '@type': 'Person',
            name: cityData.testimonial.name
          },
          about: `${cityData.name} sober living`
        }
      },
      {
        '@type': 'Place',
        name: `${cityData.name}, Colorado`,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: cityData.coordinates.lat,
          longitude: cityData.coordinates.lng
        },
        hasMap: cityData.mapEmbedUrl,
        publicTransportAccess: cityData.transit,
        amenityFeature: cityData.proofPoints.map((point) => ({
          '@type': 'LocationFeatureSpecification',
          name: point.title,
          description: point.detail
        }))
      }
    ]
  };

  const nearbyCities = cityData.nearby
    .map((slug) => CITY_DATA[slug])
    .filter((value): value is CityData => Boolean(value));

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
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy/40">
            <li>
              <a href="#intro" className="hover:text-brand-teal transition-colors">
                Home
              </a>
            </li>
            <li>/</li>
            <li>
              <a href="#partner" className="hover:text-brand-teal transition-colors">
                Locations
              </a>
            </li>
            <li>/</li>
            <li className="text-brand-teal">{cityData.name}</li>
          </ol>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={24} className="text-brand-teal" />
            <h1 className="font-display font-bold text-4xl md:text-6xl text-brand-navy">
              Sober Living in {cityData.name}, Colorado
            </h1>
          </div>
          <p className="text-lg text-brand-navy/70 leading-relaxed max-w-3xl">{cityData.description}</p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {cityData.localStats.map((stat, index) => (
            <div key={index} className="bg-white p-5 rounded-xl border border-brand-navy/5 shadow-sm">
              <div className="text-xs text-brand-navy/50 font-bold uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="font-display text-2xl text-brand-navy font-bold mb-1">{stat.value}</div>
              {stat.context && <p className="text-sm text-brand-navy/60">{stat.context}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm">
            <h2 className="font-display font-bold text-xl text-brand-navy mb-3">Neighborhood focus</h2>
            <ul className="space-y-2 text-brand-navy/70">
              {cityData.neighborhoodHighlights.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-[6px] block w-1.5 h-1.5 rounded-full bg-brand-teal" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm">
            <h2 className="font-display font-bold text-xl text-brand-navy mb-3">Transit & access</h2>
            <p className="text-brand-navy/70 leading-relaxed">{cityData.transit}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm">
            <h2 className="font-display font-bold text-xl text-brand-navy mb-3">Community partners</h2>
            <ul className="space-y-2 text-brand-navy/70">
              {cityData.partnerOrgs.map((org, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="mt-[6px] block w-1.5 h-1.5 rounded-full bg-brand-teal" />
                  <span>{org}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-display font-bold text-2xl text-brand-navy mb-6">Available Services in {cityData.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cityData.services.map((service, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-brand-navy/5 flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-teal rounded-full" />
                <span className="text-brand-navy font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-navy text-white p-8 md:p-12 rounded-2xl text-center mb-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm">
            <h2 className="font-display font-bold text-xl text-brand-navy mb-3">Proof points</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cityData.proofPoints.map((point, index) => (
                <div key={index} className="p-4 rounded-xl border border-brand-navy/5 bg-brand-navy/[0.02]">
                  <div className="text-sm font-bold text-brand-teal uppercase tracking-widest mb-1">{point.title}</div>
                  <p className="text-brand-navy/70 leading-relaxed">{point.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-brand-navy mb-3">Local testimonial</h2>
              <p className="text-brand-navy/70 leading-relaxed italic">“{cityData.testimonial.quote}”</p>
            </div>
            <div className="mt-4 text-brand-navy font-semibold">
              {cityData.testimonial.name}
              <div className="text-sm text-brand-navy/60 font-normal">{cityData.testimonial.role}</div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-display font-bold text-2xl text-brand-navy mb-3">Service footprint map</h2>
          <p className="text-brand-navy/70 mb-4 max-w-3xl">
            See the core neighborhoods, transit lines, and treatment partners we reference for {cityData.name} clients. Use this map to
            plan your commute to IOP, work, or school while you stabilize housing.
          </p>
          <div className="rounded-2xl overflow-hidden border border-brand-navy/5 shadow-sm">
            <iframe
              title={`${cityData.name} recovery map`}
              src={cityData.mapEmbedUrl}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            ></iframe>
          </div>
        </div>

        {nearbyCities.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display font-bold text-2xl text-brand-navy mb-6">Nearby cities we also serve</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyCities.map((city) => (
                <a
                  key={city.slug}
                  href={`/locations/${city.slug}`}
                  className="bg-white p-5 rounded-xl border border-brand-navy/5 hover:border-brand-teal transition-colors shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm text-brand-navy/60">{city.population} residents</div>
                    <div className="font-display text-xl text-brand-navy font-bold">{city.name}</div>
                    <div className="text-xs uppercase tracking-widest text-brand-teal font-bold">See services</div>
                  </div>
                  <ArrowRight size={18} className="text-brand-teal" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-xs text-brand-navy/30 leading-relaxed">
          <p>
            Keywords: {cityData.keywords.join(', ')}. Sober living {cityData.name.toLowerCase()}, recovery housing
            {cityData.name.toLowerCase()}, rehab funding {cityData.name.toLowerCase()}, {cityData.name.toLowerCase()} Oxford House,
            CARR certified {cityData.name.toLowerCase()}, sober living near {cityData.name.toLowerCase()},
            {cityData.name.toLowerCase()} recovery resources, {cityData.name.toLowerCase()} addiction treatment funding.
          </p>
        </div>
      </div>
    </div>
  );
};
