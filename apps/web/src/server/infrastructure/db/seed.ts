import { sql } from 'drizzle-orm';

import { db } from '@/server/infrastructure/db/client';
import { users } from '@/server/infrastructure/db/schema/users';

const SEED_USERS = [
  { name: '田中太郎', email: 'tanaka@example.com' },
  { name: '佐藤花子', email: 'sato@example.com' },
  { name: '鈴木一郎', email: 'suzuki@example.com' },
];

const main = async () => {
  console.log('Seeding...');
  await db.transaction(async (tx) => {
    // NOTE: TRUNCATE CASCADE により外部キー制約の順序を気にせず全テーブルを削除できる
    await tx.execute(sql`TRUNCATE ${users} CASCADE`);

    await tx.insert(users).values(SEED_USERS);
  });
  console.log('Seeding completed.');
  process.exit(0);
};

main().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
