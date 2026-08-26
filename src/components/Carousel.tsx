import { useEffect, useRef, useState } from 'react';
import './Carousel.css';

export interface CarouselSlide {
  src: string;
  alt: string;
  objectPosition?: string;
}

export default function Carousel({
  slides,
  intervalMs = 4000,
  heightClass = 'carousel-hero',
}: {
  slides: CarouselSlide[];
  intervalMs?: number;
  heightClass?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, slides.length, intervalMs]);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div
      className={`carousel ${heightClass}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div key={s.src} className={`carousel-slide ${i === index ? 'active' : ''}`}>
          <img src={s.src} alt={s.alt} style={{ objectPosition: s.objectPosition ?? 'center' }} />
          <div className="carousel-overlay" />
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button type="button" className="carousel-arrow carousel-arrow-left" onClick={prev} aria-label="이전 이미지">
            ‹
          </button>
          <button type="button" className="carousel-arrow carousel-arrow-right" onClick={next} aria-label="다음 이미지">
            ›
          </button>
          <div className="carousel-dots">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                className={`carousel-dot ${i === index ? 'active' : ''}`}
                aria-label={`${i + 1}번째 이미지로 이동`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
