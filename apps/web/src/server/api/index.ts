import { dailyReportRouter } from '@/server/api/routers/daily-report';
import { createCallerFactory, router } from '@/server/api/trpc';

export const appRouter = router({
  dailyReport: dailyReportRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
