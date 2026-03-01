import { expect, test } from './fixtures';
import { formatDate, PROJECT_DEADLINE, seed } from './seed';

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

    await expect(page.getByText('今日タスクX')).toBeVisible();
    await expect(page.getByText('今日タスクY')).toBeVisible();
    await expect(page.getByText('明日タスクX')).toBeVisible();
    await expect(page.getByText('明日タスクY')).toBeVisible();
  });

  test('今日の目標と振り返りが表示される', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: '今日の目標' }),
    ).toBeVisible();
    await expect(page.getByText('目標テキスト')).toBeVisible();

    await expect(
      page.getByRole('heading', { name: '振り返り' }),
    ).toBeVisible();
    await expect(page.getByText('箇条書き')).toBeVisible();
  });

  test('編集ボタンをクリックすると、日報編集ページに遷移する', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: '今日の目標' }),
    ).toBeVisible();
    await page.getByRole('link', { name: '編集' }).click();

    await expect(
      page.getByRole('heading', { name: '日報編集' }),
    ).toBeVisible();
  });

  test('プロジェクト一覧が表示される', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'プロジェクト' }),
    ).toBeVisible();
    await expect(page.getByText('プロジェクトA')).toBeVisible();
    await expect(page.getByText('プロジェクトB')).toBeVisible();
    await expect(page.getByText('進行中')).toBeVisible();
    await expect(page.getByText(`期限: ${formatDate(PROJECT_DEADLINE)}`)).toBeVisible();
  });

  test('プロジェクトをクリックすると、詳細ページに遷移する', async ({
    page,
  }) => {
    await page.goto('/');

    const projectSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'プロジェクト' }) });
    await projectSection.getByText('プロジェクトA').click();

    await expect(
      page.getByRole('heading', { name: 'プロジェクトA' }),
    ).toBeVisible();
  });

  test('次のタスクにファーストアクションが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('今日タスクX')).toBeVisible();

    await expect(page.getByText('→ アクションA')).toBeVisible();
    await expect(
      page.getByText('→ アクションB'),
    ).not.toBeVisible();
  });

  test('タスクをホバーすると、そのタスクのファーストアクションが表示される', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('今日タスクX')).toBeVisible();

    await page.getByText('今日タスクY').hover();

    await expect(page.getByText('→ アクションB')).toBeVisible();
    await expect(
      page.getByText('→ アクションA'),
    ).not.toBeVisible();
  });

  test('完了済みタスクが未完了タスクより上に表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('今日タスクZ')).toBeVisible();

    const todaySection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: '今日のタスク' }) });
    const taskLinks = todaySection.locator('a');
    const titles = await taskLinks.allTextContents();

    const doneIndex = titles.findIndex((t) => t.includes('今日タスクZ'));
    const activeIndex = titles.findIndex((t) =>
      t.includes('今日タスクX'),
    );
    expect(doneIndex).toBeLessThan(activeIndex);
  });

  test('チェックボックスをクリックすると、タスクが完了になる', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('今日タスクY')).toBeVisible();

    // NOTE: リンクの親（カード div）を基点にチェックボックスを探す
    const card = page.getByRole('link', { name: '今日タスクY' }).locator('..');
    await card.getByRole('button', { name: 'タスクを完了にする' }).click();

    await expect(card.getByText('完了')).toBeVisible();
  });

  test('バッジをクリックしてステータスを変更すると、反映される', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('今日タスクX')).toBeVisible();

    const card = page
      .getByRole('link', { name: '今日タスクX' })
      .locator('..');
    await card.getByText('着手中').click();

    await page.getByRole('menuitemradio', { name: '中止' }).click();

    await expect(card.getByText('中止')).toBeVisible();
  });

  test('タスクをクリックすると、詳細ページに遷移する', async ({ page }) => {
    await page.goto('/');
    await page.getByText('今日タスクX').click();

    await expect(
      page.getByRole('heading', { name: '今日タスクX' }),
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
