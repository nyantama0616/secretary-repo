import * as v from 'valibot';

// NOTE: Next.js は .env を自動ロードするが、Vitest や Playwright から直接インポートされる場合は
// 自動ロードされないため、.env が存在すればロードする。既にロード済みの環境変数は上書きされない
try {
  process.loadEnvFile('.env');
} catch {
  // NOTE: .env が存在しない環境（CI など）ではスキップする
}

const envSchema = v.object({
  LOG_LEVEL: v.optional(
    v.picklist(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']),
    'info',
  ),
  NODE_ENV: v.optional(
    v.picklist(['development', 'production', 'test']),
    'development',
  ),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  // NOTE: テスト実行時（NODE_ENV=test）に必須となる
  DATABASE_URL_TEST:
    process.env.NODE_ENV === 'test'
      ? v.pipe(v.string(), v.url())
      : v.optional(v.pipe(v.string(), v.url())),
  CI: v.optional(v.string()),
  NEXT_DIST_DIR: v.optional(v.string(), '.next'),
});

const env = v.parse(envSchema, {
  LOG_LEVEL: process.env.LOG_LEVEL,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
  CI: process.env.CI,
  NEXT_DIST_DIR: process.env.NEXT_DIST_DIR,
});

export const LOG_LEVEL = env.LOG_LEVEL;
export const NODE_ENV = env.NODE_ENV;
// NOTE: テスト時はテスト用 DB に接続する
export const DATABASE_URL =
  env.NODE_ENV === 'test' ? env.DATABASE_URL_TEST! : env.DATABASE_URL;
export const DATABASE_URL_TEST = env.DATABASE_URL_TEST;
export const IS_CI = env.CI !== undefined;
export const NEXT_DIST_DIR = env.NEXT_DIST_DIR;
