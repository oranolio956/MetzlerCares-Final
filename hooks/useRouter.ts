import { useState, useEffect } from 'react';

export const useRouter = () => {
  const getHash = () => {
    const hash = window.location.hash.replace('#', '');
    return (hash || 'intro') as 'intro' | 'philosophy' | 'donate' | 'apply' | 'portal' | 'donor-portal' | 'ledger' | 'peer-coaching' | 'partner';
  };

  const [route, setRoute] = useState(getHash());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newRoute: string) => {
    window.location.hash = newRoute;
  };

  return { route, navigate };
};