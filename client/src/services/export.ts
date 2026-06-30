export type ExportFormat = 'png' | 'jpeg';

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0..1, только для jpeg
  multiplier: number; // 1 = исходное разрешение
}

/** Генерирует dataURL из Fabric canvas */
export function canvasToDataUrl(
  fabricCanvas: any,
  opts: ExportOptions
): string {
  // Скрываем сетку перед экспортом
  const gridLines: any[] = fabricCanvas.getObjects().filter((o: any) => o.excludeFromExport);
  gridLines.forEach((l: any) => l.set('visible', false));
  fabricCanvas.renderAll();

  const dataUrl = fabricCanvas.toDataURL({
    format: opts.format,
    quality: opts.quality,
    multiplier: opts.multiplier,
  });

  gridLines.forEach((l: any) => l.set('visible', true));
  fabricCanvas.renderAll();

  return dataUrl;
}

/** Скачивает dataURL как файл */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/** Безопасное имя файла (убираем спецсимволы, транслитерируем кириллицу) */
export function safeFilename(title: string, format: ExportFormat): string {
  const date = new Date().toISOString().slice(0, 10);
  const safe = title
    .replace(/[а-яё]/gi, (c) => TRANSLIT[c.toLowerCase()] ?? c)
    .replace(/[^a-z0-9_\-]/gi, '_')
    .replace(/_+/g, '_')
    .slice(0, 40)
    .replace(/^_|_$/g, '') || 'collage';
  return `${safe}_${date}.${format}`;
}

/** Размер dataURL в байтах (приблизительно) */
export function estimateSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.round((base64.length * 3) / 4);
}

/** Форматирует байты в читаемый вид */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const TRANSLIT: Record<string, string> = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',
  й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',
  у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',
  э:'e',ю:'yu',я:'ya',
};
