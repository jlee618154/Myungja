import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import './Carousel.css';

export interface CarouselSlide {
  src: string;
  alt: string;
  objectPosition?: string;
  mobileObjectPosition?: string;
  label?: string;
  titleLine1?: string;
  titleLine2?: string;
  subcopy?: string;
  ctaLabel?: string;
  ctaTo?: string;
}

export default function Carousel({
  slides,
  intervalMs = 4000,
  heightClass = 'carousel-hero',
  variant = 'default',
}: {
  slides: CarouselSlide[];
  intervalMs?: number;
  heightClass?: string;
  variant?: 'default' | 'hero';
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className={`carousel ${heightClass}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div key={s.src} className={`carousel-slide ${i === index && mounted ? 'active' : ''}`}>
          <img
            src={s.src}
            alt={s.alt}
            style={
              {
                objectPosition: s.objectPosition ?? 'center',
                '--mobile-object-position': s.mobileObjectPosition ?? s.objectPosition ?? 'center',
              } as CSSProperties
            }
          />
          <div className="carousel-overlay" />
          {variant === 'hero' && (s.titleLine1 || s.subcopy) && (
            <div className="carousel-hero-copy">
              {s.label && <p className="carousel-hero-label">{s.label}</p>}
              {(s.titleLine1 || s.titleLine2) && (
                <p className="carousel-hero-title">
                  {s.titleLine1 && <span className="carousel-hero-title-line1 en-label">{s.titleLine1}</span>}
                  {s.titleLine2 && <span className="carousel-hero-title-line2 en-label">{s.titleLine2}</span>}
                </p>
              )}
              {s.subcopy && <p className="carousel-hero-subcopy">{s.subcopy}</p>}
              {s.ctaLabel && s.ctaTo && (
                <Link to={s.ctaTo} className="carousel-hero-cta">
                  {s.ctaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      ))}

      {variant === 'hero' && <div className="carousel-hero-scrim" aria-hidden="true" />}

      {slides.length > 1 && variant === 'hero' && (
        <>
          <div className="carousel-counter en-label" aria-hidden="true">
            <span className="carousel-counter-current">{pad(index + 1)}</span>
            <span className="carousel-counter-sep">/</span>
            <span className="carousel-counter-total">{pad(slides.length)}</span>
          </div>
          <div className="carousel-bars">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                className={`carousel-bar ${i === index ? 'active' : ''}`}
                aria-label={`${i + 1}번째 이미지로 이동`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}

      {slides.length > 1 && variant === 'default' && (
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
