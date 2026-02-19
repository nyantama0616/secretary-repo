import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
import { users } from '@/server/infrastructure/db/schema/users';

const caller = createCaller({});

const TEST_USERS = [
  { name: 'テスト太郎', email: 'test-taro@example.com' },
  { name: 'テスト花子', email: 'test-hanako@example.com' },
];

describe('user.list', () => {
  it('ユーザー一覧を返す', async () => {
    await db.insert(users).values(TEST_USERS);

    const result = await caller.user.list();

    expect(result).toHaveLength(TEST_USERS.length);
    expect(result).toEqual(
      expect.arrayContaining(
        TEST_USERS.map((u) => ({
          id: expect.any(String),
          name: u.name,
          email: u.email,
        })),
      ),
    );
  });
});

describe('user.detail', () => {
  const testUser = TEST_USERS[0];

  it('指定したIDのユーザーを返す', async () => {
    const [inserted] = await db
      .insert(users)
      .values(testUser)
      .returning();

    const result = await caller.user.detail({ id: inserted.id });

    expect(result).toStrictEqual({
      id: inserted.id,
      name: testUser.name,
      email: testUser.email,
    });
  });

  it('存在しないIDの場合、NOT_FOUND エラーを返す', async () => {
    const nonExistentId = randomUUID();

    await expect(
      caller.user.detail({ id: nonExistentId }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('user.create', () => {
  const newUser = { name: 'テスト次郎', email: 'test-jiro@example.com' };

  it('ユーザーを作成する', async () => {
    const result = await caller.user.create(newUser);

    expect(result).toStrictEqual({
      id: expect.any(String),
      name: newUser.name,
      email: newUser.email,
    });
  });

  it('同一メールアドレスの場合、CONFLICT エラーを返す', async () => {
    await db.insert(users).values(newUser);

    await expect(caller.user.create(newUser)).rejects.toThrow(
      expect.objectContaining({
        code: 'CONFLICT',
      }),
    );
  });
});
