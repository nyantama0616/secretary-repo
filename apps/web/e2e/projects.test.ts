import { expect, test } from './fixtures';
import { seed } from './seed';

test.beforeAll(seed);

test.describe('プロジェクト一覧', () => {
  test('一覧ページを開くと、プロジェクトが表示される', async ({ page }) => {
    await page.goto('/projects');

    await expect(
      page.getByRole('heading', { name: 'プロジェクト一覧' }),
    ).toBeVisible();
    await expect(page.getByText('secretary-repo')).toBeVisible();
    await expect(page.getByText('読書記録アプリ')).toBeVisible();
  });

  test('プロジェクトのステータスと目的が表示される', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByText('進行中')).toBeVisible();
    await expect(page.getByText('完了')).toBeVisible();
    await expect(
      page.getByText('AI を活用した日報・タスク管理アプリを開発する'),
    ).toBeVisible();
  });

  test('期限があるプロジェクトは期限が表示される', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByText('期限: 2026/06/30（火）')).toBeVisible();
  });

  test('ヘッダーのナビゲーションからプロジェクト一覧に遷移できる', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'プロジェクト一覧' }).click();

    await expect(page).toHaveURL('/projects');
    await expect(
      page.getByRole('heading', { name: 'プロジェクト一覧' }),
    ).toBeVisible();
  });

  test('プロジェクトをクリックすると、詳細ページに遷移する', async ({
    page,
  }) => {
    await page.goto('/projects');
    await page.getByText('secretary-repo').click();

    await expect(
      page.getByRole('heading', { name: 'secretary-repo' }),
    ).toBeVisible();
  });
});

test.describe('プロジェクト詳細', () => {
  test('プロジェクトの詳細情報が表示される', async ({ page }) => {
    await page.goto('/projects');
    await page.getByText('secretary-repo').click();

    await expect(
      page.getByRole('heading', { name: 'secretary-repo' }),
    ).toBeVisible();
    await expect(page.getByText('進行中')).toBeVisible();
    await expect(
      page.getByText('AI を活用した日報・タスク管理アプリを開発する'),
    ).toBeVisible();
    await expect(page.getByText('2026/06/30（火）')).toBeVisible();
  });

  test('存在しないプロジェクトにアクセスすると、404ページが表示される', async ({
    page,
  }) => {
    const response = await page.goto('/projects/nonexistent-id');

    expect(response?.status()).toBe(404);
  });
});
