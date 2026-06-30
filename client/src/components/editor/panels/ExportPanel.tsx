import { useState, useCallback, useRef } from 'react';

type Format = 'png' | 'jpeg';

interface ExportPanelProps {
  getFabricCanvas: () => any;
  projectTitle: string;
  width: number;
  height: number;
}

const TRANSLIT: Record<string, string> = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',
  й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',
  у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',
  э:'e',ю:'yu',я:'ya',
};

function safeFilename(title: string, fmt: Format) {
  const date = new Date().toISOString().slice(0, 10);
  const safe = title
    .replace(/[а-яё]/gi, c => TRANSLIT[c.toLowerCase()] ?? c)
    .replace(/[^a-z0-9_\-]/gi, '_')
    .replace(/_+/g, '_')
    .slice(0, 40)
    .replace(/^_|_$/g, '') || 'collage';
  return `${safe}_${date}.${fmt}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function ExportPanel({ getFabricCanvas, projectTitle, width, height }: ExportPanelProps) {
  const [format, setFormat] = useState<Format>('png');
  const [quality, setQuality] = useState(0.92);
  const [multiplier, setMultiplier] = useState(1);
  const [preview, setPreview] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const debRef = useRef<number | null>(null);

  const generate = useCallback((fmt: Format, q: number, m: number) => {
    const canvas = getFabricCanvas();
    if (!canvas) { setError('Холст не готов. Попробуйте ещё раз.'); return; }
    setError('');
    setGenerating(true);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = window.setTimeout(() => {
      try {
        const gridLines = canvas.getObjects().filter((o: any) => o.excludeFromExport);
        gridLines.forEach((l: any) => l.set('visible', false));
        canvas.renderAll();
        const url: string = canvas.toDataURL({ format: fmt, quality: q, multiplier: m });
        gridLines.forEach((l: any) => l.set('visible', true));
        canvas.renderAll();
        setPreview(url);
        const b64 = url.split(',')[1] ?? '';
        setFileSize(Math.round(b64.length * 3 / 4));
      } catch (e: any) {
        setError('Ошибка генерации: ' + (e?.message ?? ''));
      } finally {
        setGenerating(false);
      }
    }, 100);
  }, [getFabricCanvas]);

  const handleGenerate = () => generate(format, quality, multiplier);

  const handleFormatChange = (f: Format) => {
    setFormat(f);
    if (preview) generate(f, quality, multiplier);
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (preview) generate(format, q, multiplier);
  };

  const handleMultiplierChange = (m: number) => {
    setMultiplier(m);
    if (preview) generate(format, quality, m);
  };

  const handleDownload = () => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = safeFilename(projectTitle, format);
    a.click();
  };

  const exportW = Math.round(width * multiplier);
  const exportH = Math.round(height * multiplier);

  return (
    <div className="p-3 space-y-4">

      {/* Превью */}
      <div
        className="relative rounded-xl overflow-hidden flex items-center justify-center"
        style={{ minHeight: 120, background: 'var(--bg-2)', border: '1px solid var(--border-light)' }}>
        {generating && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: 'rgba(232,224,214,0.85)' }}>
            <div
              className="w-6 h-6 rounded-full animate-spin"
              style={{ border: '2px solid var(--border)', borderTopColor: 'var(--accent)' }}/>
          </div>
        )}
        {preview && !generating && (
          <img src={preview} alt="preview" className="w-full h-auto max-h-48 object-contain"/>
        )}
        {!preview && !generating && (
          <div className="flex flex-col items-center gap-2 py-6">
            <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: 'var(--text-3)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 8h.01"/>
            </svg>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Нажмите «Создать превью»</p>
          </div>
        )}
      </div>

      {error && (
        <p
          className="text-xs rounded-lg px-3 py-2"
          style={{ color: 'var(--danger)', background: 'var(--danger-bg)' }}>
          {error}
        </p>
      )}

      {/* Кнопка просмотра превью */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full py-2 text-xs font-medium rounded-xl border transition-all disabled:opacity-50"
        style={{ borderColor: 'var(--accent-light)', color: 'var(--accent-dark)', background: 'var(--accent-bg)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-bg)')}>
        {generating ? 'Генерация...' : preview ? '↺ Обновить превью' : '👁 Просмотр превью'}
      </button>

      {/* Формат */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-2"
          style={{ color: 'var(--text-3)' }}>
          Формат
        </p>
        <div className="flex gap-2">
          {(['png', 'jpeg'] as Format[]).map(f => {
            const active = format === f;
            return (
              <button
                key={f}
                onClick={() => handleFormatChange(f)}
                className="flex-1 py-1.5 text-xs font-medium rounded-xl border-2 transition-all"
                style={{
                  borderColor: active ? 'var(--accent)' : 'var(--border)',
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  color: active ? 'var(--accent-dark)' : 'var(--text-3)',
                }}>
                {f.toUpperCase()}
              </button>
            );
          })}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
          {format === 'png' ? 'Без потерь, поддерживает прозрачность' : 'Меньший размер файла'}
        </p>
      </div>

      {/* Качество — только JPEG */}
      {format === 'jpeg' && (
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>
              Качество
            </p>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              {Math.round(quality * 100)}%
            </span>
          </div>
          <input
            type="range" min={0.5} max={1} step={0.05} value={quality}
            onChange={e => handleQualityChange(parseFloat(e.target.value))}
            className="w-full h-1.5"
            style={{ accentColor: 'var(--accent)' }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-3)' }}>
            <span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>
      )}

      {/* Масштаб */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-2"
          style={{ color: 'var(--text-3)' }}>
          Масштаб
        </p>
        <div className="flex gap-1.5">
          {[1, 1.5, 2].map(m => {
            const active = multiplier === m;
            return (
              <button
                key={m}
                onClick={() => handleMultiplierChange(m)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all"
                style={{
                  borderColor: active ? 'var(--accent)' : 'var(--border)',
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  color: active ? 'var(--accent-dark)' : 'var(--text-3)',
                }}>
                {m === 1 ? '1×' : m === 1.5 ? '1.5×' : '2×'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Инфо */}
      <div
        className="rounded-xl p-3 space-y-1.5 text-xs"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border-light)' }}>
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-3)' }}>Разрешение</span>
          <span className="font-medium" style={{ color: 'var(--text)' }}>{exportW} × {exportH} px</span>
        </div>
        {fileSize > 0 && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-3)' }}>Размер файла</span>
            <span className="font-medium" style={{ color: 'var(--text)' }}>~{formatBytes(fileSize)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span style={{ color: 'var(--text-3)' }}>Имя файла</span>
          <span
            className="font-medium truncate ml-2 text-right"
            style={{ color: 'var(--text)', maxWidth: 130 }}>
            {safeFilename(projectTitle, format)}
          </span>
        </div>
      </div>

      {/* Скачать */}
      <button
        onClick={handleDownload}
        disabled={!preview || generating}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-40"
        style={{ background: 'var(--accent)', color: 'white' }}
        onMouseEnter={e => { if (preview && !generating) e.currentTarget.style.background = 'var(--accent-dark)'; }}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Скачать {format.toUpperCase()}
      </button>
    </div>
  );
}
