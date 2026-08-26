import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDate, formatKrw } from '../../lib/format';

interface CouponRow {
  id: string;
  is_used: boolean;
  coupon: { description: string; discount_type: string; discount_value: number; valid_until: string };
}

interface PointRow {
  id: string;
  amount: number;
  type: 'earn' | 'use';
  reason: string;
  created_at: string;
}

export default function MyCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [points, setPoints] = useState<PointRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_coupons')
      .select('id, is_used, coupon:coupons(description, discount_type, discount_value, valid_until)')
      .eq('user_id', user.id)
      .then(({ data }) => setCoupons((data as any) ?? []));
    supabase
      .from('points')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPoints((data as any) ?? []));
  }, [user]);

  const balance = points.reduce((sum, p) => sum + (p.type === 'earn' ? p.amount : -p.amount), 0);

  return (
    <div>
      <h2 className="h2 my-section-title">쿠폰 및 적립금</h2>

      <h3 className="h3" style={{ marginBottom: 'var(--space-3)' }}>보유 쿠폰</h3>
      {coupons.length === 0 && <p className="text-small">보유한 쿠폰이 없습니다.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-7)' }}>
        {coupons.map((c) => (
          <div key={c.id} className={`card ${c.is_used ? 'sold-out' : ''}`} style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{c.coupon.description}</span>
            <span className="text-small">
              {c.is_used ? '사용완료' : `~${formatDate(c.coupon.valid_until)}`}
            </span>
          </div>
        ))}
      </div>

      <h3 className="h3" style={{ marginBottom: 'var(--space-3)' }}>적립금 (보유: {balance.toLocaleString('ko-KR')}P)</h3>
      {points.length === 0 && <p className="text-small">적립/사용 내역이 없습니다.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {points.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
            <span className="text-small">
              {formatDate(p.created_at)} · {p.reason}
            </span>
            <span className="text-small" style={{ color: p.type === 'earn' ? 'var(--color-teal)' : 'var(--color-error)' }}>
              {p.type === 'earn' ? '+' : '-'}{formatKrw(p.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
