import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { assetUrl, formatKrw } from '../lib/format';
import AddressFields, { AddressValue } from '../components/AddressFields';
import { isPortOneConfigured, requestEasyPayment, GuestPayMethod } from '../lib/portone';
import { cancelPendingGuestOrder, verifyGuestPayment } from '../lib/guestOrder';
import type { Size } from '../types';
import './GuestPay.css';

interface GuestPayItem {
  product_id: string;
  color_name: string;
  size: Size;
  qty: number;
  name: string;
  price: number;
  image_url: string;
  top_color_name?: string;
  top_size?: Size;
  bottom_color_name?: string;
  bottom_size?: Size;
}

const emptyAddress: AddressValue = { recipient_name: '', phone: '', zonecode: '', address1: '', address2: '' };

function redirectUrlFor(orderNo: string, paymentId: string) {
  return `${window.location.origin}${import.meta.env.BASE_URL}#/pay/guest/redirect?orderNo=${encodeURIComponent(
    orderNo
  )}&paymentId=${encodeURIComponent(paymentId)}`;
}

export default function GuestPay() {
  const location = useLocation();
  const navigate = useNavigate();

  const item = (location.state as any)?.item as GuestPayItem | undefined;
  const method = (location.state as any)?.presetPaymentMethod as GuestPayMethod | undefined;

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [address, setAddress] = useState<AddressValue>(emptyAddress);
  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [agree, setAgree] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'form' | 'paying'>('form');
  const [error, setError] = useState<string | null>(null);

  if (!item || !method) {
    return (
      <div className="container guest-pay-empty">
        <p className="text-small">잘못된 접근입니다. 상품 상세 페이지에서 다시 시도해 주세요.</p>
      </div>
    );
  }

  if (!isPortOneConfigured(method)) {
    return (
      <div className="container guest-pay-empty">
        <p className="h3">결제 연동 준비 중입니다</p>
        <p className="text-small">
          {method} 결제를 이용하려면 PortOne(포트원) 테스트 상점 정보(storeId / channelKey)를 환경변수에 설정해야 합니다.
        </p>
      </div>
    );
  }

  const subtotal = item.price * item.qty;
  const shipping = subtotal > 0 && subtotal < 30000 ? 3000 : 0;
  const total = subtotal + shipping;

  const onSameAsOrderer = (checked: boolean) => {
    setSameAsOrderer(checked);
    if (checked) {
      setAddress((a) => ({ ...a, recipient_name: guestName, phone: guestPhone }));
    }
  };

  const canSubmit =
    guestName && guestPhone && guestEmail &&
    address.recipient_name && address.phone && address.zonecode && address.address1 &&
    agree && !submitting;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const { data, error: createErr } = await supabase.rpc('create_guest_order', {
      p_items: [
        {
          product_id: item.product_id,
          color_name: item.color_name,
          size: item.size,
          qty: item.qty,
          top_color_name: item.top_color_name,
          top_size: item.top_size,
          bottom_color_name: item.bottom_color_name,
          bottom_size: item.bottom_size,
        },
      ],
      p_guest_name: guestName,
      p_guest_phone: guestPhone,
      p_guest_email: guestEmail,
      p_recipient_name: address.recipient_name,
      p_recipient_phone: address.phone,
      p_zonecode: address.zonecode,
      p_address1: address.address1,
      p_address2: address.address2,
      p_delivery_request: deliveryRequest,
      p_payment_method: method,
    });

    if (createErr || !data) {
      setSubmitting(false);
      setError(
        createErr?.message.includes('OUT_OF_STOCK')
          ? '선택하신 상품의 재고가 부족합니다.'
          : '주문 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
      return;
    }

    const { order_no: orderNo, payment_id: paymentId, total_amount: totalAmount } = data as {
      order_no: string;
      payment_id: string;
      total_amount: number;
    };

    setStage('paying');

    let response;
    try {
      response = await requestEasyPayment({
        method,
        paymentId,
        orderName: item.qty > 1 ? `${item.name} 외 ${item.qty - 1}개` : item.name,
        totalAmount,
        customerName: guestName,
        customerPhone: guestPhone,
        customerEmail: guestEmail,
        redirectUrl: redirectUrlFor(orderNo, paymentId),
      });
    } catch {
      response = { code: 'CLIENT_ERROR', message: '결제창을 여는 중 오류가 발생했습니다.' } as any;
    }

    // 리디렉션(모바일) 방식은 여기로 돌아오지 않고 페이지가 이동하므로, response가 있는 경우만 처리한다.
    if (!response) return;

    if (response.code) {
      await cancelPendingGuestOrder(orderNo, paymentId);
      setStage('form');
      setSubmitting(false);
      setError(response.message ?? '결제가 취소되었습니다.');
      return;
    }

    const result = await verifyGuestPayment(orderNo, paymentId);
    if (result.ok) {
      navigate(`/order-complete/${orderNo}`);
    } else {
      setStage('form');
      setSubmitting(false);
      setError('결제 확인에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <form className="container guest-pay-page" onSubmit={submit}>
      <div className="guest-pay-main">
        <p className={`mock-pay-badge ${method === '카카오페이' ? 'mock-pay-badge-kakao' : 'mock-pay-badge-naver'}`}>
          {method}
        </p>
        <h1 className="h1">{method} 비회원 결제</h1>
        <p className="text-small guest-pay-lead">회원가입 없이 바로 결제하실 수 있습니다.</p>

        <section className="checkout-section">
          <h2 className="h3">주문 상품</h2>
          <div className="checkout-item">
            <img src={assetUrl(item.image_url)} alt={item.name} />
            <div>
              <p className="h3">{item.name}</p>
              <p className="text-small">
                {item.top_color_name
                  ? `상의: ${item.top_color_name} / ${item.top_size} · 하의: ${item.bottom_color_name} / ${item.bottom_size}`
                  : `${item.color_name} / ${item.size}`}{' '}
                · {item.qty}개
              </p>
            </div>
            <span className="price">{formatKrw(subtotal)}</span>
          </div>
        </section>

        <section className="checkout-section">
          <h2 className="h3">주문자 정보</h2>
          <label className="field">
            <span className="text-small">이름</span>
            <input value={guestName} onChange={(e) => { setGuestName(e.target.value); if (sameAsOrderer) setAddress((a) => ({ ...a, recipient_name: e.target.value })); }} required />
          </label>
          <label className="field">
            <span className="text-small">연락처</span>
            <input value={guestPhone} onChange={(e) => { setGuestPhone(e.target.value); if (sameAsOrderer) setAddress((a) => ({ ...a, phone: e.target.value })); }} placeholder="010-0000-0000" required />
          </label>
          <label className="field">
            <span className="text-small">이메일</span>
            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="order@example.com" required />
          </label>
        </section>

        <section className="checkout-section">
          <h2 className="h3">배송지 정보</h2>
          <label className="checkbox-field">
            <input type="checkbox" checked={sameAsOrderer} onChange={(e) => onSameAsOrderer(e.target.checked)} />
            주문자 정보와 동일
          </label>
          <AddressFields value={address} onChange={setAddress} idPrefix="guest-pay" />
          <label className="field">
            <span className="text-small">배송 요청사항</span>
            <input value={deliveryRequest} onChange={(e) => setDeliveryRequest(e.target.value)} placeholder="예: 부재 시 경비실에 맡겨주세요" />
          </label>
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
        <div className="checkout-summary-row checkout-summary-total">
          <span>최종 결제금액</span>
          <span className="price">{formatKrw(total)}</span>
        </div>

        <label className="checkbox-field">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          주문 내용을 확인했으며 결제에 동의합니다
        </label>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className={`btn checkout-submit ${method === '카카오페이' ? 'btn-kakaopay' : 'btn-naverpay'}`} disabled={!canSubmit}>
          {stage === 'paying' ? '결제 진행 중...' : submitting ? '처리 중...' : `${formatKrw(total)} ${method}로 결제`}
        </button>

        <button type="button" className="text-small guest-pay-back" onClick={() => navigate(-1)}>
          이전으로 돌아가기
        </button>
      </aside>
    </form>
  );
}
