import React from 'react';
import { SEOHead } from './SEOHead';
import { useStore } from '../context/StoreContext';
import { ChevronRight, Home } from 'lucide-react';

interface SectionWrapperProps {
  id: string;
  title: string; // Used for SEO Title
  description?: string; // Used for SEO Description
  children: React.ReactNode;
  className?: string;
  schema?: Record<string, any>; // JSON-LD Schema
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ 
  id, 
  title, 
  description, 
  children, 
  className = "", 
  schema
}) => {
  const { isCalmMode } = useStore();
  
  // SEO: Breadcrumb List Schema
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://metzlercares.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": title.split('|')[0].trim(), // Clean title for breadcrumb
        "item": `https://metzlercares.com#${id}`
      }
    ]
  };

  // Merge schemas if custom schema is provided
  const finalSchema = schema 
    ? { 
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbSchema,
          schema
        ]
      }
    : { "@context": "https://schema.org", ...breadcrumbSchema };

  return (
    <>
      {/* 1. Silent SEO Injection */}
      <SEOHead title={title} description={description} schema={finalSchema} />

      {/* 2. Semantic Layout & Accessibility */}
      <section 
        id={id}
        aria-label={title}
        className={`
          w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-28 pb-12 md:py-24 
          min-h-[80vh] flex flex-col justify-center relative
          ${className}
        `}
      >
        {/* Visual Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="w-full mb-6 md:mb-8 animate-slide-up" style={{ animationDelay: '0s' }}>
           <ol className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-navy/40">
              <li>
                 <a href="#intro" className="hover:text-brand-teal transition-colors flex items-center gap-1 group">
                    <Home size={12} className="group-hover:scale-110 transition-transform" /> 
                    <span className="hidden sm:inline">Home</span>
                 </a>
              </li>
              <li><ChevronRight size={10} className="text-brand-navy/20" /></li>
              <li className="text-brand-teal/80 truncate max-w-[200px]" aria-current="page">
                 {title.split('|')[0].trim()}
              </li>
           </ol>
        </nav>

        {/* 3. Standard Entrance Animation */}
        <div className={!isCalmMode ? "animate-slide-up" : ""} style={{ animationDelay: '0.1s' }}>
          {children}
        </div>
      </section>
    </>
  );
};