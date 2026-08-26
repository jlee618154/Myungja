import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/format';
import StarRating from '../../components/StarRating';

interface ReviewRow {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  product_id: string;
  products: { name: string; slug: string } | null;
}

export default function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, content, created_at, product_id, products(name, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setReviews((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const remove = async (id: string) => {
    if (!confirm('작성한 리뷰를 삭제하시겠습니까?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    await load();
  };

  if (loading) return <p className="text-small">불러오는 중...</p>;

  return (
    <div>
      <h2 className="h2 my-section-title">상품 후기 관리</h2>
      {reviews.length === 0 && <p className="text-small">작성한 리뷰가 없습니다.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {reviews.map((r) => (
          <div key={r.id} className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              {r.products && (
                <Link to={`/product/${r.products.slug}`} className="h3 link-hover">
                  {r.products.name}
                </Link>
              )}
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="text-small link-hover"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                삭제
              </button>
            </div>
            <StarRating value={r.rating} />
            <p style={{ marginTop: 'var(--space-2)' }}>{r.content}</p>
            <p className="text-small" style={{ marginTop: 'var(--space-2)' }}>{formatDate(r.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
