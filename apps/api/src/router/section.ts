import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const sectionRouter = router({
  list: publicProcedure
    .input(z.object({ surveyId: z.number() }))
    .query(async ({ input, ctx }) => {
      // BigQuery implementation
      const [rows] = await ctx.db.query({
        query: `
          SELECT id, surveyId, title, phase, \`order\`, createdAt, updatedAt
          FROM \`viewpers.surveybridge_db.Section\`
          WHERE surveyId = ${input.surveyId}
          ORDER BY phase ASC, \`order\` ASC
        `,
        location: process.env.BQ_LOCATION || "US",
      });
      
      // Ensure proper data types for BigQuery results
      const processedRows = rows.map((row: any) => ({
        ...row,
        id: Number(row.id),
        surveyId: Number(row.surveyId),
        order: Number(row.order),
        title: String(row.title),
        phase: String(row.phase),
      }));
      
      console.log("Section.list processed rows:", processedRows);
      return processedRows;
    }),

  // sync: Disabled - Read-only mode, only reference existing BigQuery data
  // sync: publicProcedure...
});