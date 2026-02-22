import * as v from 'valibot';

import { isStartOfMonth } from '@/server/domain/date';
import { AlreadyExistsError } from '@/server/domain/error/domain-errors';
import { generateId } from '@/server/domain/id';
import {
  type MonthlyReport,
  createMonthlyReport,
} from '@/server/domain/monthly-report/monthly-report';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';

export const CreateMonthlyReportInputSchema = v.object({
  startDate: v.pipe(
    v.date(),
    v.check(isStartOfMonth, 'startDate は月の開始日である必要があります'),
  ),
  goal: v.optional(v.pipe(v.string(), v.minLength(1))),
});

type CreateMonthlyReportInput = v.InferOutput<
  typeof CreateMonthlyReportInputSchema
>;

export class CreateMonthlyReportUseCase {
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
  ) {}

  async execute(input: CreateMonthlyReportInput): Promise<MonthlyReport> {
    const existing = await this.monthlyReportRepository.findByStartDate(
      input.startDate,
    );
    if (existing) {
      throw new AlreadyExistsError('月報', input.startDate.toISOString());
    }

    const monthlyReport = createMonthlyReport({
      id: generateId(),
      startDate: input.startDate,
      goal: input.goal ?? null,
      summary: null,
      review: null,
      notes: null,
      createdAt: new Date(),
    });

    await this.monthlyReportRepository.save(monthlyReport);

    return monthlyReport;
  }
}
