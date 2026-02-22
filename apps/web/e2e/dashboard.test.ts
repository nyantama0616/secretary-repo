import { expect, test } from './fixtures';

test.describe('ダッシュボード', () => {
  test('トップページを開くと、ダッシュボードが表示される', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'ダッシュボード' }),
    ).toBeVisible();
  });
});
