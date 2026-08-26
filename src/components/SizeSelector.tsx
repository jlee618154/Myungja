import { useState } from 'react';
import { SIZES, type Size } from '../types';
import './SizeSelector.css';

export default function SizeSelector({
  availability,
  selected,
  onSelect,
}: {
  availability: Record<Size, boolean>;
  selected: Size | null;
  onSelect: (size: Size) => void;
}) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div>
      <div className="size-selector-row" role="radiogroup" aria-label="사이즈 선택">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={selected === s}
            disabled={!availability[s]}
            className={`size-btn ${selected === s ? 'selected' : ''} ${!availability[s] ? 'sold-out' : ''}`}
            onClick={() => onSelect(s)}
          >
            {s}
          </button>
        ))}
        <button type="button" className="size-guide-link link-hover text-small" onClick={() => setGuideOpen(true)}>
          사이즈 가이드 보기
        </button>
      </div>

      {guideOpen && (
        <div className="modal-overlay" onClick={() => setGuideOpen(false)}>
          <div className="size-guide-panel card" onClick={(e) => e.stopPropagation()}>
            <h3 className="h3">사이즈 가이드</h3>
            <p className="text-small" style={{ marginBottom: 'var(--space-4)' }}>
              원단 특성상 넉넉한 핏으로 제작되었습니다. 실측 치수는 아래 표를 참고해 주세요. (단위: cm)
            </p>
            <table className="size-guide-table">
              <thead>
                <tr>
                  <th></th>
                  <th>S</th>
                  <th>M</th>
                  <th>L</th>
                  <th>XL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>총장</td>
                  <td>58</td>
                  <td>60</td>
                  <td>62</td>
                  <td>64</td>
                </tr>
                <tr>
                  <td>가슴단면</td>
                  <td>38</td>
                  <td>40</td>
                  <td>42</td>
                  <td>44</td>
                </tr>
                <tr>
                  <td>허리단면</td>
                  <td>32</td>
                  <td>34</td>
                  <td>36</td>
                  <td>38</td>
                </tr>
              </tbody>
            </table>
            <button type="button" className="btn btn-secondary" onClick={() => setGuideOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
