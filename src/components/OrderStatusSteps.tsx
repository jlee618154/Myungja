import './OrderStatusSteps.css';

const ORDER_STEPS = ['결제완료', '상품준비중', '배송중', '배송완료'];

export default function OrderStatusSteps({ status }: { status: string }) {
  const activeIndex = Math.max(0, ORDER_STEPS.indexOf(status));

  return (
    <div className="order-steps">
      <div className="order-steps-track">
        {ORDER_STEPS.map((label, i) => (
          <div key={label} className="order-steps-segment">
            <span className={`order-step-dot ${i <= activeIndex ? 'active' : ''}`} />
            {i < ORDER_STEPS.length - 1 && (
              <span className={`order-step-connector ${i < activeIndex ? 'active' : ''}`} />
            )}
          </div>
        ))}
      </div>
      <div className="order-steps-labels">
        {ORDER_STEPS.map((label) => (
          <span key={label} className={ORDER_STEPS.indexOf(label) <= activeIndex ? 'active' : ''}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
