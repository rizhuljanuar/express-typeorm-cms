import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
    pagination?: {
      skip: number;
      take: number;
    };
  }
}

export {};
