import * as v from 'valibot';

import { publicProcedure, router } from '@/server/api/trpc';
import {
  createDailyReportUseCase,
  getDailyReportUseCase,
  getDailyReportsUseCase,
  updateDailyReportUseCase,
} from '@/server/infrastructure/di/container';
import { CreateDailyReportInputSchema } from '@/server/usecase/daily-report/create-daily-report';
import { GetDailyReportInputSchema } from '@/server/usecase/daily-report/get-daily-report';
import { UpdateDailyReportInputSchema } from '@/server/usecase/daily-report/update-daily-report';

export const dailyReportRouter = router({
  list: publicProcedure.query(() => getDailyReportsUseCase.execute()),
  detail: publicProcedure
    .input(v.parser(GetDailyReportInputSchema))
    .query(({ input }) => getDailyReportUseCase.execute(input)),
  create: publicProcedure
    .input(v.parser(CreateDailyReportInputSchema))
    .mutation(({ input }) => createDailyReportUseCase.execute(input)),
  update: publicProcedure
    .input(v.parser(UpdateDailyReportInputSchema))
    .mutation(({ input }) => updateDailyReportUseCase.execute(input)),
});
