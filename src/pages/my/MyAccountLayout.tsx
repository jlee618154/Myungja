import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyAccount.css';

const MENU = [
  { to: '/my', label: '마이페이지 요약', end: true },
  { to: '/my/orders', label: '주문내역 및 배송조회' },
  { to: '/my/addresses', label: '배송지 관리' },
  { to: '/my/reviews', label: '상품 후기 관리' },
  { to: '/my/coupons', label: '쿠폰 및 적립금' },
  { to: '/my/profile', label: '회원정보 수정 / 비밀번호 변경' },
];

export default function MyAccountLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="container my-account-page">
      <aside className="my-sidebar">
        <h1 className="h2" style={{ marginBottom: 'var(--space-5)' }}>
          MY
        </h1>
        <nav>
          <ul>
            {MENU.map((m) => (
              <li key={m.to}>
                <NavLink to={m.to} end={m.end} className={({ isActive }) => (isActive ? 'my-nav-active' : '')}>
                  {m.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button type="button" className="my-nav-btn" onClick={logout}>
                로그아웃
              </button>
            </li>
            <li>
              <NavLink to="/my/withdraw">회원 탈퇴</NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="my-content">
        <Outlet />
      </div>
    </div>
  );
}
