import './ColorSwatch.css';

export interface ColorChoice {
  name: string;
  hex: string;
  available: boolean;
}

export default function ColorSwatch({
  colors,
  selected,
  onSelect,
}: {
  colors: ColorChoice[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="color-swatch-row" role="radiogroup" aria-label="색상 선택">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          role="radio"
          aria-checked={selected === c.name}
          aria-label={`${c.name}${c.available ? '' : ' (품절)'}`}
          disabled={!c.available}
          className={`color-swatch ${selected === c.name ? 'selected' : ''} ${!c.available ? 'sold-out' : ''}`}
          style={{ backgroundColor: c.hex }}
          onClick={() => onSelect(c.name)}
        >
          <span className="visually-hidden">{c.name}</span>
        </button>
      ))}
      <span className="color-swatch-label text-small">{selected}</span>
    </div>
  );
}
