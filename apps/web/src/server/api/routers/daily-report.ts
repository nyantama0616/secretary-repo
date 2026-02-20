import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  createDailyReportUseCase,
  deleteDailyReportUseCase,
  getDailyReportUseCase,
  getDailyReportsUseCase,
  updateDailyReportUseCase,
} from '@/server/infrastructure/di/container';
import { CreateDailyReportInputSchema } from '@/server/usecase/daily-report/create-daily-report';
import { DeleteDailyReportInputSchema } from '@/server/usecase/daily-report/delete-daily-report';
import { GetDailyReportInputSchema } from '@/server/usecase/daily-report/get-daily-report';
import { UpdateDailyReportInputSchema } from '@/server/usecase/daily-report/update-daily-report';

export const dailyReportRouter = router({
  list: protectedProcedure.query(() => getDailyReportsUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetDailyReportInputSchema))
    .query(({ input }) => getDailyReportUseCase.execute(input)),
  create: protectedProcedure
    .input(v.parser(CreateDailyReportInputSchema))
    .mutation(({ input }) => createDailyReportUseCase.execute(input)),
  update: protectedProcedure
    .input(v.parser(UpdateDailyReportInputSchema))
    .mutation(({ input }) => updateDailyReportUseCase.execute(input)),
  delete: protectedProcedure
    .input(v.parser(DeleteDailyReportInputSchema))
    .mutation(({ input }) => deleteDailyReportUseCase.execute(input)),
});
