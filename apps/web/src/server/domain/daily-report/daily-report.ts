import * as v from 'valibot';

import { omitUndefined } from '@/lib/omit-undefined';
import { ForbiddenError } from '@/server/domain/error/domain-errors';

const EDITABLE_HOURS = 48;

const DailyReportSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  date: v.date(),
  goal: v.nullable(v.string()),
  summary: v.nullable(v.string()),
  wakeUpTime: v.nullable(v.date()),
  bedTime: v.nullable(v.date()),
  review: v.nullable(v.string()),
  reviewStartedAt: v.nullable(v.date()),
  reviewFinishedAt: v.nullable(v.date()),
  notes: v.nullable(v.string()),
  createdAt: v.date(),
});

type DailyReportParams = v.InferInput<typeof DailyReportSchema>;

type CreateDailyReportParams = {
  id: string;
  date: Date;
  goal: string | null;
  wakeUpTime: Date | null;
  notes: string | null;
  createdAt: Date;
};

type UpdateDailyReportParams = {
  goal?: string | null;
  summary?: string | null;
  wakeUpTime?: Date | null;
  bedTime?: Date | null;
  review?: string | null;
  reviewStartedAt?: Date | null;
  reviewFinishedAt?: Date | null;
  notes?: string | null;
};

export class DailyReport {
  readonly id: string;
  readonly date: Date;
  readonly goal: string | null;
  readonly summary: string | null;
  readonly wakeUpTime: Date | null;
  readonly bedTime: Date | null;
  readonly review: string | null;
  readonly reviewStartedAt: Date | null;
  readonly reviewFinishedAt: Date | null;
  readonly notes: string | null;
  readonly createdAt: Date;

  private constructor(params: DailyReportParams) {
    const validated = v.parse(DailyReportSchema, params);
    this.id = validated.id;
    this.date = validated.date;
    this.goal = validated.goal;
    this.summary = validated.summary;
    this.wakeUpTime = validated.wakeUpTime;
    this.bedTime = validated.bedTime;
    this.review = validated.review;
    this.reviewStartedAt = validated.reviewStartedAt;
    this.reviewFinishedAt = validated.reviewFinishedAt;
    this.notes = validated.notes;
    this.createdAt = validated.createdAt;
  }

  static create(params: CreateDailyReportParams): DailyReport {
    return new DailyReport({
      ...params,
      summary: null,
      bedTime: null,
      review: null,
      reviewStartedAt: null,
      reviewFinishedAt: null,
    });
  }

  static reconstruct(params: DailyReportParams): DailyReport {
    return new DailyReport(params);
  }

  update(params: UpdateDailyReportParams, now: Date): DailyReport {
    if (!this.isEditable(now)) {
      throw new ForbiddenError(
        '日報は date から48時間を過ぎると変更できません',
      );
    }
    return new DailyReport({ ...this, ...omitUndefined(params) });
  }

  private isEditable(now: Date): boolean {
    const deadlineMs =
      this.date.getTime() + EDITABLE_HOURS * 60 * 60 * 1000;
    return now.getTime() < deadlineMs;
  }
}
