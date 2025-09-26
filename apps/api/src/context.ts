import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
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

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  return {
    req,
    res,
    db: getBigQuery(),
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
