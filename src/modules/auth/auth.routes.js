import { Router } from 'express';
import { register, login, logout } from './auth.controller.js';
import { registerValidation, loginValidation } from './auth.validation.js';
import validate from '../../middleware/validate.middleware.js';
import protect from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', protect, logout);

export default router;
