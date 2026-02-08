import { z } from 'zod';

export const listUsersSchema = z.object({
  query: z.object({
    skip: z.string().transform(Number).refine((val) => val >= 0, 'Skip must be non-negative').optional(),
    take: z.string().transform(Number).refine((val) => val > 0 && val <= 100, 'Take must be between 1 and 100').optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
export type GetUserParams = z.infer<typeof getUserSchema>['params'];
