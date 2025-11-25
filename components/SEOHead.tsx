
import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  schema?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description = "A direct-action recovery resource platform. Invest in human potential.",
  schema 
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

    // 4. Inject JSON-LD Schema (Silent SEO Feature)
    if (schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      script.id = 'dynamic-schema';
      
      // Remove old dynamic schema if exists
      const oldScript = document.getElementById('dynamic-schema');
      if (oldScript) oldScript.remove();

      document.head.appendChild(script);

      return () => {
        // Cleanup on unmount
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [title, description, schema]);

  return null; // This component renders nothing visually
};
