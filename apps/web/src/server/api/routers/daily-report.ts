import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  createDailyReportUseCase,
  getDailyReportByDateUseCase,
  getDailyReportUseCase,
  getDailyReportsUseCase,
  updateDailyReportUseCase,
} from '@/server/infrastructure/di/container';
import { CreateDailyReportInputSchema } from '@/server/usecase/daily-report/create-daily-report';
import { GetDailyReportInputSchema } from '@/server/usecase/daily-report/get-daily-report';
import { GetDailyReportByDateInputSchema } from '@/server/usecase/daily-report/get-daily-report-by-date';
import { UpdateDailyReportInputSchema } from '@/server/usecase/daily-report/update-daily-report';

export const dailyReportRouter = router({
  list: protectedProcedure.query(() => getDailyReportsUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetDailyReportInputSchema))
    .query(({ input }) => getDailyReportUseCase.execute(input)),
  detailByDate: protectedProcedure
    .input(v.parser(GetDailyReportByDateInputSchema))
    .query(({ input }) => getDailyReportByDateUseCase.execute(input)),
  create: protectedProcedure
    .input(v.parser(CreateDailyReportInputSchema))
    .mutation(({ input }) => createDailyReportUseCase.execute(input)),
  update: protectedProcedure
    .input(v.parser(UpdateDailyReportInputSchema))
    .mutation(({ input }) => updateDailyReportUseCase.execute(input)),
});
