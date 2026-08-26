import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function MySummary() {
  const { user, profile } = useAuth();
  const [points, setPoints] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
  const [recentOrderCount, setRecentOrderCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('points')
      .select('amount, type')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const balance = (data ?? []).reduce(
          (sum: number, r: any) => sum + (r.type === 'earn' ? r.amount : -r.amount),
          0
        );
        setPoints(Math.max(0, balance));
      });
    supabase
      .from('user_coupons')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_used', false)
      .then(({ count }) => setCouponCount(count ?? 0));
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setRecentOrderCount(count ?? 0));
  }, [user]);

  return (
    <div>
      <div className="card my-summary-card">
        <div>
          <span className="text-small">이름</span>
          <span className="my-summary-value">{profile?.name ?? '-'}</span>
        </div>
        <div>
          <span className="text-small">등급</span>
          <span className="my-summary-value">{profile?.membership_grade ?? '일반'}</span>
        </div>
        <div>
          <span className="text-small">적립금</span>
          <span className="my-summary-value">{points.toLocaleString('ko-KR')}P</span>
        </div>
        <div>
          <span className="text-small">쿠폰</span>
          <span className="my-summary-value">{couponCount}장</span>
        </div>
      </div>

      <p className="text-small">
        지금까지 총 {recentOrderCount}건의 주문이 있습니다.{' '}
        <Link to="/my/orders" className="link-hover">주문내역 보기 →</Link>
      </p>
    </div>
  );
}
