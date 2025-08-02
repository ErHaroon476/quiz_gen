'use client';

import { useEffect } from 'react';

export default function ForceScrollToTop({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Prevent browser from restoring scroll on reload
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  return <>{children}</>;
}
