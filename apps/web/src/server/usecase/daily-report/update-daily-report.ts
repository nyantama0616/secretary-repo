import * as v from 'valibot';

import {
  type DailyReport,
  createDailyReport,
} from '@/server/domain/daily-report/daily-report';
import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { NotFoundError } from '@/server/domain/error/domain-errors';

// NOTE: 日付は日報のアイデンティティであるため、変更を許可しない
export const UpdateDailyReportInputSchema = v.object({
  id: v.string(),
  goal: v.optional(v.pipe(v.string(), v.minLength(1))),
  summary: v.optional(v.pipe(v.string(), v.minLength(1))),
  wakeUpTime: v.optional(v.date()),
  bedTime: v.optional(v.date()),
  review: v.optional(v.pipe(v.string(), v.minLength(1))),
  reviewStartedAt: v.optional(v.date()),
  reviewFinishedAt: v.optional(v.date()),
  notes: v.optional(v.pipe(v.string(), v.minLength(1))),
});

type UpdateDailyReportInput = v.InferOutput<
  typeof UpdateDailyReportInputSchema
>;

export class UpdateDailyReportUseCase {
  constructor(
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: UpdateDailyReportInput): Promise<DailyReport> {
    const existing = await this.dailyReportRepository.findById(input.id);

    if (!existing) {
      throw new NotFoundError('日報', input.id);
    }

    const updated = createDailyReport({
      id: existing.id,
      date: existing.date,
      goal: input.goal ?? existing.goal,
      summary: input.summary ?? existing.summary,
      wakeUpTime: input.wakeUpTime ?? existing.wakeUpTime,
      bedTime: input.bedTime ?? existing.bedTime,
      review: input.review ?? existing.review,
      reviewStartedAt: input.reviewStartedAt ?? existing.reviewStartedAt,
      reviewFinishedAt: input.reviewFinishedAt ?? existing.reviewFinishedAt,
      notes: input.notes ?? existing.notes,
      createdAt: existing.createdAt,
    });

    await this.dailyReportRepository.update(updated);

    return updated;
  }
}
