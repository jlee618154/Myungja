import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { assetUrl, formatKrw } from '../lib/format';
import type { ProductDetail as ProductDetailType, ProductOption, Size } from '../types';
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

  // SET 상품 전용: 상의/하의 각각 실제 원상품에서 가져온 옵션과 독립 선택 상태
  const [topProductName, setTopProductName] = useState('');
  const [bottomProductName, setBottomProductName] = useState('');
  const [topOptions, setTopOptions] = useState<ProductOption[]>([]);
  const [bottomOptions, setBottomOptions] = useState<ProductOption[]>([]);
  const [topColor, setTopColor] = useState('');
  const [topSize, setTopSize] = useState<Size | null>(null);
  const [bottomColor, setBottomColor] = useState('');
  const [bottomSize, setBottomSize] = useState<Size | null>(null);

  const isSet = Boolean(product?.top_product_id && product?.bottom_product_id);

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

    if (p.top_product_id && p.bottom_product_id) {
      const [{ data: topBottomProducts }, { data: topBottomOptions }] = await Promise.all([
        supabase.from('products').select('id, name').in('id', [p.top_product_id, p.bottom_product_id]),
        supabase.from('product_options').select('*').in('product_id', [p.top_product_id, p.bottom_product_id]),
      ]);
      const tOpts = (topBottomOptions ?? []).filter((o: any) => o.product_id === p.top_product_id);
      const bOpts = (topBottomOptions ?? []).filter((o: any) => o.product_id === p.bottom_product_id);
      setTopOptions(tOpts);
      setBottomOptions(bOpts);
      setTopProductName((topBottomProducts ?? []).find((pr: any) => pr.id === p.top_product_id)?.name ?? '상의');
      setBottomProductName((topBottomProducts ?? []).find((pr: any) => pr.id === p.bottom_product_id)?.name ?? '하의');
      setTopColor(tOpts.find((o: any) => o.stock_qty > 0)?.color_name ?? tOpts[0]?.color_name ?? '');
      setBottomColor(bOpts.find((o: any) => o.stock_qty > 0)?.color_name ?? bOpts[0]?.color_name ?? '');
      setTopSize(null);
      setBottomSize(null);
    } else {
      setTopOptions([]);
      setBottomOptions([]);
    }

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

  const toColorList = (opts: ProductOption[]) => {
    const map = new Map<string, { hex: string; stock: number }>();
    opts.forEach((o) => {
      const cur = map.get(o.color_name) ?? { hex: o.color_hex, stock: 0 };
      cur.stock += o.stock_qty;
      map.set(o.color_name, cur);
    });
    return Array.from(map.entries()).map(([name, v]) => ({ name, hex: v.hex, available: v.stock > 0 }));
  };

  const toSizeAvailability = (opts: ProductOption[], selectedColor: string) => {
    const map: Record<Size, boolean> = { S: false, M: false, L: false, XL: false };
    opts.filter((o) => o.color_name === selectedColor).forEach((o) => {
      map[o.size] = o.stock_qty > 0;
    });
    return map;
  };

  const topColors = useMemo(() => toColorList(topOptions), [topOptions]);
  const bottomColors = useMemo(() => toColorList(bottomOptions), [bottomOptions]);
  const topSizeAvailability = useMemo(() => toSizeAvailability(topOptions, topColor), [topOptions, topColor]);
  const bottomSizeAvailability = useMemo(() => toSizeAvailability(bottomOptions, bottomColor), [bottomOptions, bottomColor]);

  const selectedTopOption = useMemo(
    () => topOptions.find((o) => o.color_name === topColor && o.size === topSize) ?? null,
    [topOptions, topColor, topSize]
  );
  const selectedBottomOption = useMemo(
    () => bottomOptions.find((o) => o.color_name === bottomColor && o.size === bottomSize) ?? null,
    [bottomOptions, bottomColor, bottomSize]
  );

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imgs = product.images.filter((i) => i.color_name === color);
    return imgs;
  }, [product, color]);

  if (loading) return <div className="container product-detail-loading">불러오는 중...</div>;
  if (!product) return <div className="container product-detail-loading">상품을 찾을 수 없습니다.</div>;

  const maxQty = isSet
    ? Math.min(selectedTopOption?.stock_qty ?? 10, selectedBottomOption?.stock_qty ?? 10, 10)
    : selectedOption
    ? Math.min(selectedOption.stock_qty, 10)
    : 10;

  // SET 상품: 4개(상의색상/상의사이즈/하의색상/하의사이즈) 선택 검증 + 장바구니/주문 라인용 필드 구성
  const validateAndBuildSetLine = (): {
    color_name: string;
    size: Size;
    top_color_name: string;
    top_size: Size;
    bottom_color_name: string;
    bottom_size: Size;
  } | null => {
    if (!topColor || !bottomColor) {
      setMessage('색상을 선택해 주세요');
      return null;
    }
    if (!topSize || !bottomSize) {
      setMessage('사이즈를 선택해주세요');
      return null;
    }
    if (!selectedTopOption || selectedTopOption.stock_qty < qty || !selectedBottomOption || selectedBottomOption.stock_qty < qty) {
      setMessage('선택하신 옵션의 재고가 부족합니다');
      return null;
    }
    return {
      color_name: `상의 ${topColor} ${topSize} · 하의 ${bottomColor} ${bottomSize}`,
      size: topSize,
      top_color_name: topColor,
      top_size: topSize,
      bottom_color_name: bottomColor,
      bottom_size: bottomSize,
    };
  };

  const handleAdd = async (goCheckout: boolean, presetPaymentMethod?: string) => {
    const image = galleryImages[0]?.image_url ?? product.base_image_url;

    if (isSet) {
      const setLine = validateAndBuildSetLine();
      if (!setLine) return;
      const { error } = await addToCart(
        {
          product_id: product.id,
          ...setLine,
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
    } else {
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
    }

    if (goCheckout) {
      navigate('/checkout', presetPaymentMethod ? { state: { presetPaymentMethod } } : undefined);
    } else {
      setMessage('장바구니에 담았습니다');
    }
  };

  // 카카오페이/네이버페이 버튼 전용: 로그인 여부와 무관하게 비회원 결제 페이지로 바로 이동한다.
  // (장바구니에 담지 않고, 이 상품 1건만 즉시 결제하는 흐름)
  const handleGuestPay = (method: '카카오페이' | '네이버페이') => {
    const image = galleryImages[0]?.image_url ?? product.base_image_url;

    if (isSet) {
      const setLine = validateAndBuildSetLine();
      if (!setLine) return;
      navigate('/pay/guest', {
        state: {
          presetPaymentMethod: method,
          item: {
            product_id: product.id,
            ...setLine,
            qty,
            name: product.name,
            price: product.price,
            image_url: image,
          },
        },
      });
      return;
    }

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
    navigate('/pay/guest', {
      state: {
        presetPaymentMethod: method,
        item: {
          product_id: product.id,
          color_name: color,
          size,
          qty,
          name: product.name,
          price: product.price,
          image_url: image,
        },
      },
    });
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
          {product.category === 'SET' && galleryImages.length > 1 && (
            <p className="text-small product-gallery-set-hint">
              ‹ › 화살표를 눌러 세트에 포함된 상품 사진을 모두 확인해 보세요 (총 {galleryImages.length}장)
            </p>
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

          {isSet ? (
            <>
              <div className="product-option-block product-option-set-group">
                <p className="text-small product-option-set-label">상의 옵션 ({topProductName})</p>
                <ColorSwatch
                  colors={topColors}
                  selected={topColor}
                  onSelect={(c) => {
                    setTopColor(c);
                    setTopSize(null);
                    setMessage(null);
                  }}
                />
                <SizeSelector
                  availability={topSizeAvailability}
                  selected={topSize}
                  onSelect={(s) => {
                    setTopSize(s);
                    setMessage(null);
                  }}
                />
              </div>

              <div className="product-option-block product-option-set-group">
                <p className="text-small product-option-set-label">하의 옵션 ({bottomProductName})</p>
                <ColorSwatch
                  colors={bottomColors}
                  selected={bottomColor}
                  onSelect={(c) => {
                    setBottomColor(c);
                    setBottomSize(null);
                    setMessage(null);
                  }}
                />
                <SizeSelector
                  availability={bottomSizeAvailability}
                  selected={bottomSize}
                  onSelect={(s) => {
                    setBottomSize(s);
                    setMessage(null);
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="product-option-block">
                <ColorSwatch colors={colors} selected={color} onSelect={(c) => { setColor(c); setSize(null); setMessage(null); }} />
              </div>

              <div className="product-option-block">
                <SizeSelector availability={sizeAvailability} selected={size} onSelect={(s) => { setSize(s); setMessage(null); }} />
              </div>
            </>
          )}

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

          {/* 회원가입/로그인 없이 바로 결제되는 PortOne(포트원) 간편결제 버튼.
              PDP 상단의 "바로 구매하기"(회원 전용, 장바구니 경유)와는 별개의 비회원 즉시결제 흐름이다. */}
          <div className="product-actions product-actions-pay">
            <button
              type="button"
              className="btn btn-kakaopay"
              onClick={() => handleGuestPay('카카오페이')}
            >
              카카오페이로 결제
            </button>
            <button
              type="button"
              className="btn btn-naverpay"
              onClick={() => handleGuestPay('네이버페이')}
            >
              네이버페이로 결제
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
