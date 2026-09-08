import * as PortOne from '@portone/browser-sdk/v2';

export type GuestPayMethod = '카카오페이' | '네이버페이';

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID as string | undefined;

const CHANNEL_KEYS: Record<GuestPayMethod, string | undefined> = {
  카카오페이: import.meta.env.VITE_PORTONE_CHANNEL_KEY_KAKAOPAY as string | undefined,
  네이버페이: import.meta.env.VITE_PORTONE_CHANNEL_KEY_NAVERPAY as string | undefined,
};

const EASY_PAY_PROVIDER: Record<GuestPayMethod, string> = {
  카카오페이: 'KAKAOPAY',
  네이버페이: 'NAVERPAY',
};

export function isPortOneConfigured(method: GuestPayMethod) {
  return Boolean(STORE_ID && CHANNEL_KEYS[method]);
}

export interface EasyPaymentParams {
  method: GuestPayMethod;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  redirectUrl: string;
}

export async function requestEasyPayment(params: EasyPaymentParams) {
  return PortOne.requestPayment({
    storeId: STORE_ID as string,
    channelKey: CHANNEL_KEYS[params.method] as string,
    paymentId: params.paymentId,
    orderName: params.orderName,
    totalAmount: params.totalAmount,
    currency: 'CURRENCY_KRW',
    payMethod: 'EASY_PAY',
    easyPay: { easyPayProvider: EASY_PAY_PROVIDER[params.method] as any },
    customer: {
      fullName: params.customerName,
      phoneNumber: params.customerPhone,
      email: params.customerEmail,
    },
    redirectUrl: params.redirectUrl,
  });
}
