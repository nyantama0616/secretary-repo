import * as v from 'valibot';

const DailyReportSchema = v.pipe(
  v.object({
    id: v.string(),
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
  }),
  v.brand('DailyReport'),
);

export type DailyReport = v.InferOutput<typeof DailyReportSchema>;

export const createDailyReport = (
  input: v.InferInput<typeof DailyReportSchema>,
): DailyReport => {
  return v.parse(DailyReportSchema, input);
};
