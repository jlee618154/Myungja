import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './AuthForms.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const agreeAll = agreeTerms && agreePrivacy && agreeMarketing;
  const toggleAll = (checked: boolean) => {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const emailValid = EMAIL_RE.test(email);
  const passwordValid = PASSWORD_RE.test(password);
  const passwordMatch = password.length > 0 && password === passwordConfirm;

  const canSubmit = useMemo(
    () =>
      emailValid &&
      passwordValid &&
      passwordMatch &&
      name.trim().length > 0 &&
      phone.trim().length > 0 &&
      agreeTerms &&
      agreePrivacy &&
      !submitting,
    [emailValid, passwordValid, passwordMatch, name, phone, agreeTerms, agreePrivacy, submitting]
  );

  const sendPhoneCode = () => {
    if (!phone.trim()) return;
    setPhoneCodeSent(true);
    setNotice('임시로 인증번호가 발송된 것으로 처리됩니다 (실제 SMS 연동은 준비 중입니다). 아무 숫자나 입력해 확인해 주세요.');
  };

  const confirmPhoneCode = () => {
    if (phoneCode.trim().length > 0) {
      setPhoneVerified(true);
      setNotice(null);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await signUp({ email, password, name, phone, birthDate, gender });
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      navigate('/');
    } else {
      setNotice('가입이 완료되었습니다. 이메일 인증이 필요한 경우 메일함을 확인해 주세요.');
      setTimeout(() => navigate('/login'), 1500);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="h1 auth-title">회원가입</h1>
      <form onSubmit={submit}>
        <label className="field">
          <span className="text-small">이메일</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {email && !emailValid && <span className="field-error">올바른 이메일 형식이 아닙니다</span>}
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
          {password && !passwordValid && (
            <span className="field-error">8자 이상, 영문·숫자·특수문자를 조합해 주세요</span>
          )}
        </label>

        <label className="field">
          <span className="text-small">비밀번호 확인</span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
          {passwordConfirm && !passwordMatch && <span className="field-error">비밀번호가 일치하지 않습니다</span>}
        </label>

        <label className="field">
          <span className="text-small">이름</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="field">
          <span className="text-small">휴대전화</span>
          <div className="address-zonecode-row">
            <input value={phone} onChange={(e) => { setPhone(e.target.value); setPhoneVerified(false); }} placeholder="010-0000-0000" required style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={sendPhoneCode}>
              인증번호 받기
            </button>
          </div>
        </label>
        {phoneCodeSent && !phoneVerified && (
          <label className="field">
            <span className="text-small">인증번호</span>
            <div className="address-zonecode-row">
              <input value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} style={{ flex: 1 }} />
              <button type="button" className="btn btn-secondary" onClick={confirmPhoneCode}>
                확인
              </button>
            </div>
          </label>
        )}
        {phoneVerified && <p className="field-hint" style={{ marginTop: '-8px', marginBottom: 'var(--space-4)' }}>휴대전화 인증이 완료되었습니다 (임시 처리)</p>}

        <label className="field">
          <span className="text-small">생년월일 (선택)</span>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>

        <label className="field">
          <span className="text-small">성별 (선택)</span>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">선택 안 함</option>
            <option value="F">여성</option>
            <option value="M">남성</option>
            <option value="N">선택 안 함</option>
          </select>
        </label>

        <div className="field">
          <label className="checkbox-field">
            <input type="checkbox" checked={agreeAll} onChange={(e) => toggleAll(e.target.checked)} />
            전체 동의
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
            [필수] 이용약관 동의
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
            [필수] 개인정보 수집·이용 동의
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} />
            [선택] 마케팅 정보 수신 동의
          </label>
        </div>

        {notice && <p className="field-hint" style={{ marginBottom: 'var(--space-4)' }}>{notice}</p>}
        {error && (
          <p className="field-error">
            {error} {error.includes('이미 사용') && <Link to="/login" className="link-hover">로그인하기</Link>}
          </p>
        )}

        <button type="submit" className="btn btn-primary auth-submit" disabled={!canSubmit}>
          가입하기
        </button>
      </form>

      <p className="auth-footer-note text-small">
        이미 계정이 있으신가요? <Link to="/login" className="link-hover">로그인</Link>
      </p>
    </div>
  );
}
