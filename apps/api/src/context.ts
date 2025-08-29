import { db } from "@survey-poc/database";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  return {
    req,
    res,
    db,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
