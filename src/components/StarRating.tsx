export default function StarRating({
  value,
  onChange,
  size = 16,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div role={onChange ? 'radiogroup' : undefined} aria-label="별점" style={{ display: 'inline-flex', gap: 2 }}>
      {stars.map((s) => (
        <span
          key={s}
          role={onChange ? 'radio' : undefined}
          aria-checked={onChange ? value === s : undefined}
          tabIndex={onChange ? 0 : undefined}
          onClick={() => onChange?.(s)}
          onKeyDown={(e) => {
            if (onChange && (e.key === 'Enter' || e.key === ' ')) onChange(s);
          }}
          style={{
            fontSize: size,
            color: s <= value ? '#E08A4C' : '#DCD4C8',
            cursor: onChange ? 'pointer' : 'default',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
