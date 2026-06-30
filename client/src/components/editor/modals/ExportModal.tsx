import { useState, useEffect, useRef } from 'react';
import { ExportFormat, canvasToDataUrl, downloadDataUrl, safeFilename, estimateSize, formatBytes } from '../../../services/export';

interface ExportModalProps {
  fabricCanvas: any;
  projectTitle: string;
  width: number;
  height: number;
  onClose: () => void;
}

export function ExportModal({ fabricCanvas, projectTitle, width, height, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [multiplier, setMultiplier] = useState(1);
  const [dataUrl, setDataUrl] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [generating, setGenerating] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const generate = () => {
    if (!fabricCanvas) return;
    setGenerating(true);
    // Небольшая задержка чтобы UI успел обновиться
    setTimeout(() => {
      try {
        const url = canvasToDataUrl(fabricCanvas, { format, quality, multiplier });
        setDataUrl(url);
        setFileSize(estimateSize(url));
      } finally {
        setGenerating(false);
      }
    }, 50);
  };

  // Регенерируем превью при изменении настроек (с дебаунсом)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(generate, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [format, quality, multiplier]); // eslint-disable-line

  const handleDownload = () => {
    if (!dataUrl) return;
    downloadDataUrl(dataUrl, safeFilename(projectTitle, format));
    onClose();
  };

  const exportW = Math.round(width * multiplier);
  const exportH = Math.round(height * multiplier);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ width: 780, maxHeight: '90vh' }}>

        {/* Превью */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 relative min-w-0">
          {generating && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
            </div>
          )}
          {dataUrl && !generating && (
            <img src={dataUrl} alt="Preview"
              className="max-w-full max-h-full object-contain shadow-xl rounded-lg"
              style={{ maxHeight: 'calc(90vh - 32px)' }}/>
          )}
          {!dataUrl && !generating && (
            <div className="text-gray-400 text-sm">Генерация превью...</div>
          )}
        </div>

        {/* Настройки */}
        <div className="w-72 flex-shrink-0 flex flex-col border-l border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Экспорт</h2>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* Формат */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Формат</label>
              <div className="flex gap-2">
                {(['png', 'jpeg'] as ExportFormat[]).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl border-2 transition-all ${
                      format === f
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {format === 'png' ? 'Без потерь, поддерживает прозрачность' : 'Меньший размер файла'}
              </p>
            </div>

            {/* Качество — только для JPEG */}
            {format === 'jpeg' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Качество</label>
                  <span className="text-xs font-medium text-indigo-600">{Math.round(quality * 100)}%</span>
                </div>
                <input type="range" min={0.5} max={1} step={0.05} value={quality}
                  onChange={e => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-indigo-500"/>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>
            )}

            {/* Масштаб */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Масштаб</label>
              <div className="flex gap-1.5">
                {[1, 1.5, 2].map(m => (
                  <button key={m} onClick={() => setMultiplier(m)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      multiplier === m
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {m === 1 ? '1×' : m === 1.5 ? '1.5×' : '2×'}
                  </button>
                ))}
              </div>
            </div>

            {/* Информация */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Разрешение</span>
                <span className="font-medium text-gray-700">{exportW} × {exportH} px</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Размер файла</span>
                <span className="font-medium text-gray-700">
                  {fileSize > 0 ? `~${formatBytes(fileSize)}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Имя файла</span>
                <span className="font-medium text-gray-700 truncate ml-2 text-right" style={{ maxWidth: 140 }}>
                  {safeFilename(projectTitle, format)}
                </span>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="p-5 border-t border-gray-100 space-y-2">
            <button onClick={handleDownload} disabled={!dataUrl || generating}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Скачать {format.toUpperCase()}
            </button>
            <button onClick={onClose}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
