import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { assetUrl, formatKrw } from '../lib/format';
import './MiniCart.css';

export default function MiniCart({ onClose }: { onClose: () => void }) {
  const { lines, totalPrice, removeLine } = useCart();
  const navigate = useNavigate();

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="minicart-overlay" onClick={onClose}>
      <div className="minicart-panel card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="장바구니">
        <div className="minicart-header">
          <h3 className="h3">장바구니</h3>
          <button type="button" className="minicart-close" onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="text-small minicart-empty">장바구니가 비어 있습니다</p>
        ) : (
          <div className="minicart-lines">
            {lines.map((l) => (
              <div key={`${l.product_id}-${l.color_name}-${l.size}`} className="minicart-line">
                <img src={assetUrl(l.image_url)} alt={l.name} />
                <div className="minicart-line-info">
                  <span className="h3">{l.name}</span>
                  <span className="text-small">
                    {l.color_name} / {l.size} · {l.qty}개
                  </span>
                  <span className="price">{formatKrw(l.price * l.qty)}</span>
                </div>
                <button
                  type="button"
                  className="minicart-remove"
                  aria-label="삭제"
                  onClick={() => removeLine(l.product_id, l.color_name, l.size)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="minicart-footer">
          <div className="minicart-total">
            <span>총 상품금액</span>
            <span className="price">{formatKrw(totalPrice)}</span>
          </div>
          <div className="minicart-actions">
            <button type="button" className="btn btn-secondary" onClick={() => go('/cart')}>
              장바구니 보기
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={lines.length === 0}
              onClick={() => go('/checkout')}
            >
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
