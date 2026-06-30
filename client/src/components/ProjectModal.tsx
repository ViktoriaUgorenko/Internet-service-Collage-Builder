import React, { useState } from 'react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, width: number, height: number) => void;
}

const PRESETS = [
  { id: 'instagram', name: 'Instagram',  sub: '1080 × 1080', width: 1080, height: 1080, icon: '▣' },
  { id: 'youtube',   name: 'YouTube',    sub: '1920 × 1080', width: 1920, height: 1080, icon: '▬' },
  { id: 'story',     name: 'Stories',    sub: '1080 × 1920', width: 1080, height: 1920, icon: '▮' },
  { id: 'a4',        name: 'A4 Печать',  sub: '2480 × 3508', width: 2480, height: 3508, icon: '▯' },
  { id: 'custom',    name: 'Свой размер',sub: 'px',          width: 0,    height: 0,    icon: '✎' },
];

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle]   = useState('');
  const [preset, setPreset] = useState(PRESETS[0]);
  const [customW, setCustomW] = useState('800');
  const [customH, setCustomH] = useState('600');

  if (!isOpen) return null;

  const isCustom = preset.id === 'custom';

  const getFinalSize = () => {
    if (isCustom) {
      const w = Math.max(1, Math.min(10000, parseInt(customW) || 800));
      const h = Math.max(1, Math.min(10000, parseInt(customH) || 600));
      return { width: w, height: h };
    }
    return { width: preset.width, height: preset.height };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { width, height } = getFinalSize();
    onSubmit(title.trim() || 'Новый коллаж', width, height);
    setTitle('');
    onClose();
  };

  const handleCustomInput = (val: string, setter: (v: string) => void) => {
    const clean = val.replace(/\D/g, '');
    setter(clean);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(44,31,20,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="w-full max-w-md rounded-2xl border p-8"
        style={{ background: 'var(--white)', borderColor: 'var(--border)' }}>

        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Новый коллаж</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Название */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
              Название проекта
            </label>
            <input
              type="text"
              placeholder="Мой коллаж"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition-all"
              style={{ background: 'var(--white)', borderColor: 'var(--border)', color: 'var(--text)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Размер холста */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>
              Размер холста
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(p => {
                const selected = preset.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p)}
                    className="relative flex flex-col items-start p-3 rounded-xl border text-left transition-all"
                    style={{
                      background: selected ? 'var(--accent-bg)' : 'var(--bg)',
                      borderColor: selected ? 'var(--accent)' : 'var(--border)',
                      boxShadow: selected ? '0 0 0 2px var(--accent-light)' : 'none',
                    }}>
                    {/* Галочка */}
                    {selected && (
                      <span
                        className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent)' }}>
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      </span>
                    )}
                    <span
                      className="text-xs font-semibold pr-5"
                      style={{ color: selected ? 'var(--accent-dark)' : 'var(--text)' }}>
                      {p.name}
                    </span>
                    <span className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {p.id === 'custom' ? 'Введите вручную' : p.sub + ' px'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Поля ввода для своего размера */}
            {isCustom && (
              <div
                className="mt-3 flex items-center gap-2 p-3 rounded-xl border"
                style={{ background: 'var(--accent-bg)', borderColor: 'var(--accent-light)' }}>
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>Ширина (px)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customW}
                    onChange={e => handleCustomInput(e.target.value, setCustomW)}
                    placeholder="800"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all font-medium"
                    style={{ background: 'var(--white)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <span className="text-sm mt-4" style={{ color: 'var(--text-3)' }}>×</span>
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>Высота (px)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customH}
                    onChange={e => handleCustomInput(e.target.value, setCustomH)}
                    placeholder="600"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all font-medium"
                    style={{ background: 'var(--white)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
              style={{ background: 'var(--accent)', color: 'white' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dark)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
