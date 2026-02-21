import { expect, test } from './fixtures';

test.describe('月報一覧', () => {
  test('一覧ページを開くと、月報が表示される', async ({ page }) => {
    await page.goto('/monthly-reports');

    await expect(
      page.getByRole('heading', { name: '月報一覧' }),
    ).toBeVisible();
    await expect(page.getByText('2026年02月')).toBeVisible();
    await expect(page.getByText('2026年01月')).toBeVisible();
    await expect(
      page.getByText('新機能の開発を進めた月だった'),
    ).toBeVisible();
  });

  test('ヘッダーのナビゲーションから月報一覧に遷移できる', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '月報一覧' }).click();

    await expect(page).toHaveURL('/monthly-reports');
    await expect(
      page.getByRole('heading', { name: '月報一覧' }),
    ).toBeVisible();
  });
});
