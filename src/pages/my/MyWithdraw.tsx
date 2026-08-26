import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function MyWithdraw() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const verifyAndProceed = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: user.email, password });
    setSubmitting(false);
    if (err) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    setStep('confirm');
  };

  const finalWithdraw = async () => {
    await signOut();
    navigate('/', { state: { withdrawn: true } });
  };

  return (
    <div>
      <h2 className="h2 my-section-title">회원 탈퇴</h2>

      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <p className="text-small">
          회원 탈퇴 시 보유하신 적립금과 쿠폰은 모두 소멸되며, 진행 중인 주문·배송 내역은 별도로 보관됩니다. 탈퇴
          처리는 본인 확인 후 접수되며, 접수 즉시 계정이 즉시 삭제되지는 않고 안내된 절차에 따라 처리됩니다.
        </p>
      </div>

      {step === 'form' ? (
        <form onSubmit={verifyAndProceed} className="card" style={{ padding: 'var(--space-5)' }}>
          <label className="field">
            <span className="text-small">비밀번호 확인</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            다음
          </button>
        </form>
      ) : (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <p style={{ marginBottom: 'var(--space-5)' }}>정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setStep('form')}>
              취소
            </button>
            <button type="button" className="btn btn-primary" onClick={finalWithdraw}>
              탈퇴 신청 접수
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
