import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export function useSmoothScroll() {
  useEffect(() => {
    // @ts-ignore - Lenis type definitions may be outdated
    const lenis = new Lenis({
      duration: 0.8, // Faster scroll (was 1.2)
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // Simpler easing
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
}
