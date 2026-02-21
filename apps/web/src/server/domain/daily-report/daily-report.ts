import * as v from 'valibot';

const DailyReportSchema = v.pipe(
  v.object({
    id: v.string(),
    date: v.date(),
    plan: v.nullable(v.string()),
    summary: v.nullable(v.string()),
    wakeUpTime: v.nullable(v.date()),
    bedTime: v.nullable(v.date()),
    goodPoints: v.nullable(v.string()),
    badPoints: v.nullable(v.string()),
    learnings: v.nullable(v.string()),
    nextActions: v.nullable(v.string()),
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
