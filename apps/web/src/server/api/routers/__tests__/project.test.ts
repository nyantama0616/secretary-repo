import { describe, expect, it } from 'vitest';

import { createCaller } from '@/server/api';
import { db } from '@/server/infrastructure/db/client';
import { projects } from '@/server/infrastructure/db/schema/projects';

const caller = createCaller({ isAuthenticated: true });
const unauthenticatedCaller = createCaller({ isAuthenticated: false });

const TEST_PROJECTS = [
  {
    name: 'secretary-repo 開発',
    purpose: 'AIを活用した日報・タスク管理アプリを構築する',
    status: 'active' as const,
    deadline: new Date('2026-06-30'),
  },
  {
    name: '読書記録アプリ',
    purpose: '読んだ本の感想を記録し振り返りやすくする',
    status: 'done' as const,
    deadline: null,
  },
];

describe('認証', () => {
  it('未認証の場合、UNAUTHORIZED エラーを返す', async () => {
    await expect(unauthenticatedCaller.project.list()).rejects.toThrow(
      expect.objectContaining({
        code: 'UNAUTHORIZED',
      }),
    );
  });
});

describe('project.list', () => {
  it('プロジェクト一覧を返す', async () => {
    await db.insert(projects).values(TEST_PROJECTS);

    const result = await caller.project.list();

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          name: TEST_PROJECTS[0].name,
          purpose: TEST_PROJECTS[0].purpose,
          status: TEST_PROJECTS[0].status,
          deadline: TEST_PROJECTS[0].deadline,
          createdAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          name: TEST_PROJECTS[1].name,
          purpose: TEST_PROJECTS[1].purpose,
          status: TEST_PROJECTS[1].status,
          deadline: TEST_PROJECTS[1].deadline,
          createdAt: expect.any(Date),
        },
      ]),
    );
  });

  it('プロジェクトが存在しない場合、空配列を返す', async () => {
    const result = await caller.project.list();

    expect(result).toStrictEqual([]);
  });
});

describe('project.detail', () => {
  it('プロジェクトの詳細を返す', async () => {
    const [inserted] = await db
      .insert(projects)
      .values(TEST_PROJECTS[0])
      .returning();

    const result = await caller.project.detail({ id: inserted.id });

    expect(result).toEqual({
      id: inserted.id,
      name: TEST_PROJECTS[0].name,
      purpose: TEST_PROJECTS[0].purpose,
      status: TEST_PROJECTS[0].status,
      deadline: TEST_PROJECTS[0].deadline,
      createdAt: expect.any(Date),
    });
  });

  it('存在しないプロジェクトの場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.project.detail({ id: 'non-existent-id' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});
