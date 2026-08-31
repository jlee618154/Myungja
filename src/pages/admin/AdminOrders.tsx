import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDate, formatKrw } from '../../lib/format';
import { ORDER_STATUSES } from '../../types';
import type { Order, OrderItem } from '../../types';
import './Admin.css';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

const ALL_STATUSES = [...ORDER_STATUSES, '취소'];

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderWithItems[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (search) {
        const q = search.trim().toLowerCase();
        const matchesNo = o.order_no.toLowerCase().includes(q);
        const matchesName = o.recipient_name.toLowerCase().includes(q);
        if (!matchesNo && !matchesName) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const updateStatus = async (order: OrderWithItems, status: string) => {
    setSavingId(order.id);
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    setSavingId(null);
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    } else {
      alert('상태 변경에 실패했습니다: ' + error.message);
    }
  };

  const saveTracking = async (order: OrderWithItems) => {
    const value = trackingDrafts[order.id] ?? order.tracking_number ?? '';
    setSavingId(order.id);
    const { error } = await supabase.from('orders').update({ tracking_number: value }).eq('id', order.id);
    setSavingId(null);
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, tracking_number: value } : o)));
    } else {
      alert('송장번호 저장에 실패했습니다: ' + error.message);
    }
  };

  const cancelOrder = async (order: OrderWithItems) => {
    if (!confirm(`주문 ${order.order_no}을(를) 취소 처리할까요?`)) return;
    await updateStatus(order, '취소');
  };

  if (loading) return <p className="text-small">불러오는 중...</p>;

  return (
    <div>
      <h1 className="h2 admin-page-title">주문관리</h1>

      <div className="admin-toolbar">
        <select value={statusFilter} onChange={(e) => setSearchParams(e.target.value ? { status: e.target.value } : {})}>
          <option value="">전체 상태</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="주문번호 또는 고객명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-small">총 {filtered.length}건</span>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">조건에 맞는 주문이 없습니다.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>주문일</th>
              <th>고객명</th>
              <th>상품</th>
              <th>금액</th>
              <th>상태</th>
              <th>송장번호</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const showTracking = o.status !== '결제완료' && o.status !== '취소';
              const trackingValue = trackingDrafts[o.id] ?? o.tracking_number ?? '';
              return (
                <tr key={o.id}>
                  <td>{o.order_no}</td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{o.recipient_name}</td>
                  <td>
                    {o.order_items[0]?.product_name}
                    {o.order_items.length > 1 ? ` 외 ${o.order_items.length - 1}건` : ''}
                  </td>
                  <td>{formatKrw(o.total_amount)}</td>
                  <td>
                    <select
                      value={o.status}
                      disabled={savingId === o.id}
                      onChange={(e) => updateStatus(o, e.target.value)}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {showTracking ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input
                          type="text"
                          className="admin-inline-input"
                          placeholder="송장번호"
                          value={trackingValue}
                          onChange={(e) =>
                            setTrackingDrafts((prev) => ({ ...prev, [o.id]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          className="admin-btn-sm"
                          disabled={savingId === o.id}
                          onClick={() => saveTracking(o)}
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <span className="text-small">-</span>
                    )}
                  </td>
                  <td>
                    {o.status !== '취소' && o.status !== '배송완료' && (
                      <button type="button" className="admin-btn-sm danger" onClick={() => cancelOrder(o)}>
                        주문취소
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
