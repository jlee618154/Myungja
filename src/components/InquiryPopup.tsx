import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './InquiryPopup.css';

const TYPES = ['상품 문의', '주문/배송 문의', '교환/환불 문의', '기타 문의'];

export default function InquiryPopup() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [content, setContent] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setEmail('');
    setType(TYPES[0]);
    setContent('');
    setAgree(false);
    setDone(false);
    setError(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !content || !agree) {
      setError('필수 항목을 모두 입력하고 개인정보 수집에 동의해 주세요');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.from('inquiries').insert({
      user_id: user?.id ?? null,
      name,
      email,
      inquiry_type: type,
      content,
    });
    setSubmitting(false);
    if (err) {
      setError('문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요');
      return;
    }
    setDone(true);
  };

  return (
    <>
      <button type="button" className="inquiry-fab" onClick={() => setOpen(true)}>
        1:1 문의
      </button>

      {open && (
        <div className="inquiry-overlay" role="dialog" aria-modal="true" aria-label="1:1 문의">
          <div className="inquiry-panel card">
            <div className="inquiry-header">
              <h3 className="h3">1:1 문의</h3>
              <button type="button" className="inquiry-close" onClick={close} aria-label="닫기">
                닫기
              </button>
            </div>

            {done ? (
              <div className="inquiry-done">
                <p>문의가 접수되었습니다. 빠르게 확인 후 안내드리겠습니다.</p>
                <button type="button" className="btn btn-primary" onClick={close}>
                  확인
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="inquiry-form">
                <label className="field">
                  <span className="text-small">이름</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <label className="field">
                  <span className="text-small">이메일</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label className="field">
                  <span className="text-small">문의 유형</span>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="text-small">문의 내용</span>
                  <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
                </label>
                <label className="checkbox-field text-small">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  개인정보 수집·이용에 동의합니다 (필수)
                </label>

                {error && <p className="field-error">{error}</p>}

                <div className="inquiry-actions">
                  <button type="button" className="btn btn-secondary" onClick={close}>
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? '전송 중...' : '문의하기'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
