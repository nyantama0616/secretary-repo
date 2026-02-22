import * as v from 'valibot';

import { AlreadyExistsError } from '@/server/domain/error/domain-errors';
import { generateId } from '@/server/domain/id';
import {
  type WeeklyReport,
  createWeeklyReport,
} from '@/server/domain/weekly-report/weekly-report';
import type { WeeklyReportRepository } from '@/server/domain/weekly-report/weekly-report-repository';

export const CreateWeeklyReportInputSchema = v.object({
  startDate: v.pipe(
    v.date(),
    v.check(
      (d) => d.getDay() === 1,
      'startDate は月曜日である必要があります',
    ),
  ),
  goal: v.optional(v.pipe(v.string(), v.minLength(1))),
});

type CreateWeeklyReportInput = v.InferOutput<
  typeof CreateWeeklyReportInputSchema
>;

export class CreateWeeklyReportUseCase {
  constructor(
    private readonly weeklyReportRepository: WeeklyReportRepository,
  ) {}

  async execute(input: CreateWeeklyReportInput): Promise<WeeklyReport> {
    const existing = await this.weeklyReportRepository.findByStartDate(
      input.startDate,
    );
    if (existing) {
      throw new AlreadyExistsError('週報', input.startDate.toISOString());
    }

    const weeklyReport = createWeeklyReport({
      id: generateId(),
      startDate: input.startDate,
      goal: input.goal ?? null,
      summary: null,
      review: null,
      notes: null,
      createdAt: new Date(),
    });

    await this.weeklyReportRepository.save(weeklyReport);

    return weeklyReport;
  }
}
