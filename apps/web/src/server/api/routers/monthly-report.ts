import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  createMonthlyReportUseCase,
  deleteMonthlyReportUseCase,
  getMonthlyReportUseCase,
  getMonthlyReportsUseCase,
  reviewMonthlyReportUseCase,
} from '@/server/infrastructure/di/container';
import { CreateMonthlyReportInputSchema } from '@/server/usecase/monthly-report/create-monthly-report';
import { DeleteMonthlyReportInputSchema } from '@/server/usecase/monthly-report/delete-monthly-report';
import { GetMonthlyReportInputSchema } from '@/server/usecase/monthly-report/get-monthly-report';
import { ReviewMonthlyReportInputSchema } from '@/server/usecase/monthly-report/review-monthly-report';

export const monthlyReportRouter = router({
  list: protectedProcedure.query(() => getMonthlyReportsUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetMonthlyReportInputSchema))
    .query(({ input }) => getMonthlyReportUseCase.execute(input)),
  create: protectedProcedure
    .input(v.parser(CreateMonthlyReportInputSchema))
    .mutation(({ input }) => createMonthlyReportUseCase.execute(input)),
  review: protectedProcedure
    .input(v.parser(ReviewMonthlyReportInputSchema))
    .mutation(({ input }) => reviewMonthlyReportUseCase.execute(input)),
  delete: protectedProcedure
    .input(v.parser(DeleteMonthlyReportInputSchema))
    .mutation(({ input }) => deleteMonthlyReportUseCase.execute(input)),
});
