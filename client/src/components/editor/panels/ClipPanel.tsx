import { useState, useRef } from 'react';

interface ClipPanelProps {
  onApply: (shape: string, scale: number) => void;
  onPreview: (shape: string, scale: number) => void;
}

const CLIP_SHAPES = [
  { type: 'none', label: 'Без маски', icon: (
    <svg viewBox="0 0 40 40" className="w-7 h-7"><rect x="4" y="4" width="32" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/></svg>
  )},
  { type: 'rect', label: 'Прямоугольник', icon: (
    <svg viewBox="0 0 40 40" className="w-7 h-7"><rect x="4" y="8" width="32" height="24" rx="2" fill="currentColor"/></svg>
  )},
  { type: 'circle', label: 'Круг', icon: (
    <svg viewBox="0 0 40 40" className="w-7 h-7"><circle cx="20" cy="20" r="16" fill="currentColor"/></svg>
  )},
  { type: 'ellipse', label: 'Эллипс', icon: (
    <svg viewBox="0 0 40 40" className="w-7 h-7"><ellipse cx="20" cy="20" rx="18" ry="11" fill="currentColor"/></svg>
  )},
  { type: 'triangle', label: 'Треугольник', icon: (
    <svg viewBox="0 0 40 40" className="w-7 h-7"><polygon points="20,4 36,36 4,36" fill="currentColor"/></svg>
  )},
  { type: 'diamond', label: 'Ромб', icon: (
    <svg viewBox="0 0 40 40" className="w-7 h-7"><polygon points="20,3 37,20 20,37 3,20" fill="currentColor"/></svg>
  )},
  { type: 'star', label: 'Звезда', icon: (
    <svg viewBox="0 0 40 40" className="w-7 h-7"><polygon points="20,3 24,14 36,14 27,22 30,34 20,27 10,34 13,22 4,14 16,14" fill="currentColor"/></svg>
  )},
  { type: 'heart', label: 'Сердце', icon: (
    <svg viewBox="0 0 40 40" className="w-7 h-7"><path d="M20 34 C20 34 4 24 4 13 C4 8 8 5 12 5 C15 5 18 7 20 10 C22 7 25 5 28 5 C32 5 36 8 36 13 C36 24 20 34 20 34Z" fill="currentColor"/></svg>
  )},
];

export function ClipPanel({ onApply, onPreview }: ClipPanelProps) {
  const [maskSize, setMaskSize] = useState(100);
  const [activeShape, setActiveShape] = useState<string | null>(null);
  const activeShapeRef = useRef<string | null>(null);

  const handleShapeClick = (type: string) => {
    setActiveShape(type);
    activeShapeRef.current = type;
    onApply(type, maskSize / 100);
  };

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Обрезка</p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
        <p className="text-xs font-medium text-blue-700 mb-1">✂ Произвольная область</p>
        <p className="text-xs text-blue-600 leading-tight">
          Дважды кликните по изображению на холсте
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">По форме</p>

        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">Размер маски</span>
            <span className="text-xs font-medium text-gray-700">{maskSize}%</span>
          </div>
          <input
            type="range" min={10} max={100} step={1} value={maskSize}
            onChange={e => {
              const val = Number(e.target.value);
              setMaskSize(val);
              if (activeShapeRef.current) onPreview(activeShapeRef.current, val / 100);
            }}
            onMouseUp={e => {
              const val = Number((e.target as HTMLInputElement).value);
              if (activeShapeRef.current) onApply(activeShapeRef.current, val / 100);
            }}
            className="w-full h-2 accent-blue-500 cursor-pointer"
          />
          {activeShape && (
            <p className="text-xs text-blue-500 mt-1">
              Ползунок применяется к «{CLIP_SHAPES.find(s => s.type === activeShape)?.label}»
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {CLIP_SHAPES.map(s => (
            <button
              key={s.type}
              onClick={() => handleShapeClick(s.type)}
              title={s.label}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors
                ${activeShape === s.type
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-gray-500'
                }`}
            >
              {s.icon}
              <span className="text-xs leading-tight text-center">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
