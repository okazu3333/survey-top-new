# 開発環境セットアップガイド

## 前提条件

- **Node.js**: 18.x以上
- **Bun**: 1.2.x以上
- **Git**: 最新版

## 初回セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/okazu3333/survey-top-new.git
cd survey-top-new
```

### 2. 依存関係のインストール

```bash
bun install
```

### 3. 環境変数の設定（オプション）

ローカル開発では基本的に環境変数の設定は不要ですが、必要に応じて設定できます：

```bash
# .env.local を作成（apps/web/ ディレクトリ内）
cd apps/web
cp .env.example .env.local  # もしあれば
```

**主要な環境変数:**

```bash
# BigQuery設定（本番環境用）
BQ_PROJECT_ID=viewpers
BQ_DATASET=surveybridge_db
BQ_LOCATION=US

# Basic認証（本番環境用）
BASIC_AUTH_USER=cmgadmin
BASIC_AUTH_PASSWORD=crossadmin

# データベース設定
DB_PROVIDER=bigquery
NEXT_PUBLIC_DB_PROVIDER=bigquery
```

## 開発サーバーの起動

### フロントエンド（Next.js）

```bash
# メインの開発サーバー起動
bun dev

# または直接webアプリを起動
bun run --filter @survey-poc/web dev
```

- **URL**: http://localhost:3000 (または利用可能な次のポート)
- **Turbopack**: 高速ビルドが有効

### APIサーバー（tRPC）

```bash
# APIサーバーを個別に起動する場合
bun run --filter @survey-poc/api dev
```

- **URL**: http://localhost:4000 (通常はNext.js内で動作)

## 開発フロー

### 1. 通常の開発

```bash
# 開発サーバー起動
bun dev

# 別ターミナルでコード品質チェック
bun lint
bun format
bun type-check
```

### 2. 新機能開発

```bash
# 新しいブランチを作成
git checkout -b feature/new-feature

# 開発...

# コミット前のチェック
bun lint
bun type-check

# コミット
git add .
git commit -m "feat: add new feature"
```

### 3. コンポーネント開発

```bash
# Storybookを起動（UIコンポーネント開発用）
npx storybook dev -p 6006
```

## ディレクトリ構造

```
survey-top-new/
├── apps/
│   ├── web/                 # Next.jsフロントエンド
│   │   ├── app/            # App Routerページ
│   │   ├── components/     # 再利用可能コンポーネント
│   │   ├── lib/           # ユーティリティ・設定
│   │   └── hooks/         # カスタムフック
│   └── api/                # tRPC APIサーバー
│       ├── src/
│       │   ├── router/    # tRPCルーター
│       │   └── context.ts # tRPCコンテキスト
├── docs/                   # ドキュメント
├── scripts/               # ビルド・デプロイスクリプト
└── 設定ファイル群
```

## よく使うコマンド

### 開発

```bash
bun dev              # 開発サーバー起動
bun build            # プロダクションビルド
bun start            # プロダクションサーバー起動
```

### コード品質

```bash
bun lint             # Biomeによるリント（自動修正付き）
bun format           # コードフォーマット
bun type-check       # TypeScript型チェック
```

### Storybook

```bash
npx storybook dev -p 6006    # 開発サーバー
npx storybook build          # ビルド
```

## トラブルシューティング

### ポート競合

```bash
# 別のポートで起動
PORT=3001 bun dev
```

### 依存関係の問題

```bash
# node_modulesをクリーンアップ
rm -rf node_modules
bun install
```

### 型エラー

```bash
# TypeScript設定を確認
bun type-check

# 型定義を再生成（必要に応じて）
bun run --filter @survey-poc/web build
```

### Biome設定

```bash
# Biome設定を確認
cat biome.json

# 手動でフォーマット実行
bunx biome format --write .
bunx biome check --write .
```

## Git Hooks

プロジェクトにはHuskyによるpre-commitフックが設定されています：

```bash
# フック設定（初回のみ）
bun prepare

# コミット時に自動実行される内容：
# - Biomeによるリント・フォーマット
# - TypeScript型チェック
```

## IDE設定

### VS Code推奨拡張機能

- Biome
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### VS Code設定例

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```
