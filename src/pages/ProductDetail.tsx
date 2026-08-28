import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { assetUrl, formatKrw } from '../lib/format';
import type { ProductDetail as ProductDetailType, Size } from '../types';
import Carousel from '../components/Carousel';
import ColorSwatch from '../components/ColorSwatch';
import SizeSelector from '../components/SizeSelector';
import StarRating from '../components/StarRating';
import Reviews from '../components/Reviews';
import '../components/ProductWearView.css';
import './ProductDetail.css';

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState<string>('');
  const [size, setSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const load = async () => {
    setLoading(true);
    const { data: p } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
    if (!p) {
      setProduct(null);
      setLoading(false);
      return;
    }
    const [{ data: options }, { data: images }] = await Promise.all([
      supabase.from('product_options').select('*').eq('product_id', p.id),
      supabase.from('product_images').select('*').eq('product_id', p.id).order('sort_order'),
    ]);
    const full: ProductDetailType = { ...(p as any), options: options ?? [], images: images ?? [] };
    setProduct(full);
    const firstAvailable = full.options.find((o) => o.stock_qty > 0)?.color_name ?? full.options[0]?.color_name ?? '';
    setColor(firstAvailable);
    setSize(null);
    setQty(1);
    setMessage(null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const colors = useMemo(() => {
    if (!product) return [];
    const map = new Map<string, { hex: string; stock: number }>();
    product.options.forEach((o) => {
      const cur = map.get(o.color_name) ?? { hex: o.color_hex, stock: 0 };
      cur.stock += o.stock_qty;
      map.set(o.color_name, cur);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, hex: v.hex, available: v.stock > 0 }));
  }, [product]);

  const sizeAvailability = useMemo(() => {
    const map: Record<Size, boolean> = { S: false, M: false, L: false, XL: false };
    if (!product) return map;
    product.options
      .filter((o) => o.color_name === color)
      .forEach((o) => {
        map[o.size] = o.stock_qty > 0;
      });
    return map;
  }, [product, color]);

  const selectedOption = useMemo(
    () => product?.options.find((o) => o.color_name === color && o.size === size) ?? null,
    [product, color, size]
  );

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imgs = product.images.filter((i) => i.color_name === color);
    return imgs;
  }, [product, color]);

  if (loading) return <div className="container product-detail-loading">불러오는 중...</div>;
  if (!product) return <div className="container product-detail-loading">상품을 찾을 수 없습니다.</div>;

  const maxQty = selectedOption ? Math.min(selectedOption.stock_qty, 10) : 10;

  const handleAdd = async (goCheckout: boolean, presetPaymentMethod?: string) => {
    if (!color) {
      setMessage('색상을 선택해 주세요');
      return;
    }
    if (!size) {
      setMessage('사이즈를 선택해 주세요');
      return;
    }
    if (!selectedOption || selectedOption.stock_qty < qty) {
      setMessage('선택하신 옵션의 재고가 부족합니다');
      return;
    }
    const image = galleryImages[0]?.image_url ?? product.base_image_url;
    const { error } = await addToCart(
      {
        product_id: product.id,
        color_name: color,
        size,
        name: product.name,
        price: product.price,
        image_url: image,
        slug: product.slug,
      },
      qty
    );
    if (error) {
      setMessage(error);
      return;
    }
    if (goCheckout) {
      navigate('/checkout', presetPaymentMethod ? { state: { presetPaymentMethod } } : undefined);
    } else {
      setMessage('장바구니에 담았습니다');
    }
  };

  return (
    <div className="product-detail">
      <div className="container product-detail-top">
        <div className="product-gallery">
          {galleryImages.length > 0 ? (
            <Carousel
              key={color}
              heightClass="carousel-gallery"
              slides={galleryImages.map((i) => ({ src: assetUrl(i.image_url), alt: `${product.name} ${color}` }))}
            />
          ) : (
            <div className="product-gallery-empty aspect-portrait">
              <p className="text-small">해당 색상 이미지를 준비 중입니다</p>
            </div>
          )}
        </div>

        <div className="product-info">
          <p className="text-small en-label">{product.category}</p>
          <h1 className="h2">{product.name}</h1>
          <div className="product-rating">
            <StarRating value={Math.round(product.rating)} />
            <span className="text-small">
              {product.rating.toFixed(1)} ({product.review_count})
            </span>
          </div>
          <p className="price product-price">{formatKrw(product.price)}</p>

          <div className="product-option-block">
            <ColorSwatch colors={colors} selected={color} onSelect={(c) => { setColor(c); setSize(null); setMessage(null); }} />
          </div>

          <div className="product-option-block">
            <SizeSelector availability={sizeAvailability} selected={size} onSelect={(s) => { setSize(s); setMessage(null); }} />
          </div>

          <div className="product-option-block product-qty-row">
            <span className="text-small">수량</span>
            <div className="qty-stepper">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="수량 감소">
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="수량 증가">
                +
              </button>
            </div>
          </div>

          {message && <p className="field-error">{message}</p>}

          <div className="product-actions">
            <button type="button" className="btn btn-secondary" onClick={() => handleAdd(false)}>
              장바구니 담기
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleAdd(true)}>
              바로 구매하기
            </button>
          </div>

          {/* TODO: 카카오페이/네이버페이 가맹점 계약 완료 후 실제 SDK 연동 필요
              - 카카오페이: Kakao Pay API로 교체
              - 네이버페이: 네이버페이 개발자센터 SDK로 교체
              현재는 테스트 모드로, 주문서 페이지에서 모의결제 확인만 거치고 바로 주문 완료 처리됨 */}
          <div className="product-actions product-actions-pay">
            <button
              type="button"
              className="btn btn-kakaopay"
              onClick={() => handleAdd(true, '카카오페이')}
            >
              카카오페이 구매
            </button>
            <button
              type="button"
              className="btn btn-naverpay"
              onClick={() => handleAdd(true, '네이버페이')}
            >
              네이버페이 구매
            </button>
          </div>
        </div>
      </div>

      {product.fullscreen_image_url && (
        <section className="product-wear-view" aria-label={`${product.name} 착용 앞모습과 뒷모습`}>
          <img src={assetUrl(product.fullscreen_image_url)} alt={`${product.name} 착용컷`} />
        </section>
      )}

      <div className="container product-summary">
        {[
          { key: 'fit', title: '핏', content: product.fit },
          { key: 'shipping', title: '배송', content: '3만원 이상 무료배송 · 영업일 기준 2~3일 이내 출고' },
          { key: 'material', title: '소재', content: product.material },
        ].map((section) => {
          const open = openSections.has(section.key);
          return (
            <div key={section.key} className={`accordion-item ${open ? 'open' : ''}`}>
              <button
                type="button"
                className="accordion-header"
                aria-expanded={open}
                onClick={() => toggleSection(section.key)}
              >
                <span className="h3">{section.title}</span>
                <span className="accordion-icon">
                  <ChevronIcon />
                </span>
              </button>
              <div className="accordion-body">
                <div className="accordion-body-inner">
                  <p className="text-small accordion-content">{section.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="container product-description">
        <h2 className="h2">제품 설명</h2>
        <dl className="description-list">
          <div>
            <dt className="h3">제품 콘셉트</dt>
            <dd>{product.concept}</dd>
          </div>
          <div>
            <dt className="h3">움직임</dt>
            <dd>{product.movement}</dd>
          </div>
          <div>
            <dt className="h3">소재</dt>
            <dd>{product.material}</dd>
          </div>
          <div>
            <dt className="h3">관리 방법</dt>
            <dd>{product.care}</dd>
          </div>
          <div>
            <dt className="h3">추천 활동</dt>
            <dd>{product.activity}</dd>
          </div>
        </dl>
      </div>

      <div className="container">
        <Reviews
          productId={product.id}
          rating={product.rating}
          reviewCount={product.review_count}
          onRatingChange={load}
        />
      </div>
    </div>
  );
}
