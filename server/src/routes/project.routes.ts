import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from '../controllers/project.controller';

const router = Router();

// Все маршруты защищены авторизацией
router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
