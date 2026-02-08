import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate, authorize, checkOwnership } from '../middlewares/auth';
import { UserRole } from '../models/User';
import { updateUserRoleSchema } from '../dtos/auth.dto';
import { getUserSchema, listUsersSchema } from '../dtos/user.dto';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticate);

// Admin only routes
router.get(
  '/',
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validateRequest(listUsersSchema),
  userController.getAllUsers
);

router.get(
  '/:id',
  validateRequest(getUserSchema),
  checkOwnership('id'),
  userController.getUserById
);

router.patch(
  '/:id/role',
  authorize(UserRole.ADMIN),
  validateRequest(updateUserRoleSchema),
  userController.updateUserRole
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateRequest(getUserSchema),
  userController.deactivateUser
);

export default router;
