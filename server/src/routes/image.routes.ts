import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload';
import { searchUnsplash, trackUnsplashDownload, getLibrary, uploadImage, deleteMedia } from '../controllers/image.controller';

const router = Router();

router.get('/unsplash', protect, searchUnsplash);
router.post('/unsplash/track', protect, trackUnsplashDownload);
router.get('/library', protect, getLibrary);
router.post('/upload', protect, upload.single('file'), uploadImage);
router.delete('/:id', protect, deleteMedia);

export default router;
