import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  createWeeklyReportUseCase,
  getWeeklyReportUseCase,
  getWeeklyReportsUseCase,
  reviewWeeklyReportUseCase,
  updateWeeklyReportUseCase,
} from '@/server/infrastructure/di/container';
import { CreateWeeklyReportInputSchema } from '@/server/usecase/weekly-report/create-weekly-report';
import { GetWeeklyReportInputSchema } from '@/server/usecase/weekly-report/get-weekly-report';
import { ReviewWeeklyReportInputSchema } from '@/server/usecase/weekly-report/review-weekly-report';
import { UpdateWeeklyReportInputSchema } from '@/server/usecase/weekly-report/update-weekly-report';

export const weeklyReportRouter = router({
  list: protectedProcedure.query(() => getWeeklyReportsUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetWeeklyReportInputSchema))
    .query(({ input }) => getWeeklyReportUseCase.execute(input)),
  create: protectedProcedure
    .input(v.parser(CreateWeeklyReportInputSchema))
    .mutation(({ input }) => createWeeklyReportUseCase.execute(input)),
  review: protectedProcedure
    .input(v.parser(ReviewWeeklyReportInputSchema))
    .mutation(({ input }) => reviewWeeklyReportUseCase.execute(input)),
  update: protectedProcedure
    .input(v.parser(UpdateWeeklyReportInputSchema))
    .mutation(({ input }) => updateWeeklyReportUseCase.execute(input)),
});
