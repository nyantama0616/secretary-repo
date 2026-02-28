import * as v from 'valibot';

import { omitUndefined } from '@/lib/omit-undefined';

export const TaskStatusSchema = v.picklist([
  'not_started',
  'in_progress',
  'done',
  'cancelled',
  'deferred',
]);

export type TaskStatus = v.InferOutput<typeof TaskStatusSchema>;

const TaskSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  dailyReportId: v.nullable(v.string()),
  projectId: v.nullable(v.string()),
  title: v.string(),
  description: v.nullable(v.string()),
  status: TaskStatusSchema,
  sortOrder: v.pipe(v.number(), v.minValue(0)),
  deadline: v.nullable(v.date()),
  estimatedMinutes: v.nullable(v.number()),
  incompletionReason: v.nullable(v.string()),
  firstAction: v.nullable(v.string()),
  notes: v.nullable(v.string()),
  carriedOverFromId: v.nullable(v.string()),
  createdAt: v.date(),
});

type TaskParams = v.InferInput<typeof TaskSchema>;

type CreateTaskParams = {
  id: string;
  title: string;
  description: string | null;
  dailyReportId: string | null;
  projectId: string | null;
  deadline: Date | null;
  estimatedMinutes: number | null;
  firstAction: string | null;
  notes: string | null;
  carriedOverFromId: string | null;
  createdAt: Date;
};

type UpdateTaskParams = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;

  deadline?: Date | null;
  estimatedMinutes?: number | null;
  dailyReportId?: string | null;
  projectId?: string | null;
  incompletionReason?: string | null;
  firstAction?: string | null;
  notes?: string | null;
};

export class Task {
  readonly id: string;
  readonly dailyReportId: string | null;
  readonly projectId: string | null;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly sortOrder: number;
  readonly deadline: Date | null;
  readonly estimatedMinutes: number | null;
  readonly incompletionReason: string | null;
  readonly firstAction: string | null;
  readonly notes: string | null;
  readonly carriedOverFromId: string | null;
  readonly createdAt: Date;

  private constructor(params: TaskParams) {
    const validated = v.parse(TaskSchema, params);
    this.id = validated.id;
    this.dailyReportId = validated.dailyReportId;
    this.projectId = validated.projectId;
    this.title = validated.title;
    this.description = validated.description;
    this.status = validated.status;
    this.sortOrder = validated.sortOrder;
    this.deadline = validated.deadline;
    this.estimatedMinutes = validated.estimatedMinutes;
    this.incompletionReason = validated.incompletionReason;
    this.firstAction = validated.firstAction;
    this.notes = validated.notes;
    this.carriedOverFromId = validated.carriedOverFromId;
    this.createdAt = validated.createdAt;
  }

  static create(params: CreateTaskParams): Task {
    return new Task({
      ...params,
      status: 'not_started',
      sortOrder: 0,
      incompletionReason: null,
    });
  }

  static reconstruct(params: TaskParams): Task {
    return new Task(params);
  }

  update(params: UpdateTaskParams): Task {
    return new Task({ ...this, ...omitUndefined(params) });
  }

  withSortOrder(sortOrder: number): Task {
    return new Task({ ...this, sortOrder });
  }
}
