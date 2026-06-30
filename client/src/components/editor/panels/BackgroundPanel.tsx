import { useState, useRef } from 'react';
import { ColorPickerField, NativeColorInput } from '../shared/ColorPickerField';

interface BackgroundPanelProps {
  onSetColor: (color: string) => void;
  onSetGradient: (colors: [string, string], angle: number) => void;
  onSetImage: (dataUrl: string) => void;
  onClearBackground: () => void;
  hasBackgroundImage: boolean;
}

const GRADIENTS: { label: string; colors: [string, string]; angle: number }[] = [
  { label: 'Закат',    colors: ['#ff6b6b', '#feca57'], angle: 135 },
  { label: 'Океан',   colors: ['#0652DD', '#1289A7'], angle: 135 },
  { label: 'Лес',     colors: ['#11998e', '#38ef7d'], angle: 135 },
  { label: 'Сумерки', colors: ['#4776E6', '#8E54E9'], angle: 135 },
  { label: 'Персик',  colors: ['#FDDB92', '#D1FDFF'], angle: 180 },
  { label: 'Ночь',    colors: ['#0f0c29', '#302b63'], angle: 135 },
  { label: 'Роза',    colors: ['#f953c6', '#b91d73'], angle: 135 },
  { label: 'Мята',    colors: ['#00b09b', '#96c93d'], angle: 135 },
];

export function BackgroundPanel({ onSetColor, onSetGradient, onSetImage, onClearBackground, hasBackgroundImage }: BackgroundPanelProps) {
  const [tab, setTab] = useState<'color' | 'gradient' | 'image'>('color');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [gradColors, setGradColors] = useState<[string, string]>(['#4776E6', '#8E54E9']);
  const [gradAngle, setGradAngle] = useState(135);
  const fileRef = useRef<HTMLInputElement>(null);

  const tabStyle = (t: 'color' | 'gradient' | 'image') => ({
    flex: 1,
    padding: '6px 0',
    fontSize: 12,
    fontWeight: 500,
    transition: 'color 0.15s, border-color 0.15s',
    borderBottom: '2px solid',
    borderBottomColor: tab === t ? 'var(--accent)' : 'transparent',
    color: tab === t ? 'var(--accent)' : 'var(--text-3)',
    background: 'transparent',
  } as const);

  // Live preview при изменении цветов или угла
  const handleGradientChange = (colors: [string, string], angle: number) => {
    onSetGradient(colors, angle);
  };

  return (
    <div className="flex flex-col">
      {/* Вкладки */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <button type="button" style={tabStyle('color')} onClick={() => setTab('color')}>Цвет</button>
        <button type="button" style={tabStyle('gradient')} onClick={() => setTab('gradient')}>Градиент</button>
        <button type="button" style={tabStyle('image')} onClick={() => setTab('image')}>Фото</button>
      </div>

      <div className="p-3 space-y-3">

        {/* Сброс фона — всегда доступен */}
        <button type="button" onClick={onClearBackground}
          className="w-full py-1.5 text-xs rounded border transition-colors"
          style={{ background: 'var(--bg-2)', borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          ↺ Сбросить фон (белый)
        </button>

        {tab === 'color' && (
          <ColorPickerField
            label="Цвет фона"
            value={customColor}
            onChange={(c) => { setCustomColor(c); onSetColor(c); }}
            allowTransparent={false}
          />
        )}

        {/* Градиент */}
        {tab === 'gradient' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {GRADIENTS.map(g => (
                <button type="button" key={g.label} onClick={() => {
                  setGradColors(g.colors);
                  setGradAngle(g.angle);
                  onSetGradient(g.colors, g.angle);
                }}
                  className="rounded-lg overflow-hidden border transition-colors"
                  style={{ borderColor: 'var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <div className="h-10 w-full" style={{ background: `linear-gradient(${g.angle}deg, ${g.colors[0]}, ${g.colors[1]})` }} />
                  <div className="text-xs py-1 text-center" style={{ color: 'var(--text-2)' }}>{g.label}</div>
                </button>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>Свой градиент</p>
              <div className="h-8 w-full rounded border" style={{
                borderColor: 'var(--border)',
                background: `linear-gradient(${gradAngle}deg, ${gradColors[0]}, ${gradColors[1]})`,
              }} />
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <NativeColorInput value={gradColors[0]}
                    onChange={(v) => {
                      const c: [string, string] = [v, gradColors[1]];
                      setGradColors(c);
                      handleGradientChange(c, gradAngle);
                    }}
                    title="Начальный цвет"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>От</span>
                </div>
                <div className="flex-1" />
                <div className="flex flex-col items-center gap-1">
                  <NativeColorInput value={gradColors[1]}
                    onChange={(v) => {
                      const c: [string, string] = [gradColors[0], v];
                      setGradColors(c);
                      handleGradientChange(c, gradAngle);
                    }}
                    title="Конечный цвет"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>До</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>Угол</span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{gradAngle}°</span>
                </div>
                <input type="range" min={0} max={360} step={15} value={gradAngle}
                  onChange={e => {
                    const a = Number(e.target.value);
                    setGradAngle(a);
                    handleGradientChange(gradColors, a);
                  }}
                  className="w-full h-1.5" style={{ accentColor: 'var(--accent)' }} />
              </div>
            </div>
          </>
        )}

        {/* Изображение */}
        {tab === 'image' && (
          <div className="space-y-3">
            <p className="text-xs leading-tight" style={{ color: 'var(--text-3)' }}>
              Изображение растянется на весь холст и будет помещено на задний план
            </p>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full py-3 border-2 border-dashed rounded-lg text-xs transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-3)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}>
              + Выбрать изображение
            </button>
            {hasBackgroundImage && (
              <button onClick={onClearBackground}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded border border-red-200 transition-colors">
                ✕ Убрать фоновое изображение
              </button>
            )}            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  if (ev.target?.result) onSetImage(ev.target.result as string);
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
