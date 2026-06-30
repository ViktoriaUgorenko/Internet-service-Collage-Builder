import { useState, useEffect } from 'react';
import { createTemplate, deleteTemplate, Template } from '../../../services/templates';
import { BuiltinTemplatesPanel } from './BuiltinTemplatesPanel';

interface TemplatesPanelProps {
  onApply: (canvasData: object) => void;
  getCanvasData: () => object | null;
  getThumbnail: () => string;
  onAddFrame: (svgString: string) => void;
}

export function TemplatesPanel({ onApply, getCanvasData, getThumbnail, onAddFrame }: TemplatesPanelProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState<'builtin' | 'my'>('builtin');
  const [_error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('Other');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (scope === 'builtin') {
      // Встроенные шаблоны (рамки) показываются через BuiltinTemplatesPanel
      setTemplates([]);
    } else {
      // Для пользовательских шаблонов загружаем из API
      setLoading(true);
      try {
        const { getTemplates } = await import('../../../services/templates');
        const data = await getTemplates({ scope: 'my' });
        setTemplates(data);
      } catch {
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => { load(); }, [scope]); // eslint-disable-line

  const handleSave = async () => {
    if (!saveName.trim()) return;
    const canvasData = getCanvasData();
    if (!canvasData) return;
    setSaving(true);
    try {
      await createTemplate({
        name: saveName.trim(),
        canvasData,
        thumbnailUrl: getThumbnail(),
        category: saveCategory,
        isPublic: false,
      });
      setSaveName('');
      setShowForm(false);
      setScope('my');
    } catch {
      setError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить шаблон?')) return;
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Ошибка удаления');
    }
  };

  const handleApply = async (t: Template) => {
    console.log('Applying template:', t.name, 'template object:', t);
    
    if (t.canvasData) {
      let canvasData: any;
      
      // Если canvasData это строка (JSON), парсим её
      if (typeof t.canvasData === 'string') {
        try {
          canvasData = JSON.parse(t.canvasData);
          console.log('Parsed canvasData from string');
        } catch (error) {
          console.error('Failed to parse canvasData string:', error);
          return;
        }
      } else {
        canvasData = t.canvasData as any;
      }
      
      console.log('canvasData keys:', Object.keys(canvasData));
      
      // Убедимся, что canvasData содержит все необходимые поля
      if (!canvasData.version) {
        canvasData.version = '5.3.0';
      }
      if (!canvasData.width) {
        canvasData.width = 1080;
      }
      if (!canvasData.height) {
        canvasData.height = 1080;
      }
      if (!canvasData.objects) {
        canvasData.objects = [];
      }
      if (!canvasData.background) {
        canvasData.background = '#ffffff';
      }
      
      console.log('Processed canvasData:', {
        version: canvasData.version,
        width: canvasData.width,
        height: canvasData.height,
        objectsCount: canvasData.objects?.length || 0,
        background: canvasData.background
      });
      
      onApply(canvasData);
    } else {
      console.error('Template has no canvasData:', t);
      // Попробуем загрузить полный шаблон по ID
      console.log('Attempting to load full template by ID:', t.id);
      const { getTemplateById } = await import('../../../services/templates');
      try {
        const fullTemplate = await getTemplateById(t.id);
        console.log('Full template loaded:', fullTemplate);
        if (fullTemplate.canvasData) {
          await handleApply(fullTemplate); // Рекурсивно применим с полными данными
        } else {
          console.error('Even full template has no canvasData');
        }
      } catch (error) {
        console.error('Failed to load full template:', error);
      }
    }
  };

  return (
    <div className="p-3 space-y-3">

      {/* Переключатель Встроенные / Мои */}
      <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: 'var(--bg-2)' }}>
        {(['builtin', 'my'] as const).map(s => (
          <button key={s} onClick={() => setScope(s)}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all"
            style={{
              background: scope === s ? 'var(--white)' : 'transparent',
              color: scope === s ? 'var(--text)' : 'var(--text-3)',
              boxShadow: scope === s ? '0 1px 4px rgba(44,31,20,0.08)' : 'none',
            }}>
            {s === 'builtin' ? '✦ Встроенные' : '◎ Мои'}
          </button>
        ))}
      </div>

      {/* Кнопка сброса / очистки холста */}
      <button onClick={() => {
          if (confirm('Очистить холст? Все несохраненные изменения будут потеряны.')) {
            // Получаем текущие размеры холста
            const currentData = getCanvasData();
            const width = (currentData as any)?.width || 1080;
            const height = (currentData as any)?.height || 1080;
            onApply({
              version: '5.3.0',
              width,
              height,
              background: '#ffffff',
              objects: [],
            });
          }
        }}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-xl transition-all"
        style={{ border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text-2)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Очистить холст
      </button>

      {/* Кнопка сохранить (только в "Мои") */}
      {scope === 'my' && (
        <button onClick={() => setShowForm(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-all"
          style={{ background: 'var(--accent)', color: 'white' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          Сохранить текущий холст
        </button>
      )}

      {/* Форма сохранения */}
      {showForm && scope === 'my' && (
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
          <input value={saveName} onChange={e => setSaveName(e.target.value)}
            placeholder="Название шаблона"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}/>
          <select value={saveCategory} onChange={e => setSaveCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text)' }}>
            <option>Basic</option>
            <option>Frames</option>
            <option>Other</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !saveName.trim()}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all text-white"
              style={{ background: 'var(--accent)' }}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs rounded-lg transition-all"
              style={{ color: 'var(--text-3)' }}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Контент в зависимости от выбранной вкладки */}
      {scope === 'builtin' ? (
        <BuiltinTemplatesPanel onAdd={onAddFrame}/>
      ) : (
        <>
          {/* Список пользовательских шаблонов */}
          {loading && (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}/>
            </div>
          )}

          {!loading && templates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                Сохранённых шаблонов нет
              </p>
            </div>
          )}

          {!loading && templates.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {templates.map(t => (
                <div key={t.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer transition-all"
                  style={{ border: '1px solid var(--border-light)' }}
                  onClick={() => handleApply(t)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-light)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(160,120,90,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {/* Превью */}
                  <div className="aspect-square overflow-hidden" style={{ background: 'var(--bg-2)' }}>
                    {t.thumbnailUrl ? (
                      <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover"/>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2"
                        style={{ background: '#ede5db' }}>
                        <span className="text-xs font-semibold text-center leading-tight"
                          style={{ color: 'rgba(0,0,0,0.5)', fontSize: 10 }}>
                          {t.name}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(0,0,0,0.3)', fontSize: 9 }}>
                          {t.category}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Инфо */}
                  <div className="px-2 py-1.5" style={{ background: 'var(--white)' }}>
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-3)' }}>{t.category}</p>
                  </div>
                  {/* Удалить (только свои) */}
                  {t.userId && (
                    <button onClick={e => handleDelete(t.id, e)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      style={{ background: 'var(--danger)' }}>
                      ×
                    </button>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 pointer-events-none transition-all group-hover:bg-black/5"/>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
