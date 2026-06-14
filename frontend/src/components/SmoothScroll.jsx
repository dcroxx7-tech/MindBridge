import React, { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { useLocation } from 'react-router-dom';

export default function SmoothScroll({ children }) {
  const lenis = useLenis();
  const location = useLocation();

  // Reset scroll to top on route change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [location.pathname, lenis]);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
