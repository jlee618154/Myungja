import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../lib/format';
import './MusicPlayer.css';

function SpeakerOnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 13 4 13 20 8 15 4 15 4 9" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4 9 8 9 13 4 13 20 8 15 4 15 4 9" />
      <line x1="17" y1="9" x2="22" y2="14" />
      <line x1="22" y1="9" x2="17" y2="14" />
    </svg>
  );
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    // 브라우저 자동재생 정책상 음소거 상태의 재생만 사용자 동작 없이 허용되므로,
    // JSX muted prop과 별개로 실제 프로퍼티를 명시적으로 true로 맞춘 뒤 재생을 시도한다.
    if (audioRef.current) {
      audioRef.current.muted = true;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggle = () => {
    setMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next) audioRef.current.play().catch(() => {});
      }
      return next;
    });
  };

  return (
    <>
      <audio ref={audioRef} src={assetUrl('audio/urban-waves.mp3')} loop muted={muted} autoPlay />
      <button
        type="button"
        className="music-fab"
        onClick={toggle}
        aria-label={muted ? '배경음악 켜기' : '배경음악 끄기'}
        aria-pressed={!muted}
      >
        {muted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
      </button>
    </>
  );
}
