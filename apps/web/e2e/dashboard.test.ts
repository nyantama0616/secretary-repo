import { expect, test } from './fixtures';
import { seed } from './seed';

test.beforeAll(seed);

test.describe('ダッシュボード', () => {
  test('トップページを開くと、今日と明日のタスクが表示される', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'ダッシュボード' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '今日のタスク' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '明日のタスク' }),
    ).toBeVisible();

    await expect(page.getByText('ダッシュボードUIを実装する')).toBeVisible();
    await expect(page.getByText('テストを追加する')).toBeVisible();
    await expect(page.getByText('コードレビュー対応')).toBeVisible();
    await expect(page.getByText('ドキュメント更新')).toBeVisible();
  });

  test('タスクをクリックすると、詳細ページに遷移する', async ({ page }) => {
    await page.goto('/');
    await page.getByText('ダッシュボードUIを実装する').click();

    await expect(
      page.getByRole('heading', { name: 'ダッシュボードUIを実装する' }),
    ).toBeVisible();
  });

  test('タスクを追加すると、一覧に反映される', async ({ page }) => {
    await page.goto('/');

    const inputs = page.getByLabel('新しいタスクのタイトル');
    const todayInput = inputs.first();
    await todayInput.fill('新しいタスク');
    await todayInput.press('Enter');

    await expect(page.getByText('新しいタスク')).toBeVisible();
  });
});
