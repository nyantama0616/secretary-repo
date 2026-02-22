import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  getWeeklyReportUseCase,
  getWeeklyReportsUseCase,
} from '@/server/infrastructure/di/container';
import { GetWeeklyReportInputSchema } from '@/server/usecase/weekly-report/get-weekly-report';

export const weeklyReportRouter = router({
  list: protectedProcedure.query(() => getWeeklyReportsUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetWeeklyReportInputSchema))
    .query(({ input }) => getWeeklyReportUseCase.execute(input)),
});
