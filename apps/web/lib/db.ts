import { BigQuery } from "@google-cloud/bigquery";

function createBigQueryClient(): BigQuery {
  const projectId = process.env.BQ_PROJECT_ID || "viewpers";
  const location = process.env.BQ_LOCATION || "US";

  return new BigQuery({
    projectId,
    location,
    // 認証は環境変数 GOOGLE_APPLICATION_CREDENTIALS または
    // Cloud Run環境のサービスアカウントを使用
  });
}

const globalForBigQuery = global as unknown as { bigquery?: BigQuery };

export function getBigQuery(): BigQuery {
  if (!globalForBigQuery.bigquery) {
    globalForBigQuery.bigquery = createBigQueryClient();
  }
  return globalForBigQuery.bigquery;
}

export const db = getBigQuery();
