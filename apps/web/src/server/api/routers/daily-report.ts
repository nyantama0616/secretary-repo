import { publicProcedure, router } from '@/server/api/trpc';
import { getDailyReportsUseCase } from '@/server/infrastructure/di/container';

export const dailyReportRouter = router({
  list: publicProcedure.query(() => getDailyReportsUseCase.execute()),
});
