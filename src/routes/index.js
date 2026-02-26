import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import protect from '../middleware/auth.middleware.js';
import propertyRoutes from '../modules/properties/property.routes.js';
import mediaRoutes from '../modules/media/media.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'API Root Working' });
});
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/media', mediaRoutes);

export default router;
