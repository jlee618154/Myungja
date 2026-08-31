import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatKrw } from '../../lib/format';
import type { Order, OrderItem } from '../../types';
import LineChart from '../../components/admin/LineChart';
import './Admin.css';

type Period = 'day' | 'week' | 'month';

const PERIOD_CONFIG: Record<Period, { label: string; count: number }> = {
  day: { label: '일별', count: 14 },
  week: { label: '주별', count: 8 },
  month: { label: '월별', count: 6 },
};

function bucketDate(period: Period, offsetFromNow: number) {
  const d = new Date();
  if (period === 'day') d.setDate(d.getDate() - offsetFromNow);
  if (period === 'week') d.setDate(d.getDate() - offsetFromNow * 7);
  if (period === 'month') d.setMonth(d.getMonth() - offsetFromNow);
  return d;
}

function bucketKey(date: Date, period: Period) {
  if (period === 'month') return `${date.getFullYear()}-${date.getMonth() + 1}`;
  if (period === 'week') {
    const d = new Date(date);
    const day = (d.getDay() + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function bucketLabel(date: Date, period: Period) {
  if (period === 'month') return `${date.getFullYear()}.${date.getMonth() + 1}`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>('day');
  const [orders, setOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('*').neq('status', '취소'),
      supabase.from('order_items').select('*, orders(status)'),
    ]).then(([ordersRes, itemsRes]) => {
      setOrders((ordersRes.data as Order[]) ?? []);

      const items = ((itemsRes.data as any[]) ?? []).filter((it) => it.orders?.status !== '취소');
      const totals = new Map<string, { qty: number; revenue: number }>();
      items.forEach((it: OrderItem) => {
        const cur = totals.get(it.product_name) ?? { qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.qty * it.unit_price;
        totals.set(it.product_name, cur);
      });
      const ranked = [...totals.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10);
      setTopProducts(ranked);
      setLoading(false);
    });
  }, []);

  const chartData = useMemo(() => {
    const { count } = PERIOD_CONFIG[period];
    const buckets = Array.from({ length: count }, (_, i) => {
      const date = bucketDate(period, count - 1 - i);
      return { key: bucketKey(date, period), label: bucketLabel(date, period), value: 0 };
    });
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    orders.forEach((o) => {
      const key = bucketKey(new Date(o.created_at), period);
      const bucket = byKey.get(key);
      if (bucket) bucket.value += o.total_amount;
    });
    return buckets;
  }, [orders, period]);

  if (loading) return <p className="text-small">불러오는 중...</p>;

  return (
    <div>
      <h1 className="h2 admin-page-title">매출통계</h1>

      <div className="admin-section">
        <div className="admin-analytics-toolbar">
          {(Object.keys(PERIOD_CONFIG) as Period[]).map((p) => (
            <button key={p} type="button" className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>
              {PERIOD_CONFIG[p].label}
            </button>
          ))}
        </div>
        <LineChart data={chartData} />
      </div>

      <div className="admin-section">
        <h2 className="h3 admin-section-title">상품별 판매량 순위 (TOP 10)</h2>
        {topProducts.length === 0 ? (
          <p className="admin-empty">판매 데이터가 없습니다.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>상품명</th>
                <th>판매수량</th>
                <th>매출</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.name}>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.qty}개</td>
                  <td>{formatKrw(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
