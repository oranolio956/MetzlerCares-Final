
import { useState, useEffect } from 'react';

export const useRouter = () => {
  const getRoute = () => {
    // Check for path-based routes first (for SEO)
    const path = window.location.pathname;
    if (path.startsWith('/locations/')) {
      return path; // e.g., '/locations/denver-sober-living'
    }
    if (path === '/guides') {
      return '/guides';
    }
    if (path.startsWith('/guides/')) {
      return path; // e.g., '/guides/sober-living-application-checklist'
    }
    if (path === '/services') {
      return '/services';
    }
    if (path.startsWith('/services/')) {
      return path; // e.g., '/services/sober-living-rent-assistance'
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
    if (
      newRoute === '/services' ||
      newRoute === '/guides' ||
      newRoute.startsWith('/locations/') ||
      newRoute.startsWith('/services/') ||
      newRoute.startsWith('/guides/') ||
      newRoute.startsWith('/facilities/')
    ) {
      window.history.pushState({}, '', newRoute);
      setRoute(newRoute);
    } else {
      // Otherwise use hash-based routing
      window.location.hash = newRoute;
    }
  };

  return { route, navigate };
};
