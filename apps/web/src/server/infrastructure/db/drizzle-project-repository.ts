import { eq } from 'drizzle-orm';

import type { Project, ProjectStatus } from '@/server/domain/project/project';
import { createProject } from '@/server/domain/project/project';
import type {
  ProjectRepository,
  ProjectUpdatableFields,
} from '@/server/domain/project/project-repository';
import { db } from '@/server/infrastructure/db/client';
import { projects } from '@/server/infrastructure/db/schema/projects';

export class DrizzleProjectRepository implements ProjectRepository {
  async findAll(): Promise<Project[]> {
    const rows = await db.select().from(projects);
    return rows.map(toProject);
  }

  async findById(id: string): Promise<Project | null> {
    const [row] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return row ? toProject(row) : null;
  }

  async save(project: Project): Promise<void> {
    await db.insert(projects).values({
      id: project.id,
      name: project.name,
      purpose: project.purpose,
      status: project.status,
      deadline: project.deadline,
    });
  }

  async update(id: string, fields: ProjectUpdatableFields): Promise<void> {
    await db.update(projects).set(fields).where(eq(projects.id, id));
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<void> {
    await db
      .update(projects)
      .set({ status })
      .where(eq(projects.id, id));
  }
}

const toProject = (row: typeof projects.$inferSelect): Project => {
  return createProject({
    id: row.id,
    name: row.name,
    purpose: row.purpose,
    status: row.status,
    deadline: row.deadline,
    createdAt: row.createdAt,
  });
};
