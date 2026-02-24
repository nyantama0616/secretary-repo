import * as v from 'valibot';

export const ProjectStatusSchema = v.picklist(['active', 'done']);

const ProjectSchema = v.pipe(
  v.object({
    id: v.string(),
    name: v.string(),
    purpose: v.string(),
    notes: v.nullable(v.string()),
    status: ProjectStatusSchema,
    deadline: v.nullable(v.date()),
    createdAt: v.date(),
  }),
  v.brand('Project'),
);

export type Project = v.InferOutput<typeof ProjectSchema>;
export type ProjectStatus = v.InferOutput<typeof ProjectStatusSchema>;

export const createProject = (
  input: v.InferInput<typeof ProjectSchema>,
): Project => {
  return v.parse(ProjectSchema, input);
};
