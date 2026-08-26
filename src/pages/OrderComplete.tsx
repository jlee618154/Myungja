import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatKrw } from '../lib/format';
import type { Order, OrderItem } from '../types';
import './OrderComplete.css';

export default function OrderComplete() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase.from('orders').select('*').eq('order_no', orderNo).maybeSingle();
      if (o) {
        setOrder(o as Order);
        const { data: its } = await supabase.from('order_items').select('*').eq('order_id', (o as any).id);
        setItems((its as OrderItem[]) ?? []);
      }
      setLoading(false);
    })();
  }, [orderNo]);

  if (loading) return <div className="container order-complete-loading">불러오는 중...</div>;
  if (!order) return <div className="container order-complete-loading">주문 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="container order-complete">
      <p className="text-small en-label" style={{ color: 'var(--color-teal)' }}>
        ORDER COMPLETE
      </p>
      <h1 className="h1">주문이 완료되었습니다</h1>
      <p className="text-small">주문번호 {order.order_no}</p>

      <div className="order-complete-block card">
        <h2 className="h3">주문 상품</h2>
        {items.map((it) => (
          <div key={it.id} className="order-complete-item">
            <span>{it.product_name} ({it.color_name} / {it.size}) × {it.qty}</span>
            <span>{formatKrw(it.unit_price * it.qty)}</span>
          </div>
        ))}
      </div>

      <div className="order-complete-block card">
        <h2 className="h3">결제 정보</h2>
        <div className="order-complete-item">
          <span>결제수단</span>
          <span>{order.payment_method}</span>
        </div>
        <div className="order-complete-item">
          <span>최종 결제금액</span>
          <span className="price">{formatKrw(order.total_amount)}</span>
        </div>
      </div>

      <div className="order-complete-block card">
        <h2 className="h3">배송지</h2>
        <p>{order.recipient_name} / {order.recipient_phone}</p>
        <p>
          ({order.zonecode}) {order.address1} {order.address2}
        </p>
        <p className="text-small">결제 완료 후 영업일 기준 2~3일 이내 출고되며, 평균 3~5 영업일 이내 수령 가능합니다.</p>
      </div>

      <div className="order-complete-actions">
        <Link to="/" className="btn btn-secondary">홈으로</Link>
        <Link to="/my/orders" className="btn btn-primary">주문내역 보기</Link>
      </div>
    </div>
  );
}
