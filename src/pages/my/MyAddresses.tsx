import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AddressFields, { AddressValue } from '../../components/AddressFields';
import type { Address } from '../../types';

const empty: AddressValue = { recipient_name: '', phone: '', zonecode: '', address1: '', address2: '' };

export default function MyAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState<AddressValue>(empty);
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    setAddresses((data as Address[]) ?? []);
  };

  useEffect(() => {
    load();
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    if (isDefault) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    }
    await supabase.from('addresses').insert({
      user_id: user.id,
      label: label || null,
      recipient_name: value.recipient_name,
      phone: value.phone,
      zonecode: value.zonecode,
      address1: value.address1,
      address2: value.address2,
      is_default: isDefault || addresses.length === 0,
    });
    setSubmitting(false);
    setAdding(false);
    setLabel('');
    setValue(empty);
    setIsDefault(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) return;
    await supabase.from('addresses').delete().eq('id', id);
    await load();
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    await load();
  };

  return (
    <div>
      <h2 className="h2 my-section-title">배송지 관리</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {addresses.length === 0 && <p className="text-small">등록된 배송지가 없습니다.</p>}
        {addresses.map((a) => (
          <div key={a.id} className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="h3">
                {a.label ? `[${a.label}] ` : ''}
                {a.recipient_name} {a.is_default && <span className="text-small" style={{ color: 'var(--color-teal)' }}>(기본 배송지)</span>}
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {!a.is_default && (
                  <button type="button" className="link-hover text-small" onClick={() => setDefault(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    기본으로 설정
                  </button>
                )}
                <button type="button" className="link-hover text-small" onClick={() => remove(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  삭제
                </button>
              </div>
            </div>
            <p className="text-small">{a.phone}</p>
            <p className="text-small">
              ({a.zonecode}) {a.address1} {a.address2}
            </p>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={submit} className="card" style={{ padding: 'var(--space-5)' }}>
          <label className="field">
            <span className="text-small">배송지 별칭 (선택)</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: 집, 회사" />
          </label>
          <AddressFields value={value} onChange={setValue} idPrefix="my-addr" />
          <label className="checkbox-field">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            기본 배송지로 설정
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              저장
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-secondary" onClick={() => setAdding(true)}>
          배송지 추가
        </button>
      )}
    </div>
  );
}
