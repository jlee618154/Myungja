import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate, formatKrw } from '../../lib/format';
import { ORDER_STATUSES } from '../../types';
import type { Order, OrderItem } from '../../types';
import './Admin.css';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

interface LowStockRow {
  product_name: string;
  color_name: string;
  size: string;
  stock_qty: number;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  return x;
}

function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [lowStock, setLowStock] = useState<LowStockRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderWithItems[]) ?? []);
        setLoading(false);
      });

    supabase
      .from('product_options')
      .select('stock_qty, color_name, size, products(name)')
      .lte('stock_qty', 5)
      .order('stock_qty', { ascending: true })
      .then(({ data }) => {
        const rows: LowStockRow[] = ((data as any[]) ?? []).map((r) => ({
          product_name: r.products?.name ?? '(삭제된 상품)',
          color_name: r.color_name,
          size: r.size,
          stock_qty: r.stock_qty,
        }));
        setLowStock(rows);
      });
  }, []);

  if (loading) return <p className="text-small">불러오는 중...</p>;

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const paidOrders = orders.filter((o) => o.status !== '취소');
  const sumSince = (since: Date) =>
    paidOrders
      .filter((o) => new Date(o.created_at) >= since)
      .reduce((sum, o) => sum + o.total_amount, 0);

  const todayRevenue = sumSince(todayStart);
  const weekRevenue = sumSince(weekStart);
  const monthRevenue = sumSince(monthStart);

  const statusCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));

  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <h1 className="h2 admin-page-title">대시보드</h1>

      <div className="admin-summary-grid">
        <div className="admin-summary-card">
          <p className="admin-summary-card-label">오늘 매출</p>
          <p className="admin-summary-card-value">{formatKrw(todayRevenue)}</p>
        </div>
        <div className="admin-summary-card">
          <p className="admin-summary-card-label">이번주 매출</p>
          <p className="admin-summary-card-value">{formatKrw(weekRevenue)}</p>
        </div>
        <div className="admin-summary-card">
          <p className="admin-summary-card-label">이번달 매출</p>
          <p className="admin-summary-card-value">{formatKrw(monthRevenue)}</p>
        </div>
        <div className="admin-summary-card">
          <p className="admin-summary-card-label">전체 주문</p>
          <p className="admin-summary-card-value">{orders.length}건</p>
        </div>
      </div>

      <div className="admin-status-grid">
        {statusCounts.map(({ status, count }) => (
          <button
            key={status}
            type="button"
            className="admin-status-card"
            onClick={() => navigate(`/admin/orders?status=${encodeURIComponent(status)}`)}
          >
            <p className="admin-status-card-count">{count}건</p>
            <p className="admin-status-card-label">{status}</p>
          </button>
        ))}
      </div>

      <div className="admin-section">
        <h2 className="h3 admin-section-title">재고 부족 상품 (5개 이하)</h2>
        {lowStock.length === 0 ? (
          <p className="admin-empty">재고 부족 옵션이 없습니다.</p>
        ) : (
          lowStock.map((r, i) => (
            <div key={i} className="admin-low-stock-row">
              <span>
                {r.product_name} · {r.color_name} / {r.size}
              </span>
              <span className="admin-low-stock-qty">재고 {r.stock_qty}개</span>
            </div>
          ))
        )}
      </div>

      <div className="admin-section">
        <h2 className="h3 admin-section-title">최근 주문 5건</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>주문일</th>
              <th>수령인</th>
              <th>금액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.order_no}</td>
                <td>{formatDate(o.created_at)}</td>
                <td>{o.recipient_name}</td>
                <td>{formatKrw(o.total_amount)}</td>
                <td>
                  <span className={`admin-badge admin-badge-${o.status}`}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
