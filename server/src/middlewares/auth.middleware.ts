import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };

      // Добавляем ID пользователя в объект запроса
      req.user = { id: decoded.id };
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Не авторизован, неверный токен' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Не авторизован, нет токена' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };
      req.user = { id: decoded.id };
    } catch (error) {
      // Игнорируем ошибку токена для опциональной авторизации
    }
  }

  next();
};
