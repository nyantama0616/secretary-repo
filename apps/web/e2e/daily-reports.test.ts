import { expect, test } from './fixtures';
import { DAYS_AGO_4, DAYS_AGO_7, seed, toDateStr } from './seed';

test.beforeAll(seed);

test.describe('日報一覧', () => {
  test('一覧ページを開くと、日報が表示される', async ({ page }) => {
    await page.goto('/daily-reports');

    await expect(
      page.getByRole('heading', { name: '日報一覧' }),
    ).toBeVisible();
    await expect(page.getByText('サマリーA')).toBeVisible();
    await expect(page.getByText('サマリーB')).toBeVisible();
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
        name: /サマリーA/,
      })
      .click();

    await expect(page).toHaveURL(/\/daily-reports\/[\w-]+/);
    await expect(page.getByText('目標テキスト')).toBeVisible();
    await expect(
      page.getByText('振り返りテキスト'),
    ).toBeVisible();
    await expect(page.getByText('tRPC ルーターを実装する')).toBeVisible();
  });

  test('存在しないIDにアクセスすると、404ページが表示される', async ({
    page,
  }) => {
    const response = await page.goto('/daily-reports/nonexistent');

    expect(response?.status()).toBe(404);
  });
});

test.describe('日報編集', () => {
  test('編集フォームに既存の値がプリフィルされている', async ({ page }) => {
    await page.goto('/daily-reports');
    await page
      .getByRole('link', {
        name: /サマリーC/,
      })
      .click();
    await page.getByRole('link', { name: '編集' }).click();

    await expect(page.getByLabel('目標')).toHaveValue('目標テキスト');
  });

  test('詳細画面から編集ページに遷移し、日報を更新すると、詳細に反映される', async ({
    page,
  }) => {
    await page.goto('/daily-reports');
    await page
      .getByRole('link', {
        name: /サマリーC/,
      })
      .click();
    await page.getByRole('link', { name: '編集' }).click();

    await expect(
      page.getByRole('heading', { name: '日報編集' }),
    ).toBeVisible();

    await page.getByLabel('サマリー').fill('編集後のサマリー');
    await page.getByRole('button', { name: '更新' }).click();

    await expect(page).toHaveURL(/\/daily-reports\/[\w-]+$/);
    await expect(page.getByText('編集後のサマリー')).toBeVisible();
  });
});

test.describe('日報作成', () => {
  test('フォームから日報を作成すると、一覧に反映される', async ({
    page,
  }) => {
    await page.goto('/daily-reports/new');
    await page.getByLabel('日付').fill(toDateStr(DAYS_AGO_7));
    await page.getByLabel('目標').fill('リファクタリング');
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page).toHaveURL('/daily-reports');
  });

  test('一覧の「日報を作成」ボタンから作成ページに遷移できる', async ({
    page,
  }) => {
    await page.goto('/daily-reports');
    await page.getByRole('link', { name: '日報を作成' }).click();

    await expect(page).toHaveURL('/daily-reports/new');
    await expect(
      page.getByRole('heading', { name: '日報作成' }),
    ).toBeVisible();
  });

  test('同じ日付の日報が存在する場合、エラーが表示される', async ({
    page,
  }) => {
    await page.goto('/daily-reports/new');
    await page.getByLabel('日付').fill(toDateStr(DAYS_AGO_4));
    await page.getByRole('button', { name: '作成' }).click();

    await expect(
      page.getByText(/の日報はすでに存在します/),
    ).toBeVisible();
    await expect(page).toHaveURL('/daily-reports/new');
  });
});
