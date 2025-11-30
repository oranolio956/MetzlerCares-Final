export interface ServicePageMeta {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  hero: string;
  summary: string;
  bullets: string[];
  videoUrl?: string;
  ctaLabel: string;
}

export interface BlogPageMeta {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  takeaways: string[];
  videoUrl?: string;
}

export const SERVICE_PAGES: ServicePageMeta[] = [
  {
    slug: 'sober-living-rent-assistance',
    name: 'Sober Living Rent Assistance',
    metaTitle: 'Sober Living Rent Assistance in Colorado | Same-Week Vendor Payments',
    metaDescription: 'Cover deposits and first-month sober living rent in Denver, Boulder, and Colorado Springs. We pay vendors directly so you keep your bed and focus on recovery.',
    hero: 'Keep your bed. We wire funds directly to your sober living vendor in under a week.',
    summary: 'Designed for residents who need to secure or keep a CARR-certified bed without borrowing from friends or family.',
    bullets: [
      'Direct-to-vendor payments for deposits and first-month rent',
      'Coordinated verification with house managers and caseworkers',
      'Priority routing for Oxford House and Medicaid-linked beds'
    ],
    videoUrl: 'https://www.youtube.com/embed/Oi5YK5cl4Jk',
    ctaLabel: 'Start rent request'
  },
  {
    slug: 'rehab-transportation-funding',
    name: 'Rehab Transportation Funding',
    metaTitle: 'Rehab Transportation Funding | Safe Rides to Detox & IOP',
    metaDescription: 'Secure ride credits and bus passes for detox and IOP across Colorado. We organize schedules so you never miss a clinical milestone.',
    hero: 'Transportation that matches your treatment plan—scheduled, verified, and funded.',
    summary: 'For members who need reliable, safe trips to detox, IOP, or MAT appointments without risking employment.',
    bullets: [
      'Bus passes, Lyft credits, and rural transit partners statewide',
      'Calendars aligned to clinical schedules with SMS confirmations',
      'Optional peer check-ins before and after each ride'
    ],
    videoUrl: 'https://www.youtube.com/embed/YFbXlBN50dA',
    ctaLabel: 'Book a ride plan'
  }
];

export const BLOG_POSTS: BlogPageMeta[] = [
  {
    slug: 'colorado-sober-living-checklist',
    title: 'Colorado Sober Living Checklist',
    metaTitle: 'Colorado Sober Living Checklist | What to Bring, Budget, and Verify',
    metaDescription: 'Downloadable checklist for moving into sober living in Colorado with what vendors verify and how to budget.',
    excerpt: 'Use this checklist before move-in to avoid surprise costs and keep your bed secure.',
    takeaways: [
      'Bring ID, proof of income, and a contact for verification',
      'Budget for first week groceries and transit to treatment',
      'Ask if the home is CARR certified or an Oxford House'
    ],
    videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ'
  },
  {
    slug: 'how-to-use-medicaid-for-recovery',
    title: 'How to Use Medicaid for Recovery Basics',
    metaTitle: 'Use Colorado Medicaid for Recovery | Peer Coaching, IDs, and Work Gear',
    metaDescription: 'Quick guide to unlocking Medicaid benefits that cover IDs, work gear, and peer coaching for recovery residents.',
    excerpt: 'Most members never use their built-in Medicaid benefits. Here is how to activate them in minutes.',
    takeaways: [
      'Request a benefits audit to surface hidden allowances',
      'Use peer coaching to order IDs and work essentials',
      'Pair benefits with employer letters to keep job tracks steady'
    ]
  }
];
