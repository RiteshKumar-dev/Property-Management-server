import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }),

  body('email').isEmail().normalizeEmail(),

  body('password').isLength({ min: 6 }),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),

  body('password').notEmpty(),
];
