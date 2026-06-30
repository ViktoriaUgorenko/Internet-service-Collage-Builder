import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// GET /api/projects
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // TODO: добавить limit/offset пагинацию при росте данных, чтобы легко масштабировать позже
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/projects/:id
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this project' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/projects
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, width, height } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const newProject = await prisma.project.create({
      data: {
        title: title || 'Новый проект',
        userId,
        canvasData: { width: width || 1080, height: height || 1080, objects: [] },
      },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/projects/:id
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, canvasData, thumbnailUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Проверяем принадлежность проекта
    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (existingProject.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (canvasData !== undefined) updatedData.canvasData = canvasData;
    if (thumbnailUrl !== undefined) updatedData.thumbnailUrl = thumbnailUrl;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updatedData,
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Проверяем принадлежность
    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (existingProject.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.project.delete({ where: { id } });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
