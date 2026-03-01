import { expect, test } from './fixtures';
import {
  formatMonth,
  LAST_MONTH_START,
  NEXT_MONTH_START,
  seed,
  THIS_MONTH_START,
} from './seed';

test.beforeAll(seed);

test.describe('月報一覧', () => {
  test('一覧ページを開くと、月報が表示される', async ({ page }) => {
    await page.goto('/monthly-reports');

    await expect(
      page.getByRole('heading', { name: '月報一覧' }),
    ).toBeVisible();
    await expect(page.getByText(formatMonth(LAST_MONTH_START))).toBeVisible();
    await expect(page.getByText(formatMonth(THIS_MONTH_START))).toBeVisible();
    await expect(
      page.getByText('サマリーテキスト'),
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

test.describe('月報詳細', () => {
  test('一覧から月報をクリックすると、詳細が表示される', async ({ page }) => {
    await page.goto('/monthly-reports');
    await page
      .getByRole('link', { name: /サマリーテキスト/ })
      .click();

    await expect(page).toHaveURL(/\/monthly-reports\/[\w-]+/);
    await expect(
      page.getByRole('heading', { name: formatMonth(LAST_MONTH_START) }),
    ).toBeVisible();
    await expect(
      page.getByText('サマリーテキスト'),
    ).toBeVisible();
  });

  test('振り返りがある月報では、振り返りセクションが表示される', async ({
    page,
  }) => {
    await page.goto('/monthly-reports');
    await page
      .getByRole('link', { name: /サマリーテキスト/ })
      .click();

    await expect(
      page.getByRole('heading', { name: '振り返り' }),
    ).toBeVisible();
    await expect(
      page.getByText('振り返りテキストA'),
    ).toBeVisible();
    await expect(
      page.getByText('振り返りテキストB'),
    ).toBeVisible();
    await expect(
      page.getByText('振り返りテキストC'),
    ).toBeVisible();
  });

  test('目標のみの月報では、振り返りセクションが表示されない', async ({
    page,
  }) => {
    await page.goto('/monthly-reports');
    await page.getByRole('link', { name: new RegExp(formatMonth(THIS_MONTH_START)) }).click();

    await expect(
      page.getByRole('heading', { name: formatMonth(THIS_MONTH_START) }),
    ).toBeVisible();
    await expect(
      page.getByText('月報の目標B'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '振り返り' }),
    ).not.toBeVisible();
  });

  test('月報に紐づく週報が一覧表示される', async ({ page }) => {
    await page.goto('/monthly-reports');
    await page
      .getByRole('link', { name: /サマリーテキスト/ })
      .click();

    await expect(
      page.getByRole('heading', { name: '週報' }),
    ).toBeVisible();
    await expect(page.getByText('週報の目標A')).toBeVisible();
    await expect(page.getByText('週報の目標B')).toBeVisible();
  });

  test('存在しないIDにアクセスすると、404ページが表示される', async ({
    page,
  }) => {
    const response = await page.goto('/monthly-reports/nonexistent');

    expect(response?.status()).toBe(404);
  });
});

test.describe('月報作成', () => {
  test('フォームから月報を作成すると、一覧に反映される', async ({ page }) => {
    await page.goto('/monthly-reports/new');
    await page.getByLabel('月').click();
    await page.getByRole('option', { name: formatMonth(NEXT_MONTH_START) }).click();
    await page.getByLabel('目標').fill('目標テキスト');
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page).toHaveURL('/monthly-reports');
    await expect(page.getByText(formatMonth(NEXT_MONTH_START))).toBeVisible();
  });

  test('一覧の「月報を作成」ボタンから作成ページに遷移できる', async ({
    page,
  }) => {
    await page.goto('/monthly-reports');
    await page.getByRole('link', { name: '月報を作成' }).click();

    await expect(page).toHaveURL('/monthly-reports/new');
    await expect(
      page.getByRole('heading', { name: '月報作成' }),
    ).toBeVisible();
  });

  test('同じ月の月報が存在する場合、エラーが表示される', async ({ page }) => {
    await page.goto('/monthly-reports/new');
    await page.getByLabel('月').click();
    await page.getByRole('option', { name: formatMonth(THIS_MONTH_START) }).click();
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page.getByText(/の月報はすでに存在します/)).toBeVisible();
    await expect(page).toHaveURL('/monthly-reports/new');
  });
});
