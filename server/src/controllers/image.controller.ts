import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Моковые фото на случай отсутствия Unsplash ключа
const MOCK_PHOTOS = [
  { id: 'm1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm2', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', thumb: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm3', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400', thumb: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm4', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400', thumb: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm5', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400', thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm6', url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400', thumb: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm7', url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400', thumb: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm8', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm9', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm10', url: 'https://images.unsplash.com/photo-1682686581498-5e85c7228119?w=400', thumb: 'https://images.unsplash.com/photo-1682686581498-5e85c7228119?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm11', url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400', thumb: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
  { id: 'm12', url: 'https://images.unsplash.com/photo-1682687221038-404670f09ef1?w=400', thumb: 'https://images.unsplash.com/photo-1682687221038-404670f09ef1?w=200', author: 'Unsplash', authorUrl: 'https://unsplash.com' },
];

// GET /api/images/unsplash?query=...&page=1
export const searchUnsplash = async (req: AuthRequest, res: Response) => {
  const { query = '', page = '1' } = req.query as Record<string, string>;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    // Возвращаем моки
    return res.json({ photos: MOCK_PHOTOS, isMock: true });
  }

  try {
    const endpoint = query.trim()
      ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20&orientation=landscape`
      : `https://api.unsplash.com/photos?page=${page}&per_page=20&order_by=popular`;

    const response = await fetch(endpoint, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!response.ok) throw new Error(`Unsplash ${response.status}`);

    const data: any = await response.json();
    const items = query.trim() ? data.results : data;

    const photos = items.map((p: any) => ({
      id: p.id,
      url: p.urls.regular,
      thumb: p.urls.small,
      author: p.user.name,
      authorUrl: p.user.links.html,
      downloadLocation: p.links.download_location,
    }));

    res.json({ photos, isMock: false });
  } catch (error) {
    console.error('Unsplash error:', error);
    // Fallback на моки при ошибке
    res.json({ photos: MOCK_PHOTOS, isMock: true });
  }
};

// POST /api/images/unsplash/track — трекинг скачивания (требование Unsplash API)
export const trackUnsplashDownload = async (req: AuthRequest, res: Response) => {
  const { downloadLocation } = req.body;
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey && downloadLocation) {
    fetch(`${downloadLocation}?client_id=${accessKey}`).catch(() => {});
  }
  res.json({ ok: true });
};

// GET /api/images/library — медиабиблиотека пользователя
export const getLibrary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const media = await prisma.media.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/images/upload — загрузка файла
export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Файл не найден' });

    // URL для доступа к файлу
    const fileUrl = `/uploads/${file.filename}`;

    const media = await prisma.media.create({
      data: {
        url: fileUrl,
        source: 'UPLOAD',
        userId,
      } as any,
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('uploadImage error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/images/:id
export const deleteMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return res.status(404).json({ message: 'Not found' });
    if (media.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    // Удаляем файл с диска если это загрузка
    if (media.source === 'UPLOAD' && media.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), media.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.media.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
