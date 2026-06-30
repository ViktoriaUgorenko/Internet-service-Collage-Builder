const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;

export interface UnsplashPhoto {
  id: string;
  urls: { small: string; regular: string; full: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
  links: { download_location: string };
}

const BASE = 'https://api.unsplash.com';

function headers() {
  return { Authorization: `Client-ID ${ACCESS_KEY}` };
}

export async function searchPhotos(query: string, page = 1, perPage = 20): Promise<UnsplashPhoto[]> {
  if (!ACCESS_KEY) throw new Error('VITE_UNSPLASH_ACCESS_KEY не задан');
  const res = await fetch(
    `${BASE}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Unsplash error: ${res.status}`);
  const data = await res.json();
  return data.results as UnsplashPhoto[];
}

export async function getEditorialPhotos(page = 1, perPage = 20): Promise<UnsplashPhoto[]> {
  if (!ACCESS_KEY) throw new Error('VITE_UNSPLASH_ACCESS_KEY не задан');
  const res = await fetch(
    `${BASE}/photos?page=${page}&per_page=${perPage}&order_by=popular`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Unsplash error: ${res.status}`);
  return res.json() as Promise<UnsplashPhoto[]>;
}

// Обязательный шаг по правилам Unsplash API — трекинг скачивания
export async function triggerDownload(downloadLocation: string): Promise<void> {
  if (!ACCESS_KEY) return;
  await fetch(`${downloadLocation}?client_id=${ACCESS_KEY}`).catch(() => {});
}

// Загружаем фото как dataURL для добавления на холст
export async function fetchPhotoAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const hasUnsplashKey = !!ACCESS_KEY;
