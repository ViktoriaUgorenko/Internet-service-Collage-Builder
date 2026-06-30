import { useEffect, useRef, useState, useCallback } from 'react';

interface CropBox {
  x: number; y: number; w: number; h: number;
}

interface CropOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  canvasScale: number; // CSS scale применённый к родительскому div
  initialBox: CropBox;
  onApply: (box: CropBox) => void;
  onCancel: () => void;
}

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

const CURSORS: Record<Handle, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
  e: 'e-resize', se: 'se-resize', s: 's-resize',
  sw: 'sw-resize', w: 'w-resize', move: 'move',
};

export function CropOverlay({ canvasWidth, canvasHeight, scale, canvasScale, initialBox, onApply, onCancel }: CropOverlayProps) {
  const [box, setBox] = useState<CropBox>(initialBox);
  const boxRef = useRef<CropBox>(initialBox);
  const dragRef = useRef<{ handle: Handle; startX: number; startY: number; startBox: CropBox } | null>(null);

  useEffect(() => { boxRef.current = box; }, [box]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); onApply(boxRef.current); }
      if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onApply, onCancel]);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const onMouseDown = useCallback((e: React.MouseEvent, handle: Handle) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startBox: { ...boxRef.current } };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { handle, startX, startY, startBox } = dragRef.current;
      // Делим на canvasScale потому что мышь в экранных координатах, а box в canvas-координатах
      const dx = (e.clientX - startX) / (scale * canvasScale);
      const dy = (e.clientY - startY) / (scale * canvasScale);
      let { x, y, w, h } = startBox;
      const minSize = 20;

      if (handle === 'move') {
        x = clamp(x + dx, 0, canvasWidth - w);
        y = clamp(y + dy, 0, canvasHeight - h);
      } else {
        if (handle.includes('e')) { w = clamp(w + dx, minSize, canvasWidth - x); }
        if (handle.includes('s')) { h = clamp(h + dy, minSize, canvasHeight - y); }
        if (handle.includes('w')) {
          const newX = clamp(x + dx, 0, x + w - minSize);
          w = w + (x - newX); x = newX;
        }
        if (handle.includes('n')) {
          const newY = clamp(y + dy, 0, y + h - minSize);
          h = h + (y - newY); y = newY;
        }
      }
      setBox({ x, y, w, h });
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [scale, canvasScale, canvasWidth, canvasHeight]);

  const sx = box.x * scale;
  const sy = box.y * scale;
  const sw = box.w * scale;
  const sh = box.h * scale;
  const cw = canvasWidth * scale;
  const ch = canvasHeight * scale;

  // Размер ручек компенсируем обратным масштабом чтобы они всегда были одного размера на экране
  const HS = 20 / canvasScale;  // видимый размер ручки в canvas-px
  const HIT = 36 / canvasScale; // зона захвата

  const handles: [Handle, number, number][] = [
    ['nw', sx,        sy],
    ['n',  sx + sw/2, sy],
    ['ne', sx + sw,   sy],
    ['e',  sx + sw,   sy + sh/2],
    ['se', sx + sw,   sy + sh],
    ['s',  sx + sw/2, sy + sh],
    ['sw', sx,        sy + sh],
    ['w',  sx,        sy + sh/2],
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, width: cw, height: ch, pointerEvents: 'none' }}>
      {/* Затемнение + рамка */}
      <svg style={{ position: 'absolute', inset: 0, width: cw, height: ch, pointerEvents: 'none' }}>
        <defs>
          <mask id="crop-mask">
            <rect width={cw} height={ch} fill="white"/>
            <rect x={sx} y={sy} width={sw} height={sh} fill="black"/>
          </mask>
        </defs>
        <rect width={cw} height={ch} fill="rgba(0,0,0,0.5)" mask="url(#crop-mask)"/>
        <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="white" strokeWidth={1.5 / canvasScale}/>
        {/* Сетка третей */}
        {[1,2].map(i => <>
          <line key={`v${i}`} x1={sx + sw*i/3} y1={sy} x2={sx + sw*i/3} y2={sy+sh} stroke="rgba(255,255,255,0.35)" strokeWidth={0.5/canvasScale}/>
          <line key={`h${i}`} x1={sx} y1={sy + sh*i/3} x2={sx+sw} y2={sy + sh*i/3} stroke="rgba(255,255,255,0.35)" strokeWidth={0.5/canvasScale}/>
        </>)}
      </svg>

      {/* Зона перемещения */}
      <div style={{ position: 'absolute', left: sx, top: sy, width: sw, height: sh, cursor: 'move', pointerEvents: 'all' }}
        onMouseDown={e => onMouseDown(e, 'move')} />

      {/* Ручки */}
      {handles.map(([handle, hx, hy]) => (
        <div key={handle} onMouseDown={e => onMouseDown(e, handle)} style={{
          position: 'absolute',
          left: hx - HIT/2, top: hy - HIT/2,
          width: HIT, height: HIT,
          cursor: CURSORS[handle],
          pointerEvents: 'all',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: HS, height: HS,
            background: 'white',
            border: `${2/canvasScale}px solid #3b82f6`,
            borderRadius: 3/canvasScale,
            boxShadow: `0 1px ${6/canvasScale}px rgba(0,0,0,0.6)`,
            pointerEvents: 'none',
          }}/>
        </div>
      ))}

      {/* Подсказка */}
      <div style={{
        position: 'absolute', left: sx + sw/2, top: sy + sh + 12/canvasScale,
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.75)', color: 'white',
        fontSize: 11/canvasScale, padding: `${3/canvasScale}px ${8/canvasScale}px`,
        borderRadius: 4/canvasScale, whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>
        Enter — применить · Esc — отменить
      </div>

      {/* Кнопки ✓ ✕ */}
      <div style={{
        position: 'absolute', left: sx + sw + 8/canvasScale, top: sy,
        display: 'flex', flexDirection: 'column', gap: 4/canvasScale,
        pointerEvents: 'all',
      }}>
        <button onMouseDown={e => { e.stopPropagation(); onApply(box); }}
          style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4/canvasScale, padding: `${5/canvasScale}px ${10/canvasScale}px`, fontSize: 13/canvasScale, cursor: 'pointer', fontWeight: 600, minWidth: 28/canvasScale }}>✓</button>
        <button onMouseDown={e => { e.stopPropagation(); onCancel(); }}
          style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: 4/canvasScale, padding: `${5/canvasScale}px ${10/canvasScale}px`, fontSize: 13/canvasScale, cursor: 'pointer', minWidth: 28/canvasScale }}>✕</button>
      </div>
    </div>
  );
}
