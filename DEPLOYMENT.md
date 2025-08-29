# Cloud Run Deployment Guide

## 前提条件

1. Google Cloud SDKがインストールされていること
2. Dockerがインストールされていること
3. GCPプロジェクトが作成されていること

## セットアップ手順

### 1. Google Cloud SDKの認証

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. 必要なAPIの有効化

```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Docker認証の設定

```bash
gcloud auth configure-docker
```

### 4. デプロイスクリプトの設定

`deploy-cloudrun.sh`ファイルの`PROJECT_ID`を実際のGCPプロジェクトIDに変更してください：

```bash
PROJECT_ID="your-actual-project-id"  # ここを変更
```

### 5. デプロイの実行

```bash
./deploy-cloudrun.sh
```

## 認証情報

デプロイ後のアプリケーションには以下の認証情報でアクセスできます：

- **ユーザー名**: `cmgadmin`
- **パスワード**: `crossadmin`

## 設定内容

- **リージョン**: asia-northeast1 (東京)
- **メモリ**: 2GB
- **CPU**: 2コア
- **最大インスタンス数**: 10
- **ポート**: 3000

## トラブルシューティング

### ビルドエラーが発生した場合

```bash
# Dockerイメージを手動でビルド
docker build -t survey-poc .

# ローカルでテスト
docker run -p 3000:3000 survey-poc
```

### デプロイ後にアクセスできない場合

1. Cloud Runサービスの状態を確認：
```bash
gcloud run services list
```

2. ログを確認：
```bash
gcloud run services logs read survey-poc --region=asia-northeast1
```

### 環境変数の確認・更新

```bash
gcloud run services update survey-poc \
  --region=asia-northeast1 \
  --set-env-vars BASIC_AUTH_USER=cmgadmin \
  --set-env-vars BASIC_AUTH_PASSWORD=crossadmin
```

## 削除方法

サービスを削除する場合：

```bash
gcloud run services delete survey-poc --region=asia-northeast1
``` 