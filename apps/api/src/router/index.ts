import { router } from "../trpc";
import { debugRouter } from "./debug";
// Temporarily disabled until BigQuery migration is complete
// import { questionRouter } from "./question";
// import { reviewRouter } from "./review";
// import { reviewAccessRouter } from "./reviewAccess";
// import { sectionRouter } from "./section";
// import { surveyRouter } from "./survey";
// import { threadRouter } from "./thread";

export const appRouter = router({
  // Temporarily disabled until BigQuery migration is complete
  // survey: surveyRouter,
  // section: sectionRouter,
  // question: questionRouter,
  // thread: threadRouter,
  // review: reviewRouter,
  // reviewAccess: reviewAccessRouter,
  debug: debugRouter,
});

export type AppRouter = typeof appRouter;
