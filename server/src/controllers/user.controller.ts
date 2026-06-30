import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data: { name },
      select: { id: true, name: true, email: true, role: true, updatedAt: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка обновления профиля' });
  }
};
