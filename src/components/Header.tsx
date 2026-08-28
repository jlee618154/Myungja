import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { assetUrl } from '../lib/format';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { HERO_SCROLL_DISTANCE } from '../lib/constants';
import SearchOverlay from './SearchOverlay';
import './Header.css';

const WHITE: [number, number, number] = [255, 255, 255];
const DARK_BROWN: [number, number, number] = [59, 44, 34];
const BORDER: [number, number, number] = [220, 212, 200];
const IVORY: [number, number, number] = [247, 243, 236];

function lerp(from: number, to: number, t: number) {
  return Math.round(from + (to - from) * t);
}

function lerpRgb(from: [number, number, number], to: [number, number, number], t: number) {
  return `rgb(${lerp(from[0], to[0], t)}, ${lerp(from[1], to[1], t)}, ${lerp(from[2], to[2], t)})`;
}

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
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const headerRef = useRef<HTMLElement>(null);

  const scrollProgress = useScrollProgress(HERO_SCROLL_DISTANCE, isHome);

  const headerStyle = isHome
    ? {
        backgroundColor: `rgba(${IVORY.join(', ')}, ${(scrollProgress * 0.85).toFixed(3)})`,
        color: lerpRgb(WHITE, DARK_BROWN, scrollProgress),
        borderBottomColor: `rgba(${BORDER.join(', ')}, ${scrollProgress.toFixed(3)})`,
      }
    : undefined;

  useEffect(() => {
    setActiveNav(null);
  }, [location.pathname]);

  const goAbout = () => {
    navigate('/');
    requestAnimationFrame(() => {
      document.getElementById('about-myungja')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const closeIfFocusLeft = (e: React.FocusEvent) => {
    if (!headerRef.current?.contains(e.relatedTarget as Node)) {
      setActiveNav(null);
    }
  };

  return (
    <header
      ref={headerRef}
      className={`site-header ${!isHome ? 'scrolled' : ''}`}
      style={headerStyle}
      onMouseLeave={() => setActiveNav(null)}
      onBlur={closeIfFocusLeft}
    >
      <div className="site-header-inner">
        <Link to="/" className="logo en-label">
          MYUNGJA
        </Link>

        <nav className="main-nav" aria-label="주요 메뉴">
          <ul>
            {NAV.map((item) => (
              <li
                key={item.label}
                className="nav-item"
                onMouseEnter={() => setActiveNav(item.label)}
              >
                <Link
                  to={item.to}
                  className="nav-link link-hover"
                  onFocus={() => setActiveNav(item.label)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="nav-item" onMouseEnter={() => setActiveNav(null)}>
              <button
                type="button"
                className="nav-link link-hover nav-link-btn"
                onFocus={() => setActiveNav(null)}
                onClick={goAbout}
              >
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

      <div className={`nav-submenu-bar ${activeNav ? 'open' : ''}`}>
        <div className="nav-submenu-inner">
          {NAV.map((item) => (
            <div
              key={item.label}
              className={`nav-submenu-panel ${activeNav === item.label ? 'visible' : ''}`}
            >
              <Link to={item.subTo} className="nav-submenu-link link-hover">
                <img src={assetUrl(item.image)} alt={item.sub} />
                <span>{item.sub}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
