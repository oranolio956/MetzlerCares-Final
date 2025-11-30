import React, { useEffect, useMemo, useState } from 'react';
import { Star, Send, CheckCircle, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CITY_DATA } from './LocationPage';
import { REVIEW_SERVICES } from '../services/reviewContent';
import { ReviewSubmission } from '../types';

interface ReviewIntakeProps {
  onNavigate?: (route: string) => void;
}

const defaultCity = Object.keys(CITY_DATA)[0];

export const ReviewIntake: React.FC<ReviewIntakeProps> = ({ onNavigate }) => {
  const { reviews, addReview } = useStore();
  const [formState, setFormState] = useState<ReviewSubmission>({
    name: '',
    citySlug: defaultCity,
    service: REVIEW_SERVICES[0],
    rating: 5,
    quote: '',
    role: 'beneficiary'
  });
  const [lastCitySubmitted, setLastCitySubmitted] = useState<string | null>(null);

  const averageRating = useMemo(() => {
    if (!reviews.length) return '4.8';
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const featured = useMemo(() => reviews.slice(0, 3), [reviews]);

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "AggregateRating",
          "ratingValue": averageRating,
          "reviewCount": reviews.length || 25,
          "itemReviewed": "https://secondwind.org#organization"
        },
        ...featured.map(review => ({
          "@type": "Review",
          "name": review.summary,
          "reviewBody": review.quote,
          "reviewRating": { "@type": "Rating", "ratingValue": review.rating, "bestRating": "5" },
          "author": { "@type": "Person", "name": review.name },
          "datePublished": review.date,
          "itemReviewed": `https://secondwind.org/locations/${review.citySlug}`
        }))
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    script.id = 'review-intake-schema';
    const existing = document.getElementById('review-intake-schema');
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('review-intake-schema');
      if (el) el.remove();
    };
  }, [averageRating, featured, reviews]);

  const handleChange = (field: keyof ReviewSubmission, value: string | number) => {
    setFormState(prev => ({ ...prev, [field]: value } as ReviewSubmission));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addReview({ ...formState, rating: Number(formState.rating) });
    setLastCitySubmitted(formState.citySlug);
    setFormState({
      name: '',
      citySlug: defaultCity,
      service: REVIEW_SERVICES[0],
      rating: 5,
      quote: '',
      role: 'beneficiary'
    });
  };

  const selectedCityReviews = reviews.filter(review => review.citySlug === formState.citySlug).slice(0, 2);

  return (
    <section className="w-full bg-white/60 border-t border-brand-navy/5 py-16" aria-label="Review intake">
      <div className="max-w-6xl mx-auto px-6 md:px-12 grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-start">
        <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-navy/50">Review Intake</p>
              <h2 className="font-display font-bold text-3xl text-brand-navy">Tell us how it went</h2>
              <p className="text-brand-navy/60">We verify and publish local testimonials to help neighbors trust the process.</p>
            </div>
            <div className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 rounded-full">
              <Star size={16} className="text-brand-yellow fill-brand-yellow" />
              <span className="font-bold text-lg">{averageRating}</span>
              <span className="text-white/70 text-sm">({reviews.length} reviews)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
              Name (or initials)
              <input
                value={formState.name}
                onChange={e => handleChange('name', e.target.value)}
                className="border border-brand-navy/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                placeholder="A.R."
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
              Your role
              <select
                value={formState.role}
                onChange={e => handleChange('role', e.target.value)}
                className="border border-brand-navy/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="beneficiary">Beneficiary</option>
                <option value="donor">Donor</option>
                <option value="provider">Provider</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
              City
              <select
                value={formState.citySlug}
                onChange={e => handleChange('citySlug', e.target.value)}
                className="border border-brand-navy/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                {Object.values(CITY_DATA).map(city => (
                  <option key={city.slug} value={city.slug}>{city.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
              Service funded
              <select
                value={formState.service}
                onChange={e => handleChange('service', e.target.value)}
                className="border border-brand-navy/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                {REVIEW_SERVICES.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy">
              Rating
              <input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={formState.rating}
                onChange={e => handleChange('rating', parseFloat(e.target.value))}
                className="border border-brand-navy/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-brand-navy md:col-span-2">
              Your story
              <textarea
                value={formState.quote}
                onChange={e => handleChange('quote', e.target.value)}
                className="border border-brand-navy/10 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-teal min-h-[120px]"
                placeholder="Share what changed for you after funding."
                required
              />
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
              <button type="submit" className="flex items-center gap-2 bg-brand-navy text-white px-4 py-3 rounded-xl font-bold hover:bg-brand-teal transition-colors">
                <Send size={16} /> Submit review
              </button>
              {lastCitySubmitted && (
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-teal bg-brand-teal/10 px-3 py-2 rounded-full">
                  <CheckCircle size={16} /> Submitted for {CITY_DATA[lastCitySubmitted].name}
                </div>
              )}
              <button
                type="button"
                className="text-brand-teal font-bold hover:underline"
                onClick={() => onNavigate?.(`/locations/${formState.citySlug}`)}
              >
                See my city page
              </button>
            </div>
          </form>
        </div>

        <div className="bg-brand-navy text-white rounded-2xl p-6 md:p-8 shadow-lg">
          <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Live feed</p>
          <h3 className="font-display font-bold text-2xl mb-2">Latest {CITY_DATA[formState.citySlug].name} stories</h3>
          <p className="text-white/70 mb-4">We surface fresh testimonials on the matching geo page and route them to schema testing automatically.</p>
          <div className="space-y-4">
            {(selectedCityReviews.length ? selectedCityReviews : featured).map(review => (
              <article key={review.id} className="bg-white/10 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-brand-yellow" />
                    <span className="font-bold">{CITY_DATA[review.citySlug]?.name || 'Colorado'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-brand-yellow font-bold">
                    <Star size={14} className="fill-brand-yellow" />
                    <span>{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-white font-semibold">{review.summary}</p>
                <p className="text-white/70 text-sm mt-1">{review.quote}</p>
                <p className="text-[11px] uppercase tracking-widest text-white/50 mt-2">{review.service}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
