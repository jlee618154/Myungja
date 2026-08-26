import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './AuthForms.css';

const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function extractParam(name: string): string | null {
  const href = window.location.href;
  const match = href.match(new RegExp(`[?&#]${name}=([^&#]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const code = extractParam('code');
      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code);
        if (err) {
          setSessionError('재설정 링크가 만료되었거나 유효하지 않습니다. 다시 요청해 주세요.');
        }
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setSessionError((prev) => prev ?? '재설정 링크가 만료되었거나 유효하지 않습니다. 다시 요청해 주세요.');
      }
      setReady(true);
    })();
  }, []);

  const passwordValid = PASSWORD_RE.test(password);
  const match = password.length > 0 && password === confirm;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passwordValid || !match) {
      setError('8자 이상, 영문·숫자·특수문자를 조합한 비밀번호를 입력해 주세요');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) {
      setError('비밀번호 변경에 실패했습니다. 다시 시도해 주세요.');
      return;
    }
    setDone(true);
    setTimeout(() => navigate('/login'), 1500);
  };

  if (!ready) return <div className="auth-page">확인 중...</div>;

  return (
    <div className="auth-page">
      <h1 className="h1 auth-title">비밀번호 재설정</h1>

      {sessionError ? (
        <p className="field-error">{sessionError}</p>
      ) : done ? (
        <p className="text-small">비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.</p>
      ) : (
        <form onSubmit={submit}>
          <label className="field">
            <span className="text-small">새 비밀번호</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <label className="field">
            <span className="text-small">새 비밀번호 확인</span>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </label>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      )}
    </div>
  );
}
