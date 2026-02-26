import { Router } from 'express';
import protect from '../../middleware/auth.middleware.js';
import upload from '../../middleware/multer.middleware.js';
import { uploadMultipleImages, deleteImageByPublicId } from './media.controller.js';

const router = Router();

router.post('/upload', protect, upload.array('images', 6), uploadMultipleImages);

router.delete('/delete', protect, deleteImageByPublicId);

export default router;
