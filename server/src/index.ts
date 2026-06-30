import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Статика для загруженных файлов
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import templateRoutes from './routes/template.routes';
import imageRoutes from './routes/image.routes';

// Логирование всех входящих запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/images', imageRoutes);

app.get('/api/health', async (req, res, next) => {
  try {
    // Простой запрос к БД для проверки соединения
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected', version: '1.0' });
  } catch (error) {
    console.error('Database connection failed', error);
    // Передаем ошибку в глобальный обработчик
    next(error); 
  }
});

// Базовый глобальный обработчик ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('\x1b[31m[Global Error Handler]\x1b[0m', err.stack || err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
