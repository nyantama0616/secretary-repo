import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { MonthlyReportRepository } from '@/server/domain/monthly-report/monthly-report-repository';

export const DeleteMonthlyReportInputSchema = v.object({
  id: v.string(),
});

type DeleteMonthlyReportInput = v.InferOutput<
  typeof DeleteMonthlyReportInputSchema
>;

export class DeleteMonthlyReportUseCase {
  constructor(
    private readonly monthlyReportRepository: MonthlyReportRepository,
  ) {}

  async execute(input: DeleteMonthlyReportInput): Promise<void> {
    const existing = await this.monthlyReportRepository.findById(input.id);

    if (!existing) {
      throw new NotFoundError('月報', input.id);
    }

    await this.monthlyReportRepository.delete(input.id);
  }
}
