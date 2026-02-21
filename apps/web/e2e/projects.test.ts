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

  test('プロジェクトのステータスが表示される', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByText('進行中')).toBeVisible();
    await expect(page.getByText('完了')).toBeVisible();
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

test.describe('プロジェクト作成', () => {
  test('フォームに入力して作成すると、一覧に反映される', async ({ page }) => {
    await page.goto('/projects');
    await page.getByRole('link', { name: '新規作成' }).click();

    await expect(
      page.getByRole('heading', { name: 'プロジェクト作成' }),
    ).toBeVisible();

    await page.getByLabel('プロジェクト名').fill('新しいプロジェクト');
    await page.getByLabel('目的').fill('テスト用のプロジェクトである');
    await page.getByLabel('期限').fill('2026-12-31');
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page).toHaveURL('/projects');
    await expect(page.getByText('新しいプロジェクト')).toBeVisible();
  });

  test('必須項目が未入力で作成すると、バリデーションエラーが表示される', async ({
    page,
  }) => {
    await page.goto('/projects/new');
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page.getByText('プロジェクト名は必須です')).toBeVisible();
    await expect(page.getByText('目的は必須です')).toBeVisible();
  });
});

test.describe('プロジェクト編集', () => {
  test('編集ボタンをクリックすると、編集ページに遷移する', async ({
    page,
  }) => {
    await page.goto('/projects');
    await page.getByText('secretary-repo').click();
    await page.getByRole('link', { name: '編集' }).click();

    await expect(
      page.getByRole('heading', { name: 'プロジェクトを編集' }),
    ).toBeVisible();
  });

  test('基本情報を編集して保存すると、詳細ページに反映される', async ({
    page,
  }) => {
    await page.goto('/projects');
    await page.getByText('secretary-repo').click();
    await page.getByRole('link', { name: '編集' }).click();

    await page.getByLabel('プロジェクト名').fill('更新後のプロジェクト');
    await page.getByLabel('目的').fill('更新後の目的');
    await page.getByRole('button', { name: '保存する' }).click();

    await expect(
      page.getByRole('heading', { name: '更新後のプロジェクト' }),
    ).toBeVisible();
    await expect(page.getByText('更新後の目的')).toBeVisible();
  });

  test('ステータスを変更して保存すると、詳細ページに反映される', async ({
    page,
  }) => {
    await page.goto('/projects');
    await page.getByText('更新後のプロジェクト').click();
    await page.getByRole('link', { name: '編集' }).click();

    await page.getByLabel('ステータス').click();
    await page.getByRole('option', { name: '完了' }).click();
    await page.getByRole('button', { name: '保存する' }).click();

    await expect(
      page.getByRole('heading', { name: '更新後のプロジェクト' }),
    ).toBeVisible();
    await expect(page.getByText('完了', { exact: true })).toBeVisible();
  });
});
