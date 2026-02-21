import * as v from 'valibot';

import {
  type DailyReport,
  createDailyReport,
} from '@/server/domain/daily-report/daily-report';
import type { DailyReportRepository } from '@/server/domain/daily-report/daily-report-repository';
import { AlreadyExistsError } from '@/server/domain/error/domain-errors';
import { generateId } from '@/server/domain/id';

export const CreateDailyReportInputSchema = v.object({
  date: v.date(),
  goal: v.optional(v.pipe(v.string(), v.minLength(1))),
  wakeUpTime: v.optional(v.date()),
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
        '日報',
        input.date.toISOString(),
      );
    }

    const dailyReport = createDailyReport({
      id: generateId(),
      date: input.date,
      goal: input.goal ?? null,
      summary: null,
      wakeUpTime: input.wakeUpTime ?? null,
      bedTime: null,
      goodPoints: null,
      badPoints: null,
      learnings: null,
      nextActions: null,
      notes: input.notes ?? null,
      createdAt: new Date(),
    });

    await this.dailyReportRepository.save(dailyReport);

    return dailyReport;
  }
}
