# Cloud Run Deployment Guide

## 🚀 デプロイ方法

### GitHub直接連携（推奨・現在使用中）

**このプロジェクトはCloud RunのGitHub直接連携機能を使用しています。**

GitHubリポジトリに `git push` するだけで、自動的にCloud Runにデプロイされます。

#### 仕組み
- Cloud RunがGitHubリポジトリを直接監視
- `main` ブランチへのプッシュを検出
- 自動的にDockerイメージをビルドしてデプロイ
- サービス名: リポジトリ名から自動生成（例: `survey-top-new`）

#### デプロイ方法
```bash
# 変更をコミット
git add .
git commit -m "your changes"

# mainブランチにプッシュ（自動デプロイが開始されます）
git push origin main
```

#### デプロイ状況の確認
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. Cloud Run > サービス を選択
3. サービス名をクリックしてデプロイ履歴を確認

#### 環境変数の設定
Cloud Runのサービス設定で以下の環境変数が設定されています：
- `NODE_ENV=production`
- `DB_PROVIDER=bigquery`
- `NEXT_PUBLIC_DB_PROVIDER=bigquery`
- `BQ_PROJECT_ID=viewpers`
- `BQ_DATASET=surveybridge_db`
- `BQ_LOCATION=US`
- `READONLY=false`
- `NEXT_PUBLIC_READONLY=false`
- `BASIC_AUTH_USER=cmgadmin`
- `BASIC_AUTH_PASSWORD=crossadmin`

---

## 📝 その他のデプロイ方法（無効化済み）

以下のデプロイ方法は現在無効化されています（ファイル名に `.disabled` が付いています）：

### ~~方法1: GitHub Actions~~
- ファイル: `.github/workflows/deploy.yml` (削除済み)
- 理由: GitHub直接連携と重複するため削除

### ~~方法2: Cloud Build~~
- ファイル: `cloudbuild.yaml.disabled`
- 理由: GitHub直接連携と重複するため無効化

### ~~方法3: 手動デプロイスクリプト~~
- ファイル: `deploy-cloudrun.sh.disabled`, `setup-gcp.sh.disabled`
- 理由: 手動デプロイは不要なため無効化

---

## 🔧 トラブルシューティング

### デプロイが失敗する場合

1. **Cloud Runのログを確認**
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

2. **ビルドログを確認**
Google Cloud Console > Cloud Run > サービス > ログタブ

3. **サービスの再デプロイ**
Cloud Console上で「新しいリビジョンをデプロイ」ボタンをクリック

### 複数のサービスが作成されている場合

**問題**: `survey-top-new`, `survey-new-top`, `survey-poc` など複数のサービスが存在する

**解決策**:
1. 不要なサービスを削除
```bash
# 不要なサービスを削除（例）
gcloud run services delete survey-new-top --region=asia-northeast1
gcloud run services delete survey-poc --region=asia-northeast1
```

2. 使用するサービスのみを残す（推奨: リポジトリ名と同じもの）

### ローカルでDockerイメージをテスト

```bash
# イメージをビルド
docker build -t survey-test .

# ローカルで実行
docker run -p 8080:8080 survey-test
```

---

## 📚 参考リンク

- [Cloud Run - GitHub からの継続的デプロイ](https://cloud.google.com/run/docs/continuous-deployment-with-cloud-build?hl=ja)
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs?hl=ja)
- [Dockerfile ベストプラクティス](https://docs.docker.com/develop/dev-best-practices/)