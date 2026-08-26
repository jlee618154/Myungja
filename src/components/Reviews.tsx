import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/format';
import StarRating from './StarRating';
import type { Review } from '../types';
import './Reviews.css';

const PAGE_SIZE = 5;

export default function Reviews({
  productId,
  rating,
  reviewCount,
  onRatingChange,
}: {
  productId: string;
  rating: number;
  reviewCount: number;
  onRatingChange: () => void;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [distribution, setDistribution] = useState<Record<number, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    const list = (data as Review[]) ?? [];
    setReviews(list);
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach((r) => (dist[r.rating] = (dist[r.rating] ?? 0) + 1));
    setDistribution(dist);
  };

  useEffect(() => {
    load();
    setVisible(PAGE_SIZE);
  }, [productId]);

  const myReview = reviews.find((r) => r.user_id === user?.id);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) {
      setError('리뷰 내용을 입력해 주세요');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.from('reviews').upsert(
      {
        product_id: productId,
        user_id: user!.id,
        rating: formRating,
        content: formContent.trim(),
      },
      { onConflict: 'product_id,user_id' }
    );
    setSubmitting(false);
    if (err) {
      setError('리뷰 등록에 실패했습니다');
      return;
    }
    setShowForm(false);
    setFormContent('');
    setFormRating(5);
    await load();
    onRatingChange();
  };

  return (
    <section className="reviews-section">
      <h2 className="h2">고객 리뷰</h2>

      <div className="reviews-summary">
        <div className="reviews-average">
          <span className="reviews-average-number">{rating.toFixed(1)}</span>
          <StarRating value={Math.round(rating)} size={20} />
          <span className="text-small">{reviewCount}개의 리뷰</span>
        </div>
        <div className="reviews-distribution">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0;
            const pct = reviewCount ? Math.round((count / reviewCount) * 100) : 0;
            return (
              <div key={star} className="reviews-bar-row">
                <span className="text-small">{star}점</span>
                <div className="reviews-bar-track">
                  <div className="reviews-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-small">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="reviews-actions">
        {user ? (
          !showForm && (
            <button type="button" className="btn btn-secondary" onClick={() => {
              setShowForm(true);
              if (myReview) {
                setFormRating(myReview.rating);
                setFormContent(myReview.content);
              }
            }}>
              {myReview ? '내 리뷰 수정하기' : '리뷰 작성'}
            </button>
          )
        ) : (
          <p className="text-small">리뷰 작성은 로그인 후 이용할 수 있습니다.</p>
        )}
      </div>

      {showForm && (
        <form className="review-form" onSubmit={submit}>
          <StarRating value={formRating} onChange={setFormRating} size={22} />
          <textarea
            className="review-textarea"
            rows={3}
            placeholder="상품에 대한 솔직한 후기를 남겨 주세요"
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
          />
          {error && <p className="field-error">{error}</p>}
          <div className="review-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      )}

      <ul className="review-list">
        {reviews.slice(0, visible).map((r) => (
          <li key={r.id} className="review-item">
            <div className="review-item-head">
              <StarRating value={r.rating} />
              <span className="text-small">{formatDate(r.created_at)}</span>
            </div>
            <p>{r.content}</p>
          </li>
        ))}
      </ul>

      {reviews.length === 0 && <p className="text-small">아직 등록된 리뷰가 없습니다.</p>}

      {visible < reviews.length && (
        <button type="button" className="btn btn-secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
          리뷰 더보기
        </button>
      )}
    </section>
  );
}
