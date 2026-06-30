import { useState, useRef, useCallback, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { FilterPanel } from './panels/FilterPanel';
import { ClipPanel } from './panels/ClipPanel';
import { ShapesPanel } from './panels/ShapesPanel';
import { StickersPanel } from './panels/StickersPanel';
import { LayersPanel } from './panels/LayersPanel';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { BackgroundPanel } from './panels/BackgroundPanel';
import { TemplatesPanel } from './panels/TemplatesPanel';
import { ExportPanel } from './panels/ExportPanel';

interface ContextPanelProps {
  canvasApi: ReturnType<typeof useCanvas>;
  canvasApiRef: React.MutableRefObject<ReturnType<typeof useCanvas> | null>;
  onAddImage: () => void;
  projectTitle?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest"
      style={{ color: 'var(--text-3)' }}>
      {children}
    </p>
  );
}

// Иконочные вкладки — вертикальный список слева от контента
const TAB_ICONS: Record<string, React.ReactNode> = {
  props: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>,
  clip: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"/></svg>,
  filters: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>,
  layers: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>,
  add: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>,
  templates: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>,
  export: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
};

const TAB_LABELS: Record<string, string> = {
  props: 'Свойства', clip: 'Обрезка', filters: 'Фильтры',
  layers: 'Слои', add: 'Добавить', templates: 'Шаблоны', export: 'Экспорт',
};

