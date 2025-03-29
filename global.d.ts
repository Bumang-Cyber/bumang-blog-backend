// global.d.ts
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      userId: number;
      role?: string;
    };
  }
}
