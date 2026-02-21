import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import {
  type MonthlyReport,
  createMonthlyReport,
} from '@/server/domain/monthly-report/monthly-report';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';

export const ReviewMonthlyReportInputSchema = v.object({
  id: v.string(),
  goal: v.optional(v.pipe(v.string(), v.minLength(1))),
  summary: v.optional(v.pipe(v.string(), v.minLength(1))),
  review: v.optional(v.pipe(v.string(), v.minLength(1))),
  notes: v.optional(v.pipe(v.string(), v.minLength(1))),
});

type ReviewMonthlyReportInput = v.InferOutput<
  typeof ReviewMonthlyReportInputSchema
>;

export class ReviewMonthlyReportUseCase {
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
  ) {}

  async execute(input: ReviewMonthlyReportInput): Promise<MonthlyReport> {
    const existing = await this.monthlyReportRepository.findById(input.id);

    if (!existing) {
      throw new NotFoundError('月報', input.id);
    }

    const updated = createMonthlyReport({
      ...existing,
      goal: input.goal ?? existing.goal,
      summary: input.summary ?? existing.summary,
      review: input.review ?? existing.review,
      notes: input.notes ?? existing.notes,
    });

    await this.monthlyReportRepository.update(updated);

    return updated;
  }
}
