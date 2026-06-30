import { fabric } from 'fabric';

interface LayersPanelProps {
  objects: fabric.Object[];
  onSelect: (obj: fabric.Object) => void;
  onBringForward: (obj: fabric.Object) => void;
  onSendBackward: (obj: fabric.Object) => void;
  onBringToFront?: (obj: fabric.Object) => void;
  onSendToBack?: (obj: fabric.Object) => void;
  onToggleVisibility: (obj: fabric.Object) => void;
  onRemove: (obj: fabric.Object) => void;
  onToggleLock: (obj: fabric.Object) => void;
}

function getLabel(obj: fabric.Object, index: number): string {
  const data = (obj as any).data;
  if (data?.isFrame) return 'Рамка';
  const type = obj.type || 'object';
  if (type === 'i-text' || type === 'text') {
    const t = (obj as fabric.IText).text || '';
    return `"${t.slice(0, 14)}${t.length > 14 ? '…' : ''}"`;
  }
  if (type === 'image') return `Фото ${index + 1}`;
  if (type === 'rect') return `Прямоугольник`;
  if (type === 'circle') return `Круг`;
  if (type === 'triangle') return `Треугольник`;
  if (type === 'ellipse') return `Эллипс`;
  if (type === 'polygon') return `Фигура`;
  if (type === 'group') return `Стикер`;
  if (type === 'line') return `Линия`;
  return `Объект ${index + 1}`;
}

function TypeIcon({ obj }: { obj: fabric.Object }) {
  const data = (obj as any).data;
  if (data?.isFrame) return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2}/>
      <rect x="6" y="6" width="12" height="12" rx="1" strokeWidth={1.5}/>
    </svg>
  );
  const type = obj.type || '';
  if (type === 'i-text' || type === 'text') return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h12" />
    </svg>
  );
  if (type === 'image') return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01" />
    </svg>
  );
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
    </svg>
  );
}

export function LayersPanel({ objects, onSelect, onBringForward, onSendBackward, onBringToFront, onSendToBack, onToggleVisibility, onRemove, onToggleLock }: LayersPanelProps) {
  const reversed = [...objects].reverse();

  return (
    <div className="p-2">
      {reversed.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-6">Холст пуст</p>
      )}
      {reversed.map((obj, i) => {
        const realIndex = objects.length - 1 - i;
        const isLocked = !(obj as any).selectable;
        const isHidden = obj.visible === false;

        return (
          <div
            key={realIndex}
            onClick={() => !isLocked && onSelect(obj)}
            className={`flex items-center gap-1.5 px-2 py-2 rounded mb-0.5 group transition-colors
              ${isLocked ? 'opacity-60 cursor-default' : 'cursor-pointer hover:bg-blue-50'}
              ${isHidden ? 'opacity-40' : ''}
            `}
          >
            {/* Иконка типа */}
            <span className="text-gray-400 flex-shrink-0">
              <TypeIcon obj={obj} />
            </span>

            {/* Название */}
            <span className="flex-1 truncate text-xs text-gray-700 min-w-0">
              {getLabel(obj, realIndex)}
            </span>

            {/* Кнопки */}
            <div className="flex gap-0.5 flex-shrink-0">
              {/* На передний план */}
              {onBringToFront && (
                <button onClick={e => { e.stopPropagation(); onBringToFront(obj); }}
                  title="На передний план" className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 11l7-7 7 7M5 19l7-7 7 7"/>
                  </svg>
                </button>
              )}
              {/* Вверх */}
              <button onClick={e => { e.stopPropagation(); onBringForward(obj); }}
                title="Выше" className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/>
                </svg>
              </button>
              {/* Вниз */}
              <button onClick={e => { e.stopPropagation(); onSendBackward(obj); }}
                title="Ниже" className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {/* На задний план */}
              {onSendToBack && (
                <button onClick={e => { e.stopPropagation(); onSendToBack(obj); }}
                  title="На задний план" className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 13l-7 7-7-7M19 5l-7 7-7-7"/>
                  </svg>
                </button>
              )}

              {/* Блокировка */}
              <button onClick={e => { e.stopPropagation(); onToggleLock(obj); }}
                title={isLocked ? 'Разблокировать' : 'Заблокировать'}
                className={`p-1 rounded hover:bg-gray-200 ${isLocked ? 'text-orange-400' : 'text-gray-300 hover:text-gray-600'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isLocked
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                  }
                </svg>
              </button>

              {/* Видимость */}
              <button onClick={e => { e.stopPropagation(); onToggleVisibility(obj); }}
                title={isHidden ? 'Показать' : 'Скрыть'}
                className={`p-1 rounded hover:bg-gray-200 ${isHidden ? 'text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {!isHidden
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"/>
                  }
                </svg>
              </button>

              {/* Удалить */}
              <button onClick={e => { e.stopPropagation(); onRemove(obj); }}
                title="Удалить" className="p-1 rounded hover:bg-red-100 text-gray-300 hover:text-red-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
