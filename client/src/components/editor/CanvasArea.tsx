import { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { CropOverlay } from './CropOverlay';

interface CanvasAreaProps {
  width: number;
  height: number;
  initialData: object | null;
  onModified: (json: object) => void;
  onCanvasReady: (api: ReturnType<typeof useCanvas>) => void;
  onStateChange?: (api: ReturnType<typeof useCanvas>) => void;
}

export function CanvasArea({ width, height, initialData, onModified, onCanvasReady, onStateChange }: CanvasAreaProps) {
  const canvasApi = useCanvas({ width, height, onModified });
  const onCanvasReadyRef = useRef(onCanvasReady);
  const calledReadyRef = useRef(false);
  useEffect(() => { onCanvasReadyRef.current = onCanvasReady; }, [onCanvasReady]);

  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Pan & zoom
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const spaceRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Space key for pan mode
  useEffect(() => {
    const dn = (e: KeyboardEvent) => { if (e.code === 'Space' && !e.repeat) { spaceRef.current = true; } };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') { spaceRef.current = false; isPanningRef.current = false; } };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  // Ctrl+wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(z => Math.max(0.1, Math.min(4, z * (e.deltaY < 0 ? 1.1 : 0.9))));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || spaceRef.current) {
      e.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    } else {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'CANVAS' && !cropBox) {
        const c = canvasApi.fabricRef.current;
        if (c) {
          c.discardActiveObject();
          c.renderAll();
        }
      }
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    setOffset({ x: panStartRef.current.ox + e.clientX - panStartRef.current.mx, y: panStartRef.current.oy + e.clientY - panStartRef.current.my });
  };
  const stopPan = () => { isPanningRef.current = false; };

  // Canvas ready
  useEffect(() => {
    if (!calledReadyRef.current) { calledReadyRef.current = true; onCanvasReadyRef.current(canvasApi); }
  }, []); // eslint-disable-line

  // State sync
  useEffect(() => {
    onStateChange?.(canvasApi);
  }, [canvasApi.selectedObject, canvasApi.canUndo, canvasApi.canRedo, canvasApi.gridEnabled, canvasApi.snapEnabled, canvasApi.layerVersion, canvasApi.selectedObjectVersion]); // eslint-disable-line

  const loadFromJSONRef = useRef(canvasApi.loadFromJSON);
  loadFromJSONRef.current = canvasApi.loadFromJSON;
  const fabricRefForLoad = canvasApi.fabricRef;

  // Подгружаем сохранённый холст после инициализации Fabric и при смене данных/размера
  useEffect(() => {
    if (!initialData) return;
    const objects = (initialData as any).objects;
    if (!Array.isArray(objects) || objects.length === 0) return;
    let rafId = 0;
    let cancelled = false;
    const tryLoad = () => {
      if (cancelled) return;
      const c = fabricRefForLoad.current;
      if (c && (c as any).lowerCanvasEl) loadFromJSONRef.current(initialData);
      else rafId = requestAnimationFrame(tryLoad);
    };
    tryLoad();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [initialData, width, height]);

  // Double-click crop
  useEffect(() => {
    const c = canvasApi.fabricRef.current;
    if (!c) return;
    const h = () => {
      const obj = c.getActiveObject();
      if (!obj || obj.type !== 'image') return;
      const box = canvasApi.enterCropMode();
      if (box) setCropBox(box);
    };
    c.on('mouse:dblclick', h);
    return () => { c.off('mouse:dblclick', h); };
  }, [canvasApi.fabricRef.current]); // eslint-disable-line

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (cropBox) return;
      if (e.key === 'Delete' || e.key === 'Backspace') canvasApi.deleteSelected();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); canvasApi.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); canvasApi.redo(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [canvasApi, cropBox]);

  // Ширина/высота под панели инструментов, контекст и отступы
  const availW = window.innerWidth - 52 - 300 - 32; // боковая колонка + правая панель + поля
  const availH = window.innerHeight - 48 - 32;       // шапка + поля
  const fitZoom = Math.min(1, availW / width, availH / height);
  const displayZoom = zoom === 1 ? fitZoom : zoom;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ flex: 1, background: 'var(--bg-2)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopPan}
      onMouseLeave={stopPan}
    >
      {/* Холст с тенью и масштабом */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${displayZoom})`,
        transformOrigin: 'center center',
        boxShadow: '0 4px 32px rgba(44,31,20,0.18)',
        lineHeight: 0,
      }}>
        <canvas ref={canvasApi.canvasRef} style={{ display: 'block' }} />
        {cropBox && (
          <CropOverlay
            canvasWidth={width} canvasHeight={height}
            scale={1} canvasScale={displayZoom}
            initialBox={cropBox}
            onApply={box => { canvasApi.applyCrop(box); setCropBox(null); }}
            onCancel={() => { canvasApi.cancelCrop(); setCropBox(null); }}
          />
        )}
      </div>

      {/* Подсказки по масштабу и панораме */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
        style={{ background: 'rgba(44,31,20,0.45)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        <span>Ctrl + колёсико — масштаб</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Space + перетаскивание — панорама</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <button
          style={{ color: 'white', textDecoration: 'underline', pointerEvents: 'auto' }}
          onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
          Сброс
        </button>
        <span style={{ opacity: 0.6 }}>{Math.round(displayZoom * 100)}%</span>
      </div>
    </div>
  );
}

