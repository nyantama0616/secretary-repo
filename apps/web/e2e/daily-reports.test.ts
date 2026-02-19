import { expect, test } from '@playwright/test';

test.describe('日報一覧', () => {
  test('一覧ページを開くと、日報が表示される', async ({ page }) => {
    await page.goto('/daily-reports');

    await expect(
      page.getByRole('heading', { name: '日報一覧' }),
    ).toBeVisible();
    await expect(page.getByText('機能Aの実装を進める')).toBeVisible();
    await expect(page.getByText('テストを書く')).toBeVisible();
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
