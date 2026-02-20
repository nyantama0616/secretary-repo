import { expect, test } from './fixtures';

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
});
