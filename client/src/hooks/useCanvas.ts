import { useEffect, useRef, useCallback, useState } from 'react';
import { fabric } from 'fabric';

const MAX_HISTORY = 50;
const GRID_SIZE = 50;

interface UseCanvasOptions {
  width: number;
  height: number;
  onModified: (json: object) => void;
}

export function useCanvas({ width, height, onModified }: UseCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const onModifiedRef = useRef(onModified);
  useEffect(() => { onModifiedRef.current = onModified; }, [onModified]);

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [isCropping, setIsCropping] = useState(false);
  const isRestoringRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const gridLinesRef = useRef<fabric.Line[]>([]);
  const [layerVersion, setLayerVersion] = useState(0);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [selectedObjectVersion, setSelectedObjectVersion] = useState(0);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const saveHistoryState = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || isRestoringRef.current) return;
    const json = JSON.stringify(canvas.toJSON(['id']));
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    updateHistoryState();
  }, [updateHistoryState]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width, height, backgroundColor: '#ffffff', preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    // Увеличиваем ручки выделения объектов
    fabric.Object.prototype.set({
      cornerSize: 14,
      cornerStyle: 'circle',
      cornerColor: '#3b82f6',
      cornerStrokeColor: '#ffffff',
      transparentCorners: false,
      borderColor: '#3b82f6',
      borderScaleFactor: 2,
      padding: 6,
    });

    const handleModified = () => {
      if (isRestoringRef.current) return;
      saveHistoryState();
      const json = canvas.toJSON(['id']) as any;
      json.width = width;
      json.height = height;
      onModifiedRef.current(json);
      setLayerVersion(v => v + 1);
    };
    canvas.on('object:modified', handleModified);
    canvas.on('object:added', handleModified);
    canvas.on('object:removed', handleModified);
    canvas.on('selection:created', (e: any) => {
      setSelectedObject(e.selected?.[0] ?? null);
      setSelectedObjectVersion(v => v + 1);
    });
    canvas.on('selection:updated', (e: any) => {
      setSelectedObject(e.selected?.[0] ?? null);
      setSelectedObjectVersion(v => v + 1);
    });
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setSelectedObjectVersion(v => v + 1);
    });
    canvas.on('text:editing:entered', (e: any) => {
      setSelectedObject(e.target ?? null);
      setSelectedObjectVersion(v => v + 1);
    });
    canvas.on('text:editing:exited', (e: any) => {
      setSelectedObject(e.target ?? null);
      setSelectedObjectVersion(v => v + 1);
    });
    // Обработчик клика на холст для сброса выделения
    canvas.on('mouse:down', (e: any) => {
      if (!e.target) {
        // Клик на пустое место - сбрасываем выделение
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    });
    canvas.on('object:moving', (e: any) => {
      if (!snapEnabled || !e.target) return;
      e.target.set({
        left: Math.round((e.target.left || 0) / GRID_SIZE) * GRID_SIZE,
        top: Math.round((e.target.top || 0) / GRID_SIZE) * GRID_SIZE,
      });
    });
    return () => { canvas.dispose(); fabricRef.current = null; };
  }, [width, height]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.off('object:moving');
    canvas.on('object:moving', (e: any) => {
      if (!snapEnabled || !e.target) return;
      e.target.set({
        left: Math.round((e.target.left || 0) / GRID_SIZE) * GRID_SIZE,
        top: Math.round((e.target.top || 0) / GRID_SIZE) * GRID_SIZE,
      });
    });
  }, [snapEnabled]);

  const drawGrid = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    gridLinesRef.current.forEach(l => canvas.remove(l));
    gridLinesRef.current = [];
    const lines: fabric.Line[] = [];
    for (let x = 0; x <= width; x += GRID_SIZE) {
      const line = new fabric.Line([x, 0, x, height], { stroke: '#c0c0c0', strokeWidth: 0.5, selectable: false, evented: false, excludeFromExport: true } as any);
      lines.push(line); canvas.add(line); canvas.sendToBack(line);
    }
    for (let y = 0; y <= height; y += GRID_SIZE) {
      const line = new fabric.Line([0, y, width, y], { stroke: '#c0c0c0', strokeWidth: 0.5, selectable: false, evented: false, excludeFromExport: true } as any);
      lines.push(line); canvas.add(line); canvas.sendToBack(line);
    }
    gridLinesRef.current = lines;
    canvas.renderAll();
  }, [width, height]);

  const removeGrid = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    gridLinesRef.current.forEach(l => canvas.remove(l));
    gridLinesRef.current = [];
    canvas.renderAll();
  }, []);

  const toggleGrid = useCallback(() => {
    setGridEnabled(prev => { const next = !prev; if (next) drawGrid(); else removeGrid(); return next; });
  }, [drawGrid, removeGrid]);

  const toggleSnap = useCallback(() => { setSnapEnabled(prev => !prev); }, []);

  const loadFromJSON = useCallback((json: object, preserveHistory = false) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    // Проверяем что canvas не задиспоузен (lowerCanvasEl существует)
    if (!(canvas as any).lowerCanvasEl) return;
    console.log('[loadFromJSON] objects:', (json as any)?.objects?.length, 'keys:', Object.keys(json));
    isRestoringRef.current = true;
    
    // Создаем копию JSON для обработки изображений
    const processedJson = JSON.parse(JSON.stringify(json));
    
    // Функция для предварительной загрузки изображений
    const preloadImages = async (objects: any[]): Promise<void> => {
      const imagePromises: Promise<void>[] = [];
      
      for (const obj of objects) {
        if (obj.type === 'image' && obj.src) {
          // Если это data URL, Fabric.js должен обработать его нормально
          // Но если это относительный путь, нужно убедиться, что он корректный
          if (obj.src.startsWith('data:')) {
            // Data URL - оставляем как есть
            continue;
          } else if (obj.src.startsWith('http') || obj.src.startsWith('//')) {
            // Абсолютный URL - оставляем как есть
            continue;
          } else {
            // Относительный путь - пытаемся исправить
            // Если путь начинается с /, оставляем как есть
            if (!obj.src.startsWith('/')) {
              // Добавляем / в начало, если его нет
              obj.src = '/' + obj.src;
            }
          }
        }
        
        // Рекурсивно обрабатываем группы
        if (obj.objects && Array.isArray(obj.objects)) {
          imagePromises.push(preloadImages(obj.objects));
        }
      }
      
      await Promise.all(imagePromises);
    };
    
    // Предварительно загружаем изображения
    preloadImages(processedJson.objects || []).then(() => {
      canvas.loadFromJSON(processedJson, () => {
        // Проверяем снова — canvas мог задиспоузиться пока шла async загрузка
        if (!fabricRef.current || !(fabricRef.current as any).lowerCanvasEl) return;
        canvas.renderAll();
        isRestoringRef.current = false;
        const currentJson = canvas.toJSON(['id']) as any;
        const str = JSON.stringify(currentJson);
        
        if (preserveHistory) {
          historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
          historyRef.current.push(str);
          if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
          historyIndexRef.current = historyRef.current.length - 1;
        } else {
          historyRef.current = [str];
          historyIndexRef.current = 0;
        }
        
        updateHistoryState();
        setLayerVersion(v => v + 1);
        // Уведомляем Editor об изменении холста, чтобы pendingDataRef обновился
        // и ручное/автосохранение сохранило актуальные данные
        console.log('[loadFromJSON] Calling onModified with canvas data');
        onModifiedRef.current(currentJson);
      });
    }).catch(error => {
      console.error('Error preloading images:', error);
      isRestoringRef.current = false;
    });
  }, [updateHistoryState]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = fabricRef.current;
    if (!canvas) return;
    isRestoringRef.current = true;
    canvas.loadFromJSON(JSON.parse(historyRef.current[historyIndexRef.current]), () => {
      canvas.renderAll(); isRestoringRef.current = false;
      updateHistoryState(); onModifiedRef.current(canvas.toJSON(['id'])); setLayerVersion(v => v + 1);
    });
  }, [updateHistoryState]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = fabricRef.current;
    if (!canvas) return;
    isRestoringRef.current = true;
    canvas.loadFromJSON(JSON.parse(historyRef.current[historyIndexRef.current]), () => {
      canvas.renderAll(); isRestoringRef.current = false;
      updateHistoryState(); onModifiedRef.current(canvas.toJSON(['id'])); setLayerVersion(v => v + 1);
    });
  }, [updateHistoryState]);

  const addText = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText('Enter text', {
      left: canvas.getWidth() / 2, top: canvas.getHeight() / 2,
      originX: 'center', originY: 'center', fontSize: 32, fill: '#333333', fontFamily: 'Arial',
    });
    canvas.add(text); canvas.setActiveObject(text); canvas.renderAll();
  }, []);

  // Универсальное добавление фигуры с параметрами
  const addShape = useCallback((type: string, fill: string, stroke: string, strokeWidth: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const cx = canvas.getWidth() / 2;
    const cy = canvas.getHeight() / 2;
    const base = { left: cx, top: cy, originX: 'center', originY: 'center', fill: fill === 'transparent' ? '' : fill, stroke, strokeWidth };
    let obj: fabric.Object;
    switch (type) {
      case 'circle':
        obj = new fabric.Circle({ ...base, radius: 70 }); break;
      case 'triangle':
        obj = new fabric.Triangle({ ...base, width: 140, height: 120 }); break;
      case 'ellipse':
        obj = new fabric.Ellipse({ ...base, rx: 90, ry: 55 }); break;
      case 'line':
        obj = new fabric.Line([cx - 80, cy, cx + 80, cy], { stroke, strokeWidth, selectable: true }); break;
      case 'star': {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 70 : 30;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
        }
        obj = new fabric.Polygon(pts, { ...base }); break;
      }
      default: // rect
        obj = new fabric.Rect({ ...base, width: 150, height: 100, rx: 4, ry: 4 }); break;
    }
    canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll();
  }, []);

  const addRect = useCallback(() => addShape('rect', '#4f86f7', '#2563eb', 1), [addShape]);
  const addCircle = useCallback(() => addShape('circle', '#f97316', '#ea580c', 1), [addShape]);
  const addTriangle = useCallback(() => addShape('triangle', '#22c55e', '#16a34a', 1), [addShape]);

  const addLine = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const cx = canvas.getWidth() / 2;
    const cy = canvas.getHeight() / 2;
    const line = new fabric.Line([cx - 80, cy, cx + 80, cy], {
      stroke: '#6366f1', strokeWidth: 3, selectable: true,
    });
    canvas.add(line); canvas.setActiveObject(line); canvas.renderAll();
  }, []);

  const addImage = useCallback((dataUrl: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(dataUrl, (img: fabric.Image) => {
      const maxW = canvas.getWidth() * 0.6;
      const maxH = canvas.getHeight() * 0.6;
      const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);
      img.set({ left: canvas.getWidth() / 2, top: canvas.getHeight() / 2, originX: 'center', originY: 'center', scaleX: scale, scaleY: scale });
      // Сохраняем оригинальный src и scale для повторной обрезки
      (img as any)._originalSrc = dataUrl;
      (img as any)._originalScale = scale;
      canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
    });
  }, []);

  const addSticker = useCallback((svgString: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.loadSVGFromString(svgString, (objects: any[], options: any) => {
      const group = fabric.util.groupSVGElements(objects, options);
      const maxSize = Math.min(canvas.getWidth(), canvas.getHeight()) * 0.2;
      const scale = maxSize / Math.max((group as any).width || 1, (group as any).height || 1);
      group.set({ left: canvas.getWidth() / 2, top: canvas.getHeight() / 2, originX: 'center', originY: 'center', scaleX: scale, scaleY: scale });
      canvas.add(group); canvas.setActiveObject(group); canvas.renderAll();
    });
  }, []);

  const addFrame = useCallback((svgString: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const w = canvas.getWidth();
    const h = canvas.getHeight();
    fabric.loadSVGFromString(svgString, (objects: any[], options: any) => {
      const group = fabric.util.groupSVGElements(objects, options) as fabric.Group;
      group.set({
        left: 0, top: 0,
        originX: 'left', originY: 'top',
        scaleX: w / ((group as any).width || 100),
        scaleY: h / ((group as any).height || 100),
        // Рамка не перехватывает клики — выбирается только через панель слоёв
        selectable: false,
        evented: false,
        data: { isFrame: true },
      } as any);
      canvas.add(group);
      canvas.bringToFront(group);
      canvas.renderAll();
      saveHistoryState();
      onModifiedRef.current(canvas.toJSON(['id']));
    });
  }, [saveHistoryState]);

  const setBackground = useCallback((color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setBackgroundColor(color, () => {
      canvas.renderAll();
      saveHistoryState();
      onModifiedRef.current(canvas.toJSON(['id']));
    });
  }, [saveHistoryState]);

  const setBackgroundGradient = useCallback((colors: [string, string], angle: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const rad = (angle * Math.PI) / 180;
    const w = canvas.getWidth();
    const h = canvas.getHeight();
    const x1 = w / 2 - Math.cos(rad) * w / 2;
    const y1 = h / 2 - Math.sin(rad) * h / 2;
    const x2 = w / 2 + Math.cos(rad) * w / 2;
    const y2 = h / 2 + Math.sin(rad) * h / 2;
    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: { x1, y1, x2, y2 },
      colorStops: [{ offset: 0, color: colors[0] }, { offset: 1, color: colors[1] }],
    });
    canvas.setBackgroundColor(gradient as any, () => {
      canvas.renderAll();
      saveHistoryState();
      onModifiedRef.current(canvas.toJSON(['id']));
    });
  }, [saveHistoryState]);

  const setBackgroundImage = useCallback((dataUrl: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(dataUrl, (img: fabric.Image) => {
      img.set({
        left: 0, top: 0,
        originX: 'left', originY: 'top',
        scaleX: canvas.getWidth() / (img.width || 1),
        scaleY: canvas.getHeight() / (img.height || 1),
        selectable: false,
        evented: false,
      });
      canvas.setBackgroundImage(img, () => {
        canvas.renderAll();
        saveHistoryState();
        onModifiedRef.current(canvas.toJSON(['id']));
      });
    });
  }, [saveHistoryState]);

  const clearBackground = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setBackgroundImage(null as any, () => {
      canvas.setBackgroundColor('#ffffff', () => {
        canvas.renderAll();
        saveHistoryState();
        onModifiedRef.current(canvas.toJSON(['id']));
      });
    });
  }, [saveHistoryState]);

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (!active.length) return;
    active.forEach((obj: fabric.Object) => canvas.remove(obj));
    canvas.discardActiveObject(); canvas.renderAll();
  }, []);

  const applyFilter = useCallback((filterName: string, options?: Record<string, number>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject() as fabric.Image;
    if (!obj || obj.type !== 'image') return;
    obj.filters = [];
    if (filterName !== 'none') {
      const F = (fabric.Image.filters as any);
      switch (filterName) {
        case 'grayscale': obj.filters.push(new F.Grayscale()); break;
        case 'sepia': obj.filters.push(new F.Sepia()); break;
        case 'blur': obj.filters.push(new F.Blur({ blur: options?.value ?? 0.3 })); break;
        case 'brightness': obj.filters.push(new F.Brightness({ brightness: options?.value ?? 0.1 })); break;
        case 'contrast': obj.filters.push(new F.Contrast({ contrast: options?.value ?? 0.2 })); break;
        case 'invert': obj.filters.push(new F.Invert()); break;
      }
    }
    obj.applyFilters(); canvas.renderAll(); saveHistoryState(); onModifiedRef.current(canvas.toJSON(['id']));
  }, [saveHistoryState]);

  const getObjects = useCallback(() => {
    return fabricRef.current?.getObjects().filter((o: any) => !o.excludeFromExport) || [];
  }, [layerVersion]); // eslint-disable-line

  const selectObject = useCallback((obj: fabric.Object) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setActiveObject(obj); canvas.renderAll();
  }, []);

  const bringForward = useCallback((obj: fabric.Object) => {
    fabricRef.current?.bringForward(obj); fabricRef.current?.renderAll(); setLayerVersion(v => v + 1);
  }, []);

  const sendBackward = useCallback((obj: fabric.Object) => {
    fabricRef.current?.sendBackwards(obj); fabricRef.current?.renderAll(); setLayerVersion(v => v + 1);
  }, []);

  const bringToFront = useCallback((obj: fabric.Object) => {
    fabricRef.current?.bringToFront(obj); fabricRef.current?.renderAll(); setLayerVersion(v => v + 1);
  }, []);

  const sendToBack = useCallback((obj: fabric.Object) => {
    fabricRef.current?.sendToBack(obj); fabricRef.current?.renderAll(); setLayerVersion(v => v + 1);
  }, []);

  const toggleVisibility = useCallback((obj: fabric.Object) => {
    obj.set('visible', !obj.visible); fabricRef.current?.renderAll(); setLayerVersion(v => v + 1);
  }, []);

  const toggleLock = useCallback((obj: fabric.Object) => {
    const locked = !(obj as any).selectable;
    obj.set({ selectable: locked, evented: locked } as any);
    fabricRef.current?.discardActiveObject();
    fabricRef.current?.renderAll();
    setLayerVersion(v => v + 1);
  }, []);

  const removeObject = useCallback((obj: fabric.Object) => {
    fabricRef.current?.remove(obj); fabricRef.current?.renderAll();
  }, []);

  const updateSelected = useCallback((props: Record<string, any>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    
    // Для рамок не применяем изменения свойств
    if (obj.type === 'group' && (obj as any).data?.isFrame === true) {
      // Рамки нельзя изменять, только растягивать и удалять
      // Не применяем изменения свойств
      return;
    }
    
    // Стандартная обработка для других объектов
    obj.set(props);
    obj.setCoords();
    canvas.renderAll();
    // Обновляем объект и увеличиваем версию для триггера перерисовки
    setSelectedObject(obj);
    setSelectedObjectVersion(v => v + 1);
    saveHistoryState();
    onModifiedRef.current(canvas.toJSON(['id']));
  }, [saveHistoryState]);

  const exportPNG = useCallback((): string => {
    const canvas = fabricRef.current;
    if (!canvas) return '';
    gridLinesRef.current.forEach(l => l.set('visible', false));
    canvas.renderAll();
    const url = canvas.toDataURL({ format: 'png', multiplier: 1 });
    gridLinesRef.current.forEach(l => l.set('visible', true));
    canvas.renderAll();
    return url;
  }, []);

  // Быстрый синхронный preview через clipPath (без замены объекта, без истории)
  const previewClipShape = useCallback((shape: string, scale: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    if (shape === 'none') {
      obj.set('clipPath', undefined);
      canvas.renderAll();
      return;
    }

    const fullW = obj.width ?? 100;
    const fullH = obj.height ?? 100;
    const w = fullW * scale;
    const h = fullH * scale;
    const hw = w / 2, hh = h / 2;

    let clip: fabric.Object | null = null;
    if (shape === 'rect') {
      clip = new fabric.Rect({ left: -hw, top: -hh, width: w, height: h, originX: 'left', originY: 'top' });
    } else if (shape === 'circle') {
      const r = Math.min(hw, hh);
      clip = new fabric.Circle({ radius: r, left: -r, top: -r, originX: 'left', originY: 'top' });
    } else if (shape === 'ellipse') {
      clip = new fabric.Ellipse({ rx: hw, ry: hh, left: -hw, top: -hh, originX: 'left', originY: 'top' });
    } else if (shape === 'triangle') {
      clip = new fabric.Triangle({ width: w, height: h, left: -hw, top: -hh, originX: 'left', originY: 'top' });
    } else if (shape === 'star') {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? Math.min(hw, hh) : Math.min(hw, hh) * 0.45;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
      }
      clip = new fabric.Polygon(pts, { originX: 'center', originY: 'center', left: 0, top: 0 });
    } else if (shape === 'heart') {
      const s = Math.min(hw, hh);
      clip = new fabric.Path(
        `M 0 ${s * 0.3} C 0 ${-s * 0.1} ${-s} ${-s * 0.1} ${-s} ${s * 0.3} C ${-s} ${s * 0.8} 0 ${s * 1.1} 0 ${s * 1.3} C 0 ${s * 1.1} ${s} ${s * 0.8} ${s} ${s * 0.3} C ${s} ${-s * 0.1} 0 ${-s * 0.1} 0 ${s * 0.3} Z`,
        { originX: 'center', originY: 'center', left: 0, top: 0 }
      );
    } else if (shape === 'diamond') {
      clip = new fabric.Polygon(
        [{ x: 0, y: -hh }, { x: hw, y: 0 }, { x: 0, y: hh }, { x: -hw, y: 0 }],
        { originX: 'center', originY: 'center', left: 0, top: 0 }
      );
    }
    if (!clip) return;
    (clip as any).absolutePositioned = false;
    obj.set('clipPath', clip);
    canvas.renderAll();
  }, []);

  // Обрезка объекта по форме — всегда от оригинального изображения
  const applyClipShape = useCallback((shape: string, scale: number = 1, preview = false) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    if (shape === 'none') {
      // Восстанавливаем оригинал если есть
      const originalSrc = (obj as any)._originalSrc as string | undefined;
      if (originalSrc && obj.type === 'image') {
        const origLeft = obj.left;
        const origTop = obj.top;
        const origOriginX = obj.originX;
        const origOriginY = obj.originY;
        fabric.Image.fromURL(originalSrc, (origImg: fabric.Image) => {
          const maxW = canvas.getWidth() * 0.6;
          const maxH = canvas.getHeight() * 0.6;
          const s = Math.min(maxW / (origImg.width || 1), maxH / (origImg.height || 1), 1);
          origImg.set({ left: origLeft, top: origTop, originX: origOriginX, originY: origOriginY, scaleX: s, scaleY: s });
          (origImg as any)._originalSrc = originalSrc;
          canvas.remove(obj);
          canvas.add(origImg);
          canvas.setActiveObject(origImg);
          canvas.renderAll();
          saveHistoryState();
          onModifiedRef.current(canvas.toJSON(['id']));
        });
      } else {
        obj.set('clipPath', undefined);
        canvas.renderAll();
        saveHistoryState();
        onModifiedRef.current(canvas.toJSON(['id']));
      }
      return;
    }

    // Определяем источник: оригинал или текущий объект
    const originalSrc = (obj as any)._originalSrc as string | undefined;
    const srcToUse = originalSrc ?? (obj.type === 'image' ? (obj as fabric.Image).getSrc?.() : null);

    const doClip = (sourceObj: fabric.Object) => {
      const fullW = sourceObj.width ?? 100;
      const fullH = sourceObj.height ?? 100;
      const scaleX = sourceObj.scaleX ?? 1;
      const scaleY = sourceObj.scaleY ?? 1;
      const w = fullW * scale;
      const h = fullH * scale;
      const hw = w / 2, hh = h / 2;

      let clip: fabric.Object | null = null;
      if (shape === 'rect') {
        clip = new fabric.Rect({ left: -hw, top: -hh, width: w, height: h, originX: 'left', originY: 'top' });
      } else if (shape === 'circle') {
        const r = Math.min(hw, hh);
        clip = new fabric.Circle({ radius: r, left: -r, top: -r, originX: 'left', originY: 'top' });
      } else if (shape === 'ellipse') {
        clip = new fabric.Ellipse({ rx: hw, ry: hh, left: -hw, top: -hh, originX: 'left', originY: 'top' });
      } else if (shape === 'triangle') {
        clip = new fabric.Triangle({ width: w, height: h, left: -hw, top: -hh, originX: 'left', originY: 'top' });
      } else if (shape === 'star') {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? Math.min(hw, hh) : Math.min(hw, hh) * 0.45;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
        }
        clip = new fabric.Polygon(pts, { originX: 'center', originY: 'center', left: 0, top: 0 });
      } else if (shape === 'heart') {
        const s = Math.min(hw, hh);
        clip = new fabric.Path(
          `M 0 ${s * 0.3} C 0 ${-s * 0.1} ${-s} ${-s * 0.1} ${-s} ${s * 0.3} C ${-s} ${s * 0.8} 0 ${s * 1.1} 0 ${s * 1.3} C 0 ${s * 1.1} ${s} ${s * 0.8} ${s} ${s * 0.3} C ${s} ${-s * 0.1} 0 ${-s * 0.1} 0 ${s * 0.3} Z`,
          { originX: 'center', originY: 'center', left: 0, top: 0 }
        );
      } else if (shape === 'diamond') {
        clip = new fabric.Polygon(
          [{ x: 0, y: -hh }, { x: hw, y: 0 }, { x: 0, y: hh }, { x: -hw, y: 0 }],
          { originX: 'center', originY: 'center', left: 0, top: 0 }
        );
      }
      if (!clip) return;

      const renderW = Math.ceil(fullW * scaleX);
      const renderH = Math.ceil(fullH * scaleY);
      const offscreen = document.createElement('canvas');
      offscreen.width = renderW;
      offscreen.height = renderH;
      const ctx = offscreen.getContext('2d')!;

      const origLeft = obj.left;
      const origTop = obj.top;
      const origOriginX = obj.originX;
      const origOriginY = obj.originY;

      (clip as any).absolutePositioned = false;
      sourceObj.set({ clipPath: clip, left: renderW / 2, top: renderH / 2, originX: 'center', originY: 'center' });
      sourceObj.setCoords();
      sourceObj.render(ctx);

      const dataUrl = offscreen.toDataURL('image/png');
      fabric.Image.fromURL(dataUrl, (newImg: fabric.Image) => {
        newImg.set({ left: origLeft, top: origTop, originX: origOriginX ?? 'left', originY: origOriginY ?? 'top', scaleX: 1, scaleY: 1 });
        // Сохраняем оригинал и scale для следующей обрезки
        (newImg as any)._originalSrc = originalSrc ?? srcToUse;
        (newImg as any)._originalScale = (obj as any)._originalScale ?? obj.scaleX ?? 1;
        canvas.remove(obj);
        canvas.add(newImg);
        canvas.setActiveObject(newImg);
        canvas.renderAll();
        if (!preview) {
          saveHistoryState();
          onModifiedRef.current(canvas.toJSON(['id']));
        }
      });
    };

    // Если есть оригинал — загружаем его и применяем clip к нему
    if (srcToUse) {
      const origScale = (obj as any)._originalScale as number | undefined;
      const useScaleX = origScale ?? obj.scaleX ?? 1;
      const useScaleY = origScale ?? obj.scaleY ?? 1;
      fabric.Image.fromURL(srcToUse, (origImg: fabric.Image) => {
        origImg.set({ scaleX: useScaleX, scaleY: useScaleY });
        doClip(origImg);
      });
    } else {
      doClip(obj);
    }
  }, [saveHistoryState]);

  // Интерактивная обрезка через overlay — возвращает начальный box объекта
  const enterCropMode = useCallback((): { x: number; y: number; w: number; h: number } | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    const obj = canvas.getActiveObject();
    if (!obj) return null;

    const br = obj.getBoundingRect(true);
    // Сохраняем target до discardActiveObject
    (canvas as any)._cropTarget = obj;
    canvas.selection = false;
    canvas.discardActiveObject();
    canvas.renderAll();
    setIsCropping(true);
    return { x: br.left, y: br.top, w: br.width, h: br.height };
  }, []);

  const applyCrop = useCallback((box: { x: number; y: number; w: number; h: number }) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const target = (canvas as any)._cropTarget as fabric.Object | undefined;
    if (!target) { setIsCropping(false); canvas.selection = true; return; }

    delete (canvas as any)._cropTarget;
    canvas.selection = true;
    setIsCropping(false);

    // Всегда работаем от оригинального изображения
    const originalSrc = (target as any)._originalSrc as string | undefined;
    const srcToLoad = originalSrc ?? (target.type === 'image' ? (target as fabric.Image).getSrc?.() : null);

    const doApply = (img: fabric.Image) => {
      // Получаем bounding rect объекта (левый верхний угол в canvas-координатах)
      const br = target.getBoundingRect(true);
      const scaleX = target.scaleX ?? 1;
      const scaleY = target.scaleY ?? 1;

      // Если target уже был обрезан, его br.left/top соответствует обрезанной части.
      // Нужно учесть уже существующий cropX/cropY чтобы правильно вычислить
      // смещение в пикселях оригинального изображения.
      const prevCropX = (target as fabric.Image).cropX ?? 0;
      const prevCropY = (target as fabric.Image).cropY ?? 0;

      // box.x/y — координаты в canvas-пикселях (из CropOverlay)
      // br.left/top — левый верхний угол текущего (возможно обрезанного) объекта в canvas-пикселях
      // Переводим в пиксели оригинального изображения
      const cropX = prevCropX + (box.x - br.left) / scaleX;
      const cropY = prevCropY + (box.y - br.top) / scaleY;
      const cropW = box.w / scaleX;
      const cropH = box.h / scaleY;

      const origSize = img.getOriginalSize?.() ?? { width: img.width ?? cropW, height: img.height ?? cropH };
      const safeCropX = Math.max(0, Math.min(cropX, origSize.width));
      const safeCropY = Math.max(0, Math.min(cropY, origSize.height));
      const safeCropW = Math.min(cropW, origSize.width - safeCropX);
      const safeCropH = Math.min(cropH, origSize.height - safeCropY);

      img.set({
        cropX: safeCropX,
        cropY: safeCropY,
        width: safeCropW,
        height: safeCropH,
        left: box.x,
        top: box.y,
        scaleX,
        scaleY,
        originX: 'left',
        originY: 'top',
        clipPath: undefined,
      });
      // Сохраняем оригинал и scale для следующей обрезки
      (img as any)._originalSrc = originalSrc ?? srcToLoad;
      (img as any)._originalScaleX = scaleX;
      (img as any)._originalScaleY = scaleY;
      img.setCoords();
      canvas.remove(target);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      saveHistoryState();
      onModifiedRef.current(canvas.toJSON(['id']));
    };

    if (srcToLoad) {
      fabric.Image.fromURL(srcToLoad, doApply);
    } else if (target.type === 'image') {
      doApply(target as fabric.Image);
    } else {
      const clip = new fabric.Rect({ left: box.x, top: box.y, width: box.w, height: box.h, absolutePositioned: true } as any);
      target.set('clipPath', clip);
      canvas.setActiveObject(target);
      canvas.renderAll();
      saveHistoryState();
      onModifiedRef.current(canvas.toJSON(['id']));
    }
  }, [saveHistoryState]);

  const cancelCrop = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    delete (canvas as any)._cropTarget;
    canvas.selection = true;
    setIsCropping(false);
  }, []);

  const deselectAll = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setSelectedObject(null);
    setSelectedObjectVersion(v => v + 1);
  }, []);

  return {
    canvasRef, fabricRef, loadFromJSON,
    addText, addShape, addRect, addCircle, addTriangle, addLine, addImage, addSticker, addFrame, deleteSelected, deselectAll,
    exportPNG, undo, redo, canUndo, canRedo,
    gridEnabled, toggleGrid, snapEnabled, toggleSnap,
    applyFilter, applyClipShape, previewClipShape, enterCropMode, applyCrop, cancelCrop, isCropping,
    getObjects, selectObject, bringForward, sendBackward, bringToFront, sendToBack, toggleVisibility, toggleLock, removeObject,
    updateSelected, selectedObject, selectedObjectVersion,
    setBackground, setBackgroundGradient, setBackgroundImage, clearBackground,
    layerVersion,
  };
}
