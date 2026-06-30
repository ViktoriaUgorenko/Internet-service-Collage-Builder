interface BuiltinTemplatesPanelProps {
  onAdd: (svgString: string) => void;
}

// Встроенные шаблоны (рамки) — SVG с viewBox="0 0 100 100", масштабируется на весь холст
const BUILTIN_TEMPLATES = [
  {
    label: 'Классическая рамка',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="#8B6914" strokeWidth="4"/>
        <rect x="5" y="5" width="90" height="90" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
        <rect x="7" y="7" width="86" height="86" fill="none" stroke="#8B6914" strokeWidth="1"/>
      </svg>
    ),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="#8B6914" stroke-width="4"/>
      <rect x="5" y="5" width="90" height="90" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
      <rect x="7" y="7" width="86" height="86" fill="none" stroke="#8B6914" stroke-width="1"/>
    </svg>`,
  },
  {
    label: 'Тонкая рамка',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="3" y="3" width="94" height="94" fill="none" stroke="#333" strokeWidth="1.5"/>
        <rect x="6" y="6" width="88" height="88" fill="none" stroke="#333" strokeWidth="0.5"/>
      </svg>
    ),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="3" y="3" width="94" height="94" fill="none" stroke="#333333" stroke-width="1.5"/>
      <rect x="6" y="6" width="88" height="88" fill="none" stroke="#333333" stroke-width="0.5"/>
    </svg>`,
  },
  {
    label: 'Скруглённая рамка',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="3" y="3" width="94" height="94" rx="8" fill="none" stroke="#555" strokeWidth="3"/>
        <rect x="7" y="7" width="86" height="86" rx="5" fill="none" stroke="#555" strokeWidth="1"/>
      </svg>
    ),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="3" y="3" width="94" height="94" rx="8" fill="none" stroke="#555555" stroke-width="3"/>
      <rect x="7" y="7" width="86" height="86" rx="5" fill="none" stroke="#555555" stroke-width="1"/>
    </svg>`,
  },
  {
    label: 'Двойная рамка',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="#222" strokeWidth="3"/>
        <rect x="8" y="8" width="84" height="84" fill="none" stroke="#222" strokeWidth="3"/>
      </svg>
    ),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="2" y="2" width="96" height="96" fill="none" stroke="#222222" stroke-width="3"/>
      <rect x="8" y="8" width="84" height="84" fill="none" stroke="#222222" stroke-width="3"/>
    </svg>`,
  },
  {
    label: 'Белая рамка',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ background: '#ddd' }}>
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="white" strokeWidth="10"/>
      </svg>
    ),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="white" stroke-width="10"/>
    </svg>`,
  },
  {
    label: 'Плёнка',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="0" y="0" width="100" height="12" fill="#111"/>
        <rect x="0" y="88" width="100" height="12" fill="#111"/>
        {[10,22,34,46,58,70,82].map(x => (
          <rect key={x} x={x} y="3" width="8" height="6" rx="1" fill="#444"/>
        ))}
        {[10,22,34,46,58,70,82].map(x => (
          <rect key={x} x={x} y="91" width="8" height="6" rx="1" fill="#444"/>
        ))}
      </svg>
    ),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="0" y="0" width="100" height="12" fill="#111111"/>
      <rect x="0" y="88" width="100" height="12" fill="#111111"/>
      <rect x="10" y="3" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="22" y="3" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="34" y="3" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="46" y="3" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="58" y="3" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="70" y="3" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="82" y="3" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="10" y="91" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="22" y="91" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="34" y="91" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="46" y="91" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="58" y="91" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="70" y="91" width="8" height="6" rx="1" fill="#444444"/>
      <rect x="82" y="91" width="8" height="6" rx="1" fill="#444444"/>
    </svg>`,
  },
  {
    label: 'Полароид',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="0" y="0" width="100" height="100" fill="white"/>
        <rect x="6" y="6" width="88" height="72" fill="#eee"/>
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="#ddd" strokeWidth="1"/>
      </svg>
    ),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect x="0" y="0" width="100" height="6" fill="white"/>
      <rect x="0" y="78" width="100" height="22" fill="white"/>
      <rect x="0" y="0" width="6" height="100" fill="white"/>
      <rect x="94" y="0" width="6" height="100" fill="white"/>
    </svg>`,
  },
  {
    label: 'Угловая рамка',
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Углы */}
        <path d="M5,20 L5,5 L20,5" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
        <path d="M80,5 L95,5 L95,20" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
        <path d="M95,80 L95,95 L80,95" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
        <path d="M20,95 L5,95 L5,80" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M5,20 L5,5 L20,5" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
      <path d="M80,5 L95,5 L95,20" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
      <path d="M95,80 L95,95 L80,95" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
      <path d="M20,95 L5,95 L5,80" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
];

export function BuiltinTemplatesPanel({ onAdd }: BuiltinTemplatesPanelProps) {
  return (
    <div className="p-3 space-y-2">
      <p className="text-xs" style={{ color: 'var(--text-3)' }}>Встроенные шаблоны (рамки) — добавляются поверх всего коллажа</p>
      <div className="grid grid-cols-2 gap-2">
        {BUILTIN_TEMPLATES.map(template => (
          <button
            key={template.label}
            onClick={() => onAdd(template.svg)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all"
            style={{ borderColor: 'var(--border)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-light)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}>
            <div className="w-full aspect-square rounded overflow-hidden" style={{ background: 'var(--bg-2)' }}>
              {template.preview}
            </div>
            <span className="text-xs" style={{ color: 'var(--text-2)' }}>{template.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
