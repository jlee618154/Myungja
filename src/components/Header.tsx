import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { assetUrl } from '../lib/format';
import SearchOverlay from './SearchOverlay';
import MiniCart from './MiniCart';
import './Header.css';

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
  const [cartOpen, setCartOpen] = useState(false);
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
            className="icon-btn"
            aria-label="검색"
            onClick={() => setSearchOpen(true)}
          >
            검색
          </button>
          <Link to={user ? '/my' : '/login'} className="icon-btn link-hover">
            MY
          </Link>
          <button
            type="button"
            className="icon-btn cart-btn"
            aria-label="장바구니"
            onClick={() => setCartOpen(true)}
          >
            BAG
            {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
          </button>
        </div>
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {cartOpen && <MiniCart onClose={() => setCartOpen(false)} />}
    </header>
  );
}
