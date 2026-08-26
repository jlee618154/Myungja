import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-policy-links">
          <Link to="/policy/terms" className="link-hover">이용약관</Link>
          <Link to="/policy/privacy" className="link-hover">개인정보처리방침</Link>
          <Link to="/policy/shipping-return" className="link-hover">배송·교환·환불 정책</Link>
          <Link to="/policy/faq" className="link-hover">FAQ</Link>
        </div>
        <p className="text-small footer-info">
          상호명: MYUNGJA (주식회사 명자 — 임시 상호, 등록 시 확정) · 대표자명: 이주영 · 사업자등록번호: 사업자 등록
          준비 중 · 통신판매업 신고번호: 통신판매업 신고 준비 중
          <br />
          사업장 주소: 서울특별시 (상세 주소는 사업자등록 후 기재) · 고객센터 이메일: hello@myungja.co.kr · 고객센터
          전화번호: 고객센터 준비 중 (문의는 1:1 문의 버튼 이용)
          <br />
          운영시간: 평일 10:00 ~ 17:00 (주말·공휴일 휴무)
        </p>
        <p className="text-small footer-copy">© MYUNGJA. Move easy. Live easy.</p>
      </div>
    </footer>
  );
}
