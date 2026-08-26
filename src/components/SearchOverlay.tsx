import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { assetUrl, formatKrw } from '../lib/format';
import type { Product } from '../types';
import './SearchOverlay.css';

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('products').select('*').ilike('name', `%${q.trim()}%`);
      setResults((data as Product[]) ?? []);
      setSearched(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);

  const goToProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="상품 검색">
      <div className="search-overlay-inner container">
        <div className="search-input-row">
          <input
            autoFocus
            type="text"
            placeholder="상품명을 검색해 보세요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" className="search-close" onClick={onClose} aria-label="검색 닫기">
            닫기 (ESC)
          </button>
        </div>

        <div className="search-results">
          {searched && results.length === 0 && <p className="text-small">검색 결과가 없습니다</p>}
          {results.map((p) => (
            <button key={p.id} type="button" className="search-result-item" onClick={() => goToProduct(p.slug)}>
              <img src={assetUrl(p.base_image_url)} alt={p.name} />
              <span className="search-result-info">
                <span className="h3">{p.name}</span>
                <span className="text-small">{p.category}</span>
                <span className="price">{formatKrw(p.price)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
