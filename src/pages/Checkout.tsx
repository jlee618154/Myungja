import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { assetUrl, cartLineKey, formatKrw } from '../lib/format';
import AddressFields, { AddressValue } from '../components/AddressFields';
import type { Address, UserCoupon } from '../types';
import './Checkout.css';

const PAYMENT_METHODS = ['신용카드/체크카드', '간편결제', '계좌이체', '가상계좌', '휴대전화 결제'];

const emptyAddress: AddressValue = { recipient_name: '', phone: '', zonecode: '', address1: '', address2: '' };

export default function Checkout() {
  const { user, profile } = useAuth();
  const { lines, refresh } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKeys: string[] | undefined = (location.state as any)?.selectedKeys;
  const checkoutLines = useMemo(
    () =>
      selectedKeys
        ? lines.filter((l) => selectedKeys.includes(cartLineKey(l.product_id, l.color_name, l.size)))
        : lines,
    [lines, selectedKeys]
  );

  const [ordererName, setOrdererName] = useState('');
  const [ordererPhone, setOrdererPhone] = useState('');
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [address, setAddress] = useState<AddressValue>(emptyAddress);
  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [couponId, setCouponId] = useState<string>('');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [agree, setAgree] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setOrdererName(profile.name ?? '');
      setOrdererPhone(profile.phone ?? '');
    }
  }, [profile]);

  useEffect(() => {
    if (sameAsOrderer) {
      setAddress((a) => ({ ...a, recipient_name: ordererName, phone: ordererPhone }));
    }
  }, [sameAsOrderer, ordererName, ordererPhone]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        const list = (data as Address[]) ?? [];
        setSavedAddresses(list);
        const def = list.find((a) => a.is_default) ?? list[0];
        if (def) {
          setSelectedAddressId(def.id);
          setAddress({
            recipient_name: def.recipient_name,
            phone: def.phone,
            zonecode: def.zonecode,
            address1: def.address1,
            address2: def.address2 ?? '',
          });
          setSameAsOrderer(false);
        }
      });

    supabase
      .from('user_coupons')
      .select('id, is_used, coupon:coupons(id, code, description, discount_type, discount_value, min_order_amount, valid_until)')
      .eq('user_id', user.id)
      .eq('is_used', false)
      .then(({ data }) => setCoupons((data as any) ?? []));

    supabase
      .from('points')
      .select('amount, type')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const balance = (data ?? []).reduce(
          (sum: number, r: any) => sum + (r.type === 'earn' ? r.amount : -r.amount),
          0
        );
        setPointsBalance(Math.max(0, balance));
      });
  }, [user]);

  const subtotal = checkoutLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const shipping = subtotal > 0 && subtotal < 30000 ? 3000 : 0;
  const selectedCoupon = coupons.find((c) => c.id === couponId)?.coupon;
  const couponDiscount = useMemo(() => {
    if (!selectedCoupon || subtotal < selectedCoupon.min_order_amount) return 0;
    return selectedCoupon.discount_type === 'percent'
      ? Math.floor((subtotal * selectedCoupon.discount_value) / 100)
      : selectedCoupon.discount_value;
  }, [selectedCoupon, subtotal]);
  const maxPoints = Math.max(0, Math.min(pointsBalance, subtotal + shipping - couponDiscount));
  const total = Math.max(0, subtotal + shipping - couponDiscount - pointsToUse);

  const onSelectSavedAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setAddress({ recipient_name: sameAsOrderer ? ordererName : '', phone: sameAsOrderer ? ordererPhone : '', zonecode: '', address1: '', address2: '' });
      return;
    }
    const found = savedAddresses.find((a) => a.id === id);
    if (found) {
      setSameAsOrderer(false);
      setAddress({
        recipient_name: found.recipient_name,
        phone: found.phone,
        zonecode: found.zonecode,
        address1: found.address1,
        address2: found.address2 ?? '',
      });
    }
  };

  const canSubmit =
    checkoutLines.length > 0 &&
    ordererName &&
    ordererPhone &&
    address.recipient_name &&
    address.phone &&
    address.zonecode &&
    address.address1 &&
    agree &&
    !submitting;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const { data, error: err } = await supabase.rpc('checkout_create_order', {
      p_items: checkoutLines.map((l) => ({
        product_id: l.product_id,
        color_name: l.color_name,
        size: l.size,
        qty: l.qty,
      })),
      p_orderer_name: ordererName,
      p_orderer_phone: ordererPhone,
      p_recipient_name: address.recipient_name,
      p_recipient_phone: address.phone,
      p_zonecode: address.zonecode,
      p_address1: address.address1,
      p_address2: address.address2,
      p_delivery_request: deliveryRequest,
      p_coupon_id: couponId || null,
      p_points_to_use: pointsToUse,
      p_payment_method: paymentMethod,
    });
    setSubmitting(false);
    if (err) {
      setError(
        err.message.includes('OUT_OF_STOCK')
          ? '선택하신 상품의 재고가 부족합니다. 수량을 확인해 주세요.'
          : '결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
      return;
    }
    await refresh();
    navigate(`/order-complete/${data}`);
  };

  if (checkoutLines.length === 0) {
    return (
      <div className="container checkout-empty">
        <p className="text-small">주문할 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <form className="container checkout-page" onSubmit={submit}>
      <div className="checkout-main">
        <h1 className="h1">주문/결제</h1>

        <section className="checkout-section">
          <h2 className="h3">주문자 정보</h2>
          <label className="field">
            <span className="text-small">이름</span>
            <input value={ordererName} onChange={(e) => setOrdererName(e.target.value)} required />
          </label>
          <label className="field">
            <span className="text-small">연락처</span>
            <input value={ordererPhone} onChange={(e) => setOrdererPhone(e.target.value)} required />
          </label>
        </section>

        <section className="checkout-section">
          <h2 className="h3">배송지 정보</h2>

          {savedAddresses.length > 0 && (
            <label className="field">
              <span className="text-small">최근 배송지 목록</span>
              <select value={selectedAddressId} onChange={(e) => onSelectSavedAddress(e.target.value)}>
                {savedAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label ? `[${a.label}] ` : ''}
                    {a.recipient_name} · {a.address1} {a.is_default ? '(기본)' : ''}
                  </option>
                ))}
                <option value="new">새 배송지 입력</option>
              </select>
            </label>
          )}

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={sameAsOrderer}
              onChange={(e) => setSameAsOrderer(e.target.checked)}
            />
            주문자 정보와 동일
          </label>

          <AddressFields value={address} onChange={setAddress} idPrefix="checkout" />

          <label className="field">
            <span className="text-small">배송 요청사항</span>
            <input value={deliveryRequest} onChange={(e) => setDeliveryRequest(e.target.value)} placeholder="예: 부재 시 경비실에 맡겨주세요" />
          </label>
        </section>

        <section className="checkout-section">
          <h2 className="h3">주문 상품</h2>
          <div className="checkout-items">
            {checkoutLines.map((l) => (
              <div key={cartLineKey(l.product_id, l.color_name, l.size)} className="checkout-item">
                <img src={assetUrl(l.image_url)} alt={l.name} />
                <div>
                  <p className="h3">{l.name}</p>
                  <p className="text-small">
                    {l.color_name} / {l.size} · {l.qty}개
                  </p>
                </div>
                <span className="price">{formatKrw(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
        </section>

        {user && (
          <section className="checkout-section">
            <h2 className="h3">쿠폰 · 적립금</h2>
            <label className="field">
              <span className="text-small">쿠폰</span>
              <select value={couponId} onChange={(e) => setCouponId(e.target.value)}>
                <option value="">사용 안 함</option>
                {coupons.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.coupon.description}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="text-small">적립금 (보유: {pointsBalance.toLocaleString('ko-KR')}P)</span>
              <input
                type="number"
                min={0}
                max={maxPoints}
                value={pointsToUse}
                onChange={(e) => setPointsToUse(Math.max(0, Math.min(maxPoints, Number(e.target.value))))}
              />
            </label>
          </section>
        )}

        <section className="checkout-section">
          <h2 className="h3">결제 수단</h2>
          <p className="text-small" style={{ marginBottom: 'var(--space-3)' }}>
            실제 서비스 오픈 전까지 모의결제로 진행됩니다. 카드 정보는 저장되지 않습니다.
          </p>
          <div className="payment-methods">
            {PAYMENT_METHODS.map((m) => (
              <label key={m} className="checkbox-field">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === m}
                  onChange={() => setPaymentMethod(m)}
                />
                {m}
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className="checkout-summary card">
        <h2 className="h3">결제 금액</h2>
        <div className="checkout-summary-row">
          <span>상품금액</span>
          <span>{formatKrw(subtotal)}</span>
        </div>
        <div className="checkout-summary-row">
          <span>배송비</span>
          <span>{shipping === 0 ? '무료' : formatKrw(shipping)}</span>
        </div>
        <div className="checkout-summary-row">
          <span>쿠폰 할인</span>
          <span>-{formatKrw(couponDiscount)}</span>
        </div>
        <div className="checkout-summary-row">
          <span>적립금 사용</span>
          <span>-{formatKrw(pointsToUse)}</span>
        </div>
        <div className="checkout-summary-row checkout-summary-total">
          <span>최종 결제금액</span>
          <span className="price">{formatKrw(total)}</span>
        </div>

        <label className="checkbox-field">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          주문 내용을 확인했으며 결제에 동의합니다
        </label>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn btn-primary checkout-submit" disabled={!canSubmit}>
          {submitting ? '결제 처리 중...' : `${formatKrw(total)} 결제하기`}
        </button>
      </aside>
    </form>
  );
}
