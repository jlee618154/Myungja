import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { loadProductCardExtras } from '../lib/productCardExtras';
import type { ProductCardExtra } from '../lib/productCardExtras';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';
import './CategoryPage.css';

const LABELS: Record<Category, string> = {
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
  OUTER: 'OUTER',
  SET: 'SET',
};

const SUBCATEGORY_TABS: Record<Category, string[]> = {
  TOP: ['브라탑', '반팔·민소매', '긴팔·집업'],
  BOTTOM: ['레깅스', '반바지', '조거팬츠'],
  SET: ['브라탑 레깅스 세트', '위아래 세트'],
  OUTER: ['자켓', '베스트', '가디건'],
};

const SORT_OPTIONS = [
  { value: 'new', label: '신상품순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '낮은가격순' },
  { value: 'price-desc', label: '높은가격순' },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export default function CategoryPage({ category }: { category: Category }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sub = searchParams.get('sub');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [extras, setExtras] = useState<Record<string, ProductCardExtra>>({});
  const [sort, setSort] = useState<SortValue>('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .then(async ({ data }) => {
        const products = (data as Product[]) ?? [];
        setAllProducts(products);
        setExtras(await loadProductCardExtras(products));
        setLoading(false);
      });
  }, [category]);

  const filtered = useMemo(() => {
    if (!sub) return allProducts;
    if (sub === 'SALE') return allProducts.filter((p) => p.original_price != null && p.original_price > p.price);
    return allProducts.filter((p) => p.subcategory === sub);
  }, [allProducts, sub]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case 'popular':
        return list.sort((a, b) => (extras[b.id]?.popularityQty ?? 0) - (extras[a.id]?.popularityQty ?? 0));
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      default:
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [filtered, sort, extras]);

  const tabs = SUBCATEGORY_TABS[category];

  return (
    <div className="category-page container">
      <nav className="category-breadcrumb text-small" aria-label="브레드크럼">
        <Link to="/">HOME</Link> / {LABELS[category]}
      </nav>

      <p className="category-label en-label">CATEGORY</p>
      <h1 className="h1 en-label category-title">{LABELS[category]}</h1>
      <p className="category-count text-small">전체 {filtered.length}개 상품</p>

      <div className="category-toolbar">
        <div className="category-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!sub}
            className={`category-tab ${!sub ? 'active' : ''}`}
            onClick={() => setSearchParams({})}
          >
            전체
          </button>
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={sub === t}
              className={`category-tab ${sub === t ? 'active' : ''}`}
              onClick={() => setSearchParams({ sub: t })}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={sub === 'SALE'}
            className={`category-tab ${sub === 'SALE' ? 'active' : ''}`}
            onClick={() => setSearchParams({ sub: 'SALE' })}
          >
            세일
          </button>
        </div>

        <select
          className="category-sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          aria-label="정렬"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {!loading && sorted.length === 0 && (
        <p className="text-small">등록된 상품이 없습니다. 곧 새로운 상품으로 찾아뵙겠습니다.</p>
      )}

      <div className="category-grid">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} extra={extras[p.id]} />
        ))}
      </div>
    </div>
  );
}
