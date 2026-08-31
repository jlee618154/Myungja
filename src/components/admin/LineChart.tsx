interface Point {
  label: string;
  value: number;
}

export default function LineChart({ data, height = 260 }: { data: Point[]; height?: number }) {
  const width = 900;
  const padding = { top: 20, right: 20, bottom: 32, left: 70 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding.left + stepX * i,
    y: padding.top + innerH - (d.value / max) * innerH,
    ...d,
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1]?.x ?? 0} ${padding.top + innerH} L ${points[0]?.x ?? 0} ${padding.top + innerH} Z`;

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ overflow: 'visible' }}>
      {yTickValues.map((v, i) => {
        const y = padding.top + innerH - (v / max) * innerH;
        return (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="var(--color-border)" strokeWidth={1} />
            <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize={11} fill="var(--color-gray-brown)">
              {v.toLocaleString('ko-KR')}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="var(--color-orange)" opacity={0.12} stroke="none" />
      <path d={path} fill="none" stroke="var(--color-orange)" strokeWidth={2} />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="var(--color-orange)" />
          <title>{`${p.label}: ${p.value.toLocaleString('ko-KR')}원`}</title>
          <text x={p.x} y={height - 8} textAnchor="middle" fontSize={11} fill="var(--color-gray-brown)">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
