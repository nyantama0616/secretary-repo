# インフラ構成

## 概要

Proxmox VE 上の LXC コンテナにデプロイする。IaC は Terraform で管理する（`infra/`）。

## ネットワーク

- LXC へのアクセスは Proxmox ホストをジャンプサーバとして経由する
- 同一ブリッジ（vmbr0）上の LXC 同士は IP で直接通信できる

## LXC 構成

### secretary（VM ID: 150）

secretary アプリの全プロセスを1コンテナに同居させる。

| プロセス | ポート | バインド先 | 備考 |
|---|---|---|---|
| web（Next.js） | 3000 | localhost | 外部アクセス不要 |
| db（PostgreSQL） | 5432 | localhost | 外部アクセス不要 |
| mcp | 3001 | 0.0.0.0 | OpenClaw からアクセスされる |

MCP のみ外部に公開し、web と db は localhost に閉じる。

### 外部からの接続

OpenClaw（別 LXC）が `http://<secretary-ip>:3001` で MCP サーバーにアクセスする。

## 手動セットアップ手順

LXC の新規作成時に、自動化の前に手動で行う必要がある作業。

### 1. Proxmox に OS テンプレートをダウンロードする

Proxmox GUI で **local → CT Templates → Templates** から `ubuntu-24.04-standard` をダウンロードする。

### 2. LXC に root の SSH 公開鍵を配置する

Terraform で LXC を作成した後、Proxmox ホスト上で以下を実行する。

```bash
pct enter 150
mkdir -p /root/.ssh && chmod 700 /root/.ssh
echo "<公開鍵>" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
exit
```

### 3. SSH ホストキーを受け入れる

ローカルマシンから初回 SSH 接続し、ホストキーを known_hosts に追加する。

```bash
ssh -o ProxyJump=proxmox root@100.64.1.150
```

### 4. Ansible を実行する

```bash
cd infra && make phase1
```
