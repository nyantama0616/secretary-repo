import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import {
  type WeeklyReport,
  createWeeklyReport,
} from '@/server/domain/weekly-report/weekly-report';
import type { WeeklyReportRepository } from '@/server/domain/weekly-report/weekly-report-repository';

export const UpdateWeeklyReportInputSchema = v.object({
  id: v.string(),
  goal: v.optional(v.pipe(v.string(), v.minLength(1))),
  summary: v.optional(v.pipe(v.string(), v.minLength(1))),
  review: v.optional(v.pipe(v.string(), v.minLength(1))),
  notes: v.optional(v.pipe(v.string(), v.minLength(1))),
});

type UpdateWeeklyReportInput = v.InferOutput<
  typeof UpdateWeeklyReportInputSchema
>;

export class UpdateWeeklyReportUseCase {
  constructor(
    private readonly weeklyReportRepository: WeeklyReportRepository,
  ) {}

  async execute(input: UpdateWeeklyReportInput): Promise<WeeklyReport> {
    const existing = await this.weeklyReportRepository.findById(input.id);

    if (!existing) {
      throw new NotFoundError('週報', input.id);
    }

    const updated = createWeeklyReport({
      ...existing,
      goal: input.goal ?? existing.goal,
      summary: input.summary ?? existing.summary,
      review: input.review ?? existing.review,
      notes: input.notes ?? existing.notes,
    });

    await this.weeklyReportRepository.update(updated);

    return updated;
  }
}
