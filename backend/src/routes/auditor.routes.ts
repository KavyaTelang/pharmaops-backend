import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import * as authController from '../controllers/auditor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], asyncHandler(authController.login));
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser));

export default router;