import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { validateRequest } from '../middlewares/validateRequest';
import { paginationMiddleware } from '../middlewares/pagination';
import { createPostSchema, updatePostSchema, getPostSchema, listPostsSchema } from '../dtos/post.dto';

const router = Router();
const postController = new PostController();

router.post(
  '/',
  validateRequest(createPostSchema),
  postController.createPost
);

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

router.patch(
  '/:id',
  validateRequest(getPostSchema),
  validateRequest(updatePostSchema),
  postController.updatePost
);

router.delete(
  '/:id',
  validateRequest(getPostSchema),
  postController.deletePost
);

export default router;
