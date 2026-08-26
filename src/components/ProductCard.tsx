import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { assetUrl, formatKrw } from '../lib/format';
import './ProductCard.css';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <img className="aspect-portrait" src={assetUrl(product.base_image_url)} alt={product.name} />
      <div className="product-card-info">
        <h3 className="h3">{product.name}</h3>
        <p className="price">{formatKrw(product.price)}</p>
        {product.review_count > 0 && (
          <p className="text-small">
            ★ {product.rating.toFixed(1)} ({product.review_count})
          </p>
        )}
      </div>
    </Link>
  );
}
