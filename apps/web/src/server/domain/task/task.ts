import * as v from 'valibot';

export const TaskStatusSchema = v.picklist([
  'not_started',
  'in_progress',
  'done',
  'cancelled',
]);

const TaskSchema = v.pipe(
  v.object({
    id: v.string(),
    dailyReportId: v.nullable(v.string()),
    title: v.string(),
    description: v.nullable(v.string()),
    status: TaskStatusSchema,
    sortOrder: v.number(),
    deadline: v.nullable(v.date()),
    estimatedMinutes: v.nullable(v.number()),
    incompletionReason: v.nullable(v.string()),
    createdAt: v.date(),
  }),
  v.brand('Task'),
);

export type Task = v.InferOutput<typeof TaskSchema>;
export type TaskStatus = v.InferOutput<typeof TaskStatusSchema>;

export const createTask = (
  input: v.InferInput<typeof TaskSchema>,
): Task => {
  return v.parse(TaskSchema, input);
};
