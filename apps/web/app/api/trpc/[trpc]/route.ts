import { appRouter } from "@survey-poc/api/src/router";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { db } from "@/lib/db";

const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req as any,
    res: opts.resHeaders as any,
    db: db,
  };
};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
