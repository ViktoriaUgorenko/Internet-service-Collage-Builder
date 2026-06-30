import { Router } from 'express';
import { protect, optionalAuth } from '../middlewares/auth.middleware';
import { getTemplates, getTemplateById, createTemplate, deleteTemplate } from '../controllers/template.controller';

const router = Router();

router.get('/', optionalAuth, getTemplates);
router.get('/:id', optionalAuth, getTemplateById);
router.post('/', protect, createTemplate);
router.delete('/:id', protect, deleteTemplate);

export default router;
