#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${1:-}"

if [[ -z "$PROJECT_NAME" ]]; then
  echo "Usage: ./scripts/setup.sh <project-name>" >&2
  exit 1
fi

if [[ ! "$PROJECT_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "Error: プロジェクト名は小文字英字で始まり、小文字英字・数字・ハイフンのみ使用できます" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# NOTE: PostgreSQL のDB名にハイフンは使えないため、アンダースコアに変換する
DB_NAME="${PROJECT_NAME//-/_}"

replace_in_file() {
  local pattern="$1"
  local file="$2"
  local tmp="${file}.tmp"
  sed "$pattern" "$file" > "$tmp" && mv "$tmp" "$file"
}

echo "Setting up project: $PROJECT_NAME"

replace_in_file "s|\"name\": \"nextjs-template2\"|\"name\": \"$PROJECT_NAME\"|" "$ROOT_DIR/package.json"
echo "  package.json ... done"

replace_in_file "s|^# nextjs-template2|# $PROJECT_NAME|" "$ROOT_DIR/.claude/CLAUDE.md"
echo "  CLAUDE.md ... done"

for env_file in "$ROOT_DIR/apps/web/.env.example" "$ROOT_DIR/apps/web/.env"; do
  if [[ -f "$env_file" ]]; then
    replace_in_file "s|POSTGRES_DB=app|POSTGRES_DB=$DB_NAME|" "$env_file"
    replace_in_file "s|localhost:5432/app|localhost:5432/$DB_NAME|" "$env_file"
    echo "  $(basename "$env_file") ... done"
  fi
done

echo "Installing dependencies..."
(cd "$ROOT_DIR" && pnpm install)

echo ""
echo "Setup complete! Next steps:"
echo "  1. make db"
echo "  2. pnpm --filter web db:migrate"
echo "  3. make dev"
