export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const cartLineKey = (productId: string, color: string, size: string) => `${productId}__${color}__${size}`;

export const formatKrw = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};
