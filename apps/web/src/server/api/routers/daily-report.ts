import * as v from 'valibot';

import { publicProcedure, router } from '@/server/api/trpc';
import {
  getDailyReportUseCase,
  getDailyReportsUseCase,
} from '@/server/infrastructure/di/container';
import { GetDailyReportInputSchema } from '@/server/usecase/daily-report/get-daily-report';

export const dailyReportRouter = router({
  list: publicProcedure.query(() => getDailyReportsUseCase.execute()),
  detail: publicProcedure
    .input(v.parser(GetDailyReportInputSchema))
    .query(({ input }) => getDailyReportUseCase.execute(input)),
});
