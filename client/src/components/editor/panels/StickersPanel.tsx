import { useState } from 'react';
import { ColorPickerField } from '../shared/ColorPickerField';

interface StickersPanelProps {
  onAdd: (svg: string) => void;
}

// Монохромные стикеры — цвет задаётся через параметр
const MONO_STICKERS = [
  {
    label: '⭐ Звезда',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="${color}" stroke="${color}" stroke-width="1"/>
    </svg>`,
  },
  {
    label: '🔷 Ромб',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,5 95,50 50,95 5,50" fill="${color}" stroke="${color}" stroke-width="1"/>
    </svg>`,
  },
  {
    label: '🌟 Взрыв',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,2 56,38 90,20 68,48 98,58 62,62 72,96 50,72 28,96 38,62 2,58 32,48 10,20 44,38" fill="${color}" stroke="${color}" stroke-width="1"/>
    </svg>`,
  },
  {
    label: '🔵 Круг',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="${color}"/>
    </svg>`,
  },
  {
    label: '▲ Треугольник',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,5 95,90 5,90" fill="${color}"/>
    </svg>`,
  },
  {
    label: '⬟ Пятиугольник',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,5 95,35 78,90 22,90 5,35" fill="${color}"/>
    </svg>`,
  },
];

// Цветные стикеры — фиксированные цвета
const COLOR_STICKERS = [
  {
    label: '❤️ Сердце',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 9 50 13 C52 9 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z"
        fill="#FF4B6E" stroke="#CC0033" stroke-width="2"/>
    </svg>`,
  },
  {
    label: '✅ Галочка',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#22C55E" stroke="#16A34A" stroke-width="2"/>
      <polyline points="25,50 42,67 75,33" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    label: '🔥 Огонь',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 95 C25 95 10 75 10 58 C10 42 20 32 30 25 C28 35 32 42 38 45 C35 35 40 20 50 5 C50 5 55 25 60 30 C65 20 63 12 60 8 C75 18 90 35 90 58 C90 75 75 95 50 95Z"
        fill="#FF6B00" stroke="#CC4400" stroke-width="1"/>
      <path d="M50 85 C35 85 25 72 25 60 C25 50 32 43 38 40 C37 47 40 52 45 54 C43 47 46 38 50 30 C54 38 57 47 55 54 C60 52 63 47 62 40 C68 43 75 50 75 60 C75 72 65 85 50 85Z"
        fill="#FFD700"/>
    </svg>`,
  },
  {
    label: '💬 Облако',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="10" y="15" width="80" height="55" rx="15" fill="#60A5FA" stroke="#3B82F6" stroke-width="2"/>
      <polygon points="30,70 20,90 50,70" fill="#60A5FA" stroke="#3B82F6" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
];

export function StickersPanel({ onAdd }: StickersPanelProps) {
  const [monoColor, setMonoColor] = useState('#6366f1');

  return (
    <div className="p-2 space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide px-1 mb-2" style={{ color: 'var(--text-3)' }}>Иконки</p>
        <div className="px-1 mb-2">
          <ColorPickerField
            label="Цвет иконок"
            value={monoColor}
            onChange={setMonoColor}
            allowTransparent={false}
            dense
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {MONO_STICKERS.map(s => (
            <button
              key={s.label}
              onClick={() => onAdd(s.svg(monoColor))}
              title={s.label}
              className="aspect-square flex items-center justify-center rounded-lg border transition-colors p-1.5"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-light)';
                e.currentTarget.style.background = 'var(--accent-bg)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'transparent';
              }}
              dangerouslySetInnerHTML={{ __html: s.svg(monoColor) }}
            />
          ))}
        </div>
      </div>

      {/* Цветные стикеры */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide px-1 mb-2" style={{ color: 'var(--text-3)' }}>Цветные</p>
        <div className="grid grid-cols-3 gap-1.5">
          {COLOR_STICKERS.map(s => (
            <button
              key={s.label}
              onClick={() => onAdd(s.svg)}
              title={s.label}
              className="aspect-square flex items-center justify-center rounded-lg border transition-colors p-1"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-light)';
                e.currentTarget.style.background = 'var(--accent-bg)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'transparent';
              }}
              dangerouslySetInnerHTML={{ __html: s.svg }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
