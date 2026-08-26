import './PolicyPage.css';

const FAQS = [
  { q: '배송은 얼마나 걸리나요?', a: '결제 완료 후 영업일 기준 2~3일 이내 출고되며, 평균 3~5 영업일 이내 수령하실 수 있습니다.' },
  { q: '교환/환불은 어떻게 하나요?', a: '상품 수령일로부터 7일 이내에 1:1 문의를 통해 접수해 주시면 안내해 드립니다.' },
  { q: '사이즈가 궁금해요.', a: '각 상품 상세페이지의 "사이즈 가이드 보기"에서 실측 치수를 확인하실 수 있습니다.' },
  { q: '적립금은 어떻게 사용하나요?', a: '주문 시 결제 금액 내에서 보유하신 적립금을 사용하실 수 있습니다.' },
];

export default function Faq() {
  return (
    <div className="policy-page">
      <h1 className="h1 policy-title">자주 묻는 질문</h1>
      {FAQS.map((f) => (
        <section key={f.q}>
          <h2 className="h3">Q. {f.q}</h2>
          <p>A. {f.a}</p>
        </section>
      ))}
    </div>
  );
}
