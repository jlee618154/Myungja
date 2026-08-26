import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function MyProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  const verifyPassword = async (password: string) => {
    if (!user?.email) return false;
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
    return !error;
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMsg(null);
    if (!confirmPassword) {
      setProfileError('본인 확인을 위해 현재 비밀번호를 입력해 주세요');
      return;
    }
    setSavingProfile(true);
    const ok = await verifyPassword(confirmPassword);
    if (!ok) {
      setSavingProfile(false);
      setProfileError('비밀번호가 일치하지 않습니다');
      return;
    }
    const { error } = await supabase.from('profiles').update({ name, phone }).eq('id', user!.id);
    setSavingProfile(false);
    if (error) {
      setProfileError('정보 수정에 실패했습니다');
      return;
    }
    setConfirmPassword('');
    setProfileMsg('회원정보가 수정되었습니다');
    await refreshProfile();
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwMsg(null);
    if (!PASSWORD_RE.test(newPassword) || newPassword !== newPasswordConfirm) {
      setPwError('새 비밀번호는 8자 이상 영문·숫자·특수문자를 조합해야 하며, 확인 값과 일치해야 합니다');
      return;
    }
    setSavingPw(true);
    const ok = await verifyPassword(currentPassword);
    if (!ok) {
      setSavingPw(false);
      setPwError('현재 비밀번호가 일치하지 않습니다');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) {
      setPwError('비밀번호 변경에 실패했습니다');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setPwMsg('비밀번호가 변경되었습니다');
  };

  return (
    <div>
      <h2 className="h2 my-section-title">회원정보 수정</h2>
      <form onSubmit={saveProfile} className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-7)' }}>
        <label className="field">
          <span className="text-small">이름</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field">
          <span className="text-small">휴대전화</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="field">
          <span className="text-small">현재 비밀번호 (본인 확인)</span>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </label>
        {profileError && <p className="field-error">{profileError}</p>}
        {profileMsg && <p className="field-hint">{profileMsg}</p>}
        <button type="submit" className="btn btn-primary" disabled={savingProfile}>
          정보 저장
        </button>
      </form>

      <h2 className="h2 my-section-title">비밀번호 변경</h2>
      <form onSubmit={changePassword} className="card" style={{ padding: 'var(--space-5)' }}>
        <label className="field">
          <span className="text-small">현재 비밀번호</span>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </label>
        <label className="field">
          <span className="text-small">새 비밀번호</span>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </label>
        <label className="field">
          <span className="text-small">새 비밀번호 확인</span>
          <input type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} required />
        </label>
        {pwError && <p className="field-error">{pwError}</p>}
        {pwMsg && <p className="field-hint">{pwMsg}</p>}
        <button type="submit" className="btn btn-primary" disabled={savingPw}>
          비밀번호 변경
        </button>
      </form>
    </div>
  );
}
