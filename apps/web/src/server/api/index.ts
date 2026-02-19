import 'server-only';

import { dailyReportRouter } from '@/server/api/routers/daily-report';
import { createCallerFactory, router } from '@/server/api/trpc';

export const appRouter = router({
  dailyReport: dailyReportRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

// NOTE: Server Component から tRPC を呼び出すためのヘルパーである。HTTP を経由しないため認証済みとして扱う
export const createServerCaller = () =>
  createCaller({ isAuthenticated: true });
