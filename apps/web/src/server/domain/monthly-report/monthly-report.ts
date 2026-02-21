import * as v from 'valibot';

const MonthlyReportSchema = v.pipe(
  v.object({
    id: v.string(),
    startDate: v.date(),
    projectProgress: v.nullable(v.string()),
    growthChanges: v.nullable(v.string()),
    purposeActionGap: v.nullable(v.string()),
    improvements: v.nullable(v.string()),
    notes: v.nullable(v.string()),
    createdAt: v.date(),
  }),
  v.brand('MonthlyReport'),
);

export type MonthlyReport = v.InferOutput<typeof MonthlyReportSchema>;

export const createMonthlyReport = (
  input: v.InferInput<typeof MonthlyReportSchema>,
): MonthlyReport => {
  return v.parse(MonthlyReportSchema, input);
};
