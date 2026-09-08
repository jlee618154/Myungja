import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';
import './CategoryPage.css';

const LABELS: Record<Category, string> = {
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
  OUTER: 'OUTER',
  SET: 'SET',
};

export default function CategoryPage({ category }: { category: Category }) {
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from('products').select('*').eq('category', category).eq('is_active', true);
    if (sub) query = query.eq('subcategory', sub);
    query.order('created_at', { ascending: false }).then(({ data }) => {
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    });
  }, [category, sub]);

  return (
    <div className="category-page container">
      <h1 className="h1 en-label category-title">{LABELS[category]}</h1>
      {sub && <p className="text-small category-subtitle">{sub}</p>}

      {products.length > 2 && (
        <div className="category-sort text-small">
          <button type="button">신상품순</button>
          <button type="button">낮은가격순</button>
          <button type="button">높은가격순</button>
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="text-small">등록된 상품이 없습니다. 곧 새로운 상품으로 찾아뵙겠습니다.</p>
      )}

      <div className="category-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
