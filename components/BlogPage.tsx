import React, { useMemo } from 'react';
import { SEOHead } from './SEOHead';
import { useRouter } from '../hooks/useRouter';
import { BLOG_POSTS } from '../services/pageContent';
import { ArrowRight, Play } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const { route } = useRouter();
  const slug = route.replace('blog/', '');
  const post = BLOG_POSTS.find(entry => entry.slug === slug);

  if (!post) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl text-brand-navy mb-4">Article Not Found</h1>
          <p className="text-brand-navy/60 mb-6">The blog post you're looking for doesn't exist.</p>
          <a href="#intro" className="text-brand-teal font-bold hover:underline">Return Home</a>
        </div>
      </div>
    );
  }

  const youtubeId = post.videoUrl?.match(/embed\/([\w-]+)/)?.[1];
  const videoSchema = post.videoUrl
    ? [{
        "@type": "VideoObject",
        "name": post.title,
        "description": post.excerpt,
        "thumbnailUrl": youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : 'https://secondwind.org/social-card.svg',
        "uploadDate": '2024-11-01',
        "embedUrl": post.videoUrl,
        "contentUrl": post.videoUrl
      }]
    : [];

  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": '2024-11-01',
        "author": { "@type": "Organization", "name": "SecondWind" },
        "keywords": post.takeaways.join(', ')
      },
      ...videoSchema
    ]
  }), [post.excerpt, post.takeaways, post.title, post.videoUrl, videoSchema]);

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pt-28 pb-16">
      <SEOHead
        title={post.metaTitle}
        description={post.metaDescription}
        path={`blog/${post.slug}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://secondwind.org/' },
          { name: 'Blog', url: 'https://secondwind.org/blog' },
          { name: post.title, url: `https://secondwind.org/blog/${post.slug}` }
        ]}
        schema={schema}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <p className="text-xs uppercase tracking-widest text-brand-navy/50 font-bold mb-2">Blog</p>
        <h1 className="font-display font-bold text-4xl text-brand-navy mb-3">{post.title}</h1>
        <p className="text-brand-navy/70 text-lg mb-6">{post.excerpt}</p>
        <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6 mb-6">
          <h2 className="font-display font-bold text-2xl text-brand-navy mb-3">Actionable checklist</h2>
          <ul className="list-disc list-inside space-y-2 text-brand-navy/70">
            {post.takeaways.map(item => (
              <li key={item} className="leading-relaxed">{item}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="#apply" className="bg-brand-navy text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-teal transition-colors">
              Apply now <ArrowRight size={16} />
            </a>
            <a href="#donate" className="bg-brand-teal text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-teal/90 transition-colors">
              Donate to help <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {post.videoUrl && (
          <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-navy/50 mb-2">
              <Play size={16} /> Video guide
            </div>
            <div className="rounded-xl overflow-hidden border border-brand-navy/10 shadow-lg aspect-video">
              <iframe
                src={post.videoUrl}
                title={`${post.title} video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
