import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import {
  type WeeklyReport,
  createWeeklyReport,
} from '@/server/domain/weekly-report/weekly-report';
import type { WeeklyReportRepository } from '@/server/domain/weekly-report/weekly-report-repository';

export const ReviewWeeklyReportInputSchema = v.object({
  id: v.string(),
  summary: v.optional(v.pipe(v.string(), v.minLength(1))),
  review: v.optional(v.pipe(v.string(), v.minLength(1))),
  notes: v.optional(v.pipe(v.string(), v.minLength(1))),
});

type ReviewWeeklyReportInput = v.InferOutput<
  typeof ReviewWeeklyReportInputSchema
>;

export class ReviewWeeklyReportUseCase {
  constructor(
    private readonly weeklyReportRepository: WeeklyReportRepository,
  ) {}

  async execute(input: ReviewWeeklyReportInput): Promise<WeeklyReport> {
    const existing = await this.weeklyReportRepository.findById(input.id);

    if (!existing) {
      throw new NotFoundError('週報', input.id);
    }

    const updated = createWeeklyReport({
      ...existing,
      summary: input.summary ?? existing.summary,
      review: input.review ?? existing.review,
      notes: input.notes ?? existing.notes,
    });

    await this.weeklyReportRepository.update(updated);

    return updated;
  }
}
