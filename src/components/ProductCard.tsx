import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import type { ProductCardExtra } from '../lib/productCardExtras';
import { assetUrl, formatKrw } from '../lib/format';
import './ProductCard.css';

export default function ProductCard({ product, extra }: { product: Product; extra?: ProductCardExtra }) {
  const [hovered, setHovered] = useState(false);
  const hasHoverImage = Boolean(extra?.hoverImageUrl);
  const onSale = product.original_price != null && product.original_price > product.price;
  const discountPct = onSale ? Math.round((1 - product.price / product.original_price!) * 100) : 0;
  const visibleColors = extra?.colors.slice(0, 4) ?? [];
  const extraColorCount = (extra?.colors.length ?? 0) - visibleColors.length;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-card-media aspect-portrait">
        <img
          className="product-card-img"
          style={{ opacity: hovered && hasHoverImage ? 0 : 1 }}
          src={assetUrl(product.base_image_url)}
          alt={product.name}
        />
        {hasHoverImage && (
          <img
            className="product-card-img product-card-img-hover"
            style={{ opacity: hovered ? 1 : 0 }}
            src={assetUrl(extra!.hoverImageUrl!)}
            alt=""
          />
        )}
        {hasHoverImage && (
          <span className={`product-card-hover-label en-label ${hovered ? 'is-visible' : ''}`}>
            01/02 CLICK → NEXT
          </span>
        )}
        {(extra?.isBest || extra?.isNew) && (
          <span className={`product-card-badge ${extra?.isBest ? 'badge-best' : 'badge-new'}`}>
            {extra?.isBest ? 'BEST' : 'NEW'}
          </span>
        )}
      </div>

      <div className="product-card-info">
        {visibleColors.length > 0 && (
          <div className="product-card-colors" aria-hidden="true">
            {visibleColors.map((c) => (
              <span key={c.name} className="product-card-color-dot" style={{ backgroundColor: c.hex }} />
            ))}
            {extraColorCount > 0 && <span className="text-small">+{extraColorCount}</span>}
          </div>
        )}
        <h3 className="h3">{product.name}</h3>
        <p className="price product-card-price">
          {onSale ? (
            <>
              <span className="product-card-price-original">{formatKrw(product.original_price!)}</span>
              <span className="product-card-price-discount">-{discountPct}%</span>
              <span className="product-card-price-final">{formatKrw(product.price)}</span>
            </>
          ) : (
            formatKrw(product.price)
          )}
        </p>
        {product.review_count > 0 && (
          <p className="text-small">
            ★ {product.rating.toFixed(1)} ({product.review_count})
          </p>
        )}
      </div>
    </Link>
  );
}
