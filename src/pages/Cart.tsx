import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import type { Size } from '../types';
import { assetUrl, cartLineKey as lineKey, formatKrw } from '../lib/format';
import './Cart.css';

export default function Cart() {
  const { lines, updateQty, removeLines, totalPrice } = useCart();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    setSelected(new Set(lines.map((l) => lineKey(l.product_id, l.color_name, l.size))));
  }, [lines.length]);

  useEffect(() => {
    const productIds = Array.from(new Set(lines.map((l) => l.product_id)));
    if (productIds.length === 0) return;
    supabase
      .from('product_options')
      .select('product_id, color_name, size, stock_qty')
      .in('product_id', productIds)
      .then(({ data }) => {
        const map: Record<string, number> = {};
        (data ?? []).forEach((o: any) => {
          map[lineKey(o.product_id, o.color_name, o.size)] = o.stock_qty;
        });
        setStockMap(map);
      });
  }, [lines]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === lines.length) setSelected(new Set());
    else setSelected(new Set(lines.map((l) => lineKey(l.product_id, l.color_name, l.size))));
  };

  const removeSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm('선택한 상품을 삭제하시겠습니까?')) return;
    const keys = lines
      .filter((l) => selected.has(lineKey(l.product_id, l.color_name, l.size)))
      .map((l) => ({ productId: l.product_id, color: l.color_name, size: l.size }));
    await removeLines(keys);
  };

  const removeOne = async (productId: string, color: string, size: Size) => {
    if (!confirm('이 상품을 삭제하시겠습니까?')) return;
    await removeLines([{ productId, color, size }]);
  };

  const selectedLines = lines.filter((l) => selected.has(lineKey(l.product_id, l.color_name, l.size)));
  const selectedSubtotal = selectedLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const shipping = selectedSubtotal > 0 && selectedSubtotal < 30000 ? 3000 : 0;
  const finalTotal = selectedSubtotal + shipping;

  if (lines.length === 0) {
    return (
      <div className="container cart-empty">
        <h1 className="h1">장바구니</h1>
        <p className="text-small">장바구니가 비어 있습니다.</p>
        <Link to="/" className="btn btn-primary">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="h1">장바구니</h1>

      <div className="cart-select-all">
        <label className="checkbox-field">
          <input type="checkbox" checked={selected.size === lines.length} onChange={toggleAll} />
          전체 선택 ({selected.size}/{lines.length})
        </label>
        <button type="button" className="btn btn-secondary" onClick={removeSelected}>
          선택삭제
        </button>
      </div>

      <div className="cart-lines">
        {lines.map((l) => {
          const key = lineKey(l.product_id, l.color_name, l.size);
          const stock = stockMap[key];
          const soldOut = stock === 0;
          const maxQty = stock !== undefined ? Math.min(stock, 10) : 10;
          return (
            <div key={key} className={`cart-line ${soldOut ? 'sold-out' : ''}`}>
              <input type="checkbox" checked={selected.has(key)} onChange={() => toggle(key)} disabled={soldOut} />
              <Link to={`/product/${l.slug}`}>
                <img src={assetUrl(l.image_url)} alt={l.name} />
              </Link>
              <div className="cart-line-info">
                <Link to={`/product/${l.slug}`} className="h3 link-hover">
                  {l.name}
                </Link>
                <span className="text-small">
                  {l.color_name} / {l.size}
                </span>
                {soldOut && <span className="text-small" style={{ color: 'var(--color-error)' }}>품절된 상품입니다</span>}
              </div>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => updateQty(l.product_id, l.color_name, l.size, Math.max(1, l.qty - 1))}
                  aria-label="수량 감소"
                >
                  −
                </button>
                <span>{l.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(l.product_id, l.color_name, l.size, Math.min(maxQty, l.qty + 1))}
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
              <span className="price cart-line-price">{formatKrw(l.price * l.qty)}</span>
              <button
                type="button"
                className="cart-line-remove"
                aria-label="삭제"
                onClick={() => removeOne(l.product_id, l.color_name, l.size)}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="cart-summary card">
        <div className="cart-summary-row">
          <span>상품금액</span>
          <span>{formatKrw(selectedSubtotal)}</span>
        </div>
        <div className="cart-summary-row">
          <span>배송비</span>
          <span>{shipping === 0 ? '무료' : formatKrw(shipping)}</span>
        </div>
        <div className="cart-summary-row cart-summary-total">
          <span>최종 결제금액</span>
          <span className="price">{formatKrw(finalTotal)}</span>
        </div>
      </div>

      <div className="cart-page-actions">
        <Link to="/" className="btn btn-secondary">
          쇼핑 계속하기
        </Link>
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedLines.length === 0}
          onClick={() =>
            navigate('/checkout', {
              state: { selectedKeys: selectedLines.map((l) => lineKey(l.product_id, l.color_name, l.size)) },
            })
          }
        >
          선택상품 주문하기
        </button>
      </div>
    </div>
  );
}
