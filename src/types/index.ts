export type Category = 'TOP' | 'BOTTOM' | 'OUTER';
export type Size = 'S' | 'M' | 'L' | 'XL';
export const SIZES: Size[] = ['S', 'M', 'L', 'XL'];

export interface Product {
  id: string;
  slug: string;
  category: Category;
  name: string;
  price: number;
  summary: string | null;
  concept: string | null;
  fit: string | null;
  movement: string | null;
  material: string | null;
  care: string | null;
  activity: string | null;
  base_image_url: string;
  fullscreen_image_url: string | null;
  rating: number;
  review_count: number;
}

export interface ProductOption {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  size: Size;
  stock_qty: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  color_name: string;
  sort_order: number;
  image_url: string;
}

export interface ProductDetail extends Product {
  options: ProductOption[];
  images: ProductImage[];
}

export interface CartLine {
  product_id: string;
  color_name: string;
  size: Size;
  qty: number;
  // denormalized for display without refetching
  name: string;
  price: number;
  image_url: string;
  slug: string;
  stock_qty?: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  zonecode: string;
  address1: string;
  address2: string | null;
  is_default: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_no: string;
  status: string;
  recipient_name: string;
  recipient_phone: string;
  zonecode: string;
  address1: string;
  address2: string | null;
  subtotal: number;
  shipping_fee: number;
  coupon_discount: number;
  points_used: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  color_name: string;
  size: Size;
  qty: number;
  unit_price: number;
}

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  membership_grade: string;
}

export interface UserCoupon {
  id: string;
  is_used: boolean;
  coupon: {
    id: string;
    code: string;
    description: string;
    discount_type: 'fixed' | 'percent';
    discount_value: number;
    min_order_amount: number;
    valid_until: string;
  };
}
