import { Router } from 'express';
import protect from '../../middleware/auth.middleware.js';
import upload from '../../middleware/multer.middleware.js';

import {
  createProperty,
  getAllProperties,
  getMyProperties,
  updateProperty,
  deleteProperty,
  showInterest,
  getInterestedUsers,
  deletePropertyImage,
} from './property.controller.js';

const router = Router();

router.post('/', protect, upload.array('images', 6), createProperty);

router.get('/', protect, getAllProperties);

router.get('/my', protect, getMyProperties);

router.put('/:id', protect, upload.array('images', 6), updateProperty);

router.delete('/image/remove', protect, deletePropertyImage);

router.delete('/:id', protect, deleteProperty);

router.post('/:id/interest', protect, showInterest);

router.get('/:id/interested-users', protect, getInterestedUsers);

export default router;
