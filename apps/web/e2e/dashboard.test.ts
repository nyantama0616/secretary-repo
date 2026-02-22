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

  test('完了済みタスクが未完了タスクより上に表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('日報を書く')).toBeVisible();

    const todaySection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: '今日のタスク' }) });
    const taskLinks = todaySection.locator('a');
    const titles = await taskLinks.allTextContents();

    const doneIndex = titles.findIndex((t) => t.includes('日報を書く'));
    const activeIndex = titles.findIndex((t) =>
      t.includes('ダッシュボードUIを実装する'),
    );
    expect(doneIndex).toBeLessThan(activeIndex);
  });

  test('チェックボックスをクリックすると、タスクが完了になる', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('テストを追加する')).toBeVisible();

    // NOTE: リンクの親（カード div）を基点にチェックボックスを探す
    const card = page.getByRole('link', { name: 'テストを追加する' }).locator('..');
    await card.getByRole('button', { name: 'タスクを完了にする' }).click();

    await expect(card.getByText('完了')).toBeVisible();
  });

  test('バッジをクリックしてステータスを変更すると、反映される', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('ダッシュボードUIを実装する')).toBeVisible();

    const card = page
      .getByRole('link', { name: 'ダッシュボードUIを実装する' })
      .locator('..');
    await card.getByText('着手中').click();

    await page.getByRole('menuitemradio', { name: '延期' }).click();

    await expect(card.getByText('延期')).toBeVisible();
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
