import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { assetUrl } from '../lib/format';
import SearchOverlay from './SearchOverlay';
import './Header.css';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

const NAV = [
  {
    label: 'TOP',
    to: '/top',
    sub: '시그니처 에어핏 브라탑',
    subTo: '/product/signature-airfit-bra',
    image: 'images/hero-3.png',
  },
  {
    label: 'BOTTOM',
    to: '/bottom',
    sub: '소프트 저지 레깅스',
    subTo: '/product/soft-jersey-leggings',
    image: 'images/leggings-brown-1.png',
  },
  {
    label: 'OUTER',
    to: '/outer',
    sub: '스웨이 온더고 자켓',
    subTo: '/product/sway-onthego-jacket',
    image: 'images/menu-outer.jpg',
  },
];

export default function Header() {
  const { user } = useAuth();
  const { totalCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const goAbout = () => {
    navigate('/');
    requestAnimationFrame(() => {
      document.getElementById('about-myungja')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  return (
    <header className="site-header">
      <div className="site-header-inner container">
        <Link to="/" className="logo en-label">
          MYUNGJA
        </Link>

        <nav className="main-nav" aria-label="주요 메뉴">
          <ul>
            {NAV.map((item) => (
              <li key={item.label} className="nav-item" tabIndex={0}>
                <Link to={item.to} className="nav-link link-hover">
                  {item.label}
                </Link>
                <div className="nav-dropdown">
                  <Link to={item.subTo} className="nav-dropdown-card">
                    <img src={assetUrl(item.image)} alt={item.sub} />
                    <span className="nav-dropdown-link link-hover">{item.sub}</span>
                  </Link>
                </div>
              </li>
            ))}
            <li className="nav-item">
              <button type="button" className="nav-link link-hover nav-link-btn" onClick={goAbout}>
                ABOUT
              </button>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn link-hover"
            aria-label="검색"
            onClick={() => setSearchOpen(true)}
          >
            <span className="icon-btn-icon">
              <SearchIcon />
            </span>
            <span className="icon-btn-label">검색</span>
          </button>
          <Link to={user ? '/my' : '/login'} className="icon-btn link-hover">
            <span className="icon-btn-icon">
              <UserIcon />
            </span>
            <span className="icon-btn-label">MY</span>
          </Link>
          <Link to="/cart" className="icon-btn cart-btn link-hover" aria-label="장바구니">
            <span className="icon-btn-icon">
              <BagIcon />
              {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
            </span>
            <span className="icon-btn-label">BAG</span>
          </Link>
        </div>
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
