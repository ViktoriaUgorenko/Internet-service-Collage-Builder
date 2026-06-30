import { useRef, useState, useEffect, useCallback } from 'react';
import {
  searchPhotos, getEditorialPhotos, triggerDownload, fetchPhotoAsDataUrl,
  hasUnsplashKey, UnsplashPhoto,
} from '../../../services/unsplash';

interface ImageUploadModalProps {
  onClose: () => void;
  onUpload: (dataUrl: string) => void;
}

type Tab = 'upload' | 'unsplash';

export function ImageUploadModal({ onClose, onUpload }: ImageUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>(hasUnsplashKey ? 'unsplash' : 'upload');

  // Unsplash state
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  const loadPhotos = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = q.trim()
        ? await searchPhotos(q)
        : await getEditorialPhotos();
      setPhotos(results);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загружаем популярные при открытии вкладки
  useEffect(() => {
    if (tab === 'unsplash' && hasUnsplashKey) {
      loadPhotos('');
    }
  }, [tab, loadPhotos]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => loadPhotos(value), 500);
  };

  const handleSelectPhoto = async (photo: UnsplashPhoto) => {
    setLoadingId(photo.id);
    try {
      await triggerDownload(photo.links.download_location);
      const dataUrl = await fetchPhotoAsDataUrl(photo.urls.regular);
      onUpload(dataUrl);
      onClose();
    } catch {
      setError('Не удалось загрузить фото');
    } finally {
      setLoadingId(null);
    }
  };

  // Загрузка с компьютера
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) { onUpload(result); onClose(); }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) { onUpload(result); onClose(); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 640, maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Добавить изображение</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 flex-shrink-0">
          <button onClick={() => setTab('upload')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              tab === 'upload' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            С компьютера
          </button>
          <button onClick={() => setTab('unsplash')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              tab === 'unsplash' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 32 32" fill="currentColor">
              <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"/>
            </svg>
            Unsplash
            {!hasUnsplashKey && <span className="text-xs opacity-60">(нет ключа)</span>}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-5 pt-3">

          {/* Upload tab */}
          {tab === 'upload' && (
            <div
              className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Нажмите или перетащите файл</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP, GIF</p>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
            </div>
          )}

          {/* Unsplash tab */}
          {tab === 'unsplash' && (
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              {!hasUnsplashKey ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Нужен Unsplash API ключ</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Зарегистрируйся на{' '}
                      <a href="https://unsplash.com/developers" target="_blank" rel="noreferrer"
                        className="text-indigo-500 hover:underline">unsplash.com/developers</a>
                      {' '}и добавь ключ в <code className="bg-gray-100 px-1 rounded text-xs">.env</code>
                    </p>
                    <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 text-left">
                      VITE_UNSPLASH_ACCESS_KEY=твой_ключ
                    </code>
                  </div>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="relative flex-shrink-0">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Поиск фото... (nature, city, abstract...)"
                      value={query}
                      onChange={e => handleSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                    />
                  </div>

                  {/* Grid */}
                  <div className="flex-1 overflow-y-auto">
                    {loading && (
                      <div className="flex items-center justify-center h-40">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
                      </div>
                    )}
                    {error && (
                      <div className="text-center py-10 text-sm text-red-500">{error}</div>
                    )}
                    {!loading && !error && photos.length === 0 && (
                      <div className="text-center py-10 text-sm text-gray-400">Ничего не найдено</div>
                    )}
                    {!loading && photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map(photo => (
                          <button
                            key={photo.id}
                            onClick={() => handleSelectPhoto(photo)}
                            disabled={!!loadingId}
                            className="relative group rounded-lg overflow-hidden aspect-video bg-gray-100 hover:ring-2 hover:ring-indigo-400 transition-all disabled:opacity-60"
                          >
                            <img
                              src={photo.urls.small}
                              alt={photo.alt_description || ''}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                              {loadingId === photo.id ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                              ) : (
                                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                                </svg>
                              )}
                            </div>
                            {/* Author */}
                            <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-[10px] truncate">{photo.user.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attribution */}
                  <p className="text-center text-xs text-gray-400 flex-shrink-0">
                    Фото с{' '}
                    <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="hover:underline">Unsplash</a>
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
