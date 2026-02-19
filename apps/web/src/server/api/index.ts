import { userRouter } from '@/server/api/routers/user';
import { createCallerFactory, router } from '@/server/api/trpc';

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
