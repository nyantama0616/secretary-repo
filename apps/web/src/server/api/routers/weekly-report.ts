import { protectedProcedure, router } from '@/server/api/trpc';
import { getWeeklyReportsUseCase } from '@/server/infrastructure/di/container';

export const weeklyReportRouter = router({
  list: protectedProcedure.query(() => getWeeklyReportsUseCase.execute()),
});
