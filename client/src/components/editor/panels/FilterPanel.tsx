import { useState } from 'react';

interface FilterPanelProps {
  onApply: (name: string, options?: Record<string, number>) => void;
}

const PRESETS = [
  { name: 'none',      label: 'Оригинал' },
  { name: 'grayscale', label: 'Ч/Б' },
  { name: 'sepia',     label: 'Сепия' },
  { name: 'invert',    label: 'Инверсия' },
];

const SLIDERS = [
  { name: 'blur',       label: 'Размытие', min: 0,  max: 1,  step: 0.05, default: 0 },
  { name: 'brightness', label: 'Яркость',  min: -1, max: 1,  step: 0.05, default: 0 },
  { name: 'contrast',   label: 'Контраст', min: -1, max: 1,  step: 0.05, default: 0 },
];

export function FilterPanel({ onApply }: FilterPanelProps) {
  const [activePreset, setActivePreset] = useState<string>('none');
  const [values, setValues] = useState<Record<string, number>>({
    blur: 0, brightness: 0, contrast: 0,
  });

  const handlePreset = (name: string) => {
    setActivePreset(name);
    onApply(name);
  };

  const handleSlider = (name: string, val: number) => {
    setValues(prev => ({ ...prev, [name]: val }));
    onApply(name, { value: val });
  };

  const handleReset = () => {
    setActivePreset('none');
    setValues({ blur: 0, brightness: 0, contrast: 0 });
    onApply('none');
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Фильтры</p>
        <button
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-rose-500 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-50"
        >
          Сбросить
        </button>
      </div>

      {/* Пресеты */}
      <div className="grid grid-cols-2 gap-1">
        {PRESETS.map(f => (
          <button
            key={f.name}
            onClick={() => handlePreset(f.name)}
            className={`px-2 py-1.5 text-xs rounded transition-colors text-left font-medium ${
              activePreset === f.name
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Слайдеры */}
      {SLIDERS.map(f => (
        <div key={f.name}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">{f.label}</span>
            <span className="text-xs text-gray-400 tabular-nums">{values[f.name]?.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={f.min} max={f.max} step={f.step}
            value={values[f.name] ?? f.default}
            onChange={e => handleSlider(f.name, parseFloat(e.target.value))}
            className="w-full h-1.5 accent-indigo-500"
          />
        </div>
      ))}
    </div>
  );
}
