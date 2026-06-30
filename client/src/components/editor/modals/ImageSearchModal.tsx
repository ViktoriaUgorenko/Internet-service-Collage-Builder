import { useState, useEffect, useRef, useCallback } from 'react';
import {
  searchUnsplash, trackDownload, getLibrary, uploadImage, deleteMedia,
  fetchAsDataUrl, SearchPhoto, MediaItem,
} from '../../../services/images';

interface ImageSearchModalProps {
  onClose: () => void;
  onSelect: (dataUrl: string) => void;
}

type Tab = 'search' | 'library';

const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');

export function ImageSearchModal({ onClose, onSelect }: ImageSearchModalProps) {
  const [tab, setTab] = useState<Tab>('search');

  // Search state
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<SearchPhoto[]>([]);
  const [isMock, setIsMock] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Library state
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [libLoading, setLibLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await searchUnsplash(q);
      setPhotos(res.photos);
      setIsMock(res.isMock);
    } catch {
      setSearchError('Ошибка поиска');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'search') doSearch('');
  }, [tab, doSearch]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doSearch(val), 300);
  };

  const handleSelectPhoto = async (photo: SearchPhoto) => {
    setLoadingId(photo.id);
    try {
      if (photo.downloadLocation) await trackDownload(photo.downloadLocation);
      const dataUrl = await fetchAsDataUrl(photo.url);
      onSelect(dataUrl);
      onClose();
    } catch {
      setSearchError('Не удалось загрузить фото');
    } finally {
      setLoadingId(null);
    }
  };

  const loadLibrary = useCallback(async () => {
    setLibLoading(true);
    try {
      setLibrary(await getLibrary());
    } finally {
      setLibLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'library') loadLibrary();
  }, [tab, loadLibrary]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Файл слишком большой (макс. 5MB)'); return; }
    setUploading(true);
    try {
      await uploadImage(file);
      await loadLibrary();
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleSelectLibrary = async (item: MediaItem) => {
    setLoadingId(item.id);
    try {
      const url = item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`;
      const dataUrl = await fetchAsDataUrl(url);
      onSelect(dataUrl);
      onClose();
    } catch {
      alert('Не удалось загрузить изображение');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteLibrary = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMedia(id);
      setLibrary(prev => prev.filter(i => i.id !== id));
    } catch {
      alert('Ошибка удаления');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: 680, maxHeight: '88vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Изображения</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 flex-shrink-0">
          <button onClick={() => setTab('search')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${tab === 'search' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 32 32" fill="currentColor">
              <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"/>
            </svg>
            Поиск (Unsplash)
          </button>
          <button onClick={() => setTab('library')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === 'library' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
            Мои загрузки
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-5 pt-3 gap-3">

          {/* Search tab */}
          {tab === 'search' && (
            <>
              <div className="relative flex-shrink-0">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" placeholder="Поиск фото... (nature, city, abstract...)"
                  value={query} onChange={e => handleQueryChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>

              {isMock && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex-shrink-0">
                  Показаны демо-фото. Добавь <code className="font-mono">UNSPLASH_ACCESS_KEY</code> в <code className="font-mono">.env</code> для реального поиска.
                </p>
              )}

              <div className="flex-1 overflow-y-auto">
                {searchLoading && <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>}
                {searchError && <p className="text-sm text-red-500 text-center py-8">{searchError}</p>}
                {!searchLoading && photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map(photo => (
                      <button key={photo.id} onClick={() => handleSelectPhoto(photo)} disabled={!!loadingId}
                        className="relative group rounded-lg overflow-hidden aspect-video bg-gray-100 hover:ring-2 hover:ring-indigo-400 transition-all disabled:opacity-60">
                        <img src={photo.thumb} alt="" className="w-full h-full object-cover" loading="lazy"/>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          {loadingId === photo.id
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                            : <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                          }
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-[10px] truncate">{photo.author}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-gray-400 flex-shrink-0">
                Фото с <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="hover:underline">Unsplash</a>
              </p>
            </>
          )}

          {/* Library tab */}
          {tab === 'library' && (
            <>
              {/* Upload zone */}
              <div ref={dropRef}
                className="flex-shrink-0 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}>
                {uploading
                  ? <p className="text-sm text-indigo-500">Загрузка...</p>
                  : <p className="text-sm text-gray-500">Перетащите или <span className="text-indigo-500 font-medium">выберите файл</span> (макс. 5MB)</p>
                }
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput}/>
              </div>

              <div className="flex-1 overflow-y-auto">
                {libLoading && <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>}
                {!libLoading && library.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-10">Загрузок пока нет</p>
                )}
                {!libLoading && library.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {library.map(item => {
                      const src = item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`;
                      return (
                        <div key={item.id} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
                          onClick={() => handleSelectLibrary(item)}>
                          <img src={src} alt="" className="w-full h-full object-cover" loading="lazy"/>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            {loadingId === item.id
                              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                              : <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                            }
                          </div>
                          <button onClick={e => handleDeleteLibrary(item.id, e)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
