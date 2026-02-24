# インフラ構成

## 概要

Proxmox VE 上の LXC コンテナにデプロイする。構成管理は Terraform（LXC の作成）と Ansible（LXC 内のプロビジョニング）で行う。ファイルは `infra/` に配置する。

## ネットワーク

- LXC へのアクセスは Proxmox ホストをジャンプサーバ（ProxyJump）として経由する
- 同一ブリッジ（vmbr0）上の LXC 同士は IP で直接通信できる

## LXC 構成

### secretary（VM ID: 150）

secretary アプリの全プロセスを1コンテナに同居させる。

| リソース | 値 |
|---|---|
| OS | Ubuntu 24.04 |
| CPU | 2 コア |
| メモリ | 4 GB |
| ディスク | 20 GB（local-lvm） |
| IP | 100.64.1.150/24 |
| ゲートウェイ | 100.64.1.1 |
| DNS | 1.1.1.1, 8.8.8.8 |
| ネットワーク | vmbr0（eth0） |
| 特権 | unprivileged（nesting 有効） |

### プロセス

pm2 で管理する。

| プロセス | pm2 名 | ポート | バインド先 | 備考 |
|---|---|---|---|---|
| web（Next.js） | secretary-web | 3000 | localhost | 外部アクセス不要 |
| db（PostgreSQL 17） | - | 5432 | localhost | systemd で管理する |
| mcp | secretary-mcp | 3001 | 0.0.0.0 | OpenClaw からアクセスされる |

MCP のみ外部に公開し、web と db は localhost に閉じる。

### 外部からの接続

- OpenClaw（別 LXC）が `http://<secretary-ip>:3001/mcp` で MCP サーバーにアクセスする
- web への外部アクセスは Proxmox ホスト上のリバースプロキシ（Caddy）経由で行う。リバースプロキシの設定はこのリポジトリの責務外であり、Proxmox ホストの設定を管理する別リポジトリで管理する

### バックアップ

- `pg_dump` による論理バックアップを毎日 3:00 に cron で実行する
- バックアップ先: `/home/secretary/backups/`
- 保持期間: 7 日（古いファイルは自動削除される）

## Terraform

Proxmox プロバイダ（`bpg/proxmox ~> 0.96`）を使用して LXC コンテナを作成する。

### 必要な変数（`terraform.tfvars`）

| 変数 | 説明 | 例 |
|---|---|---|
| `proxmox_endpoint` | Proxmox API の URL | `https://proxmox.example.com:8006` |
| `proxmox_api_token` | API トークン（sensitive） | `root@pam!terraform=xxxx...` |
| `node_name` | Proxmox ノード名（デフォルト: `proxmox`） | `pve` |

## Ansible

LXC 内のプロビジョニングを7つのフェーズに分けて実行する。`make` コマンドで各フェーズを呼び出す。

### 環境変数（`.env`）

Phase 3, 4 で必要になる。

| 変数 | 説明 |
|---|---|
| `DB_PASSWORD` | PostgreSQL のパスワード（英数字のみ） |
| `REPO_URL` | GitHub リポジトリの SSH URL |
| `API_KEY` | アプリの API キー（英数字のみ） |

`DB_PASSWORD` と `API_KEY` に記号を含めてはならない。Makefile でシェルの `. ./.env` により読み込んでおり、`#` や `$` などがシェルに解釈されて値が壊れるためである。

### フェーズ一覧

| コマンド | フェーズ | 内容 |
|---|---|---|
| `make phase1` | LXC の初期設定 | パッケージ更新、アプリ用ユーザー（`secretary`）作成、SSH 公開鍵配置 |
| `make phase2` | ランタイムのインストール | Node.js 24、pnpm（corepack）、PostgreSQL 17 |
| `make phase3` | PostgreSQL の設定 | DB ユーザーとデータベースの作成 |
| `make phase4` | アプリのデプロイ | Deploy Key 生成、リポジトリクローン、依存インストール、`.env` 配置、マイグレーション、ビルド |
| `make phase5` | プロセス管理 | pm2 のインストール、`ecosystem.config.js` 配置、自動起動設定 |
| `make phase6` | DB バックアップの設定 | バックアップスクリプト配置、cron ジョブ登録 |
| `make phase7` | 動作確認 | PostgreSQL・pm2・web・mcp・バックアップの稼働を検証する |

## 手動セットアップ手順

LXC の新規作成時に、自動化の前に手動で行う必要がある作業。

### 1. Proxmox に OS テンプレートをダウンロードする

Proxmox GUI で **local → CT Templates → Templates** から `ubuntu-24.04-standard` をダウンロードする。

### 2. Terraform で LXC を作成する

```bash
cd infra && make init && make plan && make apply
```

### 3. LXC に root の SSH 公開鍵を配置する

Proxmox ホスト上で以下を実行する。

```bash
pct enter 150
mkdir -p /root/.ssh && chmod 700 /root/.ssh
echo "<公開鍵>" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
exit
```

### 4. SSH ホストキーを受け入れる

ローカルマシンから初回 SSH 接続し、ホストキーを known_hosts に追加する。

```bash
ssh -o ProxyJump=proxmox root@100.64.1.150
```

### 5. Ansible を実行する

```bash
cd infra && make phase1
```

Phase 4 では Deploy Key の公開鍵が表示されるので、GitHub リポジトリの Settings → Deploy keys に登録する。
