import { expect, test } from './fixtures';
import { seed } from './seed';

test.beforeAll(seed);

test.describe('タスク一覧', () => {
  test('一覧ページを開くと、タスクが表示される', async ({ page }) => {
    await page.goto('/tasks');

    await expect(
      page.getByRole('heading', { name: 'タスク一覧' }),
    ).toBeVisible();
    await expect(page.getByText('tRPC ルーターを実装する')).toBeVisible();
    await expect(page.getByText('テストを書く')).toBeVisible();
  });

  test('タスクのステータスと日付が表示される', async ({ page }) => {
    await page.goto('/tasks');

    await expect(page.getByText('未着手')).toBeVisible();
    await expect(page.getByText('完了')).toBeVisible();
    await expect(page.getByText('2026/02/17（火）')).toBeVisible();
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
    await page.getByText('tRPC ルーターを実装する').click();

    await expect(
      page.getByRole('heading', { name: 'tRPC ルーターを実装する' }),
    ).toBeVisible();
  });
});

test.describe('タスク詳細', () => {
  test('タスクの詳細情報が表示される', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByText('tRPC ルーターを実装する').click();

    await expect(
      page.getByRole('heading', { name: 'tRPC ルーターを実装する' }),
    ).toBeVisible();
    await expect(page.getByText('未着手')).toBeVisible();
    await expect(page.getByText('タスク一覧APIを実装する')).toBeVisible();
    await expect(page.getByText('120分')).toBeVisible();
    await expect(page.getByText('2026/02/20（金）')).toBeVisible();
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
    await page.getByText('tRPC ルーターを実装する').click();
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
    await page.getByText('tRPC ルーターを実装する').click();
    await page.getByRole('link', { name: '編集' }).click();

    await page.getByLabel('タイトル').fill('更新後のタイトル');
    await page.getByLabel('説明').fill('更新後の説明');
    await page.getByRole('button', { name: '保存する' }).click();

    await expect(
      page.getByRole('heading', { name: '更新後のタイトル' }),
    ).toBeVisible();
    await expect(page.getByText('更新後の説明')).toBeVisible();
  });
});

test.describe('タスク削除', () => {
  test('編集画面からタスクを削除すると、一覧から消える', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByText('テストを書く').click();
    await page.getByRole('link', { name: '編集' }).click();
    await page.getByRole('button', { name: '削除' }).click();

    await expect(
      page.getByRole('heading', { name: 'タスクを削除しますか？' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '削除する' }).click();

    await expect(page).toHaveURL('/tasks');
    await expect(page.getByText('テストを書く')).not.toBeVisible();
  });
});
