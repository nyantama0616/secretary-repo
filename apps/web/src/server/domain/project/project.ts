import * as v from 'valibot';

import { omitUndefined } from '@/lib/omit-undefined';

export const ProjectStatusSchema = v.picklist(['active', 'done']);

export type ProjectStatus = v.InferOutput<typeof ProjectStatusSchema>;

const ProjectSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  name: v.string(),
  purpose: v.string(),
  notes: v.nullable(v.string()),
  status: ProjectStatusSchema,
  deadline: v.nullable(v.date()),
  createdAt: v.date(),
});

type ProjectParams = v.InferInput<typeof ProjectSchema>;

type CreateProjectParams = {
  id: string;
  name: string;
  purpose: string;
  notes: string | null;
  deadline: Date | null;
  createdAt: Date;
};

type UpdateProjectParams = {
  name?: string;
  purpose?: string;
  notes?: string | null;
  status?: ProjectStatus;
  deadline?: Date | null;
};

export class Project {
  readonly id: string;
  readonly name: string;
  readonly purpose: string;
  readonly notes: string | null;
  readonly status: ProjectStatus;
  readonly deadline: Date | null;
  readonly createdAt: Date;

  private constructor(params: ProjectParams) {
    const validated = v.parse(ProjectSchema, params);
    this.id = validated.id;
    this.name = validated.name;
    this.purpose = validated.purpose;
    this.notes = validated.notes;
    this.status = validated.status;
    this.deadline = validated.deadline;
    this.createdAt = validated.createdAt;
  }

  static create(params: CreateProjectParams): Project {
    return new Project({ ...params, status: 'active' });
  }

  static reconstruct(params: ProjectParams): Project {
    return new Project(params);
  }

  update(params: UpdateProjectParams): Project {
    return new Project({ ...this, ...omitUndefined(params) });
  }
}
