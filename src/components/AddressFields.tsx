import { useEffect } from 'react';

declare global {
  interface Window {
    daum?: any;
  }
}

let daumLoading: Promise<void> | null = null;

function loadDaumScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();
  if (daumLoading) return daumLoading;
  daumLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('daum postcode load failed'));
    document.body.appendChild(script);
  });
  return daumLoading;
}

export interface AddressValue {
  recipient_name: string;
  phone: string;
  zonecode: string;
  address1: string;
  address2: string;
}

export default function AddressFields({
  value,
  onChange,
  idPrefix = 'addr',
}: {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
  idPrefix?: string;
}) {
  useEffect(() => {
    loadDaumScript().catch(() => {});
  }, []);

  const openSearch = async () => {
    try {
      await loadDaumScript();
    } catch {
      alert('우편번호 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        onChange({ ...value, zonecode: data.zonecode, address1: data.roadAddress || data.jibunAddress });
      },
    }).open();
  };

  return (
    <div className="address-fields">
      <label className="field">
        <span className="text-small">수령인</span>
        <input
          id={`${idPrefix}-recipient`}
          value={value.recipient_name}
          onChange={(e) => onChange({ ...value, recipient_name: e.target.value })}
          required
        />
      </label>
      <label className="field">
        <span className="text-small">연락처</span>
        <input
          id={`${idPrefix}-phone`}
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder="010-0000-0000"
          required
        />
      </label>
      <div className="field">
        <span className="text-small">우편번호</span>
        <div className="address-zonecode-row">
          <input id={`${idPrefix}-zonecode`} value={value.zonecode} readOnly required />
          <button type="button" className="btn btn-secondary" onClick={openSearch}>
            우편번호 검색
          </button>
        </div>
      </div>
      <label className="field">
        <span className="text-small">기본 주소</span>
        <input id={`${idPrefix}-address1`} value={value.address1} readOnly required />
      </label>
      <label className="field">
        <span className="text-small">상세 주소</span>
        <input
          id={`${idPrefix}-address2`}
          value={value.address2}
          onChange={(e) => onChange({ ...value, address2: e.target.value })}
        />
      </label>
    </div>
  );
}
