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

test.describe('週報詳細', () => {
  test('一覧から週報をクリックすると、詳細が表示される', async ({ page }) => {
    await page.goto('/weekly-reports');
    await page
      .getByRole('link', { name: /機能Aの設計を固める/ })
      .click();

    await expect(page).toHaveURL(/\/weekly-reports\/[\w-]+/);
    await expect(
      page.getByRole('heading', { name: /02\/02（月）〜 02\/08（日）/ }),
    ).toBeVisible();
    await expect(
      page.getByText('設計レビューを実施し、API仕様を確定した'),
    ).toBeVisible();
    await expect(page.getByText('機能Aの設計を固める')).toBeVisible();
  });

  test('日報が紐づく週報では、日報一覧が表示される', async ({ page }) => {
    await page.goto('/weekly-reports');
    await page
      .getByRole('link', { name: /テストを充実させる/ })
      .click();

    await expect(
      page.getByRole('heading', { name: '日報' }),
    ).toBeVisible();
    await expect(
      page.getByText('機能Aの主要部分を実装し、集中して作業できた'),
    ).toBeVisible();
    await expect(
      page.getByText('テストの基本を学んだが体調不良で早退した'),
    ).toBeVisible();
  });

  test('目標のみの週報では、サマリーや振り返りセクションが表示されない', async ({
    page,
  }) => {
    await page.goto('/weekly-reports');
    await page
      .getByRole('link', { name: /テストを充実させる/ })
      .click();

    await expect(page.getByText('テストを充実させる')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'サマリー' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: '振り返り' }),
    ).not.toBeVisible();
  });

  test('存在しないIDにアクセスすると、404ページが表示される', async ({
    page,
  }) => {
    const response = await page.goto('/weekly-reports/nonexistent');

    expect(response?.status()).toBe(404);
  });
});
