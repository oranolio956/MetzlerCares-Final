import React, { useMemo } from 'react';
import { ArrowRight, Star, Play, CheckCircle } from 'lucide-react';
import { SEOHead } from './SEOHead';
import { useRouter } from '../hooks/useRouter';
import { SERVICE_PAGES } from '../services/pageContent';
import { useStore } from '../context/StoreContext';

export const ServicePage: React.FC = () => {
  const { route } = useRouter();
  const { reviews } = useStore();
  const slug = route.replace('services/', '');
  const service = SERVICE_PAGES.find(page => page.slug === slug);

  if (!service) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl text-brand-navy mb-4">Service Not Found</h1>
          <p className="text-brand-navy/60 mb-6">The service page you're looking for doesn't exist.</p>
          <a href="#intro" className="text-brand-teal font-bold hover:underline">Return Home</a>
        </div>
      </div>
    );
  }

  const serviceReviews = reviews.filter(review => review.service.toLowerCase().includes(service.name.toLowerCase().split(' ')[0]));
  const globalAverage = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '4.8';
  const averageRating = serviceReviews.length
    ? (serviceReviews.reduce((sum, review) => sum + review.rating, 0) / serviceReviews.length).toFixed(1)
    : globalAverage;

  const featuredReviews = serviceReviews.slice(0, 3);

  const youtubeId = service.videoUrl?.match(/embed\/([\w-]+)/)?.[1];
  const videoSchema = service.videoUrl
    ? [{
        "@type": "VideoObject",
        "name": `${service.name} walkthrough`,
        "description": service.summary,
        "thumbnailUrl": youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : 'https://secondwind.org/social-card.svg',
        "uploadDate": '2024-11-01',
        "embedUrl": service.videoUrl,
        "contentUrl": service.videoUrl
      }]
    : [];

  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": service.name,
        "serviceType": service.name,
        "description": service.summary,
        "areaServed": { "@type": "State", "name": "Colorado" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": averageRating, "reviewCount": serviceReviews.length || reviews.length }
      },
      ...featuredReviews.map(review => ({
        "@type": "Review",
        "name": review.summary,
        "reviewBody": review.quote,
        "reviewRating": { "@type": "Rating", "ratingValue": review.rating, "bestRating": "5" },
        "author": { "@type": "Person", "name": review.name },
        "datePublished": review.date,
        "itemReviewed": service.name
      })),
      ...videoSchema
    ]
  }), [averageRating, featuredReviews, service.name, service.summary, service.videoUrl, serviceReviews.length, reviews.length]);

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pt-28 pb-16">
      <SEOHead
        title={service.metaTitle}
        description={service.metaDescription}
        path={`services/${service.slug}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://secondwind.org/' },
          { name: 'Services', url: 'https://secondwind.org/services' },
          { name: service.name, url: `https://secondwind.org/services/${service.slug}` }
        ]}
        schema={schema}
      />

      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-8 md:p-12 mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-navy/50 font-bold mb-2">Service</p>
          <h1 className="font-display font-bold text-4xl text-brand-navy mb-4">{service.name}</h1>
          <p className="text-brand-navy/70 text-lg mb-6">{service.hero}</p>
          <div className="flex flex-wrap gap-3 items-center mb-8">
            <div className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-full">
              <Star size={16} className="text-brand-yellow fill-brand-yellow" />
              <span className="font-bold text-lg">{averageRating}</span>
              <span className="text-white/70 text-sm">({serviceReviews.length || reviews.length} reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-brand-teal font-bold">
              <CheckCircle size={16} /> Verified vendor payments
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {service.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-brand-navy/5 border border-brand-navy/5 rounded-xl p-4">
                <CheckCircle size={18} className="text-brand-teal mt-1" />
                <p className="text-brand-navy/80">{bullet}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#apply" className="bg-brand-navy text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-teal transition-colors">
              Start application <ArrowRight size={16} />
            </a>
            <a href="#donate" className="bg-brand-teal text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-teal/90 transition-colors">
              Fund this service <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.3fr,0.7fr] gap-6 items-start">
          <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6">
            <h3 className="font-display font-bold text-2xl text-brand-navy mb-3">Member outcomes</h3>
            <p className="text-brand-navy/60 mb-4">Real quotes tied to {service.name}. We spotlight stories that show how the process feels.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredReviews.length > 0 ? (
                featuredReviews.map(review => (
                  <article key={review.id} className="p-4 rounded-xl border border-brand-navy/10 bg-brand-navy/2">
                    <div className="flex items-center gap-2 text-brand-yellow font-bold mb-2">
                      <Star size={14} className="fill-brand-yellow" />
                      <span>{review.rating.toFixed(1)}</span>
                    </div>
                    <h4 className="font-bold text-brand-navy">{review.summary}</h4>
                    <p className="text-brand-navy/70 text-sm leading-relaxed mt-1">{review.quote}</p>
                  </article>
                ))
              ) : (
                <div className="md:col-span-3 p-4 bg-brand-navy/5 rounded-xl border border-brand-navy/10 text-brand-navy/70">We will publish reviews for this service as they come in.</div>
              )}
            </div>
          </div>

          {service.videoUrl && (
            <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-navy/50 mb-2">
                <Play size={16} /> Video walkthrough
              </div>
              <h4 className="font-display font-bold text-xl text-brand-navy mb-2">See how {service.name} works</h4>
              <p className="text-brand-navy/60 text-sm mb-4">{service.summary}</p>
              <div className="rounded-xl overflow-hidden border border-brand-navy/10 shadow-lg aspect-video">
                <iframe
                  src={service.videoUrl}
                  title={`${service.name} video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
