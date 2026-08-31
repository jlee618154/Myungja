import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDate, formatKrw } from '../../lib/format';
import type { Order, OrderItem } from '../../types';
import OrderStatusSteps from '../../components/OrderStatusSteps';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as any) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="text-small">불러오는 중...</p>;
  if (orders.length === 0) return <p className="text-small">주문 내역이 없습니다.</p>;

  return (
    <div>
      <h2 className="h2 my-section-title">주문내역 및 배송조회</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {orders.map((o) => (
          <div key={o.id} className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span className="text-small">
                주문번호 {o.order_no} · {formatDate(o.created_at)}
              </span>
              <span className="text-small" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
                {o.status}
              </span>
            </div>
            <OrderStatusSteps status={o.status} />
            {o.order_items.map((it) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>
                  {it.product_name} ({it.color_name} / {it.size}) × {it.qty}
                </span>
                <span>{formatKrw(it.unit_price * it.qty)}</span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <span className="text-small">결제금액</span>
              <span className="price">{formatKrw(o.total_amount)}</span>
            </div>
            {o.status === '배송중' && (
              <button type="button" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }}>
                배송조회
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
