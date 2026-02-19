import * as v from 'valibot';

import {
  type DailyReport,
  createDailyReport,
} from '@/server/domain/daily-report/daily-report';
import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { AlreadyExistsError } from '@/server/domain/error/domain-errors';

export const CreateDailyReportInputSchema = v.object({
  date: v.date(),
  plan: v.optional(v.pipe(v.string(), v.minLength(1))),
  summary: v.optional(v.pipe(v.string(), v.minLength(1))),
  wakeUpTime: v.optional(v.date()),
  bedTime: v.optional(v.date()),
  goodPoints: v.optional(v.pipe(v.string(), v.minLength(1))),
  badPoints: v.optional(v.pipe(v.string(), v.minLength(1))),
  learnings: v.optional(v.pipe(v.string(), v.minLength(1))),
  nextActions: v.optional(v.pipe(v.string(), v.minLength(1))),
  notes: v.optional(v.pipe(v.string(), v.minLength(1))),
});

type CreateDailyReportInput = v.InferOutput<
  typeof CreateDailyReportInputSchema
>;

export class CreateDailyReportUseCase {
  constructor(
    private readonly dailyReportRepository: DailyReportRepository,
  ) {}

  async execute(input: CreateDailyReportInput): Promise<DailyReport> {
    const existing = await this.dailyReportRepository.findByDate(input.date);

    if (existing) {
      throw new AlreadyExistsError(
        'DailyReport',
        input.date.toISOString(),
      );
    }

    const dailyReport = createDailyReport({
      id: crypto.randomUUID(),
      date: input.date,
      plan: input.plan ?? null,
      summary: input.summary ?? null,
      wakeUpTime: input.wakeUpTime ?? null,
      bedTime: input.bedTime ?? null,
      goodPoints: input.goodPoints ?? null,
      badPoints: input.badPoints ?? null,
      learnings: input.learnings ?? null,
      nextActions: input.nextActions ?? null,
      notes: input.notes ?? null,
      createdAt: new Date(),
    });

    await this.dailyReportRepository.save(dailyReport);

    return dailyReport;
  }
}
