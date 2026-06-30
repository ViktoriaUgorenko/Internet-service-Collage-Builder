"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// GET /api/projects
const getProjects = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        // TODO: добавить limit/offset пагинацию при росте данных, чтобы легко масштабировать позже
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        res.json(projects);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getProjects = getProjects;
// GET /api/projects/:id
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
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
    }
    catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getProjectById = getProjectById;
// POST /api/projects
const createProject = async (req, res) => {
    try {
        const { title, width, height } = req.body;
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const newProject = await prisma.project.create({
            data: {
                title: title || 'Новый проект',
                userId,
                canvasData: { width: width || 1080, height: height || 1080, objects: [] },
            },
        });
        res.status(201).json(newProject);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createProject = createProject;
// PUT /api/projects/:id
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, canvasData, thumbnailUrl } = req.body;
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        // Проверяем принадлежность проекта
        const existingProject = await prisma.project.findUnique({ where: { id } });
        if (!existingProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (existingProject.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updatedData = {};
        if (title !== undefined)
            updatedData.title = title;
        if (canvasData !== undefined)
            updatedData.canvasData = canvasData;
        if (thumbnailUrl !== undefined)
            updatedData.thumbnailUrl = thumbnailUrl;
        const updatedProject = await prisma.project.update({
            where: { id },
            data: updatedData,
        });
        res.json(updatedProject);
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateProject = updateProject;
// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
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
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteProject = deleteProject;
