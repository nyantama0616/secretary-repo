import { eq } from 'drizzle-orm';

import type { User } from '@/server/domain/user/user';
import { createUser } from '@/server/domain/user/user';
import type { UserRepository } from '@/server/domain/user/user-repository';
import { db } from '@/server/infrastructure/db/client';
import { users } from '@/server/infrastructure/db/schema/users';

export class DrizzleUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const rows = await db.select().from(users);
    return rows.map(toUser);
  }

  async findById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0] ? toUser(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] ? toUser(rows[0]) : null;
  }

  async save(user: User): Promise<void> {
    await db.insert(users).values({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }
}

const toUser = (row: typeof users.$inferSelect): User => {
  return createUser({ id: row.id, name: row.name, email: row.email });
};
