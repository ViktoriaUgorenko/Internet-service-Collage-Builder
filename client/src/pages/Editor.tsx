import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, getProjectById, updateProject } from '../services/projects';
import { CanvasArea } from '../components/editor/CanvasArea';
import { ContextPanel } from '../components/editor/ContextPanel';
import { ImageUploadModal } from '../components/editor/modals/ImageUploadModal';
import { ImageSearchModal } from '../components/editor/modals/ImageSearchModal';
import { PreviewModal } from '../components/editor/modals/PreviewModal';
import { HistoryControls } from '../components/editor/panels/HistoryControls';
import { ToastContainer, showToast } from '../components/Toast';
import { useCanvas } from '../hooks/useCanvas';
import { useHotkeys } from '../hooks/useHotkeys';

// Кнопка инструмента с всплывающей подсказкой
function ToolIcon({
  onClick, title, active = false, danger = false, disabled = false, children,
}: {
  onClick: () => void; title: string; active?: boolean; danger?: boolean;
  disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="relative group w-10 h-10 flex items-center justify-center rounded-xl transition-all"
      style={{
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent)' : danger ? 'var(--danger)' : 'var(--text-3)',
        border: active ? '1px solid var(--accent-light)' : '1px solid transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => {
        if (disabled) return;
        e.currentTarget.style.background = active ? 'var(--accent-bg)' : danger ? 'var(--danger-bg)' : 'var(--bg-3)';
        e.currentTarget.style.color = active ? 'var(--accent)' : danger ? 'var(--danger)' : 'var(--text)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = active ? 'var(--accent-bg)' : 'transparent';
        e.currentTarget.style.color = active ? 'var(--accent)' : danger ? 'var(--danger)' : 'var(--text-3)';
      }}>
      {children}
      {/* Tooltip */}
      <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
        style={{ background: 'var(--text)', color: 'var(--white)' }}>
        {title}
      </span>
    </button>
  );
}

