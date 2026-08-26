import './PolicyPage.css';

export default function Terms() {
  return (
    <div className="policy-page">
      <h1 className="h1 policy-title">이용약관</h1>

      <section>
        <h2 className="h3">제1조 (목적)</h2>
        <p>
          이 약관은 MYUNGJA(이하 &ldquo;회사&rdquo;)가 운영하는 온라인 쇼핑몰에서 제공하는 서비스의 이용조건 및 절차,
          회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2 className="h3">제2조 (회원가입)</h2>
        <p>
          회원가입은 이용자가 약관의 내용에 동의하고 회사가 정한 가입 양식에 따라 회원정보를 기입하여 가입을
          신청함으로써 성립됩니다.
        </p>
      </section>

      <section>
        <h2 className="h3">제3조 (서비스의 제공 및 변경)</h2>
        <p>회사는 상품의 판매, 주문, 배송, 교환·환불 등 전자상거래 관련 서비스를 제공합니다.</p>
      </section>

      <section>
        <h2 className="h3">제4조 (계약의 성립)</h2>
        <p>구매신청 후 회사의 승낙이 이용자에게 도달한 시점에 계약이 성립된 것으로 봅니다.</p>
      </section>

      <p className="text-small">
        본 약관은 사업자등록 및 통신판매업 신고 완료 전 임시로 게시된 내용이며, 정식 서비스 오픈 시 최종본으로
        교체됩니다.
      </p>
    </div>
  );
}
