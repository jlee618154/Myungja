import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { assetUrl } from '../lib/format';
import { MD_PICK_CONTENT } from '../data/mdPickContent';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import './MdPick.css';

export default function MdPick() {
  const { activity } = useParams<{ activity: string }>();
  const content = activity ? MD_PICK_CONTENT[activity] : undefined;
  const [products, setProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    if (!content) return;
    const slugs = content.products.map((p) => p.slug);
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .in('slug', slugs)
      .then(({ data }) => {
        const map: Record<string, Product> = {};
        (data as Product[] | null)?.forEach((p) => {
          map[p.slug] = p;
        });
        setProducts(map);
      });
  }, [content]);

  if (!content) {
    return <div className="container product-detail-loading">페이지를 찾을 수 없습니다.</div>;
  }

  const ctaProduct = products[content.ctaSlug];

  return (
    <div className="md-pick-page">
      <section
        className="md-pick-hero"
        style={{ backgroundImage: `url(${assetUrl(content.heroImage)})` }}
        aria-label={`${content.eyebrow} — ${content.title}`}
      >
        {/* title/lead are baked into the hero photo itself; kept here visually-hidden for
            screen readers and SEO instead of duplicating the text on top of the image */}
        <div className="visually-hidden">
          <p>{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.lead}</p>
        </div>
      </section>

      <section className="md-pick-essay">
        <div className="container md-pick-essay-grid">
          <div>
            <p className="md-pick-tag en-label">{content.essayTag}</p>
            <h2 className="h2">{content.essayTitle}</h2>
          </div>
          <div className="md-pick-essay-copy">
            {content.essayParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="md-pick-briefing">
        <div className="container">
          <h2 className="h2 md-pick-briefing-title">{content.briefingTitle}</h2>
          <div className="md-pick-briefing-grid">
            {content.briefing.map((b) => (
              <div key={b.label} className="md-pick-briefing-card">
                <p className="md-pick-briefing-label en-label">{b.label}</p>
                <p className="text-small">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container md-pick-products">
        <p className="md-pick-tag en-label">SHOP THE LOOK</p>
        <h2 className="h2 md-pick-products-title">이 활동을 위한 추천 제품</h2>
        <div className="md-pick-products-grid">
          {content.products.map((ref) => {
            const product = products[ref.slug];
            if (!product) return null;
            return (
              <div key={ref.slug} className="md-pick-product-item">
                <ProductCard product={product} />
                <p className="text-small md-pick-product-caption">{ref.caption}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="md-pick-closing">
        <div className="container md-pick-closing-inner">
          <p className="h2 md-pick-closing-quote">{content.closingQuote}</p>
          {ctaProduct && (
            <Link to={`/product/${ctaProduct.slug}`} className="btn btn-primary">
              핵심 제품 만나보기 →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