const Sep = () => <div className="w-6 mx-auto my-1" style={{ height: 1, background: 'var(--border)' }}/>;

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const canvasApiRef = useRef<ReturnType<typeof useCanvas> | null>(null);
  const [canvasApi, setCanvasApi] = useState<ReturnType<typeof useCanvas> | null>(null);
  const pendingDataRef = useRef<object | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => { if (id) loadProject(id); }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      const data = await getProjectById(projectId);
      setProject(data);
      setLastSaved(new Date(data.updatedAt));
    } catch (err: any) {
      setError(err.response?.status === 404 || err.response?.status === 403
        ? 'Проект не найден или нет доступа' : 'Ошибка загрузки');
    } finally { setLoading(false); }
  };

  const saveData = useCallback(async (data: object) => {
    if (!id) return;
    try {
      setIsSaving(true);
      const payload: any = { canvasData: data };
      // Всегда создаем превью при сохранении
      const thumbnail = canvasApiRef.current?.exportPNG();
      if (thumbnail) payload.thumbnailUrl = thumbnail;
      
      await updateProject(id, payload);
      setLastSaved(new Date());
      showToast('Сохранено', 'success');
    } catch (err: any) {
      showToast(`Ошибка: ${err?.response?.data?.message || err?.message}`, 'error');
    } finally { setIsSaving(false); }
  }, [id]);

  const handleCanvasModified = useCallback((json: object) => {
    console.log('[Editor] Canvas modified, json keys:', Object.keys(json));
    pendingDataRef.current = json;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (pendingDataRef.current) {
        console.log('[Editor] Auto-saving...');
        saveData(pendingDataRef.current);
      }
    }, 30000);
  }, [saveData]);

  const canvasData = project?.canvasData as any;
  const canvasWidth = canvasData?.width || 1080;
  const canvasHeight = canvasData?.height || 1080;

  const handleManualSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const data = pendingDataRef.current ?? canvasApiRef.current?.fabricRef.current?.toJSON(['id']);
    if (data) saveData({ ...data, width: canvasWidth, height: canvasHeight });
  }, [saveData, canvasWidth, canvasHeight]);



  const handleCanvasReady = useCallback((api: ReturnType<typeof useCanvas>) => {
    canvasApiRef.current = api; setCanvasApi(api);
  }, []);

  const handleCanvasStateChange = useCallback((api: ReturnType<typeof useCanvas>) => {
    canvasApiRef.current = api; setCanvasApi({ ...api });
  }, []);

  useHotkeys({
    onUndo: () => canvasApiRef.current?.undo(),
    onRedo: () => canvasApiRef.current?.redo(),
    onDelete: () => canvasApiRef.current?.deleteSelected(),
    onSave: handleManualSave,
  });

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse"
          style={{ background: 'var(--accent)' }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01"/>
          </svg>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>Загрузка проекта...</p>
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="flex flex-col h-screen items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="rounded-2xl border p-10 text-center max-w-sm"
        style={{ background: 'var(--white)', borderColor: 'var(--border)' }}>
        <p className="text-3xl mb-4" aria-hidden>⚠️</p>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Не удалось открыть редактор</p>
        <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>{error || 'Неизвестная ошибка'}</p>
        <button onClick={() => navigate('/dashboard')}
          className="px-5 py-2 text-sm font-medium rounded-xl text-white transition-all"
          style={{ background: 'var(--accent)' }}>
          К списку проектов
        </button>
      </div>
    </div>
  );

  const gridEnabled = canvasApi?.gridEnabled ?? false;
  const snapEnabled = canvasApi?.snapEnabled ?? false;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-2)' }}>

      {/* Шапка: название, история, сохранение */}
      <header className="flex items-center justify-between px-4 py-2 flex-shrink-0 z-10 shadow-sm"
        style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', height: 48 }}>

        {/* Назад и заголовок */}
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate('/dashboard')} title="К проектам"
            className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)', maxWidth: 200 }}>{project.title}</p>
            <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--text-3)' }}>
              {isSaving
                ? <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: 'var(--accent-light)' }}/>
                    Сохранение...
                  </span>
                : lastSaved ? `Сохранено ${lastSaved.toLocaleTimeString()}` : 'Не сохранено'}
            </p>
          </div>
        </div>

        {/* История и размер холста */}
        <div className="flex items-center gap-2">
          {canvasApi && (
            <HistoryControls
              canUndo={canvasApi.canUndo} canRedo={canvasApi.canRedo}
              onUndo={() => canvasApi.undo()} onRedo={() => canvasApi.redo()}
            />
          )}
          <span className="text-xs px-2 py-1 rounded-lg hidden sm:block"
            style={{ color: 'var(--text-3)', background: 'var(--bg-2)' }}>
            {canvasWidth} × {canvasHeight}
          </span>
        </div>

        {/* Сохранение */}
        <div className="flex items-center gap-2">
          <button onClick={handleManualSave} disabled={isSaving} title="Сохранить (Ctrl+S)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: isSaving ? 'var(--accent-light)' : 'var(--accent)', color: 'white', cursor: isSaving ? 'not-allowed' : 'pointer' }}
            onMouseEnter={e => { if (!isSaving) e.currentTarget.style.background = 'var(--accent-dark)'; }}
            onMouseLeave={e => { if (!isSaving) e.currentTarget.style.background = 'var(--accent)'; }}>
            {isSaving
              ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                </svg>
            }
            <span className="hidden sm:inline">{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </header>

      {/* Редактор: боковая панель + холст + контекст */}
      <div className="flex flex-1 overflow-hidden">

        {/* Вертикальная панель инструментов:
            Группа 1 — текст и изображения
            Группа 2 — сетка и привязка
            Группа 3 — удаление
        */}
        <div className="flex flex-col items-center py-3 flex-shrink-0"
          style={{ width: 52, background: 'var(--white)', borderRight: '1px solid var(--border)', gap: 2 }}>

          {/* Текст и фото */}
          <ToolIcon onClick={() => canvasApiRef.current?.addText()} title="Текст (T)">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </ToolIcon>

          <ToolIcon onClick={() => setShowImageSearch(true)} title="Добавить фото (Unsplash / загрузка)">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z"/>
            </svg>
          </ToolIcon>

          <Sep/>

          {/* Сетка и привязка */}
          <ToolIcon onClick={() => canvasApiRef.current?.toggleGrid()} title="Сетка" active={gridEnabled}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
            </svg>
          </ToolIcon>

          <ToolIcon onClick={() => canvasApiRef.current?.toggleSnap()} title="Привязка к сетке" active={snapEnabled}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4M2 12h4m12 0h4m-4.93-7.07l-2.83 2.83M9.76 14.24l-2.83 2.83m0-11.31l2.83 2.83m4.48 4.48l2.83 2.83"/>
            </svg>
          </ToolIcon>

          <div className="flex-1"/>
          <Sep/>
          <ToolIcon onClick={() => canvasApiRef.current?.deleteSelected()} title="Удалить выделенное (Del)" danger>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </ToolIcon>
        </div>

        {/* Область холста */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CanvasArea
            key={id}
            width={canvasWidth} height={canvasHeight}
            initialData={project.canvasData ?? null}
            onModified={handleCanvasModified}
            onCanvasReady={handleCanvasReady}
            onStateChange={handleCanvasStateChange}
          />
        </div>

        {/* Правая панель: слои, свойства, экспорт */}
        {canvasApi && (
          <ContextPanel
            canvasApi={canvasApi}
            canvasApiRef={canvasApiRef}
            onAddImage={() => setShowImageSearch(true)}
            projectTitle={project.title}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        )}
      </div>

      {/* Модальные окна */}
      {showImageModal && (
        <ImageUploadModal onClose={() => setShowImageModal(false)}
          onUpload={url => canvasApiRef.current?.addImage(url)}/>
      )}
      {showImageSearch && (
        <ImageSearchModal onClose={() => setShowImageSearch(false)}
          onSelect={url => canvasApiRef.current?.addImage(url)}/>
      )}
      {showPreview && (
        <PreviewModal dataUrl={canvasApiRef.current?.exportPNG() ?? ''}
          onClose={() => setShowPreview(false)}/>
      )}

      <ToastContainer/>
    </div>
  );
}

