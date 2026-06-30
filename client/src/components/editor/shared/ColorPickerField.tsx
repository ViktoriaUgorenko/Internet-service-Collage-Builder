/** Единая палитра: текст, фигуры, контур, стикеры, фон холста */
export const EDITOR_COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#a0785a', '#457b9d', '#2a9d8f', '#e9c46a', '#e63946', '#f4a261', '#264653',
  '#ffffff', '#f8f9fa', '#e5e7eb', '#9ca3af', '#6b7280', '#374151', '#1a1a2e', '#000000',
  'transparent',
] as const;

function isTransparent(v: string | undefined | null) {
  return v == null || v === '' || v === 'transparent';
}

function normHex(v: string) {
  return v.trim().toLowerCase();
}

function colorInputValue(display: string) {
  return display === 'transparent' ? '#ffffff' : display;
}

export type ColorPickerFieldProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  /** Показать образец «без заливки» */
  allowTransparent?: boolean;
  showHexLabel?: boolean;
  /** Компактные круглые образцы */
  dense?: boolean;
};

export function ColorPickerField({
  label,
  value,
  onChange,
  allowTransparent = true,
  showHexLabel = true,
  dense = false,
}: ColorPickerFieldProps) {
  const display = isTransparent(value) ? 'transparent' : value;
  const presets = allowTransparent
    ? [...EDITOR_COLOR_PRESETS]
    : EDITOR_COLOR_PRESETS.filter((c) => c !== 'transparent');

  const isSelected = (c: string) => {
    if (c === 'transparent') return isTransparent(value);
    if (isTransparent(value)) return false;
    return normHex(value) === normHex(c);
  };

  const swatchSize = dense ? 'w-5 h-5' : 'w-6 h-6';
  const swatchShape = dense ? 'rounded-full' : 'rounded-md';

  return (
    <div>
      {label ? (
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1 mb-1.5">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            title={c === 'transparent' ? 'Без заливки' : c}
            onClick={() => onChange(c === 'transparent' ? '' : c)}
            className={`${swatchSize} ${swatchShape} flex-shrink-0 transition-all border`}
            style={{
              background:
                c === 'transparent'
                  ? 'repeating-conic-gradient(#d4d4d4 0% 25%, #fff 0% 50%) 0 0 / 8px 8px'
                  : c,
              borderColor: isSelected(c) ? 'var(--accent)' : 'var(--border)',
              boxShadow: [
                isSelected(c) ? '0 0 0 2px var(--accent-light)' : '',
                c === '#ffffff' || c === '#f8f9fa' ? 'inset 0 0 0 1px rgba(0,0,0,0.06)' : '',
              ]
                .filter(Boolean)
                .join(', ') || undefined,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <NativeColorInput
          value={colorInputValue(display)}
          onChange={onChange}
          title="Свой цвет"
          size={dense ? 'sm' : 'md'}
        />
        {showHexLabel ? (
          <span className="text-xs font-mono truncate min-w-0" style={{ color: 'var(--text-3)' }}>
            {isTransparent(value) ? 'прозрачно' : value}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function NativeColorInput({
  value,
  onChange,
  title,
  size = 'md',
}: {
  value: string;
  onChange: (v: string) => void;
  title?: string;
  size?: 'sm' | 'md';
}) {
  const wh = size === 'sm' ? 24 : 32;
  const safe = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000';
  return (
    <input
      type="color"
      value={safe}
      onChange={(e) => onChange(e.target.value)}
      title={title ?? 'Выбрать цвет'}
      className="rounded cursor-pointer border p-0 overflow-hidden flex-shrink-0"
      style={{
        width: wh,
        height: wh,
        borderColor: 'var(--border)',
        background: 'var(--white)',
      }}
    />
  );
}
