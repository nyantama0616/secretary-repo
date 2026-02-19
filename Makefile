.PHONY: dev down db db-down

# DB + 開発サーバーを起動する（Ctrl+C で両方停止する）
dev:
	docker compose up -d
	trap 'docker compose down' EXIT && pnpm dev

# DB を停止する
down:
	docker compose down

# DB のみ起動する
db:
	docker compose up -d

# DB を停止し、データも削除する
db-down:
	docker compose down -v
