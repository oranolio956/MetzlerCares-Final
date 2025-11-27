import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SEOHead } from './SEOHead';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "Does Medicaid pay for sober living in Colorado?",
    answer: "Health First Colorado (Medicaid) does not directly pay for sober living rent, but it does cover Peer Recovery Coaching, IOP programs, and residential treatment. SecondWind bridges this gap by providing direct rent assistance for verified recovery residences while you access Medicaid-covered services."
  },
  {
    question: "How much does sober living cost in Colorado?",
    answer: "Sober living costs in Colorado typically range from $400-$800 per month, depending on location and amenities. Denver and Boulder tend to be on the higher end ($600-$800), while smaller cities like Pueblo or Greeley may be $400-$600. SecondWind can cover deposits, first month's rent, or provide gap funding if you have partial income."
  },
  {
    question: "What is the difference between Oxford House and CARR certified sober living?",
    answer: "Oxford Houses are democratically run, self-supporting homes with no house managers. CARR (Colorado Association of Recovery Residences) certified homes are professionally managed with structured programs and regular safety audits. Both are valid options—SecondWind funds both types based on your needs and preferences."
  },
  {
    question: "How do I find sober living near me in Colorado?",
    answer: "Use our Partner Directory to search by city (Denver, Boulder, Colorado Springs, etc.). You can filter by CARR certification, availability, and funding eligibility. Each facility listing includes contact information, requirements, and what SecondWind can fund at that location."
  },
  {
    question: "Can felons get sober living funding in Colorado?",
    answer: "Yes, but it depends on the specific offense. Most sober living homes have restrictions on violent sex offenses and arson due to insurance requirements. However, many facilities accept people with other criminal backgrounds. SecondWind's intake process will help identify felon-friendly options in your area."
  },
  {
    question: "What is required to qualify for SecondWind funding?",
    answer: "You must: (1) Be currently living in Colorado, (2) Be safe (have a place to sleep tonight), (3) Not be actively using substances, (4) Have no history of arson or violent sex offenses, (5) Have a plan for sustainability after initial funding. If you have Medicaid, you also qualify for free Peer Coaching."
  },
  {
    question: "Does SecondWind give cash directly?",
    answer: "No. SecondWind pays vendors directly—landlords, RTD (transit), tech stores, etc. This ensures funds go exactly where intended and maintains transparency. You'll receive confirmation when payments are made on your behalf."
  },
  {
    question: "How long does it take to get approved for funding?",
    answer: "The intake process takes about 10-15 minutes via our chat interface. If you qualify, funding can be processed within 24-48 hours for urgent cases. Standard processing is 3-5 business days. Medicaid Peer Coaching can be activated immediately if you have active coverage."
  },
  {
    question: "What cities in Colorado does SecondWind serve?",
    answer: "We actively fund recovery resources in: Denver Metro, Boulder County, Colorado Springs, Aurora, Fort Collins, Lakewood, Westminster, Arvada, Thornton, Pueblo, Greeley, Longmont, Broomfield, Littleton, and Englewood. Coverage expands as we add more verified partners."
  },
  {
    question: "Can I get funding for rehab transportation?",
    answer: "Yes. SecondWind provides RTD bus passes and transit funding to help you get to detox centers, IOP programs, PHP treatment, and medical appointments. This is especially important for people without vehicles or those in rural areas."
  },
  {
    question: "What is a Peer Recovery Coach and how do I get one?",
    answer: "A Peer Recovery Coach is a trained professional with lived experience who helps navigate recovery systems, find jobs, access resources, and provide mentorship. If you have Health First Colorado (Medicaid), SecondWind can immediately connect you with a free Peer Coach—no waitlist."
  },
  {
    question: "Is SecondWind a treatment center?",
    answer: "No. SecondWind is a funding platform that pays verified vendors (sober living landlords, transit, tech stores) directly. We don't provide treatment, but we fund the housing, transportation, and technology needed to access treatment and maintain recovery."
  },
  {
    question: "How do I apply for sober living funding?",
    answer: "Click 'Get Help' or 'Apply' on our homepage. You'll chat with Windy, our AI intake assistant, who will screen you for eligibility. The process is conversational—no long forms. If you qualify, you'll receive next steps within 24-48 hours."
  },
  {
    question: "What if I don't qualify for funding?",
    answer: "If you don't qualify for direct funding, we'll pivot to other resources: (1) Medicaid Peer Coaching (if you have coverage), (2) Local resource lists for your city, (3) Alternative funding sources. We never just say 'no'—we help you find the next open door."
  },
  {
    question: "Can I donate to SecondWind?",
    answer: "Yes! SecondWind is a 501(c)(3) non-profit. 100% of donations go directly to verified vendor payments—we don't take administrative fees. You can donate one-time or set up recurring contributions. All donations are tax-deductible."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  // FAQ Schema for Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <section className="w-full bg-white py-20 border-t border-brand-navy/5" aria-labelledby="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-brand-teal font-bold uppercase tracking-widest text-xs mb-4">
            <HelpCircle size={16} /> Frequently Asked Questions
          </div>
          <h2 id="faq-title" className="font-display font-bold text-3xl md:text-5xl text-brand-navy mb-4">
            Common Questions About Sober Living & Recovery Funding in Colorado
          </h2>
          <p className="text-brand-navy/60 text-lg max-w-2xl mx-auto">
            Everything you need to know about getting sober living funding, Medicaid coverage, and recovery resources in Colorado.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#FDFBF7] border border-brand-navy/10 rounded-xl overflow-hidden transition-all hover:shadow-md"
                itemScope
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 
                    className="font-bold text-lg text-brand-navy pr-8 group-hover:text-brand-teal transition-colors"
                    itemProp="name"
                  >
                    {faq.question}
                  </h3>
                  <ChevronDown
                    size={20}
                    className={`text-brand-navy/40 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    className="px-6 pb-5 text-brand-navy/70 leading-relaxed"
                    itemScope
                    itemType="https://schema.org/Answer"
                    itemProp="acceptedAnswer"
                  >
                    <p itemProp="text">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-brand-navy/50 text-sm mb-4">
            Still have questions? Chat with Windy, our AI intake assistant.
          </p>
          <a
            href="#apply"
            className="inline-flex items-center gap-2 bg-brand-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-navy transition-colors"
          >
            Get Help Now
          </a>
        </div>
      </div>
    </section>
  );
};
