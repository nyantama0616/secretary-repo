import { expect, test } from '@playwright/test';

test.describe('ログイン', () => {
  test('正しい API Key でログインすると、日報一覧にリダイレクトされる', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByLabel('API Key').fill('dev-api-key-change-me');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page).toHaveURL('/daily-reports');
  });

  test('誤った API Key でログインすると、エラーが表示される', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByLabel('API Key').fill('wrong-key');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('API Key が正しくありません')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
