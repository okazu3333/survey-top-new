# Survey Top New - ドキュメント

## 📚 ドキュメント一覧

### 🏗️ アーキテクチャ
- [システム概要](./architecture/OVERVIEW.md) - 技術スタック、システム構成、設計思想

### 🔧 開発
- [開発環境セットアップ](./development/SETUP.md) - 初回セットアップから開発フローまで
- [ローカル開発ガイド](./development/LOCAL_DEVELOPMENT.md) - 詳細な開発手順

### 🚀 デプロイメント
- [デプロイメントガイド](./deployment/DEPLOYMENT.md) - Cloud Runへのデプロイ手順

### 📡 API
- [API仕様書](./api/README.md) - tRPC APIの詳細仕様
- [TestSpec API](./api/testspec-API.md) - BigQuery専用API仕様
- [サンプルデータ](./api/testspec-P1-normal.json) - APIレスポンス例

## 🚀 クイックスタート

### 開発環境の起動

```bash
# 1. 依存関係のインストール
bun install

# 2. 開発サーバー起動
bun dev
```

### 主要URL

- **フロントエンド**: http://localhost:3002
- **Storybook**: http://localhost:6006 (別途起動が必要)

## 📋 プロジェクト構成

```
survey-top-new/
├── apps/
│   ├── web/           # Next.jsフロントエンド
│   └── api/           # tRPC APIサーバー
├── docs/              # このドキュメント群
├── scripts/           # ビルド・デプロイスクリプト
└── 設定ファイル群
```

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15.3.4 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **バックエンド**: tRPC + Express.js
- **データベース**: Google BigQuery
- **デプロイ**: Google Cloud Run
- **開発ツール**: Bun + Biome + Husky

## 📝 開発ルール

### コミット規約

```bash
feat: 新機能
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

### コード品質

- **Biome**: リント・フォーマット
- **TypeScript**: 型安全性
- **Husky**: pre-commitフック

## 🔗 関連リンク

- [GitHub Repository](https://github.com/okazu3333/survey-top-new)
- [Cloud Run Console](https://console.cloud.google.com/run/detail/asia-northeast1/survey-new-top)
- [BigQuery Console](https://console.cloud.google.com/bigquery?project=viewpers)

## 📞 サポート

質問や問題がある場合は、以下の方法でサポートを受けられます：

1. **GitHub Issues**: バグ報告や機能要望
2. **ドキュメント**: このドキュメント群を参照
3. **コードレビュー**: プルリクエストでのフィードバック

## 🔄 更新履歴

- **2025-01**: BigQuery移行、Prisma削除
- **2024-12**: 初期リリース
