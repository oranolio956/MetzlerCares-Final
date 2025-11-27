import React from 'react';
import { ShieldCheck, ArrowRight, MapPin, ClipboardList, CheckCircle2, Star } from 'lucide-react';
import { SEOHead } from './SEOHead';
import { CITY_LINKS, SERVICE_DATA, ServiceData } from './ServicePage';

const services = Object.values(SERVICE_DATA);

const itemListSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metzlercares.com/' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://metzlercares.com/services' }
      ]
    },
    {
      '@type': 'ItemList',
      'name': 'SecondWind Recovery Services',
      'itemListElement': services.map((service: ServiceData, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': service.name,
        'url': `https://metzlercares.com/services/${service.slug}`,
        'description': service.summary
      }))
    }
  ]
};

export const ServicesIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-16">
      <SEOHead
        title="Recovery Services | SecondWind Colorado"
        description="Explore sober living rent assistance, rehab transportation funding, Medicaid peer coaching, and more services we provide across Colorado."
        path="services"
        breadcrumbs={[
          { name: 'Home', url: 'https://metzlercares.com/' },
          { name: 'Services', url: 'https://metzlercares.com/services' }
        ]}
        schema={itemListSchema}
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="bg-white border border-brand-navy/10 rounded-2xl p-8 md:p-12 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck size={28} className="text-brand-teal" />
            <h1 className="font-display font-bold text-4xl md:text-5xl text-brand-navy">Recovery Services</h1>
          </div>
          <p className="text-lg text-brand-navy/70 leading-relaxed mb-3">
            Direct funding, transportation, technology, and coaching for Coloradans in recovery. Every program pays vendors directly so you can focus on getting stable.
          </p>
          <p className="text-brand-navy/60">
            Choose a service to see eligibility, timelines, and intake steps. Each page is optimized for your city with CARR and Oxford House partners highlighted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {services.map((service) => (
            <div key={service.slug} className="bg-white border border-brand-navy/10 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-navy/40">{service.serviceType}</p>
                  <h2 className="font-display font-bold text-2xl text-brand-navy mb-1">{service.name}</h2>
                  <p className="text-brand-navy/70 text-sm">{service.intro}</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand-teal/10 text-brand-teal">CO-wide</span>
              </div>

              <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
                <Star size={16} className="fill-brand-teal text-brand-teal" />
                <span>{service.rating.toFixed(1)} ({service.reviewCount}+ reviews)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#FDFBF7] border border-brand-navy/5">
                  <div className="flex items-center gap-2 mb-2 text-brand-navy font-bold text-sm">
                    <CheckCircle2 size={16} className="text-brand-teal" /> Eligibility fast facts
                  </div>
                  <ul className="text-brand-navy/70 text-sm space-y-1">
                    {service.eligibility.slice(0, 2).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-[#FDFBF7] border border-brand-navy/5">
                  <div className="flex items-center gap-2 mb-2 text-brand-navy font-bold text-sm">
                    <ClipboardList size={16} className="text-brand-teal" /> Fast-track timeline
                  </div>
                  <p className="text-brand-navy/70 text-sm">{service.timeline.fastTrack}</p>
                  <p className="text-brand-navy/50 text-xs mt-1">Standard: {service.timeline.standard}</p>
                </div>
              </div>

              <a
                href={`/services/${service.slug}`}
                className="inline-flex items-center gap-2 text-brand-teal font-bold text-sm hover:underline"
              >
                View {service.name} <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>

        <div className="bg-white border border-brand-navy/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={20} className="text-brand-teal" />
            <h3 className="font-display font-bold text-xl text-brand-navy">Popular City Pages</h3>
          </div>
          <p className="text-brand-navy/70 mb-4 text-sm">Jump to location-optimized pages to see partners, rents, and timelines near you.</p>
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

        <div className="mt-8 bg-white border border-brand-navy/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={20} className="text-brand-teal" />
            <h3 className="font-display font-bold text-xl text-brand-navy">Guides for faster approvals</h3>
          </div>
          <p className="text-brand-navy/70 mb-4 text-sm">Follow our step-by-step guides to submit complete applications and keep transportation and tech benefits active.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {services.slice(0, 3).map((service, idx) => (
              <a
                key={service.slug}
                href={`/guides/${['sober-living-application-checklist', 'rehab-transportation-playbook', 'recovery-technology-grants'][idx]}`}
                className="p-4 rounded-xl bg-[#FDFBF7] border border-brand-navy/5 hover:border-brand-teal transition-colors"
              >
                <p className="font-bold text-brand-navy">{service.name} guide</p>
                <p className="text-brand-navy/60 text-sm">Eligibility, documents, and timelines for {service.name.toLowerCase()}.</p>
                <span className="inline-flex items-center gap-2 text-brand-teal font-bold text-xs mt-2">Read more <ArrowRight size={14} /></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
