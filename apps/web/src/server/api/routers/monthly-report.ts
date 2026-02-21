import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  createMonthlyReportUseCase,
  getMonthlyReportUseCase,
  getMonthlyReportsUseCase,
  reviewMonthlyReportUseCase,
} from '@/server/infrastructure/di/container';
import { CreateMonthlyReportInputSchema } from '@/server/usecase/monthly-report/create-monthly-report';
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
});
