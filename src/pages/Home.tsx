import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import { assetUrl } from '../lib/format';
import './Home.css';

const HERO_SLIDES = [
  {
    src: assetUrl('images/hero-hiking.png'),
    alt: 'MYUNGJA 등산 라이프스타일',
    objectPosition: 'center center',
    label: '40 · 50 ACTIVE LIFE',
    titleLine1: 'Move easy.',
    titleLine2: 'Live easy.',
    subcopy: '동네를 걷는 걸음에도, 나만의 리듬을 지킵니다.',
    ctaLabel: '컬렉션 보기 →',
    ctaTo: '/md/hiking',
  },
  {
    src: assetUrl('images/hero-marathon.png'),
    alt: 'MYUNGJA 마라톤 라이프스타일',
    objectPosition: 'center center',
    label: '40 · 50 ACTIVE LIFE',
    titleLine1: 'Move easy.',
    titleLine2: 'Live easy.',
    subcopy: '속도를 높이는 순간에도, 편안함은 타협하지 않습니다.',
    ctaLabel: '컬렉션 보기 →',
    ctaTo: '/md/marathon',
  },
  {
    src: assetUrl('images/hero-yoga.png'),
    alt: 'MYUNGJA 요가 라이프스타일',
    objectPosition: 'center center',
    label: '40 · 50 ACTIVE LIFE',
    titleLine1: 'Move easy.',
    titleLine2: 'Live easy.',
    subcopy: '숨을 고르는 순간에도, 편안함은 타협하지 않습니다.',
    ctaLabel: '컬렉션 보기 →',
    ctaTo: '/md/yoga',
  },
];

const MD_PICKS = [
  {
    key: 'hiking',
    title: '등산',
    image: assetUrl('images/md-hiking.jpg'),
    copy: '가파른 길 위에서도 몸을 조이지 않는 편안함. 스웨이 온더고 자켓과 저지 레깅스의 조합.',
    to: '/md/hiking',
  },
  {
    key: 'marathon',
    title: '마라톤',
    image: assetUrl('images/md-marathon.jpg'),
    copy: '속도를 따라가되 애쓰지 않는 착용감. 에어핏 브라탑과 저지 레깅스의 조합.',
    to: '/md/marathon',
  },
  {
    key: 'yoga',
    title: '요가',
    image: assetUrl('images/md-yoga.jpg'),
    copy: '숨을 따라 움직이는 순간까지 편안하게. 에어핏 브라탑과 저지 레깅스의 조합.',
    to: '/md/yoga',
  },
];

export default function Home() {
  return (
    <div>
      <div className="hero-reveal-wrap">
      <div className="home-hero">
        <Carousel slides={HERO_SLIDES} intervalMs={2000} variant="hero" />
      </div>

      <section id="about-myungja" className="about-section">
        <div className="container about-inner">
          <p className="about-eyebrow en-label">ABOUT MYUNGJA</p>
          <p className="about-quote h1">
            <span className="about-quote-line">
              몸을 조이지 않고, <span className="about-highlight">삶의 속도</span>를 따라가는 옷.
            </span>
            <span className="about-quote-line">
              명자는 <span className="about-highlight">애쓰지 않는 편안함</span>을 가장 아름다운 태도라 믿습니다.
            </span>
          </p>
          <div className="about-divider" />
          <div className="about-columns">
            <p>
              MYUNGJA는 하루를 더 빠르게 재촉하는 옷보다, 지금의 몸과 자연스럽게 호흡하는 옷을 만듭니다. 요가를 하는
              고요한 아침부터 오래 걷고 달리는 오후까지, 옷이 먼저 나서지 않고 입는 사람의 움직임을 따라가기를
              바랍니다.
            </p>
            <p>
              부드러운 촉감과 유연한 실루엣, 오래 보아도 편안한 색을 고르는 이유도 같습니다. 나이와 체형을 감추기보다
              지금의 나를 편안하게 드러내는 것. 그것이 MYUNGJA가 말하는 일상의 아름다움입니다.
            </p>
          </div>
        </div>
      </section>
      </div>

      <section id="md-pick-section" className="md-pick container">
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
