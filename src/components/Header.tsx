import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
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

type MenuEntry =
  | { kind: 'link'; label: string; to: string }
  | { kind: 'section'; label: string; sectionId: string };

const MENU: MenuEntry[] = [
  { kind: 'link', label: 'NEW', to: '/' },
  { kind: 'link', label: 'TOP', to: '/top' },
  { kind: 'link', label: 'BOTTOM', to: '/bottom' },
  { kind: 'link', label: 'SET', to: '/' },
  { kind: 'link', label: 'OUTER', to: '/outer' },
  { kind: 'section', label: 'MD PICK', sectionId: 'md-pick-section' },
  { kind: 'section', label: 'ABOUT', sectionId: 'about-myungja' },
];

// 상품 스키마에 하위 카테고리 데이터가 없어, 메가메뉴용 하위 항목은 큐레이션된 고정 목록으로 구성.
// NEW/SET은 아직 별도 카테고리/페이지가 없어 홈으로 연결(실제 카테고리 페이지가 생기면 교체 필요).
const SUBMENU: Record<string, { label: string; to: string }[]> = {
  NEW: [
    { label: '이주의 신상', to: '/' },
    { label: '베스트셀러', to: '/' },
  ],
  TOP: [
    { label: '브라탑', to: '/top' },
    { label: '티셔츠', to: '/top' },
    { label: '니트', to: '/top' },
    { label: '후드', to: '/top' },
  ],
  BOTTOM: [
    { label: '레깅스', to: '/bottom' },
    { label: '반바지', to: '/bottom' },
    { label: '조거팬츠', to: '/bottom' },
  ],
  SET: [
    { label: '브라탑 + 레깅스 세트', to: '/' },
    { label: '위아래 세트', to: '/' },
  ],
  OUTER: [
    { label: '자켓', to: '/outer' },
    { label: '베스트', to: '/outer' },
    { label: '가디건', to: '/outer' },
  ],
  'MD PICK': [
    { label: '등산', to: '/md/hiking' },
    { label: '마라톤', to: '/md/marathon' },
    { label: '요가', to: '/md/yoga' },
  ],
};

export default function Header() {
  const { user } = useAuth();
  const { totalCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setActiveNav(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    const getThreshold = () => Math.max(window.innerHeight - (headerRef.current?.offsetHeight ?? 88), 200);
    let threshold = getThreshold();
    const onResize = () => {
      threshold = getThreshold();
    };
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isHome]);

  useEffect(() => {
    if (!activeNav) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setActiveNav(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [activeNav]);

  const goToSection = (sectionId: string) => {
    navigate('/');
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    });
    setActiveNav(null);
  };

  const closeIfFocusLeft = (e: React.FocusEvent) => {
    if (!headerRef.current?.contains(e.relatedTarget as Node)) {
      setActiveNav(null);
    }
  };

  return (
    <header
      ref={headerRef}
      className={`site-header ${isHome ? 'site-header-overlay' : ''} ${isHome && scrolled ? 'site-header-scrolled' : ''}`}
      onMouseLeave={() => setActiveNav(null)}
      onBlur={closeIfFocusLeft}
    >
      <div className="announcement-bar">
        MEMBER 가입 시 첫 구매 15% 할인 · 5만원 이상 무료배송
      </div>

      <div className="site-header-inner">
        <Link to="/" className="logo en-label">
          MYUNGJA
        </Link>

        <nav className="main-nav" aria-label="주요 메뉴">
          <ul>
            {MENU.map((item) => (
              <li
                key={item.label}
                className="nav-item"
                onMouseEnter={() => setActiveNav(SUBMENU[item.label] ? item.label : null)}
              >
                {item.kind === 'section' ? (
                  <button
                    type="button"
                    className="nav-link link-hover nav-link-btn"
                    onFocus={() => setActiveNav(SUBMENU[item.label] ? item.label : null)}
                    onClick={() => goToSection(item.sectionId)}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    to={item.to}
                    className="nav-link link-hover"
                    onFocus={() => setActiveNav(SUBMENU[item.label] ? item.label : null)}
                    onClick={() => setActiveNav(null)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
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
            </span>
            <span className="icon-btn-label">BAG({totalCount})</span>
          </Link>
        </div>
      </div>

      <div className={`nav-submenu-bar ${activeNav ? 'open' : ''}`}>
        <div className="nav-submenu-inner">
          {Object.entries(SUBMENU).map(([key, items]) => (
            <ul key={key} className={`nav-submenu-list ${activeNav === key ? 'visible' : ''}`}>
              {items.map((it) => (
                <li key={it.label}>
                  <Link to={it.to} className="nav-submenu-text-link link-hover" onClick={() => setActiveNav(null)}>
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className={`nav-dim-overlay ${activeNav ? 'visible' : ''}`} aria-hidden="true" />

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
