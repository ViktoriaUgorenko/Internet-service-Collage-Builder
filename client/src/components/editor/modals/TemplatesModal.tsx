import { useState, useEffect } from 'react';
import { createTemplate, deleteTemplate, Template } from '../../../services/templates';

interface TemplatesModalProps {
  onClose: () => void;
  /** Применить шаблон — загрузить canvasData на холст */
  onApply: (canvasData: object) => void;
  /** Сохранить текущий холст как шаблон */
  currentCanvasData?: object;
  currentThumbnail?: string;
}

export function TemplatesModal({ onClose, onApply, currentCanvasData, currentThumbnail }: TemplatesModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('Other');
  const [_error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { getTemplates } = await import('../../../services/templates');
      const data = await getTemplates({ scope: 'my' });
      setTemplates(data);
    } catch {
      setError('Ошибка загрузки шаблонов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleSave = async () => {
    if (!saveName.trim() || !currentCanvasData) return;
    setSaving(true);
    try {
      await createTemplate({
        name: saveName.trim(),
        canvasData: currentCanvasData,
        thumbnailUrl: currentThumbnail,
        category: saveCategory,
        isPublic: false,
      });
      setShowSaveForm(false);
      setSaveName('');
      load(); // Перезагружаем список
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

  const handleApply = (t: Template) => {
    if (t.canvasData) {
      onApply(t.canvasData);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 760, maxHeight: '88vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Мои шаблоны</h2>
          <div className="flex items-center gap-2">
            {currentCanvasData && (
              <button onClick={() => setShowSaveForm(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                </svg>
                Сохранить как шаблон
              </button>
            )}
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Save form */}
        {showSaveForm && (
          <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex-shrink-0">
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex-1 min-w-40">
                <label className="text-xs text-gray-500 mb-1 block">Название</label>
                <input value={saveName} onChange={e => setSaveName(e.target.value)}
                  placeholder="Мой шаблон"
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Категория</label>
                <select value={saveCategory} onChange={e => setSaveCategory(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option>Basic</option>
                  <option>Frames</option>
                  <option>Other</option>
                </select>
              </div>
              <button onClick={handleSave} disabled={saving || !saveName.trim()}
                className="px-4 py-1.5 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
            </div>
          )}
          {!loading && templates.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
              </svg>
              <p className="text-sm">Сохранённых шаблонов пока нет</p>
            </div>
          )}
          {!loading && templates.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {templates.map(t => (
                <div key={t.id} className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleApply(t)}>
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {t.thumbnailUrl ? (
                      <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover"/>
                    ) : (
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01"/>
                      </svg>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-gray-800 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.category}</p>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); handleApply(t); }}
                      className="px-2.5 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm">
                      Использовать
                    </button>
                    {t.userId && (
                      <button onClick={e => handleDelete(t.id, e)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm">
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
