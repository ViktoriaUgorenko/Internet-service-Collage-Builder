import { fabric } from 'fabric';
import { ColorPickerField } from '../shared/ColorPickerField';

interface PropertiesPanelProps {
  obj: fabric.Object;
  onChange: (props: Record<string, any>) => void;
}

export function PropertiesPanel({ obj, onChange }: PropertiesPanelProps) {
  const type = obj.type || '';
  const isText = type === 'i-text' || type === 'text';
  const isLine = type === 'line';
  const isImage = type === 'image';

  const fill = ((obj.fill as string) ?? '') || '';
  const stroke = ((obj.stroke as string) ?? '') || '';
  const strokeWidth = (obj.strokeWidth as number) ?? 1;
  const opacity = Math.round(((obj.opacity as number) ?? 1) * 100);
  const fontSize = (obj as any).fontSize as number | undefined;
  const fontFamily = (obj as any).fontFamily as string | undefined;

  return (
    <div className="p-3 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>Свойства</p>
      <p className="text-xs rounded px-2 py-1" style={{ color: 'var(--text-3)', background: 'var(--bg-2)' }}>{
        isText ? 'Текст' : isLine ? 'Линия' : isImage ? 'Изображение' : type
      }</p>

      {isText && (
        <>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Текст</p>
            <textarea
              value={(obj as any).text ?? ''}
              onChange={e => onChange({ text: e.target.value })}
              rows={3}
              className="w-full text-xs rounded px-2 py-1.5 resize-none focus:outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text)' }}
            />
          </div>
          <ColorPickerField
            label="Цвет текста"
            value={fill}
            onChange={v => onChange({ fill: v })}
            allowTransparent={false}
          />
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>Размер шрифта</span>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{fontSize}px</span>
            </div>
            <input type="range" min={8} max={200} step={1} value={fontSize ?? 32}
              onChange={e => onChange({ fontSize: Number(e.target.value) })}
              className="w-full h-1.5" style={{ accentColor: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Шрифт</p>
            <select value={fontFamily ?? 'Arial'}
              onChange={e => onChange({ fontFamily: e.target.value })}
              className="w-full text-xs rounded px-2 py-1.5"
              style={{ border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text)' }}>
              {['Arial','Georgia','Times New Roman','Courier New','Verdana','Impact','Comic Sans MS','Trebuchet MS'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1">
            {[
              { prop: 'fontWeight', on: 'bold', off: 'normal', label: 'B', title: 'Жирный' },
              { prop: 'fontStyle', on: 'italic', off: 'normal', label: 'I', title: 'Курсив' },
            ].map(({ prop, on, off, label, title }) => {
              const active = (obj as any)[prop] === on;
              return (
                <button key={prop} title={title}
                  onClick={() => onChange({ [prop]: active ? off : on })}
                  className="px-3 py-1 rounded text-sm font-medium border transition-all"
                  style={{
                    background: active ? 'var(--accent)' : 'var(--white)',
                    color: active ? 'white' : 'var(--text)',
                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {!isText && !isImage && (
        <>
          {!isLine && (
            <ColorPickerField label="Заливка" value={fill} onChange={v => onChange({ fill: v })} />
          )}
          <ColorPickerField label="Контур" value={stroke} onChange={v => onChange({ stroke: v })} />
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>Толщина контура</span>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{strokeWidth}px</span>
            </div>
            <input type="range" min={0} max={20} step={1} value={strokeWidth}
              onChange={e => onChange({ strokeWidth: Number(e.target.value) })}
              className="w-full h-1.5" style={{ accentColor: 'var(--accent)' }} />
          </div>
        </>
      )}

      <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>Прозрачность</span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>{opacity}%</span>
          </div>
          <input type="range" min={0} max={100} step={1} value={opacity}
            onChange={e => onChange({ opacity: Number(e.target.value) / 100 })}
            className="w-full h-1.5" style={{ accentColor: 'var(--accent)' }} />
        </div>
    </div>
  );
}
