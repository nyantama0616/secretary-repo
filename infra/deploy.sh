#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/secretary/secretary-repo"
WEB_DIR="${APP_DIR}/apps/web"

cd "$APP_DIR"

echo "=== git pull ==="
git pull origin main

echo "=== pnpm install ==="
pnpm install --frozen-lockfile

echo "=== db:migrate ==="
pnpm --filter web db:migrate

# NOTE: 稼働中の .next を壊さないよう、別ディレクトリにビルドしてから差し替える
echo "=== build ==="
rm -rf "${WEB_DIR}/.next.build"
NEXT_DIST_DIR=.next.build NODE_ENV=production pnpm build

echo "=== .next を差し替える ==="
rm -rf "${WEB_DIR}/.next"
mv "${WEB_DIR}/.next.build" "${WEB_DIR}/.next"

echo "=== pm2 restart ==="
pm2 restart all

echo "=== デプロイ完了 ==="
