import { useEffect, useState } from 'react';

export function useScrollProgress(distance: number, enabled = true) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setProgress(0);
      return;
    }
    let ticking = false;
    const update = () => {
      setProgress(Math.min(window.scrollY / distance, 1));
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [distance, enabled]);

  return progress;
}
