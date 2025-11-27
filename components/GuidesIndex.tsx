import React from 'react';
import { BookOpen, ArrowRight, Clock, Flame, MapPin } from 'lucide-react';
import { SEOHead } from './SEOHead';
import { GUIDE_ARTICLES } from './guidesData';
import { CITY_LINKS } from './ServicePage';

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metzlercares.com/' },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://metzlercares.com/guides' }
      ]
    },
    {
      '@type': 'ItemList',
      'name': 'Recovery Guides and How-To Articles',
      'itemListElement': GUIDE_ARTICLES.map((guide, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': guide.title,
        'url': `https://metzlercares.com/guides/${guide.slug}`,
        'description': guide.description,
        'keywords': guide.keywords
      }))
    }
  ]
};

export const GuidesIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-16">
      <SEOHead
        title="Guides & How-Tos | MetzlerCares Recovery"
        description="Step-by-step guides for sober living funding, rehab transportation, and recovery technology grants across Colorado."
        path="guides"
        breadcrumbs={[
          { name: 'Home', url: 'https://metzlercares.com/' },
          { name: 'Guides', url: 'https://metzlercares.com/guides' }
        ]}
        schema={breadcrumbSchema}
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 md:p-12 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen size={28} className="text-brand-teal" />
            <h1 className="font-display font-bold text-4xl md:text-5xl text-brand-navy">Guides & How-Tos</h1>
          </div>
          <p className="text-lg text-brand-navy/70 leading-relaxed mb-3">
            Practical playbooks for funding, transportation, and technology so you can stay in recovery housing without missing treatment.
          </p>
          <p className="text-brand-navy/60">Each guide includes timelines, document checklists, and FAQs with direct links to MetzlerCares services and city pages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {GUIDE_ARTICLES.map((guide) => (
            <article key={guide.slug} className="bg-white border border-brand-navy/10 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand-teal/10 text-brand-teal">{guide.category}</span>
                <div className="flex items-center gap-2 text-brand-navy/50 text-xs font-bold uppercase tracking-widest">
                  <Clock size={14} /> {guide.readingTime}
                </div>
              </div>
              <h2 className="font-display font-bold text-2xl text-brand-navy">{guide.title}</h2>
              <p className="text-brand-navy/70 text-sm leading-relaxed">{guide.description}</p>
              <div className="flex items-center gap-2 text-brand-navy/60 text-xs font-bold uppercase tracking-widest">
                <Flame size={14} className="text-brand-teal" /> Updated {guide.lastUpdated}
              </div>
              <a href={`/guides/${guide.slug}`} className="inline-flex items-center gap-2 text-brand-teal font-bold text-sm hover:underline">
                Read the guide <ArrowRight size={16} />
              </a>
            </article>
          ))}
        </div>

        <div className="bg-white border border-brand-navy/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={20} className="text-brand-teal" />
            <h3 className="font-display font-bold text-xl text-brand-navy">City-Specific Help</h3>
          </div>
          <p className="text-brand-navy/70 mb-4 text-sm">Jump to location pages for rent assistance, transportation, and tech grants near you.</p>
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
