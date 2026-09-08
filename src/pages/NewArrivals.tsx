import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import './CategoryPage.css';

const SUB_LABELS: Record<string, string> = {
  이주의신상: '이주의 신상',
  베스트셀러: '베스트셀러',
};

export default function NewArrivals() {
  const [searchParams] = useSearchParams();
  const sub = searchParams.get('sub') ?? '이주의신상';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      if (sub === '베스트셀러') {
        // order_items는 회원 주문까지 anon이 직접 읽을 권한이 없어(RLS), 서버 집계 함수를 통해 순위만 받아온다.
        const { data: ranked } = await supabase.rpc('get_bestseller_products', { p_limit: 8 });
        const ids = ((ranked as { product_id: string }[]) ?? []).map((r) => r.product_id);
        if (ids.length === 0) {
          setProducts([]);
        } else {
          const { data: prods } = await supabase.from('products').select('*').in('id', ids).eq('is_active', true);
          const order = new Map(ids.map((id, i) => [id, i]));
          const sorted = ((prods as Product[]) ?? []).sort(
            (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
          );
          setProducts(sorted);
        }
      } else {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8);
        setProducts((data as Product[]) ?? []);
      }
      setLoading(false);
    })();
  }, [sub]);

  return (
    <div className="category-page container">
      <h1 className="h1 en-label category-title">NEW</h1>
      <p className="text-small category-subtitle">{SUB_LABELS[sub] ?? '이주의 신상'}</p>

      {!loading && products.length === 0 && (
        <p className="text-small">
          {sub === '베스트셀러' ? '아직 판매 데이터가 없습니다.' : '등록된 상품이 없습니다.'}
        </p>
      )}

      <div className="category-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
