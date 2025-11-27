export interface GuideArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  lastUpdated: string;
  summary: string;
  hero: string;
  keywords: string[];
  steps: Array<{ title: string; detail: string }>;
  highlights: string[];
  faq: Array<{ question: string; answer: string }>;
  cta: string;
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'sober-living-application-checklist',
    title: 'How to Apply for Sober Living Funding in Colorado',
    description: 'Step-by-step checklist to get MetzlerCares rent assistance approved fast with zero out-of-pocket costs.',
    category: 'How-To',
    readingTime: '6-minute read',
    lastUpdated: '2024-12-01',
    summary: 'Use this checklist to gather documents, pick a verified house, and submit a complete application without delays.',
    hero: 'Collect documents, verify your house, and submit a clean application in under 20 minutes.',
    keywords: ['sober living application', 'rent assistance Colorado', 'how to apply sober living'],
    steps: [
      { title: 'Pick your house', detail: 'Choose a CARR-certified or Oxford House location so funds can be disbursed directly.' },
      { title: 'Confirm bed and move-in date', detail: 'Have a tentative move-in date and contact for the house manager ready.' },
      { title: 'Gather documents', detail: 'Photo ID, proof of Colorado residency, income verification (if any), and a move-in letter.' },
      { title: 'Start intake', detail: 'Open the MetzlerCares Intake Chat and upload your documents securely.' },
      { title: 'Sign the direct-pay agreement', detail: 'E-sign the agreement so MetzlerCares can pay the house directly.' },
      { title: 'Get your funding timeline', detail: 'Fast-track approvals land within 48 hours when documents are complete.' }
    ],
    highlights: [
      'Statewide coverage across 15+ Colorado cities',
      'Direct payments to verified sober living houses',
      'Fast-track approvals in 48 hours with complete files',
      'Bilingual support (English/Spanish) in chat',
      'No credit checks or cosigners needed'
    ],
    faq: [
      { question: 'Do I need to live in Colorado already?', answer: 'Yes. A Colorado ID or proof of address is required for statewide funding.' },
      { question: 'Can MetzlerCares pay deposits?', answer: 'Yes. Oxford House deposits and first month’s rent are eligible if the house is verified.' },
      { question: 'Is the funding a loan?', answer: 'No. Payments go directly to the sober living provider as grants—never to the applicant.' }
    ],
    cta: 'Start your intake now and get a 48-hour review if your documents are complete.'
  },
  {
    slug: 'rehab-transportation-playbook',
    title: 'Rehab Transportation Funding Playbook',
    description: 'Secure Medicaid-covered or donor-funded rides to detox, MAT, IOP, or PHP in Colorado.',
    category: 'Guide',
    readingTime: '5-minute read',
    lastUpdated: '2024-12-02',
    summary: 'Learn how to pair RTD, Lyft, and non-emergency medical transport so you never miss a treatment day.',
    hero: 'Transportation bundles for IOP, MAT, and medical appointments with direct vendor payments.',
    keywords: ['rehab transportation', 'Medicaid rides Colorado', 'IOP transportation funding'],
    steps: [
      { title: 'Pin your treatment schedule', detail: 'List your weekly appointments and locations so routing can be optimized.' },
      { title: 'Verify coverage', detail: 'Share your Medicaid ID or payment source; MetzlerCares fills gaps donors cover.' },
      { title: 'Pick vendors', detail: 'Select RTD passes, Lyft credits, or a non-emergency medical transport provider.' },
      { title: 'Add contingencies', detail: 'Set backup ride options for missed buses or extended sessions.' },
      { title: 'Confirm approvals', detail: 'Receive a weekly transportation calendar with direct-pay confirmations.' }
    ],
    highlights: [
      'Coverage for detox, MAT, IOP, PHP, and court-required visits',
      'Direct coordination with treatment centers for scheduling',
      'Ride credits managed centrally to prevent lapses',
      'Geo-optimized routes for Denver, Boulder, Colorado Springs',
      'Spanish-language support for all communications'
    ],
    faq: [
      { question: 'Can you cover rural rides?', answer: 'Yes. We pair RTD, Lyft, and local NEMT providers to bridge rural coverage gaps where possible.' },
      { question: 'Do you reimburse riders?', answer: 'We prioritize direct vendor payments. Reimbursements are evaluated case-by-case when receipts are provided.' },
      { question: 'Are court appointments eligible?', answer: 'Yes. Provide documentation of mandatory appearances or probation check-ins to include them.' }
    ],
    cta: 'Share your weekly treatment schedule to get a custom ride plan with direct-pay approvals.'
  },
  {
    slug: 'recovery-technology-grants',
    title: 'Recovery Technology Grants: Laptops, Hotspots, and Coaching',
    description: 'Get technology stipends for school, telehealth, and job search while in recovery housing.',
    category: 'Resource',
    readingTime: '4-minute read',
    lastUpdated: '2024-12-03',
    summary: 'Combine Wi-Fi, laptops, and peer coaching so residents can stay employed, in school, and in treatment.',
    hero: 'Tech kits with hotspots, Chromebooks, and coaching designed for sober living stability.',
    keywords: ['recovery laptop grant', 'telehealth hotspot', 'technology grant sober living'],
    steps: [
      { title: 'Verify your sober living provider', detail: 'Share your house manager contact so devices and Wi-Fi stipends can be delivered.' },
      { title: 'Choose your kit', detail: 'Pick between laptop + hotspot bundles or Wi-Fi stipends if the house already has connectivity.' },
      { title: 'Set your goals', detail: 'Define school, job search, or telehealth goals so coaching aligns with outcomes.' },
      { title: 'Schedule onboarding', detail: 'Join a 30-minute coaching call to set up devices and accessibility tools.' }
    ],
    highlights: [
      'Chromebooks and hotspots with content filtering',
      'Wi-Fi stipends for Oxford House and CARR homes',
      'Peer coaching to keep school and job goals on track',
      'Device tracking and replacements for damage/theft',
      'ADA-friendly setups for telehealth and coursework'
    ],
    faq: [
      { question: 'Can I pick the device?', answer: 'Yes. Choose between Chromebook packages or stipends if you already have a device that meets requirements.' },
      { question: 'Do I have to return equipment?', answer: 'Equipment stays with you while in the program. Replacement terms are included in the intake agreement.' },
      { question: 'Are hotspots filtered?', answer: 'Yes. Hotspots ship with content filtering to keep devices compliant with recovery housing rules.' }
    ],
    cta: 'Request your tech kit and schedule onboarding to unlock Wi-Fi and coaching support.'
  }
];
