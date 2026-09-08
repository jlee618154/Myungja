import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cancelPendingGuestOrder, verifyGuestPayment } from '../lib/guestOrder';
import './GuestPay.css';

// 모바일 환경 등 PortOne이 팝업이 아닌 리디렉션 방식으로 결제를 진행한 경우,
// 결제 완료 후 이 페이지로 돌아온다. 쿼리 파라미터의 code 유무로 성공/실패를 1차 판별하고,
// 최종 확정은 항상 서버(verify-payment Edge Function)의 재검증 결과를 따른다.
export default function GuestPayRedirect() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');
  const [orderNo, setOrderNo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const no = params.get('orderNo');
      const paymentId = params.get('paymentId');
      const code = params.get('code');
      setOrderNo(no);

      if (!no || !paymentId) {
        setStatus('failed');
        return;
      }
      if (code) {
        await cancelPendingGuestOrder(no, paymentId);
        setStatus('failed');
        return;
      }
      const result = await verifyGuestPayment(no, paymentId);
      setStatus(result.ok ? 'success' : 'failed');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'checking') {
    return (
      <div className="container guest-pay-redirect">
        <p className="h3">결제 결과를 확인하는 중입니다...</p>
      </div>
    );
  }

  if (status === 'success' && orderNo) {
    return (
      <div className="container guest-pay-redirect">
        <p className="h3">결제가 완료되었습니다</p>
        <Link className="btn btn-primary" to={`/order-complete/${orderNo}`}>
          주문 확인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="container guest-pay-redirect">
      <p className="h3">결제에 실패했습니다</p>
      <p className="text-small">결제가 완료되지 않았습니다. 다시 시도해 주세요.</p>
      <Link className="btn btn-secondary" to="/">
        홈으로
      </Link>
    </div>
  );
}
