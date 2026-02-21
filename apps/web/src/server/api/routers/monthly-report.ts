import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  getMonthlyReportUseCase,
  getMonthlyReportsUseCase,
} from '@/server/infrastructure/di/container';
import { GetMonthlyReportInputSchema } from '@/server/usecase/monthly-report/get-monthly-report';

export const monthlyReportRouter = router({
  list: protectedProcedure.query(() => getMonthlyReportsUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetMonthlyReportInputSchema))
    .query(({ input }) => getMonthlyReportUseCase.execute(input)),
});
