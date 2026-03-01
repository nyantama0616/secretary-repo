import { expect, test } from './fixtures';
import { DAYS_AGO_4, formatDate, seed, TASK_DEADLINE } from './seed';

test.beforeAll(seed);

test.describe('タスク一覧', () => {
  test('一覧ページを開くと、タスクが表示される', async ({ page }) => {
    await page.goto('/tasks');

    await expect(
      page.getByRole('heading', { name: 'タスク一覧' }),
    ).toBeVisible();
    await expect(page.getByText('タスクA')).toBeVisible();
    await expect(page.getByText('タスクB')).toBeVisible();
  });

  test('タスクのステータスと日付が表示される', async ({ page }) => {
    await page.goto('/tasks');

    await expect(page.getByText('未着手').first()).toBeVisible();
    await expect(page.getByText('完了').first()).toBeVisible();
    await expect(page.getByText(formatDate(DAYS_AGO_4))).toBeVisible();
  });

  test('ヘッダーのナビゲーションからタスク一覧に遷移できる', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'タスク一覧' }).click();

    await expect(page).toHaveURL('/tasks');
    await expect(
      page.getByRole('heading', { name: 'タスク一覧' }),
    ).toBeVisible();
  });

  test('タスクをクリックすると、詳細ページに遷移する', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByText('タスクA').click();

    await expect(
      page.getByRole('heading', { name: 'タスクA' }),
    ).toBeVisible();
  });
});

test.describe('タスク詳細', () => {
  test('タスクの詳細情報が表示される', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByText('タスクA').click();

    await expect(
      page.getByRole('heading', { name: 'タスクA' }),
    ).toBeVisible();
    await expect(page.getByText('未着手')).toBeVisible();
    await expect(
      page.getByText('ファーストアクション'),
    ).toBeVisible();
    await expect(page.getByText('説明テキスト')).toBeVisible();
    await expect(page.getByText('太字テキスト')).toBeVisible();
    await expect(page.getByText('コードテキスト')).toBeVisible();
    await expect(page.getByText('120分')).toBeVisible();
    await expect(page.getByText(formatDate(TASK_DEADLINE))).toBeVisible();
    const projectLink = page.getByRole('link', { name: 'プロジェクトA' });
    await expect(projectLink).toBeVisible();
    await projectLink.click();

    await expect(
      page.getByRole('heading', { name: 'プロジェクトA' }),
    ).toBeVisible();
  });

  test('存在しないタスクにアクセスすると、404ページが表示される', async ({
    page,
  }) => {
    const response = await page.goto('/tasks/nonexistent-id');

    expect(response?.status()).toBe(404);
  });

  test('編集ボタンをクリックすると、編集ページに遷移する', async ({
    page,
  }) => {
    await page.goto('/tasks');
    await page.getByText('タスクA').click();
    await page.getByRole('link', { name: '編集' }).click();

    await expect(
      page.getByRole('heading', { name: 'タスクを編集' }),
    ).toBeVisible();
  });
});

test.describe('タスク編集', () => {
  test('基本情報を編集して保存すると、詳細ページに反映される', async ({
    page,
  }) => {
    await page.goto('/tasks');
    await page.getByText('タスクA').click();
    await page.getByRole('link', { name: '編集' }).click();

    await page.getByLabel('タイトル').fill('更新後のタイトル');
    await page.getByLabel('ファーストアクション').fill('READMEを読む');
    await page.getByLabel('説明').fill('更新後の説明');
    await page.getByLabel('メモ').fill('更新後のメモ');
    await page.getByRole('button', { name: '保存する' }).click();

    await expect(
      page.getByRole('heading', { name: '更新後のタイトル' }),
    ).toBeVisible();
    await expect(page.getByText('READMEを読む')).toBeVisible();
    await expect(page.getByText('更新後の説明')).toBeVisible();
    await expect(page.getByText('更新後のメモ')).toBeVisible();
  });
});

test.describe('タスク削除', () => {
  test('編集画面からタスクを削除すると、一覧から消える', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByText('タスクB').click();
    await page.getByRole('link', { name: '編集' }).click();
    await page.getByRole('button', { name: '削除' }).click();

    await expect(
      page.getByRole('heading', { name: 'タスクを削除しますか？' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '削除する' }).click();

    await expect(page).toHaveURL('/tasks');
    await expect(page.getByText('タスクB')).not.toBeVisible();
  });
});
