import { supabase } from './supabase';

export interface VerifyResult {
  ok: boolean;
  reason?: string;
  status?: string;
}

export async function verifyGuestPayment(orderNo: string, paymentId: string): Promise<VerifyResult> {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { orderNo, paymentId },
  });
  if (error) {
    return { ok: false, reason: 'VERIFY_REQUEST_FAILED' };
  }
  return data as VerifyResult;
}

export async function cancelPendingGuestOrder(orderNo: string, paymentId: string) {
  await supabase.rpc('cancel_pending_guest_order', { p_order_no: orderNo, p_payment_id: paymentId });
}
