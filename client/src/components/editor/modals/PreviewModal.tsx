interface PreviewModalProps {
  dataUrl: string;
  onClose: () => void;
}

export function PreviewModal({ dataUrl, onClose }: PreviewModalProps) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `preview_${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-800">Предпросмотр</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-50">
          {dataUrl
            ? <img src={dataUrl} alt="Preview" className="max-w-full max-h-full shadow-lg rounded-lg object-contain"/>
            : <p className="text-gray-400 text-sm">Нет данных для отображения</p>
          }
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            Закрыть
          </button>
          {dataUrl && (
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Скачать PNG
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
