import React from 'react';
import { ArrowRight, CheckCircle2, ListChecks, MessageCircle, ShieldCheck, BookOpen } from 'lucide-react';
import { useRouter } from '../hooks/useRouter';
import { SEOHead } from './SEOHead';
import { GUIDE_ARTICLES, GuideArticle } from './guidesData';
import { CITY_LINKS } from './ServicePage';

const createSchema = (guide: GuideArticle) => {
  const howToSchema = {
    '@type': 'HowTo',
    'name': guide.title,
    'description': guide.description,
    'totalTime': 'PT10M',
    'estimatedCost': {
      '@type': 'MonetaryAmount',
      'currency': 'USD',
      'value': '0',
      'description': 'MetzlerCares pays providers directly—no cost to applicants'
    },
    'step': guide.steps.map((step, index) => ({
      '@type': 'HowToStep',
      'position': index + 1,
      'name': step.title,
      'text': step.detail
    }))
  };

  const articleSchema = {
    '@type': 'Article',
    'headline': guide.title,
    'description': guide.summary,
    'author': {
      '@type': 'Organization',
      'name': 'MetzlerCares',
      '@id': 'https://metzlercares.com#organization'
    },
    'dateModified': guide.lastUpdated,
    'datePublished': guide.lastUpdated,
    'keywords': guide.keywords,
    'mainEntityOfPage': `https://metzlercares.com/guides/${guide.slug}`,
    'publisher': {
      '@type': 'Organization',
      'name': 'MetzlerCares',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://metzlercares.com/social-card.svg'
      }
    }
  };

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metzlercares.com/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://metzlercares.com/guides' },
      { '@type': 'ListItem', position: 3, name: guide.title, item: `https://metzlercares.com/guides/${guide.slug}` }
    ]
  };

  return { '@context': 'https://schema.org', '@graph': [articleSchema, howToSchema, breadcrumbSchema] };
};

export const GuidePage: React.FC = () => {
  const { route } = useRouter();
  const slug = typeof route === 'string' && route.startsWith('/guides/') ? route.replace('/guides/', '') : '';
  const guide = GUIDE_ARTICLES.find((item) => item.slug === slug);

  if (!guide) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <h1 className="font-display font-bold text-4xl md:text-6xl text-brand-navy mb-4">Guide Not Found</h1>
          <p className="text-brand-navy/70 max-w-2xl mx-auto mb-8">
            The resource you are looking for is unavailable. Explore our latest recovery guides below or return to the homepage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {GUIDE_ARTICLES.map((item) => (
              <a
                key={item.slug}
                href={`/guides/${item.slug}`}
                className="bg-white border border-brand-navy/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen size={20} className="text-brand-teal" />
                  <h2 className="font-display font-bold text-xl text-brand-navy">{item.title}</h2>
                </div>
                <p className="text-brand-navy/70 text-sm">{item.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const schema = createSchema(guide);

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-16">
      <SEOHead
        title={`${guide.title} | MetzlerCares Recovery Guides`}
        description={guide.summary}
        path={`guides/${guide.slug}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://metzlercares.com/' },
          { name: 'Guides', url: 'https://metzlercares.com/guides' },
          { name: guide.title, url: `https://metzlercares.com/guides/${guide.slug}` }
        ]}
        schema={schema}
      />

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy/40">
            <li><a href="#intro" className="hover:text-brand-teal transition-colors">Home</a></li>
            <li>/</li>
            <li><a href="/guides" className="hover:text-brand-teal transition-colors">Guides</a></li>
            <li>/</li>
            <li className="text-brand-teal">{guide.title}</li>
          </ol>
        </nav>

        <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 md:p-12 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={26} className="text-brand-teal" />
            <h1 className="font-display font-bold text-4xl md:text-5xl text-brand-navy">{guide.title}</h1>
          </div>
          <p className="text-lg text-brand-navy/70 leading-relaxed mb-3">{guide.hero}</p>
          <p className="text-brand-navy/60 mb-4">{guide.summary}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/#apply"
              className="bg-brand-teal text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start application <ArrowRight size={18} />
            </a>
            <a
              href="/#faq-title"
              className="bg-brand-navy/5 text-brand-navy px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              View FAQs
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-white border border-brand-navy/10 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks size={20} className="text-brand-teal" />
              <h2 className="font-display font-bold text-2xl text-brand-navy">Step-by-step</h2>
            </div>
            <div className="space-y-4">
              {guide.steps.map((step, idx) => (
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

          <aside className="bg-white border border-brand-navy/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-brand-teal" />
              <h3 className="font-display font-bold text-xl text-brand-navy">Quick wins</h3>
            </div>
            <ul className="space-y-3 text-brand-navy/70 text-sm">
              {guide.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-brand-teal"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a href="/services" className="inline-flex items-center gap-2 text-brand-teal font-bold text-sm hover:underline">
              View MetzlerCares services <ArrowRight size={16} />
            </a>
          </aside>
        </div>

        <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 shadow-sm mb-10">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={20} className="text-brand-teal" />
            <h3 className="font-display font-bold text-2xl text-brand-navy">Frequently asked</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guide.faq.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#FDFBF7] border border-brand-navy/5">
                <p className="font-bold text-brand-navy mb-1">{item.question}</p>
                <p className="text-brand-navy/70 text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={20} className="text-brand-teal" />
            <h3 className="font-display font-bold text-xl text-brand-navy">City-specific shortcuts</h3>
          </div>
          <p className="text-brand-navy/70 mb-4 text-sm">Navigate to your city page for eligibility, rents, and partners.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
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
      </div>
    </div>
  );
};
