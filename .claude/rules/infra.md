## インフラ構成

- IaC ツールは Terraform を使う
- Proxmox VE 上に LXC コンテナをデプロイする
- LXC へのアクセスは Proxmox ホストをジャンプサーバとして経由する
- Terraform ファイルは `infra/` に配置する

## Terraform の規約

- `terraform.tfvars` はコミットしない。`.tfvars.example` で構成例を提供する
- 機密値（APIトークン等）は `sensitive = true` を付ける
- リソース名・変数名はスネークケースで書く

## セキュリティ

- `terraform.tfvars`、`*.tfstate`、`.terraform/` は `.gitignore` に含める
