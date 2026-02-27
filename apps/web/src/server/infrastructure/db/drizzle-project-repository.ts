import { eq } from 'drizzle-orm';

import { Project } from '@/server/domain/project/project';
import type { ProjectRepository } from '@/server/domain/project/project-repository';
import { db } from '@/server/infrastructure/db/client';
import { projects } from '@/server/infrastructure/db/schema/projects';

export class DrizzleProjectRepository implements ProjectRepository {
  async findAll(): Promise<Project[]> {
    const rows = await db.select().from(projects);
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Project | null> {
    const [row] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return row ? toDomain(row) : null;
  }

  async create(project: Project): Promise<void> {
    await db.insert(projects).values({
      id: project.id,
      name: project.name,
      purpose: project.purpose,
      notes: project.notes,
      status: project.status,
      deadline: project.deadline,
    });
  }

  async update(project: Project): Promise<void> {
    await db
      .update(projects)
      .set({
        name: project.name,
        purpose: project.purpose,
        notes: project.notes,
        status: project.status,
        deadline: project.deadline,
      })
      .where(eq(projects.id, project.id));
  }
}

const toDomain = (row: typeof projects.$inferSelect): Project => {
  return Project.reconstruct({
    id: row.id,
    name: row.name,
    purpose: row.purpose,
    notes: row.notes,
    status: row.status,
    deadline: row.deadline,
    createdAt: row.createdAt,
  });
};
