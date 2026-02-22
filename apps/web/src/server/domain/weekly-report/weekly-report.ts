import * as v from 'valibot';

const WeeklyReportSchema = v.pipe(
  v.object({
    id: v.string(),
    startDate: v.date(),
    goal: v.nullable(v.string()),
    summary: v.nullable(v.string()),
    review: v.nullable(v.string()),
    notes: v.nullable(v.string()),
    createdAt: v.date(),
  }),
  v.brand('WeeklyReport'),
);

export type WeeklyReport = v.InferOutput<typeof WeeklyReportSchema>;

export const createWeeklyReport = (
  input: v.InferInput<typeof WeeklyReportSchema>,
): WeeklyReport => {
  return v.parse(WeeklyReportSchema, input);
};
