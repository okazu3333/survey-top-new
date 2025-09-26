# TestSpec API Reference

本ドキュメントはテストユニット実装者向けに、テスト用設問スペック(TestSpec)のAPI・スキーマをまとめたものです。商用スキーマ互換を意識しつつ、検証に必要な最小情報を提供します。

> 現状の対象: P1 正常系のみ（`specId = P1:normal`）

## Base
- Dataset (BigQuery): `viewpers.surveybridge_db`

## Endpoints

### GET `/api/testspec`
テスト用の設問スペック(TestSpec)を取得します。

- Query Parameters（P1 正常系のみ）
  - `specId` (string): 固定で `P1:normal` を推奨
  - 省略時は `pattern=P1&caseType=normal&active=true` と同等

- Response (200)
```json
{
  "items": [TestSpec]
}
```

- 例
```bash
curl -s "http://localhost:3000/api/testspec?specId=P1:normal" | jq
```

- 表示正規化
  - 年齢帯表記は取得時に `20-29 / 30-39 / 40-49 / 50-59 / 60-69` へ正規化して返却されます。

## Schemas

### TestSpec (response item)
```ts
interface TestSpec {
  specId: string;            // 例: "P1:normal"
  pattern: "P1";           // 現状はP1のみ
  caseType: "normal";      // 現状はnormalのみ
  title: string;
  tags?: string[];
  surveySpec: SurveySpec;    // 設問構成
  expectations: Expectations; // 検証ルール/基本条件
  isActive: boolean;
  createdAt?: string;        // ISO-ish
  updatedAt?: string;
}

interface SurveySpec {
  surveyTitle: string;
  sections: Array<{
    title: string;           // 例: スクリーニング / 本調査
    questions: Question[];
  }>;
}

// 質問
interface Question {
  code: string;              // 例: SC1, Q1
  type: "SA"|"MA"|"FA"|"NUM"|"SCALE";
  title: string;
  isRequired?: boolean;      // 必須の目安。expectations.requiredCoverage と整合
  options?: Option[];        // SA/MA/SCALE等は原則あり。FA/NUMは空配列
}

// 選択肢（その他を含む統一構造）
interface Option {
  code: number;              // INT64相当
  label: string;
  isOther?: boolean;         // その他
  otherPlaceholder?: string | null; // その他自由記述のプレースホルダ
}
```

### Expectations (検証ポリシー)
```ts
interface Expectations {
  maxQuestions: number;
  requiredCoverage: string[];     // 最低限含まれるべき設問コード
  invalidCombos: string[];        // 明示的なNGパターン（任意）
  rules: Rules;                   // 自動検証ロジック
  basic: {
    title: string;                // 調査タイトル
    purpose: string;              // 調査目的
    targetConditions: string[];   // 対象者条件（自然文）
    analysisTargets: string[];    // 分析対象
    screeningQuestionCount: number; // SC設問数
    mainQuestionCount: number;      // 本調査設問数
  };
}

interface Rules {
  // 値域検証
  numericRanges?: Record<string, [number, number]>; // NUM: [min, max]
  scaleRanges?:   Record<string, [number, number]>; // SCALE: [min, max]

  // MAの選択数制約
  maxChoices?:    Record<string, number>;
  minChoices?:    Record<string, number>;

  // 対象者の制約（例: 年齢コード）
  allowedAgeCodes?: { SC2: number[] };            // SC2(年齢帯)の許可コード

  // ゲーティング（必須で満たすべきSC条件）
  gatingMustPass?: string[];                      // 例: ["SC4==1","SC5==1","SC6==2","SC2 in [1]"]

  // 出題条件（Qごと）
  visibilityConditions?: Record<string, string>;  // 例: { "Q1": "SC4==1 && SC5==1 && SC6==2 && SC2 in [1]" }
  disallowAnswersWhenHidden?: boolean;            // 非表示設問への回答をエラー扱い

  // その他自由記述
  otherTextRequired?: Record<string, boolean>;    // 例: { Q14: true, Q16: true }

  // 排他やUI運用
  mutualExclusions?: Record<string, string[][]>;  // 例: { Q14: [["4","3"],["4","2"]] }
  randomizeOptions?: Record<string, boolean>;     // 例: { Q2: true, Q7: true }
  maxConsecutiveFA?: number;                      // 連続FAの上限
}
```

## Validation Guidelines（テストユニット実装指針）

1) 対象者判定
- `allowedAgeCodes.SC2` と `gatingMustPass` を両方満たすこと（例: `SC2 in [1]` かつ `SC4==1 && SC5==1 && SC6==2`）
- 条件を満たさない場合は `screened out` とし、本調査へ進ませない

2) 分岐/可視性
- 各Qの `visibilityConditions` を評価し、非表示時は回答不可（`disallowAnswersWhenHidden`）

3) 必須/網羅
- `requiredCoverage` の設問は全て出題され、`isRequired` のものは未回答不可

4) 型・範囲・選択数
- `numericRanges` / `scaleRanges` に従って範囲チェック
- MAは `minChoices` ≤ 選択数 ≤ `maxChoices`

5) その他自由記述
- `otherTextRequired` 対象で「その他」選択時は自由記述必須（長さは各実装側ポリシーで）

6) 表示/UX
- `randomizeOptions` が true の設問はランダム化（テストでは固定シード可）
- `maxConsecutiveFA` を超えるFA連続はWarning

## サンプル（P1 normal）
- JSONスナップショット: `docs/testspec-P1-normal.json`
- 取得例: `GET /api/testspec?specId=P1:normal`

## BigQuery 連携（情報源）
- 参照テーブル: `TestSpec(specId, pattern, caseType, title, tags, surveySpec JSON, expectations JSON, isActive, createdAt, updatedAt)`
- 実行結果保存（任意）: `TestRun(runId, specId, startedAt, finishedAt, status, result JSON, notes)`
- 取得例（BQコンソール）
```sql
SELECT * FROM `viewpers.surveybridge_db.TestSpec`
WHERE specId = 'P1:normal';
```

## 変更方針 / 互換性
- 非破壊追加（新規フィールド・新規設問コード）は互換維持
- 破壊的変更（コード名/型変更）は `specId` を新規にして並存（例: `P1:normal:v2`）

## よくある落とし穴
- JSONのコメント禁止 → 説明は本ファイルやAPIドキュメント側で管理
- 非表示設問への回答（UIで防げてもテストで混入しがち）→ `disallowAnswersWhenHidden: true`
- MAの0選択/過選択 → `minChoices`/`maxChoices` で明確化
- 「その他」自由記述の欠落 → `otherTextRequired` を利用

---
本書に無い追加仕様が必要になった場合は、`expectations.rules` にキーを追加し、同時に本ドキュメントを更新してください。 