export function ContextPanel({ canvasApi, canvasApiRef, projectTitle = 'collage', canvasWidth = 1080, canvasHeight = 1080 }: ContextPanelProps) {
  // Получаем тип из выбранного объекта, если type undefined, пробуем получить из fabric canvas
  const obj = canvasApi.selectedObject;
  let type = obj?.type ?? null;
  if (type === undefined || type === null) {
    // Пытаемся получить тип из активного объекта fabric
    const fabricObj = canvasApi.fabricRef.current?.getActiveObject();
    type = fabricObj?.type ?? null;
  }
  const isFrame = obj && (obj as any).data?.isFrame === true;
  const isImage = type === 'image' && !isFrame;
  const isText = (type === 'i-text' || type === 'text') && !isFrame;
  const isShape = type && ['rect', 'circle', 'triangle', 'ellipse', 'line', 'polygon'].includes(type) && !isFrame;

  type Tab = 'props' | 'filters' | 'clip' | 'layers' | 'add' | 'templates' | 'export';

  const [tab, setTab] = useState<Tab>('add');
  const prevTypeRef = useRef<string | null>(null);

  const visibleTabs: Tab[] = [
    ...(isText || isShape ? ['props' as Tab] : []),
    ...(isImage ? ['clip' as Tab, 'filters' as Tab] : []),
    'layers', 'add', 'templates', 'export',
  ];

  // При изменении типа объекта автоматически переключаемся на первую доступную вкладку
  // для этого типа, если пользователь не находится уже на доступной вкладке
  useEffect(() => {
    if (prevTypeRef.current === type) return;
    prevTypeRef.current = type;
    
    // Если объект не выбран (type === null), оставляем текущую вкладку
    if (type === null) return;
    
    // Если текущая вкладка уже доступна для этого типа объекта, оставляем её
    if (visibleTabs.includes(tab)) {
      return;
    }
    
    // Найти первую доступную вкладку для этого типа
    const firstAvailable = visibleTabs[0] || 'layers';
    setTab(firstAvailable);
  }, [type, tab, visibleTabs, canvasApi.selectedObjectVersion]);

  const handleTabClick = (t: Tab) => {
    setTab(t);
  };

  const activeTab: Tab = visibleTabs.includes(tab) ? tab : 'layers';

  const [panelWidth, setPanelWidth] = useState(260);
  const dragRef = useRef(false);

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = true;
    const startX = e.clientX;
    const startW = panelWidth;
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPanelWidth(Math.max(220, Math.min(480, startW + (startX - ev.clientX))));
    };
    const onUp = () => {
      dragRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [panelWidth]);

  return (
    <div className="flex flex-shrink-0 h-full overflow-hidden"
      style={{ width: panelWidth, borderLeft: '1px solid var(--border)', background: 'var(--white)', position: 'relative' }}>

      {/* Resize handle */}
      <div onMouseDown={onResizeMouseDown}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, cursor: 'col-resize', zIndex: 10 }}
        className="hover:bg-amber-300 transition-colors"/>

      {/* Иконочный сайдбар вкладок */}
      <div className="flex flex-col items-center py-2 flex-shrink-0"
        style={{ width: 40, borderRight: '1px solid var(--border)', gap: 2 }}>
        {visibleTabs.map(t => (
          <button key={t} onClick={() => handleTabClick(t)} title={TAB_LABELS[t]}
            className="relative group w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{
              background: activeTab === t ? 'var(--accent-bg)' : 'transparent',
              color: activeTab === t ? 'var(--accent)' : 'var(--text-3)',
            }}
            onMouseEnter={e => { if (activeTab !== t) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}}
            onMouseLeave={e => { if (activeTab !== t) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}}>
            {TAB_ICONS[t]}
            {/* Tooltip */}
            <span className="absolute right-full mr-2 px-2 py-1 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{ background: 'var(--text)', color: 'var(--white)' }}>
              {TAB_LABELS[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Контент вкладки */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>
            {obj
              ? (isImage ? '🖼 Изображение' : isText ? '✏️ Текст' : (type === 'activeSelection' || type === 'group') ? '◻ Группа' : `◻ ${type}`)
              : TAB_LABELS[activeTab]}
          </span>
          {obj && (
            <button onClick={() => canvasApiRef.current?.deleteSelected()}
              title="Удалить объект"
              className="w-5 h-5 flex items-center justify-center rounded text-xs transition-all"
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}>
              ✕
            </button>
          )}
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-y-auto">

          {activeTab === 'props' && obj && (
            <PropertiesPanel obj={obj} onChange={p => canvasApiRef.current?.updateSelected(p)}/>
          )}

          {activeTab === 'clip' && (
            <ClipPanel
              onApply={(s, sc) => canvasApiRef.current?.applyClipShape(s, sc)}
              onPreview={(s, sc) => canvasApiRef.current?.previewClipShape(s, sc)}/>
          )}

          {activeTab === 'filters' && (
            <FilterPanel onApply={(n, o) => canvasApiRef.current?.applyFilter(n, o)}/>
          )}

          {activeTab === 'layers' && (
            <LayersPanel
              objects={canvasApi.getObjects()}
              onSelect={o => canvasApi.selectObject(o)}
              onBringForward={o => canvasApi.bringForward(o)}
              onSendBackward={o => canvasApi.sendBackward(o)}
              onBringToFront={o => canvasApi.bringToFront(o)}
              onSendToBack={o => canvasApi.sendToBack(o)}
              onToggleVisibility={o => canvasApi.toggleVisibility(o)}
              onRemove={o => canvasApi.removeObject(o)}
              onToggleLock={o => canvasApi.toggleLock(o)}/>
          )}

          {activeTab === 'add' && (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              <div>
                <SectionTitle>Фон</SectionTitle>
                <BackgroundPanel
                  onSetColor={c => canvasApi.setBackground(c)}
                  onSetGradient={(c, a) => canvasApi.setBackgroundGradient(c, a)}
                  onSetImage={d => canvasApi.setBackgroundImage(d)}
                  onClearBackground={() => canvasApi.clearBackground()}
                  hasBackgroundImage={!!(canvasApi.fabricRef.current?.backgroundImage)}/>
              </div>
              <div>
                <SectionTitle>Фигуры</SectionTitle>
                <ShapesPanel onAddShape={(t, f, s, sw) => canvasApi.addShape(t, f, s, sw)}/>
              </div>
              <div>
                <SectionTitle>Стикеры</SectionTitle>
                <StickersPanel onAdd={svg => canvasApi.addSticker(svg)}/>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <TemplatesPanel
              onApply={(d: object) => {
                console.log('ContextPanel: Applying template via canvasApi.loadFromJSON', d);
                if (canvasApi && canvasApi.loadFromJSON) {
                  canvasApi.loadFromJSON(d, true);
                } else {
                  console.error('ContextPanel: canvasApi or loadFromJSON is missing', canvasApi);
                }
              }}
              getCanvasData={() => {
                const data = canvasApi.fabricRef.current?.toJSON(['id']) ?? null;
                console.log('ContextPanel: getCanvasData', data ? 'has data' : 'no data');
                return data;
              }}
              getThumbnail={() => {
                const thumbnail = canvasApi.exportPNG() ?? '';
                console.log('ContextPanel: getThumbnail', thumbnail ? 'has thumbnail' : 'no thumbnail');
                return thumbnail;
              }}
              onAddFrame={svg => {
                console.log('ContextPanel: Adding frame');
                canvasApi.addFrame(svg);
              }}/>
          )}

          {activeTab === 'export' && (
            <ExportPanel
              getFabricCanvas={() => canvasApiRef.current?.fabricRef.current}
              projectTitle={projectTitle}
              width={canvasWidth}
              height={canvasHeight}/>
          )}
        </div>
      </div>
    </div>
  );
}
