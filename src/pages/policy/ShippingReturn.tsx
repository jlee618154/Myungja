import './PolicyPage.css';

export default function ShippingReturn() {
  return (
    <div className="policy-page">
      <h1 className="h1 policy-title">배송·교환·환불 정책</h1>

      <section>
        <h2 className="h3">배송비 정책</h2>
        <p>3만원 이상 구매 시 무료배송, 3만원 미만 구매 시 배송비 3,000원이 부과됩니다. 제주·도서산간 지역은 3,000원이 추가됩니다.</p>
      </section>

      <section>
        <h2 className="h3">배송 소요 기간</h2>
        <p>결제 완료 후 영업일 기준 2~3일 이내 출고되며, 출고 후 1~2일 이내 도착합니다. (평균 3~5 영업일 이내 수령)</p>
      </section>

      <section>
        <h2 className="h3">교환/환불 가능 기간</h2>
        <p>상품 수령일로부터 7일 이내 교환·환불이 가능합니다. (전자상거래법 기준)</p>
      </section>

      <section>
        <h2 className="h3">교환/환불 불가 사유</h2>
        <ul>
          <li>착용 흔적이 있거나 세탁한 경우</li>
          <li>상품 택(tag)을 제거했거나 부속품을 분실한 경우</li>
          <li>고객 부주의로 상품이 훼손된 경우</li>
        </ul>
      </section>

      <section>
        <h2 className="h3">반품 배송비 부담 기준</h2>
        <table className="policy-table">
          <thead>
            <tr>
              <th>사유</th>
              <th>배송비 부담</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>단순 변심</td>
              <td>왕복 배송비 6,000원 고객 부담</td>
            </tr>
            <tr>
              <td>상품 불량·오배송</td>
              <td>배송비 전액 판매자 부담</td>
            </tr>
          </tbody>
        </table>
      </section>

      <p className="text-small">
        위 배송비·기간·정책은 국내 소형 온라인 패션몰 업계 평균 기준으로 임시 설정되었으며, 실제 운영 방침이 확정되면
        갱신됩니다.
      </p>
    </div>
  );
}
