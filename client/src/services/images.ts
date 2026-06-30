import { api } from './api';

export interface SearchPhoto {
  id: string;
  url: string;
  thumb: string;
  author: string;
  authorUrl: string;
  downloadLocation?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  source: 'UPLOAD' | 'UNSPLASH';
  createdAt: string;
}

export async function searchUnsplash(query: string, page = 1): Promise<{ photos: SearchPhoto[]; isMock: boolean }> {
  const res = await api.get('/images/unsplash', { params: { query, page } });
  return res.data;
}

export async function trackDownload(downloadLocation: string): Promise<void> {
  await api.post('/images/unsplash/track', { downloadLocation });
}

export async function getLibrary(): Promise<MediaItem[]> {
  const res = await api.get('/images/library');
  return res.data;
}

export async function uploadImage(file: File): Promise<MediaItem> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/images/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteMedia(id: string): Promise<void> {
  await api.delete(`/images/${id}`);
}

// Загружаем внешнее фото как dataURL для добавления на холст
export async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
