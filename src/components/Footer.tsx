import { Link } from 'react-router-dom';
import './Footer.css';

const openInquiry = () => window.dispatchEvent(new Event('open-inquiry'));

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-columns">
          <div className="footer-col footer-col-brand">
            <Link to="/" className="logo en-label footer-logo">
              MYUNGJA
            </Link>
            <p className="footer-tagline">Move easy. Live easy.</p>
            <p className="text-small footer-caption">40-50대 여성을 위한 액티브웨어 브랜드</p>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">SHOP</p>
            <ul className="footer-col-list">
              <li>
                <Link to="/top" className="link-hover">
                  TOP
                </Link>
              </li>
              <li>
                <Link to="/bottom" className="link-hover">
                  BOTTOM
                </Link>
              </li>
              <li>
                <Link to="/outer" className="link-hover">
                  OUTER
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">CUSTOMER</p>
            <ul className="footer-col-list">
              <li>
                <button type="button" className="link-hover footer-col-link-btn" onClick={openInquiry}>
                  1:1 문의
                </button>
              </li>
              <li>
                <Link to="/policy/shipping-return" className="link-hover">
                  교환·반품
                </Link>
              </li>
              <li>
                <Link to="/policy/faq" className="link-hover">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">COMPANY</p>
            <ul className="footer-col-list footer-col-list-static">
              <li>상호: 명자 | 대표: 이주영</li>
              <li>사업자등록번호: 사업자등록 준비 중</li>
              <li>고객센터 이메일: hello@myungja.co.kr</li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-policy-links">
          <Link to="/policy/terms" className="link-hover">이용약관</Link>
          <span aria-hidden="true">·</span>
          <Link to="/policy/privacy" className="link-hover">개인정보처리방침</Link>
          <span aria-hidden="true">·</span>
          <Link to="/policy/shipping-return" className="link-hover">배송·교환·환불 정책</Link>
          <span aria-hidden="true">·</span>
          <Link to="/policy/faq" className="link-hover">FAQ</Link>
        </div>

        <div className="footer-legal">
          <p>상호명: MYUNGJA (주식회사 명자 — 임시 상호, 등록 시 확정) · 대표자명: 이주영</p>
          <p>사업자등록번호: 사업자 등록 준비 중 · 통신판매업 신고번호: 통신판매업 신고 준비 중</p>
          <p>사업장 주소: 서울특별시 (상세 주소는 사업자등록 후 기재)</p>
          <p>고객센터 이메일: hello@myungja.co.kr · 고객센터 전화번호: 고객센터 준비 중 (문의는 1:1 문의 버튼 이용)</p>
          <p>운영시간: 평일 10:00 ~ 17:00 (주말·공휴일 휴무)</p>
        </div>
        <p className="footer-copy">© MYUNGJA. Move easy. Live easy.</p>
      </div>
    </footer>
  );
}
