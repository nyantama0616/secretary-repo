import 'server-only';

import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAME, verifyApiKey } from '@/server/api/auth';
import { dailyReportRouter } from '@/server/api/routers/daily-report';
import { monthlyReportRouter } from '@/server/api/routers/monthly-report';
import { taskRouter } from '@/server/api/routers/task';
import { createCallerFactory, router } from '@/server/api/trpc';

export const appRouter = router({
  dailyReport: dailyReportRouter,
  monthlyReport: monthlyReportRouter,
  task: taskRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

// NOTE: Server Component から tRPC を呼び出すためのヘルパーである。HTTP 経由の tRPC ハンドラと同じ検証を行う
export const createServerCaller = async () => {
  const cookieStore = await cookies();
  const apiKey = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = !!(apiKey && verifyApiKey(apiKey));
  return createCaller({ isAuthenticated });
};
