import { router } from "../trpc";
import { debugRouter } from "./debug";
import { surveyRouter } from "./survey";
import { sectionRouter } from "./section";
import { questionRouter } from "./question";
// Temporarily disabled until BigQuery migration is complete
// import { reviewRouter } from "./review";
// import { reviewAccessRouter } from "./reviewAccess";
// import { threadRouter } from "./thread";

export const appRouter = router({
  survey: surveyRouter,
  section: sectionRouter,
  question: questionRouter,
  // Temporarily disabled until BigQuery migration is complete
  // thread: threadRouter,
  // review: reviewRouter,
  // reviewAccess: reviewAccessRouter,
  debug: debugRouter,
});

export type AppRouter = typeof appRouter;
