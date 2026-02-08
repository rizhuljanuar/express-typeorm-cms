import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { validateRequest } from '../middlewares/validateRequest';
import { paginationMiddleware } from '../middlewares/pagination';
import { authenticate, authorize, checkOwnership } from '../middlewares/auth';
import { UserRole } from '../models/User';
import { createPostSchema, updatePostSchema, getPostSchema, listPostsSchema } from '../dtos/post.dto';

const router = Router();
const postController = new PostController();

// Public routes - read only
router.get(
  '/',
  paginationMiddleware,
  validateRequest(listPostsSchema),
  postController.getAllPosts
);

router.get(
  '/:id',
  validateRequest(getPostSchema),
  postController.getPostById
);

// Protected routes - require authentication
router.use(authenticate);

router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR),
  validateRequest(createPostSchema),
  postController.createPost
);

router.patch(
  '/:id',
  validateRequest(getPostSchema),
  validateRequest(updatePostSchema),
  checkOwnership('id'),
  postController.updatePost
);

router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.EDITOR),
  validateRequest(getPostSchema),
  postController.deletePost
);

export default router;
