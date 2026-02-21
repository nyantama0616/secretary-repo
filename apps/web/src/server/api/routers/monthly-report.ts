import { protectedProcedure, router } from '@/server/api/trpc';
import { getMonthlyReportsUseCase } from '@/server/infrastructure/di/container';

export const monthlyReportRouter = router({
  list: protectedProcedure.query(() => getMonthlyReportsUseCase.execute()),
});
