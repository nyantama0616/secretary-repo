import { expect, test } from './fixtures';
import {
  formatWeekRange,
  LAST_MONTH_MONDAY_A,
  LAST_MONTH_MONDAY_B,
  seed,
} from './seed';

test.beforeAll(seed);

test.describe('週報一覧', () => {
  test('一覧ページを開くと、週報が表示される', async ({ page }) => {
    await page.goto('/weekly-reports');

    await expect(
      page.getByRole('heading', { name: '週報一覧' }),
    ).toBeVisible();
    await expect(
      page.getByText(formatWeekRange(LAST_MONTH_MONDAY_A)),
    ).toBeVisible();
    await expect(
      page.getByText(formatWeekRange(LAST_MONTH_MONDAY_B)),
    ).toBeVisible();
    await expect(page.getByText('週報の目標A')).toBeVisible();
    await expect(page.getByText('週報の目標B')).toBeVisible();
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
      .getByRole('link', { name: /週報の目標A/ })
      .click();

    await expect(page).toHaveURL(/\/weekly-reports\/[\w-]+/);
    await expect(
      page.getByRole('heading', { name: formatWeekRange(LAST_MONTH_MONDAY_A) }),
    ).toBeVisible();
    await expect(
      page.getByText('サマリーテキスト'),
    ).toBeVisible();
    await expect(page.getByText('週報の目標A')).toBeVisible();
  });

  test('日報が紐づく週報では、日報一覧が表示される', async ({ page }) => {
    await page.goto('/weekly-reports');
    await page
      .getByRole('link', { name: /週報の目標B/ })
      .click();

    await expect(
      page.getByRole('heading', { name: '日報' }),
    ).toBeVisible();
    await expect(
      page.getByText('サマリーA'),
    ).toBeVisible();
    await expect(
      page.getByText('サマリーB'),
    ).toBeVisible();
  });

  test('目標のみの週報では、サマリーや振り返りセクションが表示されない', async ({
    page,
  }) => {
    await page.goto('/weekly-reports');
    await page
      .getByRole('link', { name: /週報の目標B/ })
      .click();

    await expect(page.getByText('週報の目標B')).toBeVisible();
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

test.describe('週報編集', () => {
  test('詳細ページから編集ページに遷移すると、既存の値がプリフィルされる', async ({
    page,
  }) => {
    await page.goto('/weekly-reports');
    await page
      .getByRole('link', { name: /週報の目標A/ })
      .click();
    await page.getByRole('link', { name: '編集' }).click();

    await expect(page).toHaveURL(/\/weekly-reports\/[\w-]+\/edit/);
    await expect(
      page.getByRole('heading', { name: '週報編集' }),
    ).toBeVisible();
    await expect(page.getByLabel('目標')).toHaveValue(
      '週報の目標A',
    );
    await expect(page.getByLabel('サマリー')).toHaveValue(
      'サマリーテキスト',
    );
  });

  test('フォームを編集して更新すると、詳細ページに反映される', async ({
    page,
  }) => {
    await page.goto('/weekly-reports');
    await page
      .getByRole('link', { name: /週報の目標B/ })
      .click();
    await page.getByRole('link', { name: '編集' }).click();

    await page.getByLabel('サマリー').fill('編集後のサマリー');
    await page.getByRole('button', { name: '更新' }).click();

    await expect(page).toHaveURL(/\/weekly-reports\/[\w-]+$/);
    await expect(
      page.getByText('編集後のサマリー'),
    ).toBeVisible();
  });
});
