interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function HistoryControls({ canUndo, canRedo, onUndo, onRedo }: HistoryControlsProps) {
  const btn = (enabled: boolean) => ({
    width: 30, height: 30,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
    border: '1px solid',
    borderColor: enabled ? 'var(--border)' : 'var(--border-light)',
    background: 'transparent',
    color: enabled ? 'var(--text-2)' : 'var(--border)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.15s',
  } as React.CSSProperties);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onUndo} disabled={!canUndo}
        title="Отменить (Ctrl+Z)"
        style={btn(canUndo)}
        onMouseEnter={e => { if (canUndo) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--accent-light)'; }}}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = canUndo ? 'var(--border)' : 'var(--border-light)'; }}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
        </svg>
      </button>
      <button
        onClick={onRedo} disabled={!canRedo}
        title="Повторить (Ctrl+Y)"
        style={btn(canRedo)}
        onMouseEnter={e => { if (canRedo) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--accent-light)'; }}}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = canRedo ? 'var(--border)' : 'var(--border-light)'; }}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"/>
        </svg>
      </button>
    </div>
  );
}
