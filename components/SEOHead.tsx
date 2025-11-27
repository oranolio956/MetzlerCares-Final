import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  schema?: Record<string, any>;
  path?: string; // Optional path for canonical tags
  breadcrumbs?: Array<{ name: string; url: string }>; // Enhanced breadcrumb support
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description = "A direct-action recovery resource platform. Invest in human potential.",
  schema,
  path,
  breadcrumbs
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    // 3. Update Open Graph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // 4. Update Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    const url = path 
      ? `https://secondwind.org/${path.replace(/^\/+/, '')}` 
      : window.location.href.split('#')[0]; // Fallback to clean root
      
    if (canonical) {
      canonical.setAttribute('href', url);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }

    // 5. Enhanced Breadcrumb Schema (if breadcrumbs provided, merge with existing schema)
    let finalSchema = schema;
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      };

      // Merge with existing schema if provided
      if (schema && schema["@graph"]) {
        finalSchema = {
          ...schema,
          "@graph": [...schema["@graph"], breadcrumbSchema]
        };
      } else if (schema) {
        finalSchema = {
          "@context": "https://schema.org",
          "@graph": [schema, breadcrumbSchema]
        };
      } else {
        finalSchema = breadcrumbSchema;
      }
    }

    // 6. Inject JSON-LD Schema (Silent SEO Feature)
    // Now supports multiple concurrent schemas (e.g. Breadcrumbs + Product)
    if (finalSchema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(finalSchema);
      const id = `schema-${Math.random().toString(36).substr(2, 9)}`;
      script.id = id;
      
      document.head.appendChild(script);

      return () => {
        const el = document.getElementById(id);
        if (el) el.remove();
      };
    }
  }, [title, description, schema, path, breadcrumbs]);

  return null;
};