import { useEffect, useRef } from 'react';

interface HotkeyOptions {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onSave: () => void;
  onDeselect?: () => void;
}

export function useHotkeys({ onUndo, onRedo, onDelete, onSave, onDeselect }: HotkeyOptions) {
  // Используем refs чтобы не пересоздавать listener при каждом рендере
  const ref = useRef({ onUndo, onRedo, onDelete, onSave, onDeselect });
  ref.current = { onUndo, onRedo, onDelete, onSave, onDeselect };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Не перехватываем если фокус в текстовом поле или редактируется текст на холсте
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        ref.current.onUndo();
      } else if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z') || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        ref.current.onRedo();
      } else if (ctrl && e.key === 's') {
        e.preventDefault();
        ref.current.onSave();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !ctrl) {
        ref.current.onDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        ref.current.onDeselect?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
