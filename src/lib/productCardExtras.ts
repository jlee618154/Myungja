import { supabase } from './supabase';
import type { Product } from '../types';

export interface ProductCardExtra {
  hoverImageUrl?: string;
  colors: { name: string; hex: string }[];
  isBest: boolean;
  isNew: boolean;
  popularityQty: number;
}

const NEW_WINDOW_DAYS = 14;
const BEST_RANK_CUTOFF = 3;

export async function loadProductCardExtras(products: Product[]): Promise<Record<string, ProductCardExtra>> {
  if (products.length === 0) return {};
  const ids = products.map((p) => p.id);

  const [{ data: hoverImages }, { data: options }, { data: bestsellers }] = await Promise.all([
    supabase.from('product_images').select('product_id, image_url').in('product_id', ids).eq('sort_order', 1),
    supabase.from('product_options').select('product_id, color_name, color_hex').in('product_id', ids),
    supabase.rpc('get_bestseller_products', { p_limit: 50 }),
  ]);

  const hoverMap = new Map<string, string>();
  (hoverImages ?? []).forEach((row: any) => {
    if (!hoverMap.has(row.product_id)) hoverMap.set(row.product_id, row.image_url);
  });

  const colorMap = new Map<string, Map<string, string>>();
  (options ?? []).forEach((row: any) => {
    const map = colorMap.get(row.product_id) ?? new Map<string, string>();
    map.set(row.color_name, row.color_hex);
    colorMap.set(row.product_id, map);
  });

  const rankedIds = ((bestsellers as { product_id: string; total_qty: number }[]) ?? []);
  const qtyMap = new Map(rankedIds.map((r) => [r.product_id, r.total_qty]));
  const bestSet = new Set(rankedIds.slice(0, BEST_RANK_CUTOFF).map((r) => r.product_id));

  const cutoff = Date.now() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const result: Record<string, ProductCardExtra> = {};
  products.forEach((p) => {
    const colors = colorMap.get(p.id);
    result[p.id] = {
      hoverImageUrl: hoverMap.get(p.id),
      colors: colors ? Array.from(colors, ([name, hex]) => ({ name, hex })) : [],
      isBest: bestSet.has(p.id),
      isNew: new Date(p.created_at).getTime() >= cutoff,
      popularityQty: qtyMap.get(p.id) ?? 0,
    };
  });
  return result;
}
