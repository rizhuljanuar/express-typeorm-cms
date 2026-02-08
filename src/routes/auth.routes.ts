import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/auth';
import { registerSchema, loginSchema } from '../dtos/auth.dto';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
);

router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

export default router;
