import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './AuthForms.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}#/reset-password`;
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setSubmitting(false);
    setSent(true);
  };

  return (
    <div className="auth-page">
      <h1 className="h1 auth-title">비밀번호 찾기</h1>

      {sent ? (
        <p className="text-small">
          입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다. 이메일이 도착하지 않았다면 스팸함도 확인해 주세요.
        </p>
      ) : (
        <form onSubmit={submit}>
          <label className="field">
            <span className="text-small">가입한 이메일</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? '전송 중...' : '재설정 링크 보내기'}
          </button>
        </form>
      )}

      <p className="auth-footer-note text-small">
        <Link to="/login" className="link-hover">로그인으로 돌아가기</Link>
      </p>
    </div>
  );
}
