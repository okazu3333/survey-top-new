# API仕様書

## 概要

Survey Top NewのAPIは、tRPCを使用した型安全なAPIとして設計されています。

## ベースURL

- **開発環境**: `http://localhost:3002/api/trpc`
- **本番環境**: `https://survey-new-top-[hash]-uc.a.run.app/api/trpc`

## 認証

すべてのAPIエンドポイントはBasic認証が必要です。

```
Authorization: Basic <base64(username:password)>
```

## tRPC Routers

### Survey Router (`survey`)

アンケートの管理を行います。

#### `survey.create`
新しいアンケートを作成します。

**Input:**
```typescript
{
  title?: string;
  purpose?: string;
  targetCondition?: string;
  analysisCondition?: string;
  researchMethod?: string;
  researchScale?: string;
}
```

**Output:**
```typescript
{
  id: number;
  title: string | null;
  purpose: string | null;
  // ... その他のフィールド
  createdAt: Date;
  updatedAt: Date;
}
```

#### `survey.getAll`
すべてのアンケートを取得します。

**Output:**
```typescript
Array<{
  id: number;
  title: string | null;
  // ... その他のフィールド
}>
```

#### `survey.getById`
指定されたIDのアンケートを取得します。

**Input:**
```typescript
{
  id: number;
}
```

### Section Router (`section`)

セクション（質問グループ）の管理を行います。

#### `section.create`
新しいセクションを作成します。

**Input:**
```typescript
{
  surveyId: number;
  phase: "SCREENING" | "MAIN";
  order: number;
  title: string;
}
```

#### `section.getBySurveyId`
指定されたアンケートIDのセクションを取得します。

**Input:**
```typescript
{
  surveyId: number;
}
```

### Question Router (`question`)

質問の管理を行います。

#### `question.create`
新しい質問を作成します。

**Input:**
```typescript
{
  sectionId: number;
  code: string;
  type: "SA" | "MA" | "NU" | "FA";
  title: string;
  description?: string;
  isRequired?: boolean;
  order: number;
  config?: string; // JSON文字列
  // ... その他の設定フィールド
}
```

#### `question.getBySectionId`
指定されたセクションIDの質問を取得します。

**Input:**
```typescript
{
  sectionId: number;
}
```

### Thread Router (`thread`)

レビュースレッドの管理を行います。

#### `thread.create`
新しいレビュースレッドを作成します。

**Input:**
```typescript
{
  questionId: number;
  x: number;
  y: number;
  createdBy: string;
  message: string;
  type: string;
}
```

#### `thread.getByQuestionId`
指定された質問IDのスレッドを取得します。

**Input:**
```typescript
{
  questionId: number;
}
```

### Review Router (`review`)

レビューコメントの管理を行います。

#### `review.create`
新しいレビューコメントを作成します。

**Input:**
```typescript
{
  threadId: number;
  message: string;
  createdBy: string;
}
```

### Debug Router (`debug`)

デバッグ用のエンドポイントです。

#### `debug.getInfo`
システム情報を取得します。

## エラーハンドリング

tRPCは以下のエラーコードを使用します：

- `BAD_REQUEST`: 不正なリクエスト
- `UNAUTHORIZED`: 認証エラー
- `FORBIDDEN`: 権限エラー
- `NOT_FOUND`: リソースが見つからない
- `INTERNAL_SERVER_ERROR`: サーバーエラー

## BigQuery専用エンドポイント

### TestSpec API

BigQueryからTestSpecデータを取得する専用エンドポイントです。

**Endpoint:** `GET /api/testspec`

**Query Parameters:**
- `limit`: 取得件数制限（デフォルト: 100）

**Response:**
```typescript
{
  data: Array<{
    // TestSpecのフィールド
  }>;
  total: number;
}
```

## 使用例

### tRPCクライアント（React）

```typescript
import { trpc } from '@/lib/trpc/react';

function SurveyList() {
  const { data: surveys } = trpc.survey.getAll.useQuery();
  
  return (
    <div>
      {surveys?.map(survey => (
        <div key={survey.id}>{survey.title}</div>
      ))}
    </div>
  );
}
```

### 直接HTTP呼び出し

```bash
# アンケート一覧取得
curl -X POST \
  -H "Authorization: Basic <credentials>" \
  -H "Content-Type: application/json" \
  -d '{"0":{"json":null}}' \
  http://localhost:3002/api/trpc/survey.getAll
```
