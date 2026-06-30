import { useState } from 'react';
import { ColorPickerField } from '../shared/ColorPickerField';

interface ShapesPanelProps {
  onAddShape: (type: string, fill: string, stroke: string, strokeWidth: number) => void;
}

const SHAPES = [
  { type: 'rect',     label: 'Прямоугольник', icon: <svg viewBox="0 0 32 32" className="w-6 h-6"><rect x="3" y="7" width="26" height="18" rx="2" fill="currentColor"/></svg> },
  { type: 'circle',   label: 'Круг',          icon: <svg viewBox="0 0 32 32" className="w-6 h-6"><circle cx="16" cy="16" r="13" fill="currentColor"/></svg> },
  { type: 'triangle', label: 'Треугольник',   icon: <svg viewBox="0 0 32 32" className="w-6 h-6"><polygon points="16,3 29,29 3,29" fill="currentColor"/></svg> },
  { type: 'ellipse',  label: 'Эллипс',        icon: <svg viewBox="0 0 32 32" className="w-6 h-6"><ellipse cx="16" cy="16" rx="14" ry="9" fill="currentColor"/></svg> },
  { type: 'star',     label: 'Звезда',        icon: <svg viewBox="0 0 32 32" className="w-6 h-6"><polygon points="16,2 19,11 29,11 21,17 24,27 16,21 8,27 11,17 3,11 13,11" fill="currentColor"/></svg> },
  { type: 'line',     label: 'Линия',         icon: <svg viewBox="0 0 32 32" className="w-6 h-6"><line x1="3" y1="16" x2="29" y2="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> },
];

export function ShapesPanel({ onAddShape }: ShapesPanelProps) {
  const [selected, setSelected] = useState('rect');
  const [fill, setFill] = useState('#a0785a');
  const [stroke, setStroke] = useState('');
  const [strokeWidth, setStrokeWidth] = useState(0);

  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-6 gap-1">
        {SHAPES.map(s => (
          <button key={s.type} onClick={() => setSelected(s.type)} title={s.label}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
            style={{
              background: selected === s.type ? 'var(--accent-bg)' : 'transparent',
              color: selected === s.type ? 'var(--accent)' : 'var(--text-3)',
              border: selected === s.type ? '1px solid var(--accent-light)' : '1px solid transparent',
            }}
            onMouseEnter={e => { if (selected !== s.type) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}}
            onMouseLeave={e => { if (selected !== s.type) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}}>
            {s.icon}
          </button>
        ))}
      </div>

      <ColorPickerField label="Заливка" value={fill} onChange={setFill} dense />

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>Контур</span>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{strokeWidth}px</span>
        </div>
        <ColorPickerField
          label=""
          value={stroke}
          onChange={setStroke}
          dense
          showHexLabel={false}
        />
        <input type="range" min={0} max={20} step={1} value={strokeWidth}
          onChange={e => setStrokeWidth(Number(e.target.value))}
          className="w-full h-1.5 mt-2" style={{ accentColor: 'var(--accent)' }}/>
      </div>

      <button onClick={() => onAddShape(selected, fill, stroke, strokeWidth)}
        className="w-full py-2 text-sm font-medium rounded-xl transition-all text-white"
        style={{ background: 'var(--accent)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dark)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
        Добавить
      </button>
    </div>
  );
}
