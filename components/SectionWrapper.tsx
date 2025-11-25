
import React from 'react';
import { SEOHead } from './SEOHead';

interface SectionWrapperProps {
  id: string;
  title: string; // Used for SEO Title
  description?: string; // Used for SEO Description
  children: React.ReactNode;
  className?: string;
  isCalmMode?: boolean;
  schema?: Record<string, any>; // JSON-LD Schema
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ 
  id, 
  title, 
  description, 
  children, 
  className = "", 
  isCalmMode = false,
  schema
}) => {
  return (
    <>
      {/* 1. Silent SEO Injection */}
      <SEOHead title={title} description={description} schema={schema} />

      {/* 2. Semantic Layout & Accessibility */}
      <section 
        id={id}
        aria-label={title}
        className={`
          w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-24 
          min-h-[80vh] flex flex-col justify-center relative
          ${className}
        `}
      >
        {/* 3. Standard Entrance Animation */}
        <div className={!isCalmMode ? "animate-slide-up" : ""}>
          {children}
        </div>
      </section>
    </>
  );
};
