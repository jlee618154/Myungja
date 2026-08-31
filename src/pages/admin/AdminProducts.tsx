import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { assetUrl, formatKrw } from '../../lib/format';
import type { Category, Product, ProductOption, Size } from '../../types';
import { SIZES } from '../../types';
import './Admin.css';

interface ProductRow extends Product {
  product_options: ProductOption[];
}

interface EditableOption {
  id?: string;
  color_name: string;
  color_hex: string;
  size: Size;
  stock_qty: number;
}

interface EditableProduct {
  id?: string;
  slug: string;
  category: Category;
  name: string;
  price: number;
  base_image_url: string;
  is_active: boolean;
  options: EditableOption[];
}

const EMPTY_PRODUCT: EditableProduct = {
  slug: '',
  category: 'TOP',
  name: '',
  price: 0,
  base_image_url: '',
  is_active: true,
  options: [{ color_name: '', color_hex: '#3B2C22', size: 'M', stock_qty: 0 }],
};

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditableProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    supabase
      .from('products')
      .select('*, product_options(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts((data as ProductRow[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const toggleActive = async (p: ProductRow) => {
    const { error } = await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    if (!error) setProducts((prev) => prev.map((row) => (row.id === p.id ? { ...row, is_active: !p.is_active } : row)));
  };

  const markSoldOut = async (p: ProductRow) => {
    if (!confirm(`${p.name}의 모든 옵션 재고를 0으로 처리할까요?`)) return;
    const { error } = await supabase.from('product_options').update({ stock_qty: 0 }).eq('product_id', p.id);
    if (!error) load();
  };

  const openEdit = (p?: ProductRow) => {
    if (!p) {
      setEditing({ ...EMPTY_PRODUCT, options: [{ ...EMPTY_PRODUCT.options[0] }] });
      return;
    }
    setEditing({
      id: p.id,
      slug: p.slug,
      category: p.category,
      name: p.name,
      price: p.price,
      base_image_url: p.base_image_url,
      is_active: p.is_active,
      options: p.product_options.map((o) => ({
        id: o.id,
        color_name: o.color_name,
        color_hex: o.color_hex,
        size: o.size,
        stock_qty: o.stock_qty,
      })),
    });
  };

  const updateOption = (index: number, patch: Partial<EditableOption>) => {
    setEditing((prev) =>
      prev ? { ...prev, options: prev.options.map((o, i) => (i === index ? { ...o, ...patch } : o)) } : prev
    );
  };

  const addOption = () => {
    setEditing((prev) =>
      prev ? { ...prev, options: [...prev.options, { color_name: '', color_hex: '#3B2C22', size: 'M', stock_qty: 0 }] } : prev
    );
  };

  const removeOption = (index: number) => {
    setEditing((prev) => (prev ? { ...prev, options: prev.options.filter((_, i) => i !== index) } : prev));
  };

  const handleImageUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) {
      alert('이미지 업로드에 실패했습니다: ' + error.message + '\n(product-images 스토리지 버킷이 생성되어 있는지 확인해주세요)');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    setEditing((prev) => (prev ? { ...prev, base_image_url: data.publicUrl } : prev));
    setUploading(false);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.slug) {
      alert('상품명과 slug는 필수입니다.');
      return;
    }
    setSaving(true);
    if (editing.id) {
      const { error } = await supabase
        .from('products')
        .update({
          slug: editing.slug,
          category: editing.category,
          name: editing.name,
          price: editing.price,
          base_image_url: editing.base_image_url,
          is_active: editing.is_active,
        })
        .eq('id', editing.id);
      if (error) {
        alert('저장 실패: ' + error.message);
        setSaving(false);
        return;
      }
      for (const opt of editing.options) {
        if (opt.id) {
          await supabase
            .from('product_options')
            .update({ color_name: opt.color_name, color_hex: opt.color_hex, size: opt.size, stock_qty: opt.stock_qty })
            .eq('id', opt.id);
        } else {
          await supabase.from('product_options').insert({
            product_id: editing.id,
            color_name: opt.color_name,
            color_hex: opt.color_hex,
            size: opt.size,
            stock_qty: opt.stock_qty,
          });
        }
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert({
          slug: editing.slug,
          category: editing.category,
          name: editing.name,
          price: editing.price,
          base_image_url: editing.base_image_url || 'images/hero-1.png',
          is_active: editing.is_active,
        })
        .select()
        .single();
      if (error) {
        alert('저장 실패: ' + error.message);
        setSaving(false);
        return;
      }
      for (const opt of editing.options) {
        await supabase.from('product_options').insert({
          product_id: data.id,
          color_name: opt.color_name,
          color_hex: opt.color_hex,
          size: opt.size,
          stock_qty: opt.stock_qty,
        });
      }
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  if (loading) return <p className="text-small">불러오는 중...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 className="h2" style={{ margin: 0 }}>상품관리</h1>
        <button type="button" className="btn btn-primary" onClick={() => openEdit()}>
          + 새 상품 등록
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>상품명</th>
            <th>옵션</th>
            <th>가격</th>
            <th>총 재고</th>
            <th>노출여부</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const totalStock = p.product_options.reduce((sum, o) => sum + o.stock_qty, 0);
            const colorSummary = [...new Set(p.product_options.map((o) => o.color_name))].join(', ');
            return (
              <tr key={p.id}>
                <td>
                  <img className="admin-product-thumb" src={assetUrl(p.base_image_url)} alt={p.name} />
                </td>
                <td>{p.name}</td>
                <td className="text-small">{colorSummary || '-'}</td>
                <td>{formatKrw(p.price)}</td>
                <td>{totalStock}개</td>
                <td>
                  <button type="button" className="admin-btn-sm" onClick={() => toggleActive(p)}>
                    {p.is_active ? '노출중' : '숨김'}
                  </button>
                </td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button type="button" className="admin-btn-sm" onClick={() => openEdit(p)}>
                    수정
                  </button>
                  <button type="button" className="admin-btn-sm danger" onClick={() => markSoldOut(p)}>
                    품절처리
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editing && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="admin-modal">
            <h2 className="h3 admin-modal-title">{editing.id ? '상품 수정' : '새 상품 등록'}</h2>

            <div className="admin-form-row">
              <label>상품명</label>
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev ? { ...prev, name: e.target.value, slug: prev.id ? prev.slug : slugify(e.target.value) } : prev
                  )
                }
              />
            </div>
            <div className="admin-form-row">
              <label>slug</label>
              <input value={editing.slug} onChange={(e) => setEditing((prev) => (prev ? { ...prev, slug: e.target.value } : prev))} />
            </div>
            <div className="admin-form-row">
              <label>카테고리</label>
              <select
                value={editing.category}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, category: e.target.value as Category } : prev))}
              >
                <option value="TOP">TOP</option>
                <option value="BOTTOM">BOTTOM</option>
                <option value="OUTER">OUTER</option>
              </select>
            </div>
            <div className="admin-form-row">
              <label>가격</label>
              <input
                type="number"
                value={editing.price}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, price: Number(e.target.value) } : prev))}
              />
            </div>
            <div className="admin-form-row">
              <label>대표 이미지</label>
              {editing.base_image_url && (
                <img
                  className="admin-product-thumb"
                  style={{ marginBottom: 8 }}
                  src={editing.base_image_url.startsWith('http') ? editing.base_image_url : assetUrl(editing.base_image_url)}
                  alt=""
                />
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
              {uploading && <p className="text-small">업로드 중...</p>}
            </div>
            <div className="admin-form-row">
              <label>
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, is_active: e.target.checked } : prev))}
                  style={{ width: 'auto', marginRight: 6 }}
                />
                노출 (체크 해제 시 스토어프론트에서 숨김)
              </label>
            </div>

            <div className="admin-form-row">
              <label>색상/사이즈별 재고</label>
              {editing.options.map((opt, i) => (
                <div key={i} className="admin-option-row">
                  <input
                    placeholder="색상명"
                    value={opt.color_name}
                    onChange={(e) => updateOption(i, { color_name: e.target.value })}
                  />
                  <input
                    type="color"
                    value={opt.color_hex}
                    onChange={(e) => updateOption(i, { color_hex: e.target.value })}
                  />
                  <select value={opt.size} onChange={(e) => updateOption(i, { size: e.target.value as Size })}>
                    {SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={opt.stock_qty}
                    onChange={(e) => updateOption(i, { stock_qty: Number(e.target.value) })}
                  />
                  <button type="button" className="admin-btn-sm danger" onClick={() => removeOption(i)}>
                    삭제
                  </button>
                </div>
              ))}
              <button type="button" className="admin-btn-sm" onClick={addOption}>
                + 옵션 추가
              </button>
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                취소
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
