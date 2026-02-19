import { expect, test } from '@playwright/test';

test.describe('日報一覧', () => {
  test('一覧ページを開くと、日報が表示される', async ({ page }) => {
    await page.goto('/daily-reports');

    await expect(
      page.getByRole('heading', { name: '日報一覧' }),
    ).toBeVisible();
    await expect(page.getByText('機能Aの主要部分を実装し、集中して作業できた')).toBeVisible();
    await expect(page.getByText('テストの基本を学んだが体調不良で早退した')).toBeVisible();
  });

  test('ヘッダーのナビゲーションから日報一覧に遷移できる', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '日報一覧' }).click();

    await expect(page).toHaveURL('/daily-reports');
    await expect(
      page.getByRole('heading', { name: '日報一覧' }),
    ).toBeVisible();
  });
});

test.describe('日報詳細', () => {
  test('一覧から日報をクリックすると、詳細が表示される', async ({
    page,
  }) => {
    await page.goto('/daily-reports');
    await page
      .getByRole('link', {
        name: /機能Aの主要部分を実装し、集中して作業できた/,
      })
      .click();

    await expect(page).toHaveURL(/\/daily-reports\/[\w-]+/);
    await expect(page.getByText('機能Aの実装を進める')).toBeVisible();
    await expect(
      page.getByText('集中して作業できた', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('休憩を取り忘れた')).toBeVisible();
    await expect(
      page.getByText('ポモドーロテクニックを試してみたい'),
    ).toBeVisible();
    await expect(page.getByText('明日はテストを書く')).toBeVisible();
  });
});
