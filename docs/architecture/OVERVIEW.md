# アーキテクチャ概要

## システム構成

### 技術スタック

- **フロントエンド**: Next.js 15.3.4 (App Router)
- **バックエンド**: tRPC + Express.js
- **データベース**: Google BigQuery
- **認証**: Basic認証
- **デプロイ**: Google Cloud Run
- **パッケージマネージャー**: Bun
- **UI**: shadcn/ui + Tailwind CSS
- **開発ツール**: Biome (Linting/Formatting)

### プロジェクト構造

```
survey-top-new/
├── apps/
│   ├── web/           # Next.jsフロントエンドアプリケーション
│   └── api/           # tRPC APIサーバー
├── docs/              # ドキュメント
│   ├── api/           # API仕様書
│   ├── architecture/  # アーキテクチャドキュメント
│   ├── deployment/    # デプロイメント関連
│   └── development/   # 開発環境設定
└── scripts/           # ビルド・デプロイスクリプト
```

## データベース設計

### BigQuery構成

- **プロジェクト**: `viewpers`
- **データセット**: `surveybridge_db`
- **ロケーション**: US

### 主要テーブル

1. **Survey** - アンケート基本情報
2. **Section** - セクション（質問グループ）
3. **Question** - 質問
4. **Option** - 選択肢
5. **Thread** - レビュースレッド
6. **Review** - レビューコメント
7. **ReviewAccess** - レビューアクセス管理

## API設計

### tRPC Router構成

```typescript
// メインルーター
├── survey     # アンケート管理
├── section    # セクション管理
├── question   # 質問管理
├── thread     # レビュースレッド
├── review     # レビューコメント
└── debug      # デバッグ用
```

### 認証・認可

- **Basic認証**: 全ルートで有効
- **環境変数**: `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`
- **除外パス**: `/api/auth`, 静的ファイル, favicon

## フロントエンド設計

### Next.js App Router構造

```
app/
├── (auth)/              # 認証が必要なページ群
│   └── surveys/
│       ├── (chat)/      # チャット機能付きアンケート作成
│       └── (review)/    # レビュー機能
├── api/                 # API Routes
├── debug/               # デバッグページ
└── globals.css          # グローバルスタイル
```

### コンポーネント設計

- **app/_components/**: アプリ固有コンポーネント
- **components/**: 再利用可能コンポーネント
- **components/ui/**: shadcn/ui基盤コンポーネント

## 状態管理

- **tRPC + React Query**: サーバー状態管理
- **React Hook Form**: フォーム状態管理
- **Context API**: グローバル状態（チャット等）

## セキュリティ

### 認証
- Basic認証による全体保護
- Cloud Run環境でのサービスアカウント認証

### データ保護
- BigQuery IAM による細かい権限制御
- HTTPS通信の強制

## パフォーマンス

### フロントエンド最適化
- Next.js Turbopack による高速ビルド
- 動的インポートによるコード分割
- 画像最適化（Cloud Run環境では無効化）

### バックエンド最適化
- tRPCによる型安全なAPI通信
- BigQueryの効率的なクエリ設計

## 監視・ログ

### Cloud Run
- Cloud Logging による集約ログ
- Cloud Monitoring によるメトリクス監視

### 開発環境
- Biome による静的解析
- TypeScript による型チェック
