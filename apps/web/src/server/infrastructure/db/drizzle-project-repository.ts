import { eq } from 'drizzle-orm';

import type { Project } from '@/server/domain/project/project';
import { createProject } from '@/server/domain/project/project';
import type { ProjectRepository } from '@/server/domain/project/project-repository';
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
