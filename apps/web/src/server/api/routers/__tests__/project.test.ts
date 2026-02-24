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
          notes: null,
          status: TEST_PROJECTS[0].status,
          deadline: TEST_PROJECTS[0].deadline,
          createdAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          name: TEST_PROJECTS[1].name,
          purpose: TEST_PROJECTS[1].purpose,
          notes: null,
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
      notes: null,
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

describe('project.create', () => {
  it('プロジェクトを作成する', async () => {
    const result = await caller.project.create({
      name: '新プロジェクト',
      purpose: 'テスト用のプロジェクトを作成する',
      deadline: new Date('2026-12-31'),
    });

    expect(result).toEqual({
      id: expect.any(String),
      name: '新プロジェクト',
      purpose: 'テスト用のプロジェクトを作成する',
      notes: null,
      status: 'active',
      deadline: new Date('2026-12-31'),
      createdAt: expect.any(Date),
    });

    const detail = await caller.project.detail({ id: result.id });
    expect(detail.id).toBe(result.id);
    expect(detail.name).toBe('新プロジェクト');
  });

  it('deadline なしでプロジェクトを作成できる', async () => {
    const result = await caller.project.create({
      name: '期限なしプロジェクト',
      purpose: '期限を設定しないプロジェクト',
    });

    expect(result.deadline).toBeNull();
  });
});

describe('project.update', () => {
  it('プロジェクトを更新する', async () => {
    const created = await caller.project.create({
      name: '元の名前',
      purpose: '元の目的',
      deadline: new Date('2026-06-30'),
    });

    await caller.project.update({
      id: created.id,
      name: '変更後の名前',
      purpose: '変更後の目的',
      deadline: new Date('2026-12-31'),
    });

    const detail = await caller.project.detail({ id: created.id });
    expect(detail.name).toBe('変更後の名前');
    expect(detail.purpose).toBe('変更後の目的');
    expect(detail.deadline).toEqual(new Date('2026-12-31'));
  });

  it('notes を更新できる', async () => {
    const created = await caller.project.create({
      name: 'テスト',
      purpose: 'テスト',
    });

    await caller.project.update({
      id: created.id,
      notes: '追加したメモ',
    });

    const detail = await caller.project.detail({ id: created.id });
    expect(detail.notes).toBe('追加したメモ');
  });

  it('notes を null で消去できる', async () => {
    const created = await caller.project.create({
      name: 'テスト',
      purpose: 'テスト',
      notes: '消すメモ',
    });

    await caller.project.update({
      id: created.id,
      notes: null,
    });

    const detail = await caller.project.detail({ id: created.id });
    expect(detail.notes).toBeNull();
  });

  it('一部のフィールドだけ更新できる', async () => {
    const created = await caller.project.create({
      name: '元の名前',
      purpose: '元の目的',
    });

    await caller.project.update({
      id: created.id,
      name: '変更後の名前',
    });

    const detail = await caller.project.detail({ id: created.id });
    expect(detail.name).toBe('変更後の名前');
    expect(detail.purpose).toBe('元の目的');
  });

  it('存在しないプロジェクトの場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.project.update({ id: 'non-existent-id', name: 'test' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});

describe('project.updateStatus', () => {
  it('プロジェクトのステータスを変更する', async () => {
    const created = await caller.project.create({
      name: 'テストプロジェクト',
      purpose: 'ステータス変更テスト',
    });

    expect(created.status).toBe('active');

    await caller.project.updateStatus({
      id: created.id,
      status: 'done',
    });

    const detail = await caller.project.detail({ id: created.id });
    expect(detail.status).toBe('done');
  });

  it('存在しないプロジェクトの場合、NOT_FOUND エラーを返す', async () => {
    await expect(
      caller.project.updateStatus({
        id: 'non-existent-id',
        status: 'done',
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: 'NOT_FOUND',
      }),
    );
  });
});
