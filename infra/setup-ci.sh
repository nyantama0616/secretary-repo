#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CI_KEY_PATH="${SCRIPT_DIR}/ci_deploy_key"

echo "=== CI 用 SSH 鍵を生成する ==="
ssh-keygen -t ed25519 -C "ci-deploy-secretary" -f "$CI_KEY_PATH" -N ""

echo ""
echo "=== GitHub Secrets を設定する ==="
gh secret set SSH_PRIVATE_KEY < "$CI_KEY_PATH"
gh secret set TS_OAUTH_CLIENT_ID --body "$TS_OAUTH_CLIENT_ID"
gh secret set TS_OAUTH_SECRET --body "$TS_OAUTH_SECRET"

# NOTE: 秘密鍵は GitHub Secrets に登録済みなので削除する。公開鍵は Ansible で配布するため残す
rm "$CI_KEY_PATH"

echo ""
echo "=== 完了 ==="
echo "公開鍵を ${CI_KEY_PATH}.pub に保存しました。"
echo "infra/make phase1 を実行して Proxmox と LXC に配布してください。"
