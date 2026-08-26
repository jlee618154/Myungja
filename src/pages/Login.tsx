import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthForms.css';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from ?? '/';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <h1 className="h1 auth-title">로그인</h1>
      <form onSubmit={submit}>
        <label className="field">
          <span className="text-small">이메일</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span className="text-small">비밀번호</span>
          <div className="address-zonecode-row">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-secondary" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? '숨기기' : '표시'}
            </button>
          </div>
        </label>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="auth-links text-small">
        <Link to="/forgot-password" className="link-hover">비밀번호를 잊으셨나요?</Link>
        <Link to="/signup" className="link-hover">회원가입</Link>
      </div>
    </div>
  );
}
