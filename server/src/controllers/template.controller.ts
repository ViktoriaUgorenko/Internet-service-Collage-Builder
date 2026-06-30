import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// GET /api/templates?category=&scope=my|public|all
export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category, scope = 'all' } = req.query as Record<string, string>;

    const where: any = {};
    if (category) where.category = category;

    if (scope === 'my' && userId) {
      where.userId = userId;
    } else if (scope === 'public') {
      where.isPublic = true;
    } else {
      // all: публичные + свои
      where.OR = [{ isPublic: true }, ...(userId ? [{ userId }] : [])];
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, thumbnailUrl: true,
        category: true, userId: true, createdAt: true,
        canvasData: true,
      } as any,
    });

    res.json(templates);
  } catch (error) {
    console.error('getTemplates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/templates/:id
export const getTemplateById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({ where: { id } });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    // Публичные доступны всем, приватные — только владельцу
    if (!(template as any).isPublic && template.userId !== req.user?.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/templates
export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, description, canvasData, thumbnailUrl, category, isPublic } = req.body;
    if (!name || !canvasData) return res.status(400).json({ message: 'name и canvasData обязательны' });

    const template = await prisma.template.create({
      data: {
        name,
        canvasData,
        thumbnailUrl: thumbnailUrl ?? null,
        category: category ?? 'Other',
        isPublic: isPublic ?? false,
        userId,
      } as any,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('createTemplate error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/templates/:id
export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const template = await prisma.template.findUnique({ where: { id } });
    if (!template) return res.status(404).json({ message: 'Not found' });
    if (template.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    await prisma.template.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
