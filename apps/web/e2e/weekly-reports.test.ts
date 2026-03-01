import { expect, test } from './fixtures';
import { seed } from './seed';

test.beforeAll(seed);

test.describe('週報一覧', () => {
  test('一覧ページを開くと、週報が表示される', async ({ page }) => {
    await page.goto('/weekly-reports');

    await expect(
      page.getByRole('heading', { name: '週報一覧' }),
    ).toBeVisible();
    await expect(
      page.getByText('02/02（月）〜 02/08（日）'),
    ).toBeVisible();
    await expect(
      page.getByText('02/16（月）〜 02/22（日）'),
    ).toBeVisible();
    await expect(page.getByText('機能Aの設計を固める')).toBeVisible();
    await expect(page.getByText('テストを充実させる')).toBeVisible();
  });

  test('ヘッダーのナビゲーションから週報一覧に遷移できる', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '週報一覧' }).click();

    await expect(page).toHaveURL('/weekly-reports');
    await expect(
      page.getByRole('heading', { name: '週報一覧' }),
    ).toBeVisible();
  });
});
