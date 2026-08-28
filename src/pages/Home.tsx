import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import { assetUrl } from '../lib/format';
import { useReveal } from '../hooks/useReveal';
import './Home.css';

const HERO_SLIDES = [
  { src: assetUrl('images/hero-1.png'), alt: 'MYUNGJA 소프트 저지 레깅스 착장', objectPosition: 'center 5%' },
  { src: assetUrl('images/hero-2.jpg'), alt: 'MYUNGJA 등산 라이프스타일', objectPosition: 'center 10%' },
  { src: assetUrl('images/hero-3.png'), alt: 'MYUNGJA 마라톤 라이프스타일', objectPosition: 'center 4%' },
];

const MD_PICKS = [
  {
    key: 'hiking',
    title: '등산',
    image: assetUrl('images/md-hiking.jpg'),
    copy: '가파른 길 위에서도 몸을 조이지 않는 편안함. 스웨이 온더고 자켓과 저지 레깅스의 조합.',
    to: '/product/sway-onthego-jacket',
  },
  {
    key: 'marathon',
    title: '마라톤',
    image: assetUrl('images/md-marathon.jpg'),
    copy: '속도를 따라가되 애쓰지 않는 착용감. 에어핏 브라탑과 저지 레깅스의 조합.',
    to: '/product/signature-airfit-bra',
  },
  {
    key: 'yoga',
    title: '요가',
    image: assetUrl('images/md-yoga.jpg'),
    copy: '숨을 따라 움직이는 순간까지 편안하게. 에어핏 브라탑과 저지 레깅스의 조합.',
    to: '/product/soft-jersey-leggings',
  },
];

export default function Home() {
  const aboutReveal = useReveal<HTMLElement>();
  const mdPickReveal = useReveal<HTMLElement>();

  return (
    <div>
      <Carousel slides={HERO_SLIDES} intervalMs={2000} />

      <section
        id="about-myungja"
        ref={aboutReveal.ref}
        className={`about-section reveal ${aboutReveal.visible ? 'reveal-visible' : ''}`}
      >
        <div className="container about-inner">
          <p className="about-eyebrow en-label">ABOUT MYUNGJA</p>
          <p className="about-quote h1">
            <span className="about-quote-highlight">몸을 조이지 않고, 삶의 속도를 따라가는 옷.</span>
            <br />
            <span className="about-quote-line">명자는 애쓰지 않는 편안함을 가장 아름다운 태도라 믿습니다.</span>
          </p>
          <div className="about-divider" />
          <div className="about-columns">
            <p>
              MYUNGJA는 편안함과 세련된 스타일을 함께 추구하는 40~50대 여성을 위한 프리미엄 액티브웨어 브랜드입니다.
              몸을 조이는 대신 삶의 속도를 따라가는 옷을 만듭니다.
            </p>
            <p>
              슬로건 &lsquo;Move easy. Live easy.&rsquo; 아래, 화려함보다는 여백이 있는 편집숍의 태도로 하루하루의
              움직임을 위한 옷을 제안합니다.
            </p>
          </div>
        </div>
      </section>

      <section
        ref={mdPickReveal.ref}
        className={`md-pick container reveal ${mdPickReveal.visible ? 'reveal-visible' : ''}`}
      >
        <h2 className="h2 en-label md-pick-title">MD PICK</h2>
        <div className="md-pick-grid">
          {MD_PICKS.map((m) => (
            <Link key={m.key} to={m.to} className="md-pick-card">
              <img src={m.image} alt={m.title} />
              <div className="md-pick-card-overlay">
                <h3 className="h3">{m.title}</h3>
                <p className="text-small">{m.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
