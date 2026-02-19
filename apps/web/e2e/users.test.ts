import { expect, test } from '@playwright/test';

test.describe('ユーザー管理', () => {
  test('一覧ページを開くと、ユーザーが表示される', async ({ page }) => {
    await page.goto('/users');

    await expect(page.getByText('田中太郎')).toBeVisible();
  });

  test('一覧からユーザーをクリックすると、詳細が表示される', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('link', { name: '田中太郎' }).click();

    await expect(page).toHaveURL(/\/users\/[\w-]+/);
    await expect(page.getByRole('heading', { name: '田中太郎' })).toBeVisible();
    await expect(page.getByText('tanaka@example.com')).toBeVisible();
  });

  test('フォームからユーザーを作成すると、一覧に反映される', async ({ page }) => {
    await page.goto('/users/new');
    await page.getByLabel('名前').fill('テスト太郎');
    await page.getByLabel('メールアドレス').fill('test-taro@example.com');
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page).toHaveURL('/users');
    await expect(page.getByText('テスト太郎')).toBeVisible();
  });

  test('既に存在するメールアドレスで作成すると、エラーが表示される', async ({ page }) => {
    await page.goto('/users/new');
    await page.getByLabel('名前').fill('重複ユーザー');
    await page.getByLabel('メールアドレス').fill('tanaka@example.com');
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page.getByText('User already exists')).toBeVisible();
    await expect(page).toHaveURL('/users/new');
  });
});
