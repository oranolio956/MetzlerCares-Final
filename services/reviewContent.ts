import { Testimonial } from '../types';

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'denver-rent',
    name: 'Alicia R.',
    role: 'beneficiary',
    citySlug: 'denver-sober-living',
    rating: 5,
    summary: 'Deposit covered in 48 hours',
    quote: 'SecondWind wired my sober living deposit before move-in. No red tape, just a quick call to my house manager.',
    service: 'Sober Living Rent Assistance',
    date: '2024-11-05',
    videoUrl: 'https://www.youtube.com/embed/E7wJTI-1dvQ'
  },
  {
    id: 'boulder-tech',
    name: 'Marcus L.',
    role: 'beneficiary',
    citySlug: 'boulder-sober-living',
    rating: 5,
    summary: 'Laptop + RTD pass funded',
    quote: 'They paired a refurbished laptop with a bus pass so I could keep counseling appointments on campus.',
    service: 'IOP Technology Grants',
    date: '2024-10-20'
  },
  {
    id: 'colorado-springs-vet',
    name: 'Andrea S.',
    role: 'beneficiary',
    citySlug: 'colorado-springs-sober-living',
    rating: 4.8,
    summary: 'Veteran-focused gap funding',
    quote: 'The team coordinated with my VA counselor and covered two weeks of rent while I waited on benefits.',
    service: 'Veteran Recovery Aid',
    date: '2024-09-15',
    videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U'
  },
  {
    id: 'aurora-job',
    name: 'DeShawn P.',
    role: 'beneficiary',
    citySlug: 'aurora-sober-living',
    rating: 4.7,
    summary: 'Kept employment on track',
    quote: 'Gap funding for first-month rent meant I could start my new job without couch surfing.',
    service: 'Sober Living Deposits',
    date: '2024-12-01'
  },
  {
    id: 'fort-collins-rural',
    name: 'Janet K.',
    role: 'beneficiary',
    citySlug: 'fort-collins-sober-living',
    rating: 4.9,
    summary: 'Rural transit solved',
    quote: 'They scheduled transit to detox and back-to-back IOP visits out in Larimer County.',
    service: 'Rural Recovery Transit',
    date: '2024-08-18'
  },
  {
    id: 'pueblo-family',
    name: 'Luis G.',
    role: 'beneficiary',
    citySlug: 'pueblo-sober-living',
    rating: 5,
    summary: 'Family-safe reentry',
    quote: 'SecondWind helped me re-enter a family sober home with tech, groceries, and a month of rent.',
    service: 'Family Reintegration Support',
    date: '2024-09-30'
  }
];

export const REVIEW_SERVICES = [
  'Sober Living Rent Assistance',
  'Rehab Transportation',
  'IOP Technology Grants',
  'Medicaid Peer Coaching',
  'Oxford House Deposits',
  'CARR Certified Housing'
];
