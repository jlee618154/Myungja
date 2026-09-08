// Supabase Edge Function: verify-payment
//
// 클라이언트(브라우저)의 "결제 성공했다"는 신호는 위조될 수 있으므로 절대 그대로 믿지 않는다.
// 여기서 PortOne 서버 API를 통해 실제 결제 상태/금액을 재조회하고, 그 결과로만 주문을 확정한다.
// 이 함수는 서비스 롤 키로만 동작하며, 클라이언트는 이 함수를 통해서만 주문을 '결제완료' 처리할 수 있다.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const PORTONE_API_SECRET = Deno.env.get('PORTONE_API_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!PORTONE_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ ok: false, reason: 'SERVER_NOT_CONFIGURED' }, 500);
  }

  let body: { orderNo?: string; paymentId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, reason: 'INVALID_BODY' }, 400);
  }

  const { orderNo, paymentId } = body;
  if (!orderNo || !paymentId) {
    return json({ ok: false, reason: 'MISSING_PARAMS' }, 400);
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: order } = await admin
    .from('orders')
    .select('order_no, payment_id, total_amount, status, is_guest')
    .eq('order_no', orderNo)
    .maybeSingle();

  if (!order || !order.is_guest || order.payment_id !== paymentId) {
    return json({ ok: false, reason: 'ORDER_NOT_FOUND' }, 404);
  }

  if (order.status !== '결제대기') {
    return json({ ok: order.status === '결제완료', reason: 'ALREADY_PROCESSED', status: order.status });
  }

  let success = false;
  let paidAmount = 0;
  try {
    const ppRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${PORTONE_API_SECRET}` },
    });
    if (ppRes.ok) {
      const payment = await ppRes.json();
      success = payment.status === 'PAID';
      paidAmount = payment.amount?.total ?? 0;
    }
  } catch {
    // success stays false -> 아래에서 주문 취소 처리
  }

  const { data: result, error } = await admin.rpc('finalize_guest_order', {
    p_order_no: orderNo,
    p_success: success,
    p_paid_amount: paidAmount,
  });

  if (error) {
    return json({ ok: false, reason: 'FINALIZE_FAILED' }, 500);
  }

  return json(result);
});
