import { expect, test } from './fixtures';

test.describe('月報一覧', () => {
  test('一覧ページを開くと、月報が表示される', async ({ page }) => {
    await page.goto('/monthly-reports');

    await expect(
      page.getByRole('heading', { name: '月報一覧' }),
    ).toBeVisible();
    await expect(page.getByText('2026年02月')).toBeVisible();
    await expect(page.getByText('2026年03月')).toBeVisible();
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

test.describe('月報詳細', () => {
  test('一覧から月報をクリックすると、詳細が表示される', async ({ page }) => {
    await page.goto('/monthly-reports');
    await page
      .getByRole('link', { name: /新機能の開発を進めた月だった/ })
      .click();

    await expect(page).toHaveURL(/\/monthly-reports\/[\w-]+/);
    await expect(
      page.getByRole('heading', { name: '2026年02月' }),
    ).toBeVisible();
    await expect(
      page.getByText('新機能の開発を進めた月だった'),
    ).toBeVisible();
  });

  test('振り返りがある月報では、振り返りセクションが表示される', async ({
    page,
  }) => {
    await page.goto('/monthly-reports');
    await page
      .getByRole('link', { name: /新機能の開発を進めた月だった/ })
      .click();

    await expect(
      page.getByRole('heading', { name: '振り返り' }),
    ).toBeVisible();
    await expect(
      page.getByText('機能Aの実装とテストが完了した'),
    ).toBeVisible();
    await expect(
      page.getByText('テストの書き方に慣れてきた'),
    ).toBeVisible();
    await expect(
      page.getByText('休憩を忘れて集中しすぎる傾向がある'),
    ).toBeVisible();
    await expect(
      page.getByText('レビューを早めに出すことで手戻りを減らせる'),
    ).toBeVisible();
  });

  test('目標のみの月報では、振り返りセクションが表示されない', async ({
    page,
  }) => {
    await page.goto('/monthly-reports');
    await page.getByRole('link', { name: /2026年03月/ }).click();

    await expect(
      page.getByRole('heading', { name: '2026年03月' }),
    ).toBeVisible();
    await expect(
      page.getByText('テストカバレッジを80%にする'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '振り返り' }),
    ).not.toBeVisible();
  });

  test('月報に紐づく日報が一覧表示される', async ({ page }) => {
    await page.goto('/monthly-reports');
    await page
      .getByRole('link', { name: /新機能の開発を進めた月だった/ })
      .click();

    await expect(
      page.getByRole('heading', { name: '日報' }),
    ).toBeVisible();
    await expect(
      page.getByText('機能Aの主要部分を実装し、集中して作業できた'),
    ).toBeVisible();
  });

  test('日報カードをクリックすると、日報詳細に遷移する', async ({ page }) => {
    await page.goto('/monthly-reports');
    await page
      .getByRole('link', { name: /新機能の開発を進めた月だった/ })
      .click();
    await page
      .getByRole('link', {
        name: /機能Aの主要部分を実装し、集中して作業できた/,
      })
      .click();

    await expect(page).toHaveURL(/\/daily-reports\/[\w-]+/);
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
    await page.getByRole('option', { name: '2026年04月' }).click();
    await page.getByLabel('目標').fill('リファクタリングを完了する');
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page).toHaveURL('/monthly-reports');
    await expect(page.getByText('2026年04月')).toBeVisible();
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
    await page.getByRole('option', { name: '2026年02月' }).click();
    await page.getByRole('button', { name: '作成' }).click();

    await expect(page.getByText(/の月報はすでに存在します/)).toBeVisible();
    await expect(page).toHaveURL('/monthly-reports/new');
  });
});
