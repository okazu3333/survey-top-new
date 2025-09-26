import { BigQuery } from "@google-cloud/bigquery";

const globalForBigQuery = global as unknown as { bigquery?: BigQuery };

function getBigQuery(): BigQuery {
  if (!globalForBigQuery.bigquery) {
    const projectId = process.env.BQ_PROJECT_ID || "viewpers";
    const location = process.env.BQ_LOCATION || "US";

    globalForBigQuery.bigquery = new BigQuery({
      projectId,
      location,
    });
  }
  return globalForBigQuery.bigquery;
}

export async function runQuery<T = any>(
  sql: string,
  location?: string
): Promise<T[]> {
  const bigquery = getBigQuery();
  
  const options = {
    query: sql,
    location: location || process.env.BQ_LOCATION || "US",
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows as T[];
  } catch (error) {
    console.error("BigQuery error:", error);
    throw error;
  }
}
