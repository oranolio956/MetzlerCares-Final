
import { useState, useEffect } from 'react';

export const useRouter = () => {
  const getRoute = () => {
    // Check for path-based routes first (for SEO)
    const path = window.location.pathname;
    if (path.startsWith('/locations/')) {
      return path; // e.g., '/locations/denver-sober-living'
    }
    if (path.startsWith('/services/')) {
      return path; // e.g., '/services/sober-living-rent-assistance'
    }
    if (path.startsWith('/blog/')) {
      return path; // e.g., '/blog/colorado-sober-living-checklist'
    }
    if (path.startsWith('/facilities/')) {
      return path; // e.g., '/facilities/tribe-recovery'
    }
    // Fallback to hash-based routing
    const hash = window.location.hash.replace('#', '');
    return (hash || 'intro') as 'intro' | 'philosophy' | 'donate' | 'apply' | 'portal' | 'donor-portal' | 'ledger' | 'peer-coaching' | 'partner' | 'coach' | 'vision';
  };

  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRoute());
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const navigate = (newRoute: string) => {
    // If it's a path-based route, use pushState
    if (newRoute.startsWith('/locations/') || newRoute.startsWith('/services/') || newRoute.startsWith('/facilities/') || newRoute.startsWith('/blog/')) {
      window.history.pushState({}, '', newRoute);
      setRoute(newRoute);
    } else {
      // Otherwise use hash-based routing
      window.location.hash = newRoute;
    }
  };

  return { route, navigate };
};
