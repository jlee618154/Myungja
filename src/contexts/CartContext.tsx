import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { CartLine, Size } from '../types';

const GUEST_KEY = 'myungja_guest_cart';

function readGuestCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(lines: CartLine[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(lines));
}

interface CartContextValue {
  lines: CartLine[];
  loading: boolean;
  totalCount: number;
  totalPrice: number;
  addToCart: (line: Omit<CartLine, 'qty'>, qty: number) => Promise<{ error: string | null }>;
  updateQty: (productId: string, color: string, size: Size, qty: number) => Promise<void>;
  removeLine: (productId: string, color: string, size: Size) => Promise<void>;
  removeLines: (keys: { productId: string; color: string; size: Size }[]) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

async function fetchSupabaseCart(userId: string): Promise<CartLine[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, color_name, size, qty, products(name, price, slug, base_image_url)')
    .eq('user_id', userId);
  if (error || !data) return [];
  return data.map((row: any) => ({
    product_id: row.product_id,
    color_name: row.color_name,
    size: row.size,
    qty: row.qty,
    name: row.products?.name ?? '',
    price: row.products?.price ?? 0,
    image_url: row.products?.base_image_url ?? '',
    slug: row.products?.slug ?? '',
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const prevUserId = useRef<string | null>(null);

  const loadForUser = async (userId: string) => {
    const merged = await fetchSupabaseCart(userId);
    setLines(merged);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      if (user) {
        // if guest just logged in, merge localStorage cart into supabase
        if (!prevUserId.current) {
          const guestLines = readGuestCart();
          for (const g of guestLines) {
            const { data: existing } = await supabase
              .from('cart_items')
              .select('id, qty')
              .eq('user_id', user.id)
              .eq('product_id', g.product_id)
              .eq('color_name', g.color_name)
              .eq('size', g.size)
              .maybeSingle();
            if (existing) {
              await supabase.from('cart_items').update({ qty: existing.qty + g.qty }).eq('id', existing.id);
            } else {
              await supabase.from('cart_items').insert({
                user_id: user.id,
                product_id: g.product_id,
                color_name: g.color_name,
                size: g.size,
                qty: g.qty,
              });
            }
          }
          if (guestLines.length) writeGuestCart([]);
        }
        await loadForUser(user.id);
      } else {
        setLines(readGuestCart());
      }
      prevUserId.current = user?.id ?? null;
      setLoading(false);
    };
    run();
  }, [user]);

  const refresh = async () => {
    if (user) await loadForUser(user.id);
    else setLines(readGuestCart());
  };

  const addToCart: CartContextValue['addToCart'] = async (line, qty) => {
    if (qty <= 0) return { error: '수량을 확인해 주세요' };
    if (user) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, qty')
        .eq('user_id', user.id)
        .eq('product_id', line.product_id)
        .eq('color_name', line.color_name)
        .eq('size', line.size)
        .maybeSingle();
      if (existing) {
        await supabase.from('cart_items').update({ qty: existing.qty + qty }).eq('id', existing.id);
      } else {
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: line.product_id,
          color_name: line.color_name,
          size: line.size,
          qty,
        });
        if (error) return { error: error.message };
      }
      await loadForUser(user.id);
    } else {
      const current = readGuestCart();
      const idx = current.findIndex(
        (l) => l.product_id === line.product_id && l.color_name === line.color_name && l.size === line.size
      );
      if (idx >= 0) current[idx].qty += qty;
      else current.push({ ...line, qty });
      writeGuestCart(current);
      setLines([...current]);
    }
    return { error: null };
  };

  const updateQty: CartContextValue['updateQty'] = async (productId, color, size, qty) => {
    if (qty <= 0) return;
    if (user) {
      await supabase
        .from('cart_items')
        .update({ qty })
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('color_name', color)
        .eq('size', size);
      await loadForUser(user.id);
    } else {
      const current = readGuestCart().map((l) =>
        l.product_id === productId && l.color_name === color && l.size === size ? { ...l, qty } : l
      );
      writeGuestCart(current);
      setLines(current);
    }
  };

  const removeLine: CartContextValue['removeLine'] = async (productId, color, size) => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('color_name', color)
        .eq('size', size);
      await loadForUser(user.id);
    } else {
      const current = readGuestCart().filter(
        (l) => !(l.product_id === productId && l.color_name === color && l.size === size)
      );
      writeGuestCart(current);
      setLines(current);
    }
  };

  const removeLines: CartContextValue['removeLines'] = async (keys) => {
    for (const k of keys) {
      await removeLine(k.productId, k.color, k.size);
    }
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      setLines([]);
    } else {
      writeGuestCart([]);
      setLines([]);
    }
  };

  const totalCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const totalPrice = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  return (
    <CartContext.Provider
      value={{ lines, loading, totalCount, totalPrice, addToCart, updateQty, removeLine, removeLines, clearCart, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
