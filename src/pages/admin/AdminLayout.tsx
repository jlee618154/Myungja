import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const NAV = [
  { to: '/admin', label: '대시보드', end: true },
  { to: '/admin/orders', label: '주문관리', end: false },
  { to: '/admin/products', label: '상품관리', end: false },
  { to: '/admin/analytics', label: '매출통계', end: false },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo en-label">MYUNGJA</div>
        <p className="admin-logo-sub">Admin Dashboard</p>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
