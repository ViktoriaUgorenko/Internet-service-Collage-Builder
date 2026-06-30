import React from 'react';

interface CanvasWrapperProps {
  canvasData: {
    width: number;
    height: number;
    objects: any[];
  } | null;
}

export const CanvasWrapper: React.FC<CanvasWrapperProps> = ({ canvasData }) => {
  if (!canvasData) {
    return <div className="text-gray-500">Загрузка холста...</div>;
  }

  const { width, height } = canvasData;

  // Отношение сторон, чтобы холст был адаптивным
  const aspectRatio = width / height;

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200 overflow-hidden p-4">
      <div 
        className="bg-white shadow-lg relative"
        style={{
          width: '100%',
          maxWidth: `${width}px`,
          aspectRatio: `${aspectRatio}`,
          // Max height constraint to prevent overflow
          maxHeight: 'calc(100vh - 120px)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 select-none">
          Область холста ({width} x {height})<br/>
          (Пока пусто)
        </div>
        {/* Здесь в будущем будет рендериться логика canvas (например, fabric.js) */}
      </div>
    </div>
  );
};
