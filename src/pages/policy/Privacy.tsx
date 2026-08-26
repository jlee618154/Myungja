import './PolicyPage.css';

export default function Privacy() {
  return (
    <div className="policy-page">
      <h1 className="h1 policy-title">개인정보처리방침</h1>

      <section>
        <h2 className="h3">1. 수집하는 개인정보 항목</h2>
        <p>이메일, 비밀번호, 이름, 휴대전화번호, 생년월일(선택), 성별(선택), 배송지 주소</p>
      </section>

      <section>
        <h2 className="h3">2. 개인정보의 수집 및 이용 목적</h2>
        <p>회원 관리, 주문/배송 처리, 고객 문의 응대, 서비스 개선을 위해 이용합니다.</p>
      </section>

      <section>
        <h2 className="h3">3. 개인정보의 보유 및 이용 기간</h2>
        <p>회원 탈퇴 시 또는 수집·이용 목적이 달성된 후 지체 없이 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
      </section>

      <section>
        <h2 className="h3">4. 개인정보의 안전성 확보 조치</h2>
        <p>비밀번호는 암호화하여 저장하며, Row Level Security를 적용해 본인만 자신의 정보에 접근할 수 있도록 관리합니다.</p>
      </section>

      <p className="text-small">본 방침은 사업자등록 완료 전 임시로 게시된 내용이며, 정식 서비스 오픈 시 최종본으로 교체됩니다.</p>
    </div>
  );
}
